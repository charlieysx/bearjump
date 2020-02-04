module.exports = {
    "presets": [
        ["@babel/env", {"useBuiltIns": "usage", "corejs": 3}]
    ],
    "plugins": [
        "@babel/syntax-dynamic-import",
        "@babel/proposal-class-properties",
        "@babel/proposal-private-methods",
        "@babel/proposal-optional-chaining",
        "@babel/proposal-export-default-from",
        "@babel/proposal-export-namespace-from",
        ["@babel/transform-runtime", {
            "corejs": 3,
            "helpers": false,
            "regenerator": true,
            "useESModules": true
        }]
    ]
};
