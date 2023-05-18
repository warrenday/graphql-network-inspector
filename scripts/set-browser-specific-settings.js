const fs = require("fs")

const manifestPath = "./build/manifest.json"

fs.readFile(manifestPath, "utf-8", (err, json) => {
  const manifest = JSON.parse(json)
  manifest.browser_specific_settings = {
    gecko: {
      id: "warrenjday@graphqlnetworkinspector.com",
    },
  }
  fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), () => {})
})
