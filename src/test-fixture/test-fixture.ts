import { TemplateResult } from 'lit-html/lit-html';
import { render, html } from 'lit-html/lib/lit-extended';
import { unsafeHTML } from 'lit-html/lib/unsafe-html';
import { waitForRender } from '../async-utils';
import { assertEquals } from '../semantic-diff/semantic-diff';

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

class HTMLTestFixture extends HTMLElement {
  teardown() {
    if (this.parentElement) {
      this.parentElement.removeChild(this);
    }
  }

  assertEquals(value: unknown) {
    assertEquals(this.innerHTML, value);
  }

  expectEquals(value: unknown) {
    this.assertEquals(value);
  }
}

customElements.define('html-test-fixture', HTMLTestFixture);

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
export function testFixtureSync(value: unknown) {
  const fixture = document.createElement('html-test-fixture');
  document.body.appendChild(fixture);

  const template = toLitTemplate(value);
  render(template, fixture);

  return fixture;
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

