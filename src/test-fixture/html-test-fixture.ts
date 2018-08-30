import { DiffConfig, assertDOMEquals, getAST } from '../semantic-diff/semantic-diff';
import { serialize } from 'bundled-parse5';

const isWebComponent = (node: Node) => node.localName && node.localName.includes('-');

export class HTMLTestFixture extends HTMLElement {
  mode: 'html' | 'web-component' = 'html';
  diffConfig?: DiffConfig;
  componentName?: string;
  _component?: HTMLElement;

  teardown() {
    if (this.parentElement) {
      this.parentElement.removeChild(this);
    }
  }

  /**
   * Returns the snapshot that can be used for storing the component state's snapshot,
   * and compared against in your tests.
   */
  get snapshot() {
    const ast = getAST(this.compareRoot.innerHTML);
    return serialize(ast);
  }

  /**
   * Finds the web component set up by this test fixture. If a component name was specified, that is used.
   * Otherwise it returns the first web component it finds. Throws if none is found.
   */
  get component() {
    if (this._component) {
      return this._component;
    }

    if (this.componentName) {
      this._component = this.querySelector(this.componentName) as HTMLElement;
      if (!this._component ) {
        throw new Error(`Test fixture did not render a web component named ${this.componentName}`);
      }
    } else {
      const deepChildren = this.querySelectorAll('*');
      this._component = Array.prototype.filter.call(deepChildren, isWebComponent)[0];
      if (!this._component) {
        throw new Error('Test fixture did not render any web components.');
      }
    }

    return this._component;
  }

  /**
   * Returns the root element used for comparing / diffing
   */
  get compareRoot() {
    if (this.mode === 'web-component') {
      const component =  this.component;

      // if the component has a shadow root, use that for comparison
      return component.shadowRoot || component;
    }

    return this;
  }

  assertDOMEquals(value: unknown) {
    assertDOMEquals(this.compareRoot.innerHTML, value, this.diffConfig);
  }

  expectDOMEquals(value: unknown) {
    this.assertDOMEquals(value);
  }
}

customElements.define('html-test-fixture', HTMLTestFixture);