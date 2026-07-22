import integrityManifest from '../generated/content-integrity.json';

function toHex(bytes) {
  return [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2, '0')).join('');
}

async function sha256(buffer) {
  if (!globalThis.crypto?.subtle) return null;
  return toHex(await crypto.subtle.digest('SHA-256', buffer));
}

export async function verifyBundledContent(buildInfo, {verifyHashes = true} = {}) {
  const failures = [];

  if (integrityManifest.appVersion !== buildInfo.appVersion) {
    failures.push(`integrity app version ${integrityManifest.appVersion} != ${buildInfo.appVersion}`);
  }
  if (integrityManifest.contentVersion !== buildInfo.contentVersion) {
    failures.push(`integrity content version ${integrityManifest.contentVersion} != ${buildInfo.contentVersion}`);
  }
  if (!Array.isArray(integrityManifest.files) || !integrityManifest.files.length) {
    failures.push('integrity manifest contains no files');
  }

  for (const entry of integrityManifest.files || []) {
    try {
      const response = await fetch(new URL(entry.path, document.baseURI), {cache: 'no-store'});
      if (!response.ok) {
        failures.push(`${entry.path}: HTTP ${response.status}`);
        continue;
      }
      const buffer = await response.arrayBuffer();
      if (Number(entry.bytes) !== buffer.byteLength) {
        failures.push(`${entry.path}: expected ${entry.bytes} bytes, received ${buffer.byteLength}`);
        continue;
      }
      if (verifyHashes && entry.sha256) {
        const digest = await sha256(buffer);
        if (digest && digest !== entry.sha256) failures.push(`${entry.path}: checksum mismatch`);
      }
    } catch (error) {
      failures.push(`${entry.path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failures.length) {
    const error = new Error(`Bundled content integrity failed: ${failures.join('; ')}`);
    error.name = 'ContentIntegrityError';
    error.failures = failures;
    throw error;
  }

  return Object.freeze({
    ok: true,
    fileCount: integrityManifest.files.length,
    contentVersion: integrityManifest.contentVersion,
    buildId: integrityManifest.buildId,
  });
}
