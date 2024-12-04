import { FileManager } from "./FileManager";
import {
  BUNDLE_SHORT_VERSION_TEMPLATE_REGEX,
  BUNDLE_VERSION_TEMPLATE_REGEX,
  GROUP_IDENTIFIER_TEMPLATE_REGEX,
  NCE_TARGET_NAME,
} from "./iosConstants";

// project `ios/CleverPushNotificationContentExtension` directory
const entitlementsFileName = `${NCE_TARGET_NAME}.entitlements`;
const plistFileName = `Info.plist`;

export default class NceUpdaterManager {
  private ncePath = "";
  constructor(iosPath: string) {
    this.ncePath = `${iosPath}/${NCE_TARGET_NAME}`;
  }

  async updateNCEEntitlements(groupIdentifier: string): Promise<void> {
    const entitlementsFilePath = `${this.ncePath}/${entitlementsFileName}`;
    let entitlementsFile = await FileManager.readFile(entitlementsFilePath);

    entitlementsFile = entitlementsFile.replace(
      GROUP_IDENTIFIER_TEMPLATE_REGEX,
      groupIdentifier
    );
    await FileManager.writeFile(entitlementsFilePath, entitlementsFile);
  }

  async updateNCEBundleVersion(version: string): Promise<void> {
    const plistFilePath = `${this.ncePath}/${plistFileName}`;
    let plistFile = await FileManager.readFile(plistFilePath);
    plistFile = plistFile.replace(BUNDLE_VERSION_TEMPLATE_REGEX, version);
    await FileManager.writeFile(plistFilePath, plistFile);
  }

  async updateNCEBundleShortVersion(version: string): Promise<void> {
    const plistFilePath = `${this.ncePath}/${plistFileName}`;
    let plistFile = await FileManager.readFile(plistFilePath);
    plistFile = plistFile.replace(BUNDLE_SHORT_VERSION_TEMPLATE_REGEX, version);
    await FileManager.writeFile(plistFilePath, plistFile);
  }
}
