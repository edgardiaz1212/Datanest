const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const Dotenv = require('dotenv-webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = merge(common, {
    mode: 'production',
    output: {
        publicPath: '/'
    },
    
    plugins: [
        new BundleAnalyzerPlugin(),
        new Dotenv({
            safe: true,
            systemvars: true
        })
    ]
});
