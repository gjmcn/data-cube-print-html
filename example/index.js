{
  'use strict';
  
  require('data-cube');
  const fmt = require('data-cube-print-html');
  
  //Standard array
  [7,8,9].print({to: '#array'});
  
  //Standard array, info
  [7,8,9].info({to: '#array-info'});
  
  //Vector
  [7,8,9].toCube().print({to: '#vector'});
  
  //Vector, info:
  [7,8,9].toCube().info({to: '#vector-info'});
  
  //Matrix
  [4,6].rand().print({to: '#matrix'});
  
  //Exam results
  const x = [3,4,2].rand(100)
    .$key(['Alice','Bob','Cath'])
    .$key(1,['math','biol','chem','phys'])
    .$key(2,['Autumn','Spring'])
    .$label(0,'Student')
    .$label(1,'Subject')
    .$label(2,'Term');
  x.print({to: '#results'});
  
  //Info on exam results cube
  x.info({to: '#info'});

  //No keys or labels
  x.print({
    to: '#no-extras',
    label: false,
    indexKey: false
  });
  
  //Keys. no labels
  x.print({
    to: '#keys',
    label: false,
  });
  
  //Labels, no keys
  x.print({
    to: '#labels',
    indexKey: false
  });
  
  //Single column and page
  x.sc(null,'chem','Spring').print({to: '#rows'});
  
  //Single row and page
  x.sc('Cath',null,'Spring').print({to: '#columns'});
  
  //Single row and column
  x.sc('Cath','chem').print({to: '#pages'});
  
  //Highlight Bob's results
  x.print({
    to: '#highlight-entries',
    id: 'bob',
    entryAttr: true
  });
  document.querySelectorAll('#bob [data-row="Bob"]')
    .forEach(elm => elm.style.backgroundColor = 'gold');

  //Highlight Spring
  x.print({
    to: '#highlight-page',
    id: 'spring',
    tableAttr: true
  });
  document.querySelector('#spring [data-table="Spring"]')
    .style.color = 'red';
  
  //Different types
  const y = [
    Math.PI,
    1234.56789,
    'multiline\nstring',
    'I am a long string that will be truncated by default formatting',
    true,
    undefined,
    null,
    new Date(),
    [4,5],
    [4,5].toCube(),
    () => {},
    /abc/,
    {a:5, b:6},
    new Map([ ['a',4], ['b',5] ]),
    document.getElementById('results')
  ].$shape(5).$label('row label').$key(['a','b','c','d','e']);  
  
  y.print({to: '#types'});
  
  //Format row label, row keys, column indices, string
  //entries, date entries and number of decimal places:
  fmt({
    dp: 2,
    date: d => d.getFullYear(),
    string: s => s.toUpperCase().slice(0,6),
    rowLabel: s => s + '!!',
    rowKey: s => `[${s}]`,
    colIndex: s => '$' + s
  })
  y.print({to: '#format'});
  
  //Reset formatting to default
  fmt();
  y.print({to: '#reset'});

}
