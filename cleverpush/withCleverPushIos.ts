/**
 * Expo config plugin for One Signal (iOS)
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */

import * as fs from 'fs';
import * as path from 'path';

import {
  ConfigPlugin,
  withDangerousMod,
  withEntitlementsPlist,
  withInfoPlist,
  withXcodeProject,
} from '@expo/config-plugins';

import { CleverPushLog } from '../support/CleverPushLog';
import { FileManager } from '../support/FileManager';
import {
  IPHONEOS_DEPLOYMENT_TARGET,
  NSE_EXT_FILES,
  NSE_SOURCE_FILE,
  NSE_TARGET_NAME,
  TARGETED_DEVICE_FAMILY,
} from '../support/iosConstants';
import NseUpdaterManager from '../support/NseUpdaterManager';
import { updatePodfile } from '../support/updatePodfile';
import { CleverPushPluginProps } from '../types/types';

// import assert from "assert";
// import getEasManagedCredentialsConfigExtra from "../support/eas/getEasManagedCredentialsConfigExtra";
// import { ExpoConfig } from "@expo/config-types";

/**
 * Add 'aps-environment' record with current environment to '<project-name>.entitlements' file
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */
const withAppEnvironment: ConfigPlugin<CleverPushPluginProps> = (
  config,
  cleverpushProps
) => {
  return withEntitlementsPlist(config, (newConfig) => {
    if (cleverpushProps?.mode == null) {
      throw new Error(`
        Missing required "mode" key in your app.json or app.config.js file for "cleverpush-expo-plugin".
        "mode" can be either "development" or "production".
        Please see cleverpush-expo-plugin's README.md for more details.`);
    }
    newConfig.modResults["aps-environment"] = cleverpushProps.mode;
    return newConfig;
  });
};

/**
 * Add "Background Modes -> Remote notifications" and "App Group" permissions
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */
const withRemoteNotificationsPermissions: ConfigPlugin<
  CleverPushPluginProps
> = (config) => {
  const BACKGROUND_MODE_KEYS = ["remote-notification"];
  return withInfoPlist(config, (newConfig) => {
    if (!Array.isArray(newConfig.modResults.UIBackgroundModes)) {
      newConfig.modResults.UIBackgroundModes = [];
    }
    for (const key of BACKGROUND_MODE_KEYS) {
      if (!newConfig.modResults.UIBackgroundModes.includes(key)) {
        newConfig.modResults.UIBackgroundModes.push(key);
      }
    }

    return newConfig;
  });
};

/**
 * Add "App Group" permission
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps (step 4.4)
 */
const withAppGroupPermissions: ConfigPlugin<CleverPushPluginProps> = (
  config
) => {
  const APP_GROUP_KEY = "com.apple.security.application-groups";
  return withEntitlementsPlist(config, (newConfig) => {
    if (!Array.isArray(newConfig.modResults[APP_GROUP_KEY])) {
      newConfig.modResults[APP_GROUP_KEY] = [];
    }
    const modResultsArray = newConfig.modResults[APP_GROUP_KEY] as Array<any>;
    const entitlement = `group.${
      newConfig?.ios?.bundleIdentifier || ""
    }.cleverpush`;
    if (modResultsArray.indexOf(entitlement) !== -1) {
      return newConfig;
    }
    modResultsArray.push(entitlement);

    return newConfig;
  });
};

// const withEasManagedCredentials: ConfigPlugin<CleverPushPluginProps> = (
//   config
// ) => {
//   assert(
//     config.ios?.bundleIdentifier,
//     "Missing 'ios.bundleIdentifier' in app config."
//   );
//   config.extra = getEasManagedCredentialsConfigExtra(config as ExpoConfig);
//   return config;
// };

const withCleverPushPodfile: ConfigPlugin<CleverPushPluginProps> = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      // not awaiting in order to not block main thread
      const iosRoot = path.join(config.modRequest.projectRoot, "ios");
      updatePodfile(iosRoot).catch((err) => {
        CleverPushLog.error(err);
      });

      return config;
    },
  ]);
};

const withCleverPushNSE: ConfigPlugin<CleverPushPluginProps> = (
  config,
  props
) => {
  // support for monorepos where node_modules can be above the project directory.
  const pluginDir = require.resolve("cleverpush-expo-plugin/package.json");
  const sourceDir = path.join(
    pluginDir,
    "../build/support/serviceExtensionFiles/"
  );

  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const iosPath = path.join(config.modRequest.projectRoot, "ios");

      /* COPY OVER EXTENSION FILES */
      fs.mkdirSync(`${iosPath}/${NSE_TARGET_NAME}`, { recursive: true });

      for (let i = 0; i < NSE_EXT_FILES.length; i++) {
        const extFile = NSE_EXT_FILES[i];
        const targetFile = `${iosPath}/${NSE_TARGET_NAME}/${extFile}`;
        await FileManager.copyFile(`${sourceDir}${extFile}`, targetFile);
      }

      // Copy NSE source file either from configuration-provided location, falling back to the default one.
      const sourcePath =
        props.iosNSEFilePath ?? `${sourceDir}${NSE_SOURCE_FILE}`;
      const targetFile = `${iosPath}/${NSE_TARGET_NAME}/${NSE_SOURCE_FILE}`;
      await FileManager.copyFile(`${sourcePath}`, targetFile);

      /* MODIFY COPIED EXTENSION FILES */
      const nseUpdater = new NseUpdaterManager(iosPath);
      await nseUpdater.updateNSEEntitlements(
        `group.${config.ios?.bundleIdentifier}.cleverpush`
      );

      return config;
    },
  ]);
};

const withCleverPushXcodeProject: ConfigPlugin<
  CleverPushPluginProps & {
    targetName: string;
    extFiles: string[];
    sourceFile: string;
  }
> = (config, props) => {
  return withXcodeProject(config, (newConfig) => {
    const xcodeProject = newConfig.modResults;

    if (!!xcodeProject.pbxTargetByName(props.targetName)) {
      CleverPushLog.log(
        `${props.targetName} already exists in project. Skipping...`
      );
      return newConfig;
    }

    // Create new PBXGroup for the extension
    const extGroup = xcodeProject.addPbxGroup(
      [...props.extFiles, props.sourceFile],
      props.targetName,
      props.targetName
    );

    // Add the new PBXGroup to the top level group. This makes the
    // files / folder appear in the file explorer in Xcode.
    const groups = xcodeProject.hash.project.objects["PBXGroup"];
    Object.keys(groups).forEach((key) => {
      if (
        typeof groups[key] === "object" &&
        groups[key].name === undefined &&
        groups[key].path === undefined
      ) {
        xcodeProject.addToPbxGroup(extGroup.uuid, key);
      }
    });

    // WORK AROUND for codeProject.addTarget BUG
    // Xcode projects don't contain these if there is only one target
    // An upstream fix should be made to the code referenced in this link:
    //   - https://github.com/apache/cordova-node-xcode/blob/8b98cabc5978359db88dc9ff2d4c015cba40f150/lib/pbxProject.js#L860
    const projObjects = xcodeProject.hash.project.objects;
    projObjects["PBXTargetDependency"] =
      projObjects["PBXTargetDependency"] || {};
    projObjects["PBXContainerItemProxy"] =
      projObjects["PBXTargetDependency"] || {};

    // Add the target
    // This adds PBXTargetDependency and PBXContainerItemProxy for you
    const target = xcodeProject.addTarget(
      props.targetName,
      "app_extension",
      props.targetName,
      `${config.ios?.bundleIdentifier}.${props.targetName}`
    );

    // Add build phases to the new target
    xcodeProject.addBuildPhase(
      [props.sourceFile],
      "PBXSourcesBuildPhase",
      "Sources",
      target.uuid
    );
    xcodeProject.addBuildPhase(
      [],
      "PBXResourcesBuildPhase",
      "Resources",
      target.uuid
    );
    xcodeProject.addBuildPhase(
      [],
      "PBXFrameworksBuildPhase",
      "Frameworks",
      target.uuid
    );

    // Edit the Deployment info of the new Target, only IphoneOS and Targeted Device Family
    // However, can be more
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    for (const key in configurations) {
      if (
        typeof configurations[key].buildSettings !== "undefined" &&
        configurations[key].buildSettings.PRODUCT_NAME ==
          `"${props.targetName}"`
      ) {
        const isDebug = configurations[key].name.includes("Debug");
        const buildSettingsObj = configurations[key].buildSettings;

        buildSettingsObj.ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS =
          "YES";
        buildSettingsObj.CLANG_ANALYZER_NONNULL = "YES";
        buildSettingsObj.CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION =
          "YES_AGGRESSIVE";
        buildSettingsObj.CLANG_CXX_LANGUAGE_STANDARD = '"gnu++20"';
        buildSettingsObj.CLANG_ENABLE_OBJC_WEAK = "YES";
        buildSettingsObj.CLANG_WARN_DOCUMENTATION_COMMENTS = "YES";
        buildSettingsObj.CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = "YES";
        buildSettingsObj.CLANG_WARN_UNGUARDED_AVAILABILITY = "YES_AGGRESSIVE";
        // Conditionally add entitlements for NSE target
        if (props.targetName === NSE_TARGET_NAME) {
          buildSettingsObj.CODE_SIGN_ENTITLEMENTS = `${props.targetName}/${props.targetName}.entitlements`;
        }
        buildSettingsObj.CODE_SIGN_STYLE = "Automatic";
        if (!isDebug) {
          buildSettingsObj.COPY_PHASE_STRIP = "NO";
        }
        buildSettingsObj.CURRENT_PROJECT_VERSION = "1";
        buildSettingsObj.DEBUG_INFORMATION_FORMAT = isDebug
          ? "dwarf-with-dsym"
          : "dwarf";
        buildSettingsObj.DEVELOPMENT_TEAM = props?.devTeam;
        buildSettingsObj.ENABLE_USER_SCRIPT_SANDBOXING = "NO";
        buildSettingsObj.GCC_C_LANGUAGE_STANDARD = "gnu17";
        buildSettingsObj.GENERATE_INFOPLIST_FILE = "YES";
        buildSettingsObj.INFOPLIST_FILE = `${props.targetName}/${props.targetName}-Info.plist`;
        buildSettingsObj.INFOPLIST_KEY_CFBundleDisplayName = props.targetName;
        buildSettingsObj.INFOPLIST_KEY_NSHumanReadableCopyright = '""';
        buildSettingsObj.IPHONEOS_DEPLOYMENT_TARGET =
          props?.iPhoneDeploymentTarget ?? IPHONEOS_DEPLOYMENT_TARGET;
        buildSettingsObj.LD_RUNPATH_SEARCH_PATHS = `(
					"$(inherited)",
					"@executable_path/Frameworks",
					"@executable_path/../../Frameworks",
				)`;
        buildSettingsObj.LOCALIZATION_PREFERS_STRING_CATALOGS = "YES";
        buildSettingsObj.MARKETING_VERSION = "1.0";
        if (isDebug) {
          buildSettingsObj.MTL_ENABLE_DEBUG_INFO = "INCLUDE_SOURCE";
        }
        buildSettingsObj.MTL_FAST_MATH = "YES";
        buildSettingsObj.SWIFT_EMIT_LOC_STRINGS = "YES";
        buildSettingsObj.TARGETED_DEVICE_FAMILY = TARGETED_DEVICE_FAMILY;
      }
    }

    // Add development teams
    xcodeProject.addTargetAttribute("DevelopmentTeam", props?.devTeam, target);
    xcodeProject.addTargetAttribute("DevelopmentTeam", props?.devTeam);

    return newConfig;
  });
};

export const withCleverPushIos: ConfigPlugin<CleverPushPluginProps> = (
  config,
  props
) => {
  config = withAppEnvironment(config, props);
  config = withRemoteNotificationsPermissions(config, props);
  config = withAppGroupPermissions(config, props);
  config = withCleverPushPodfile(config, props);
  config = withCleverPushNSE(config, props);
  config = withCleverPushXcodeProject(config, {
    ...props,
    targetName: NSE_TARGET_NAME,
    extFiles: NSE_EXT_FILES,
    sourceFile: NSE_SOURCE_FILE,
  });
  // config = withEasManagedCredentials(config, props);
  return config;
};
