import { parseFragment, serialize } from 'bundled-parse5';
import { deepDiff } from 'bundled-deep-diff';
import { html, render } from 'bower-lit-html/lib/lit-extended';
import { TemplateResult } from 'bower-lit-html';
import { TemplateResult as TemplateResult$1 } from 'bower-lit-html/lit-html';
import { unsafeHTML } from 'bower-lit-html/lib/unsafe-html';

function sanitizeHtmlString(htmlString) {
    return htmlString
        // Remove whitespace between elements (no whitespace only nodes)
        .replace(/>\s+</g, '><')
        // remove lit-html expression markers
        .replace(/<!---->/g, '')
        // Remove leading and trailing whitespace
        .trim();
}

// Typings for parse5 contains errors, and the inheritence tree is funky.
const isElement = (arg) => arg && 'tagName' in arg;
const isParentNode = (arg) => arg && 'childNodes' in arg;
const isTextNode = (arg) => arg && arg.nodeName === '#text';

const defaultIgnoresTags = ['style', 'script', '#comment'];
function filterNode(node, ignoredTags) {
    return !defaultIgnoresTags.includes(node.nodeName) && !ignoredTags.includes(node.nodeName);
}
function sortAttributes(attrs) {
    return attrs
        // Sort attributes
        .map((attr) => {
        if (attr.name === 'class') {
            attr.value = attr.value.trim().split(/\s+/).sort().join(' ');
        }
        return attr;
    })
        // Sort classes
        .sort((attrA, attrB) => {
        const a = attrA.name.toLowerCase();
        const b = attrB.name.toLowerCase();
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    });
}
function normalizeWhitespace(nodes) {
    const lastIndex = nodes.length - 1;
    nodes.forEach((node, i) => {
        if (isTextNode(node)) {
            if (i === 0) {
                node.value = node.value.replace(/^\s+/, '');
            }
            if (i === lastIndex) {
                node.value = node.value.replace(/\s+$/, '');
            }
        }
    });
}
function normalizeAST(node, ignoredTags = []) {
    if (isElement(node)) {
        node.attrs = sortAttributes(node.attrs);
    }
    if (isParentNode(node)) {
        normalizeWhitespace(node.childNodes);
        node.childNodes = node.childNodes.filter(child => filterNode(child, ignoredTags));
        node.childNodes.forEach(child => normalizeAST(child, ignoredTags));
    }
}

const isAttribute = (arg) => arg && 'name' in arg && 'value' in arg;
const isArray = Array.isArray;
function identifier(arg) {
    if (isTextNode(arg)) {
        return `text "${arg.value}"`;
    }
    if (isElement(arg)) {
        return `tag <${arg.tagName}>`;
    }
    if (isAttribute(arg)) {
        return arg.value
            ? `attribute [${arg.name}="${arg.value}"]`
            : `attribute [${arg.name}]`;
    }
    throw new Error(`Unknown arg: ${arg}`);
}
/** Asserts that the diff is an array diff, returns type assertions to remove optional props.  */
function isArrayDiff(d) {
    return d.kind === 'A' && !!d.item && typeof d.index === 'number';
}
const messageTemplates = {
    // New diff
    N: (diff, lhs, rhs) => `${identifier(rhs)} has been added`,
    // Edit diff
    E: (diff, lhs, rhs) => `${identifier(lhs)} was changed to ${identifier(rhs)}`,
    // Delete diff
    D: (diff, lhs, rhs) => `${identifier(lhs)} has been removed`,
};
/**
 * Generates a human understandable message for a HTML diff.
 *
 * @param diff The diff
 * @param lhs The left hand side diffed object. Can be a HTML ASTNode or an Attribute.
 * @param rhs The left hand side diffed object. Can be a HTML ASTNode or an Attribute.
 *
 * @returns the message
 */
function getDiffMessage(diff, lhs, rhs) {
    // Array diff
    if (isArray(lhs) || isArray(rhs)) {
        if (!isArrayDiff(diff) || !isArray(lhs) || !isArray(rhs)) {
            throw new Error('Not all arguments are array diffs');
        }
        return getDiffMessage(diff.item, lhs[diff.index], rhs[diff.index]);
    }
    // Non-array diff
    if (diff.kind in messageTemplates) {
        return messageTemplates[diff.kind](diff, lhs, rhs);
    }
    throw new Error(`Unknown diff kind: ${diff.kind}`);
}

function findDiffedObject(root, path) {
    let node = root;
    for (const step of path) {
        if (Array.isArray(node)) {
            const i = parseFloat(step);
            if (Number.isInteger(i)) {
                node = node[i];
            }
            else {
                throw new Error(`Non-integer step: ${step} for array node.`);
            }
        }
        else if (step === 'childNodes') {
            if (isParentNode(node)) {
                node = node.childNodes;
            }
            else {
                throw new Error(`Cannot read childNodes from non-parent node.`);
            }
        }
        else if (step === 'attrs') {
            if (isElement(node)) {
                node = node.attrs;
            }
            else {
                throw new Error(`Cannot read attributes from non-element node.`);
            }
        }
        else {
            // For all other steps we don't walk further
            break;
        }
    }
    return node;
}

function getNodeName(node) {
    if (!isElement(node)) {
        return;
    }
    const idAttr = node.attrs && node.attrs.find((attr) => attr.name === 'id');
    const id = idAttr ? `#${idAttr.value}` : '';
    return `${node.nodeName}${id}`;
}
function getDiffPath(root, path) {
    const names = [];
    let node = root;
    for (const step of path) {
        if (Array.isArray(node)) {
            const i = parseFloat(step);
            if (Number.isInteger(i)) {
                node = node[i];
            }
            else {
                throw new Error(`Non-integer step: ${step} for array node.`);
            }
        }
        else if (step === 'childNodes') {
            if (isParentNode(node)) {
                node = node.childNodes;
            }
            else {
                throw new Error(`Cannot read childNodes from non-parent node.`);
            }
        }
        else {
            // Break loop if we end up at a type of path section we don't want
            // walk further into
            break;
        }
        if (!Array.isArray(node)) {
            const name = getNodeName(node);
            if (name) {
                names.push(name);
            }
        }
    }
    return names.join(' > ');
}

/**
 * Creates the DiffResult for two AST trees.
 *
 * @param leftTree the left tree
 * @param rightTree the right tree
 * @param diff the semantic difference between the two trees
 *
 * @returns the diff result containing the human readable semantic difference
 */
function createDiffResult(leftTree, rightTree, diff) {
    const leftDiffObject = findDiffedObject(leftTree, diff.path);
    const rightDiffObject = findDiffedObject(rightTree, diff.path);
    return {
        message: getDiffMessage(diff, leftDiffObject, rightDiffObject),
        path: getDiffPath(leftTree, diff.path),
    };
}
/**
 * Turns a value into a HTML string to be processed as HTML AST. If the value is
 * already a string, it is returned as is. Otherwise it is passed to lit-html
 * and rendered to an empty container.
 *
 * @param value the value to string
 * @returns the html as string
 */
function asHTMLString(value) {
    if (typeof value === 'string') {
        return sanitizeHtmlString(value);
    }
    const container = document.createElement('div');
    // TODO: from lit-html 0.11 onwards we can render directly, no need to wrap in a template
    if (value instanceof TemplateResult) {
        render(value, container);
    }
    else {
        render(html `${value}`, container);
    }
    return sanitizeHtmlString(container.innerHTML);
}
function getAST(value, config = {}) {
    const ast = parseFragment(asHTMLString(value));
    normalizeAST(ast, config.ignoredTags);
    return ast;
}
/**
 * Parses two HTML trees, and generates the semantic difference between the two trees.
 * The HTML is diffed semantically, not literally. This means that changes in attribute
 * and class order and whitespace/newlines are ignored. Also, script and style
 * tags ignored.
 *
 * @param leftHTML the left HTML tree
 * @param rightHTML the right HTML tree
 * @returns the diff result, or undefined if no diffs were found
 */
function getDOMDiff(leftHTML, rightHTML, config = {}) {
    const leftTree = getAST(leftHTML);
    const rightTree = getAST(rightHTML);
    normalizeAST(leftTree, config.ignoredTags);
    normalizeAST(rightTree, config.ignoredTags);
    // parentNode causes a circular reference, so ignore them.
    const ignore = (path, key) => key === 'parentNode';
    const diffs = deepDiff(leftTree, rightTree, ignore);
    if (!diffs || !diffs.length) {
        return undefined;
    }
    return createDiffResult(leftTree, rightTree, diffs[0]);
}
/**
 * Asserts that the two given HTML trees are semantically equal. See getDiff().
 * Throws a human readable error when there is a difference.
 *
 * @param leftHTML the left HTML tree
 * @param rightHTML the right HTML tree
 */
function assertDOMEquals(leftHTML, rightHTML, config = {}) {
    const result = getDOMDiff(leftHTML, rightHTML, config);
    if (result) {
        throw new Error(`${result.message}, at path: ${result.path}`);
    }
}
/** See assertDOMEquals() */
function expectDOMEquals(leftHTML, rightHTML, config = {}) {
    assertDOMEquals(leftHTML, rightHTML, config);
}

const waitForRender = () => new Promise((resolve) => {
    // RAF executes before render
    requestAnimationFrame(() => {
        // A timeout of 0 executes in the next task, after render
        setTimeout(resolve);
    });
});

const isWebComponent = (node) => node.localName && node.localName.includes('-');
class HTMLTestFixture extends HTMLElement {
    constructor() {
        super(...arguments);
        this.mode = 'html';
    }
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
            this._component = this.querySelector(this.componentName);
            if (!this._component) {
                throw new Error(`Test fixture did not render a web component named ${this.componentName}`);
            }
        }
        else {
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
            const component = this.component;
            // if the component has a shadow root, use that for comparison
            return component.shadowRoot || component;
        }
        return this;
    }
    assertDOMEquals(value) {
        assertDOMEquals(this.compareRoot.innerHTML, value, this.diffConfig);
    }
    expectDOMEquals(value) {
        this.assertDOMEquals(value);
    }
}
customElements.define('html-test-fixture', HTMLTestFixture);

function toLitTemplate(value) {
    if (typeof value === 'string') {
        return html `${unsafeHTML(value)}`;
    }
    if (value instanceof TemplateResult$1) {
        return value;
    }
    // TODO: we can render anything directly without wrapping in 0.11 onwards
    return html `${value}`;
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
function testFixtureSync(value) {
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
async function testFixture(value) {
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
async function componentFixture(value, config = {}) {
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
function componentFixtureSync(value, config = {}) {
    const fixture = testFixtureSync(value);
    fixture.mode = 'web-component';
    fixture.componentName = config.componentName;
    fixture.diffConfig = config;
    return fixture;
}

export { getAST, getDOMDiff, assertDOMEquals, expectDOMEquals, HTMLTestFixture, testFixtureSync, testFixture, componentFixture, componentFixtureSync };
