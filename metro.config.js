// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable CSS support
config.resolver.sourceExts.push('css');

// Configure asset handling
config.resolver.assetExts = [
  ...config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'image/svg+xml'
];

// Add support for importing SVG files
config.resolver.sourceExts.push('svg');

module.exports = config;