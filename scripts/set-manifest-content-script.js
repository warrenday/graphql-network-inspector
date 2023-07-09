require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` })
const fs = require("fs")
const manifestPath = "./build/manifest.json"

const run = async () => {
  const json = await fs.promises.readFile(manifestPath, "utf-8")
  const manifest = JSON.parse(json)
  manifest.content_scripts[0].matches = [
    `${process.env.REACT_APP_SHARE_TARGET_URL}/draft?*`,
  ]
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
}
run()
