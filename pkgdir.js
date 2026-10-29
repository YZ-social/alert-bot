#! node
// Logs the path to the package named by the first/only command line argument.
//
// Usage example: pushd `./pkgdir @yz-social/civildefense.io`
//
// Sometimes we want to execute something within a dependency package, like:
//    npm explore packageName -- npm run scriptName
// However, that doesn't work with npm workspaces, and it is convenient to do interrelated package development with workspaces.
// So instead of the above, we can do:
//    pushd `./pkgdir packageName`; npm run scriptName; popd
//
import path from 'node:path'
import { existsSync } from 'node:fs';;
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pkg = process.argv[2];
const resolved = require.resolve(pkg);
let packageDir = path.dirname(resolved);
// Many packages have a default export in a subdirectory, so we have to pop our way up to find where the package.json is
// (which is required to be in the package's root). Some suggest doing require.resolve(`${pkg}/package.json`), but that
// only works if the package explicitly lists the package.json as an export.
while (!existsSync(path.join(packageDir, 'package.json'))) {
  packageDir = path.resolve(packageDir, '..');
}
console.log(packageDir);

