const { app, BrowserWindow } = require('electron');
const path = require('path');
const ipcMain = require('electron').ipcMain;
const { contextIsolated } = require('process');
const Store = require('electron-store');
const computer = require('electron-shutdown-command');

Store.initRenderer();

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
        webPreferences: { 
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    // win.webContents.openDevTools();

    // 외부 브라우저로 연결 1
    // const shell = require('electron').shell;

    // win.webContents.on('will-navigate', (event, url) => {
    //     event.preventDefault()
    //     shell.openExternal(url)
    // });

    // 외부 브라우저로 연결 2 > 강력한 새로고침 먹힘
    var handleRedirect = (e, url) => {
        if(url != win.webContents.getURL()) {
        e.preventDefault()
        require('electron').shell.openExternal(url)
        }
    }

    win.webContents.on('will-navigate', handleRedirect);
    win.webContents.on('new-window', handleRedirect);
    
    win.removeMenu();

    win.loadFile('index.html');
};
 
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    ipcMain.on('run',(event, argument) =>{
        console.log(argument);

        // execFile는 default로 shall을 생성하지 않아 더 효율적이다.
        if(argument.substr(argument.length-3,3) == "exe"){
            const { execFile } = require('node:child_process');
            const child = execFile(argument, (error, stdout, stderr) => {
            if (error) {
                throw error;
            }
            console.log(stdout);
            });
 
        }else if(argument == 'shutdown'){
            computer.shutdown();
        }else if(argument == 'reboot'){
            computer.reboot();
        } else{
            const {shell} = require('electron') 
            shell.openPath(argument)
        }
       

        // event.sender.send('result',argument);

        // var ws = require('windows-shortcuts');
        // ws.query(argument, console.log);
    });
});
 
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.disableHardwareAcceleration()

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';