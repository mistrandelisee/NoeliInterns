import { LightningElement,api,track } from 'lwc';

export default class Rh_extraFields extends LightningElement {
    @track isView=true;
    userInfos;
    @api displayEdit

    // @api userInfo =[]; 
    @track userInfo; 
    
   
    // @track userInfo = [
    //     // {
    //     //     hide: false,
    //     //     label: "Name",
    //     //     name: "Name",
    //     //     value: "Teste",
    //     //     index: 0
    //     // },
    //     // {  
    //     //      label: "LastName",
    //     //     name:"LastName",
    //     //     value:"Teste",
    //     //     index: 1
    //     // }
    // ];
    @track us;

    userEdit = [];
    connectedCallback(){
       
    }
@api setInfo(value){
    this.userInfo = JSON.parse(JSON.stringify(value));
    this.us = this.userInfo? this.userInfo:[];
}
    handleedit(){
        console.log('tt');
        this.isView = false;
    }
    // get getuserInfo(){
    //     return this.userInfo?.length>0;
    // }
    renderedCallback(){
console.log('us ' +JSON.stringify(this.us));
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
                   //userInf.label = elt.value;
                    userInf.name = elt.value;
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
                    item.name = userInf.name;
                    item.value = userInf.value;
                }

            })
        }else{
            //usercopy.label = userInf.name;
            usercopy.name = userInf.name;
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
                    //userInf.label = elt.value;
                    userInf.name = elt.value;
                    break;
                case "value":
                    userInf.value = elt.value;
                    break;
                default:
                    break;
            }  
        });
        

        let i;
        this.userInfo.filter(item => item.index === parseInt(dataid))[0].hide=true;
        this.us = JSON.parse(JSON.stringify(this.userInfo.filter((elt) => elt.index != dataid)));
        
        console.log('userInfo ' +JSON.stringify(this.userInfo));
        console.log('userInf ' +JSON.stringify(userInf));
         this.userInfos = JSON.stringify(userInf);
    }

    addnewitem(event){
        if(event.target.dataset.id){
            
            let newItem ={};
            newItem.name='';
            newItem.hide=false;
            newItem.value='';
            newItem.index= this.userInfo?.length|| 0; //new Date().getTime();
            if (this.userInfo?.length >0) {
                this.userInfo.push(newItem);
            }else{
                this.userInfo=[];
                this.us=[];
                this.userInfo.push(newItem);
            }
        }
        
    }
    save(){
        this.us.forEach(elt =>{
            elt.label = elt.name;
            //delete elt.index
        });
        this.isView = true;
        console.log('us for save ' +this.us);
        this.handleextrafield(this.us);
    }

    handleextrafield(extrafield){
        let extra = new CustomEvent('extrafield',
        {
            detail: extrafield
        });
        this.dispatchEvent(extra);
    }

}