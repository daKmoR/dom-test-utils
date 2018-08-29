import { html } from 'lit-html/lib/lit-extended.js';
import { testFixtureSync, testFixture, componentFixture } from '../dom-test-utils.js';

export const stripLitMarkers = html => html.replace(/<!---->/g, '');

class SyncEl extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<div>foo</div>';
  }
}

customElements.define('sync-el', SyncEl);

class ASyncEl extends HTMLElement {
  async connectedCallback() {
    await 0;
    this.innerHTML = '<div>foo</div>';
  }
}

customElements.define('async-el', ASyncEl);

class MyComponentA extends HTMLElement {
    connectedCallback() {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <div>shadow content</div>
      `;
    }
}

customElements.define('my-component-a', MyComponentA);

class MyComponentB extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div>light dom content</div>
    `;
  }
}

customElements.define('my-component-b', MyComponentB);

suite('testFixtureSync()', () => {
  test('renders a string fixture', () => {
    const fixture = testFixtureSync('<div>foo</div>');

    const renderedHTML = stripLitMarkers(fixture.innerHTML);
    assert.equal(renderedHTML, '<div>foo</div>');

    fixture.teardown();
  });

  test('renders a TemplateResult fixture', () => {
    const fixture = testFixtureSync(html`<div>foo</div>`);

    const renderedHTML = stripLitMarkers(fixture.innerHTML);
    assert.equal(renderedHTML, '<div>foo</div>');

    fixture.teardown();
  });

  test('renders a TemplateResult fixture with nested parts', () => {
    const fixture = testFixtureSync(html`<div foo$="${'bar'}">${html`<span>foo</span>`}</div>`);

    const renderedHTML = stripLitMarkers(fixture.innerHTML);
    assert.equal(renderedHTML, '<div foo="bar"><span>foo</span></div>');

    fixture.teardown();
  });

  test('renders a HTMLElement', () => {
    const element = document.createElement('div');
    element.textContent = 'foo';
    const fixture = testFixtureSync(element);

    const renderedHTML = stripLitMarkers(fixture.innerHTML);
    assert.equal(renderedHTML, '<div>foo</div>');

    fixture.teardown();
  });

  test('handles sync rendering', () => {
    const fixture = testFixtureSync('<sync-el></sync-el>');
    const renderedHTML = stripLitMarkers(fixture.innerHTML);
    assert.equal(renderedHTML, '<sync-el><div>foo</div></sync-el>');
    fixture.teardown();
  });

  test('does not handle async rendering', () => {
    const fixture = testFixtureSync('<async-el></async-el>');
    const renderedHTML = stripLitMarkers(fixture.innerHTML);
    assert.equal(renderedHTML, '<async-el></async-el>');
    fixture.teardown();
  });
});

suite('testFixture()', () => {
  test('handles async rendering', async () => {
    const fixture = await testFixture('<async-el></async-el>');
    const renderedHTML = stripLitMarkers(fixture.innerHTML);
    assert.equal(renderedHTML, '<async-el><div>foo</div></async-el>');
    fixture.teardown();
  });
});

suite('HtmlTestFixture', () => {
  test('teardown() cleans up the DOM', () => {
    const el = document.createElement('div');
    el.setAttribute('id', 'testEl');

    const fixture = testFixtureSync(el);

    assert.equal(document.getElementById('testEl'), el);
    fixture.teardown();
    assert.equal(document.getElementById('testEl'), undefined);
  });

  test('assertEquals() runs semantic diff assertion', (done) => {
    const fixture = testFixtureSync('<div>foo</div>');

    // should not throw
    fixture.assertEquals('<div>foo</div>');

    try {
      // should throw
      fixture.assertEquals('<div></div>');
    } catch (error) {
      done();
    } finally {
      fixture.teardown();
    }
  });
});

suite('component fixture', () => {
  test('.component returns the first rendered web component', async () => {
    const fixture = await componentFixture(html`
      <my-component-a></my-component-a>
      <my-component-b></my-component-b>
    `);

    assert.equal(fixture.component.localName, 'my-component-a');
  });

  test('.component returns the component by name if given', async () => {
    const fixture = await componentFixture(html`
      <my-component-a></my-component-a>
      <my-component-b></my-component-b>
    `, 'my-component-b');

    assert.equal(fixture.component.localName, 'my-component-b');
  });

  test('.compareRoot returns the component shadow root if present', async () => {
    const fixture = await componentFixture(html`
      <my-component-a></my-component-a>
    `);

    assert.isTrue(fixture.compareRoot instanceof ShadowRoot);
  });

  test('.compareRoot returns the component if no shadow root present', async () => {
    const fixture = await componentFixture(html`
      <my-component-b></my-component-b>
    `);

    assert.isTrue(fixture.compareRoot instanceof MyComponentB);
  });

  test('assertEquals() compares the component shadow root if present', async () => {
    const fixture = await componentFixture(html`
      <my-component-a></my-component-a>
    `);

    fixture.assertEquals('<div>shadow content</div>');
  });

  test('assertEquals() compares the component light dom if no shadow root present', async () => {
    const fixture = await componentFixture(html`
      <my-component-b></my-component-b>
    `);

    fixture.assertEquals('<div>light dom content</div>');
  });
});