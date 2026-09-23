/** Native-only AdMob loader kept behind platform resolution. */
export const loadAdMobModule = (): unknown => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-google-mobile-ads');
  } catch {
    return null;
  }
};
