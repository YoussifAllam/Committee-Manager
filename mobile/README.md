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

To build an installable APK, use EAS (`npx eas-cli@latest build -p android`). Once you add native modules
that Expo Go doesn't bundle, you'll also need a development build (see [AGENTS.md](AGENTS.md)).

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
  components/           # Shared UI: Screen, Card, Button, Chip, Icon, ThemedText
  features/             # Per-feature components and types (home, meetings, assignments)
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
- Put the shared HTTP client in `src/api/` once the backend exists, and replace the imports from `src/mocks/`.
- Icons are [Material Symbols](https://fonts.google.com/icons) names passed to `<Icon name="..." />`.
- Text always goes through `<ThemedText type="...">` so it gets the Arabic fonts and line heights. On Android
  each font weight is its own family (`Fonts` in the theme), so never set `fontWeight`.
- Always use `npx expo install <pkg>` to add dependencies so the versions match SDK 57.
- Screens render `<Screen>` as their root so safe areas and theme colors stay consistent.
