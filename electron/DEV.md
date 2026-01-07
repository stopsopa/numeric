# Developer Guide: Numerical Keyboard Trainer

## Local Development

To run the application in development mode:

```bash
# Install dependencies
npm install

# Start development server (Vite + Electron)
npm run dev
```

## Creating a Build

To create a production build for Mac (DMG):

```bash
# Build the application
npm run build

# Package the application using electron-builder
npx electron-builder build --mac
```

The output will be located in the `/release` directory.

## Data Storage

Settings and leaderboard data are stored in:
`~/numeric/`

- `settings.json`: App configuration.
- `current_user.json`: Last used username.
- `leaderboard.json`: Session records.

## Sound Registry

Sounds are managed in `public/sounds/list.json`. To add a new sound:

1. Place the `.mp3` file in `public/sounds/`.
2. Add its filename and a display name to `list.json`.
