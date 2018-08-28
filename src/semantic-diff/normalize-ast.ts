import { DefaultTreeNode, Attribute } from '@bundled-es-modules/parse5';
import { ASTNode, isElement, isParentNode, isTextNode, isCommentNode } from './types';

const filteredNodeNames = ['style', 'script', '#comment'];
const filterNode = (node: DefaultTreeNode) => !filteredNodeNames.includes(node.nodeName);

function sortAttributes(attrs: Attribute[]) {
  return attrs
    // Sort attributes
    .map((attr: Attribute) => {
      if (attr.name === 'class') {
        attr.value = attr.value.trim().split(/\s+/).sort().join(' ')
      }

      return attr;
    })
    // Sort classes
    .sort((attrA: Attribute, attrB: Attribute) => {
      const a = attrA.name.toLowerCase();
      const b = attrB.name.toLowerCase();

      if (a < b) {
        return -1
      }

      if (a > b) {
        return 1
      }

      return 0;
    });
}

function normalizeWhitespace(nodes: DefaultTreeNode[]) {
  const lastIndex = nodes.length - 1;

  nodes.forEach((node, i: number) => {
    if (isTextNode(node)) {
      if (i === 0) {
        node.value = node.value.replace(/^\s+/, '')
      }

      if (i === lastIndex) {
        node.value = node.value.replace(/\s+$/, '')
      }
    }
  });
}

export function normalizeAST(node: ASTNode) {
  if (isElement(node)) {
    node.attrs = sortAttributes(node.attrs)
  }

  if (isParentNode(node)) {
    normalizeWhitespace(node.childNodes)
    node.childNodes.forEach(normalizeAST);
    node.childNodes = node.childNodes.filter(filterNode);
  }
}
