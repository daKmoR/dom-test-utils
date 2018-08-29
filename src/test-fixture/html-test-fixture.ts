import { assertEquals } from '../semantic-diff/semantic-diff';

const isWebComponent = (node: Node) => node.localName && node.localName.includes('-');

export class HTMLTestFixture extends HTMLElement {
  mode: 'html' | 'web-component' = 'html';
  componentName?: string;
  _component?: HTMLElement;

  teardown() {
    if (this.parentElement) {
      this.parentElement.removeChild(this);
    }
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

  assertEquals(value: unknown) {
    assertEquals(this.compareRoot.innerHTML, value);
  }

  expectEquals(value: unknown) {
    this.assertEquals(value);
  }
}

customElements.define('html-test-fixture', HTMLTestFixture);