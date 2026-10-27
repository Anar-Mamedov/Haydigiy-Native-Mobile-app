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
    plugins: [
      // Importing one icon from the package root ran all ~1,760 icon modules before
      // the first frame; load each icon from its own file instead. See
      // babel/direct-member-imports.js.
      [
        './babel/direct-member-imports',
        { source: '@tamagui/lucide-icons-2', target: '@tamagui/lucide-icons-2/icons/[name]' },
      ],
    ],
  };
};
