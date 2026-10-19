const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// drizzle-kit'in ürettiği migration dosyaları (.sql) kaynak olarak okunur (babel inline-import metne çevirir).
config.resolver.sourceExts.push('sql');

module.exports = config;
