module.exports = function(api) {
  // Cache invalidation: Environment değişikliklerinde cache'i temizle
  api.cache.using(() => process.env.NODE_ENV);
  
  return {
    presets: [
      // React 18+ için JSX transform source belirt
      ['babel-preset-expo', { jsxImportSource: 'react' }]
    ],
    plugins: [
      // Reanimated 4+ plugin - worklet özelliği zaten entegre
      // Not: Bu plugin mutlaka en sonda OLMALI
      'react-native-reanimated/plugin',
    ],
  };
};
