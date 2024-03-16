const Store = require('electron-store');
const store = new Store();
const { ipcRenderer } = require('electron');

class ElementPath {
    static openButton = document.getElementById('btn-preference');
    static cancelButton = document.getElementById('btn-preference-cancel');
    static clearButton = document.getElementById('btn-preference-clear');
    static saveButton = document.getElementById('btn-preference-save');


    static editorElement = document.getElementById('editor');
    static editorContext = document.getElementById('setting-row');
    static editorButtons = document.getElementsByClassName('file-item');


    static galleryCategoryButton = document.getElementById('btn-preference-gallery');
    static iconCategoryButton = document.getElementById('btn-preference-icon');
    static folderCategoryButton = document.getElementById('btn-preference-folder');

    static getTitleItemElement(category, index) {
        return document.getElementsByName(category + '-name-item-' + index)[0]?.value || '';
    }
    static getLinkItemElement(category, index) {
        return document.getElementsByName(category + '-link-item-' + index)[0]?.value || '';
    }
    static getImageItemElement(category, index) {
        return document.getElementsByName(category + '-img-item-' + index)[0]?.value || '';
    }

}

class NPLauncher {

    #pathKey = 'NPL.Data';

    #receivePathElement;

    #data = new Map();

    static Category = {
        GALLERY: 'gallery',
        ICON: 'icon',
        FOLDER: 'folder'
    }

    static MaxCount = {
        gallery: 6,
        icon: 8,
        folder: 5
    }

    static activeCategory = NPLauncher.Category.GALLERY;

    constructor() {
        this.#init();
        this.#load(NPLauncher.Category.GALLERY);
        this.#event();
        this.#eventCategory();
        this.#view();
        this.#receivePathEvent();
        this.#receiveResetEvent();

    }

    #init() {
        const categoryList = Object.values(NPLauncher.Category);
        const pathKey = this.#pathKey;

        this.#data = setCategoryData();

        function setCategoryData() {
            const data = new Map();
            categoryList.forEach(category => {
                const loadedData = store.get(pathKey + category);

                data.set(category, typeof loadedData === "undefined" ? [] : loadedData);
            });
            return data;
        }

    }


    #event() {
        const pathKey = this.#pathKey;

        setButtonEvent();

        function setButtonEvent() {
            ElementPath.openButton.addEventListener('click', () => {
                ElementPath.editorElement.style.display = 'inline-flex';
            });

            ElementPath.cancelButton.addEventListener('click', () => {
                window.location.reload(true);
            });

            ElementPath.clearButton.addEventListener('click', () => {

                ipcRenderer.send('save-reset', '정말 모든 카테고리의 항목 정보를 리셋하시겠습니까?');
            });
            ElementPath.saveButton.addEventListener('click', () => {
                let itemList = [];

                for (let i = 0; i < NPLauncher.MaxCount[NPLauncher.activeCategory]; i++) {

                    let item = {
                        name: ElementPath.getTitleItemElement(NPLauncher.activeCategory, i),
                        link: ElementPath.getLinkItemElement(NPLauncher.activeCategory, i),
                        img: NPLauncher.activeCategory !== NPLauncher.Category.FOLDER ? ElementPath.getImageItemElement(NPLauncher.activeCategory, i) : ''
                    };

                    if (item.link != '') itemList.push(item);

                }

                store.set(pathKey + NPLauncher.activeCategory, itemList);

                ipcRenderer.send('save-complete', NPLauncher.activeCategory + ' 카테고리의 항목 정보가 저장되었습니다.');
            });

        }
    }

    #setPathEvent() {
        for (const inputFile of ElementPath.editorButtons) {
            inputFile.addEventListener('click', () => {
                
                if(NPLauncher.activeCategory !== NPLauncher.Category.FOLDER){
                    ipcRenderer.send('explorer-file');
                }else{
                    ipcRenderer.send('explorer-folder');
                }
                this.#receivePathElement = document.getElementsByName(inputFile.name.replace('file', 'link'))[0];
            });
        }

        

    }
    #receiveResetEvent() {
        ipcRenderer.on('save-reset-confirm', (_event, arg) => {
            if (arg) {
                store.clear();
                window.location.reload(true);
            }

        });

    }
    #receivePathEvent() {
        ipcRenderer.on('dialog-path', (_event, arg) => {
            if (this.#receivePathElement) {
                this.#receivePathElement.value = arg[0];
            }
        });
    }

    #eventCategory() {
        [ElementPath.galleryCategoryButton, ElementPath.iconCategoryButton, ElementPath.folderCategoryButton].forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                this.#eventChangeCategory(button, NPLauncher.Category[category]);
            });
        });
    }

    #eventChangeCategory(button, category) {
        removeCategory();
        button.classList.add('select-category');
        this.#load(category);
        NPLauncher.activeCategory = category;

        function removeCategory() {
            [ElementPath.galleryCategoryButton, ElementPath.iconCategoryButton, ElementPath.folderCategoryButton].forEach(button => {
                button.classList.remove('select-category');
            });
        }
    }

    #load(category) {
        let htmlData = '';

        htmlData += '<div class="setting-col">';

        const listItem = this.#data.get(category);

        for (let index = 0; index < NPLauncher.MaxCount[category]; index++) {
            const item = listItem[index];

            htmlData +=
                `<div class="${category}-item">
                        <div>${index + 1}: </div>
                    <div>
                        <input type="text" name="${category}-name-item-${index}" value="${item && item.name ? item.name : ''}" placeholder="이름">
                    </div>
                    <div>
                        <input type="text" name="${category}-link-item-${index}" value="${item && item.link ? item.link : ''}" placeholder="경로 또는 url">
                    </div>`;
            htmlData += `<button class="file-item" name="${category}-file-item-${index}">파일 선택</button>`;
            if (category != 'folder') {
                htmlData += `
                    <div>
                        <input type="text" name="${category}-img-item-${index}" value="${item && item.img ? item.img : ''}" placeholder="이미지 url">
                    </div>`;
            }
            htmlData += `</div>`;

        }

        htmlData += '</div>';
        ElementPath.editorContext.innerHTML = htmlData;

        this.#setPathEvent();
    }

    #view() {
        this.#data.forEach((listItems, category) => {
            if (listItems.length === 0) return;

            const listArea = document.getElementById(`${category}-area`);
            let htmlElement = '';

            listItems.forEach(item => {
                if (!item || typeof item.link != 'string') {
                    console.log('Undefined or invalid item:', item);
                    return;
                }

                htmlElement += createHtmlElement(item, category);
            });

            listArea.innerHTML = htmlElement;
        });

        function createHtmlElement(item, category) {
            const isHttpLink = item.link.startsWith('http');
            const isFolderCategory = category == NPLauncher.Category.FOLDER;

            if (isFolderCategory) {
                return `<div class="launcher-basic list-item" data-link="${item.link}">${item.name}</div>`;
            }

            if (isHttpLink) {
                return `<div><a href="${item.link}"><img class="${category}-img" src="${item.img}" alt="${item.name}"><span class="${category}-name">${item.name}</span></a></div>`;
            }

            return `<div class="launcher" data-link="${item.link}"><img class="${category}-img" src="${item.img}" alt="${item.name}"><span class="${category}-name">${item.name}</span></div>`;
        }
    }

}




let npl = new NPLauncher();