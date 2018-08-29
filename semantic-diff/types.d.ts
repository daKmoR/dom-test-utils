import { Attribute, DefaultTreeNode, DefaultTreeElement, DefaultTreeParentNode, DefaultTreeDocumentFragment, DefaultTreeTextNode, DefaultTreeCommentNode } from 'bundled-parse5';
export declare type ASTNode = DefaultTreeNode | DefaultTreeParentNode;
export declare type DiffedObject = ASTNode | Attribute;
export declare const isNode: (arg: any) => arg is DefaultTreeNode;
export declare const isElement: (arg: any) => arg is DefaultTreeElement;
export declare const isParentNode: (arg: any) => arg is DefaultTreeParentNode;
export declare const isTextNode: (arg: any) => arg is DefaultTreeTextNode;
export declare const isCommentNode: (arg: any) => arg is DefaultTreeCommentNode;
export declare const isDocumentFragment: (arg: any) => arg is DefaultTreeDocumentFragment;
