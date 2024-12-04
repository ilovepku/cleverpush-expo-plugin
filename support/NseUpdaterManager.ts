import { FileManager } from "./FileManager";
import {
  GROUP_IDENTIFIER_TEMPLATE_REGEX,
  NSE_TARGET_NAME,
} from "./iosConstants";

// project `ios/CleverPushNotificationServiceExtension` directory
const entitlementsFileName = `${NSE_TARGET_NAME}.entitlements`;

export default class NseUpdaterManager {
  private nsePath = "";
  constructor(iosPath: string) {
    this.nsePath = `${iosPath}/${NSE_TARGET_NAME}`;
  }

  async updateNSEEntitlements(groupIdentifier: string): Promise<void> {
    const entitlementsFilePath = `${this.nsePath}/${entitlementsFileName}`;
    let entitlementsFile = await FileManager.readFile(entitlementsFilePath);

    entitlementsFile = entitlementsFile.replace(
      GROUP_IDENTIFIER_TEMPLATE_REGEX,
      groupIdentifier
    );
    await FileManager.writeFile(entitlementsFilePath, entitlementsFile);
  }
}
