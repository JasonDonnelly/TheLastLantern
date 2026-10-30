# The Last Lantern — recorded narrator edition

All 21 supplied MP3 recordings are included. No device text-to-speech is used.

## Update GitHub Pages
Copy the contents of this folder into your existing repository root, replacing app.js, index.html and sw.js and keeping the audio folder. Commit and push. No build is required. Keep Pages configured to publish from main / (root).

Open the deployed app online after deployment, wait a few moments, then close and reopen it (or reload). The new service worker replaces the old cache. Sound & help shows when the app and recordings are ready offline. Initial download is about 6.6 MB.

Existing device-voice settings become recorded narration. Text-only mode remains available. Previously imported recordings still override bundled clips; use Remove imported recordings to hear the bundled versions.

Timers start after narration ends. Replay repeats the current phase recording. Keep the app visible during play. If browser playback is blocked, tap Replay. Audio errors fall back to on-screen text, never synthetic speech.

The MP3 filenames must match the paths in app.js and sw.js, including case and spaces. To replace an existing recording, retain its filename and increment the CACHE version in sw.js. Optional imports in Sound & help remain local to that device.

## Checks
Run `node tests.cjs` and `node sw-tests.cjs` from this folder. No npm dependencies.
Mobile audio and home-screen installation should also be checked on the actual phone.
