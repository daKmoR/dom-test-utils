import { Attribute } from '@bundled-es-modules/parse5';
import { ASTNode, DiffedObject, isElement, isTextNode } from './types';

type Diff = deepDiff.IDiff;

export const isAttribute = (arg: any): arg is Attribute => arg && 'name' in arg && 'value' in arg;
const isArray = Array.isArray;

function identifier(arg: ASTNode | Attribute): any {
  if (isTextNode(arg)) {
    return `text "${arg.value}"`
  }

  if (isElement(arg)) {
    return `tag <${arg.tagName}>`
  }

  if (isAttribute(arg)) {
    return arg.value
      ? `attribute [${arg.name}="${arg.value}"]`
      : `attribute [${arg.name}]`;
  }

  throw new Error(`Unknown arg: ${arg}`);
}

type ArrayDiff = Diff & { kind: 'A', item: Diff, index: number };

/** Asserts that the diff is an array diff, returns type assertions to remove optional props.  */
function isArrayDiff(d: Diff): d is ArrayDiff {
  return d.kind === 'A' && !!d.item && typeof d.index === 'number';
}

const messageTemplates: { [key: string]: (diff: Diff, lhs: DiffedObject, rhs: DiffedObject) => string } = {
  // New diff
  N: (diff, lhs, rhs) => `${identifier(rhs)} has been added`,
  // Edit diff
  E: (diff, lhs, rhs) => `${identifier(lhs)} was changed to ${identifier(rhs)}`,
  // Delete diff
  D: (diff, lhs, rhs) => `${identifier(lhs)} has been removed`,
}

/**
 * Generates a human understandable message for a HTML diff.
 *
 * @param diff The diff
 * @param lhs The left hand side diffed object. Can be a HTML ASTNode or an Attribute.
 * @param rhs The left hand side diffed object. Can be a HTML ASTNode or an Attribute.
 *
 * @returns the message
 */
export function getDiffMessage(diff: Diff, lhs: DiffedObject | DiffedObject[], rhs: DiffedObject | DiffedObject[]): string {
  // Array diff
  if (isArray(lhs) || isArray(rhs)) {
    if (!isArrayDiff(diff) || !isArray(lhs) || !isArray(rhs)) {
      throw new Error('Not all arguments are array diffs');
    }

    return getDiffMessage(diff.item, (lhs as any)[diff.index], (rhs as any)[diff.index])
  }

  // Non-array diff
  if (diff.kind in messageTemplates) {
    return messageTemplates[diff.kind](diff, lhs, rhs);
  }

  throw new Error(`Unknown diff kind: ${diff.kind}`);
}