const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveAudio: (buffer) => ipcRenderer.invoke('save-audio', buffer)
});

window.addEventListener('DOMContentLoaded', () => {
    // Optional: Add version info or other preload logic
});
