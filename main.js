const { app, BrowserWindow } = require('electron');
const path = require('path');
 
const createWindow = () => {
    const displayWidth = require('electron').screen.getPrimaryDisplay().size.width;

    const win = new BrowserWindow({
        width: 1150,
        height: 420,
        frame: false,
        transparent: true,
        resizable: false,
        x: (displayWidth - 1150) / 2,
        y: 620,
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