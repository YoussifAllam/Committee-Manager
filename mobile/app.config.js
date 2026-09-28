// The version lives in VERSION; everything else is in app.json.
const fs = require('fs');
const path = require('path');

const version = fs.readFileSync(path.join(__dirname, 'VERSION'), 'utf8').trim();
if (!/^\d+\.\d{1,2}\.\d{1,2}$/.test(version)) {
  throw new Error(`VERSION must look like 1.2.3 (minor and patch up to 99), got "${version}"`);
}
const [major, minor, patch] = version.split('.').map(Number);

module.exports = ({ config }) => ({
  ...config,
  version,
  android: {
    ...config.android,
    // Android won't install a build over one with a higher code, so it grows with the version: 1.2.3 -> 10203.
    versionCode: major * 10000 + minor * 100 + patch,
  },
});
