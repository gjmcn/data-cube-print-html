{
  'use strict';
  
  const helper = require('data-cube-helper');
  const {addArrayMethod, polarize, assert, dimName, def} = helper;
      
  //change these here for now
  const maxPrint = 2000;  //show info rather than table if more entries
  const maxStr = 40;      //tuncate strings if longer
  const maxMag = 1e6;     //use scientific notation if x >= maxMag
  const dp = 4;           //decimal places (use sci notation if abs(x) < 10^(-dp))
  
  //--------------- auxiliary ---------------//
  
  //str, str[, str, array] -> str, wraps val in given tag type.
  //  cls: if truthy, added as class attribute
  //  rcp: if truthy, the 3 entries are included as values of
  //       the attributes data-row, data-col and data-page
  const elm = (tag, val, cls, rcp) => {
    s = `<${tag}`;
    if (cls) s += ` class="${cls}"`;
    if (rcp) s += ` data-row="${rcp[0]}" data-col="${
                    rcp[1]}" data-page="${rcp[2]}"`;
    return `${s}>${val}</${tag}>`;
  };
    
  //convenience func for wrapping val in <td> tag
  const td = (val, cls, rcp) => elm('td', val, cls, rcp);

  //truncate string if longer than max
  const truncate = (s,mx) => s.length > mx ? s.slice(0,mx) + ' ...' : s;

  //format functions
  let fmt = {
    number: x => {
      if (Number.isInteger(x)) return '' + x;
      else if (Math.abs(x) >= maxMag || Math.abs(x) < Math.pow(10,-dp)) {
        return (+x.toPrecision(dp)).toExponential();
      }
      else return x.toFixed(dp);
    },
    string: x => truncate(x,maxStr),
    boolean: x => x,
    undefined: () => 'undefined',
    function: () => 'function',
    null: () => 'null',
    cube: x => 'cube (entries: ' + x.length + ', shape: ' + x._s.join(', ') + ')',
    array: x => 'array (entries: ' + x.length + ')',
    date: x => ('' + x).replace(/\s*\([^\)]*\)/, ''),
    other: x => truncate('' + x, maxStr),
    index: x => x,
    key: x => truncate('' + x, maxStr),
    label: x => x //'(' + x + ')'
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
  
  //array/cube, str[, *, str, bool] => array/cube/DOM-elmt
  //create div, set its innerHTML to s, print and return
  //based on the options to, id and chain (see print)
  const displayReturn = (x, s, to, id, chain) => {
    const dv = document.createElement('div');
    if (id !== undefined) dv.id = id;
    dv.innerHTML = s;
    dv.className = 'data-cube-wrap';
    if (to) {
      if (typeof to === 'string') {
        document.querySelector(to).insertBefore(dv,null);
      }
      else if (to instanceof Element) to.insertBefore(dv,null);
      else if (to[0] instanceof Element) to[0].insertBefore(dv,null);
    }
    return chain ? x : dv;
  }

  
  //--------------- print cube or standard array ---------------//
  
  //MOVE MOST DETAILS TO README
  //[object] -> cube/str
  //options object:
  //  -to:  
  //    -falsy (default): prints nothing
  //    -string: passes string to document.querySelector and appends
  //     printed array/cube to selected element
  //    -otherwise: if is an element, appends to it; else if property
  //     at index 0 is an elmt, appends to it
  //  -chain: if truthy, returns the array/cube; if falsy (default) returns
  //    the wrapper div containing the printed array/cube
  //  -label: array/singleton, label of a dimension is printed if the
  //   corresponding entry is truthy (and the label exists), a  singleton
  //   is broadcast. Default: labels are printed if they exist
  //  -indexKey: array/singleton, the indices/keys of a dimension are
  //   printed if the corresponding entry is truthy, singleton is broadcast.
  //   Default: row and col indices/keys are printed; page inds/keys are
  //   printed if there are multiple pages or there are page keys or there
  //   is a page label that is being printed
  //  -type: if truthy, <td>s representing entries have a class
  //   indicating their type
  //  -entry: if truthy, <td>s representing entries have a attributes
  //   data-row, data-col, data-page; values are indices/keys (keys
  //   are converted to strings, but not formatted)
  //  -table: if truthy, <table> for each page has data-table attribute
  //   with the page index/key as the value (keys are converted to strings,
  //   but not formatted)
  //  -id: id for wrapper div. Default: no id used
  //Note: an array is printed as a cube, but the array itself is NOT
  //converted to a cube.
  addArrayMethod('print', function(ops) {
                 
    const shortDimName = ['row', 'col', 'page'];             
    
    //ensure _k and _l are arrays so can look up entry to
    //see if keys/label exists
    let _s, _k, _l;
    if (this._data_cube) ({_s, _k, _l} = this);
    else _s = [this.length, 1, 1];
    _k = _k || [];
    _l = _l || [];
    const [nr, nc, np] = _s;
                 
    //process options
    ops = def(assert.single(ops), {});
    if (typeof ops !== 'object') throw Error('object expected');
    let {to, chain, label, indexKey, type, entry, table, id} = ops;
    let indexKeySingle, labelSingle;
    //labels
    [label,labelSingle] = polarize(label); 
    if (labelSingle) label = (label === undefined) ? [1, 1, 1] : [label, label, label];
    else if (label.length !== 3) {
      throw Error('label option: singleton or 3-entry array expected');
    }
    label = label.map((a,d) => a && _l[d]);
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
  
    //use info if empty or too many entries
    if (this.length > maxPrint || this.length === 0) return this.info({to,chain,id});
  
    //need some/all keys as strings if printing keys or if entry or table option is truthy
    const keyStr = indexKey.map( (ik,d) => {
      if (_k[d]) {
        const attr = entry || (d === 2 && table);  //adding inds/keys for this dim as attributes
        if (ik || attr) {
          let a = Array.from(_k[d].keys(), ky => '' + ky);
          if (attr && new Set(a).size !== _s[d]) {
            throw Error(`data attributes: ${dimName[d]} keys do not convert to unique strings`);
          }
          return a;
        }
      }
    });
  
    //label elements
    let rl, cl, pl;
    if (label[0]) rl = `<td class="label row-label" rowspan="${nr}">${fmt.label(_l[0])}</td>`;
    if (label[1]) cl = `<td class="label col-label" colspan="${nc}">${fmt.label(_l[1])}</td>`;
    if (label[2]) pl = `<span class="label page-label">${fmt.label(_l[2])}</span>`;

    //index/key elements
    let [rik, cik, pik] = indexKey.map( (ik,d) => {
      if (ik) {
        const cls = `ik ${shortDimName[d]}-ik`;
        const tg = d === 2 ? 'span' : 'td';
        if (_k[d]) return keyStr[d].map(ky => elm(tg, fmt.key(ky), cls));
        else {
          const nd = _s[d];
          const a = new Array(nd);
          for (let i=0; i<nd; i++) a[i] = elm(tg, fmt.index(i), cls);
          return a;
        }
      }
    });
    if (cik) cik = cik.join('');  //column indices/keys always appear as adjacent <td>s
  
    //offets and topLeft
    const rowOffset = 0 + !!label[1] + !!indexKey[1];
    const colOffset = 0 + !!label[0] + !!indexKey[0];
    const topLeft = rowOffset && colOffset
      ? `<td class="top-left" rowspan="${rowOffset}" colspan="${colOffset}"></td>`
      : '';
    
    //pages
    let str = '';    
    for (let p=0; p<np; p++) {
      str += '<table class="page-table"';
      if (table) str += ` data-table="${_k[2] ? keyStr[2][p] : p}"`;
      str += '>';
      
      //page info
      if (pl || pik) {
        str += '<caption class="page-caption">';
        if (pl) str += pl;
        if (pik) {
          if (pl) str += ': ';
          str += pik[p];
        }
        str += '</caption>';
      }
      
      //col label and inds/keys
      str += '<tr>';
      if (topLeft) str += topLeft;
      if (cl) str += cl + '</tr>';
      if (cik) {
        if (cl) str += '<tr>';
        str += cik + '</tr>';
      }
      
      //row label, row inds/keys and entries
      if (rl) str += '<tr>' + rl;
      for (let r=0; r<nr; r++) {
        if (!(r === 0 && rl)) str + '<tr>';
        if (rik) str += rik[r];
        for (let c=0; c<nc; c++) {
          let [ent,typ] = fmtEntry(this[r + nr*c + nr*nc*p]);
          str += td(
            ent,
            'entry' + (type ? ` ${typ}` : ''),
            entry ? 
              [
                keyStr[0] ? keyStr[0][r] : r,
                keyStr[1] ? keyStr[1][c] : c,
                keyStr[2] ? keyStr[2][p] : p
              ]
              : undefined
          );
        }
        str += '</tr>';
      }
      str += '</table>';
    }
    
    //print and return
    return displayReturn(this, str, to, id, chain);
  
  });


  //--------------- print info on cube or standard array ---------------//
  
  //As in print, ops is an options object, but only the to,
  //chain, and id properties are used.
  addArrayMethod('info', function(ops) {
    ops = def(assert.single(ops), {});
    if (typeof ops !== 'object') throw Error('object expected');
    let {to, chain, id} = ops;
    let str = '<table class="info-table">';
    if (this._data_cube) {
      const keys = [];
      const labels = [];
      if (this._k) this._k.forEach((a,i) => a ?   keys.push(dimName[i]) : 0);
      if (this._l) this._l.forEach((a,i) => a ? labels.push(dimName[i]) : 0);
      str +=
        `<tr><td>entries:</td><td>${this.length}</td></tr>
         <tr><td>shape:</td><td>${this._s.join(', ')}</td></tr>
         <tr><td>keys:</td><td>${keys.length ? keys.join(', ') : '(none)'}</td></tr>
         <tr><td>labels:</td><td>${labels.length ? labels.join(', ') : '(none)'}</td></tr>
         </table>`;
    }
    else {
      str +=
        `<tr><td>(standard array)</td></tr>
         <tr><td>entries: ${this.length}</td></tr>
         </table>`;
    }
    return displayReturn(this, str, to, id, chain);
  });
  
  
  //--------------- export function to set compact ---------------//
  
  // HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  module.exports = ops => {
    if (ops.hasOwnProperty('compact')) printOps.compact = ops.compact;
  }

}

