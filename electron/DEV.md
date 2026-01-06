# DEV: Numerical Keyboard Trainer

## Local Development

To test the application locally:

1.  **Install Dependencies:**

    ```bash
    npm install
    ```

2.  **Run in Development Mode:**
    ```bash
    npm run dev
    ```
    This will start the Vite dev server and then launch Electron, pointing it to the local server.

## Building and Packaging

To create a production build and package the application into a `.dmg` (macOS):

```bash
npm run build
npx electron-builder
```

The output will be located in the `release/` directory.

## File System Locations

- **Settings:** `~/numeric/settings.json`
- **Current User:** `~/numeric/current_user.json`
- **Leaderboard:** `~/numeric/leaderboard.json`
- **Sounds:** `/public/sounds/` with registry in `list.json`
