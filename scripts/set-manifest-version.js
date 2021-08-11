const fs = require("fs");
const packageJson = require("../package.json");

const manifestPath = "./build/manifest.json";

fs.readFile(manifestPath, "utf-8", (err, contents) => {
  const newContents = contents.replace(
    "{{package_version}}",
    packageJson.version
  );
  fs.writeFile(manifestPath, newContents, () => {});
});
