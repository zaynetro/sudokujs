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
  var d;
  var s;

  /*
  for(i in this.squares) {
    s = this.squares[i];
    values[s] = /[0.]/.test(gridValues[s]) ? this.digits : gridValues[s];
  }

  this.squares.forEach(function (square) {
    if(values[square].length === 1) {
      this.eliminate(values, square, '');
    }
  }.bind(this));
  */

  /**
   * To start, every square can be any digit; then assign values from the grid.
   */
  for(i in this.squares) {
    values[this.squares[i]] = this.digits;
  }

  for(i in props) {
    s = props[i];
    d = gridValues[s];

    if(this.digits.indexOf(d) !== -1 && !this.assign(values, s, d)) return false;
  }

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


Sudoku.prototype.assign = function (values, square, remove) {
  /**
   * Eliminate all the other values (except d) from values[s] and propagate.
   * Return values, except return False if a contradiction is detected.
   */
  var other_values = values[square].replace(remove, '');
  var flag = true;
  var i;

  for(i in other_values) {
    flag = !!this.eliminate(values, square, other_values[i]);
    if(!flag) return false;
  }

  return values;
};

/**
 * Eliminate from peers
 */
Sudoku.prototype.eliminate = function (values, square, remove) {
  var v;
  var key;
  var flag = true;
  var u;
  var dplaces;

  if(values[square].indexOf(remove) === -1) return values;
  values[square] = values[square].replace(remove, '');

  // Contradicion: square has no value
  if(values[square].length === 0) return false;

  // (1) If a square s is reduced to one value v, then eliminate v from the peers.
  if(values[square].length === 1) {
    v = values[square];

    for(key in this.peers[square]) {
      flag = !!this.eliminate(values, this.peers[square][key], v);
      if(!flag) return false;
    }
  }

  // (2) If a unit u is reduced to only one place for a value d, then put it there.
  for(u in this.units[square]) {
    dplaces = this.units[square][u].filter(function (el) {
      return values[el].indexOf(remove) !== -1;
    }.bind(this));

    if(dplaces.length === 0) return false; // Contradiction: no place for this value
    else if(dplaces.length === 1) {
      // remove can only be in one place in unit; assign it there
      if(!this.assign(values, dplaces[0], remove)) return false;
    }
  }

  return values;
};


/**
 * OLD VERSION - IS NOT COMPLETE - DOESN'T WORK
 */
Sudoku.prototype.solve = function (grid) {
  return this.search(this.parseGrid(grid));
};

/**
 * Using depth-first search and propagation, try all possible values.
 */
Sudoku.prototype.search = function (values) {
  if(!values) return false;

  var i;
  var min = 10; // Use too high value
  var d;
  var s;
  var min_s;
  var seq = [];


  var solved = Object.getOwnPropertyNames(values).every(function (el) {
    return el.length === 1;
  });

  if(solved) return values;

  // Chose the unfilled square s with the fewest possibilities
  for(i in this.squares) {
    s = this.squares[i];
    if(values[s].length > 1) {
      min = Math.min(values[s].length, min);
      min_s = s;
    }
  }

  for(i in values[min_s]) {
    d = values[min_s][i];
    seq.push(this.search(this.assign(JSON.parse(JSON.stringify(values)), min_s, d)));
  }

  return this.some(seq);
};

/**
 * Return some element of seq that is true.
 */
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
console.log(s.solve("4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......"));
