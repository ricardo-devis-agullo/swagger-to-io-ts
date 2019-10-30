# 📘️ swagger-to-io-ts

Convert Swagger files to [io-ts](https://github.com/gcanti/io-ts) types using Node.js. Based on [swagger-to-ts](https://github.com/manifoldco/swagger-to-ts).

💅 Prettifies output with [Prettier][prettier].

To compare actual generated output, see the [example](./example) folder.

## Usage

### CLI

```bash
npx swagger-to-io-ts schema.yaml --output schema.ts

# 🚀 schema.yaml -> schema.ts [2ms]
```

This will save a `schema.ts` file in the current folder. The CLI can accept YAML or JSON for the input file.

#### Generating multiple schemas

Say you have multiple schemas you need to parse. I’ve found the simplest way
to do that is to use npm scripts. In your `package.json`, you can do
something like the following:

```json
"scripts": {
  "generate:specs": "npm run generate:specs:one && npm run generate:specs:two",
  "generate:specs:one": "npx swagger-to-io-ts one.yaml -o one.d.ts",
  "generate:specs:two": "npx swagger-to-io-ts two.yaml -o two.d.ts"
}
```

Rinse and repeat for more specs.

For anything more complicated, or for generating specs dynamically, you can
also use the Node API (below).

#### CLI Options

| Option                | Alias |           Default            | Description                                                |
| :-------------------- | :---- | :--------------------------: | :--------------------------------------------------------- |
| `--wrapper`           | `-w`  | `declare namespace OpenAPI2` | How should this export the types?                          |
| `--output [location]` | `-o`  |           (stdout)           | Where should the output file be saved?                     |
| `--swagger [version]` | `-s`  |             `2`              | Which Swagger version to use. Currently only supports `2`. |
| `--camelcase`         | `-c`  |           `false`            | Convert `snake_case` properties to `camelCase`?            |

### Node

```bash
npm i --save-dev swagger-to-io-ts
```

```js
const { readFileSync } = require('fs');
const swaggerToIoTS = require('swagger-to-io-ts');

const input = JSON.parse(readFileSync('spec.json', 'utf8')); // Input can be any JS object (OpenAPI format)
const output = swaggerToIoTS(input); // Outputs TypeScript defs as a string (to be parsed, or written to a file)
```

The Node API is a bit more flexible: it will only take a JS object as input
(OpenAPI format), and return a string of TS definitions. This lets you pull
from any source (a Swagger server, local files, etc.), and similarly lets you
parse, post-process, and save the output anywhere.

If your specs are in YAML, you’ll have to convert them to JS objects using a
library such as [js-yaml][js-yaml]. If you’re batching large folders of
specs, [glob][glob] may also come in handy.

#### Node Options

| Name        |   Type    |           Default            | Description                                                |
| :---------- | :-------: | :--------------------------: | :--------------------------------------------------------- |
| `wrapper`   | `string`  | `declare namespace OpenAPI2` | How should this export the types?                          |
| `swagger`   | `number`  |             `2`              | Which Swagger version to use. Currently only supports `2`. |
| `camelcase` | `boolean` |           `false`            | Convert `snake_case` properties to `camelCase`             |

[glob]: https://www.npmjs.com/package/glob
[js-yaml]: https://www.npmjs.com/package/js-yaml
[namespace]: https://www.typescriptlang.org/docs/handbook/namespaces.html
[prettier]: https://npmjs.com/prettier
