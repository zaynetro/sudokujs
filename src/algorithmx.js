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
 * (Y is a MAP)
 * Y = {
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
 * X = {
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
  let X = new Map();

  for(let i of old_X) {
    X.set(i, []);
  }

  for(let [i, row] of Y) {
    for(let j of row) {
      if(X.has(j)) {
        let arr = X.get(j);
        arr.push(i);
        X.set(j, arr);
      }
    }
  }

  return { X, Y };
}

function* solve(X, Y, solution = []) {
  // If matrix is empty terminate
  if(!X || !X.size) yield solution;
  else {
    // Find column with the minimum length of the value
    let c = 0;
    let min = X.size + 1;
    for(let [k, v] of X) {
      if(v.length < min) {
        min = v.length
        c = k;
      }
    }

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

  if(!Y.has(r)) return cols;
  for(let j of Y.get(r)) {
    // j is a column(number)
    for(let i of X.get(j)) {
      // i is a row(letter)
      for(let k of Y.get(i)) {
        // k is a column(number)
        if(k != j) {
          // Remove column(k) from X's row(i)
          let index = X.get(k).indexOf(i);
          if(index > -1) X.get(k).splice(index, 1);
        }
      }
    }
    // Add letters and remove them from X
    let el = X.get(j);
    cols.push(el);
    X.delete(j);
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

  let X = [];

  const [rows, cols] = size;
  const N = rows * cols;

  X = X.concat([for(rc of product(range(N), range(N))) { rc }]);
  X = X.concat([for(rn of product(range(N), range(1, N + 1))) { rn }]);
  X = X.concat([for(cn of product(range(N), range(1, N + 1))) { cn }]);
  X = X.concat([for(bn of product(range(N), range(1, N + 1))) { bn }]);

  let Y = new Map();

  for(let [r, c, n] of product(range(N), range(N), range(1, N + 1))) {
    let b = Math.ceil(r / rows) * rows + Math.ceil(c / cols); // Box number
    Y.set([r, c, n], [
      { rc : [r, c] },
      { rn : [r, n] },
      { cn : [c, n] },
      { bn : [b, n] }
    ]);
  }

  let { X, Y } = exact_cover(X, Y);

  console.log(X);

  yield true;

  for(let [i, row] of grid.entries()) {
    for(let [j, n] of row.entries()) {
      if(n) select(X, Y, [i, j, n]);
    }
  }

  for(let solution of solve(X, Y, [])) {
    for(let [r, c, n] of solution) {
      grid[r,c] = n;
    }
    yield grid;
  }

  yield false;
}


var grid = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]];

console.log(solve_sudoku([3, 3], grid).next().value);


/* First test

let X = [1,2,3];
let Y = new Map();
Y.set('A', [1]);
Y.set('B', [1,2]);
Y.set('C', [2,3]);

/* Second test

let X = [1,2,3,4,5,6,7];
let Y = new Map();
Y.set('A', [1,4,7]);
Y.set('B', [1,4]);
Y.set('C', [4,5,7]);
Y.set('D', [3,5,6]);
Y.set('E', [2,3,6,7]);
Y.set('F', [2,7]);

let { X, Y } = exact_cover(X, Y);

console.log(solve(X, Y, []).next().value);

*/

