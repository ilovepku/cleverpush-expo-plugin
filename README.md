<h1 align="center">Welcome to the cleverpush-expo-plugin 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/cleverpush-expo-plugin" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/cleverpush-expo-plugin.svg">
  </a>
  <a href="https://github.com/ilovepku/cleverpush-expo-plugin#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/ilovepku/cleverpush-expo-plugin/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
</p>

> The CleverPush Expo plugin allows you to use CleverPush without leaving the managed workflow. Forked from onesignal-expo-plugin.

- 🏠 [Homepage](https://github.com/ilovepku/cleverpush-expo-plugin#readme)
- 🖤 [npm](https://www.npmjs.com/package/cleverpush-expo-plugin)

## Overview

This plugin is an [Expo Config Plugin](https://docs.expo.dev/guides/config-plugins/). It extends the Expo config to allow customizing the prebuild phase of managed workflow builds (no need to eject to a bare workflow). For the purposes of CleverPush integration, the plugin facilitates automatically generating/configuring the necessary native code files needed to get the [CleverPush React-Native SDK](https://github.com/cleverpush/cleverpush-react-native-sdk) to work. You can think of adding a plugin as adding custom native code.

## Supported environments:

- [The Expo run commands](https://docs.expo.dev/workflow/customizing/) (`expo run:[android|ios]`)
- [Custom clients](https://blog.expo.dev/introducing-custom-development-clients-5a2c79a9ddf8)
- [EAS Build](https://docs.expo.dev/build/introduction/)

---

## Install

You need both the `cleverpush-expo-plugin` _and_ the `cleverpush-react-native` npm package.

```sh
npx expo install cleverpush-expo-plugin

# npm
npm install cleverpush-react-native

# yarn
yarn add cleverpush-react-native
```

## Configuration in app.json / app.config.js

### Plugin

Add the plugin to the **front** of the [plugin array](https://docs.expo.dev/versions/latest/config/app/). It should be added automatically if you ran `npx expo install`. Just make sure it is the first plugin in the array and to configure any desired plugin props:

**app.json**

```json
{
  "plugins": [
    [
      "cleverpush-expo-plugin",
      {
        "mode": "development"
      }
    ]
  ]
}
```

or

**app.config.js**

```js
export default {
  ...
  plugins: [
    [
      "cleverpush-expo-plugin",
      {
        mode: "development",
      }
    ]
  ]
};
```

#### Plugin Prop

You can pass props to the plugin config object to configure:

| Plugin Prop              |              |                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`                   | **required** | Used to configure [APNs environment](https://developer.apple.com/documentation/bundleresources/entitlements/aps-environment) entitlement. `"development"` or `"production"`                                                                                                                                                                                         |
| `devTeam`                | optional     | Used to configure Apple Team ID. You can find your Apple Team ID by running `expo credentials:manager` e.g: `"91SW8A37CR"`                                                                                                                                                                                                                                          |
| `iPhoneDeploymentTarget` | optional     | Target `IPHONEOS_DEPLOYMENT_TARGET` value to be used when adding the iOS NSE. A deployment target is nothing more than the minimum version of the operating system the application can run on. This value should match the value in your Podfile e.g: `"12.0"`.                                                                                                     |
| `smallIcons`             | optional     | An array of local paths to small notification icons for Android. Image should be white, transparent, and 96x96 in size. Input images will be automatically scaled down and placed in the appropriate resource folders. e.g: `["./assets/ic_stat_cleverpush_default.png"]`.                                                                                          |
| `largeIcons`             | optional     | An array of local paths to large notification icons for Android. Image should be white, transparent, and 256x256 in size. e.g: `["./assets/ic_cleverpush_large_icon_default.png"]`.                                                                                                                                                                                 |
| `smallIconAccentColor`   | optional     | The accent color to use for notification icons on Android. Must be a valid hex value, e.g: `"#FF0000"`                                                                                                                                                                                                                                                              |
| `iosNSEFilePath`         | optional     | The local path to a custom Notification Service Extension (NSE), written in Objective-C. The NSE will typically start as a copy of the [default NSE](https://github.com/ilovepku/cleverpush-expo-plugin/blob/main/support/serviceExtensionFiles/NotificationService.m), then altered to support any custom logic required. e.g: `"./assets/NotificationService.m"`. |

### Versioning

In your configuration file, make sure you set:

| Property               | Details                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `version`              | Your app version. Corresponds to `CFBundleShortVersionString` on iOS. It is a human-readable version number of an iOS app, and is typically in the format of "X.X.X" (e.g. "1.0" or "2.3.1"). It is the version number that is typically displayed to users in the App Store and in the app itself. This value will be used in your NSE\* target's plist file.                                                                       |
| `ios.buildNumber`      | Build number for your iOS standalone app. Corresponds to `CFBundleVersion` and must match Apple's specified format (e.g: "42" or "100"). The build number is used by the App Store and iOS to identify and track different versions of an app, and is typically incremented for each new release. It is a number typically used for the developer's and system reference. This value will be used in your NSE\* target's plist file. |
| `ios.bundleIdentifier` | Bundle identifier for your iOS standalone app. Corresponds to `CFBundleIdentifier`. It's a unique identifier string that is used to identify an iOS app or bundle. It is typically in the format of `"com.companyname.appname"` (e.g. `"com.example.myapp"`). This value will be used in your NSE\* target's plist and entitlements file.                                                                                            |

\* NSE = Notification Service Extension.

## EAS (Expo Application Services)

See our [EAS documentation](EAS.md) for help with EAS.

### iOS Credentials: OneSignal + EAS

To distribute your iOS application via EAS, you will need to ensure your credentials are set up correctly. See our [credentials setup guide for instructions](IOS_CREDENTIALS_EAS.md).

## Prebuild (optional)

Prebuilding in Expo will result in the generation of the native runtime code for the project (and `ios` and `android` directories being built). By prebuilding, we automatically link and configure the native modules that have implemented CocoaPods, autolinking, and other config plugins. You can think of prebuild like a native code bundler.

When you run `expo prebuild` we enter into a custom managed workflow which provides most of the benefits of bare workflows and managed workflows at the same time.

#### Why should I prebuild?

It may make sense to prebuild locally to inspect config plugin changes and help in debugging issues.

#### Run

```sh
npx expo prebuild
```

```sh
# nukes changes and rebuilds
npx expo prebuild --clean
```

**EAS Note:** if you choose to stay in a fully managed workflow by not prebuilding, EAS will still run `npx expo prebuild` at build time. You can also prebuild locally but remain in a fully managed workflow by adding the `android` and `ios` directories to your .gitignore.

## Run

The following commands will prebuild _and_ run your application. Note that for iOS, push notifications will **not** work in the Simulator.

```sh
# Build and run your native iOS project
npx expo run:ios

# Build and run your native Android project
npx expo run:android
```

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/ilovepku/cleverpush-expo-plugin/issues).

## Show your support

Give a ⭐️ if this project helped you!

## Links

- Github: [@ilovepku](https://github.com/ilovepku)
- LinkedIn: [@iloveku](https://www.linkedin.com/in/ilovepku/)

## 📝 License

Copyright © 2024 [OneSignal](https://github.com/OneSignal) [Sean Lee](https://github.com/ilovepku).<br />
This project is [MIT](https://github.com/ilovepku/cleverpush-expo-plugin/blob/main/LICENSE) licensed.
