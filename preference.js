const Store = require('electron-store');
const store = new Store();

class NPLauncher{
    #listTitle = ['갤러리', '아이콘', '폴더'];
    #listType = ['gallery', 'icon', 'folder'];
    #listItemMax = [6,8,5];

    #pathKey = 'NPL.Data';

    #defaultData= [];
    #localData = [];

    constructor(){
        this.#init();
        this.#event();
        this.#load();
        this.#view();
    }

    #init(){
        this.#defaultData = [];
        for (let i = 0; i < this.#listItemMax.length; i++) {
            let listData = [];
                for (let j = 0; j < this.#listItemMax[i]; j++) {
                    listData.push(['type','','','']);

                }   
            this.#defaultData.push(listData);
        }
    }

    #event(){
        const open = document.getElementById('btn-preference');
        const cancle = document.getElementById('btn-preference-cancle');
        const save = document.getElementById('btn-preference-save');

        const editorElement = document.getElementById('editor');

        open.addEventListener('click',()=>{
            this.#load();
            editorElement.style.display = 'inline-flex';
        });

        cancle.addEventListener('click',()=>{
            editorElement.style.display = 'none';
        });

        save.addEventListener('click',()=>{
            this.#save();
            window.location.reload(true)
        })

    }

    #load(){
        this.#localData = store.get(this.#pathKey);
        this.#localData = (this.#localData == undefined ? this.#defaultData : this.#localData);

        let htmlData = '';
        let contextElement = 'setting-row';
        for (let i = 0; i < this.#listItemMax.length; i++) {
            htmlData += 
                '<div class="setting-col">' +
                    '<div>' + this.#listTitle[i] + '</div>';

            for (let j = 0; j < this.#listItemMax[i]; j++) {
                htmlData += 
                '<div class="' + this.#listType[i] + '-item">'+
                    '<div>'+(j+1)+': </div>';
                    if(i!=this.#listItemMax.length-1){
                        htmlData += 
                            '<div>'+
                                '<select name="' + this.#listType[i] + '-type-item-'+j+'" id="' + this.#listType[i] + '-type-item-'+j+'">'+
                                    '<option value="type" '+ (this.#localData[i][j][0] == 'type' ? 'selected="selected"' : '') + '>종류</option>'+
                                    '<option value="url" '+ (this.#localData[i][j][0] == 'url' ? 'selected="selected"' : '') + '>url</option>'+
                                    '<option value="exe" '+ (this.#localData[i][j][0] == 'exe' ? 'selected="selected"' : '') + '>exe</option>'+
                                '</select>'+
                            '</div>';
                    }
                    htmlData += 
                    '<div>'+
                        '<input type="text" name="' + this.#listType[i] + '-name-item-'+j+'" value="'+this.#localData[i][j][1]+'" placeholder="이름">'+
                    '</div>'+
                    '<div>'+
                        '<input type="text" name="' + this.#listType[i] + '-link-item-'+j+'" value="'+this.#localData[i][j][2]+'" placeholder="경로">'+
                    '</div>';
                    if(i!=this.#listItemMax.length-1){
                        htmlData += 
                            '<div>'+
                                '<input type="text" name="' + this.#listType[i] + '-img-item-'+j+'" value="'+this.#localData[i][j][3]+'" placeholder="이미지">'+
                            '</div>';
                    }
                    htmlData += '</div>';
            }
            htmlData += '</div>';
        }
        
        document.getElementById(contextElement).innerHTML = htmlData;

        console.log('Setting View를 load합니다.');
    }

    #save(){
        this.#localData = [];

        for (let i = 0; i < this.#listItemMax.length; i++) {
            let listData = [];
            for (let j = 0; j < this.#listItemMax[i]; j++) {
                if(i!=this.#listItemMax.length-1){
                    listData.push([
                        document.getElementById(this.#listType[i] + '-type-item-'+j).value, 
                        document.getElementsByName(this.#listType[i] + '-name-item-'+j)[0].value, 
                        document.getElementsByName(this.#listType[i] + '-link-item-'+j)[0].value, 
                        document.getElementsByName(this.#listType[i] + '-img-item-'+j)[0].value
                    ]);
                }else{
                    listData.push([
                        '', 
                        document.getElementsByName(this.#listType[i] + '-name-item-'+j)[0].value, 
                        document.getElementsByName(this.#listType[i] + '-link-item-'+j)[0].value, 
                        ''
                    ]);
                }

            }    
            
            this.#localData.push(listData);
        }
        store.set(this.#pathKey,this.#localData);
        console.log('Setting View를 save합니다.');
    }

    #view(){
 

        for (let i = 0; i < this.#listItemMax.length; i++) {
            let listArea = document.getElementById(this.#listType[i]+'-area');
            let htmlElement = '';

            for (let j = 0; j < this.#listItemMax[i]; j++) {
                if(this.#localData[i][j][0] == 'type'){
                }else if(this.#localData[i][j][0] == 'url'){
                    htmlElement += 
                                    '<div>'+
                                        '<a href="'+this.#localData[i][j][2]+'">'+
                                            '<img class="'+this.#listType[i]+'-img" src="'+this.#localData[i][j][3]+'" alt="'+this.#localData[i][j][1]+'">'+
                                            '<span class="'+this.#listType[i]+'-name">'+this.#localData[i][j][1]+'</span>'+
                                        '</a>'+
                                    '</div>';
                }else if(this.#localData[i][j][0] == 'exe'){
                    htmlElement += 
                                    '<div class="launcher" data-link="'+this.#localData[i][j][2]+'">'+
                                        '<img class="'+this.#listType[i]+'-img" src="'+this.#localData[i][j][3]+'" alt="'+this.#localData[i][j][1]+'">'+
                                        '<span class="'+this.#listType[i]+'-name">'+this.#localData[i][j][1]+'</span>'+
                                    '</div>';
                }else if(i == 2 && this.#localData[i][j][1] != ''){
                    htmlElement += '<div class="launcher-basic list-item" data-link="'+this.#localData[i][j][2]+'">'+this.#localData[i][j][1]+'</div>'

                }else if(i == 2 && this.#localData[i][j][1] != ''){

                }
            }
            listArea.innerHTML = htmlElement;
        }

    }


}

let npl = new NPLauncher();
