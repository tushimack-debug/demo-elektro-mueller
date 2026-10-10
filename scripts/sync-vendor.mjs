import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { buildSync } from 'esbuild';
const base = resolve('node_modules/three');
const visited = new Set();
function copy(source, target) {
  if (visited.has(source)) return;
  visited.add(source);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
  if (!source.endsWith('.js')) return;
  for (const match of readFileSync(source, 'utf8').matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)) {
    const child = resolve(dirname(source), match[1]);
    if (!child.startsWith(base + sep)) throw new Error('Unexpected vendor path');
    copy(child, resolve(dirname(target), match[1]));
  }
}
buildSync({ entryPoints: [resolve(base, 'build/three.module.js')], outfile: 'vendor/three.module.min.js', bundle: true, minify: true, format: 'esm', legalComments: 'inline' });
copy(resolve(base, 'LICENSE'), resolve('vendor/LICENSE-three.txt'));
for (const entry of ['postprocessing/EffectComposer.js', 'postprocessing/RenderPass.js', 'postprocessing/UnrealBloomPass.js', 'postprocessing/OutputPass.js', 'environments/RoomEnvironment.js']) {
  copy(resolve(base, 'examples/jsm', entry), resolve('vendor/jsm', entry));
}
console.log(`Synced Three.js ${JSON.parse(readFileSync(resolve(base, 'package.json'))).version}: ${visited.size} files`);
