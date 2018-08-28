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
export declare function testFixtureSync(value: unknown): HTMLElement;
/**
 * Sets up a test fixtures, and waits for one render cycle to complete. Use this
 * if dependent on async rendering. See testFixtureSync() for more.
 *
 * @param value the value to render.
 * @returns a promise that resolves with the test fixture after one render cycle.
 */
export declare function testFixture(value: unknown): Promise<HTMLElement>;
