var Sudoku = require('../js/sudoku');

describe("Sudoku", function () {

  var sudoku = new Sudoku();

  it("Length of squares", function () {
    expect(sudoku.squares.length).toEqual(81);
  });

  it("Length of unitlist", function () {
    expect(sudoku.unitlist.length).toEqual(27);
  });

  it("Length of all units", function () {
    for(var ch in sudoku.squares) {
      expect(sudoku.units[sudoku.squares[ch]].length).toEqual(3);
    }
  });

  it("Length of all peers", function () {
    for(var ch in sudoku.squares) {
      expect(sudoku.peers[sudoku.squares[ch]].length).toEqual(20);
    }
  });

  it("C2 unit", function () {
    expect(sudoku.units.C2).toEqual([['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'],
                                     ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2'],
                                     ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']]);
  });

  it("C2 peer", function () {
    expect(sudoku.peers.C2).toEqual(["C1", "C3", "C4", "C5", "C6", "C7", "C8", "C9",
                                     "A2", "B2", "D2", "E2", "F2", "G2", "H2", "I2",
                                     "A1", "A3", "B1", "B3"]);
  });

  it("Function gridValues", function () {
    expect(sudoku.gridValues("4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......").A1)
      .toEqual('4');
  });

});
