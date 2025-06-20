/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { EuiButton, EuiEmptyPrompt } from '@elastic/eui';
import { findTestSubject } from '@kbn/test-jest-helpers';
import { mount } from 'enzyme';
import type { ReactNode } from 'react';
import React from 'react';
import { discoverServiceMock } from '../../__mocks__/services';
import { ErrorCallout } from './error_callout';
import { DiscoverTestProvider } from '../../__mocks__/test_provider';

const mockRenderSearchError = jest.fn();

jest.mock('@kbn/search-errors', () => {
  const originalModule = jest.requireActual('@kbn/search-errors');
  return {
    ...originalModule,
    renderSearchError: () => mockRenderSearchError(),
  };
});

describe('ErrorCallout', () => {
  const mountWithServices = (component: ReactNode) =>
    mount(<DiscoverTestProvider services={discoverServiceMock}>{component}</DiscoverTestProvider>);

  afterEach(() => {
    mockRenderSearchError.mockReset();
  });

  it('should render', () => {
    const title = 'Error title';
    const error = new Error('My error');
    const wrapper = mountWithServices(<ErrorCallout title={title} error={error} />);
    const prompt = wrapper.find(EuiEmptyPrompt);
    expect(prompt).toHaveLength(1);
    expect(prompt.prop('title')).toBeDefined();
    expect(prompt.prop('title')).not.toBeInstanceOf(String);
    expect(prompt.find('EuiCodeBlock')).toHaveLength(1);
    expect(prompt.find('EuiCodeBlock').text()).toContain(error.message);
    expect(prompt.find('[data-test-subj="discoverErrorCalloutTitle"]').contains(title)).toBe(true);
    expect(prompt.find(EuiButton)).toHaveLength(1);
  });

  it('should render with override display', () => {
    const title = 'Override title';
    const error = new Error('My error');
    const overrideDisplay = <div>Override display</div>;
    mockRenderSearchError.mockReturnValue({ title, body: overrideDisplay });
    const wrapper = mountWithServices(<ErrorCallout title="Original title" error={error} />);
    const prompt = wrapper.find(EuiEmptyPrompt);
    expect(prompt).toHaveLength(1);
    expect(prompt.prop('title')).toBeDefined();
    expect(prompt.prop('title')).not.toBeInstanceOf(String);
    expect(prompt.prop('body')).toBeDefined();
    expect(findTestSubject(prompt, 'discoverErrorCalloutTitle').contains(title)).toBe(true);
    expect(prompt.contains(overrideDisplay)).toBe(true);
    expect(prompt.find(EuiButton)).toHaveLength(0);
  });

  it('should call showErrorDialog when the button is clicked', () => {
    (discoverServiceMock.core.notifications.showErrorDialog as jest.Mock).mockClear();
    const title = 'Error title';
    const error = new Error('My error');
    const wrapper = mountWithServices(<ErrorCallout title={title} error={error} />);
    wrapper.find(EuiButton).find('button').simulate('click');
    expect(discoverServiceMock.core.notifications.showErrorDialog).toHaveBeenCalledWith({
      title,
      error,
    });
  });

  it('should not render the "View details" button for ES|QL', () => {
    (discoverServiceMock.core.notifications.showErrorDialog as jest.Mock).mockClear();
    const title = 'Error title';
    const error = new Error('My error');
    const wrapper = mountWithServices(<ErrorCallout title={title} error={error} isEsqlMode />);
    expect(findTestSubject(wrapper, 'discoverErrorCalloutShowDetailsButton')).toHaveLength(0);
  });

  it('should render the "ES|QL reference" button for ES|QL', () => {
    (discoverServiceMock.core.notifications.showErrorDialog as jest.Mock).mockClear();
    const title = 'Error title';
    const error = new Error('My error');
    const wrapper = mountWithServices(<ErrorCallout title={title} error={error} isEsqlMode />);
    expect(findTestSubject(wrapper, 'discoverErrorCalloutESQLReferenceButton')).toHaveLength(1);
  });
});
