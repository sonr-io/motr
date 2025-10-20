#!/usr/bin/env node
// @ts-check

/**
 * This is a custom plugin for `buf` that generates TS files from the services
 * defined in the proto files, and is referred to by the root `buf.gen.yaml`.
 * Files generated using this plugin contains the `_cosmes` suffix.
 *
 * Do not convert this to a TS file as it runs 4x slower!
 */

import { createEcmaScriptPlugin, runNodeJs } from '@bufbuild/protoplugin';

/**
 * Generate TypeScript files for services
 * @param {import('@bufbuild/protoplugin').Schema} schema
 */
export function generateTs(schema) {
  for (const protoFile of schema.files) {
    const file = schema.generateFile(protoFile.name + '_cosmes.ts');
    file.preamble(protoFile);
    for (const service of protoFile.services) {
      generateService(file, service);
    }
  }
}

/**
 * Generate service methods
 * @param {import('@bufbuild/protoplugin').GeneratedFile} f
 * @param {*} service
 */
function generateService(f, service) {
  // Use f.string() to create a string literal for the type name
  f.print('const TYPE_NAME = ', f.string(service.typeName), ';');
  f.print('');

  for (const method of service.methods) {
    // Use f.jsDoc() to create JSDoc comments from the method descriptor
    f.print(f.jsDoc(method));

    // Create a safe identifier for the service name
    const serviceName = service.name;

    // Generate the service method object
    f.print('export const ', serviceName, method.name, 'Service = {');
    f.print('  typeName: TYPE_NAME,');
    f.print('  method: ', f.string(method.name), ',');
    f.print('  Request: ', f.import(method.input), ',');
    f.print('  Response: ', f.import(method.output), ',');
    f.print('} as const;');
    f.print('');
  }
}

runNodeJs(
  createEcmaScriptPlugin({
    name: 'protoc-gen-cosmes',
    version: 'v0.0.1',
    generateTs,
  })
);
