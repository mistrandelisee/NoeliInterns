import { api, LightningElement, track } from 'lwc';
import { labels } from 'c/rh_label';
//Constants
const EDIT_ACTION='Edit';
const VIEW_ACTION='View';
const SAVE_ACTION='Save';


const RESET_ACTION='Reset';

const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';
export default class Rh_extra_fields extends LightningElement {
    l={...labels}
    @api
    jsonField;
    mapInputs=new Map();
    get fieldTab(){
        return 'test'
    }
    @track fieldToshow=[];
    connectedCallback(){
        this.initializeMap(this.jsonField);

    }
    handleUpdate(key,data){
        console.log(`key`, key);
        console.log(`data`, JSON.stringify(data));
        data={name:this.buildName(data.Label),...data}
        this.mapInputs.set(key, data)

        // this.showToast(SUCCESS_VARIANT,  'field updated', 'ok');
    }
    handleDelete(key){
        this.mapInputs.delete(key)
        this.fieldToshow= this.buldFields();
    }
    handleNew(key){
        this.mapInputs.set(key,{Label:'',Value:''})
        this.fieldToshow= this.buldFields();
    }
    get getSavedFields(){
        return  Array.from(this.mapInputs.values());
    }
    @api
    initializeMap(jsonInput) {
        console.log(`jsonInput ????????? `, jsonInput);
        this.jsonField=jsonInput;
        if (! jsonInput) {
            jsonInput='[]'
        }
        const arrayFieldInput=JSON.parse(jsonInput);
        this.mapInputs=new Map();
        let self=this;
        arrayFieldInput.forEach(function(elt){
            const key=self.buildName(elt.Label)
            self.handleUpdate(key,elt);
        });
       this.fieldToshow= this.buldFields();
    }
    buldFields(){
        let tab=[];
        this.mapInputs.forEach( (elt, key, map) => {
            // alert(`${key}: ${elt}`); // cucumber: 500 etc
            tab.push( {
                keyx:key,
                fields:[{ label:'',placeholder:'..label',name:'Label',value: elt.Label,required:true,
                            ly_md:'6', ly_lg:'6', variant:'label-hidden',isText:true
                        },
                        {
                            label:'', placeholder:'..value',name:'Value',value: elt.Value,
                            required:true,ly_md:'6',  ly_lg:'6', variant:'label-hidden',isText:true
                        }
                
                ]
                 })
          });
          console.log(`tab >> `, tab);
        return tab;
            

    }
    startSpinner(b){
        let spinner=this.template.querySelector('c-rh_spinner');
        if (b) {    spinner?.start(); }
            else{   spinner?.stop();}
    }
    showToast(variant, title, message){
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);
    }

    handleAction(event){
        const cusEvt=event.detail;
        console.log('cusEvt >>',cusEvt,' \action ',cusEvt?.action);
        switch (cusEvt?.action) {
            case 'DELETE_ACTION':
                console.log('key >>',cusEvt?.fieldkey,' \data ',cusEvt?.data);
                this.handleDelete(cusEvt?.fieldkey);
                break;
            case 'SAVE_ACTION':
                console.log('key >>',cusEvt?.fieldkey,' \data ',cusEvt?.data);
                this.handleUpdate(cusEvt?.fieldkey,cusEvt?.data);
                break;
            default:
                break;
        }
        
    }
    handleAdd(){
        this.handleNew(new Date().getTime());
    }
    handleSave (){
        console.log(`Save`, this.getSavedFields);
        this.callParent('Save',JSON.stringify(this.getSavedFields))
    } 
    buildName(str){
        if (!str) {
            str= new Date().getTime()+'';
        }
        return str.replace(/ /g, "");
    }
    callParent(actionName,data){
        var actionEvt =new CustomEvent('action',
         {detail: { action : actionName,data }}
      );
      console.log("Watch: actionName ->"+actionName); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }


}