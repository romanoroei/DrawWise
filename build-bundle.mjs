import { readFile, writeFile } from 'node:fs/promises';
const calculations=(await readFile('./js/calculations.js','utf8')).replaceAll('export const ','const ').replaceAll('export function ','function ');
const app=(await readFile('./js/app.js','utf8')).replace(/^import .*?;\r?\n/,'');
const enhancements=await readFile('./js/enhancements.js','utf8');
const luxury=await readFile('./js/luxury.js','utf8');
const revision=await readFile('./js/revision.js','utf8');
const correction=await readFile('./js/correction.js','utf8');
const finalPolish=await readFile('./js/final-polish.js','utf8');
await writeFile('./js/browser.bundle.js',calculations+'\n'+app+'\n'+enhancements+'\n'+luxury+'\n'+revision+'\n'+correction+'\n'+finalPolish);
