const Store = require('electron-store');
const store = new Store();

const btnPreference = document.getElementById('btn-preference');
const btnPreferenceCancle = document.getElementById('btn-preference-cancle');
const btnPreferenceSave = document.getElementById('btn-preference-save');

const pathEditor = document.getElementById('path-editor');

const launchers = document.getElementsByClassName('launcher');
const pathInputs = document.getElementsByClassName('path-input');

let pathKey = 'path.launcher.';
let pathCheck = 0;

btnPreference.addEventListener('click',()=>{
    pathEditor.style.display = 'block';
});

btnPreferenceCancle.addEventListener('click',()=>{
    pathEditor.style.display = 'none';
});

btnPreferenceSave.addEventListener('click',()=>{

    for (let index = 0; index < pathInputs.length; index++) {
        const pathInput = pathInputs[index];
        store.set(pathKey.concat(index), pathInput.value);
    }
    pathEditor.style.display = 'none';

})

for (let index = 0; index < launchers.length; index++) {
    const launcher = launchers[index];
    let msg = store.has(pathKey.concat(index));
    console.log(msg);
    if (msg){
        let path = store.get(pathKey.concat(index));
        console.log(path);
        launcher.setAttribute('data-link', path);  
        pathInputs[index].value = path;
        pathCheck++;
    }
}

if (pathCheck != pathInputs.length) {
    alert(pathCheck+'/'+pathInputs.length+'실행파일의 경로를 설정해주세요.');
}
