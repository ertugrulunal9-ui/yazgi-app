const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Türkçe karakter içermeyen proje yolu (Windows kullanıcı klasör adı ertuğrul olduğu için)
// Bu ayar, X-React-Native-Project-Root header'ında geçersiz karakter hatasını önler
config.projectRoot = __dirname;
config.resolver.platforms = Array.from(new Set([...(config.resolver.platforms || []), 'fx']));

// Startup performance: defer module initialization to first use.
// This significantly reduces JS startup time for large data files (events, etc).
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
