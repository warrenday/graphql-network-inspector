// Custom config on top of CRA see:
// https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#configuration

const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = ({ env }) => {
  const isEnvDevelopment = env === "development"

  return {
    style: {
      postcss: {
        plugins: [require("tailwindcss"), require("autoprefixer")],
      },
    },
    webpack: {
      configure: {
        // To access source maps during development as an unpacked extension
        // we need source maps to be inline, otherwise chrome will not load
        // them corretly.
        devtool: isEnvDevelopment ? "inline-source-map" : false,
        resolve: {
          extensions: [".ts", ".tsx", ".json"],
          alias: {
            "@": path.resolve("src"),
          },
        },
      },
      plugins: [
        new CopyWebpackPlugin({
          patterns: [
            {
              from: "public",
              globOptions: {
                ignore: ["**/index.html"],
              },
            },
          ],
        }),
      ],
    },
    devServer: {
      // This allows use to develop via an unpacked extension in chrome
      // During development changes are written to disk, so we can see changes
      // within the loaded extension within needing to re-build the entire bundle
      writeToDisk: true,
    },
  }
}
