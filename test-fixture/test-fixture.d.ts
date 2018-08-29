import { HTMLTestFixture } from './html-test-fixture';
import { DiffConfig } from '../semantic-diff/semantic-diff';
export { HTMLTestFixture };
export interface TestFixtureConfig extends DiffConfig {
    componentName?: string;
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
export declare function testFixtureSync(value: unknown): HTMLTestFixture;
/**
 * Sets up a test fixtures, and waits for one render cycle to complete. Use this
 * if dependent on async rendering. See testFixtureSync() for more.
 *
 * @param value the value to render.
 * @returns a promise that resolves with the test fixture after one render cycle.
 */
export declare function testFixture(value: unknown): Promise<HTMLTestFixture>;
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
export declare function componentFixture(value: unknown, config?: TestFixtureConfig): Promise<HTMLTestFixture>;
/**
 * Same as componentFixture(), but without waiting for a render.
 *
 * @param value the value to render.
 * @param componentName the name of the component. Optional, by default the first component found is used
 * @returns the test fixture.
 */
export declare function componentFixtureSync(value: unknown, config?: TestFixtureConfig): HTMLTestFixture;
