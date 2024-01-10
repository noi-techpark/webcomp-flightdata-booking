// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: CC0-1.0
// need to compile node_modules (eg: vue-runtime-helps)
module.exports = api => {
  api.cache(false);
  return {
    presets: [
      ['@vue/babel-preset-jsx'],
      [
        '@babel/preset-env',
        {
          modules: false,
        },
      ],
    ],
    plugins: ['@babel/plugin-transform-object-assign'],
    env: {
      test: {
        presets: [
          ['@vue/babel-preset-jsx'],
          [
            '@babel/preset-env',
            {
              targets: {
                node: 'current',
              },
            },
          ],
        ],
      },
    },
  };
};
