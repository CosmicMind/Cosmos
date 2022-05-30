/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2022, Daniel Jonathan <daniel at cosmicverse dot com>
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

/**
 * Defines the `block` element symbol.
 */
export const BlockSymbol = '\n'

/**
 * The type of `block` that is renderable.
 */
export type BlockType = 'paragraph' |
                        'blockquote' |
                        'unordered-list' |
                        'unordered' |
                        'ordered-list' |
                        'ordered'

/**
 * The type of `block` that is rendered.
 */
export const Block = {
  paragraph: 'paragraph' as BlockType,
  blockquote: 'blockquote' as BlockType,
  unorderedList: 'unordered-list' as BlockType,
  unordered: 'unordered' as BlockType,
  orderedList: 'ordered-list' as BlockType,
  ordered: 'ordered' as BlockType,
}

/**
 * The type of values that an `Delta.insert`
 * property may store.
 */
export type DeltaType = string | { block: BlockType }

/**
 * Defines an `Delta`.
 * @property {DeltaType} insert
 * @property {number} length
 * @property {Attributes} attributes
 */
export interface Delta {
  readonly insert: DeltaType
  readonly length: number
  readonly attributes: Attributes
}

/**
 * Creates an `Delta`.
 * @param {DeltaType} insert
 * @param {Attributes} attributes
 * @returns {Delta}
 */
export function createDelta(insert: DeltaType, attributes: Attributes = {}): Delta {
  return 'string' === typeof insert ?
    createDeltaText(insert, attributes) :
    createDeltaBlock(insert.block as BlockType, attributes)
}

/**
 * Creates an `Delta` for `text` specifically.
 * @param {DeltaType} text
 * @param {Attributes} attributes
 * @returns {Delta}
 */
export function createDeltaText(text: string, attributes: Attributes = {}): Delta {
  return {
    insert: text,
    length: text.length,
    attributes,
  }
}

/**
 * Creates an `Delta` for `blocks` specifically.
 * @param {BlockType} block
 * @param {Attributes} attributes
 * @returns {Delta}
 */
export function createDeltaBlock(block: BlockType, attributes: Attributes = {}): Delta {
  return {
    insert: { block },
    length: 1,
    attributes,
  }
}

/**
 * Defines a `RetainOperation`.
 * @property {number} retain
 * @property {Optional<Attributes>}
 */
export interface RetainOperation {
  readonly retain: number
  readonly attributes?: Attributes
}

/**
 * Creates a `RetainOperation`.
 * @param {number} retain
 * @param {Optional<Attributes>} attributes
 * @returns {RetainOperation}
 */
export function createRetainOperation(retain: number, attributes?: Attributes): RetainOperation {
  return {
    retain,
    attributes,
  }
}

/**
 * Defines a `DeleteOperation`.
 * @property {number} delete
 */
export interface DeleteOperation {
  readonly delete: number
}

/**
 * Creates a `DeleteOperation`.
 * @param {number} length
 * @returns {DeleteOperation}
 */
export function createDeleteOperation(length: number): DeleteOperation {
  return {
    delete: length,
  }
}

/**
 * Defines a `SwapOperation`.
 * @property {DeltaType} swap
 * @property {number} length
 * @property {Optional<Attributes>}
 */
export interface SwapOperation {
  readonly swap: DeltaType
  readonly length: number
  readonly attributes?: Attributes
}

/**
 * Creates a `SwapOperation`.
 * @param {DeltaType} swap
 * @param {Optional<Attributes>} attributes
 * @returns {RetainOperation}
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
