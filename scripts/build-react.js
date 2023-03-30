import execSh from 'exec-sh';
import { outputDir } from './utils/output-dir.js';
import { addBannerToFile } from './utils/banner.js';
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint no-console: "off" */
const exec = execSh.promise;

export default async function buildReact(format) {
  // Babel
  await exec(
    `cross-env MODULES=${format} npx babel --config-file ./scripts/babel/babel.config.react.js src/react --out-dir ${outputDir}/${format}/react`,
  );
  /*
  await exec(
    `cross-env MODULES=${format} npx babel --config-file ./scripts/babel/babel.config.react.js src/swiper-react.js --out-file ${outputDir}/swiper-react.${format}.js`,
  );
  */
  await addBannerToFile(`./${outputDir}/${format}/react/swiper-react.js`, 'React');

  /*
  // Fix import paths
  let fileContent = await fs.readFile(`./${outputDir}/swiper-react.${format}.js`, 'utf-8');
  fileContent = fileContent
    .replace(/require\(".\/react\//g, `require("./${format}/react/`)
    .replace(/from '.\/react\//g, `from './${format}/react/`);
  fileContent = `${bannerReact}\n${fileContent}`;
  await fs.writeFile(`./${outputDir}/swiper-react.${format}.js`, fileContent);
  */
}
