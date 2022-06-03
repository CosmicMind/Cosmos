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

import test from 'ava'

import {
  Text,
  collapseX,
  Block,
  createDeltaText,
  createDeltaBlock,
  createRetainOperation,
  createDeleteOperation,
  createSwapOperation,
} from '../src'

test('Text: A', t => {
  const text = new Text()

  text.transactSync(tr => {
    tr.insert('Hello World')
    t.is(tr.cursor, 11)
    t.deepEqual(tr.operations, [
      createDeltaText('Hello World')
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaText('Hello World')
  ])

  text.transactSync(tr => {
    tr.insertAt(5, ' Today')
    t.is(tr.cursor, 11)
    t.deepEqual(tr.operations, [
      createRetainOperation(5),
      createDeltaText(' Today')
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaText('Hello'),
    createDeltaText(' Today'),
    createDeltaText(' World')
  ])
})

test('Text: B', t => {
  const text = new Text()

  text.transactSync(tr => {
    tr.insert('Hello')
    t.is(tr.cursor, 5)
    t.deepEqual(tr.operations, [
      createDeltaText('Hello')
    ])

    tr.insert(' World')
    t.is(tr.cursor, 11)
    t.deepEqual(tr.operations, [
      createDeltaText('Hello'),
      createRetainOperation(5),
      createDeltaText(' World')
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaText('Hello'),
    createDeltaText(' World')
  ])

  text.transactSync(tr => {
    tr.insertAt(5, ' Today')
    t.is(tr.cursor, 11)
    t.deepEqual(tr.operations, [
      createRetainOperation(5),
      createDeltaText(' Today')
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaText('Hello'),
    createDeltaText(' Today'),
    createDeltaText(' World')
  ])
})

test('Text: C', t => {
  const text = new Text()

  text.apply([
    createDeltaText('Hello World')
  ])

  text.apply([
    createRetainOperation(5),
    createDeltaText(' ')
  ])

  text.apply([
    createRetainOperation(6),
    createDeltaText('T')
  ])

  text.apply([
    createRetainOperation(7),
    createDeltaText('o')
  ])

  text.apply([
    createRetainOperation(8),
    createDeltaText('d')
  ])

  text.apply([
    createRetainOperation(9),
    createDeltaText('a')
  ])

  text.apply([
    createRetainOperation(10),
    createDeltaText('y')
  ])

  t.deepEqual(text.delta, [
    createDeltaText('Hello'),
    createDeltaText(' '),
    createDeltaText('T'),
    createDeltaText('o'),
    createDeltaText('d'),
    createDeltaText('a'),
    createDeltaText('y'),
    createDeltaText(' World')
  ])
})

test('Text: D', t => {
  const text = new Text()

  text.apply([
    createDeltaText('Hello Today World')
  ])

  text.apply([
    createDeleteOperation(5),
    createRetainOperation(6),
    createDeleteOperation(6)
  ])

  t.deepEqual(text.delta, [
    createDeltaText(' Today')
  ])

  text.apply([
    createDeltaText('Hello'),
    createRetainOperation(6),
    createDeltaText(' World')
  ])

  t.deepEqual(text.delta, [
    createDeltaText('Hello'),
    createDeltaText(' Today'),
    createDeltaText(' World')
  ])
})

test('Text: E', t => {
  const text = new Text()

  text.apply([
    createDeltaText('Hello Today It\'s great right? '),
    createDeltaBlock(Block.ordered),
    createDeltaText('World'),
    createDeltaBlock(Block.ordered),
    createDeltaText('What do you think?')
  ])

  t.deepEqual(text.delta, [
    createDeltaText('Hello Today It\'s great right? '),
    createDeltaBlock(Block.ordered),
    createDeltaText('World'),
    createDeltaBlock(Block.ordered),
    createDeltaText('What do you think?')
  ])
})

test('Text: F', t => {
  const text = new Text()

  text.apply([
    createDeltaText('Hello ')
  ])

  t.deepEqual(text.delta, [
    createDeltaText('Hello ')
  ])

  text.apply([
    createRetainOperation(6),
    createDeltaText('👨‍👨‍👧‍👧')
  ])

  t.deepEqual(text.delta, [
    createDeltaText('Hello '),
    createDeltaText('👨‍👨‍👧‍👧')
  ])

  text.apply([
    createRetainOperation(17),
    createDeltaText(' World')
  ])

  t.deepEqual(text.delta, [
    createDeltaText('Hello '),
    createDeltaText('👨‍👨‍👧‍👧'),
    createDeltaText(' World')
  ])

  text.apply([
    createRetainOperation(5),
    createDeleteOperation(15)
  ])

  t.deepEqual(text.delta, [
    createDeltaText('Hello'),
    createDeltaText('rld')
  ])

  text.apply([
    createRetainOperation(5),
    createDeltaText(' Wo')
  ])

  t.deepEqual(text.delta, [
    createDeltaText('Hello'),
    createDeltaText(' Wo'),
    createDeltaText('rld')
  ])

  text.apply([
    createRetainOperation(6),
    createDeltaText('👨‍👨‍👧‍👧'),
    createDeltaText(' ')
  ])

  t.deepEqual(text.delta, [
    createDeltaText('Hello'),
    createDeltaText(' '),
    createDeltaText(' '),
    createDeltaText('👨‍👨‍👧‍👧'),
    createDeltaText('Wo'),
    createDeltaText('rld')
  ])
})

test('Text: G', t => {
  const text = new Text()

  text.transactSync(tr => {
    tr.insert('Hello ')
    t.is(tr.cursor, 6)
    t.deepEqual(tr.operations, [
      createDeltaText('Hello ')
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaText('Hello ')
  ])

  text.transactSync(tr => {
    tr.insert('👨‍👨‍👧‍👧')
    t.is(tr.cursor, 17)
    t.deepEqual(tr.operations, [
      createRetainOperation(6),
      createDeltaText('👨‍👨‍👧‍👧')
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaText('Hello '),
    createDeltaText('👨‍👨‍👧‍👧')
  ])

  text.transactSync(tr => {
    tr.insertAt(17, ' World')
    t.is(tr.cursor, 23)
    t.deepEqual(tr.operations, [
      createRetainOperation(17),
      createDeltaText(' World')
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaText('Hello '),
    createDeltaText('👨‍👨‍👧‍👧'),
    createDeltaText(' World')
  ])

  text.selection.start.x = 20
  collapseX(text.selection)

  text.transactSync(tr => {
    tr.delete(15)
    t.is(tr.cursor, 5)
    t.deepEqual(tr.operations, [
      createRetainOperation(5),
      createDeleteOperation(15)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaText('Hello'),
    createDeltaText('rld')
  ])

  text.transactSync(tr => {
    tr.insertAt(5, ' Wo')
    t.is(tr.cursor, 8)
    t.deepEqual(tr.operations, [
      createRetainOperation(5),
      createDeltaText(' Wo')
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaText('Hello'),
    createDeltaText(' Wo'),
    createDeltaText('rld')
  ])

  text.transactSync(tr => {
    tr.insertAt(6, '👨‍👨‍👧‍👧')
    t.is(tr.cursor, 17)
    t.deepEqual(tr.operations, [
      createRetainOperation(6),
      createDeltaText('👨‍👨‍👧‍👧')
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaText('Hello'),
    createDeltaText(' '),
    createDeltaText('👨‍👨‍👧‍👧'),
    createDeltaText('Wo'),
    createDeltaText('rld')
  ])

  text.transactSync(tr => {
    tr.insertAt(17, ' ')
    t.is(tr.cursor, 18)
    t.deepEqual(tr.operations, [
      createRetainOperation(17),
      createDeltaText(' ')
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaText('Hello'),
    createDeltaText(' '),
    createDeltaText('👨‍👨‍👧‍👧'),
    createDeltaText(' '),
    createDeltaText('Wo'),
    createDeltaText('rld')
  ])
})

test('Text: H', t => {
  const text = new Text()

  text.apply([
    createDeltaBlock(Block.paragraph),
    createDeltaText('A 👨‍👨‍👧‍👧 B'),
    createDeltaText('Hello👨‍👨‍👧‍👧World'),
    createDeltaBlock(Block.paragraph)
  ])

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('A 👨‍👨‍👧‍👧 B'),
    createDeltaText('Hello👨‍👨‍👧‍👧World'),
    createDeltaBlock(Block.paragraph)
  ])

  text.transactSync(tr => {
    tr.deleteAt(14, 1)
    t.is(tr.cursor, 14)
    t.deepEqual(tr.operations, [
      createRetainOperation(14),
      createDeleteOperation(1)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('A 👨‍👨‍👧‍👧'),
    createDeltaText('B'),
    createDeltaText('Hello👨‍👨‍👧‍👧World'),
    createDeltaBlock(Block.paragraph)
  ])

  text.transactSync(tr => {
    tr.deleteAt(3, 11)
    t.is(tr.cursor, 3)
    t.deepEqual(tr.operations, [
      createRetainOperation(3),
      createDeleteOperation(11)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('A '),
    createDeltaText('B'),
    createDeltaText('Hello👨‍👨‍👧‍👧World'),
    createDeltaBlock(Block.paragraph)
  ])
})

test('Text: I', t => {
  const text = new Text()

  text.apply([
    createDeltaBlock(Block.paragraph),
    createDeltaText('A 👨‍👨‍👧‍👧 B'),
    createDeltaText('Hello👨‍👨‍👧‍👧World'),
    createDeltaBlock(Block.paragraph)
  ])

  text.selection.start.x = text.length
  collapseX(text.selection)

  text.transactSync(tr => {
    tr.delete()
    t.is(tr.cursor, 37)
    t.deepEqual(tr.operations, [
      createRetainOperation(37),
      createDeleteOperation(1)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('A 👨‍👨‍👧‍👧 B'),
    createDeltaText('Hello👨‍👨‍👧‍👧World')
  ])

  text.selection.start.x = 14
  collapseX(text.selection)

  text.transactSync(tr => {
    tr.delete(11)
    t.is(tr.cursor, 3)
    t.deepEqual(tr.operations, [
      createRetainOperation(3),
      createDeleteOperation(11)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('A '),
    createDeltaText(' B'),
    createDeltaText('Hello👨‍👨‍👧‍👧World')
  ])
})

test('Text: J', t => {
  const text = new Text()

  text.apply([
    createDeltaBlock(Block.paragraph),
    createDeltaText('A 👨‍👨‍👧‍👧 B'),
    createDeltaText('Hello👨‍👨‍👧‍👧World'),
    createDeltaBlock(Block.paragraph)
  ])

  text.selection.start.x = 3
  collapseX(text.selection)

  text.transactSync(tr => {
    tr.delete()
    t.is(tr.cursor, 2)
    t.deepEqual(tr.operations, [
      createRetainOperation(2),
      createDeleteOperation(1)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('A'),
    createDeltaText('👨‍👨‍👧‍👧 B'),
    createDeltaText('Hello👨‍👨‍👧‍👧World'),
    createDeltaBlock(Block.paragraph)
  ])
})

test('Text: K', t => {
  const text = new Text()

  text.apply([
    createDeltaText('👨‍👨‍👧‍👧')
  ])

  text.selection.start.x = 0
  collapseX(text.selection)

  text.transactSync(tr => {
    tr.insert('A')
    t.is(tr.cursor, 1)
    t.deepEqual(tr.operations, [
      createDeltaText('A')
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaText('A'),
    createDeltaText('👨‍👨‍👧‍👧')
  ])

  text.transactSync(tr => {
    tr.delete()
    t.is(tr.cursor, 0)
    t.deepEqual(tr.operations, [
      createDeleteOperation(1)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaText('👨‍👨‍👧‍👧')
  ])
})

test('Text: L', t => {
  const text = new Text()

  text.transactSync(tr => {
    tr.block()
    t.is(tr.cursor, 1)
    t.deepEqual(tr.operations, [
      createDeltaBlock(Block.paragraph)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph)
  ])

  text.selection.start.x = 1
  collapseX(text.selection)

  text.transactSync(tr => {
    tr.block(Block.ordered)
    t.is(tr.cursor, 2)

    t.deepEqual(tr.operations, [
      createRetainOperation(1),
      createDeltaBlock(Block.ordered)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaBlock(Block.ordered)
  ])

  text.selection.start.x = 0
  collapseX(text.selection)

  text.transactSync(tr => {
    tr.convert(Block.ordered)
    t.is(tr.cursor, 1)
    t.deepEqual(tr.operations, [
      createSwapOperation({ block: Block.ordered })
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.ordered),
    createDeltaBlock(Block.ordered)
  ])

  text.selection.start.x = 1
  collapseX(text.selection)

  text.transactSync(tr => {
    tr.insert('Hello')
    t.is(tr.cursor, 6)
    t.deepEqual(tr.operations, [
      createRetainOperation(1),
      createDeltaText('Hello')
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.ordered),
    createDeltaText('Hello'),
    createDeltaBlock(Block.ordered)
  ])

  text.selection.start.x = 1
  collapseX(text.selection)

  text.transactSync(tr => {
    tr.convertAt(1, Block.unordered)
    t.is(tr.cursor, 2)

    t.deepEqual(tr.operations, [
      createRetainOperation(1),
      createSwapOperation({ block: Block.unordered })
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.ordered),
    createDeltaBlock(Block.unordered),
    createDeltaText('ello'),
    createDeltaBlock(Block.ordered)
  ])

  text.selection.start.x = 0
  collapseX(text.selection)

  text.transactSync(tr => {
    tr.block(Block.unordered)
    t.is(tr.cursor, 1)

    t.deepEqual(tr.operations, [
      createDeltaBlock(Block.unordered)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.unordered),
    createDeltaBlock(Block.ordered),
    createDeltaBlock(Block.unordered),
    createDeltaText('ello'),
    createDeltaBlock(Block.ordered)
  ])

  text.selection.start.x = 1
  collapseX(text.selection)

  text.transactSync(tr => {
    tr.delete()
    t.is(tr.cursor, 0)

    t.deepEqual(tr.operations, [
      createDeleteOperation(1)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.ordered),
    createDeltaBlock(Block.unordered),
    createDeltaText('ello'),
    createDeltaBlock(Block.ordered)
  ])

  text.transactSync(tr => {
    tr.convert(Block.blockquote)
    t.is(tr.cursor, 1)

    t.deepEqual(tr.operations, [
      createSwapOperation({ block: Block.blockquote })
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.blockquote),
    createDeltaBlock(Block.unordered),
    createDeltaText('ello'),
    createDeltaBlock(Block.ordered)
  ])

  text.transactSync(tr => {
    tr.replaceAt(2, 'blah')
    t.is(tr.cursor, 6)

    t.deepEqual(tr.operations, [
      createRetainOperation(2),
      createSwapOperation('blah')
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.blockquote),
    createDeltaBlock(Block.unordered),
    createDeltaText('blah'),
    createDeltaText('llo'),
    createDeltaBlock(Block.ordered)
  ])
})

test('Text: M', t => {
  const text = new Text()

  text.transactSync(tr => {
    tr.block(Block.blockquote)
    t.is(tr.cursor, 1)
    t.deepEqual(tr.operations, [
      createDeltaBlock(Block.blockquote)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.blockquote)
  ])

  text.transactSync(tr => {
    t.is(tr.convertIfNeeded(Block.unordered), true)
    t.is(tr.cursor, 1)
    t.deepEqual(tr.operations, [
      createSwapOperation({ block: Block.unordered })
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.unordered)
  ])

  text.transactSync(tr => {
    t.is(tr.convertIfNeeded(Block.unordered), false)
    t.is(tr.cursor, 2)
    t.deepEqual(tr.operations, [
      createRetainOperation(1),
      createDeltaBlock(Block.unordered)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.unordered),
    createDeltaBlock(Block.unordered)
  ])
})

test('Text: N', t => {
  const text = new Text()

  text.transactSync(tr => {
    tr.insert('Hello World')
    t.is(tr.ensureBlockAtFront(), true)
    t.is(tr.cursor, 12)

    t.deepEqual(tr.operations, [
      createDeltaBlock(Block.paragraph),
      createDeltaText('Hello World')
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('Hello World')
  ])

  text.transactSync(tr => {
    tr.insertAt(6, ' Today')
    t.is(tr.ensureBlockAtFront(), false)
    t.is(tr.cursor, 12)

    t.deepEqual(tr.operations, [
      createRetainOperation(6),
      createDeltaText(' Today')
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('Hello'),
    createDeltaText(' Today'),
    createDeltaText(' World')
  ])
})

test('Text: O', t => {
  const text = new Text()

  text.transactSync(tr => {
    tr.insert('Hello World')
    t.is(tr.ensureBlockAtFront(), true)
    t.is(tr.cursor, 12)

    t.deepEqual(tr.operations, [
      createDeltaBlock(Block.paragraph),
      createDeltaText('Hello World')
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('Hello World')
  ])

  text.transactSync(tr => {
    tr.format({ bold: true })
    t.is(tr.ensureBlockAtFront(), false)
    t.is(tr.cursor, 12)

    t.deepEqual(tr.attributes, { bold: true })

    t.deepEqual(tr.operations, [
      createRetainOperation(12),
      createRetainOperation(0, tr.attributes)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('Hello World')
  ])

  text.transactSync(tr => {
    tr.format({ bold: false })
    t.is(tr.ensureBlockAtFront(), false)
    t.is(tr.cursor, 12)

    t.deepEqual(tr.attributes, { bold: false })

    t.deepEqual(tr.operations, [
      createRetainOperation(12),
      createRetainOperation(0, tr.attributes)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('Hello World')
  ])

  text.transactSync(tr => {
    tr.format({ bold: true })
    t.is(tr.ensureBlockAtFront(), false)
    t.is(tr.cursor, 12)

    t.deepEqual(tr.attributes, { bold: true })

    tr.insert(' Today', tr.attributes)

    t.deepEqual(tr.operations, [
      createRetainOperation(12),
      createRetainOperation(0, tr.attributes),
      createRetainOperation(12),
      createDeltaText(' Today', tr.attributes)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('Hello World'),
    createDeltaText(' Today', { bold: true })
  ])
})

test('Text: P', t => {
  const text = new Text()

  text.transactSync(tr => {
    tr.format({ bold: true })
    tr.insert('Hello World', tr.attributes)
    t.is(tr.ensureBlockAtFront(), true)
    t.is(tr.cursor, 12)

    t.deepEqual(tr.operations, [
      createDeltaBlock(Block.paragraph),
      createRetainOperation(0, tr.attributes),
      createDeltaText('Hello World', { bold: true })
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('Hello World', { bold: true })
  ])

  text.transactSync(tr => {
    tr.format({ bold: false })
    t.is(tr.ensureBlockAtFront(), false)
    t.is(tr.cursor, 12)

    t.deepEqual(tr.attributes, { bold: false })

    tr.insert(' Today', tr.attributes)

    t.deepEqual(tr.operations, [
      createRetainOperation(12),
      createRetainOperation(0, tr.attributes),
      createRetainOperation(12),
      createDeltaText(' Today', tr.attributes)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('Hello World', { bold: true }),
    createDeltaText(' Today', { bold: false })
  ])

  text.selection.start.x = 3
  text.selection.end.x = 7

  text.transactSync(tr => {
    tr.format({ bold: false })
    t.is(tr.ensureBlockAtFront(), false)
    t.is(tr.cursor, 3)

    t.deepEqual(tr.attributes, { bold: false })

    t.deepEqual(tr.operations, [
      createRetainOperation(3),
      createRetainOperation(4, tr.attributes)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('He', { bold: true }),
    createDeltaText('llo ', { bold: false }),
    createDeltaText('World', { bold: true }),
    createDeltaText(' Today', { bold: false })
  ])
})

test('Text: Q', t => {
  const text = new Text()

  text.apply([
    createDeltaBlock(Block.paragraph),
    createDeltaText('Hello'),
    createDeltaText(' W', { bold: true }),
    createDeltaText('o', {
      bold: true,
      underline: true,
    }),
    createDeltaText('rld', { bold: true })
  ])

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('Hello'),
    createDeltaText(' W', { bold: true }),
    createDeltaText('o', {
      bold: true,
      underline: true,
    }),
    createDeltaText('rld', { bold: true })
  ])

  text.selection.start.x = 2
  text.selection.end.x = 9

  text.transactSync(tr => {
    tr.format({ bold: false })
    t.is(tr.ensureBlockAtFront(), false)
    t.is(tr.cursor, 2)

    t.deepEqual(tr.attributes, { bold: false })

    t.deepEqual(tr.operations, [
      createRetainOperation(2),
      createRetainOperation(7, tr.attributes)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('H'),
    createDeltaText('ello', { bold: false }),
    createDeltaText(' W', { bold: false }),
    createDeltaText('o', {
      bold: false,
      underline: true,
    }),
    createDeltaText('rld', { bold: true })
  ])
})

test('Text: R', t => {
  const text = new Text()

  text.apply([
    createDeltaBlock(Block.paragraph),
    createDeltaText('H'),
    createDeltaText('e'),
    createDeltaText('l'),
    createDeltaText('l'),
    createDeltaText('o'),
    createDeltaText(' '),
    createDeltaText('W', { bold: true }),
    createDeltaText('o', {
      bold: true,
      underline: true,
    }),
    createDeltaText('r', { bold: true }),
    createDeltaText('l', { bold: true }),
    createDeltaText('d', { bold: true })
  ])

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('H'),
    createDeltaText('e'),
    createDeltaText('l'),
    createDeltaText('l'),
    createDeltaText('o'),
    createDeltaText(' '),
    createDeltaText('W', { bold: true }),
    createDeltaText('o', {
      bold: true,
      underline: true,
    }),
    createDeltaText('r', { bold: true }),
    createDeltaText('l', { bold: true }),
    createDeltaText('d', { bold: true })
  ])

  text.selection.start.x = 2
  text.selection.end.x = 9

  text.transactSync(tr => {
    tr.format({ bold: false })
    t.is(tr.ensureBlockAtFront(), false)
    t.is(tr.cursor, 2)

    t.deepEqual(tr.attributes, { bold: false })

    t.deepEqual(tr.operations, [
      createRetainOperation(2),
      createRetainOperation(7, tr.attributes)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('H'),
    createDeltaText('e', { bold: false }),
    createDeltaText('l', { bold: false }),
    createDeltaText('l', { bold: false }),
    createDeltaText('o', { bold: false }),
    createDeltaText(' ', { bold: false }),
    createDeltaText('W', { bold: false }),
    createDeltaText('o', {
      bold: false,
      underline: true,
    }),
    createDeltaText('r', { bold: true }),
    createDeltaText('l', { bold: true }),
    createDeltaText('d', { bold: true })
  ])

  text.selection.start.x = 9
  text.selection.end.x = 10

  text.transactSync(tr => {
    tr.format({ bold: false })
    t.is(tr.ensureBlockAtFront(), false)
    t.is(tr.cursor, 9)

    t.deepEqual(tr.attributes, { bold: false })

    t.deepEqual(tr.operations, [
      createRetainOperation(9),
      createRetainOperation(1, tr.attributes)
    ])
  })

  t.deepEqual(text.delta, [
    createDeltaBlock(Block.paragraph),
    createDeltaText('H'),
    createDeltaText('e', { bold: false }),
    createDeltaText('l', { bold: false }),
    createDeltaText('l', { bold: false }),
    createDeltaText('o', { bold: false }),
    createDeltaText(' ', { bold: false }),
    createDeltaText('W', { bold: false }),
    createDeltaText('o', {
      bold: false,
      underline: true,
    }),
    createDeltaText('r', { bold: false }),
    createDeltaText('l', { bold: true }),
    createDeltaText('d', { bold: true })
  ])
})
