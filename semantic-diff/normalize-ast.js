import { isElement, isParentNode, isTextNode } from './types';
const filteredNodeNames = ['style', 'script', '#comment'];
const filterNode = (node) => !filteredNodeNames.includes(node.nodeName);
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
export function normalizeAST(node) {
    if (isElement(node)) {
        node.attrs = sortAttributes(node.attrs);
    }
    if (isParentNode(node)) {
        normalizeWhitespace(node.childNodes);
        node.childNodes.forEach(normalizeAST);
        node.childNodes = node.childNodes.filter(filterNode);
    }
}
//# sourceMappingURL=normalize-ast.js.map