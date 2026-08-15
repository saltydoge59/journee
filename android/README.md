# Journee Android app (TWA)

This wraps the live journee website (`https://journee.curteisyang59.workers.dev`) as a
Trusted Web Activity — a thin Android shell that opens the deployed site
full-screen. There's no separate app codebase; rebuilding just repackages
whatever is live at that URL.

## One-time setup (already done on this machine)
- Bubblewrap CLI: `npm install -g @bubblewrap/cli`
- Android SDK + JDK 17, installed by Bubblewrap to `~/.bubblewrap/android_sdk` and `~/.bubblewrap/jdk/`
- `local.properties` — points Gradle at the SDK (gitignored, regenerate if missing: `echo "sdk.dir=$HOME/.bubblewrap/android_sdk" > local.properties`)
- `android.keystore` — the app's signing key (gitignored, **never commit**). Losing it means any future rebuild can't update the same installed app — it'll be treated as a different app. Back it up somewhere safe (password manager / secure storage), not in git.

## Rebuild after a site change

Deploy your changes to production first — the APK just repackages whatever
the manifest URL currently serves, it doesn't bundle any of this repo's code.

```bash
# 1. Deploy the web app (from repo root)
npm run deploy

# 2. Build the unsigned release APK
cd android
export JAVA_HOME=$HOME/.bubblewrap/jdk/jdk-17.0.11+9/Contents/Home
./gradlew assembleRelease

# 3. Align and sign it (uses build-tools 36.1.0 — check `ls ~/.bubblewrap/android_sdk/build-tools/` if the version differs)
BT=$HOME/.bubblewrap/android_sdk/build-tools/36.1.0

$BT/zipalign -v -p 4 app/build/outputs/apk/release/app-release-unsigned.apk app/build/outputs/apk/release/app-release-aligned.apk

$BT/apksigner sign --ks android.keystore --ks-key-alias android --out app/build/outputs/apk/release/journee-release.apk app/build/outputs/apk/release/app-release-aligned.apk
```

`apksigner` prompts for the keystore password and key password — type them
there, they're never passed as command-line arguments.

## Bump the version before rebuilding

Android requires a higher `appVersionCode` on every release you intend to
install over a previous one (a same-or-lower code will be rejected as a
downgrade). Edit `android/twa-manifest.json`:

```json
"appVersionName": "1.1",
"appVersionCode": 2
```

Then rebuild (steps 2–3 above). This project doesn't manage this version
alongside the web app's own `package.json` version — bump it manually per
Android release.

## Verify

```bash
$BT/apksigner verify --verbose app/build/outputs/apk/release/journee-release.apk
```

Should report `Verifies` with v1/v2 schemes true. Then install and click
through: app launches full-screen (no browser URL bar), Clerk sign-in works,
and a trip/photo flow behaves like the website.

```bash
adb install app/build/outputs/apk/release/journee-release.apk
```

Or transfer `journee-release.apk` to a device directly and tap to install
(requires enabling "install from unknown sources" — this is a sideloaded
APK, not a Play Store release).

## Known gotchas
- `JAVA_HOME` must point at a JDK 17 (not the system JDK, if it's a
  different version) — `.../jdk-17.0.11+9/Contents/Home`, not the parent dir.
- If `./gradlew` fails to resolve dependencies from `repo1.maven.org` with a
  `403 Forbidden` and a "This IP has been blocked... excessive or automated
  consumption of Maven Central" message, that's an IP-level rate limit on
  your network, not a project issue — wait it out or switch networks (e.g.
  mobile hotspot) and retry.
- Manifest is served at `/manifest.webmanifest`, not `/manifest.json` — the
  `.json` extension is NOT in the Clerk middleware's public/static allowlist
  (`src/middleware.ts`), so an unauthenticated fetch to a `.json` path gets
  redirected/blocked. `.webmanifest` is already whitelisted there.
