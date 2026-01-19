# Electron Calendar & Task Tracker

A simple, educational Electron application featuring a monthly calendar and a multi-type tracker (Tasks, Notes, Voice Memos). Built with the **Tokyo Night** theme.

## Features

*   **Interactive Calendar**: Navigate months, select days. Past days are visually muted.
*   **Multi-Type Tracker**:
    *   **Tasks**: Add tasks to today or future dates. Mark as complete.
    *   **Notes**: Add text notes (today only).
    *   **Voice Memos**: Record audio notes using your microphone (today only).
*   **Date Filtering**: Click a calendar day to see only items for that date.
*   **CRUD Operations**: Edit (✎) and Delete (×) any item.
*   **Persistence**: Data saved to `localStorage`. Voice files saved to system.
*   **Tokyo Night Theme**: A beautiful dark theme with pink accents.

## Project Structure

*   **`main.js`**: Main Process. Creates the window and handles IPC for saving audio files.
*   **`preload.js`**: Preload Script. Exposes safe APIs to the renderer via `contextBridge`.
*   **`index.html`**: Renderer entry point. UI structure.
*   **`renderer.js`**: Frontend logic (Calendar, Items, Audio Recording).
*   **`styles.css`**: Tokyo Night themed styling.

## Prerequisites

*   Node.js (v14+)
*   npm

## Installation

```bash
git clone https://github.com/bochamaakram/Electron-app.git
cd Electron-app
npm install
```

## Usage

```bash
npm start
```

*Note: The `--no-sandbox` flag is included for Linux compatibility.*

## Technologies

*   Electron
*   HTML5 / CSS3
*   JavaScript (ES6+)
