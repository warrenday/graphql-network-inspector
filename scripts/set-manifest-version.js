const fs = require("fs")
const packageJson = require("../package.json")
const manifestPath = "./build/manifest.json"

const run = async () => {
  const json = await fs.promises.readFile(manifestPath, "utf-8")
  const manifest = JSON.parse(json)
  manifest.version = packageJson.version
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
}
run()
