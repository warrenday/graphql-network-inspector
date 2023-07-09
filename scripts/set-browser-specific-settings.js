const fs = require("fs")
const manifestPath = "./build/manifest.json"

const run = async () => {
  const json = await fs.promises.readFile(manifestPath, "utf-8")
  const manifest = JSON.parse(json)
  manifest.browser_specific_settings = {
    gecko: {
      id: "warrenjday@graphqlnetworkinspector.com",
    },
  }
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
}
run()
