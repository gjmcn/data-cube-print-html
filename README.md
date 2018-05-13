Print [DataCubes](https://github.com/gjmcn/data-cube) in HTML documents:

* Cubes (or standard arrays) are printed as HTML tables.

* Each entry, index/key and label of a cube is passed through a format function:
	* There are seperate format functions for row labels, row keys, column labels etc.
	* For entries, each type has its own format function.
	* Any format function can be changed or reset to its default.


HERE!!!!!!!!!!!!!!

* Tables are styled using CSS or JavaScript. Table elements are given intutitive class names to facilitate this. Furthermore, there is an opton to give data attributes so any entry can be found by its indices/keys.






## Usage

DO THIS WHEN DECIDE HOW WILL PACKAGE

## 

## Notes

* `print` and `info` can be used to print intermediate results, e.g. `x.sum().print().sqrt()`.


* `print` and `info` do *not* convert a standard array to a cube like core DataCube methods do


* this package cannot currently be used in the browser; use [data-cube-print-html](https://github.com/gjmcn/data-cube-print-html) to print cubes as HTML tables

