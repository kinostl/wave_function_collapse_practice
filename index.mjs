import _ from 'lodash'

const yMax = 12
const xMax = 24

class ArraySet extends Set {
  add (arr) {
    super.add(JSON.stringify(arr))
  }
  has (arr) {
    return super.has(JSON.stringify(arr))
  }
}

/*
const e = [
  [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  ['▛', '▀', '▀', ' ', '▀', '▀', '▜', '▛', '▀', '▀', ' ', '▀', '▀', '▜'],
  ['▌', ' ', ' ', ' ', ' ', ' ', '▐', '▌', ' ', ' ', ' ', ' ', ' ', '▐'],
  ['▌', ' ', ' ', ' ', ' ', ' ', '▐', '▌', ' ', ' ', ' ', ' ', ' ', '▐'],
  [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  ['▌', ' ', ' ', ' ', ' ', ' ', '▐', '▌', ' ', ' ', ' ', ' ', ' ', '▐'],
  ['▌', ' ', ' ', ' ', ' ', ' ', '▐', '▌', ' ', ' ', ' ', ' ', ' ', '▐'],
  ['▙', '▄', '▄', ' ', '▄', '▄', '▟', '▙', '▄', '▄', ' ', '▄', '▄', '▟'],
  ['▛', '▀', '▀', ' ', '▀', '▀', '▜', '▛', '▀', '▀', ' ', '▀', '▀', '▜'],
  ['▌', ' ', ' ', ' ', ' ', ' ', '▐', '▌', ' ', ' ', ' ', ' ', ' ', '▐'],
  ['▌', ' ', ' ', ' ', ' ', ' ', '▐', '▌', ' ', ' ', ' ', ' ', ' ', '▐'],
  [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  ['▌', ' ', ' ', ' ', ' ', ' ', '▐', '▌', ' ', ' ', ' ', ' ', ' ', '▐'],
  ['▌', ' ', ' ', ' ', ' ', ' ', '▐', '▌', ' ', ' ', ' ', ' ', ' ', '▐'],
  ['▙', '▄', '▄', ' ', '▄', '▄', '▟', '▙', '▄', '▄', ' ', '▄', '▄', '▟']
]
*/
const e = [
  ['X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', ' ', ' ', 'X'],
  ['X', 'X', 'X', 'X', ' ', ' ', 'X'],
  [' ', ' ', '0', ' ', ' ', ' ', 'X'],
  ['X', 'X', 'X', 'X', ' ', ' ', 'X'],
  ['X', 'X', 'X', 'X', ' ', ' ', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X']
]

let tuples = new ArraySet()
let tileWeights = new Map()
let tilesByWeight = []

const eyMax = e.length
const exMax = e[0].length
for (let y = 0; y < eyMax; y++) {
  for (let x = 0; x < exMax; x++) {
    const _this = e[y][x]
    if (tileWeights.has(_this)) {
      tileWeights.set(_this, tileWeights.get(_this) + 1)
    } else {
      tileWeights.set(_this, 1)
    }
    tilesByWeight.push(_this)
    if (y - 1 >= 0) {
      const _north = e[y - 1][x]
      tuples.add([_this, 'b', _north])
    }
    if (x + 1 < exMax) {
      const _east = e[y][x + 1]
      tuples.add([_this, 'l', _east])
    }
    if (y + 1 < eyMax) {
      const _south = e[y + 1][x]
      tuples.add([_this, 'a', _south])
    }
    if (x - 1 >= 0) {
      const _west = e[y][x - 1]
      tuples.add([_this, 'r', _west])
    }
  }
}

const blankMap = []
const tiles = [...tileWeights.keys()]
tuples = [...tuples].map(curr => JSON.parse(curr))

for (let y = 0; y < yMax; y++) {
  blankMap[y] = []
  for (let x = 0; x < xMax; x++) {
    blankMap[y][x] = {
      x,
      y,
      options: _.cloneDeep(tiles)
    }
  }
}

const isCollapsed = () => {
  for (let y = 0; y < yMax; y++) {
    for (let x = 0; x < xMax; x++) {
      if (!tiles.includes(blankMap[y][x].options)) return false
    }
  }
  return true
}

const getShannonEntropy = curr => {
  let sumOfWeights = 0
  let sumOfWeightLogWeights = 0
  curr.options.forEach(o => {
    const weight = tileWeights.get(o)
    sumOfWeights = sumOfWeights + weight
    sumOfWeightLogWeights = sumOfWeightLogWeights + weight * Math.log(weight)
  })

  return Math.log(sumOfWeights) - sumOfWeightLogWeights / sumOfWeights
}

const getLowestEntropy = () => {
  const groupedByEntropy = _.groupBy(
    _.filter(_.flatten(blankMap), o => _.isArray(o.options)),
    getShannonEntropy
  )
  const entropies = _.keys(groupedByEntropy)
  const lowestEntropy = _.minBy(entropies, o => _.toInteger(o))
  const lowestEntropyTile = _.sample(groupedByEntropy[lowestEntropy])

  return lowestEntropyTile
}

const getValidOptions = (tile, direction) => {
  return tuples.filter(o => o[0] === tile && o[1] === direction).map(o => o[2])
}
const iterate = () => {
  const { x, y, options } = getLowestEntropy()
  const chosenTile = _.sample(_.filter(tilesByWeight, o => options.includes(o)))
  blankMap[y][x] = {
    x,
    y,
    options: chosenTile
  }

  if (y - 1 >= 0) {
    if (_.isArray(blankMap[y - 1][x].options)) {
      blankMap[y - 1][x] = {
        x,
        y: y - 1,
        options: getValidOptions(chosenTile, 'b')
      }
    }
  }
  if (x + 1 < xMax) {
    if (_.isArray(blankMap[y][x + 1].options)) {
      blankMap[y][x + 1] = {
        x: x + 1,
        y,
        options: getValidOptions(chosenTile, 'l')
      }
    }
  }
  if (y + 1 < yMax) {
    if (_.isArray(blankMap[y + 1][x].options)) {
      blankMap[y + 1][x] = {
        x,
        y: y + 1,
        options: getValidOptions(chosenTile, 'a')
      }
    }
  }
  if (x - 1 >= 0) {
    if (_.isArray(blankMap[y][x - 1].options)) {
      blankMap[y][x - 1] = {
        x: x - 1,
        y,
        options: getValidOptions(chosenTile, 'r')
      }
    }
  }
}

while (!isCollapsed()) {
  iterate()
}

console.log(blankMap.map(curr => curr.map(o => o.options).join('')).join('\n'))
