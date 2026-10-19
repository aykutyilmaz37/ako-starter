// Drizzle'ın paketlenmiş migration'ları (.sql) metin olarak içe aktarılır.
module.exports = (api) => {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
