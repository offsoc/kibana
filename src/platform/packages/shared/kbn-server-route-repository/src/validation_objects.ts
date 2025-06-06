/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { z } from '@kbn/zod';
import { PassThroughAny } from '@kbn/zod-helpers';

export const passThroughValidationObject = {
  body: PassThroughAny,
  params: PassThroughAny,
  query: PassThroughAny,
};

export const noParamsValidationObject = {
  params: z.object({}).strict(),
  query: z.object({}).strict(),
  body: z.union([
    // If the route uses POST, the body should be empty object or null
    z.object({}).strict(),
    z.null(),
    // If the route uses GET, body is undefined,
    z.undefined(),
  ]),
};
