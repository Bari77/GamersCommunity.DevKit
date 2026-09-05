import { withNativeFederation, shareAll } from '@angular-architects/native-federation-v4/config';

export default withNativeFederation({
  name: '__GameCamel__',
  exposes: {
    './Routes': './src/app/__GameKebab__.routes.ts',
  },
  shared: {
    ...shareAll(
      { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' },
      {
        overrides: {
          '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package', includeSecondaries: { keepAll: true } },
          '@angular/platform-browser': { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package', includeSecondaries: { keepAll: true } },
          '@angular/animations': { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package', includeSecondaries: { keepAll: true } },
          '@angular/cdk': { singleton: true, strictVersion: true, requiredVersion: '21.0.6', build: 'package', includeSecondaries: { keepAll: true } },
          'zone.js': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        },
      },
    ),
  },
  skip: [
    'rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket',
    '@angular/cdk/schematics', 'zone.js/node', 'zone.js/testing',
    '@angular/cli', '@angular/build', '@angular/compiler-cli',
    '@angular-architects/native-federation-v4', '@softarc/native-federation-orchestrator',
  ],
  features: { denseChunking: true },
});
