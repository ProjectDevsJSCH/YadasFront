/* eslint-disable @typescript-eslint/no-var-requires */

function getClientEnvironment() {
  const raw = Object.keys(process.env)
    // Custom regex to allow only a certain category of variables available to the application
    .reduce(
      (env, key) => {
        if (!key.startsWith('VUE_APP')) {
          return env;
        }

        env[key] = process.env[key];

        return env;
      },
      {
        NODE_ENV: process.env.NODE_ENV || 'development',
      },
    );
  // Stringify all values so we can feed into Webpack DefinePlugin

  const stringified = Object.keys(raw).reduce((env, key) => {
    env[key] = typeof raw[key] === 'string' ? raw[key] : JSON.stringify(raw[key]);

    return env;
  }, {});

  return { raw, stringified };
}

const env = getClientEnvironment();
const searchReplaceEnv = Object.entries(env.stringified).map(([key, value]) => (
  {
    search: `process.env.${key}`,
    replace: `'${value}'`,
  }
));

console.log(searchReplaceEnv);

module.exports = {
  transpileDependencies: ['vuetify'],
  configureWebpack: (config) => {
    config.module.rules = [
      {
        test: /\.(js|ts)$/,
        loader: 'string-replace-loader',
        options: {
          multiple: searchReplaceEnv,
        },
      },
      ...config.module.rules,
    ];
  },
};
