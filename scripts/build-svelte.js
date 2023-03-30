import exec from 'exec-sh';
import fs from 'fs-extra';
import svelte from 'svelte';
import { outputDir } from './utils/output-dir.js';
import { addBannerToFile } from './utils/banner.js';

export default async function buildSvelte(format) {
  // Babel
  await exec.promise(
    `cross-env MODULES=${format} npx babel --config-file ./babel.config.svelte.js src/svelte --out-dir ${outputDir}/${format}/svelte`,
  );
  if (format === 'esm') {
    await exec.promise(
      `cross-env MODULES=${format} npx babel --config-file ./babel.config.svelte.js src/swiper-svelte.js --out-file ${outputDir}/swiper-svelte.${format}.js`,
    );

    // Fix import paths
    let fileContent = await fs.readFile(`./${outputDir}/swiper-svelte.${format}.js`, 'utf-8');
    fileContent = fileContent
      .replace(/require\(".\/svelte\//g, `require("./${format}/svelte/`)
      .replace(/from '.\/svelte\//g, `from './${format}/svelte/`);
    fs.writeFileSync(`./${outputDir}/swiper-svelte.${format}.js`, fileContent);
  } else {
    const fileContent = [
      '"use strict";',
      'exports.__esModule = true;',
      'exports.Swiper = require("./cjs/svelte/swiper").default;',
      'exports.SwiperSlide = require("./cjs/svelte/swiper-slide").default;',
    ].join('\n');
    fs.writeFileSync(`./${outputDir}/swiper-svelte.${format}.js`, fileContent);
  }
  await addBannerToFile(`./${outputDir}/svelte/swiper-svelte.${format}.js`, 'Svelte');

  /* DON'T TRANSFORM SVELTE FILES
  // Transform svelte files
  let swiper = await fs.readFile('./src/svelte/swiper.svelte', 'utf8');
  const swiperResult = svelte.compile(swiper, {
    format,
    filename: 'swiper.svelte',
  });
  swiper = swiperResult.js.code;
  await fs.writeFile(`./${outputDir}/${format}/svelte/swiper.js`, swiper);
  */
  let swiperSlide = await fs.readFile('./src/svelte/swiper-slide.svelte', 'utf8');
  const swiperSlideResult = svelte.compile(swiperSlide, {
    format,
    filename: 'swiper.svelte',
  });
  swiperSlide = swiperSlideResult.js.code;
  await fs.writeFile(`./${outputDir}/svelte/swiper-slide.js`, swiperSlide);
  await fs.writeFile(`./${outputDir}/${format}/svelte/swiper-slide.js`, swiperSlide);
  await fs.copyFile('./src/svelte/swiper.svelte', `./${outputDir}/${format}/svelte/swiper.svelte`);
  await fs.copyFile(
    './src/svelte/swiper-slide.svelte',
    `./${outputDir}/${format}/svelte/swiper-slide.svelte`,
  );
}
