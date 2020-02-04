module.exports = {
    root: true,
    env: {
        amd: true,
        browser: true,
        node: true,
        es6: true
    },
    extends: [
        'eslint:recommended'
    ],
    rules: {
        'no-console': 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-unused-vars': 'off',
        'semi':['error','always'],
        'indent': ['error', 4],
        'no-async-promise-executor': 'off'
    },
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module'
    },
    globals: {
        wx: 'writable',
        PIXI: 'writable',
        canvas: 'writable',
        pixiUitl: 'writable'
    }
}
  