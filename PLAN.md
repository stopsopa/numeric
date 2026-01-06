# PLAN: Numerical Keyboard Trainer

## 1. Overview

An Express-based web application to train numerical keyboard entry speed and accuracy.

## 2. Core Screens

### 1) Start Screen

- **User Identification:**
  - Dropdown to select existing username from Leaderboard.
  - Text field to enter a new name.
- **Session Settings (Dropdowns/Toggles):**
  - **Error Handling Mode:** `Carry on` (default) vs. `Leave empty`.
  - **Group Size:** Number of digits per group (e.g., 3, 4, 5).
  - **Groups per Line:** Number of groups displayed per line.
  - **Total Lines:** Number of lines for the session.
  - **Font Size:** Adjustable font size for task numbers.
  - **Font Family:** Choice from a curated list of easy-to-read fonts.
  - **Sound Selection:** Dropdown of available sounds (loaded from `/sounds/list.json`).
- **Actions:**
  - **Start Button:** Begins the session and switches to Work Screen.
  - **Leaderboard Button:** Navigates to the Leaderboard screen.

### 2) Work Screen

- **Layout:**
  - Fully filled screen with multiple lines of generated numbers.
  - Numbers are grouped (e.g., `123  456  789`).
  - Below each task line is an input area (mirrored blocks).
- **Interactions:**
  - User types numbers matching the task above.
  - **'x' Button:** Located in the corner to abandon run. Prompts for confirmation before returning to Start Screen.
- **Error Handling:**
  - **Carry on Mode:** Error sound plays, input field stays empty until correct key is hit.
  - **Leave empty Mode:** Error sound plays, field marked as error, focus moves to next field immediately.
- **Completion:** Auto-switches to Summary Screen once all lines are filled.

### 3) Summary Screen

- **Metrics Display:**
  - **Accuracy:** (Total Correct / Total Digits) %.
  - **Time Taken:** Total duration.
  - **Error Count:** Total number of wrong key presses.
- **Achievements:**
  - If a record is broken (highest accuracy, fastest time, etc.), show confetti animation and a "New Record!" splash screen.
- **Actions:**
  - **Leaderboard Button:** Go to Leaderboard.
  - **Restart Button:** Return to Start Screen.

### 4) Leaderboard Screen

- **Display:**
  - List of entries with User Name, Accuracy, Time, and Error Count.
  - **Sorting:** Ability to sort by any of the metric columns.
- **Action:**
  - **Return Button:** Back to Start Screen.

## 3. Configuration & Data Storage

### Global Config Object

A single source of truth for app constants and limits:

```javascript
const CONFIG = {
  defaults: {
    groupSize: 4,
    groupsPerLine: 5,
    totalLines: 10,
    fontSize: "24px",
    errorMode: "carry_on",
    fontFamily: "Roboto Mono",
  },
  limits: {
    groupSize: { min: 1, max: 10 },
    groupsPerLine: { min: 1, max: 20 },
    totalLines: { min: 1, max: 100 },
    fontSize: { min: 12, max: 72 },
  },
};
```

### File System Storage (Paths)

- **Settings:** `~/numeric/settings.json` (Last selected sound, font, etc.)
- **Current User:** `~/numeric/current_user.json` (Last used username)
- **Leaderboard:** `~/numeric/leaderboard.json` (All session records)

## 4. Technical Details

### Backend (Express.js)

- Server to handle file I/O for leaderboard and settings.
- Serve static files (HTML, CSS, JS, Sounds).
- API endpoints for saving/loading data from `~/numeric/`.

### Frontend (Vanilla CSS & JS)

- Single Page Application (SPA) structure using hidden/visible sections or dynamic rendering.
- **No Dark Mode.** Focus on high-contrast, readable UI.
- **Micro-animations:** Smooth transitions between screens.
- **Confetti:** Use a library like `canvas-confetti` for achievements.

### Sound Management

- **Location:** `/public/sounds/`
- **Registry:** `/public/sounds/list.json`
  - Format: `[{"file": "beep.mp3", "name": "Classic Beep"}, ...]`
  - First element is the default.
- **Implementation:** Preload sounds using `AudioContext` or `HTML5 Audio` with low-latency techniques to ensure zero-delay playback on error.

## 5. Responsive Design

- Optimized for Mac Desktop environment.
- No mobile or small-screen responsiveness required.

# Releasing:
Follow instructions from: https://github.com/stopsopa/musicfilter/blob/main/electron/SHIP.md
Prepare installation instruction similar to : https://github.com/stopsopa/musicfilter/tree/main/electron
Use Github Actions style from: https://github.com/stopsopa/musicfilter/tree/main/.github/workflows