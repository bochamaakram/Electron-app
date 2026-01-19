const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile('index.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    ipcMain.handle('save-audio', async (event, arrayBuffer) => {
        const fs = require('fs');
        const path = require('path');
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `voice-note-${Date.now()}.webm`;
        const filePath = path.join(app.getPath('userData'), fileName);

        await fs.promises.writeFile(filePath, buffer);
        console.log('Saved audio to:', filePath);
        return filePath;
    });

    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
