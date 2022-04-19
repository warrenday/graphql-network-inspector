const fs = require("fs")
const path = require("path")

class BrowserWebpackPlugin {
  constructor(options) {
    this.name = "browserWebpackPlugin"
    this.manifestPath = path.join(__dirname, "../build/manifest.json")
    this.firefoxDevtoolsFile = path.join(
      __dirname,
      "../build/devtools/devtools.firefox.js"
    )
    this.devtoolsFile = path.join(__dirname, "../build/devtools/devtools.js")

    this.isFirefox = options.buildTarget === "firefox"
  }

  apply(compiler) {
    const pluginName = this.constructor.name

    compiler.hooks.afterEmit.tap(pluginName, (_) => {
      const manifestVersion = this.isFirefox ? 2 : 3

      // Change manifest version
      fs.readFile(this.manifestPath, "utf-8", (_, manifestFile) => {
        const newManifestFile = manifestFile.replace(
          '"{{manifest_version}}"',
          manifestVersion
        )
        fs.writeFileSync(this.manifestPath, newManifestFile)
      })

      // Replace devtools with appropriate version
      fs.readFile(this.firefoxDevtoolsFile, "utf-8", (_, file) => {
        if (this.isFirefox) {
          fs.writeFileSync(this.devtoolsFile, file)
        }

        return fs.unlinkSync(this.firefoxDevtoolsFile)
      })
    })
  }
}

module.exports = BrowserWebpackPlugin
