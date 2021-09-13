// Custom config on top of CRA see:
// https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#configuration

const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = ({ env }) => {
  const isEnvDevelopment = env === "development";

  return {
    style: {
      postcss: {
        plugins: [require("tailwindcss"), require("autoprefixer")],
      },
    },
    webpack: {
      configure: {
        devtool: isEnvDevelopment ? "inline-source-map" : false,
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
      writeToDisk: true,
    },
  };
};
