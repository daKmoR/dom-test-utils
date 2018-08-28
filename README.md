#DOM Test Utils
Modern utility libray for testing web apps and components. `dom-test-utils` works with anything compatible with the browser. Web components and lit-html are first class citizens.

## Test fixtures

### Simple fixtures
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

### Async fixtures
Most frameworks or web component libraries do some kind of async/batched rendering. Creating fixtures is therefore async by default:

```javascript
  import { testFixture } from 'dom-test-utils';

  const template = `
    <my-element></my-element>
  `;

  const fixture = await testFixture(template);
```

### lit-html fixtures
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

## Comparing and diffing DOM trees

You can use `dom-test-utils` for comparing and diffing DOM trees. Trees are compared semantically, not literally. This means that it is lenient with differences in attribute order, whitespace, newlines etc. Only visual HTML is compared, styles and script tags are ignored.

Within tests, the most convenient way is to the `assertEquals` method on the test fixture. This will throw a descriptive error when the trees are not equal:

```javascript
  const fixture = await createFixture(html`
    <div>foo</div>
  `);

  // will not throw
  fixture.assertEquals('<div>foo</foo>);

  // throws an error
  fixture.assertEquals('<div>bar</foo>);
```

You can use `expectEquals` for BDD naming conventions.

`assertEquals` and `expectEquals` accepts the same input as test fixture: strings, lit templates, dom nodes etc.

You can also use `assertEquals()` directly:

```javascript
  import { assertEquals } from 'dom-test-utils';
  const fixture = await createFixture(html`
    <div>foo</div>
  `);

  // will not throw
  fixture.assertEquals('<div>foo</foo>');

  // throws an error
  fixture.assertEquals('<div>bar</foo>');
```


`semanticDiff()` can also be used directly:

```javascript
  import { semanticDiff } from 'dom-test-utils';

  const leftTree = html`
    <div>foo</div>
  `;
  const rightTree = html`
    <div>bar</div>
  `;

  // Diff will be an object if there is a difference, otherwise undefined
  const diff = semanticDiff(leftTree, rightTree);
```

### Future work

* Integration with mocha/chai