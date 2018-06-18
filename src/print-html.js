{
  'use strict';
  
  const {addArrayMethod, polarize, assert, dimName, def} = Array.prototype._helper;
      
  
  //--------------- auxiliary ---------------//
  
  //str, str[, str, array] -> str, wraps val in given tag type.
  //  cls: if truthy, added as class attribute
  //  rcp: if truthy, the 3 entries are included as values of
  //       the attributes data-row, data-col and data-page
  const elm = (tag, val, cls, rcp) => {
    let s = `<${tag}`;
    if (cls) s += ` class="${cls}"`;
    if (rcp) s += ` data-row="${rcp[0]}" data-col="${
                    rcp[1]}" data-page="${rcp[2]}"`;
    return `${s}>${val}</${tag}>`;
  };
    
  //convenience func for wrapping val in <td> tag
  const td = (val, cls, rcp) => elm('td', val, cls, rcp);

  //truncate string if longer than max
  const truncate = (s,mx) => s.length > mx ? s.slice(0,mx) + ' ...' : s;

  //* -> str, basic string formatting
  const basicStrFmt = x => truncate('' + x, fmt.maxStr).replace(/\n/g, '<br>');
  
  //default format values and functions
  const defFmt = {
    
    maxPrint: 2000,  //show info rather than array/cube if more entries
    maxStr: 40,      //tuncate strings if longer
    maxMag: 1e6,     //use scientific notation if x >= maxMag
    dp: 4,           //decimal places (use sci notation if abs(x) < 10^(-dp))
    
    number: x => {
      if (Number.isInteger(x)) return '' + x;
      else if (Math.abs(x) >= fmt.maxMag || Math.abs(x) < Math.pow(10,-fmt.dp)) {
        return (+x.toPrecision(fmt.dp)).toExponential();
      }
      else return x.toFixed(fmt.dp);
    },
    string: basicStrFmt,
    boolean: x => x,
    undefined: x => 'undefined',
    function: x => 'function',
    null: x => 'null',
    cube: x => 'cube (entries: ' + x.length + ', shape: ' + x._s.join(', ') + ')',
    array: x => 'array (entries: ' + x.length + ')',
    date: x => ('' + x).replace(/\s*\([^\)]*\)/, ''),
    other: basicStrFmt,
    rowIndex:  x => x,
    colIndex:  x => x,
    pageIndex: x => x,
    rowKey:  basicStrFmt,
    colKey:  basicStrFmt,
    pageKey: basicStrFmt,
    rowLabel:  basicStrFmt,
    colLabel:  basicStrFmt,
    pageLabel: basicStrFmt
  };
  
  //format functions used by print()
  let fmt = Object.assign({}, defFmt);
  
  //entry format function
  const basicType = new Set(['number', 'string', 'boolean', 'undefined', 'function']);
  const fmtEntry = x => {
    const t = typeof x;
    if (basicType.has(t)) return [fmt[t](x), t];
    if (x === null) return [fmt.null(x), 'null'];
    if (Array.isArray(x)) {
      if (x._data_cube) return [fmt.cube(x), 'cube'];
      else return [fmt.array(x), 'array'];
    }
    if (x instanceof Date) return [fmt.date(x), 'date'];
    return [fmt.other(x), 'other'];
  };
    
  //str[, *, str] -> HTML elment
  //create div and set its innerHTML to s; to and id are options
  //from print/info
  const display = (s, to, id) => {
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
    return dv;
  };

  
  //--------------- print cube or standard array ---------------//
  
  //[object] -> HTML elment, print array/cube
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
    let {to, label, indexKey, type, entryAttr, tableAttr, id} = ops;
    type = def(type, true);
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
    if (this.length > fmt.maxPrint || this.length === 0) return this.info({to,id});
  
    //need some/all keys as strings if printing keys or if entryAttr/tableAttr is truthy
    const keyStr = indexKey.map( (ik,d) => {
      if (_k[d]) {
        const attr = entryAttr || (d === 2 && tableAttr);  //adding inds/keys for this dim as attributes
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
    if (label[0]) rl = `<td class="label row-label" rowspan="${nr}">${fmt.rowLabel(_l[0])}</td>`;
    if (label[1]) cl = `<td class="label col-label" colspan="${nc}">${fmt.colLabel(_l[1])}</td>`;
    if (label[2]) pl = `<span class="label page-label">${fmt.pageLabel(_l[2])}</span>`;

    //index/key elements
    let [rik, cik, pik] = indexKey.map( (ik,d) => {
      if (ik) {
        const cls = `ik ${shortDimName[d]}-ik`;
        const tg = d === 2 ? 'span' : 'td';
        if (_k[d]) {
          const fmtKey = fmt[shortDimName[d] + 'Key'];
          return keyStr[d].map(ky => elm(tg, fmtKey(ky), cls));
        }
        else {
          const fmtIndex = fmt[shortDimName[d] + 'Index'];
          const nd = _s[d];
          const a = new Array(nd);
          for (let i=0; i<nd; i++) a[i] = elm(tg, fmtIndex(i), cls);
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
      if (tableAttr) str += ` data-table="${_k[2] ? keyStr[2][p] : p}"`;
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
            entryAttr ? 
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
    return display(str, to, id);
  
  });


  //--------------- print info on cube or standard array ---------------//
  
  //[object] -> HTML element, print info about array/cube
  addArrayMethod('info', function(ops) {
    ops = def(assert.single(ops), {});
    if (typeof ops !== 'object') throw Error('object expected');
    let {to, id} = ops;
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
    return display(str, to, id);
  });
  
  
  //--------------- export function to change format functions ---------------//

  module.exports = newFmt => {
    newFmt = assert.single(newFmt);
    if (newFmt === undefined) {
      fmt = Object.assign({}, defFmt);
    }
    else {
      if (typeof newFmt !== 'object') throw Error('object expected');
      fmt = Object.assign(fmt, newFmt);
    }
  };

}
