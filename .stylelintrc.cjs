module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
  plugins: [],
  rules: {
    'string-quotes': 'single', // 单引号
    'function-url-quotes': 'always', // url使用引号
    'declaration-empty-line-before': null, // 声明前允许有空行
    'alpha-value-notation': 'number', // 用数字表示alpha的值
    'color-function-notation': 'legacy', // 颜色函数使用旧版表示法
  },
};
