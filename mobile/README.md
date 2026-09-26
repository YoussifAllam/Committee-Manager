# Meetings Manager — Mobile

Android app built with [Expo](https://expo.dev) (SDK 57) and Expo Router.

## Run it

```bash
npm install
npm start
```

Install **Expo Go** on your Android phone and scan the QR code from the terminal. Your phone and computer
must be on the same network. You don't need the Android SDK or Android Studio for this.

To build an installable APK, use EAS (`npx eas-cli@latest build -p android`). Once you add native modules
that Expo Go doesn't bundle, you'll also need a development build (see [AGENTS.md](AGENTS.md)).

## Checks

```bash
npm run typecheck
npm run lint
```

## Structure

```
src/
  app/                  # Routes only (Expo Router): each file is a screen
    _layout.tsx         # Root stack + navigation theme
    (tabs)/             # Bottom tabs: Meetings, Calendar, Profile
    meetings/[id].tsx   # Meeting details   /meetings/:id
    meetings/new.tsx    # Create meeting (modal)
  components/           # Shared UI: Screen, ThemedText, ThemedView
  constants/theme.ts    # Colors (light/dark), fonts, spacing
  hooks/                # Shared hooks (useTheme)
```

Conventions:

- Keep `src/app/` for routes and layouts. Put other code outside it.
- When a feature gets real logic, give it its own folder (`src/features/meetings/` holding its components,
  hooks and API calls) and keep the route file thin.
- Put the shared HTTP client in `src/api/` once the backend exists.
- Always use `npx expo install <pkg>` to add dependencies so the versions match SDK 57.
- Screens render `<Screen>` as their root so safe areas and theme colors stay consistent.
