# Electron Calendar & Task Tracker

A simple, educational Electron application that features a monthly calendar and a daily task tracker. This project is designed to demonstrate the basic structure and capabilities of an Electron app.

## Features

*   **Interactive Calendar**: View the current month, navigate between months, and highlight the current day.
*   **Task Tracker**: Add, toggle completion status, and delete tasks.
*   **Persistence**: Tasks are saved locally using `localStorage`, so they remain available after restarting the application.
*   **Clean UI**: a modern, responsive interface built with CSS Flexbox and Grid.

## Project Structure

The project follows a standard Electron architecture:

*   **`main.js`**: The **Main Process**. It handles the application lifecycle, creates the browser window, and manages system events.
*   **`preload.js`**: The **Preload Script**. It runs before the renderer process and is used to expose safe APIs to the frontend, maintaining security context isolation.
*   **`index.html`**: The entry point for the **Renderer Process**. It defines the HTML structure of the user interface.
*   **`renderer.js`**: Contains the frontend logic (JavaScript) for rendering the calendar grid, handling user interactions, and managing task data.
*   **`styles.css`**: Contains all the CSS styling for the application.

## Prerequisites

*   Node.js (v14 or higher recommended)
*   npm (usually comes with Node.js)

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/bochamaakram/Electron-app.git
    cd Electron-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

To start the application in development mode:

```bash
npm start
```

*Note: The start script includes the `--no-sandbox` flag to ensure compatibility with certain Linux environments.*

## Technologies Used

*   **Electron**: Framework for building cross-platform desktop apps with web technologies.
*   **HTML5/CSS3**: For structure and styling.
*   **JavaScript (ES6+)**: For application logic.
