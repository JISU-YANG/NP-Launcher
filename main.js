const { app, BrowserWindow } = require('electron');
const path = require('path');
const ipcMain = require('electron').ipcMain;
const { contextIsolated } = require('process');
const Store = require('electron-store');
const computer = require('electron-shutdown-command');
const { dialog } = require('electron');


Store.initRenderer();

const createWindow = () => {
    const displayWidth = require('electron').screen.getPrimaryDisplay().size.width;
    const displayHeight = require('electron').screen.getPrimaryDisplay().size.height;

    const win = new BrowserWindow({
        width: 1150,
        height: 420,
        frame: false,
        transparent: true,
        resizable: false,
        x: (displayWidth - 1150) / 2,
        y: (displayHeight - 420) * 0.8,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    // 개발자도구
    // win.webContents.openDevTools();

    // 외부 브라우저로 연결 1
    // const shell = require('electron').shell;

    // win.webContents.on('will-navigate', (event, url) => {
    //     event.preventDefault()
    //     shell.openExternal(url)
    // });

    // 외부 브라우저로 연결 2 > 강력한 새로고침 먹힘
    var handleRedirect = (e, url) => {
        if (url != win.webContents.getURL()) {
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


    ipcMain.on('explorer-folder', (event) => {
        dialog.showOpenDialog({
            properties: ['openDirectory']
        }).then((data) => {
            event.sender.send('dialog-path', data.filePaths);
        });
    })

    ipcMain.on('explorer-file', (event) => {
        dialog.showOpenDialog({
            properties: ['openFile']
        }).then((data) => {
            event.sender.send('dialog-path', data.filePaths);
        });
    })

    ipcMain.on('run', (event, argument) => {
        console.log(argument);

        if (argument.substr(argument.length - 3, 3) == "exe") {
            const { execFile } = require('node:child_process');
            const child = execFile(argument, (error, stdout, stderr) => {
                if (error) {
                    throw error;
                }
                console.log(stdout);
            });

        } else if (argument == 'shutdown') {
            computer.shutdown();
        } else if (argument == 'reboot') {
            computer.reboot();
        } else {
            const { shell } = require('electron')
            shell.openPath(argument)
        }
    });

    ipcMain.on('save-complete', (event, argument) => {
        const options = {
            type: 'info',
            defaultId: 0,
            title: 'NP-Launcher',
            message: argument
        };

        dialog.showMessageBox(null, options, null);
    });

    ipcMain.on('save-reset', (event, argument) => {
        dialog.showMessageBox(
            null,
            {
                type: 'warning',
                message: argument,
                buttons: ["취소", "리셋"],
                defaultId: 0,
                cancelId: 1
            })
            .then(result => {
                event.sender.send('save-reset-confirm', result.response);
            }
            );
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.disableHardwareAcceleration()



process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';