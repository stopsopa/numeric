# PLAN: Numerical Keyboard Trainer

## 1. Overview

An Electron-based application to train numerical keyboard entry speed and accuracy.

## 2. Core Screens

### 1) Start Screen

- **User Identification:**
  - Dropdown to select existing username from Leaderboard.
  - Text field to enter a new name. (hide this field if value other than empty selected in dropdown). make sure to keep it empty when in dropdown empty (default) value selected
- **Session Settings (Dropdowns/Toggles):**
  - **Error Handling Mode:** `Carry on` (default) vs. `Leave empty`.
  - **Group Size:** Number of digits per group (e.g., 3, 4, 5).
  - **Groups per Line:** Number of groups displayed per line.
  - **Total Lines:** Number of lines for the session.
  - **Font Size:** Adjustable font size for task numbers.
  - **Font Family:** Choice from a curated list of easy-to-read fonts. (introduce at least 10 fonts in the dropdown)
  - **Font Preview:** Below the font selection, display a demo area (3 blocks of numbers) that updates in real-time as font size or family changes.
  - **Sound Selection:** Dropdown of available sounds generated programmatically using the Web Audio API. Provide multiple distinct sound options (warm beeps, "ee" pulses, etc.). Provide button to play sound to preview it.
- **Actions:**
  - **Start Button:** Begins the session and switches to Work Screen.
  - **Leaderboard Button:** Navigates to the Leaderboard screen.
- add some decent UI to this screen

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
- make sure to align all boxes which user filles in right under the original numbers to copy (maybe introduce some kind of grid system in the layout to make sure about that), but make grid discreet don't render borders for each cell and so on, just implement carret to show where cursor is
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

- **Display Table Columns:**
  - **User:** Username.
  - **Accuracy:** Success rate.
  - **Time:** Duration.
  - **Errors:** Total mistakes.
  - **GS:** Group Size.
  - **G/L:** Groups per Line.
  - **Lines:** Total Lines.
  - **Mode:** Error handling mode.
- **Advanced Multi-Column Sorting (Three-Level Filter):**
  - **Primary Sort:** Clicking a column head for the first time sets it as the primary sort (Descending). Clicking the same column again toggles to Ascending.
  - **Secondary/Tertiary Sort:** While a primary sort is active, clicking another column adds it as a secondary sort level (sorting within the groups created by the primary sort). This supports up to **7 levels** of nested sorting.
  - Since we have 7 levels of sorting maybe just on relying on different shades of gray , let's use different background pattern, maybe small digits with that number grayish barely but still visible. build legend for each of them too separately.
  - **Visual Feedback (Color Coding pre-defined for all 7 levels):**
    - **Dark Gray background:** Primary column.
    - **Medium Gray background:** Secondary column.
    - **Light Gray background:** Tertiary column.
  - **Direction Indicators:** Use `▲` and `▼` icons next to column headers to show current direction.
  - **Legend:** A legend above the table describing what the background colors and icons mean.
  - **Reset Sorting Button:** A button to clear all active sorting criteria and return to default state.
- **Action:**
  - **Return Button:** Back to Start Screen. - keep button somewhere above the leaderboard table. In fact don't put anything under leaderboard table
- for colums represented by abbreviations like "GS" or "G/L" add tooltip on hover to explain what it means

- add also column date to leaderboard table - with the seconds. This column is sortable and supports multi-level sorting. Format Y-MM-DD HH:mm:ss

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

# back button

Button for going back to start screen should be always in top right corner and looks the same
Ideally i would like it to be the same component but with extra step with modal only when pressed from work screen

### File System Storage (Paths)

- **Settings:** `~/numeric/settings.json` (Last selected sound, font, etc.)
- **Current User:** `~/numeric/current_user.json` (Last used username)
- **Leaderboard:** `~/numeric/leaderboard.json` (All session records)

#### leaderboard.json format

```json
[
    {
      "name": "Simon",
      "accuracy": 96,
      "time": 15.578,
      "errors": 1,
      "totalKeys": 25,
      "date": "2026-01-06T23:53:31.199Z",
      "settings": {
        "groupSize": 3,
        "groupsPerLine": 4,
        "totalLines": 2
      }
    },
    ...
]
```

## 4. Technical Details

### Frontend (Vanilla CSS & JS)

- entire electron app hold in /electron folder of this git repository
- Single Page Application (SPA) structure using hidden/visible sections or dynamic rendering.
- **No Dark Mode.** Focus on high-contrast, readable UI. (mainly variatons of gray colors)
- **Micro-animations:** No animation - fast reaction of UI prioritized
- **Confetti:** Use a library like `canvas-confetti` for achievements.

### Sound Management

- **Implementation:** Sounds are generated programmatically in the renderer using the `Web Audio API`.
- **Latency:** Ensures zero-delay playback on error by using an `AudioContext` and short, synthesized envelopes.
- **Variety:** Includes several "warm" profiles like sine beeps, triangle pulses ("ee"), and percussive "wood-block" thuds.

## 5. Responsive Design

- Optimized for Mac Desktop environment.
- No mobile or small-screen responsiveness required.

# DEV requirements

Create DEV.md describing in most compact way what command one should use to create electron build for this app, in order to test it locally

# Releasing & Local Testing

- **Local Development:** See `DEV.md` for instructions on how to run and build the app locally.
- **Icon:** A custom app icon is located at `electron/build/icon.png`.
- **CI/CD:** GitHub Actions workflow is configured in `.github/workflows/release.yml` for automated releases.

# Tweak

I don't understand the concept of

Filtered Leaderboard

Show All Settings

just always show all records - allow me though to filter in advanced way as described above

# Best Score Detection & Leaderboard Highlighting

## 1. Work Screen → Summary Screen Transition

When an exercise is completed and the application transitions from the **Work Screen** to the **Summary Screen**, the system must evaluate whether the result qualifies as a **Best Score**.

---

## 2. Best Score Detection Criteria

A result may only be compared against existing records with the **same exercise configuration**.

Records are considered comparable only if **all** of the following parameters match:

- `groupSize`
- `groupsPerLine`
- `totalLines`

Only records that meet all three criteria are eligible for best score evaluation.

---

## 3. Best Score Validation Rules

1. Retrieve all existing records that match the same configuration.
2. If **no other records exist**, the current result **must not** be considered a best score.
3. If **one or more comparable records exist**:
   - Compare the current result against those records using the defined scoring metric.
   - If the current result is the best among them, it qualifies as a **Best Score**.

> A best score can only be detected when at least one comparable historical record exists.

---

## 4. Summary Screen Presentation (Best Score Case)

If the current result qualifies as a **Best Score**:

- Display a **special summary layout**
- Trigger a **confetti animation**
- Highlight the current result as the **Best Score**
- Display a list of **other records** that match the same configuration:
  - Sorted by score (best → worst)
  - Shown below the highlighted best score

If the result does **not** qualify as a best score, display the standard summary screen without confetti or special highlighting.

---

## 5. Leaderboard: Last Result Highlighting

The application must persist the **last completed result** independently of best score detection.

Rules:

- The **last result** must always be highlighted on the **Leaderboard**
- Highlighting applies regardless of navigation path to the leaderboard
- The last result does **not** need to be a best score
- Only one last-result highlight may exist at any time

---

## 6. Application Launch Behavior

- On fresh application launch, the last-result memory may be empty
- If no last result exists:
  - No leaderboard rows should be highlighted
  - No default or fallback highlighting should be applied

---

## 7. Separation of Concerns

- **Best Score detection** occurs only during transition to the Summary Screen
- **Last Result highlighting** is persistent state used only by the Leaderboard UI
- These two mechanisms must operate independently
