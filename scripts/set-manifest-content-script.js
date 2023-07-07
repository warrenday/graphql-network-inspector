require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` })
const fs = require("fs")
const manifestPath = "./build/manifest.json"

fs.readFile(manifestPath, "utf-8", (err, json) => {
  const manifest = JSON.parse(json)
  manifest.content_scripts.matches = ["https://www.graphdev.app/draft?*"]
  fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), () => {})
})
