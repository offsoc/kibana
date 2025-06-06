/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';
import { RouteInitializerDeps } from '..';
import { API_ROUTE_WORKPAD, TEMPLATE_TYPE } from '../../../common/lib/constants';
import { CanvasWorkpad } from '../../../types';
import { WorkpadSchema } from './workpad_schema';
import { okResponse } from '../ok_response';
import { catchErrorHandler } from '../catch_error_handler';

interface TemplateAttributes {
  template: CanvasWorkpad;
}

const WorkpadFromTemplateSchema = schema.object({
  templateId: schema.string(),
});

const createRequestBodySchema = schema.oneOf([WorkpadSchema, WorkpadFromTemplateSchema]);

function isCreateFromTemplate(
  maybeCreateFromTemplate: typeof createRequestBodySchema.type
): maybeCreateFromTemplate is typeof WorkpadFromTemplateSchema.type {
  return (
    (maybeCreateFromTemplate as typeof WorkpadFromTemplateSchema.type).templateId !== undefined
  );
}

export function initializeCreateWorkpadRoute(deps: RouteInitializerDeps) {
  const { router } = deps;
  router.versioned
    .post({
      path: `${API_ROUTE_WORKPAD}`,
      options: {
        body: {
          maxBytes: 26214400,
          accepts: ['application/json'],
        },
      },
      access: 'internal',
      security: {
        authz: {
          enabled: false,
          reason:
            'This route is opted out from authorization because authorization is provided by saved objects client.',
        },
      },
    })
    .addVersion(
      {
        version: '1',
        validate: {
          request: { body: createRequestBodySchema },
        },
      },
      catchErrorHandler(async (context, request, response) => {
        let workpad = request.body as CanvasWorkpad;

        if (isCreateFromTemplate(request.body)) {
          const soClient = (await context.core).savedObjects.client;
          const templateSavedObject = await soClient.get<TemplateAttributes>(
            TEMPLATE_TYPE,
            request.body.templateId
          );
          workpad = templateSavedObject.attributes.template;
        }

        const canvasContext = await context.canvas;
        const createdObject = await canvasContext.workpad.create(workpad);

        return response.ok({
          body: { ...okResponse, id: createdObject.id },
        });
      })
    );
}
