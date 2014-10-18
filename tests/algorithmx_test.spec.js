require('../src/algorithmx');

describe('algorithmx', function () {

  describe('Product function', function () {

    it('Two arguments', function () {
      expect(product(['A', 'B'], [1])).toEqual([['A', 1], ['B', 1]]);
    });

    it('Three arguments', function () {
      expect(product(['A', 'B'], [1], [2, 3]))
        .toEqual([['A', 1, 2], ['A', 1, 3], ['B', 1, 2], ['B', 1, 3]]);
    });

  });

  describe('Range function', function () {

    it('Missing argument', function () {
      expect(range()).toEqual([]);
    });

    it('Single argument', function () {
      expect(range(5)).toEqual([0, 1, 2, 3, 4]);
    });

    it('Two arguments', function () {
      expect(range(2, 4)).toEqual([2, 3]);
    });

  });

  describe('Exact cover', function () {

    var arrayEquality = function(first, second) {
      return first == second || first.reverse() == second;
    };

    beforeEach(function() {
      jasmine.addCustomEqualityTester(arrayEquality);
    });

    it('Solve', function () {
      let X = [1, 2, 3];
      let Y = new Map();
      Y.set('A', [1]);
      Y.set('B', [1, 2]);
      Y.set('C', [2, 3]);
      let { X, Y } = exact_cover(X, Y);
      expect(solve(X, Y, []).next().value).toEqual(['A', 'C']);
    });

    /* Easy try

    let X = [1, 2];
    let Y = new Map();
    Y.set('A', [1, 2]);
    Y.set('B', [1]);


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

    */

  });

});
