const { ipcRenderer } = require('electron')

const btns = document.getElementsByClassName('launcher');

for (let index = 0; index < btns.length; index++) {
    const element = btns[index];
    element.addEventListener('click', ()=>{
        ipcRenderer.send('run', element.getAttribute('data-link'))
    });
}

// ipcRenderer.on('result', (event, argument) => {
//     alert(argument);
// })