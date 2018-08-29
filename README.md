# DOM Test Utils
Modern utility libray for testing web apps and components. `dom-test-utils` works with anything compatible with the browser. Web components and lit-html are first class citizens.

Note: this project is still in a development phase. Based on feedback, there may be breaking changes to the API.

## Basics

Set up fixtures and compare the result with what you expect:

```javascript
import { createFixture } from 'dom-test-utils';
import { html } from 'lit-html';

const fixture = createFixtureSync(`
  <section>
    <h1 class="bar">Lorem ipsum</h1>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
      sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </p>
  </section>
`);

// fails test with error: attribute [class="foo"] was changed to attribute [class="bar"], at: section > h1
fixture.assertDOMEquals(`
  <section class="foo">
    <h1 class="foo">Lorem ipsum</h1>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
      sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </p>
  </section>
`);
```

Integrates easily with web components. Set up a fixture, await async rendering and compare against shadow dom instead of light dom:

```javascript
import { componentFixture } from 'dom-test-utils';
import { html } from 'lit-html';

const fixture = await componentFixture('<my-component></my-component>');

// fixture.component will give access to your web component's instance
console.log(fixture.component);

// the fixture will compare the given HTML with the component's shadow root
fixture.assertDOMEquals(`
  <section class="foo">
    <h1 class="foo">Lorem ipsum</h1>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
      sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </p>
  </section>
`);
```

Supports HTML as string, as well as any valid lit-html render value:

```javascript
// string
const fixture = await componentFixture('<my-component></my-component>');

// template string
const fixture = await componentFixture(`
  <my-component>

  </my-component>
`);

// lit template
const fixture = await componentFixture(html`
  <my-component
    some-attribute="${'foo'}"
    .some-property="${'bar'}">
  </my-component>
`);

// dom node
const component = document.createElement('my-component');
const fixture = await componentFixture(component);
```

Compares dom trees based on semantic equality. Attribute and class order don't matter, whitespace, newlines and non-visual elements
like styles and script are ignored. A descriptive error message is given when two dom trees are not equal.

```javascript
import { assertDOMEquals } from 'dom-test-utils';

// considered equal
assertDOMEquals('<div>foo</div>', `
  <div>
    foo
</div>
`);

const a = `
  <section>
    <div id="foo">
      <div></div>
    </div>
  </section>
`;

const b = `
  <section>
    <div>
      <span></span>
    </div>
  </section>
`;

// throws error: tag <div> was changed to tag <span>, at: section > div#foo > div
assertDOMEquals(a, b);
```

## Workflow

When building dynamic web components, you want to make sure the rendered DOM stays the way you want. Instead of writing manual queries and assertions, you can store a 'snapshot' of the rendered DOM and write tests that given a certain state of your component the dom is still the way you expect. This is similar to Jest snapshots, expect that this works for vanilla HTML / web componenets. This can be written by hand, but tooling similar to https://jestjs.io/docs/en/snapshot-testing can automate this process in the future.

## API Docs

### Test fixtures

#### Simple fixtures
Set up test fixtures for a piece of HTML:

```javascript
import { testFixtureSync } from 'dom-test-utils';

const template = `
  <section>
    <h1>Lorem ipsum</h1>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
      sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </p>
  </section>
`;

// set up the HTML fixture
const fixture = testFixtureSync(template);

// query dom nodes in the fixture
fixture.querySelector('section');

// print the rendered DOM
console.log(fixture.innerHTML);
```

To avoid memory leaks, make sure to call `teardown()` after you finish testing:

```javascript
  const fixture = testFixtureSync('<div></div>');
  fixture.teardown();
```

#### Async fixtures
Most frameworks or web component libraries do some kind of async/batched rendering. Creating fixtures is therefore async by default:

```javascript
import { testFixture } from 'dom-test-utils';

const template = `
  <my-element></my-element>
`;

const fixture = await testFixture(template);
```

#### lit-html fixtures
`dom-test-utils` uses lit-html to render the fixtures, and therefore accepts (besides strings) any valid `lit-html` render variable:

Templates:
```javascript
const fixture = await testFixture(html`
  <div>foo</div>
`);
```

Dom elements:
```javascript
const element = document.createElement('my-component');
const fixture = await testFixture(element);
```

Arrays:
```javascript
const templates = [html`<div></div>`, html`<span></span>`, html`<div></div>`];
const fixture = await testFixture(templates);
```

### Comparing and diffing DOM trees

You can use `dom-test-utils` for comparing and diffing DOM trees. Trees are compared semantically, not literally. This means that it is lenient with differences in attribute order, whitespace, newlines etc. Only visual HTML is compared, styles and script tags are ignored.

Within tests, the most convenient way is to the `assertDOMEquals` method on the test fixture. This will throw a descriptive error when the trees are not equal:

```javascript
const fixture = await createFixture(html`
  <div>foo</div>
`);

// will not throw
fixture.assertDOMEquals('<div>foo</foo>');

// throws an error
fixture.assertDOMEquals('<div>bar</foo>');
```

You can use `expectEquals` for BDD naming conventions.

`assertDOMEquals` and `expectEquals` accepts the same input as test fixture: strings, lit templates, dom nodes etc.

You can also use `assertDOMEquals()` directly:

```javascript
import { assertDOMEquals } from 'dom-test-utils';
const fixture = await createFixture(html`
  <div>foo</div>
`);

// will not throw
fixture.assertDOMEquals('<div>foo</foo>');

// throws an error
fixture.assertDOMEquals('<div>bar</foo>');
```


`getDOMDiff()` can also be used directly:

```javascript
import { getDOMDiff } from 'dom-test-utils';

const leftTree = html`
  <div>foo</div>
`;
const rightTree = html`
  <div>bar</div>
`;

// Diff will be an object if there is a difference, otherwise undefined
const diff = getDOMDiff(leftTree, rightTree);
```

## Inspiration

This project was heavily inspired by existing libraries. The intent is to create a standalone library based on modern APIs, and not coupled to any (testing) framework.

* https://github.com/i-like-robots/chai-html
* https://github.com/PolymerElements/test-fixture