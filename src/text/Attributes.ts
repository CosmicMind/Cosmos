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
 * @module Attributes
 */

import {
  XSelection,
  fromX,
  toX,
} from './Selection'

import { Text } from './Text'
import { Delta } from './Operation'

/**
 * The `LineOptions` interface defines the various line options available.
 * @property {Optional<string>} color
 * @property {Optional<'dotted' | 'dashed' | 'solid' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset'>} style
 */
export interface LineOptions {
  color: string
  style: 'dotted' | 'dashed' | 'solid' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset'
}

/**
 * The `Attributes` interface defines the various
 * attributes available.
 * @property {Optional<string>} fontSize
 * @property {Optional<string>} fontFamily
 * @property {Optional<string>} fontWeight
 * @property {Optional<string>} fontStyle
 * @property {Optional<string>} lineHeight
 * @property {Optional<string>} color
 * @property {Optional<string>} bold
 * @property {Optional<string>} italic
 * @property {Optional<string | Partial<LineOptions>>} underline
 * @property {Optional<string | Partial<LineOptions>>} strikethrough
 * @property {Optional<'baseline' | 'super' | 'sub'>} verticalAlign
 * @property {Optional<'left' | 'center' | 'right' | 'justify'>} align
 */
export interface Attributes {
  fontSize: string,
  fontFamily: string,
  fontWeight: string,
  fontStyle: string,
  lineHeight: string
  color: string

  bold: boolean
  italic: boolean
  underline: boolean | Partial<LineOptions>
  strikethrough: boolean | Partial<LineOptions>

  verticalAlign: 'baseline' | 'super' | 'sub'
  align: 'left' | 'center' | 'right' | 'justify'
}

/**
 * Creates an `Attributes` instance.
 * @returns {Partial<Attributes>}
 */
export function createAttributes(): Partial<Attributes> {
  return {}
}

/**
 * Extracts an array of attributes used within the given `XSelection`.
 * @param {Delta[]} delta
 * @param {XSelection} s
 * @returns {Attributes[]}
 */
export function extractAttributes(delta: Delta[], s: XSelection): Attributes[] {
  const fX = fromX(s).x
  const tX = toX(s).x
  const a: Attributes[] = []

  let cursor = 0

  for (const d of delta) {
    const next = cursor + d.length
    const started = cursor > fX || next >= fX

    if (started && d.attributes) {
      a.push(d.attributes)
    }

    const ended = next >= tX
    if (ended) {
      break
    }

    cursor = next
  }

  return a
}

/**
 * Fetches the value of the passed in `Attribute`.
 * @param {Text} t
 * @param {XSelection} s
 * @param {Attributes} a
 * @param {keyof Attributes} k
 * @returns {typeof Partial<Attributes>[k]}
 */
export function fetchAttribute<K extends keyof Attributes>(t: Text, s: XSelection, k: K): Partial<Attributes>[K] {
  return extractAttributes(t.delta, s).find(x => x[k])?.[k]
}
