import execSh from 'exec-sh';
import fs from 'fs-extra';
import elapsed from 'elapsed-time-logger';
import { modules as configModules } from './build-config.js';
import { outputDir } from './utils/output-dir.js';
import { banner } from './utils/banner.js';
import { capitalizeString } from './utils/helper.js';
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint no-console: "off" */
const exec = execSh.promise;

async function buildCore(modules, format) {
  const filename = `swiper.${format}`;
  let coreContent = '';
  if (format === 'esm') {
    coreContent += `export { default as Swiper, default } from './core/core';\n`;
    coreContent += modules
      .map(
        (component) =>
          `export { default as ${component.capitalized} } from './modules/${component.name}/${component.name}';`,
      )
      .join('\n');
  } else if (format === 'cjs') {
    coreContent += `"use strict";\n`;
    coreContent += `exports.__esModule = true;\n`;
    coreContent += `exports.default = require('./core/core').default;\n`;
    coreContent += `exports.Swiper = require('./core/core').default;\n`;
    coreContent += modules
      .map(
        (component) =>
          `exports.${component.capitalized} = require('./modules/${component.name}/${component.name}').default;`,
      )
      .join('\n');
  }

  coreContent = `${banner()}\n${coreContent}`;

  fs.writeFileSync(`./${outputDir}/${filename}.js`, coreContent);

  // Babel
  await exec(
    `npx cross-env MODULES=${format} npx babel src --out-dir ${outputDir}/${format} --config-file ./scripts/babel/babel.config.core.js`,
  );

  // Remove unused dirs
  const dirsToRemove = ['less'];
  const filesToRemove = ['swiper.js'];
  dirsToRemove.forEach((dir) => {
    fs.rmdirSync(`./${outputDir}/${format}/${dir}`, { recursive: true });
  });
  filesToRemove.forEach((file) => {
    fs.unlinkSync(`./${outputDir}/${format}/${file}`);
  });

  // Fix import paths
  let fileContent = fs.readFileSync(`./${outputDir}/${filename}.js`, 'utf-8');
  fileContent = fileContent
    .replace(/require\('\.\//g, `require('./${format}/`)
    .replace(/from '\.\//g, `from './${format}/`);
  fs.writeFileSync(`./${outputDir}/${filename}.js`, fileContent);
}
export default async function build() {
  elapsed.start('core');
  const modules = [];
  configModules.forEach((name) => {
    const capitalized = capitalizeString(name);
    const jsFilePath = `./src/modules/${name}/${name}.js`;
    if (fs.existsSync(jsFilePath)) {
      modules.push({ name, capitalized });
    }
  });

  await Promise.all([buildCore(modules, 'esm'), buildCore(modules, 'cjs')]);

  // build modules
  modules.forEach(({ name }) => {
    fs.mkdirSync(`./${outputDir}/modules/${name}`, { recursive: true });
    const pkg = JSON.stringify(
      {
        name: `swiper/${name}`,
        private: true,
        sideEffects: false,
        main: `../../cjs/modules/${name}/${name}.js`,
        module: `../../esm/modules/${name}/${name}.js`,
      },
      '',
      2,
    );
    fs.writeFileSync(`./${outputDir}/modules/${name}/package.json`, pkg);
  });
}
