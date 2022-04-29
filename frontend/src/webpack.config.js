const path = require('path')
const webpack = require('webpack')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
    entry: './index.js',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: { minimize: true },
                    },
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'sass-loader',
                    },
                ],
            },
            {
                test: /\.(png|ico)$/,
                include: [path.resolve(__dirname, 'assets/images/public')],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'images/',
                        },
                    },
                ],
            },
            {
                test: /\.(png|svg|jpg|gif|mp4|webm|mp3)$/,
                exclude: [path.resolve(__dirname, 'assets/images/public')],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[contenthash].[ext]',
                            outputPath: 'static/img/',
                        },
                    },
                ],
            },
            {
                test: /\.(woff(2)?|otf|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[contenthash].[ext]',
                            outputPath: 'static/fonts/',
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.scss'],
        alias: {
            common$: path.resolve(__dirname, 'styles/common.scss'),
            global: path.resolve(__dirname, 'styles/'),
            assets: path.resolve(__dirname, 'assets/'),
            fonts: path.resolve(__dirname, 'assets/fonts/'),
            img: path.resolve(__dirname, 'assets/images/'),
            common: path.resolve(__dirname, 'components/_common/'),
        },
    },
    output: {
        path: path.join(__dirname, '/dist'),
        filename: isProd ? 'static/js/[name].[contenthash].js' : '[name].js',
        chunkFilename: isProd
            ? 'static/js/c/[name].[contenthash].js'
            : '[name].js',
        publicPath: '/',
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'assets/images/public', to: 'images' },
                { from: 'assets/images/inventory', to: 'static/img/inventory' },
                { from: 'assets/items', to: 'static/items' },
                { from: 'assets/images/gold', to: 'static/img/gold' },
                { from: 'assets/images/track', to: 'static/img/track' },
            ],
        }),
        new HtmlWebPackPlugin({
            template: './index.ejs',
            filename: './index.html',
            templateParameters: {
                headScripts: isProd
                    ? `
                    <!-- tr -->`
                    : `<!-- No tracking in dev -->`,
            },
        }),
    ],
    // generate source map
    devtool: isProd ? undefined : 'cheap-module-source-map',
    // devServer: {
    //     host: '0.0.0.0',
    //     port: 8080,
    //     contentBase: './dist',
    //     historyApiFallback: true,
    //     watchOptions: {
    //         poll: true,
    //     },
    // },
    target: 'web',
    devServer: {
        host: '0.0.0.0',
        port: 8080,
        contentBase: ['./dist'], // both src and output dirs
        inline: true,
        hot: true,
        historyApiFallback: true,
        overlay: true,
    },
}
