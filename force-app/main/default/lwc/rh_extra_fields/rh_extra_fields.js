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
    @api
    action;
    actionAvailable=[];
    @api hasaction;


    @api displayEdit

    mapInputs=new Map();
    get fieldTab(){
        return 'test'
    }
    @track fieldToshow=[];
    connectedCallback(){
        this.initializeMap(this.jsonField);
        this.actionAvailable =[
            {
                variant:"base",
                label:this.l.Edit,
                name:"Edit",
                title:this.l.Edit,
                iconName:"utility:edit",
                class:"slds-m-left_x-small"
            },
        ];

    }
    handleActions(event){
        this.action=event.detail.action;
    }
    get editMode(){
        return this.action==EDIT_ACTION;
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
       
       this.action='';
    }
    get extraFields(){
        let tab=[];
         tab=this.fieldToshow.map(function(elt, index)  {
            let name=elt.keyx;
            const FLABEL=elt.fields.find((item) => item.name=='Label');
            const FVALUE=elt.fields.find((item) => item.name=='Value');
            return {
                label:FLABEL?.value,
                name,
                value:FVALUE?.value
            }
        });
        return tab;
    }
    buldFields(){
        let tab=[];
        this.mapInputs.forEach( (elt, key, map) => {
            // alert(`${key}: ${elt}`); // cucumber: 500 etc
            tab.push( {
                keyx:key,
                fields:[{ label:'Field Label',placeholder:'..label',name:'Label',value: elt.Label,required:true,
                            ly_md:'6', ly_lg:'6', variant:'label-hidden',isText:true
                        },
                        {
                            label:'Field Value', placeholder:'..value',name:'Value',value: elt.Value,
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
                this.showToast(SUCCESS_VARIANT,  'field Removed', 'ok');
                break;
            case 'SAVE_ACTION':
                console.log('key >>',cusEvt?.fieldkey,' \data ',cusEvt?.data);
                this.handleUpdate(cusEvt?.fieldkey,cusEvt?.data);
                this.showToast(SUCCESS_VARIANT,  'field updated', 'ok');
                break;
            default:
                break;
        }
        
    }
    handleAdd(){
        this.handleNew(new Date().getTime());
    }
    handleSave (){
        console.log(`handleSave Xtra field`);
        let error=false;
        let fields=[];
        this.getSavedFields.forEach(function(field){
            if(field?.Label){
                console.log('Field to Save: ',field);
                fields.push(field);
            }else error= true
        });
        if (fields.length>0) {
            // this.callParent('Save',JSON.stringify(this.getSavedFields))
            this.callParent('Save',JSON.stringify(fields))
        }else{
            this.showToast(WARNING_VARIANT,  'Missing Input label', '');
        }
    } 
    handleSaveCancel(){
        this.initializeMap(this.jsonField);
        //this.action='';

    }
    get hasExtraFields(){
        try {
            return this.getSavedFields?.length > 0
        } catch (error) {
            return false
        }

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