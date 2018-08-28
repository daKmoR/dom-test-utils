import { TemplateResult } from 'lit-html/lit-html';
import { render, html } from 'lit-html/lib/lit-extended';
import { unsafeHTML } from 'lit-html/lib/unsafe-html';
function toLitTemplate(value) {
    if (typeof value === 'string') {
        return html `${unsafeHTML(value)}`;
    }
    if (value instanceof TemplateResult) {
        return value;
    }
    // TODO: we can render anything directly without wrapping in 0.11 onwards
    return html `${value}`;
}
export function testFixture(value) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const template = toLitTemplate(value);
    render(template, container);
    return {
        container,
        teardown: () => document.body.removeChild(container)
    };
}
//# sourceMappingURL=test-fixture.js.map