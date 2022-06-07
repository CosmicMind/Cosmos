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
 * @module Text
 */

import {
  async,
  clone,
  Voidable,
  Observable,
  Nullable,
} from '@cosmicverse/foundation'

import {
  XSelection,
  createXSelection,
} from './Selection'

import {
  Attributes,
  createAttributes,
} from './Attributes'

import {
  Transaction,
  createTransaction,
  commit,
  selectionFromTransaction,
  deltaAt,
  fetchAt,
} from './Transaction'

import {
  Delta,
  DeltaType,
  Operation,
} from './Operation'

/**
 * @extends {Observable}
 */
export class Text extends Observable {
  /**
   * A reference to the selection of text.
   * @type {XSelection}
   */
  readonly selection: XSelection

  /**
   * A reference to the `Attributes` instance. This value is
   * the current configuration of attributes based on the
   * `cursor` position.
   * @type {Attributes}
   */
  readonly attributes: Attributes

  /**
   * A reference to the `Delta` instances. This value is
   * the current Array of Delta that makeup the `Text` body.
   * @type {Delta[]}
   */
  readonly delta: Delta[]

  /**
   * Returns the current length relative to the
   * `Delta.length` values.
   * @type {number}
   */
  get length(): number {
    return this.delta.reduce((count, d) => count + d.length, 0)
  }

  /**
   * Class constructor.
   * @param {Attributes} a @default {}
   * @param {Delta[]} d @default []
   */
  constructor(a: Attributes = createAttributes(), d: Delta[] = []) {
    super()
    this.attributes = a
    this.delta = d
    this.selection = createXSelection()
  }

  /**
   * Retrieves the `Delta` at the given position.
   * @param {number} at
   * @returns {Nullable<Delta>}
   */
  deltaAt(at: number): Nullable<Delta> {
    return deltaAt(at, this.delta)
  }

  /**
   * Selects the `string` or `Block` at the given position.
   * The `fetchAt` method accommodates the issue if a
   * position falls within a string range where the character
   * has a length of greater than `1`, such as emoji characters '👨‍👨‍👧‍👧'.
   * @param {number} at
   * @returns {Nullable<DeltaType>}
   */
  fetchAt(at: number): Nullable<DeltaType> {
    return fetchAt(at, this.delta)
  }

  /**
   * Creates a synchronous `Transaction` with the given `Operation` instances.
   * As long as a value of `true` is not returned within the given `Transaction`
   * block, the `Transaction` will commit its changes.
   *
   * @param {(tr: Transaction) => Voidable<boolean>} fn
   * @param {Optional<(t: Text, tr: Transaction) => void>} cb When the `callback`
   * function is set, then the `beforeTransaction`, and `afterTransaction`
   * event emitters are not executed.
   * @returns {Transaction}
   */
  transactSync(fn: (tr: Transaction) => Voidable<boolean>, cb?: (t: Text, tr: Transaction) => void): Transaction {
    const tr = createTransaction(this)

    if (false !== fn(tr) && tr.operations.length) {
      if ('undefined' === typeof cb) {
        this.emitSync('beforeTransaction', this, tr)
      }

      commit(tr.operations, this.delta)
      updateSelection(tr, this.selection)

      if ('undefined' !== typeof cb) {
        cb.call(this, this, tr)
      }
      else {
        this.emitSync('afterTransaction', this, tr)
      }
    }

    return tr
  }

  /**
   * Creates an asynchronous `Transaction` with the given `Operation` instances.
   * As long as a value of `true` is not returned within the given `Transaction`
   * block, the `Transaction` will commit its changes.
   *
   * @param {(tr: Transaction) => Voidable<boolean>} fn
   * @param {Optional<(t: Text, tr: Transaction) => void>} cb When the `callback`
   * function is set, then the `beforeTransaction`, and `afterTransaction`
   * event emitters are not executed.
   * @returns {Promise<Transaction>}
   */
  transactAsync(fn: (tr: Transaction) => Voidable<boolean>, cb?: (t: Text, tr: Transaction) => void): Promise<unknown> {
    return async((): Voidable<Transaction> => {
      const tr = createTransaction(this)

      if (true === fn(tr) || 0 === tr.operations.length) {
        throw new Error('Transaction has 0 operations.')
      }

      if ('undefined' === typeof cb) {
        this.emitSync('beforeTransaction', this, tr)
      }

      commit(tr.operations, this.delta)
      updateSelection(tr, this.selection)

      if ('undefined' !== typeof cb) {
        cb.call(this, this, tr)
      }
      else {
        this.emitSync('afterTransaction', this, tr)
      }

      return tr
    })
  }

  /**
   * Simulates a `Transaction` on the given `Text`, but doesn't
   * actually execute it on the `Text` itself. A copy is made
   * and returned to the caller.
   * @param {(tr: Transaction) => Voidable<boolean>} fn
   * @returns {Text}
   */
  transactSimulate(fn: (tr: Transaction) => Voidable<boolean>): Text {
    const text = new Text(
        clone(this.attributes) as Attributes,
        clone(this.delta) as Delta[]
    )

    const tr = createTransaction(text)
    if (false !== fn(tr) && tr.operations.length) {
      commit(tr.operations, text.delta)
      updateSelection(tr, text.selection)
    }

    return text
  }

  /**
   * Applies the given `Operation` instances to the `Text`.
   * @param {Operation[]} ops
   */
  apply(ops: Operation[]): void {
    const tr = createTransaction(this, ops)
    this.emitSync('beforeApply', this, ops)
    commit(tr.operations, this.delta)
    updateSelection(tr, this.selection)
    this.emitSync('afterApply', this, ops)
  }
}

/**
 * Updates the `cursor` for the given `Transaction.
 * It relatively updates the `x` values for the
 * `XSelection` points by using the `Transaction`
 * operations.
 * @param {Transaction} tr
 * @param {XSelection} selection
 */
export function updateSelection(tr: Transaction, selection: XSelection): void {
  selection.start.x = selectionFromTransaction(tr, selection.start.x)
  selection.end.x = selectionFromTransaction(tr, selection.end.x)
}