import fs from 'fs';
import execSh from 'exec-sh';
import { outputDir } from './utils/output-dir.js';
import { addBannerToFile } from './utils/banner.js';
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint no-console: "off" */
const exec = execSh.promise;
export default async function buildVue(format) {
  // Babel
  await exec(
    `cross-env MODULES=${format} npx babel --config-file ./babel.config.vue.js src/vue --out-dir ${outputDir}/${format}/vue`,
  );
  await exec(
    `cross-env MODULES=${format} npx babel --config-file ./babel.config.vue.js src/swiper-vue.js --out-file ${outputDir}/swiper-vue.${format}.js`,
  );

  // Fix import paths
  let fileContent = await fs.readFile(`./${outputDir}/swiper-vue.${format}.js`, 'utf-8');
  fileContent = fileContent
    .replace(/require\(".\/vue\//g, `require("./${format}/vue/`)
    .replace(/from '.\/vue\//g, `from './${format}/vue/`);
  await fs.writeFile(`./${outputDir}/swiper-vue.${format}.js`, fileContent);
  await addBannerToFile(`./${outputDir}/vue/swiper-vue.${format}.js`, 'Vue');
}
