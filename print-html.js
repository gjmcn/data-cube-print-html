{
  'use strict';
  
  const helper = require('data-cube-helper');
    
  //--------------- options and prep ---------------//
  
  //high-level options
  const dp = 4;
 	const maxPrint = 2000;
  const maxStr = 40;
  const maxMag = 1e6;  //scientific notation used for larger values
  
  
  //--------------- auxiliary ---------------//
  
  //str[, array, array] -> str, wraps val in <td> tag.
  //  cls: if passed, a class is added for each entry
  //  rcp: if passed, the 3 entries are included as values of
  //       the attributes data-row, data-col and data-page
  const tdWrap = (val, cls, rcp) => {
    s = '<td';
    if (cls) s += ` class="${cls.join(' ')}"`;
    if (rcp) s += ` data-cube-row="${rcp[0]}" data-cube-col="${
                    rcp[1]}" data-cube-page="${rcp[2]}"`;
    return `${s}>${val}</td>`;
  };

  //truncate string if longer than max
  const truncate = (s,mx) => s.length > mx ? s.slice(0,mx) + ' ...' : s;

  //format functions
  let fmt = {
    number: x => {
      if (Number.isInteger(x)) return = '' + x;
      else if (Math.abs(x) >= maxMag || Math.abs(x) < Math.pow(10,-dp)) {
        return (+x.toPrecision(dp)).toExponential();
      }
      else return x.toFixed(dp);
    },
    string: x => `'${truncate(x,maxStr)}'`,
    boolean: x => x,
    null: () => 'null',
    undefined: () => 'undefined',
    function: x => 'function',    
    date: x => ('' + x).replace(/\s*\([^\)]*\)/, ''),
    cube: x => 'cube (entries: ' + x.length + ', shape: ' + x._s + ')',
    array: x => 'array (entries: ' + x.length +')',
    other: x => truncate('' + x, maxStr),
    index: x => '(' + x + ')',
    key: x => truncate('' + x, maxStr),
    label: x => x,
    faint: x => x   //!! SHOULD NOT NEED THIS HERE?????
  };
  
  //entry format function
  const basicType = new Set(['number', 'string', 'boolean', 'undefined', 'function']);
  const fmtEntry = x => {
    const t = typeof x;
    if (basicType.has(t)) return [fmt[t](x), t];
    if (x === null) return [fmt.null(), 'null'];
    if (Array.isArray(x)) {
      if (x._data_cube) return [fmt.cube(x), 'cube'];
      else return [fmt.array(x), 'array'];
    }
    if (x instanceof Date) return [fmt.date(x), 'date'];
    return [fmt.other(x), 'other'];
  };

  
  //--------------- print cube or standard array ---------------//

  //MOVE MOST DETAILS TO README
  //elmt/nodeList/array[, object] -> cube/str
  //elm:
  //  -'string': nothing printed; returns HTML string for the table
  //  -falsy: table appended to the document body; returns the cube
  //  -DOM element: table appended to the element, returns the cube
  //  -otherwise: attempts to append table to elm[0]
  //ops:
  //  -indKey: array, the indices/keys of a dimension are printed
  //   if the corresponding entry is truthy
  //  -label: array, label of a dimension is printed if the
  //   corresponding entry is truthy (and the label exists)
  //  -type: if truthy, <td>s representing entries have a class
  //   indicating their type
  //  -indKey: if truthy, <td>s representing entries have a attributes
  //   data-cube-row, data-cube-col, data-cube-page
  //An array is printed as a vector, but the array is NOT converted to
  //a cube.
  
  
  !!!!!HERE
  
  - any potentially bad consequences of printing to elm[0]
      -NO BECAUSE CAN USE DOCUMENT.BODY.CONTAINS FOR ELM AND ELM[0]
  
  - ???say something about the when use default - if indKey and label both falsy

  
  
  helper.addArrayMethod('print', function(elm, ops) {
    
    
    
    
    
    
    helper.assert.single(retStr);
    let str;
    //use info if empty or too many entries
    if (this.length > maxPrint || this.length === 0) return this.info(retStr);
    //cube
    else if (this._data_cube) {
      const [nr, nc, np] = this._s;
      if (this._k) {
        var [rk,ck,pk] = this._k;
      }
      if (this._l) {
        var [rl,cl,pl] = this._l;
      }
      //1st row: col and row labels in 1st entry then col indices/keys
      let colInfo = new Array(nc+1);
      let topLeft = '';
      if (cl) topLeft += fmt.label(cl + ' →');
      if (rl) {
        if (cl) topLeft += '\n';
        topLeft += fmt.label(rl + ' ↓');
      }
      if (ck) colInfo = [topLeft].concat(Array.from(ck.keys()).map(fmt.key));
      else {
        colInfo[0] = topLeft;
        for (let c=0; c<nc; c++) colInfo[c+1] = fmt.index(c);
      }
      colInfo = colInfo.map(a => ({value:a}));
      //pages
      str = '';
      let rkAr, pkAr;
      if (rk) rkAr = Array.from(rk.keys());
      if (pk) pkAr = Array.from(pk.keys());
      for (let p=0; p<np; p++) {
        if (np > 1 || pk || pl) {
          str += `\n  ${(pl ? fmt.label(pl) : fmt.faint('page')) + fmt.faint(':')} ${
                 pk ? fmt.key(pkAr[p]) : fmt.index(p)}`;
        }
        let data = new Array(nr);
        for (let r=0; r<nr; r++) {
          let thisRow = new Array(nc+1);
          thisRow[0] = rk ? fmt.key(rkAr[r]) : fmt.index(r);
          for (let c=0; c<nc; c++) {
            thisRow[c+1] = fmtEntry(this[r + nr*c + nr*nc*p]); 
          }
          data[r] = thisRow;
        }
        str += Table(colInfo, data, printOps).render() + '\n';
      }
    }
    //standard array
    else str = fmt.faint('\n  (standard array)') + 
      Table([], this.map( (a,i) => [fmt.index(i), fmtEntry(a)]), printOps).render() + '\n';
    //print and return
    if (retStr) return str;
    console.log(str);
    return this;
  });
  
  
  //--------------- print info on cube or standard array ---------------//
  
  helper.addArrayMethod('info', function(retStr) {
    helper.assert.single(retStr);
    let str;
    if (this._data_cube) {
      const keys = [];
      const labels = [];
      if (this._k) this._k.forEach((a,i) => a ? keys.push(helper.dimName[i]) : 0);
      if (this._l) this._l.forEach((a,i) => a ? labels.push(helper.dimName[i]): 0);
      str =
        '\n  entries:  ' + this.length + 
        '\n  shape:    ' + this._s +
        '\n  keys:     ' + (keys.length   ? keys   : '(none)') + 
        '\n  labels:   ' + (labels.length ? labels : '(none)') +
        '\n';
    }
    else str = '\n  (standard array)\n  entries: ' + this.length + '\n';
    if (retStr) return str;
    console.log(str);
    return this;
  });
  
  
  //--------------- export function to set compact ---------------//
  
  module.exports = ops => {
    if (ops.hasOwnProperty('compact')) printOps.compact = ops.compact;
  }

}

