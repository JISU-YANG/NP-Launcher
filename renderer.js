const { ipcRenderer } = require('electron')

const btns = document.getElementsByClassName('launcher');

for (let index = 0; index < btns.length; index++) {
    const btn = btns[index];
    btn.addEventListener('click', ()=>{
        ipcRenderer.send('run', btn.getAttribute('data-link'))
    });
}

// ipcRenderer.on('result', (event, argument) => {
//     alert(argument);
// })