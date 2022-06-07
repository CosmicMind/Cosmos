/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2022, Daniel Jonathan <daniel at cosmicverse dot org>
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
 * @module Transaction
 */

import {
  clone,
  assert,
  equals,
  Optional,
  Nullable,
  guardFor,
} from '@cosmicverse/foundation'

import { glyphs } from './Glyphs'

import {
  XSelection,
  isCollapsedX,
  fromX,
  distanceX,
  lengthX,
} from './Selection'

import {
  Operation,
  Delta,
  createDelta,
  createDeltaText,
  createDeltaBlock,
  createRetainOperation,
  createDeleteOperation,
  createSwapOperation,
  Block,
  BlockType,
  DeltaType,
  DeltaBlock,
} from './Operation'

import { Text } from './Text'
import { Attributes } from './Attributes'

/**
 * A `Transaction` represents a proposed set of operations that
 * will be compared against the current `Text.delta` values.
 */
export class Transaction {
  /**
   * Internal `cursor` reference.
   * @type {number}
   */
  #cursor: number

  /**
   * The position that the `Transaction`
   * will execute the current `Operation`.
   * @type {number}
   */
  get cursor(): number {
    return this.#cursor
  }

  /**
   * A reference to the `Text` instance.
   */
  readonly text: Text

  /**
   * A reference to the `XSelection` instance.
   * @type {XSelection}
   */
  get selection(): XSelection {
    return this.text.selection
  }

  /**
   * A reference to the `Attributes` instance.
   * @type {Attributes}
   */
  get attributes(): Attributes {
    return this.text.attributes
  }

  /**
   * A reference to the `Delta` instance.
   * @type {Delta[]}
   */
  get delta(): Delta[] {
    return this.text.delta
  }

  /**
   * Holds the `Operation` instances.
   * @type {Operation[]}
   */
  readonly operations: Operation[]

  /**
   * Internal reference to `hasBlockAtFront`.
   * @type {boolean}
   */
  #hasBlockAtFront: boolean

  /**
   * A boolean flag that indicates if the
   * `ensureBlockAtFront` method has been
   * used.
   * @type {boolean}
   */
  get hasBlockAtFront(): boolean {
    return this.#hasBlockAtFront
  }

  /**
   * Class constructor.
   * @param {Text} t
   * @param {Operation[]} ops @default []
   */
  constructor(t: Text, ops: Operation[] = []) {
    this.text = t
    this.operations = ops

    /**
     * The initial position is always the `from.x` value
     * for the given `cursor`.
     */
    this.#cursor = fromX(this.selection).x
    this.#hasBlockAtFront = false
  }

  /**
   * Pushes new `Operation` instances at the `end`
   * of the `Operation` list.
   * @param {...Operation} ops
   */
  push(...ops: Operation[]): void {
    this.operations.push(...ops)
  }

  /**
   * Pushes new `Operation` instances at the `start`
   * of the `Operation` list.
   * @param {...Operation} ops
   */
  unshift(...ops: Operation[]): void {
    this.operations.unshift(...ops)
  }

  /**
   * Inserts a new `Delta` instance.
   * @param {string} content
   * @param {Optional<Attributes>} attributes
   */
  insert(content: string, attributes?: Attributes): void {
    this.insertAt(this.#cursor, content, attributes)
  }

  /**
   * Inserts a new `Delta` instance `at` the given position.
   * @param {number} at
   * @param {string} content
   * @param {Optional<Attributes>} attributes
   */
  insertAt(at: number, content: string, attributes?: Attributes): void {
    if (!this.#deleteIfNeeded()) {
      this.#retainIfNeeded(at)
    }

    const op = createDelta(content, clone(attributes))
    this.#cursor += op.length
    this.push(op)
  }

  /**
   * Inserts an `DeltaBlock` for the given `BlockType`.
   * @param {BlockType} block @default Block.paragraph
   * @param {Optional<Attributes>} attributes
   */
  block(block: BlockType = Block.paragraph, attributes?: Attributes): void {
    this.blockAt(this.#cursor, block, attributes)
  }

  /**
   * Inserts an `DeltaBlock` for the given `BlockType`,
   * `at` the given position.
   * @param {number} at
   * @param {BlockType} block @default Block.paragraph
   * @param {Optional<Attributes>} attributes
   */
  blockAt(at: number, block: BlockType = Block.paragraph, attributes?: Attributes): void {
    if (!this.#deleteIfNeeded()) {
      this.#retainIfNeeded(at)
    }

    ++this.#cursor
    this.push(createDeltaBlock(block, clone(attributes)))
  }

  /**
   * Converts the `BlockType` at the `cursor` position.
   * @param {BlockType} block
   * @param {Optional<Attributes>} attributes
   */
  convert(block: BlockType, attributes?: Attributes): void {
    this.convertAt(this.#cursor, block, attributes)
  }

  /**
   * Converts the `BlockType` `at` the given position.
   * @param {number} at
   * @param {BlockType} block
   * @param {Optional<Attributes>} attributes
   */
  convertAt(at: number, block: BlockType, attributes?: Attributes): void {
    if (!this.#deleteIfNeeded()) {
      this.#retainIfNeeded(at)
    }

    ++this.#cursor
    this.push(createSwapOperation({ block }, clone(attributes)))
  }

  /**
   * A boolean check that determines if a `Block`
   * will be added, up to the point of the current
   * operations set.
   */
  get willInsertBlockAtFront(): boolean {
    const d = simulate(this.operations, this.delta)[0]
    return 'undefined' === typeof d || 'string' === typeof d.insert
  }

  /**
   * If the location before the current `cursor` position is a `BlockType`
   * and different from the given `block` instance, then it converts
   * the previous `BlockType` and doesn't insert a new one.
   * @param {BlockType} block
   * @returns {boolean}
   */
  convertIfNeeded(block: BlockType): boolean {
    if (0 < this.#cursor) {
      const at = this.#cursor - 1
      const insert = this.text.fetchAt(at)
      if (guardFor<DeltaBlock>(insert, 'block') && block !== insert.block) {
        this.convertAt(at, block)
        return true
      }
    }
    this.block(block)
    return false
  }


  /**
   * Replaces the `string` at the `cursor` position.
   * @param {string} content
   * @param {Optional<Attributes>} attributes
   */
  replace(content: string, attributes?: Attributes): void {
    this.replaceAt(this.#cursor, content, attributes)
  }

  /**
   * Replaces the `string` `at` the given position.
   * @param {number} at
   * @param {string} content
   * @param {Optional<Attributes>} attributes
   */
  replaceAt(at: number, content: string, attributes?: Attributes): void {
    if (!this.#deleteIfNeeded()) {
      this.#retainIfNeeded(at)
    }

    this.#cursor += content.length
    this.push(createSwapOperation(content, clone(attributes)))
  }

  /**
   * Formats the `Selection` of characters at the `cursor` position.
   * @param {Attributes} attributes
   */
  format(attributes: Attributes): void {
    this.formatAt(this.#cursor, distanceX(this.selection), attributes)
  }

  /**
   * Formats the `length` of characters `at` the given position.
   * @param {number} at
   * @param {number} length
   * @param {Attributes} attributes
   */
  formatAt(at: number, length: number, attributes: Attributes): void {
    this.#retainIfNeeded(at)
    this.push(createRetainOperation(length, attributes))
    Object.assign(this.attributes, attributes)
  }

  /**
   * Deletes the `selection` of characters if a selection exists, or deletes the
   * length of `glyphs`.
   * @param {XSelection | number} length @default 1
   */
  delete(length: XSelection | number = 1): void {
    if ('number' === typeof length) {
      let len = length

      assert(-1 < length, `Cannot delete length {${len}}. The value must be greater than or equal '0'`)

      if (!this.#deleteIfNeeded()) {
        /**
         * Initially we look if the `Selection` has collapsed.
         * If so, then we subtract the current cursor by `1`,
         * in order to delete a given position to the left of
         * the cursor. We utilize the `fetchAt` method in order
         * to accommodate an issue if the position to the left
         * has a string length greater than `1` and the cursor
         * will fall into that range. If the position element is
         * a `Block`, we can `delete` by `1` position safely.
         */
        if (1 === len) {
          const d = this.text.fetchAt(this.#cursor - 1)
          if ('string' === typeof d) {
            len = d.length
          }
        }

        if (0 < this.#cursor) {
          this.deleteAt(this.#cursor - len, len)
        }
      }
    }
    else {
      this.delete(lengthX(length))
    }
  }

  /**
   * Deletes the `length` of glyphs starting `at` the given position.
   * @param {number} at
   * @param {number} length
   */
  deleteAt(at: number, length: number): void {
    this.#retainIfNeeded(at)

    if (length) {
      this.push(createDeleteOperation(length))
    }
  }

  /**
   * Clears the entire `Delta` array.
   */
  clear(): void {
    this.deleteAt(0, this.text.length)
  }

  retain(at: number): void {
    assert(0 <= at, `Cannot retain {${at}} number.`)

    this.#cursor += at

    /**
     * Even though a valid value of `0` is retained,
     * we don't need to create the operation, as the
     * position will already be in the correct place.
     */
    if (0 < at) {
      this.push(createRetainOperation(at))
    }
  }

  /**
   * Inserts a `Block.paragraph` operation if needed.
   * @returns {boolean}
   */
  ensureBlockAtFront(): boolean {
    this.#hasBlockAtFront = true

    if (this.willInsertBlockAtFront) {
      ++this.#cursor
      this.unshift(createDeltaBlock(Block.paragraph))
      return true
    }

    return false
  }

  /**
   * Sets the `cursor` to the given `at` value.
   * @param {number} at
   */
  #retainIfNeeded(at: number): void {
    if (at <= this.#cursor) {
      this.#cursor = 0
    }

    this.retain(at - this.#cursor)
  }

  /**
   * Deletes the selection if it's not collapsed.
   * The `boolean` result indicates whether there
   * has been a selection that was deleted.
   * @returns {boolean}
   */
  #deleteIfNeeded(): boolean {
    if (isCollapsedX(this.selection)) {
      return false
    }

    this.deleteAt(this.#cursor, distanceX(this.selection))

    return true
  }
}

/**
 * Creates a new `Transaction` instance.
 * @param {Text} t
 * @param {Operation[]} [ops=[]]
 * @returns {Transaction}
 */
export function createTransaction(t: Text, ops: Operation[] = []): Transaction {
  return new Transaction(t, ops)
}

/**
 * Minimizes the number of delta values, based on similar delta instances
 * being adjacent to each other.
 *
 * @param {Delta[]} delta
 * @returns {Delta[]}
 */
export function minimizeDelta(delta: Delta[]): Delta[] {
  let i = 1
  let l = delta.length
  let prev: Optional<Delta> = delta[0]
  let next: Optional<Delta>

  while (i < l) {
    next = delta[i]

    if ('string' === typeof prev.insert &&
        'string' === typeof next.insert &&
        equals(prev.attributes, next.attributes)) {
      prev = createDeltaText(prev.insert + next.insert, prev.attributes)
      delta.splice(i - 1, 1, prev)
      delta.splice(i, 1)
      --l
      continue
    }

    prev = next
    ++i
  }

  return delta
}

/**
 * Selects the `string` or `Block` at the given position.
 * The `fetchAt` method accommodates the issue if a
 * position falls within a string range where the character
 * has a length of greater than `1`, such as emoji characters '👨‍👨‍👧‍👧'.
 *
 * @param {number} at
 * @param {Delta[]} delta
 * @returns {Nullable<DeltaType>}
 */
export function fetchAt(at: number, delta: Delta[]): Nullable<DeltaType> {
  let pos = 0

  for (const d of delta) {
    /**
     * In this case we can extract the character at the given value.
     */
    if ('string' === typeof d.insert) {
      let l = d.insert.length

      /**
       * Initial consider that the string length of the `Operation`
       * may be less than the `at` value, plus the `p` position.
       * We can skip ahead in this case.
       */
      if (pos + l < at) {
        pos += l
        continue
      }

      /**
       * Get the `Glyphs` of the `insert` string, as we want
       * to get the value `at` that may be a character, such as
       * '👨‍👨‍👧‍👧' that has a length greater than 1.
       */
      const g = glyphs(d.insert)

      for (const t of g) {
        l = t.length

        /**
         * We compensate for the single `-1` value, since the
         * `l` value will have a `+1` as it includes length, and
         * we need it to be adjusted for `p` position, which is
         * always less `1`.
         */
        if (pos + l - 1 === at) {
          return t
        }

        pos += l
      }
    }

    /**
     * This handles the case where we hit a `BlockType`
     * and, blocks only add a value of `+1`.
     */
    else {
      if (pos === at) {
        return d.insert
      }

      ++pos
    }
  }

  return null
}

/**
 * Retrieves the `Delta` at the given position.
 *
 * @param {number} at
 * @param {Delta[]} delta
 * @returns {Nullable<Delta>}
 */
export function deltaAt(at: number, delta: Delta[]): Nullable<Delta> {
  let pos = 0
  let l = 0

  for (const d of delta) {
    l = d.length

    if (pos + l > at) {
      return d
    }

    pos += l
  }

  return null
}

/**
 * Processes the given `Operation` list and `Delta` list,
 * and derives a new `Delta` list result.
 *
 * @param {Operation[]} ops
 * @param {Delta[]} delta
 * @param {Optional<Transaction>} tr
 * @returns {Delta[]}
 */
export function processOperations(ops: Operation[], delta: Delta[]): Delta[] {
  let cursor = 0
  let i = 0 /// `Delta` iterator position.
  let d: Optional<Delta> /// `Delta`.
  let dPos = 0 /// `Delta.insert` position.
  let dLength = 0
  let q = 0 /// `Operation` iterator position.
  let opLength = 0
  let op: Optional<Operation> = ops[q]

  /// The initial position of the cursor when formatting.
  let anchor = 0

  while ('undefined' !== typeof op) {
    /**
     * If the operation is a `retain`, then we only
     * need to advance the `cursor` to the `op.retain`
     * value, and advance the operation iterator.
     */
    if ('retain' in op) {
      /**
       * Formatting is changing here. Capture the new
       * formatting options that have been set in the
       * `op.attributes` property.
       */
      if ('undefined' !== typeof op.attributes) {
        if (0 === anchor) {
          anchor = cursor
          cursor += op.retain
        }

        d = delta[i]

        if ('undefined' === typeof d) {
          ++q
          anchor = 0
          op = ops[q]
          continue
        }

        dLength = d.length

        if (anchor >= dPos + dLength) {
          dPos += dLength
          ++i
        }
        else if (anchor > dPos) {
          if ('string' === typeof d.insert) {
            const split = anchor - dPos
            delta.splice(i, 1, createDelta(d.insert.slice(0, split), d.attributes))
            delta.splice(i + 1, 0, createDelta(d.insert.slice(split), d.attributes))
          }

          ++i
          dPos = anchor
        }
        else if (cursor >= dPos + dLength) {
          delta.splice(i, 1, createDelta(d.insert, Object.assign(clone(d.attributes), op.attributes)))
          dPos += dLength
          ++i
        }
        else if (cursor > dPos) {
          if ('string' === typeof d.insert) {
            const split = cursor - dPos
            delta.splice(i, 1, createDelta(d.insert.slice(0, split), Object.assign(clone(d.attributes), op.attributes)))
            delta.splice(i + 1, 0, createDelta(d.insert.slice(split), d.attributes))

            dPos = cursor
          }

          ++q
          ++i
          anchor = 0
        }
        else {
          ++q
          ++i
          anchor = 0
        }
      }
      else {
        cursor += op.retain
        ++q
        anchor = 0
      }
    }

    /**
     * If the operation is a `swap`, then we want
     * to insert the array at the current `i` position.
     */
    else if ('swap' in op) {
      op = createDelta(op.swap, op.attributes)
      opLength = op.length

      /**
       * At this point, if the `Delta` is `undefined`,
       * we must be working with an empty `Delta` list.
       * This initiates the list, and begins the
       * `Transaction` processing.
       */
      d = delta[i]
      if ('undefined' === typeof d) {
        delta.push(op)
        ++q
        ++i
        dPos = opLength
        cursor = dPos
        op = ops[q]
        continue
      }

      dLength = d.length

      /**
       * In this case, the position within the `Delta` list
       * and the addition of the `Delta` length are less or
       * equal to the cursor, so we can move along in the
       * `Delta` list, and be sure that we are not losing
       * any information.
       */
      if (cursor >= dPos + dLength) {
        dPos += dLength
        ++i
      }

      /**
       * When the `cursor` is equal to `dPos`, we are inserting
       * to the left of the latest operation.
       */
      else if (cursor === dPos) {
        delta.splice(i, 1, op)

        if ('string' === typeof d.insert) {
          delta.splice(i + 1, 0, createDelta(d.insert.slice(1), d.attributes))
        }
        else {
          dPos += opLength
        }

        ++q
        ++i
      }
      else if (cursor > dPos) {
        if ('string' === typeof d.insert) {
          const split = cursor - dPos
          delta.splice(i, 1, op)
          delta.splice(i + 1, 0, createDelta(d.insert.slice(split + 1), d.attributes))

          ++q
          ++i
          dPos = cursor
        }
      }
    }

    /**
     * If the operation is a `delete`, then we want
     * to remove everything to the right of the cursor
     * by the `op.delete` value.
     */
    else if ('delete' in op) {
      d = delta[i]

      if ('undefined' === typeof d) {
        break
      }

      dLength = d.length

      /**
       * In this case, the position within the `Delta` list
       * and the addition of the `Delta` length are less or
       * equal to the cursor, so we can move along in the
       * `Delta` list, and be sure that we are not losing
       * any information.
       */
      if (cursor >= dPos + dLength) {
        dPos += dLength
        ++i
      }
      else {
        if ('string' === typeof d.insert) {
          if (cursor === dPos) {
            if (dLength > op.delete) {
              delta.splice(i, 1, createDelta(d.insert.slice(op.delete), d.attributes))
              ++q
            }
            else if (dLength === op.delete) {
              delta.splice(i, 1)
              ++q
            }
            else if (dLength < op.delete) {
              delta.splice(i, 1)
              ops.splice(q, 1, createDeleteOperation(op.delete - dLength))
            }
          }
          else if (cursor > dPos) {
            const split = cursor - dPos

            delta.splice(i, 1, createDelta(d.insert.slice(0, split), d.attributes))
            delta.splice(i + 1, 0, createDelta(d.insert.slice(split), d.attributes))

            dPos = cursor
            ++i
          }
        }
        else {
          delta.splice(i, 1)
          dPos = cursor

          if (1 < op.delete) {
            op = ops[q] = createDeleteOperation(op.delete - 1)
          }
          else {
            ++q
          }
        }
      }
    }

    /**
     * An `insert` operation has two types to deal with,
     * a `string` or `block` insert type. The default length
     * of a `block` is `1`, whereas a `string` type
     * has a length equal to the number of characters it holds.
     */
    else if ('insert' in op) {
      opLength = op.length

      /**
       * At this point, if the `Delta` is `undefined`,
       * we must be working with an empty `Delta` list.
       * This initiates the list, and begins the
       * `Transaction` processing.
       */
      d = delta[i]
      if ('undefined' === typeof d) {
        delta.push(op)

        ++q
        ++i
        dPos = opLength
        cursor = dPos
        op = ops[q]

        continue
      }

      dLength = d.length

      /**
       * In this case, the position within the `Delta` list
       * and the addition of the `Delta` length are less or
       * equal to the cursor, so we can move along in the
       * `Delta` list, and be sure that we are not losing
       * any information.
       */
      if (cursor >= dPos + dLength) {
        dPos += dLength
        ++i
      }

      /**
       * When the `cursor` is equal to `dPos`, we are inserting
       * to the left of the latest operation.
       */
      else if (cursor === dPos) {
        delta.splice(i, 1, op)
        delta.splice(i + 1, 0, d)

        ++q
        ++i
        dPos += opLength
        cursor = dPos
      }
      else if (cursor > dPos) {
        if ('string' === typeof d.insert) {
          const split = cursor - dPos

          delta.splice(i, 1, createDelta(d.insert.slice(0, split), d.attributes))
          delta.splice(i + 1, 0, op)
          delta.splice(i + 2, 0, createDelta(d.insert.slice(split), d.attributes))

          ++q
          ++i
          dPos = cursor
        }
      }
    }

    op = ops[q]
  }

  return delta
}

/**
 * Processes the given `Operation` list and `Delta` list,
 * and derives a new `Delta` list result.
 * @param {Operation[]} ops
 * @param {Delta[]} delta
 * @returns {Delta[]}
 */
export function commit(ops: Operation[], delta: Delta[]): Delta[] {
  /**
   * The `Transaction.operations` are copied, as the `Delta`
   * instances are iterated through, creating possible
   * operation value compensations, for example in
   * `DeleteOperation` instances.
   */
  return processOperations([ ...ops ], delta)
}

/**
 * Simulates the list of `Operation` values on a `Delta` list.
 *
 * @param {Operation[]} ops
 * @param {Delta[]} delta
 * @returns {Delta[]}
 */
export function simulate(ops: Operation[], delta: Delta[]): Delta[] {
  return processOperations([ ...ops ], [ ...delta ])
}

/**
 * Maps the given cursor in the `Text.delta` to a new `cursor`
 * within the new `Text.delta`.
 *
 * @param {Transaction} tr
 * @param {number} position
 * @returns {number}
 */
export function selectionFromTransaction(tr: Transaction, position: number): number {
  let cursor = 0
  let pos = position

  for (const op of tr.operations) {
    if ('retain' in op) {
      cursor += op.retain
    }
    else if ('delete' in op) {
      if (pos > cursor) {
        pos -= op.delete
      }
    }
    else if ('insert' in op) {
      if (pos >= cursor) {
        const length = op.length
        pos += length
        cursor += length
      }
    }

    if (cursor > pos) {
      break
    }
  }

  /**
   * There is a case where a `Block`, that converts
   * its first item to another `Block`, then `deletes`
   * the `Block`, will find that the cursor is
   * at `position 0`, when we want it at `position 1`.
   * So we force all `hasBlockAtFront` transactions
   * to always move the `selection to 1` through
   * returning a `1` value.
   *
   * The case is handled here, as a final check once all
   * `selections` have been updated.
   */
  return 0 === pos && tr.hasBlockAtFront ? 1 : pos
}