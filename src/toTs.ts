import * as prettier from 'prettier';
import fs from 'fs';
import path from 'path';
import swagger2, { Swagger2 } from './swagger-2';

export interface Options {
  swagger?: number;
  prettier?: string;
}

export interface ParsedOptions {
  swagger: 2;
  prettierOptions: prettier.Options;
}

function getPrettierConfig(filePath: string): prettier.Options {
  if (filePath.endsWith('.js')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const options = require(path.resolve(process.cwd(), filePath));
    return options;
  }
  const file = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf8');

  return JSON.parse(file);
}

function parseOptions(options: Options = {}): ParsedOptions {
  const swagger = options.swagger || 2;

  if (swagger !== 2) {
    throw new Error(`Swagger version ${swagger} is not supported`);
  }

  const prettierOptions: prettier.Options = options.prettier
    ? getPrettierConfig(options.prettier)
    : {
        singleQuote: true,
        trailingComma: 'es5',
      };

  return {
    swagger,
    prettierOptions: { ...prettierOptions, parser: 'typescript' },
  };
}

export default function(spec: Swagger2, options?: Options): string {
  return swagger2(spec, parseOptions(options));
}
