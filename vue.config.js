const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  productionSourceMap: false,
  chainWebpack: config => {
    config.plugin('monaco').use(MonacoWebpackPlugin, [
      {
        languages: ['java', 'php'],
        features: ['!accessibilityHelp', '!bracketMatching', '!caretOperations', '!clipboard', '!codeAction', '!codelens', '!colorDetector', '!comment', '!contextmenu', '!coreCommands', '!cursorUndo', '!dnd', '!find', '!folding', '!fontZoom', '!format', '!gotoError', '!gotoLine', '!gotoSymbol', '!hover', '!iPadShowKeyboard', '!inPlaceReplace', '!inspectTokens', '!linesOperations', '!links', '!multicursor', '!parameterHints', '!quickCommand', '!quickOutline', '!referenceSearch', '!rename', '!smartSelect', '!snippets', '!suggest', '!toggleHighContrast', '!toggleTabFocusMode', '!transpose', '!wordHighlighter', '!wordOperations', '!wordPartOperations']
      }
    ])
  },
  devServer: {
        proxy: {//配置跨域
            '/api': {
                target: 'https://localhost:44361/',
                ws: true,
                changOrigin: true,//允许跨域
                pathRewrite: {
                    '^/api': 'api'//请求的时候使用这个api就可以
                }
            },
            '/admin': {
                target: 'https://localhost:44361/',
                ws: true,
                changOrigin: true,//允许跨域
            },
            '/fileroot': {
                target: 'https://localhost:44361/',
                ws: true,
                changOrigin: true,//允许跨域
            },
            '/img': {
                target: 'https://localhost:44361/',
                ws: true,
                changOrigin: true,//允许跨域
            },
            '/login': {
                target: 'https://localhost:44361/',
                ws: true,
                changOrigin: true,//允许跨域
            },
        }
    }
};