#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const APP_JSON_PATH = path.join(process.cwd(), 'app.json');
const EAS_JSON_PATH = path.join(process.cwd(), 'eas.json');

const PLACEHOLDER_PATTERN = /(TODO|REPLACE|YOUR_|CHANGE_ME|<.*>|PLACEHOLDER)/i;
const ADMOB_APP_ID_PATTERN = /^ca-app-pub-\d{16}~\d+$/;
const ADMOB_UNIT_ID_PATTERN = /^ca-app-pub-\d{16}\/\d+$/;
const TEST_PUB_PREFIX = 'ca-app-pub-3940256099942544';

const ADMOB_TEST_APP_IDS = new Set([
  'ca-app-pub-3940256099942544~3347511713',
  'ca-app-pub-3940256099942544~1458002511',
]);

const ADMOB_TEST_UNIT_IDS = new Set([
  'ca-app-pub-3940256099942544/5224354917', // Android rewarded
  'ca-app-pub-3940256099942544/1033173712', // Android interstitial
  'ca-app-pub-3940256099942544/1712485313', // iOS rewarded
  'ca-app-pub-3940256099942544/4411468910', // iOS interstitial
]);

const isObjectRecord = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalize = (value) => (typeof value === 'string' ? value.trim() : '');

const parseTargetPlatform = () => {
  const args = process.argv.slice(2);
  const index = args.indexOf('--platform');
  if (index === -1) return 'all';

  const value = normalize(args[index + 1]).toLowerCase();
  if (value === 'android' || value === 'ios' || value === 'all') {
    return value;
  }

  throw new Error('Invalid --platform value. Use one of: android, ios, all');
};

const readJson = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
};

const pickFirst = (candidates) => {
  for (const candidate of candidates) {
    const value = normalize(candidate.value);
    if (value) {
      return { value, source: candidate.source };
    }
  }
  return { value: '', source: 'none' };
};

const getPluginConfig = (expoConfig, pluginName) => {
  if (!Array.isArray(expoConfig.plugins)) return {};
  for (const plugin of expoConfig.plugins) {
    if (Array.isArray(plugin) && plugin[0] === pluginName && isObjectRecord(plugin[1])) {
      return plugin[1];
    }
  }
  return {};
};

const assertRequiredIdentifier = ({
  label,
  value,
  source,
  errors,
  pattern,
  testSet,
}) => {
  if (!value) {
    errors.push(`${label}: missing (${source})`);
    return;
  }
  if (PLACEHOLDER_PATTERN.test(value)) {
    errors.push(`${label}: placeholder value (${source})`);
    return;
  }
  if (testSet && (testSet.has(value) || value.startsWith(TEST_PUB_PREFIX))) {
    errors.push(`${label}: Google test ID is not allowed for production (${source})`);
    return;
  }
  if (pattern && !pattern.test(value)) {
    errors.push(`${label}: invalid format (${source})`);
  }
};

const main = () => {
  const errors = [];
  const warnings = [];
  const targetPlatform = parseTargetPlatform();
  const shouldCheckAndroid = targetPlatform === 'all' || targetPlatform === 'android';
  const shouldCheckIos = targetPlatform === 'all' || targetPlatform === 'ios';

  const appJson = readJson(APP_JSON_PATH);
  const expo = isObjectRecord(appJson.expo) ? appJson.expo : {};
  const extra = isObjectRecord(expo.extra) ? expo.extra : {};
  const admobExtra = isObjectRecord(extra.admob) ? extra.admob : {};
  const revenueCatExtra = isObjectRecord(extra.revenueCat) ? extra.revenueCat : {};
  const admobPlugin = getPluginConfig(expo, 'react-native-google-mobile-ads');

  const androidAppId = pickFirst([
    { source: 'plugins.react-native-google-mobile-ads.androidAppId', value: admobPlugin.androidAppId },
  ]);
  const iosAppId = pickFirst([
    { source: 'plugins.react-native-google-mobile-ads.iosAppId', value: admobPlugin.iosAppId },
  ]);

  const rcAndroid = pickFirst([
    { source: 'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY', value: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY },
    {
      source: 'EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY',
      value: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    },
    { source: 'expo.extra.revenueCat.androidApiKey', value: revenueCatExtra.androidApiKey },
  ]);
  const rcIos = pickFirst([
    { source: 'EXPO_PUBLIC_REVENUECAT_IOS_KEY', value: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY },
    { source: 'EXPO_PUBLIC_REVENUECAT_IOS_API_KEY', value: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY },
    { source: 'expo.extra.revenueCat.iosApiKey', value: revenueCatExtra.iosApiKey },
  ]);

  const rewardedAndroid = pickFirst([
    {
      source: 'EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_UNIT_ID',
      value: process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_UNIT_ID,
    },
    { source: 'expo.extra.admob.androidRewardedUnitId', value: admobExtra.androidRewardedUnitId },
  ]);
  const rewardedIos = pickFirst([
    {
      source: 'EXPO_PUBLIC_ADMOB_IOS_REWARDED_UNIT_ID',
      value: process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_UNIT_ID,
    },
    { source: 'expo.extra.admob.iosRewardedUnitId', value: admobExtra.iosRewardedUnitId },
  ]);
  const interstitialAndroid = pickFirst([
    {
      source: 'EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_UNIT_ID',
      value: process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_UNIT_ID,
    },
    { source: 'expo.extra.admob.androidInterstitialUnitId', value: admobExtra.androidInterstitialUnitId },
  ]);
  const interstitialIos = pickFirst([
    {
      source: 'EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_UNIT_ID',
      value: process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_UNIT_ID,
    },
    { source: 'expo.extra.admob.iosInterstitialUnitId', value: admobExtra.iosInterstitialUnitId },
  ]);

  if (shouldCheckAndroid) {
    assertRequiredIdentifier({
      label: 'AdMob Android app ID',
      value: androidAppId.value,
      source: androidAppId.source,
      errors,
      pattern: ADMOB_APP_ID_PATTERN,
      testSet: ADMOB_TEST_APP_IDS,
    });
    assertRequiredIdentifier({
      label: 'AdMob Android rewarded unit ID',
      value: rewardedAndroid.value,
      source: rewardedAndroid.source,
      errors,
      pattern: ADMOB_UNIT_ID_PATTERN,
      testSet: ADMOB_TEST_UNIT_IDS,
    });
    assertRequiredIdentifier({
      label: 'AdMob Android interstitial unit ID',
      value: interstitialAndroid.value,
      source: interstitialAndroid.source,
      errors,
      pattern: ADMOB_UNIT_ID_PATTERN,
      testSet: ADMOB_TEST_UNIT_IDS,
    });
    assertRequiredIdentifier({
      label: 'RevenueCat Android API key',
      value: rcAndroid.value,
      source: rcAndroid.source,
      errors,
    });

    if (rewardedAndroid.value && interstitialAndroid.value && rewardedAndroid.value === interstitialAndroid.value) {
      warnings.push('Android rewarded/interstitial unit IDs are identical. Use separate format-specific AdMob units.');
    }

    if (rcAndroid.value && !/^goog_/i.test(rcAndroid.value)) {
      warnings.push(
        `RevenueCat Android key format is unusual (${rcAndroid.source}). Expected prefix: goog_`
      );
    }
  }

  if (shouldCheckIos) {
    assertRequiredIdentifier({
      label: 'AdMob iOS app ID',
      value: iosAppId.value,
      source: iosAppId.source,
      errors,
      pattern: ADMOB_APP_ID_PATTERN,
      testSet: ADMOB_TEST_APP_IDS,
    });
    assertRequiredIdentifier({
      label: 'AdMob iOS rewarded unit ID',
      value: rewardedIos.value,
      source: rewardedIos.source,
      errors,
      pattern: ADMOB_UNIT_ID_PATTERN,
      testSet: ADMOB_TEST_UNIT_IDS,
    });
    assertRequiredIdentifier({
      label: 'AdMob iOS interstitial unit ID',
      value: interstitialIos.value,
      source: interstitialIos.source,
      errors,
      pattern: ADMOB_UNIT_ID_PATTERN,
      testSet: ADMOB_TEST_UNIT_IDS,
    });
    assertRequiredIdentifier({
      label: 'RevenueCat iOS API key',
      value: rcIos.value,
      source: rcIos.source,
      errors,
    });

    if (rewardedIos.value && interstitialIos.value && rewardedIos.value === interstitialIos.value) {
      warnings.push('iOS rewarded/interstitial unit IDs are identical. Use separate format-specific AdMob units.');
    }

    if (rcIos.value && !/^appl_/i.test(rcIos.value)) {
      warnings.push(`RevenueCat iOS key format is unusual (${rcIos.source}). Expected prefix: appl_`);
    }
  }

  if (shouldCheckAndroid && fs.existsSync(EAS_JSON_PATH)) {
    const eas = readJson(EAS_JSON_PATH);
    const buildType = normalize(eas?.build?.production?.android?.buildType).toLowerCase();
    if (buildType !== 'app-bundle') {
      errors.push(
        `eas.json build.production.android.buildType must be "app-bundle" for Google Play (current: ${buildType || 'missing'})`
      );
    }
  } else if (shouldCheckAndroid) {
    warnings.push('eas.json not found. Could not verify production Android build type.');
  }

  if (errors.length > 0) {
    console.error('Monetization release gate failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    if (warnings.length > 0) {
      console.warn('\nWarnings:');
      for (const warning of warnings) {
        console.warn(`- ${warning}`);
      }
    }
    process.exit(1);
  }

  console.log('Monetization release gate passed.');
  if (warnings.length > 0) {
    console.warn('Warnings:');
    for (const warning of warnings) {
      console.warn(`- ${warning}`);
    }
  }
};

main();
