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
 * @module Selection
 */

/**
 * References the `x` dimension, Domain.
 * @property {number} x
 */
export interface XPoint {
  x: number
}

/**
 * References the `x` dimension, and
 * `y` dimension.
 * @property {number} dx
 * @property {number} dy
 */
export interface XYDistance {
  dx: number
  dy: number
}

/**
 * References the `x` dimension, and
 * `y` dimension.
 * @property {number} lx
 * @property {number} ly
 */
export interface XYLength {
  lx: number
  ly: number
}

/**
 * Creates a new `XPoint` instance.
 * @param {number} x
 * @returns {XPoint}
 */
export function createXPoint(x = 0): XPoint {
  return {
    x,
  }
}

/**
 * References the `y` dimension, Range.
 * @property {number} y
 */
export interface YPoint {
  y: number
}

export function createYPoint(y = 0): YPoint {
  return {
    y,
  }
}

/**
 * References the `x` and `y` dimensions.
 * @property {number} x
 * @property {number} y
 */
export interface XYPoint extends XPoint, YPoint {
}

/**
 * Creates a new `XYPoint`.
 * @param {number} x @default 0
 * @param {number} y @default x
 */
export function createXYPoint(x = 0, y = 0): XYPoint {
  return {
    x,
    y,
  }
}

/**
 * The `Selection` interface describes a `start` position
 * and `end` position.
 * @template T
 * @property {T} start
 * @property {T} end
 */
export interface Selection<T> {
  start: T
  end: T
}

/**
 * The `XSelection` interface describes a `start` point
 * and `end` point for the `X` plane.
 * @property {XPoint} start
 * @property {XPoint} end
 */
export type XSelection = Selection<XPoint>

/**
 * Creates a new `XSelection`.
 * @param {number} start @default 0
 * @param {number} end @default start
 */
export function createXSelection(start = 0, end = start): XSelection {
  return {
    start: createXPoint(start),
    end: createXPoint(end),
  }
}

/**
 * The `YSelection` interface describes a `start` point
 * and `end` point for the `Y` plane.
 * @property {YPoint} start
 * @property {YPoint} end
 */
export type YSelection = Selection<YPoint>


/**
 * Creates a new `YSelection`.
 * @param {number} start @default 0
 * @param {number} end @default start
 */
export function createYSelection(start = 0, end = start): YSelection {
  return {
    start: createYPoint(start),
    end: createYPoint(end),
  }
}

/**
 * The `XYSelection` interface describes a `start` point
 * and `end` point for the `X` plane and `Y` plane.
 * @property {XYPoint} start
 * @property {XYPoint} end
 */
export type XYSelection = Selection<XYPoint>


/**
 * Creates a new `XYSelection`.
 * @param {number} start @default {x:0,y:0}
 * @param {number} end @default start
 */
export function createXYSelection(start: XYPoint = createXYPoint(), end: XYPoint = start): XYSelection {
  return {
    start,
    end,
  }
}

/**
 * Determines if the selection is from the
 * right to left.
 * @param {XSelection} s
 * @returns {boolean}
 */
export function isBackwards(s: XSelection): boolean {
  return s.start.x > s.end.x
}

/**
 * Determines if the selection is from the
 * top to bottom.
 * @param {YSelection} s
 * @returns {boolean}
 */
export function isTtoB(s: YSelection): boolean {
  return s.start.y > s.end.y
}

/**
 * Calculates whether the `start` or `end` is
 * the `from` position.
 * @param {XSelection} s
 * @returns {XPoint}
 */
export function fromX(s: XSelection): XPoint {
  return isBackwards(s) ? s.end : s.start
}

/**
 * Calculates whether the `start` or `end` is
 * the `from` position.
 * @param {YSelection} s
 * @returns {YPoint}
 */
export function fromY(s: YSelection): YPoint {
  return isTtoB(s) ? s.end : s.start
}

/**
 * Calculates whether the `start` or `end` is
 * the `from` position.
 * @param {XYSelection} s
 * @returns {XPoint}
 */
export function fromXY(s: XYSelection): XYPoint {
  return {
    x: fromX(s).x,
    y: fromY(s).y,
  }
}

/**
 * Calculates whether the `start` or `end` is
 * the `to` position.
 * @param {XSelection} s
 * @returns {XPoint}
 */
export function toX(s: XSelection): XPoint {
  return isBackwards(s) ? s.start : s.end
}

/**
 * Calculates whether the `start` or `end` is
 * the `to` position.
 * @param {YSelection} s
 * @returns {YPoint}
 */
export function toY(s: YSelection): YPoint {
  return isTtoB(s) ? s.start : s.end
}

/**
 * Calculates whether the `start` or `end` is
 * the `to` position.
 * @param {XYSelection} s
 * @returns {XPoint}
 */
export function toXY(s: XYSelection): XYPoint {
  return {
    x: toX(s).x,
    y: toY(s).y,
  }
}

/**
 * Determines if the given `XPoint` is within
 * the `XSelection`.
 * @param {XSelection} s
 * @param {XPoint} p
 * @returns {boolean}
 */
export function withinX(s: XSelection, p: XPoint): boolean {
  return fromX(s).x <= p.x && p.x <= toX(s).x
}

/**
 * Determines if the given `YPoint` is within
 * the `YSelection`.
 * @param {YSelection} s
 * @param {YPoint} p
 * @returns {boolean}
 */
export function withinY(s: YSelection, p: YPoint): boolean {
  return fromY(s).y <= p.y && p.y <= toY(s).y
}

/**
 * Determines if the given `XYPoint` is within
 * the `XYSelection`.
 * @param {XYSelection} s
 * @param {XYPoint} p
 * @returns {boolean}
 */
export function withinXY(s: XYSelection, p: XYPoint): boolean {
  return withinX(s, p) && withinY(s, p)
}

/**
 * Determines if the given `XPoint` instances are equal.
 * @param {XPoint} a
 * @param {XPoint} b
 * @returns {boolean}
 */
export function equalsX(a: XPoint, b: XPoint): boolean {
  return a.x === b.x
}

/**
 * Determines if the given `YPoint` instances are equal.
 * @param {YPoint} a
 * @param {YPoint} b
 * @returns {boolean}
 */
export function equalsY(a: YPoint, b: YPoint): boolean {
  return a.y === b.y
}

/**
 * Determines if the given `XYPoint` instances are equal.
 * @param {XYPoint} a
 * @param {XYPoint} b
 * @returns {boolean}
 */
export function equalsXY(a: XYPoint, b: XYPoint): boolean {
  return equalsX(a, b) && equalsY(a, b)
}

/**
 * Determines the difference between the `XSelection` points.
 * @param {XSelection} s
 * @returns {number}
 */
export function distanceX(s: XSelection): number {
  return toX(s).x - fromX(s).x
}

/**
 * Determines the difference between the `YSelection` points.
 * @param {YSelection} s
 * @returns {number}
 */
export function distanceY(s: YSelection): number {
  return toY(s).y - fromY(s).y
}

/**
 * Determines the difference between the `XYSelection` points.
 * @param {XYSelection} s
 * @returns {XYDistance}
 */
export function distanceXY(s: XYSelection): XYDistance {
  return {
    dx: distanceX(s),
    dy: distanceY(s),
  }
}

/**
 * Determines the length of the `XSelection` points.
 * If start === end, then length is `0`.
 * @param {XSelection} s
 * @returns {number}
 */
export function lengthX(s: XSelection): number {
  return distanceX(s) + 1
}

/**
 * Determines the length of the `YSelection` points.
 * If start === end, then length is `0`.
 * @param {YSelection} s
 * @returns {number}
 */
export function lengthY(s: YSelection): number {
  return distanceY(s) + 1
}

/**
 * Determines the length of the `XYSelection` points.
 * If start === end, then length is `0`.
 * @param {XYSelection} s
 * @returns {XYLength}
 */
export function lengthXY(s: XYSelection): XYLength {
  return {
    lx: lengthX(s),
    ly: lengthY(s),
  }
}

/**
 * Collapses the given `XSelection`. If the boolean
 * `toEnd` is true, then it is collapsed to the `end`
 * point, otherwise to the `start` point.
 * @param {XSelection} s
 * @param {Optional<boolean>} toEnd
 */
export function collapseX(s: XSelection, toEnd?: boolean) {
  if (toEnd) {
    s.start = createXPoint(s.end.x)
  }
  else {
    s.end = createXPoint(s.start.x)
  }
}

/**
 * Collapses the given `YSelection`. If the boolean
 * `toEnd` is true, then it is collapsed to the `end`
 * point, otherwise to the `start` point.
 * @param {YSelection} s
 * @param {Optional<boolean>} toEnd
 */
export function collapseY(s: YSelection, toEnd?: boolean) {
  if (toEnd) {
    s.start = createYPoint(s.end.y)
  }
  else {
    s.end = createYPoint(s.start.y)
  }
}

/**
 * Collapses the given `XYSelection`. If the boolean
 * `toEnd` is true, then it is collapsed to the `end`
 * point, otherwise to the `start` point.
 * @param {XYSelection} s
 * @param {Optional<boolean>} toEnd
 */
export function collapseXY(s: XYSelection, toEnd?: boolean) {
  collapseX(s, toEnd)
  collapseY(s, toEnd)
}

/**
 * Determines if the given `XSelection` is collapsed,
 * where start === end.
 * @param {XSelection} s
 * @returns {boolean}
 */
export function isCollapsedX(s: XSelection): boolean {
  return equalsX(s.start, s.end)
}

/**
 * Determines if the given `YSelection` is collapsed,
 * where start === end.
 * @param {YSelection} s
 * @returns {boolean}
 */
export function isCollapsedY(s: YSelection): boolean {
  return equalsY(s.start, s.end)
}

/**
 * Determines if the given `XYSelection` is collapsed,
 * where start === end.
 * @param {XYSelection} s
 * @returns {boolean}
 */
export function isCollapsedXY(s: XYSelection): boolean {
  return isCollapsedX(s) && isCollapsedY(s)
}
