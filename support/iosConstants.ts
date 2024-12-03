export const IPHONEOS_DEPLOYMENT_TARGET = "14.0";
export const TARGETED_DEVICE_FAMILY = `"1,2"`;

export const NSE_TARGET_NAME = "CleverPushNotificationServiceExtension";
export const NSE_SOURCE_FILE = "NotificationService.m";
export const NSE_EXT_FILES = [
  "NotificationService.h",
  `${NSE_TARGET_NAME}.entitlements`,
  `Info.plist`,
];
export const NSE_PODFILE_SNIPPET = `
target '${NSE_TARGET_NAME}' do
  pod 'CleverPush'
  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
end`;

export const NSE_PODFILE_REGEX =
  /target 'CleverPushNotificationServiceExtension'/;

export const GROUP_IDENTIFIER_TEMPLATE_REGEX = /{{GROUP_IDENTIFIER}}/gm;
export const BUNDLE_SHORT_VERSION_TEMPLATE_REGEX = /{{BUNDLE_SHORT_VERSION}}/gm;
export const BUNDLE_VERSION_TEMPLATE_REGEX = /{{BUNDLE_VERSION}}/gm;

export const DEFAULT_BUNDLE_VERSION = "1";
export const DEFAULT_BUNDLE_SHORT_VERSION = "1.0";
