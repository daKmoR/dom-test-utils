/// <reference types="deep-diff" />
import { Attribute } from 'parse5-es-module';
import { DiffedObject } from './types';
declare type Diff = deepDiff.IDiff;
export declare const isAttribute: (arg: any) => arg is Attribute;
/**
 * Generates a human understandable message for a HTML diff.
 *
 * @param diff The diff
 * @param lhs The left hand side diffed object. Can be a HTML ASTNode or an Attribute.
 * @param rhs The left hand side diffed object. Can be a HTML ASTNode or an Attribute.
 *
 * @returns the message
 */
export declare function getDiffMessage(diff: Diff, lhs: DiffedObject | DiffedObject[], rhs: DiffedObject | DiffedObject[]): string;
export {};
