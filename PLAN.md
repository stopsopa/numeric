# PLAN: Numerical Keyboard Trainer

## 1. Overview

An Electron-based application to train numerical keyboard entry speed and accuracy.

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
  - **Sound Selection:** Dropdown of available sounds (loaded from `/sounds/list.json`). Provide button to play sound to preview it.
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
  - don't use alert() function - create custom modal with yes and no buttons
- **Error Handling:**
  - **Carry on Mode:** Error sound plays, input field stays empty until correct key is hit.
  - **Leave empty Mode:** Error sound plays, field marked as error, focus moves to next field immediately.
- **Completion:** Auto-switches to Summary Screen once all lines are filled.
- make sure to align all boxes which user filles in right under the original numbers to copy
- remember that user copies what user sees. make sure that user once type 5 first digits cursor moves to next group and next number entered fills in next box in that next group - and like that until the end of the entire excercise
- typieg last digit in all work screen should automatically move to summary screen and execute it's logic

### 3) Summary Screen

- **Metrics Display:**
  - **Error Count:** Total number of wrong key presses. / Total number of key presses
  - **Accuracy:** next to above: (Total Correct / Total Digits) %.
  - **Time Taken:** Total duration. human readable (minutes, seconds)
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
  fonts: ["Roboto Mono", "....some other fonts...."],
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

### Frontend (Vanilla CSS & JS)

- entire electron app hold in /electron folder of this git repository
- Single Page Application (SPA) structure using hidden/visible sections or dynamic rendering.
- **No Dark Mode.** Focus on high-contrast, readable UI. (mainly variatons of gray colors)
- **Micro-animations:** No animation - fast reaction of UI prioritized
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

# DEV requirements
Create DEV.md describing in most compact way what command one should use to create electron build for this app, in order to test it locally

# Releasing:

WARNING: this has to be done
I've prepared .github/* setup also setup for electron - try to follow and adapt to it
