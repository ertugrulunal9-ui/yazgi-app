import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = path.resolve(__dirname, '../..');
const gatePath = path.join(projectRoot, 'scripts', 'monetization-release-gate.cjs');
const productionAndroidAppId = 'ca-app-pub-7452780443706539~6798586178';

const validAppJson = {
  expo: {
    plugins: [
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: productionAndroidAppId,
          iosAppId: 'ca-app-pub-7452780443706539~1458002511',
        },
      ],
    ],
    extra: {
      admob: {
        androidRewardedUnitId: 'ca-app-pub-7452780443706539/8447534175',
        androidInterstitialUnitId: 'ca-app-pub-7452780443706539/7601150500',
      },
      revenueCat: { androidApiKey: 'goog_example_key' },
    },
  },
};

const manifestWithAppId = (appId: string) =>
  `<manifest xmlns:android="http://schemas.android.com/apk/res/android"><application><meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${appId}" /></application></manifest>`;

describe('Android monetization release gate native AdMob app ID', () => {
  let fixtureRoot: string;

  beforeEach(() => {
    fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yazgi-release-gate-'));
    fs.mkdirSync(path.join(fixtureRoot, 'android', 'app', 'src', 'main'), { recursive: true });
    fs.writeFileSync(path.join(fixtureRoot, 'app.json'), JSON.stringify(validAppJson));
    fs.writeFileSync(path.join(fixtureRoot, 'eas.json'), JSON.stringify({
      build: { production: { android: { buildType: 'app-bundle' } } },
    }));
  });

  afterEach(() => {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  });

  const runGate = () => spawnSync(process.execPath, [gatePath, '--platform', 'android'], {
    cwd: fixtureRoot,
    encoding: 'utf8',
  });

  it('rejects a Google test ID in the native manifest when app.json has a production ID', () => {
    fs.writeFileSync(
      path.join(fixtureRoot, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'),
      manifestWithAppId('ca-app-pub-3940256099942544~3347511713'),
    );

    const result = runGate();

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Native Android AdMob app ID: Google test ID');
  });

  it('rejects a native app ID that differs from the configured production ID', () => {
    fs.writeFileSync(
      path.join(fixtureRoot, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'),
      manifestWithAppId('ca-app-pub-1234567890123456~6798586178'),
    );

    const result = runGate();

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('does not match plugins.react-native-google-mobile-ads.androidAppId');
  });

  it('accepts a native app ID matching the configured production ID', () => {
    fs.writeFileSync(
      path.join(fixtureRoot, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'),
      manifestWithAppId(productionAndroidAppId),
    );

    const result = runGate();

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Monetization release gate passed.');
  });

  it('rejects a missing native application ID', () => {
    fs.writeFileSync(
      path.join(fixtureRoot, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'),
      '<manifest><application /></manifest>',
    );

    const result = runGate();

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Native Android AdMob app ID: missing');
  });

  it('rejects a malformed native application ID', () => {
    fs.writeFileSync(
      path.join(fixtureRoot, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'),
      manifestWithAppId('not-an-admob-app-id'),
    );

    const result = runGate();

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Native Android AdMob app ID: invalid format');
  });
});
