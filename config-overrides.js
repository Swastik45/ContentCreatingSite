module.exports = function override(config) {
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...config.resolve.fallback,
    buffer: require.resolve('buffer/'),
    process: require.resolve('process/browser'),
    stream: require.resolve('stream-browserify'),
    vm: require.resolve('vm-browserify'),
    path: require.resolve('path-browserify'),
    os: require.resolve('os-browserify/browser'),
    crypto: require.resolve('crypto-browserify'),
  };
  return config;
};