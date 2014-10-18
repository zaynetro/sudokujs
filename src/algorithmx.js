/**
 * Algoritm X ES6 implementation based on
 * http://www.cs.mcgill.ca/~aassaf9/python/algorithm_x.html
 */

'use strict';

/**
 * For a given set X and a collection Y
 * of subsets of X, there exists
 * a subcollection Y* of Y such that
 * Y* forms a partition of X.
 */

/*
var X = [1, 2, 3, 4, 5, 6, 7];
*/

/**
 * Transform X into dictionary representation
 * Example:
 *
 * X = [1, 2, 3, 4, 5, 6, 7]
 *
 * Y = Map {
 *   'A': [1, 4, 7],
 *   'B': [1, 4],
 *   'C': [4, 5, 7],
 *   'D': [3, 5, 6],
 *   'E': [2, 3, 6, 7],
 *   'F': [2, 7]
 * }
 *
 * Then
 *
 * X = Map {
 *   1: ['A', 'B'],
 *   2: ['E', 'F'],
 *   3: ['D', 'E'],
 *   4: ['A', 'B', 'C'],
 *   5: ['C', 'D'],
 *   6: ['D', 'E'],
 *   7: ['A', 'C', 'E', 'F']
 * }
 *
 */
function exact_cover(old_X, Y) {
  let X = wrap(old_X);

  for(let [i, row] of Y.entries()) {
    for(let j of row) {
      X.get(j).push(i);
    }
  }

  return { X, Y };
}

function* solve(X, Y, solution = []) {
  // If matrix is empty terminate
  if(!X || !X.size()) yield solution;
  else {
    // Find column with the minimum length of the value
    let c = 0;
    let min = X.size() + 1;
    for(let [k, v] of X.entries()) {
      if(v.length < min) {
        min = v.length
        c = k;
      }
    }

    let size_X = X.size();
    let el_X = X.get(c);
    if(min === 0) debugger;

    for(let r of X.get(c)) {
      solution.push(r);
      let cols = select(X, Y, r);
      for(let s of solve(X, Y, solution)) yield s;
      deselect(X, Y, r, cols);
      solution.pop();
    }
  }
}

function select(X, Y, r) {
  var cols = [];

  for(let j of Y.get(r)) {
    // j is a column(number)
    let tmp = X.get(j);
    for(let i of X.get(j)) {
      // i is a row(letter)
      for(let k of Y.get(i)) {
        // k is a column(number)
        // Compare array as strings
        if(k.toString() != j.toString()) {
          // Remove column(k) from X's row(i)
          let val = X.get(k);
          let index = val.indexOf(i);
          if(index > -1) val.splice(index, 1);
        }
      }
    }
    // Add letters and remove them from X
    cols.push(X.get(j));
    X.remove(j);
  }

  return cols;
}

function deselect(X, Y, r, cols) {
  for(let j of Y.get(r).reverse()) {
    X.set(j, cols.pop());
    for(let i of X.get(j)) {
      for(let k of Y.get(i)) {
        if(k != j) X.get(k).push(i);
      }
    }
  }
}

/**
 * Calculate cartesian product
 * works with multiple arguments
 * Example:
 *   product(['A', 'B'], [1, 2]) => [['A', 1], ['A', 2],['B', 1], ['B', 2]]
 *
 */
function product(...a) {
  var result = [[]];
  for(let el of a) {
    result = [for(x of result) for(y of el) [].concat(x, [y])];
  }
  return result;
}

/**
 * Return list of numbers from start to end
 */
function range(start, end) {
  if(!end) {
    end = start
    start = 0;
  }

  var list = [];
  for(let i = start; i < end; i++) list.push(i);
  return list;
}


function* solve_sudoku(size, grid) {
  let duration = new Date();

  let X = [];

  const [rows, cols] = size;
  const N = rows * cols;

  X = X.concat([for(rc of product(range(N), range(N))) ['rc', rc]]);
  X = X.concat([for(rn of product(range(N), range(1, N + 1))) ['rn', rn]]);
  X = X.concat([for(cn of product(range(N), range(1, N + 1))) ['cn', cn]]);
  X = X.concat([for(bn of product(range(N), range(1, N + 1))) ['bn', bn]]);

  let Y = new Map();
  Y = wrap(Y);

  for(let [r, c, n] of product(range(N), range(N), range(1, N + 1))) {
    let b = Math.floor(r / rows) * rows + Math.floor(c / cols); // Box number
    Y.set([r, c, n], [
      ['rc', [r, c]],
      ['rn', [r, n]],
      ['cn', [c, n]],
      ['bn', [b, n]]
    ]);
  }

  let { X, Y } = exact_cover(X, Y);

  for(let [i, row] of grid.entries()) {
    for(let [j, n] of row.entries()) {
      if(n) select(X, Y, [i, j, n]);
    }
  }

  for(let solution of solve(X, Y, [])) {
    for(let [r, c, n] of solution) {
      grid[r][c] = n;
    }
    let now = new Date();
    console.log('Time spent: ' + (now - duration) + 'ms');
    yield grid;
  }

  yield null;
}

/**
 * Wrapper of Map object to make array indices work
 * @param  {Array} input Array of indices
 *
 * Creates two maps:
 *   data = Map { unique index : [] }
 *   links = Map {
 *     input index to String : {
 *       data : data index
 *       origin : input original index
 *     }
 *   }
 *
 *  Returns following functions:
 *
 *    - get [the same as Map.get()]
 *    - set [Map.set()]
 *    - remove [Map.delete()]
 *    - size [Map.size] Function!!
 *    - entries [Map.entries()]
 *
 */
var wrap = function (input) {

  var links = new Map();
  var data = new Map();
  var last_i = data.size;

  for(let i of input) {
    add(i, [])
  }

  function add(k, v) {
    data.set(last_i, v);
    links.set(k.toString(), {
      data : last_i,
      origin : k
    });
    last_i++;
  }

  return {

    get : function (k) {
      let ktoS = k.toString();
      if(!links.has(ktoS)) return null;
      return data.get(links.get(ktoS).data) || null;
    },

    set : function (k, v) {
      let ktoS = k.toString();
      if(!links.has(ktoS)) {
        add(k,v);
      } else {
        data.set(links.get(ktoS).data, v);
      }
    },

    remove : function (k) {
      let ktoS = k.toString();
      let link = links.get(ktoS);
      if(!link) return false;
      return data.delete(link.data) && links.delete(ktoS);
    },

    size : function () {
      return data.size;
    },

    entries : function* () {
      for(let link of links.values()) {
        yield [link.origin, data.get(link.data)];
      }
    },

    // REMOVE
    getData : function () { return data; },
    getLinks : function () { return links; }

  };

};

/**
 * Convert a grid to the object with squares as keys and chars as values
 */
function fromString (size, str) {
  var grid = [];
  const N = size[0] * size[1];
  let i = 0;
  let j = 0;

  for(let ch of str) {
    if(/[0-9]/.test(ch)) {
      if(!grid[i]) grid[i] = [];
      grid[i].push(ch === '.' ? 0 : +ch);
      j++;
      if(j >= N) {
        j = 0;
        i++;
      }
    }
  }

  return grid;
};

let size = [3, 3];

let str = '400000805' +
          '030000000' +
          '000700000' +
          '020000060' +
          '000080400' +
          '000010000' +
          '000603070' +
          '500200000' +
          '104000000';

let grid = fromString(size, str);

/*console.log(grid);
debugger;*/

/*grid =  [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]];*/

let solution = solve_sudoku(size, grid).next().value;

console.log(solution);

for(let el of solution) {
  console.log(el.toString());
}
