Print [DataCubes](https://github.com/gjmcn/data-cube) in HTML documents:

* Cubes (or standard arrays) are printed as HTML tables.

* Each entry, index/key and label of a cube is passed through a format function:
	* there are seperate format functions for row labels, row keys, column labels etc
	* for entries, each type has its own format function
	* any format function can be changed or reset to its default

* Tables are styled using CSS or JavaScript. Table elements are automatically given classes to facilitate high-level styling. There is also an option to add data attributes so that printed entries can be found by their indices/keys.

## Usage

Install: `npm install --save data-cube-print-console`

The package uses the Universal Module Definition (UMD). It can be loaded in a  `<script>` tag in HTML or with an `import` statement in JavaScript. To load with `require`, use [Browserify](http://browserify.org/) or a similar tool.

The package adds two methods to `Array.prototype`:

* `print`: print a cube (or a standard array)

* `info`: print summary information about a cube (or a standard array)

These methods return an HTML containing the printed cube/array. This is useful when working interactively in Observable &mdash; [here is an example](URL WHEN DONE!!). In other cases, we use the `to` option (see below) to specify where the array/cube should be printed.

Notes:

* The package exports a function that can be used to change how entries, keys and labels are formatted &mdash; see [Format Functions](#format) below. When a `<script>` tag is used to load the package, the exported function is assigned to the global variable `printFormat`.


* `print` will generate the same HTML for the standard array `[5,6,7]` and the vector `[5,6,7].toCube()`. However, `print` and `info` do *not* convert a standard array to a cube like core DataCube methods do.

### Options Argument

`print` takes a single 'options' object as an argument. The object can include the properties:


Property | Description
|:--|:--|
`to` | If falsy (default), prints nothing; if a string, passes string to `document.querySelector` and appends printed array/cube to selected element; otherwise, if property value is an element, appends printed array/cube to it; otherwise, if property `0` is an elment, appends printed array/cube to it
`label` | Array or singleton. The label of a dimension is printed if the corresponding entry is truthy (and the label exists). A singleton value is broadcast to all dimensions. Default: labels are printed if they exist.
`indexKey` | Array or singleton. The indices/keys of a dimension are printed if the corresponding entry is truthy. A singleton value is broadcast to all dimensions. Default: row and col indices/keys are printed; page indices/keys are printed if there are multiple pages or there are page keys or there is a page label that is being printed.
`type` | If truthy (default), `<td>`s representing entries have a class indicating their type. 
`entryAttr` | If truthy, `<td>`s representing entries have attributes `data-row`, `data-col` and `data-page`; the values are the entry indices/keys (keys are converted to strings, but not formatted). Default: `false`.
`tableAttr` | If truthy, `<table>` for each page has a data-table attribute with the page index/key as the value (keys are converted to strings, but not formatted). Default: `false`.
`id` | An `id` for the wrapper `<div>`. Default: no `id` used.

The `info` method also accepts an options argument, but only use the properties: `to` and `id`.

### Classes and Attributes

<h3 name="format" href="#format">Format Functions</h3>

## Other

* use the package [data-cube-print-console](https://github.com/gjmcn/data-cube-print-console) to print cubes in the terminal
