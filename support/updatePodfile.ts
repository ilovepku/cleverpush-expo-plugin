import fs from "fs";
import {
  NSE_PODFILE_REGEX,
  NSE_PODFILE_SNIPPET,
  NSE_TARGET_NAME,
} from "./iosConstants";
import { CleverPushLog } from "./CleverPushLog";
import { FileManager } from "./FileManager";

export async function updatePodfile(iosPath: string) {
  const podfile = await FileManager.readFile(`${iosPath}/Podfile`);
  const matches = podfile.match(NSE_PODFILE_REGEX);

  if (matches) {
    CleverPushLog.log(
      NSE_TARGET_NAME + " target already added to Podfile. Skipping..."
    );
  } else {
    fs.appendFile(`${iosPath}/Podfile`, NSE_PODFILE_SNIPPET, (err) => {
      if (err) {
        CleverPushLog.error("Error writing to Podfile");
      }
    });
  }
}
