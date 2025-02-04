require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` })
const fs = require("fs")
const manifestPath = "./build/manifest.json"

const run = async () => {
  const json = await fs.promises.readFile(manifestPath, "utf-8")
  const manifest = JSON.parse(json)
  
  // Ensure URL has scheme
  const baseUrl = process.env.REACT_APP_SHARE_TARGET_URL || 'http://localhost:3000'
  const url = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`
  
  manifest.content_scripts[0].matches = [
    `${url}/draft?*`
  ]
  
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
}
run()
