export class CleverPushLog {
  static log(str: string) {
    console.log(`\tcleverpush-expo-plugin: ${str}`);
  }

  static error(str: string) {
    console.error(`\tcleverpush-expo-plugin: ${str}`);
  }
}
