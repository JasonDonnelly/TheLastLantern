# The Last Lantern — mobile PWA MVP

Buildless HTML, CSS and JavaScript. No accounts, backend, player abilities or investigation tracking.
The app stores only the public phase, round, timer and player count locally.

## Run / deploy
Serve `dist/` using an HTTP server. HTTPS is required for PWA installation and service workers (localhost is exempt).
GitHub Pages: copy the CONTENTS of dist into your repository root, then Settings → Pages → Deploy from a branch.
All URLs are relative, so a project subpath works. No build or npm install required.
This version is also deployed as a private Site.

## Narration
01 opening is included. Default mode uses the recording then the device's text-to-speech voice for missing clips.
The device voice is a functional placeholder, not an ElevenLabs character voice. Availability/offline support varies.
Sound & help lets you switch to recorded clips + text, or text only.
Import numbered MP3s from Sound & help. Files are saved in IndexedDB on that browser/device and not uploaded.
An imported clip overrides the included recording. Keep your source recordings elsewhere; browser storage may be evicted.

Clip numbers match the approved 21-clip script:
01 opening
02 setup
03 close eyes
04 Shades awaken
05 Shades close eyes
06 wake / council one
07 proposal
08 resolve council
09 comments
10 pass captain
11 council two
12 council three
13 final discussion
14 prepare vote
15 final vote
16 runoff discussion
17 runoff vote
18 Light victory
19 Shade victory
20 extra minute
21 play again

Name files e.g. 02-setup.mp3, 18-light-wins.mp3. The leading two digits determine the slot.
Only import audio from your chosen script/voice. Tags belong in the TTS input, not in captions.

## Timing
Narration ends before the phase timer starts.
Opening night: two seconds after close-eyes clip, eight seconds after recognition clip, two seconds after close-Shades clip.
Council discussion 60s → proposal 20s → manual council resolution → comments 30s.
After councils 1/2, manually pass captain and press Ready. After council 3, final discussion 60s.
Voting and winner selection are manual; optional runoff is 30s. No extension in runoff or comments.
+60s only appears during council/final discussion; players enforce once-per-game power rules.
Leaving the app pauses playback/timers. Resume is explicit. A screen wake lock is requested when supported.

## Offline / updates
The service worker caches core app files and the original opening. Local imports remain in IndexedDB.
Initial installation needs a successful online visit. Private hosting authentication may still require connectivity.
Bump the cache version in sw.js when changing static files. Imported recordings remain local.
On iPhone, test in Safari and Add to Home Screen. Real-device audio/installation testing remains necessary.

## Checks
Run `node tests.cjs` from the project root.
