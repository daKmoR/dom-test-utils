import { TemplateResult } from 'lit-html';
import { render, html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { waitForRender } from '../async-utils';
import { HTMLTestFixture } from './html-test-fixture';
import { DiffConfig } from '../semantic-diff/semantic-diff';

export { HTMLTestFixture };

export interface TestFixtureConfig extends DiffConfig {
  componentName?: string;
}

function toLitTemplate(value: unknown) {
  if (typeof value === 'string') {
    return html`${unsafeHTML(value)}`;
  }

  if (value instanceof TemplateResult) {
    return value;
  }

  // TODO: we can render anything directly without wrapping in 0.11 onwards
  return html`${value}`;
}

/**
 * Sets up a test fixture and renders the given value to the DOM.
 * To avoid memory leaks, call teardown() after the test finished.
 *
 * This function returns synchronously, if dependent on async rendering
 * use the testFixture() function instead.
 *
 * @param value the value to render. A string is rendered as HTML, any other
 * values are passed to lit-html directly. Any valid lit value can be rendered.
 * @returns the test fixture.
 */
export function testFixtureSync(value: unknown): HTMLTestFixture {
  const fixture = document.createElement('html-test-fixture');
  document.body.appendChild(fixture);

  const template = toLitTemplate(value);
  render(template, fixture);

  return fixture as HTMLTestFixture;
}

/**
 * Sets up a test fixtures, and waits for one render cycle to complete. Use this
 * if dependent on async rendering. See testFixtureSync() for more.
 *
 * @param value the value to render.
 * @returns a promise that resolves with the test fixture after one render cycle.
 */
export async function testFixture(value: unknown) {
  const fixture = testFixtureSync(value);
  await waitForRender;
  return fixture;
}

/**
 * Sets up a web component fixture. Uses testFixture(), but adds convenience when
 * testing web components. The .component property can be used for retreiving the
 * component, and assertEquals() will use the component's shadow root for diffing
 * if it's used.
 *
 * @param value the value to render.
 * @param componentName the name of the component. Optional, by default the first component found is used
 * @returns a promise that resolves with the test fixture after one render cycle.
 */
export async function componentFixture(value: unknown, config: TestFixtureConfig = {}) {
  const fixture = await testFixture(value);
  fixture.mode = 'web-component';
  fixture.componentName = config.componentName;
  fixture.diffConfig = config;
  return fixture;
}

/**
 * Same as componentFixture(), but without waiting for a render.
 *
 * @param value the value to render.
 * @param componentName the name of the component. Optional, by default the first component found is used
 * @returns the test fixture.
 */
export function componentFixtureSync(value: unknown, config: TestFixtureConfig = {}) {
  const fixture = testFixtureSync(value);
  fixture.mode = 'web-component';
  fixture.componentName = config.componentName;
  fixture.diffConfig = config;
  return fixture;
}
