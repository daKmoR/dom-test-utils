import {
  Attribute, DefaultTreeNode, DefaultTreeElement, DefaultTreeParentNode,
  DefaultTreeDocumentFragment, DefaultTreeTextNode, DefaultTreeCommentNode
} from 'parse5-es-module';

export type ASTNode = DefaultTreeNode | DefaultTreeParentNode;
export type DiffedObject = ASTNode | Attribute;

// Typings for parse5 contains errors, and the inheritence tree is funky.
export const isNode = (arg: any): arg is DefaultTreeNode => arg && 'nodeName' in arg;
export const isElement = (arg: any): arg is DefaultTreeElement => arg && 'tagName' in arg;
export const isParentNode = (arg: any): arg is DefaultTreeParentNode => arg && 'childNodes' in arg;
export const isTextNode = (arg: any): arg is DefaultTreeTextNode => arg && arg.nodeName === '#text';
export const isCommentNode = (arg: any): arg is DefaultTreeCommentNode => arg && arg.nodeName === '#comment';
export const isDocumentFragment = (arg: any): arg is DefaultTreeDocumentFragment => arg && arg.nodeName === '#document-fragment';
