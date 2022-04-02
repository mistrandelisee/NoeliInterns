import { LightningElement,api,track } from 'lwc';

export default class Rh_extraFields extends LightningElement {
    @track isView=true;
    userInfos;
   
    @track userInfo = [
        {
            hide: false,
            label: "Name",
            name: "Name",
            value: "Teste",
            index: 0
        },
        {  
             label: "LastName",
            name:"LastName",
            value:"Teste",
            index: 1
        }
    ];
    @track us = this.userInfo;

    userEdit = [];


    handleedit(){
        console.log('tt');
        this.isView = false;
    }
    renderedCallback(){

    }
    
    handlesave(event){
        console.log('us1 ' +JSON.stringify(this.us));
        let userInf={};
        let usercopy = {};
        let dataid = event.target.dataset.id;
        let toSave = this.template.querySelectorAll(`[data-input="${dataid}"]`);
        toSave.forEach(elt => {
            switch(elt.dataset.id){
                case "label":
                    userInf.label = elt.value;
                    break;
                case "value":
                    userInf.value = elt.value;
                    break;
                default:
                    break;
            }  
        });
        userInf.index = dataid;
        //this.us.push(userInf);
        if(dataid<this.us.length){
            this.us.map(function(item, index){
                if(index==dataid){
                    item.name = userInf.label;
                    item.value = userInf.value;
                    //delete item.index;
                }

            })
        }else{
            usercopy.name = userInf.label;
            usercopy.value = userInf.value;
            this.us.push(usercopy);

        }
        console.log('us ' +JSON.stringify(this.us));
    }
    handledelte(event){
        let userInf={}
        let dataid = event.target.dataset.id;
        let toSave = this.template.querySelectorAll(`[data-input="${dataid}"]`);
        toSave.forEach(elt => {
            switch(elt.dataset.id){
                case "label":
                    userInf.label = elt.value;
                    break;
                case "value":
                    userInf.value = elt.value;
                    break;
                default:
                    break;
            }  
        });
        //let userfield = this.userInfo.filter(item => item.index === parseInt(dataid));
        this.userInfo.filter(item => item.index === parseInt(dataid))[0].hide=true;

        //this.userInfo[userfield[0].index].hide = true;
        console.log('userInf ' +JSON.stringify(this.userInfo));
        console.log('userInf ' +JSON.stringify(userInf));
         this.userInfos = JSON.stringify(userInf);
    }

    addnewitem(event){
        if(event.target.dataset.id){
            let newItem ={};
            newItem.name='';
            newItem.value='';
            newItem.index= this.us.length; //new Date().getTime();
            this.userInfo.push(newItem);
        }
        
    }
    save(){
        this.us.forEach(elt =>{
            //delete elt.index
        });
        this.isView = true;
        console.log('us for save ' +this.us);
    }

}