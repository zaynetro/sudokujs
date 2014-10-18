# Sudoku.js

The main goal is to learn some new algorythms and to play with new ES6 features. Besides that to provide library for solving and generating sudoku

## Progress

- [x] Implement Algorithm X methods
- [x] Test methods with different problems
- [x] Implement sudoku solving methods
- [ ] Test sudoku solving methods
- [ ] Implement sudoku generating methods
- [ ] Test sudoku generating methods
- [ ] Test browser support with es6 to es5 compiler
- [ ] Write comparison functions instead of comparing as strings
- [ ] Add number of iterations counter to prevent infinite loops

## Problems

1. **Map.has()**

  Use arrays as keys
  ```javascript
  var m = new Map();
  m.set([1,2], 'hello');
  m.has([1,2]) === false;

  var arr = [2,3];
  m.set(arr, 'world');
  m.has(arr) === true;
  ```

2. **Doesn't solve all sudoku**

## Materials used

* [Solving Every Sudoku Puzzle by Peter Norvig](http://norvig.com/sudoku.html)
* [Ali Assaf's Algorithm X implementaion](http://www.cs.mcgill.ca/~aassaf9/python/algorithm_x.html)

License - MIT
