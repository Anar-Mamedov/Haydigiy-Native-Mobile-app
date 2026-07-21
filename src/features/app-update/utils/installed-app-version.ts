import * as Application from 'expo-application';

export type InstalledAppVersion = {
  applicationVersion: string | null;
  buildVersion: string | null;
};

/** Reads the versions embedded in the installed native application binary. */
export function getInstalledAppVersion(): InstalledAppVersion {
  return {
    applicationVersion: Application.nativeApplicationVersion,
    buildVersion: Application.nativeBuildVersion,
  };
}
