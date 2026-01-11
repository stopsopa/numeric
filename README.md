# Numerical Keyboard Trainer

## What is this?

An Electron-based application designed to train and improve numerical keyboard entry speed and accuracy. It provides real-time feedback, multiple session configurations (group sizes, fonts, error modes), and a comprehensive leaderboard to track progress.

## Known issues:

- [MusicFilter.app is damaged and can't be opened. You should move it to the Bin](https://github.com/stopsopa/musicfilter/issues/1)

### Where the idea came from?

I just needed this to help my children to learn typing on numeric keyboard.
I've tried to find something like this but after short effort I've realized that what I need is really finite complexity application. So I just vibecoded it in one evening and case closed.

## Installation from binary

Just go to [Github releases](../../releases), download the binary, and install it like any other app.

## Running in DEV mode

### Prerequisites

- Node.js and npm installed.

### Run

To run the application locally for development:

```bash
cd electron
npm install
npm run dev
```

### Building for Production (Mac)

To create a production-ready DMG:

```bash
cd electron
npm run build
npx electron-builder build --mac
```

The output will be available in the `electron/release` directory.
