/**
 * Expo config plugin for CleverPush
 */

import { ConfigPlugin } from '@expo/config-plugins';

import { validatePluginProps } from '../support/helpers';
import { CleverPushPluginProps } from '../types/types';
import { withCleverPushAndroid } from './withCleverPushAndroid';
import { withCleverPushIos } from './withCleverPushIos';

const withCleverPush: ConfigPlugin<CleverPushPluginProps> = (config, props) => {
  // if props are undefined, throw error
  if (!props) {
    throw new Error(
      'You are trying to use the CleverPush plugin without any props. Property "mode" is required. Please see https://github.com/ilovepku/cleverpush-expo-plugin for more info.'
    );
  }

  validatePluginProps(props);

  config = withCleverPushIos(config, props);
  config = withCleverPushAndroid(config, props);

  return config;
};

export default withCleverPush;
