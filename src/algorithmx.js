/**
 * Algoritm X implementation on ES6 based on
 * http://www.cs.mcgill.ca/~aassaf9/python/algorithm_x.html
 */

'use strict';

/**
 * For a given set X and a collection Y
 * of subsets of X, there exists
 * a subcollection Y* of Y such that
 * Y* forms a partition of X.
 */

var X = new Set([1, 2, 3, 4, 5, 6, 7]);

var Y = new Map();

Y.set('A', [1, 4 ,7]);
Y.set('B', [1, 4]);
Y.set('C', [4, 5, 7]);
Y.set('D', [3, 5, 6]);
Y.set('E', [2, 3, 6, 7]);
Y.set('F', [2, 7]);

var { X, Y } = exact_cover(X, Y);

console.log(solve(X, Y).next().value);

/**
 * Transform X into dictionary representation
 * Example:
 *
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
function exact_cover(X, Y) {
  X = new Map();

  for(let [i, row] of Y) {
    for(let j of row) {
      var arr = X.has(j) ? X.get(j) : [];
      arr.push(i);
      X.set(j, arr);
    }
  }

  return { X, Y };
}

function* solve(X, Y, solution = []) {
  if(!X || !X.size) yield solution;
  else {
    // Find column with the minimum length of the value
    let c = 0;
    let min = X.size;
    for(let [k, v] of X) {
      if(v.length < min) {
        min = v.length
        c = k;
      }
    }

    for(let r of X.get(c)) {
      solution.push(r);
      var cols = select(X, Y, r);
      for(let s of solve(X, Y, solution)) yield s;
      deselect(X, Y, r, cols);
      solution.pop();
    }
  }
}

function select(X, Y, r) {
  var cols = [];

  for(let j of Y.get(r)) {
    for(let i of X.get(j)) {
      for(let k of Y.get(i)) {
        if(k != j) {
          let index = X.get(k).indexOf(i);
          if(index > -1) X.get(k).splice(index, 1);
        }
      }
    }
    var el = X.get(j);
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
