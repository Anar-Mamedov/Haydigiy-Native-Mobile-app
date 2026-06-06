module.exports = function (api) {
  api.cache(true);
  return {
    // The Tamagui optimizing compiler (@tamagui/babel-plugin) is intentionally
    // not used: the RN Animated animation driver (see tamagui.config.ts) imports
    // react-native's Animated, which @tamagui/static cannot statically evaluate —
    // it yields a null config and crashes Tamagui rendering in tests and builds.
    // Tamagui runs fully at runtime via TamaguiProvider without the compiler.
    // (babel-preset-expo still provides the react-native-worklets/reanimated
    // plugin that React Navigation and gesture-handler rely on.)
    presets: ['babel-preset-expo'],
  };
};
