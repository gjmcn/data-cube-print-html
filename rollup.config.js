import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

export default {
  input: 'src/print-html.js',
  output: {
    extend: true,
    file: 'dist/print-html.js',
    format: 'umd',
    name: 'data_cube_format'
  },
  plugins: [
    commonjs({
      sourceMap: false
    }),
    resolve(),
    uglify()
  ]
};