const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // We can add safe IPC methods here if we need them later
    // For this basic local app, we might just rely on renderer-side logic for now
    // or add file system access methods here if we want persistence.
});

window.addEventListener('DOMContentLoaded', () => {
    // Optional: Add version info or other preload logic
});
