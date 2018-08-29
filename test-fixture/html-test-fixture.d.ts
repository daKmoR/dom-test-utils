import { DiffConfig } from '../semantic-diff/semantic-diff';
export declare class HTMLTestFixture extends HTMLElement {
    mode: 'html' | 'web-component';
    diffConfig?: DiffConfig;
    componentName?: string;
    _component?: HTMLElement;
    teardown(): void;
    /**
     * Finds the web component set up by this test fixture. If a component name was specified, that is used.
     * Otherwise it returns the first web component it finds. Throws if none is found.
     */
    readonly component: HTMLElement;
    /**
     * Returns the root element used for comparing / diffing
     */
    readonly compareRoot: HTMLElement | ShadowRoot;
    assertDOMEquals(value: unknown): void;
    expectDOMEquals(value: unknown): void;
}
