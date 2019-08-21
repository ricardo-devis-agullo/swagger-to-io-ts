import * as prettier from 'prettier';
import topsort from './topsort';

export interface Swagger2Definition {
  $ref?: string;
  allOf?: Swagger2Definition[];
  description?: string;
  enum?: string[];
  format?: string;
  items?: Swagger2Definition;
  oneOf?: Swagger2Definition[];
  properties?: { [index: string]: Swagger2Definition };
  additionalProperties?: boolean | Swagger2Definition;
  required?: string[];
  type?: 'array' | 'boolean' | 'integer' | 'number' | 'object' | 'string';
}

export interface Swagger2 {
  definitions: {
    [index: string]: Swagger2Definition;
  };
}

export interface Options {
  prettierOptions: prettier.Options;
}

// Primitives only!
const TYPES: { [index: string]: string } = {
  string: 't.string',
  integer: 't.number',
  number: 't.number',
  boolean: 't.boolean',
};

function capitalize(str: string): string {
  return `${str[0].toUpperCase()}${str.slice(1)}`;
}

function sanitize(name: string): string {
  return name.includes('-') ? `'${name}'` : name;
}

function parse(spec: Swagger2, options: Options): string {
  const queue: [string, Swagger2Definition][] = [];
  const { definitions } = spec;

  function getRef(lookup: string): [string, Swagger2Definition] {
    const ID = lookup.replace('#/definitions/', '');
    const ref = definitions[ID];
    return [ID, ref];
  }

  // Returns primitive type, or 'object' or 'any'
  function getType(definition: Swagger2Definition, nestedName: string): string {
    const { $ref, items, type, ...value } = definition;

    const DEFAULT_TYPE = 't.unknown';

    if ($ref) {
      const [refName, refProperties] = getRef($ref);
      // If a shallow array interface, return that instead
      if (refProperties.items && refProperties.items.$ref) {
        return getType(refProperties, refName);
      }
      if (refProperties.type && TYPES[refProperties.type]) {
        return TYPES[refProperties.type];
      }
      return refName || DEFAULT_TYPE;
    }

    if (items && items.$ref) {
      const [refName] = getRef(items.$ref);
      return `t.array(${getType(items, refName)})`;
    }
    if (items && items.type) {
      if (TYPES[items.type]) {
        return `t.array(${TYPES[items.type]})`;
      }
      queue.push([nestedName, items]);
      return `t.array(${nestedName})`;
    }

    if (Array.isArray(value.oneOf)) {
      return `t.union([${value.oneOf
        .map((def): string => getType(def, ''))
        .join(', ')}])`;
    }

    if (value.properties) {
      // If this is a nested object, let’s add it to the stack for later
      queue.push([nestedName, { $ref, items, type, ...value }]);
      return nestedName;
    }

    if (type) {
      return TYPES[type] || type || DEFAULT_TYPE;
    }

    return DEFAULT_TYPE;
  }

  function buildNextInterface(
    ID: string,
    {
      allOf,
      properties,
      required,
      additionalProperties,
      type,
    }: Swagger2Definition
  ): string {
    let allProperties = properties || {};
    const includes: string[] = [];

    // Include allOf, if specified
    if (Array.isArray(allOf)) {
      allOf.forEach((item): void => {
        // Add “implements“ if this references other items
        if (item.$ref) {
          const [refName] = getRef(item.$ref);
          includes.push(refName);
        } else if (item.properties) {
          allProperties = { ...allProperties, ...item.properties };
        }
      });
    }

    // If nothing’s here, let’s skip this one.
    if (
      !Object.keys(allProperties).length &&
      additionalProperties !== true &&
      type &&
      TYPES[type]
    ) {
      return '';
    }

    // Populate interface
    const transformProperties = (
      props: Record<string, Swagger2Definition>
    ): string => {
      return Object.entries(props)
        .reduce(
          (acc, [key, value]): string[] => {
            const name = sanitize(key);
            const newID = `${ID}${capitalize(key)}`;
            const interfaceType = getType(value, newID);

            if (typeof value.description === 'string') {
              // Print out descriptions as comments, but only if there’s something there (.*)
              // TODO
              /*
              acc.push(
                `// ${value.description
                  .replace(/\n$/, '')
                  .replace(/\n/g, '\n// ')}`
              );
              */
            }

            // Handle enums in the same definition
            if (Array.isArray(value.enum)) {
              acc.push(
                `${name}: t.union([${value.enum
                  .map(option => `t.literal(${JSON.stringify(option)})`)
                  .join(', ')}]),`
              );
              return acc;
            }

            acc.push(`${name}: ${interfaceType},`);

            return acc;
          },
          [] as string[]
        )
        .join('');
    };

    const requiredProperties = Object.fromEntries(
      Object.entries(allProperties).filter(
        ([key]) => Array.isArray(required) && required.includes(key)
      )
    );
    const optionalProperties = Object.fromEntries(
      Object.entries(allProperties).filter(
        ([key]) => !Array.isArray(required) || !required.includes(key)
      )
    );

    const ioDefs: string[] = [];

    if (Object.keys(requiredProperties).length) {
      ioDefs.push(`t.type({${transformProperties(requiredProperties)}})`);
    }

    if (Object.keys(optionalProperties).length) {
      ioDefs.push(`t.partial({${transformProperties(optionalProperties)}})`);
    }

    // Open interface
    if (additionalProperties) {
      if ((additionalProperties as boolean) === true) {
        ioDefs.push('t.UnknownRecord');
      }

      if ((additionalProperties as Swagger2Definition).type) {
        const interfaceType = getType(
          additionalProperties as Swagger2Definition,
          ''
        );
        ioDefs.push(`t.record(t.string, ${interfaceType})`);
      }
    }

    // Inherited properties
    if (includes.length) {
      ioDefs.push(...includes);
    }

    const ioDef =
      ioDefs.length === 1
        ? ioDefs[0]
        : `t.intersection([${ioDefs.join(', ')}])`;

    return `
      export const ${ID} = ${ioDef}
      export type ${ID} = t.TypeOf<typeof ${ID}>;
    `;
  }

  function getPropertyDeps(def: Swagger2Definition): string[] {
    if (def.$ref) {
      const [idRef] = getRef(def.$ref);

      return [idRef];
    }

    if (def.type === 'array' && def.items && def.items.$ref) {
      const [idRef] = getRef(def.items.$ref);

      return [idRef];
    }
    if (def.type === 'object') {
      if (def.properties) {
        return Object.values(def.properties).flatMap(x => getPropertyDeps(x));
      }
      if (def.allOf) {
        return def.allOf.flatMap(x => getPropertyDeps(x));
      }
    }

    return [];
  }

  const topologyEdges = Object.entries(spec.definitions).flatMap(
    ([defName, def]) => {
      return getPropertyDeps(def).map(dep => [dep, defName]);
    }
  );

  // Begin parsing top-level entries
  Object.entries(definitions).forEach((entry): void => {
    // Ignore top-level array definitions
    if (entry[1].type === 'object') {
      queue.push(entry);
    }
  });

  const ioDefinitions: string[] = [];
  const sortedDeps = topsort(topologyEdges);
  queue.sort((a, b) => sortedDeps.indexOf(a[0]) - sortedDeps.indexOf(b[0]));

  while (queue.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [ID, swaggerDef] = queue.pop()!;
    ioDefinitions.push(buildNextInterface(ID, swaggerDef));
  }

  const output = `
  // This file was auto-generated on ${new Date()}
  
  import * as t from 'io-ts'
  
  ${[...ioDefinitions].reverse().join('')}
  `;

  return prettier.format(output, options.prettierOptions);
}

export default parse;
