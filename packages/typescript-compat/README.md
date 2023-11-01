# TypeScript compatibility tests

Our TypeScript compatibility tests are run by the Make target `test-ts-compat`.
Running this target will iterate over all versions specified in this directory, 
and compile the TypeScript files in `packages/protobuf-test/src` with the 
corresponding version of the TypeScript compiler.

Our compatibility tests use the default settings for `tsconfig.json` that are
generated by running `tsc --init` (with a few minor exceptions).  As a result,
for any version we support, we inherently support the default settings
respective to that version of TypeScript.

### Which versions are tested

- the earliest TypeScript version we support (4.1.2).
- the latest patch release of all minor versions up to the current release.

### Adding a new version

To add a new minor or major version of TypeScript to the tests, copy the directory
with the latest version, and make the following updates: 

#### package.json

- Set an appropriate "name" field, for example `"tscompat_5.2.x"`.
- Set the version constraint for the `typescript` dependency, for example `"5.2.x"`.
- Set the version for the `@types/node` dependency. The package uses dist-tags 
  to tag releases for older TypeScript versions. You have to look up the 
  corresponding version number on https://www.npmjs.com/package/@types/node?activeTab=versions.

Delete the `node_modules` directory in the package if it exists, and run `npm install` 
from the repository root. 

#### tsconfig.json

Generate a new `tsconfig.json` with default values with `node_modules/.bin/tsc --init`, 
and merge it with the existing one:
- We want to use the default target, module, and other settings.
- We have to include the test sources.
- We explicitly want to emit declaration and declaration maps, because some 
  transpilation issues only occur when emitting them. 
- We explicitly want to check libs.

### Running and maintaining the tests

Run `node packages/typescript-compat/typescript-compat.mjs` to run all tests.

Unfortunately, `npm` has no mechanism to pin to a dist-tag for `@types/node`, 
but the actual version is a moving target. It is necessary to manually verify
that we still use appropriate versions.