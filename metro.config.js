const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Türkçe karakter içermeyen proje yolu (Windows kullanıcı klasör adı ertuğrul olduğu için)
// Bu ayar, X-React-Native-Project-Root header'ında geçersiz karakter hatasını önler
config.projectRoot = __dirname;
config.resolver.platforms = Array.from(new Set([...(config.resolver.platforms || []), 'fx']));

module.exports = config;
