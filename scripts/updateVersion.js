import fs from 'fs-extra'
import { glob } from 'glob'
import path from 'path'

console.log('Updating version files.')
// Get all package.json files
const packagePaths = await glob('**/package.json', {
  ignore: ['**/dist/**', '**/node_modules/**'],
})

let count = 0
for (const packagePath of packagePaths) {
  /**
   * @typedef {object} Package
   * @property {string=} [name]
   * @property {boolean=} [private]
   * @property {string=} [version]
   */
  const packageFile = /** @type {Package} */ (await fs.readJson(packagePath))

  // Skip private packages
  if (packageFile.private) continue

  count += 1
  console.log(`${packageFile.name} — ${packageFile.version}`)

  const versionFilePath = path.resolve(
    path.dirname(packagePath),
    'src',
    'version.js',
  )
  await fs.writeFile(
    versionFilePath,
    `export const version = '${packageFile.version}'\n`,
  )
}

console.log(`Done. Updated version file for ${count} packages.`)
