import { isParentNode, isElement } from './types';
function getNodeName(node) {
    if (!isElement(node)) {
        return;
    }
    const idAttr = node.attrs && node.attrs.find((attr) => attr.name === 'id');
    const id = idAttr ? `#${idAttr.value}` : '';
    return `${node.nodeName}${id}`;
}
export function getDiffPath(root, path) {
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
//# sourceMappingURL=get-diff-path.js.map