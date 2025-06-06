/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import { EuiLink, EuiCode } from '@elastic/eui';

import { documentationService } from '../../../../services/documentation';
import { FormSchema, FIELD_TYPES, fieldValidators } from '../../shared_imports';
import { ComboBoxOption } from '../../types';

const { isJsonField } = fieldValidators;

const fieldPathComboBoxConfig = {
  helpText: i18n.translate(
    'xpack.idxMgmt.mappingsEditor.configuration.sourceFieldPathComboBoxHelpText',
    {
      defaultMessage: 'Accepts a path to the field, including wildcards.',
    }
  ),
  type: FIELD_TYPES.COMBO_BOX,
  defaultValue: [],
  serializer: (options: ComboBoxOption[]): string[] => options.map(({ label }) => label),
  deserializer: (values: string[]): ComboBoxOption[] => values.map((value) => ({ label: value })),
};

export const configurationFormSchema: FormSchema = {
  metaField: {
    label: i18n.translate('xpack.idxMgmt.mappingsEditor.configuration.metaFieldEditorLabel', {
      defaultMessage: '_meta field data',
    }),
    helpText: (
      <FormattedMessage
        id="xpack.idxMgmt.mappingsEditor.configuration.metaFieldEditorHelpText"
        defaultMessage="Use JSON format: {code}"
        values={{
          code: <EuiCode>{JSON.stringify({ arbitrary_data: 'anything_goes' })}</EuiCode>,
        }}
      />
    ),
    validations: [
      {
        validator: isJsonField(
          i18n.translate('xpack.idxMgmt.mappingsEditor.configuration.metaFieldEditorJsonError', {
            defaultMessage: 'The _meta field JSON is not valid.',
          }),
          { allowEmptyString: true }
        ),
      },
    ],
    deserializer: (value: any) => {
      if (value === '') {
        return value;
      }
      return JSON.stringify(value, null, 2);
    },
    serializer: (value: string) => {
      try {
        const parsed = JSON.parse(value);
        // If an empty object was passed, strip out this value entirely.
        if (!Object.keys(parsed).length) {
          return undefined;
        }
        return parsed;
      } catch (error) {
        // swallow error and return non-parsed value;
        return value;
      }
    },
  },
  sourceField: {
    option: {
      type: FIELD_TYPES.SUPER_SELECT,
      defaultValue: 'stored',
    },
    includes: {
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.configuration.includeSourceFieldsLabel', {
        defaultMessage: 'Include fields',
      }),
      ...fieldPathComboBoxConfig,
    },
    excludes: {
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.configuration.excludeSourceFieldsLabel', {
        defaultMessage: 'Exclude fields',
      }),
      ...fieldPathComboBoxConfig,
    },
  },
  dynamicMapping: {
    enabled: {
      label: i18n.translate(
        'xpack.idxMgmt.mappingsEditor.configuration.enableDynamicMappingsLabel',
        {
          defaultMessage: 'Enable dynamic mapping',
        }
      ),
      type: FIELD_TYPES.TOGGLE,
      defaultValue: true,
    },
    throwErrorsForUnmappedFields: {
      label: i18n.translate(
        'xpack.idxMgmt.mappingsEditor.configuration.throwErrorsForUnmappedFieldsLabel',
        {
          defaultMessage: 'Throw an exception when a document contains an unmapped field',
        }
      ),
      helpText: i18n.translate(
        'xpack.idxMgmt.mappingsEditor.configuration.dynamicMappingStrictHelpText',
        {
          defaultMessage:
            'By default, unmapped fields will be silently ignored when dynamic mapping is disabled. Optionally, you can choose to throw an exception when a document contains an unmapped field.',
        }
      ),
      type: FIELD_TYPES.CHECKBOX,
      defaultValue: false,
    },
    numeric_detection: {
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.configuration.numericFieldLabel', {
        defaultMessage: 'Map numeric strings as numbers',
      }),
      helpText: i18n.translate(
        'xpack.idxMgmt.mappingsEditor.configuration.numericFieldDescription',
        {
          defaultMessage:
            'For example, "1.0" would be mapped as a float and "1" would be mapped as an integer.',
        }
      ),
      type: FIELD_TYPES.TOGGLE,
      defaultValue: false,
    },
    date_detection: {
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.configuration.dateDetectionFieldLabel', {
        defaultMessage: 'Map date strings as dates',
      }),
      type: FIELD_TYPES.TOGGLE,
      defaultValue: true,
    },
    dynamic_date_formats: {
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.configuration.dynamicDatesFieldLabel', {
        defaultMessage: 'Date formats',
      }),
      helpText: () => (
        <FormattedMessage
          id="xpack.idxMgmt.mappingsEditor.configuration.dynamicDatesFieldHelpText"
          defaultMessage="Strings in these formats will be mapped as dates. You can use built-in formats or custom formats. {docsLink}"
          values={{
            docsLink: (
              <EuiLink href={documentationService.getDateFormatLink()} target="_blank">
                {i18n.translate(
                  'xpack.idxMgmt.mappingsEditor.configuration.dynamicDatesFieldDocumentionLink',
                  {
                    defaultMessage: 'Learn more.',
                  }
                )}
              </EuiLink>
            ),
          }}
        />
      ),
      type: FIELD_TYPES.COMBO_BOX,
      defaultValue: ['strict_date_optional_time', 'yyyy/MM/dd HH:mm:ss Z||yyyy/MM/dd Z'],
    },
  },
  _routing: {
    required: {
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.configuration.routingLabel', {
        defaultMessage: 'Require _routing value for CRUD operations',
      }),
      defaultValue: false,
    },
  },
  _size: {
    enabled: {
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.configuration.sizeLabel', {
        defaultMessage: 'Index the _source field size in bytes',
      }),
      defaultValue: false,
    },
  },
  subobjects: {
    label: i18n.translate('xpack.idxMgmt.mappingsEditor.configuration.subobjectsLabel', {
      defaultMessage: 'Allow objects to hold further subobjects',
    }),
    defaultValue: true,
  },
};
