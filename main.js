const { app, BrowserWindow } = require('electron');
const path = require('path');
 
const createWindow = () => {
    const win = new BrowserWindow({
        width: 1150,
        height: 1050,
        frame: false,
        transparent: true,
        resizable: false,
        center: true,
        webPreferences: { preload: path.join(__dirname, 'preload.js') }
    });
    
    win.removeMenu()
    win.loadFile('index.html');
};
 
app.whenReady().then(() => {
    createWindow();
 
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
 
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});