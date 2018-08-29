import { DiffedObject, ASTNode } from './types';
export declare function findDiffedObject(root: ASTNode | ASTNode[], path: string[]): import("parse5").DefaultTreeNode | import("parse5").DefaultTreeParentNode | import("parse5").Attribute | DiffedObject[];
