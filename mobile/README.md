# Meetings Manager — Mobile

Android app built with [Expo](https://expo.dev) (SDK 57) and Expo Router.

## Run it

```bash
npm install
npm start
```

Install **Expo Go** on your Android phone and scan the QR code from the terminal. Your phone and computer
must be on the same network. You don't need the Android SDK or Android Studio for this.

If Expo Go stays on the loading screen, the phone can't reach your computer. Usually it's on mobile data or
another Wi-Fi, a VPN is on, or the router isolates Wi-Fi clients. Connect the phone to the same Wi-Fi as the computer.
If it's working, `http://<computer-ip>:8081/status` opens in the phone's browser and shows `packager-status:running`.

`npm run tunnel` (or `make tunnel`) is a fallback that serves the app through a public URL. It uses Expo's shared
ngrok account, which is sometimes throttled and fails with `failed to start tunnel: remote gone away`. When that
happens, retry later or use Wi-Fi.

### Run over USB instead of Wi-Fi

If the phone can't reach the computer on Wi-Fi (different network, VPN, isolated router), connect it by USB cable
instead:

1. One-time device setup: **Settings → About phone**, tap **Build number** 7 times to unlock Developer options,
   then **Settings → Developer options** → turn on **USB debugging**.
2. Plug in the phone. On the notification about the USB connection mode, choose **File Transfer (MTP)** —
   "Charging only" won't work. Tap **Allow** on the "Allow USB debugging?" popup.
3. Run `make usb` (or `adb reverse tcp:8081 tcp:8081 && npm start`).
4. In Expo Go, choose **Enter URL manually** and type `exp://localhost:8081`.

This needs `adb` installed (`sudo dnf install android-tools` on Fedora) and, on Linux, a udev rule so `adb` can
access the device without root — see `/etc/udev/rules.d/51-android.rules`.

### Build an APK

- **On this computer:** `make apk-local` generates `android/` (`expo prebuild`) and builds a release APK for 64-bit
  ARM phones at `android/app/build/outputs/apk/release/app-release.apk`. Copy it to the phone and install it. It
  needs JDK 17 in `~/Android/jdk-17` and the Android SDK in `~/Android/Sdk`, plus about 6 GB of free RAM. The first
  build downloads dependencies and takes a while; later builds take minutes. The APK is signed with the debug key,
  which is fine for testing but not for the Play Store.
- **On Expo's servers:** `make apk` (EAS Build, free Expo account). Nothing to install locally.

`android/` is generated and git-ignored. Configure native behaviour in `app.json`, never by editing it.

## Reminders (فكّرني)

Personal reminders are local-only: they're stored in SQLite on the phone (`expo-sqlite`) and delivered by the OS
notification scheduler (`expo-notifications`: AlarmManager on Android). No server, Firebase or internet connection is
involved, and alerts arrive while the app is closed. The code lives in `src/features/reminders/`:

- `recurrence.ts` — pure rules: occurrences, Arabic descriptions, and the notification plan with stable identifiers.
- `repository.ts` — the SQLite database (`repository.web.ts`: IndexedDB for the web preview only).
- `scheduler.ts` — the OS scheduler (`scheduler.web.ts`: a stub; browsers can't alert after the tab closes).
- `service.ts` — every change goes through here: write the database, then make the OS schedule match it.
- `background-task.ts` — handles the notification buttons "تم" / "ذكّرني لاحقًا" while the app is closed.
  It's registered from `index.ts`, the app entry, before anything renders.

On the first launch after install the app asks for the notification permission straight away, then (Android 12+)
explains and opens the "Alarms & reminders" setting if it isn't allowed yet (`startup-permissions.tsx`). Whether exact
alarms are allowed comes from a small local native module, `modules/exact-alarm`, since Expo has no API for it; it
answers `true` in Expo Go and on the web, where it isn't available.

Open-ended daily and weekly rules use native repeating triggers. Other rules keep a window of the next 8
occurrences, which is topped up every time the app opens or resumes. expo-notifications re-registers alarms after a
reboot or an app update.

Expo Go can schedule local notifications, but the reboot handling, the buttons working while the app is closed, and
the app name on notifications need a development build (`npx expo run:android` or
`npx eas-cli@latest build --profile development -p android`).

## Checks

```bash
npm run typecheck
npm run lint
```

The same tasks are also available from the repo root through `make` (`make start`, `make check`, …). Run `make` to
list them all.

## Structure

```
src/
  app/                  # Routes only (Expo Router): each file is a screen
    _layout.tsx         # Root stack, fonts, RTL, navigation theme
    (tabs)/             # Bottom tabs: Home, Meetings, Assignments, Reminders, More
    meetings/[id].tsx   # Meeting details   /meetings/:id
    meetings/new.tsx    # Create meeting (modal)
    reminders/          # فكّرني: new, [id] details, [id]/edit, settings
  components/           # Shared UI: Screen, Card, Button, Chip, Icon, ThemedText
  features/             # Per-feature components, types and logic (meetings, assignments, reminders, …)
  mocks/                # Placeholder data until the Django API exists
  utils/date.ts         # Arabic date, time and countdown formatting
  constants/theme.ts    # Colors (light/dark), fonts, spacing, radius
  hooks/                # Shared hooks (useTheme)
```

Conventions:

- The app is Arabic and right-to-left (RTL) only. Use `start`/`end` (never `left`/`right`) for margins, padding and
  positions. RTL is forced natively in builds (the `expo-localization` plugin in `app.json`) and by `direction: 'rtl'`
  on the root view, so Expo Go mirrors the layout too.
- Keep `src/app/` for routes and layouts. Put other code outside it.
- The committee picked in the committee picker is app-wide (`useSelectedCommittee()` in
  `src/features/committees/selected-committee.tsx`). Home and Assignments filter by it; Meetings shows every committee.
- Put the shared HTTP client in `src/api/` once the backend exists, and replace the imports from `src/mocks/`.
- Icons are [Material Symbols](https://fonts.google.com/icons) names passed to `<Icon name="..." />`.
- Text always goes through `<ThemedText type="...">` so it gets the Arabic fonts and line heights. On Android
  each font weight is its own family (`Fonts` in the theme), so never set `fontWeight`.
- Always use `npx expo install <pkg>` to add dependencies so the versions match SDK 57.
- Screens render `<Screen>` as their root so safe areas and theme colors stay consistent.
