import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const outDir = resolve(root, 'src/ui/dist-ui');

async function exists(p) { try { await access(p); return true; } catch { return false; } }

function sanitizeForInline(code, tag) {
  if (!code) return code;
  const re = new RegExp(`</${tag}>`, 'gi');
  return code.replace(re, `<\\/${tag}>`);
}

async function run() {
  const jsPath  = resolve(outDir, 'bundle.js');
  const cssPath = resolve(outDir, 'style.css');

  let js  = await readFile(jsPath, 'utf8');
  let css = (await exists(cssPath)) ? await readFile(cssPath, 'utf8') : '';

  js  = sanitizeForInline(js,  'script');
  css = sanitizeForInline(css, 'style');

  const prolog = `
/* GAS bootstrap */
(function(){
  // provide globalThis and process.env
  if (typeof window !== 'undefined' && typeof globalThis === 'undefined') window.globalThis = window;
  if (typeof window !== 'undefined' && typeof window.process === 'undefined') window.process = { env: { NODE_ENV: 'production' } };
  if (typeof process === 'undefined') var process = { env: { NODE_ENV: 'production' } };
  var __root = document.getElementById('root');
  if (__root) __root.textContent = 'Booting…';
  try {
`;

  const epilog = `
    // If React didn't overwrite "Booting…", clear it
    var __root2 = document.getElementById('root');
    if (__root2 && __root2.textContent && __root2.textContent.indexOf('Booting') === 0) {
      __root2.textContent = '';
    }
  } catch (e) {
    var r = document.getElementById('root');
    if (r) {
      r.style.color = '#b00';
      r.style.whiteSpace = 'pre-wrap';
      r.textContent = 'JS Error: ' + (e && e.message ? e.message : e);
    }
  }
})();`;

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
    <title>Weather Forecast</title>
    ${css ? `<style>${css}</style>` : ''}
  </head>
  <body>
    <div id="root">Loading …</div>
    <script>
${prolog}${js}${epilog}
    </script>
  </body>
</html>`;

  await writeFile(resolve(root, 'dist/ui.html'), html, 'utf8');
  console.log('✓ Wrote dist/ui.html (IIFE + prolog + sanitization)');
}

run().catch(e => { console.error(e); process.exit(1); });