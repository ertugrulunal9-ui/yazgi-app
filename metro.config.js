const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Türkçe karakter içermeyen proje yolu (Windows kullanıcı klasör adı ertuğrul olduğu için)
// Bu ayar, X-React-Native-Project-Root header'ında geçersiz karakter hatasını önler
config.projectRoot = __dirname;
config.resolver.platforms = Array.from(new Set([...(config.resolver.platforms || []), 'fx']));

// Startup performance: defer module initialization to first use.
// This significantly reduces JS startup time for large data files (events, etc).
// Web'de kapalı: inline require, react-native-worklets'in platform kontrolünde
// (`globalThis.__RUNTIME_KIND === require('../runtimeKind').RuntimeKind.ReactNative`)
// global'i modül yüklenmeden okutuyor; web native yola düşüp WorkletsError ile açılışta çöküyordu.
config.transformer.getTransformOptions = async (_entryPoints, options) => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: options?.platform !== 'web',
  },
});

module.exports = config;
