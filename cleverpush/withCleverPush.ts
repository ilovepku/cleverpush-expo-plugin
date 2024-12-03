/**
 * Expo config plugin for One Signal
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */

import { ConfigPlugin } from "@expo/config-plugins";
import { CleverPushPluginProps } from "../types/types";
import { withCleverPushAndroid } from "./withCleverPushAndroid";
import { withCleverPushIos } from "./withCleverPushIos";
import { validatePluginProps } from "../support/helpers";

const withCleverPush: ConfigPlugin<CleverPushPluginProps> = (config, props) => {
  // if props are undefined, throw error
  if (!props) {
    throw new Error(
      'You are trying to use the CleverPush plugin without any props. Property "mode" is required. Please see https://github.com/OneSignal/onesignal-expo-plugin for more info.'
    );
  }

  validatePluginProps(props);

  config = withCleverPushIos(config, props);
  config = withCleverPushAndroid(config, props);

  return config;
};

export default withCleverPush;
