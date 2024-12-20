import fs from "fs";

import { CleverPushLog } from "./CleverPushLog";
import { FileManager } from "./FileManager";
import {
  NSE_PODFILE_REGEX,
  NSE_PODFILE_SNIPPET,
  NSE_TARGET_NAME,
} from "./iosConstants";

export async function updatePodfile(iosPath: string) {
  const podfile = await FileManager.readFile(`${iosPath}/Podfile`);
  const matchesNSE = podfile.match(NSE_PODFILE_REGEX);
  // const matchesNCE = podfile.match(NCE_PODFILE_REGEX);

  if (matchesNSE) {
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

  // if (matchesNCE) {
  //   CleverPushLog.log(
  //     NCE_TARGET_NAME + " target already added to Podfile. Skipping..."
  //   );
  // } else {
  //   fs.appendFile(`${iosPath}/Podfile`, NCE_PODFILE_SNIPPET, (err) => {
  //     if (err) {
  //       CleverPushLog.error("Error writing to Podfile");
  //     }
  //   });
  // }
}
