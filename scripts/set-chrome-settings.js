const fs = require("fs")
const manifestPath = "./build/manifest.json"

const run = async () => {
  const json = await fs.promises.readFile(manifestPath, "utf-8")
  const manifest = JSON.parse(json)

  // Remove background scripts from the manifest as this is only
  // supported in Firefox.
  delete manifest.background.scripts

  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
}
run()
