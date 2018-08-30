import { ASTNode } from './types';
export interface DiffConfig {
    ignoredTags?: string[];
}
interface DiffResult {
    message: string;
    path: string;
}
export declare function getAST(value: any, config?: DiffConfig): ASTNode;
/**
 * Parses two HTML trees, and generates the semantic difference between the two trees.
 * The HTML is diffed semantically, not literally. This means that changes in attribute
 * and class order and whitespace/newlines are ignored. Also, script and style
 * tags ignored.
 *
 * @param leftHTML the left HTML tree
 * @param rightHTML the right HTML tree
 * @returns the diff result, or undefined if no diffs were found
 */
export declare function getDOMDiff(leftHTML: any, rightHTML: any, config?: DiffConfig): DiffResult | undefined;
/**
 * Asserts that the two given HTML trees are semantically equal. See getDiff().
 * Throws a human readable error when there is a difference.
 *
 * @param leftHTML the left HTML tree
 * @param rightHTML the right HTML tree
 */
export declare function assertDOMEquals(leftHTML: unknown, rightHTML: unknown, config?: DiffConfig): void;
/** See assertDOMEquals() */
export declare function expectDOMEquals(leftHTML: unknown, rightHTML: unknown, config?: DiffConfig): void;
export {};
