import { isParentNode, isElement } from './types';
export function findDiffedObject(root, path) {
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
//# sourceMappingURL=find-diffed-object.js.map