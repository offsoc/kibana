/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { FtrConfigProviderContext } from '@kbn/test';
import { resolve } from 'path';
import { generateConfig } from './config.base';
import { svlServices } from '../services';

// eslint-disable-next-line import/no-default-export
export default async function (ftrConfigProviderContext: FtrConfigProviderContext) {
  const { readConfigFile } = ftrConfigProviderContext;

  const svlBaseConfig = await readConfigFile(
    require.resolve('@kbn/test-suites-serverless/shared/config.base')
  );

  return generateConfig({
    ftrConfigProviderContext,
    baseConfig: svlBaseConfig,
    testFiles: [resolve(__dirname, '../apps/endpoint')],
    junitReportName: 'X-Pack Endpoint Functional Tests on Serverless',
    kbnServerArgs: ['--serverless=security'],
    target: 'serverless',
    services: svlServices,
  });
}
