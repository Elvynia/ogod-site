var path = require("path");
var config = {
    mode: 'development',
    entry: {
        worker: path.resolve(__dirname, 'src/worker.ts'),
    },
    output: {
        path: path.resolve(__dirname, 'src/assets/'),
        filename: '[name].js'
    },
    devtool: 'source-map',
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                loader: "ts-loader",
                options: {
                    configFile: 'tsconfig.worker.json'
                }
            }
        ]
    }
}

module.exports = config;
