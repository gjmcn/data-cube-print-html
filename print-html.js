
//NOTES:
  //use document.body.contains to see if elmt exists
  // check using eg _l not this._l

{
  'use strict';
  
  const helper = require('data-cube-helper');
  const {addArrayMethod, polarize, assert, dimName} = helper;
      
  //change these here for now
  const dp = 4;           //decimal places
  const maxPrint = 2000;  //show info rather than table if more entries
  const maxStr = 40;      //tuncate strings if longer
  const maxMag = 1e6;     //use scientific notation if x >= maxMag or
                          //x < 10^(-maxMag)

  
  //--------------- auxiliary ---------------//
  
  //str[, array, array] -> str, wraps val in given tag type.
  //  cls: if passed, a class is added for each entry
  //  rcp: if passed, the 3 entries are included as values of
  //       the attributes data-row, data-col and data-page
  const elm = (tag, val, cls, rcp) => {
    s = `<${tag}`;
    if (cls) s += ` class="${cls.join(' ')}"`;
    if (rcp) s += ` data-row="${rcp[0]}" data-col="${
                    rcp[1]}" data-page="${rcp[2]}"`;
    return `${s}>${val}</${tag}>`;
  };
  
  //convenience func for wrapping val in <td> tag
  const td = (val, cts, rcp) => elm('td', val, cts, rcp);

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
  //[object] -> cube/str
  //element:
  //  -element:
  //    -falsy (default): prints nothing
  //    -string: passed to document.querySelectorAll; table(s) appended
  //     to first element in selection
  //    -otherwise, checks if value is in DOM, if not, checks if val[0]
  //     in DOM; prints to elmt it finds
  
  HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
  SINCE CAN HAVE MULTIPLE TABLES, ALWAYS WRAP IN DIV - THIS IS THE ELMT THAT RETURN
    -SHOULD TABLE ELMTS BE GIVEN WAY TO IDENTIFY THEM - INDEX OR KEY>
  
  //  -ret:
  //    -'this' (default), the array/cube
  //    -'string', HTML string for the table(s)
  //    -'table', the table element
  //  -indexKey: array/singleton, the indices/keys of a dimension are printed
  //     if the corresponding entry is truthy, singleton is broadcast
  //  -label: array/singleton, label of a dimension is printed if the
  //     corresponding entry is truthy (and the label exists) singleton is
  //     broadcast
  //  -type: if truthy, <td>s representing entries have a class
  //    indicating their type
  //  -entry: if truthy, <td>s representing entries have a attributes
  //    data-row, data-col, data-page; values are indices/keys (keys
  //    are converted to strings, but not formatted)
  //Notes:
  //  -an array is printed as a cube, but the array is NOT converted
  //   to a cube.
  //  -if neither the indexKey nor label options are used:
  //    -row and col inds/keys are printed
  //    -page inds/keys are printed when there are multiple pages or
  //     the cube has page keys or a page label
  //    -labels are printed where they exist
  addArrayMethod('print', function(ops)) {
                 
    const shortDimName = ['row', 'col', 'page'];             
                 
    let _s, _k, _l;
    if (this._data_cube) {_s, _k, _l} = this;
    else [_s, _k, _l] = [[this.length, 1, 1], [], []];
    const [nr, nc, np] = _s;
                 
    //process options
    ops = def(assert.single(ops), {});
    if (typeof ops !== 'object') throw Error('print options: object expected');
    let {element, ret, indexKey, label, type, entry} = ops;
    let indexKeySingle, labelSingle;
    //ret
    if (ret === undefined) ret = 'this';
    else if (ret !== 'this' && ret !== 'string' && ret !== 'table') {
      throw Error(`'this', 'string', or 'table' expected`);
    }
    //labels
    [label,labelSingle] = polarize(label); 
    if (labelSingle) label = (label === undefined) ? [1, 1, 1] : [label, label, label];
    else if (label.length !== 3) {
      throw Error('label option: singleton or 3-entry array expected');
    }
    label = label.map(a d => a && _l[d]);  //only if label exists (never for array)
    //indices/keys
    [indexKey,indexKeySingle] = polarize(indexKey); 
    if (indexKeySingle) {
      if (indexKey === undefined) {
        indexKey = [1, 1, np > 1 || _k[2] || label[2]];
      }
      else indexKey = [indexKey, indexKey, indexKey];
    }
    else if (indexKey.length !== 3) {
      throw Error('indexKey option: singleton or 3-entry array expected');
    }
    //get keys as strings if needed
    const keyStr = indexKey.map( (ik,d) => { 
      if (_k[d]) {
        if (entry || ik) {
          let a = Array.from(_k[d].keys(), ky => '' + ky);
          if (entry && new Set(a).size !== _s[d]) {
            throw Error(`entry attributes: ${helper.dimName[d]} keys do not convert to unique strings`);
          }
          return a;
        }
      }
    });
  
    //use info if empty or too many entries
    if (this.length > maxPrint || this.length === 0) return this.info(ops);
    
    //label elements
    let rl, cl, pl;
    if (label[0]) rl = `<td class="${row-label}" rowspan="${nr}">${fmt.label(_l[0])}</td>`;
    if (label[1]) cl = `<td class="${col-label}" rowspan="${nc}">${fmt.label(_l[1])}</td>`;
    if (label[2]) pl = `<span class="${page-label}">${fmt.label(_l[2])}</span>`;

    //index/key elements
    let [rik, cik, pik] = _k.map( (ik,d) => {
      if (indexKey[d]) {
        const cls = [`${shortDimName[d]}-ik`];
        if (_k[d]) return = keyStr[d].map(ky => td(fmt.key(ky), cls));
        else {
          let a = new Array(_s[d]);
          for (let i=0; i<_s[d]; i++) a[i] = elm(d === 2 ? 'span' : 'td', fmt.index(i), cls);
          return a;
        }
      }
    });
    if (cik) cik = cik.join('');  //column indices/keys always appear as adjacent <td>s
  
    //offets and topLeft
    const rowOffset = 0 + !!label[1] + !!indexKey[1];
    const colOffset = 0 + !!label[0] + !!indexKey[0];
    const topLeft = (rowOffset && colOffset)
      ? `<td rowspan="${rowOffset}" colspan="${colOffset}"></td>`
      : '';
    
    //pages
    let str = '';
    for (let p=0; p<np; p++) {
      str += '<table>';
      
      //page info
      if (pl || pik) {
        str += `<caption class="${page-caption}">`;
        if (pl) str += pl;
        if (pik) {
          if (pl) str += ': ';
          str += pik[p];
        }
        str += '</caption>';
      }
      
      //col label and inds/keys
      if (topLeft) str += '<tr>' + topLeft;
      if (cl) str += cl + '</tr>';
      if (cik) {
        if (cl) str += '<tr>';
        str += cik + '</tr>';
      }
      
      //row label, inds/keys and entries
      if (rl) str += '<tr>' + rl;
      for (let r=0; r<nr; r++) {
        if (!(r === 0 && rl)) str + '<tr>';
        if (rik) str += rik[r];
        for (let c=0; c<nc; c++) {
          let [ent,typ] = fmtEntry(this[r + nr*c + nr*nc*p]);
          str += td( ent, type ? typ : undefined, entry ? entryAttr(r,c,p) : undefined);
        }
        str += '</tr>';
      }
      str += '</table>';
    }
      
    //print and return
    if (retStr) return str;
    console.log(str);
    return this;
  });
  
------------------------DRAFT DONE TO HERE----------------------------------

  
  //--------------- print info on cube or standard array ---------------//
  
  addArrayMethod('info', function(retStr) {
    helper.assert.single(retStr);
    let str;
    if (this._data_cube) {
      const keys = [];
      const labels = [];
      if (this._k) this._k.forEach((a,i) => a ? keys.push(dimName[i]) : 0);
      if (this._l) this._l.forEach((a,i) => a ? labels.push(dimName[i]): 0);
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

