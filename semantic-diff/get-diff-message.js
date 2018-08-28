import { isElement, isTextNode } from './types';
export const isAttribute = (arg) => arg && 'name' in arg && 'value' in arg;
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
export function getDiffMessage(diff, lhs, rhs) {
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
//# sourceMappingURL=get-diff-message.js.map