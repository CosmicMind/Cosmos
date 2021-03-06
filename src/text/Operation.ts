/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2022, Daniel Jonathan <daniel at cosmicmind dot org>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @module Operation
 */

import { Attributes } from './Attributes'

export type DeltaInline = string

/**
 * Defines the `block` element symbol.
 */
export const BlockSymbol = '\n'

/**
 * The type of `block` that will render.
 */
export type BlockType =
  'paragraph' |
  'blockquote' |
  'unordered-list' |
  'unordered' |
  'ordered-list' |
  'ordered'

/**
 * The type of `block` that is rendered.
 */
export enum Block {
  paragraph = 'paragraph',
  blockquote = 'blockquote',
  unorderedList = 'unordered-list',
  unordered = 'unordered',
  orderedList = 'ordered-list',
  ordered = 'ordered',
}

export interface DeltaBlock {
  block: BlockType
}

/**
 * The type of values that a `Delta.insert`
 * property may store.
 */
export type DeltaType = DeltaInline | DeltaBlock

/**
 * Defines an `Delta`.
 */
export interface Delta {
  readonly insert: DeltaType
  readonly length: number
  readonly attributes: Partial<Attributes>
}

/**
 * Creates an `Delta`.
 */
export function createDelta(insert: DeltaType, attributes: Partial<Attributes> = {}): Delta {
  return 'string' === typeof insert ?
    createDeltaText(insert, attributes) :
    createDeltaBlock(insert.block as BlockType, attributes)
}

/**
 * Creates an `Delta` for `text` specifically.
 */
export function createDeltaText(insert: DeltaInline, attributes: Partial<Attributes> = {}): Delta {
  return {
    insert,
    length: insert.length,
    attributes,
  }
}

/**
 * Creates an `Delta` for `blocks` specifically.
 */
export function createDeltaBlock(block: BlockType, attributes: Partial<Attributes> = {}): Delta {
  return {
    insert: { block },
    length: 1,
    attributes,
  }
}

/**
 * Defines a `RetainOperation`.
 */
export interface RetainOperation {
  readonly retain: number
  readonly attributes?: Attributes
}

/**
 * Creates a `RetainOperation`.
 */
export function createRetainOperation(retain: number, attributes?: Attributes): RetainOperation {
  return {
    retain,
    attributes,
  }
}

/**
 * Defines a `DeleteOperation`.
 */
export interface DeleteOperation {
  readonly delete: number
}

/**
 * Creates a `DeleteOperation`.
 */
export function createDeleteOperation(length: number): DeleteOperation {
  return {
    delete: length,
  }
}

/**
 * Defines a `SwapOperation`.
 */
export interface SwapOperation {
  readonly swap: DeltaType
  readonly length: number
  readonly attributes?: Attributes
}

/**
 * Creates a `SwapOperation`.
 */
export function createSwapOperation(swap: DeltaType, attributes?: Attributes): SwapOperation {
  return {
    swap,
    length: 'string' === typeof swap ? swap.length : 1,
    attributes,
  }
}

/**
 * An `Operation` is a union of `Delta`, `RetainOperation`,
 * `DeleteOperation`, and `SwapOperation` types.
 */
export type Operation = Delta | RetainOperation | DeleteOperation | SwapOperation
