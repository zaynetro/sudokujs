var Sudoku = function (size) {

  var digits = '123456789';
  var letters = 'ABCDEFGHI';

  this.digits = digits;

  // Sudoku table rows
  this.rows = letters;
  // Sudoku table columns
  this.cols = digits;
  // Array of all squares (all cells)
  this.squares = this.cross(this.rows, this.cols);
  // Array of all units (rows, columns, regions(boxes))
  this.unitlist = this.makeUnitList();
  // Squares mapped to the all units the square is member of
  this.units = this.makeUnits();
  // Squares of all unions that the square is member of
  this.peers = this.makePeers();
};

/**
 * Make array of elements combined from A and B
 */
Sudoku.prototype.cross = function (A, B) {
  var arr = [];
  var ch1, ch2;

  for(ch1 in A) {
    for(ch2 in B) {
      arr.push(A[ch1] + B[ch2]);
    }
  }

  /*
  // ES6 try out
  return [for(ch1 of A) for (ch2 of B) ch1 + ch2];
  */

  return arr;
};

Sudoku.prototype.makeUnitList = function () {
  var arr = [];
  var ch, ch2;

  // Get all rows
  for(ch in this.rows) {
    arr.push(this.cross(this.rows[ch], this.cols));
  }

  /*
  // ES6 try out
  arr.push([for(ch of this.rows) this.cross(ch, this.cols)]);
  */

  // Get all columns
  for(ch in this.cols) {
    arr.push(this.cross(this.rows, this.cols[ch]));
  }

  /*
  // ES6 try out
  arr.push([for(ch of this.cols) this.cross(this.rows, ch)]);
  */

  // Get all regions
  var region_rows = ['ABC', 'DEF', 'GHI'];
  var region_cols = ['123', '456', '789'];

  for(ch in region_rows) {
    for(ch2 in region_cols) {
      arr.push(this.cross(region_rows[ch], region_cols[ch2]));
    }
  }

  /*
  // ES6 try out
  region_rows.forEach((v1) => {
    region_cols.forEach((v2) => {
      arr.push(this.cross(v1, v2));
    });
  });
  */

  return arr;
};

Sudoku.prototype.makeUnits = function () {
  var obj = {};
  var el;

  for(el in this.squares) {
    obj[this.squares[el]] = this.unitlist.filter(function (subarr) {
      return subarr.indexOf(this.squares[el]) !== -1;
    }.bind(this));
  }

  return obj;
};

Sudoku.prototype.makePeers = function () {
  var obj = {};
  var el;
  var tmp;
  var tmp2 = [];

  for(el in this.squares) {
    var seen = [];
    tmp2.length = 0;

    // Return square row, column and section
    tmp = this.unitlist.filter(function (subarr) {
      return subarr.indexOf(this.squares[el]) !== -1;
    }.bind(this));

    // Push elements to peers object
    tmp.forEach(function (v) {
      tmp2 = tmp2.concat(v);
    }.bind(this));

    tmp2.forEach(function (v) {
      if(seen.indexOf(v) == -1 && v !== this.squares[el]) seen.push(v);
    }.bind(this));

    obj[this.squares[el]] = seen;
  }

  return obj;
};

/**
 * Convert a grid to the object with squares as keys and possible values as values
 */
Sudoku.prototype.parseGrid = function (grid) {
  var values = {};
  var i;
  var key;
  var gridValues = this.gridValues(grid);
  var props = Object.getOwnPropertyNames(gridValues);
  var s;

  for(i in this.squares) {
    s = this.squares[i];
    /*values[s] = /[0.]/.test(gridValues[s]) ? this.digits : gridValues[s];*/
    values[s] = this.digits;
  }

  props.forEach(function (key) {
    if(this.digits.indexOf(gridValues[key]) !== -1 && !this.assign(values, key, gridValues[key])) return false;
  }.bind(this));

  return values;
};

/**
 * Convert a grid to the object with squares as keys and chars as values
 */
Sudoku.prototype.gridValues = function (grid) {
  var obj = {};
  var i;
  var ch;
  for(i in grid) {
    if(i >= this.squares.length) return false;
    ch = grid[i];
    if(/[0-9.]/.test(ch)) obj[this.squares[i]] = grid[i];
  }

  return obj;
};

Sudoku.prototype.assign = function (values, s, d) {
  console.log(arguments);
  var other_values = values[s].replace(d, '');
  var flag = true;
  var d2;

  for(d2 in other_values) {
    flag = !!this.eliminate(values, s, other_values[d2]);
    if(!flag) return false;
  }

  return values;
};

Sudoku.prototype.eliminate = function (values, s, d) {
  var d2;
  var s2;
  var flag = true;
  var u;
  var dplaces = [];

  if(values[s].indexOf(d) === -1) return values;
  values[s] = values[s].replace(d, '');

  // (1) If a square s is reduced to one value d2, then eliminate d2 from the peers.
  if(values[s].length === 0) return false; // Contradiction: all values were removed
  else if(values[s].length === 1) {
    d2 = values[s];
    for(s2 in this.peers[s]) {
      flag = !!this.eliminate(values, this.peers[s][s2], d2);
      if(!flag) return false;
    }
  }

  // (2) If a unit u is reduced to only one place for a value d, then put it there.
  for(u in this.units[s]) {
    dplaces = this.units[s][u].filter(function (el) {
      return values[s].indexOf(el) === -1;
    }.bind(this));

    if(dplaces.length === 0) return false; // Contradiction: no place for this value
    else if(dplaces.length === 1) {
      if(!this.assign(values, dplaces[0], d));
    }
  }

  return values;
};

Sudoku.prototype.solve = function (grid) {
  return this.search(this.parseGrid(grid));
};

Sudoku.prototype.search = function (values) {
  if(!values) return false;

  var s;
  var min;
  var v;

  var solved = Object.getOwnPropertyNames(values).every(function (el) {
    return el.length == 1;
  });

  if(solved) return values;

  for(s in this.squares) {
    v = this.squares[s];
    if(values[v] > 1) {
      min = Math.min(values[v].length, min);
    }
  }


/*
    ## Chose the unfilled square s with the fewest possibilities
    n,s = min((len(values[s]), s) for s in squares if len(values[s]) > 1)

    return some(search(assign(values.copy(), s, d))
    for d in values[s])
*/
  // TO DO
  return false;
};

Sudoku.prototype.some = function (seq) {
  for(var ch in seq) {
    if(seq[ch]) return seq[ch];
  }
  return false;
};

Sudoku.prototype.html = function () {
  return "<h2>Output</h2>";
};

//module.exports = Sudoku;

var s = new Sudoku();
console.log(s.parseGrid("4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......"));
