let modules = process.env.MODULES || false;
if (modules === 'esm' || modules === 'false') modules = false;

export default {
  presets: [['@babel/preset-env', { modules, loose: true }]],
  ignore: [
    '../../src/angular/**/*.js',
    '../../src/react/**/*.js',
    '../../src/*-react.js',
    '../../src/vue/**/*.js',
    '../../src/*-vue.js',
    '../../src/copy/*',
    '../../src/solid/**/*.js',
    '../../src/solid/**/*.jsx',
    '../../src/svelte/**/*.js',
    '../../src/*-svelte.js',
  ],
};
