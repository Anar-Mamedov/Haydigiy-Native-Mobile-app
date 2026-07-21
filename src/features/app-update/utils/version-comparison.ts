import { InstalledAppVersion } from './installed-app-version';

const NUMERIC_VERSION_PATTERN = /^v?\d+(?:\.\d+)*$/i;

function parseVersion(value: string | null): string[] | null {
  const normalized = value?.trim().replace(/^v/i, '');
  if (!normalized || !NUMERIC_VERSION_PATTERN.test(normalized)) {
    return null;
  }

  return normalized.split('.').map((part) => part.replace(/^0+(?=\d)/, ''));
}

function compareSegment(remote: string, installed: string): number {
  if (remote.length !== installed.length) {
    return remote.length > installed.length ? 1 : -1;
  }
  if (remote === installed) {
    return 0;
  }

  return remote > installed ? 1 : -1;
}

function compareVersions(remote: string[], installed: string[]): number {
  const segmentCount = Math.max(remote.length, installed.length);
  for (let index = 0; index < segmentCount; index += 1) {
    const comparison = compareSegment(remote[index] ?? '0', installed[index] ?? '0');
    if (comparison !== 0) {
      return comparison;
    }
  }

  return 0;
}

/**
 * Integer server values represent the native build number. Dotted values represent
 * the user-facing application version. This keeps Android/iOS build comparison
 * exact while also supporting semantic versions such as `2.4.0`.
 */
export function isRemoteVersionNewer(
  remoteVersion: string,
  installedVersion: InstalledAppVersion,
): boolean {
  const remote = parseVersion(remoteVersion);
  if (!remote) {
    return false;
  }

  const localValue = remote.length === 1 && installedVersion.buildVersion
    ? installedVersion.buildVersion
    : installedVersion.applicationVersion;
  const installed = parseVersion(localValue);

  return installed ? compareVersions(remote, installed) > 0 : false;
}
