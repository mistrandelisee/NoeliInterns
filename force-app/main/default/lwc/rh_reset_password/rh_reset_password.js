import { api, LightningElement } from 'lwc';
import { labels } from 'c/rh_label';
const RESET_ACTION='Reset';
const FROMRESETPWD='ResetPWD';

export default class Rh_reset_password extends LightningElement {
    l={...labels}
    @api
    title;
    @api
    iconsrc;
    
    record;
    @api
    fieldInputs;
    @api
    action;
    actionAvailable=[];

    handleAction(event){
        this.action=event.detail.action;
    }
    get editMode(){
        return this.action==RESET_ACTION;
    }
    initDefault(){
        this.fieldInputs= [
            {
                label:this.l.NewPassword,
                placeholder:this.l.NewPasswordPlc,
                name:'newPassword',
                value: '',
                required:true,
                ly_md:'12', 
                ly_xs:'12',
                ly_lg:'12'
            }
        ];
    }
    connectedCallback(){
        this.initDefault();
     }
     @api
     cancel(){
        this.action='';
     }
     handleClick(){
        this.action=RESET_ACTION;
    }

    handleCancel(){
        this.action='';
    }
    handleSave(evt){
        let record={};
        let result= this.save();
        if (result.isvalid) {
            record={...record,...result.obj};
            // this.emp[TYPE_FIELD_NAME]=this.empType;

            this.callParent(RESET_ACTION,record)
        }else{
            console.log(`Is not valid `);
        }
        console.log(`record `, record);
    }
    save(){
        let form=this.template.querySelector('c-rh_dynamic_form');
        console.log(form);
        let isvalid=true;  
        let obj={};
        
        let saveResult=form.save();
        console.log(`>>>>>>>>>>>>saveResult `, saveResult );
        let outputs = saveResult.outputs;
        isvalid=isvalid && saveResult.isvalid;
        console.log(`>>>>>>>>>>>>outputs `, outputs );
        obj=saveResult.obj;
        console.log(`>>>>>>>>>>>>obj `, obj );
        return  {isvalid,obj};
    }

    callParent(actionName,data){
        var actionEvt =new CustomEvent('action',
         {detail: { action : actionName,from:FROMRESETPWD, data }}
      );
      console.log("Watch: actionName ->"+actionName); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }
}