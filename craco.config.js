// Custom config on top of CRA see:
// https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#configuration

const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = ({ env }) => {
  const isEnvDevelopment = env === "development"

  return {
    style: {
      postcssOptions: {
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
      devMiddleware: {
        // This aid in debugging the source maps during development.
        // When loading an  unpacked extension in chrome we can see the
        // source files and easily debug without needing to rebuild the
        // entire app.
        writeToDisk: true,
      },
    },
  }
}
