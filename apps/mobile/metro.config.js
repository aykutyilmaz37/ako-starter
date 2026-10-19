const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const config = getDefaultConfig(__dirname);

// pnpm, react sürümü farklı workspace paketleri için @tanstack/react-query'nin ayrı kopyalarını kurar;
// api-client'ın hook'ları uygulamanın QueryClientProvider'ını göremez. Tek kopyaya zorla.
const SINGLETONS = ['@tanstack/react-query'];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (SINGLETONS.some((name) => moduleName === name || moduleName.startsWith(`${name}/`))) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(__dirname, 'package.json') },
      moduleName,
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
