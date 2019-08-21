#!/usr/bin/env node

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { mkdirpSync } from 'fs-extra';
import chalk from 'chalk';
import { dirname, resolve } from 'path';
import meow from 'meow';
import yaml from 'js-yaml';
import swaggerToTS from './toTs';
import { URL } from 'url';
import got = require('got');

const pathIsUrl = (uri: string): boolean => {
  try {
    new URL(uri);
    return true;
  } catch (err) {
    return false;
  }
};

async function main() {
  const cli = meow(
    `
  Usage
    $ swagger-to-ts [input] [options]
  
  Options
    --help            display this
    --output, -o      specify output file
    --prettier, -p    specify prettier config file
  `,
    {
      flags: {
        output: {
          type: 'string',
          alias: 'o',
        },
        prettier: {
          type: 'string',
          alias: 'p',
        },
      },
    }
  );

  let spec = cli.input[0];

  if (typeof spec !== 'string' || !spec.length) {
    console.error(
      chalk.red('❌ You have to pass an input file. Use --help for help.')
    );
    process.exit(1);
  }

  // If input is a file or url, load it
  const pathname = resolve(process.cwd(), spec);
  if (pathIsUrl(spec)) {
    const { body } = await got(spec);
    spec = body;
  } else if (existsSync(pathname)) {
    spec = readFileSync(pathname, 'UTF-8');
  }

  // Attempt to parse YAML
  try {
    if (/\.ya?ml$/i.test(pathname) || spec[0] !== '{') {
      spec = yaml.safeLoad(spec);
    }
  } catch (e) {
    console.error(
      chalk.red(`❌ "${spec}" seems to be YAML, but it couldn’t be parsed.
    ${e}`)
    );
    process.exit(1);
  }

  // Attempt to parse JSON
  try {
    if (typeof spec === 'string') {
      spec = JSON.parse(spec);
    }
  } catch (e) {
    console.error(
      chalk.red(`❌ Could not parse JSON for "${spec}." Is this a valid Swagger spec?
    ${e}`)
    );
    process.exit(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = swaggerToTS(spec as any, cli.flags);

  // Write to file if specifying output
  if (cli.flags.output) {
    const timeStart = process.hrtime();
    const outputFile = resolve(process.cwd(), cli.flags.output);
    const parent = dirname(outputFile);
    mkdirpSync(parent);
    writeFileSync(outputFile, result);

    const timeEnd = process.hrtime(timeStart);
    const time = timeEnd[0] + Math.round(timeEnd[1] / 1e6);
    console.log(
      chalk.green(
        `🚀 ${cli.input[0]} -> ${chalk.bold(cli.flags.output)} [${time}ms]`
      )
    );
  } else {
    console.log(result);
  }
}

main().catch(console.error);
