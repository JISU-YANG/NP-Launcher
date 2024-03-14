const { ipcRenderer } = require('electron');

const launcherBtn = document.getElementsByClassName('launcher');
const launcherBasicBtn = document.getElementsByClassName('launcher-basic');

for (let index = 0; index < launcherBtn.length; index++) {
    const btn = launcherBtn[index];
    btn.addEventListener('click', ()=>{
        ipcRenderer.send('run', btn.getAttribute('data-link'))
    });
}

for (let index = 0; index < launcherBasicBtn.length; index++) {
    const btn = launcherBasicBtn[index];
    btn.addEventListener('click', ()=>{
        ipcRenderer.send('run', btn.getAttribute('data-link'))
    });
}
