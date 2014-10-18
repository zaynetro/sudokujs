/**
 * Solving sudoku implemented in ES6
 * http://norvig.com/sudoku.html
 */

function cross(A, B) {
  return [for(a of A) for(b of B) a+b];
}

var Sudoku = function () {

  this.digits = '123456789';

  this.rows = 'ABCDEFGHI';
  this.cols = this.digits;

  this.squares = cross(this.rows, this.cols);
  this.unitlist = [].concat([for(c of this.cols) cross(this.rows, c)])
                    .concat([for(r of this.rows) cross(r, this.cols)])
                    .concat([for(rs of ['ABC', 'DEF', 'GHI']) for(cs of ['123', '456', '789']) cross(rs, cs)]);

  this.units = new Map();
  this.peers = new Map();
  for(let s of this.squares) {
    this.units.set(s, [for(u of this.unitlist) if(u.indexOf(s) > -1) u]);

    let units = this.units.get(s);
    // Make Array out of Array of Arrays
    // Doesn't work:
    // units = units.reduce((prev, curr) => { prev.concat(curr); }, []);
    units = units.reduce(function (prev, curr) { return prev.concat(curr); }, []);
    let peers = [];
    // Add unique items to peers
    units.forEach(el => { if(peers.indexOf(el) === -1 && el !== s) peers.push(el); });
    this.peers.set(s, peers);
  }

};

/**
 * Convert a grid to the object with squares as keys and chars as values
 */
Sudoku.prototype.fromString = function (str) {
  let chars = [for(ch of str) if(/[0-9.]/.test(ch)) ch];
  let grid = new Map();
  let i = 0;

  for(let s of this.squares) {
    grid.set(s, chars[i++]);
  }

  return grid;
};

Sudoku.prototype.parseGrid = function (grid) {
  let values = new Map();

  // To start, every square can be any digit; then assign values from the grid.
  for(let s of this.squares) {
    values.set(s, this.digits);
    console.log(values.get(s));
  }

  for(let [s, d] of this.fromString(grid)) {
    if(this.digits.indexOf(d) > -1 && !this.assign(values, s, d)) return false;
  }

  return values;
};

Sudoku.prototype.assign = function (values, s, d) {
  let other_values = values.get(s).replace(d, '');
  let flag = true;

  for(let d2 of other_values) {
    flag = !!this.eliminate(values, s, d2);
    if(!flag) {
      console.log(values);
      return false;
    }
  }

  return values;
};

Sudoku.prototype.eliminate = function (values, s, d) {
  console.log('ELIMINATE FUNCTION');
  //debugger;
  let tmp = values.get(s);
  if(values.get(s).indexOf(d) === -1) return values; // Already eliminated
  values.set(s, values.get(s).replace(d, ''));
  // (1) If a square s is reduced to one value d2, then eliminate d2 from the peers.
  if(!values.get(s).length) return false; // Contradiction: removed last value
  else if(values.get(s).length == 1) {
    let d2 = values.get(s);
    let flag = true;

    for(let s2 of this.peers.keys()) {
      flag = !!this.eliminate(values, s2, d2);
      if(!flag) return false;
    }
  }
  // (2) If a unit u is reduced to only one place for a value d, then put it there.
  for(let u of this.units.get(s)) {
    let dplaces = [for(s of u) if(values.get(s).indexOf(d) > -1) s];

    if(!dplaces.length) return false;
    else if(dplaces.length == 1) {
      if(!this.assign(values, dplaces[0], d)) return false;
    }
  }

  return values;
};


let s = new Sudoku();
console.log(s.parseGrid("4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......"));
