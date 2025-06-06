/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { RecoveredActionGroup } from '../../../../common';
import { loggingSystemMock } from '@kbn/core-logging-server-mocks';
import { transformRuleAttributesToRuleDomain } from './transform_rule_attributes_to_rule_domain';
import type { UntypedNormalizedRuleType } from '../../../rule_type_registry';
import type { RawRuleAction } from '../../../types';

const ruleType: jest.Mocked<UntypedNormalizedRuleType> = {
  id: 'test.rule-type',
  name: 'My test rule',
  actionGroups: [{ id: 'default', name: 'Default' }, RecoveredActionGroup],
  defaultActionGroupId: 'default',
  minimumLicenseRequired: 'basic',
  isExportable: true,
  recoveryActionGroup: RecoveredActionGroup,
  executor: jest.fn(),
  producer: 'alerts',
  solution: 'stack',
  cancelAlertsOnRuleTimeout: true,
  ruleTaskTimeout: '5m',
  autoRecoverAlerts: true,
  doesSetRecoveryContext: true,
  validate: {
    params: { validate: (params) => params },
  },
  alerts: {
    context: 'test',
    mappings: { fieldMap: { field: { type: 'keyword', required: false } } },
    shouldWrite: true,
  },
  category: 'test',
  validLegacyConsumers: [],
};

const defaultAction: RawRuleAction = {
  group: 'default',
  uuid: '1',
  actionRef: 'default-action-ref',
  actionTypeId: '.test',
  params: {},
  frequency: {
    summary: false,
    notifyWhen: 'onThrottleInterval',
    throttle: '1m',
  },
  alertsFilter: { query: { kql: 'test:1', dsl: '{}', filters: [] } },
};

const systemAction: RawRuleAction = {
  actionRef: 'system_action:my-system-action-id',
  uuid: '123',
  actionTypeId: '.test-system-action',
  params: {},
};

const isSystemAction = (id: string) => id === 'my-system-action-id';

describe('transformRuleAttributesToRuleDomain', () => {
  const MOCK_API_KEY = Buffer.from('123:abc').toString('base64');
  const logger = loggingSystemMock.create().get();

  it('transforms the actions correctly', () => {
    const references = [{ name: 'default-action-ref', type: 'action', id: 'default-action-id' }];

    const rule = {
      enabled: false,
      tags: ['foo'],
      createdBy: 'user',
      createdAt: '2019-02-12T21:01:22.479Z',
      updatedAt: '2019-02-12T21:01:22.479Z',
      legacyId: null,
      muteAll: false,
      mutedInstanceIds: [],
      snoozeSchedule: [],
      alertTypeId: 'myType',
      schedule: { interval: '1m' },
      consumer: 'myApp',
      scheduledTaskId: 'task-123',
      executionStatus: {
        lastExecutionDate: '2019-02-12T21:01:22.479Z',
        status: 'pending' as const,
        error: null,
        warning: null,
      },
      params: {},
      throttle: null,
      notifyWhen: null,
      actions: [defaultAction, systemAction],
      name: 'my rule name',
      revision: 0,
      updatedBy: 'user',
      apiKey: MOCK_API_KEY,
      apiKeyOwner: 'user',
      flapping: {
        lookBackWindow: 20,
        statusChangeThreshold: 20,
      },
    };
    const res = transformRuleAttributesToRuleDomain(
      rule,
      {
        id: '1',
        logger,
        ruleType,
        references,
      },
      isSystemAction
    );

    expect(res.flapping).toMatchInlineSnapshot(`
      Object {
        "lookBackWindow": 20,
        "statusChangeThreshold": 20,
      }
    `);

    expect(res.actions).toMatchInlineSnapshot(`
      Array [
        Object {
          "actionTypeId": ".test",
          "alertsFilter": Object {
            "query": Object {
              "filters": Array [],
              "kql": "test:1",
            },
          },
          "frequency": Object {
            "notifyWhen": "onThrottleInterval",
            "summary": false,
            "throttle": "1m",
          },
          "group": "default",
          "id": "default-action-id",
          "params": Object {},
          "uuid": "1",
        },
      ]
    `);
    expect(res.systemActions).toMatchInlineSnapshot(`
      Array [
        Object {
          "actionTypeId": ".test-system-action",
          "id": "my-system-action-id",
          "params": Object {},
          "uuid": "123",
        },
      ]
    `);
  });

  it('transforms the artifacts correctly', () => {
    const artifacts = {
      dashboards: [
        {
          refId: 'dashboard_0',
        },
        {
          refId: 'dashboard_1',
        },
      ],
    };

    const actionReferences = [
      { name: 'default-action-ref', type: 'action', id: 'default-action-id' },
    ];

    const artifactsReferences = [
      { name: 'dashboard_0', type: 'dashboard', id: 'dashboard-1' },
      { name: 'dashboard_1', type: 'dashboard', id: 'dashboard-2' },
    ];

    const references = [...actionReferences, ...artifactsReferences];

    const rule = {
      enabled: false,
      tags: ['foo'],
      createdBy: 'user',
      createdAt: '2019-02-12T21:01:22.479Z',
      updatedAt: '2019-02-12T21:01:22.479Z',
      legacyId: null,
      muteAll: false,
      mutedInstanceIds: [],
      snoozeSchedule: [],
      alertTypeId: 'myType',
      schedule: { interval: '1m' },
      consumer: 'myApp',
      scheduledTaskId: 'task-123',
      executionStatus: {
        lastExecutionDate: '2019-02-12T21:01:22.479Z',
        status: 'pending' as const,
        error: null,
        warning: null,
      },
      params: {},
      throttle: null,
      notifyWhen: null,
      actions: [defaultAction, systemAction],
      artifacts,
      name: 'my rule name',
      revision: 0,
      updatedBy: 'user',
      apiKey: MOCK_API_KEY,
      apiKeyOwner: 'user',
      flapping: {
        lookBackWindow: 20,
        statusChangeThreshold: 20,
      },
    };

    const res = transformRuleAttributesToRuleDomain(
      rule,
      {
        id: '1',
        logger,
        ruleType,
        references,
      },
      isSystemAction
    );

    expect(res.artifacts).toMatchInlineSnapshot(`
      Object {
        "dashboards": Array [
          Object {
            "id": "dashboard-1",
          },
          Object {
            "id": "dashboard-2",
          },
        ],
        "investigation_guide": Object {
          "blob": "",
        },
      }
    `);
  });
});
