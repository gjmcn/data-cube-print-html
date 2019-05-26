Print [Data-Cubes](https://gjmcn.github.io/data-cube) in HTML documents.

See `docs/index.html` for [examples](https://gjmcn.github.io/data-cube-print-html).

The module adds two methods to `Array.prototype`:

* `print`: print a cube (or a standard array)

* `info`: print summary information about a cube (or a standard array)

These methods return a `<div>` containing the printed cube/array. Typically, we use the `to` option (see below) to specify where the array/cube should be printed; this is slightly simpler than adding the `<div>` to the document explicitly.

**Notes:**

* The module exports a function that can be used to change how entries, indices, keys and labels are formatted &mdash; see [Format](#format). When a `<script>` tag is used to load the module, the exported function is assigned to the global variable `setFormat`. See the [Data-Cube plugins page](https://gjmcn.github.io/data-cube/index.html?plugins) for further usage instructions.

* There are example styles in `docs/styles`. Using one of these is an easy way to get started (though the styles are currently rather minimal so be wary of other CSS leaking in).

* `print` will generate the same HTML for the standard array `[5,6,7]` and the vector `[5,6,7].toCube()`. However, `print` and `info` do *not* convert a standard array to a cube like core Data-Cube methods do.

## Options Argument

`print` takes a single 'options' object as an argument. The object can include the properties:


Property | Description
--- | ---
`to` |<li>falsy (default): returned `<div>` not added to document<li>string: passed to `document.querySelector`; `<div>` appended to selected element<li>HTML element: `<div>` appended to element<li>property `0` an HTML element: `<div>` appended to element
`label` | Array or singleton. The label of a dimension is printed if the corresponding entry is truthy (and the label exists). A singleton value is broadcast to all dimensions. Default: `true`.
`indexKey` | Array or singleton. The indices/keys of a dimension are printed if the corresponding entry is truthy. A singleton value is broadcast to all dimensions. Default: row and column indices/keys are printed; page indices/keys are printed if there are multiple pages or there are page keys or there is a page label that is being printed.
`type` | If truthy (default), `<td>`s representing entries have a class indicating their type. 
`entryAttr` | If truthy, `<td>`s representing entries have attributes `data-row`, `data-col` and `data-page`; the values are the entry indices/keys (keys are converted to strings, but not formatted). Default: `false`.
`tableAttr` | If truthy, the `<table>` for each page has a data-table attribute with the page index/key as the value (keys are converted to strings, but not formatted). Default: `false`.
`id` |`id` attribute for the returned `<div>`. Default: no `id`.

The `info` method also accepts an options argument, but only uses the properties `to` and `id`.

## Classes

`print` adds the following classes to the HTML elements that it creates:

Class | Tag | Description
--- | --- | ---
`data-cube-wrap` | `<div>` | `<div>` returned by `print` and `info`
`page-table` | `<table>` | page
`page-caption` | `<caption>` | page caption
`top-left` | `<td>`| empty element in top-left of page table
`label` | `<td>` or `<span>` | label
`row-label` | `<td>`| row label
`col-label` | `<td>`| column label
`page-label` | `<span>` | page label (inside page caption)
`ik` | `<td>` or `<span>` | index/key
`row-ik` | `<td>`| row index/key
`col-ik` | `<td>`| column index/key
`page-ik` | `<span>`| page index/key (inside page caption)
`entry` | `<td>`| entry

When the `type` option is truthy, each entry `<td>` contains an additional class; one of: `number`, `string`, `boolean`, `undefined`, `null`, `date`, `function`, `cube`, `array`, `other`.

Notes:

* Some table elements may not exist. For example, if row indices/keys are not being printed (see the `indexKey` option), the HTML tables for each page will not contain the associated `<td>` elements.

* Use data attributes to get the `<td>` element for an individual entry or a group of entries &mdash; see the `entryAttr` and `tableAttr` options.

The `<div>` returned by `info` also has the `data-cube-wrap` class. The `<table>` inside the `<div>` has the `info-table` class.

<h2 name="format" href="#format">Format</h2>

Every printed entry, index, key and label is passed through a 'format function'. This module exports a single function that can be used to alter the default format functions. For example:

```js
//if the module is loaded in a <script> tag, the
//exported function is the global variable setFormat
setFormat({
  number: x => '$' + Math.round(x),        //print numbers as dollars
  rowLabel: label => label.toUpperCase()   //print row labels in uppercase
});
```

The format functions are:

Group | Format Functions
--- | ---
Entry | `number`, `string`, `boolean`, `undefined`, `null`, `function`, `cube`, `array`, `date`, `other`
Index | `rowIndex`, `colIndex`, `pageIndex`
Key | `rowKey`, `colKey`, `pageKey`
Label | `rowLabel`, `colLabel`, `pageLabel`

**Notes:**

* The default format functions *do not* escape HTML strings.

* The default string format function *does* replace `\n` with `<br>`.

There are also some high-level formatting properties that can be modified using the exported function:

Name | Default | Description
--- | ---: | ---
`maxPrint` | `2000` | `print` does not print arrays/cubes with more than `maxPrint` entries; `info` is automatically called instead.
`maxStr` | `40` | The default string format function truncates string entries to `maxStr` characters. Ellipses are added where truncation is required.
`maxMag` | `1e6` | The default number format function uses scientific notation for entries with absolute value equal to or greater than `maxMag`.
`dp` | `4` | The default number format function uses `dp` decimal places for non-integers and uses scientific notation for entries with absolute value less than 10<sup>-dp</sup>.

Call the exported function with no arguments to reset all format functions and properties to their defaults.
