import { api, LightningElement } from 'lwc';
import { labels } from 'c/rh_label';
import {icons} from 'c/rh_icons';
const RESET_ACTION='Reset';
const FROMRESETPWD='ResetPWD';

export default class Rh_profile_reset_password extends LightningElement {
    l={...labels}
    icon={...icons}
    @api
    title;
    @api
    iconsrc;
    
    @api
    fieldInputs;
    @api
    action;
    actionAvailable=[];
    handleAction(event){
        this.action=event.detail.action;
    }
    get helpText(){ return this.l?.changePassHlp || 'No info'}
    get editMode(){
        return this.action==RESET_ACTION;
    }
    initDefault(){
        this.fieldInputs= [
            {
                label:this.l.CurrentPassword,
                placeholder:this.l.CurrentPasswordPlc,
                name:'oldpassword',
                value: '',
                type: 'password',
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:this.l.NewPassword,
                placeholder:this.l.NewPasswordPlc,
                name:'newPassword',
                value: '',
                type: 'password',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.RepeatPassword,
                placeholder:this.l.RepeatPasswordPlc,
                name:'verifyNewPassword',
                required:true,
                value: '',
                maxlength:100,
                type:'password',
                ly_md:'6', 
                ly_lg:'6'
            },
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
            console.log(`record `, record);
            this.callParent(RESET_ACTION,record)
        }else{
            // console.log(`Is not valid `);
        }
    }
    save(){
        let form=this.template.querySelector('c-rh_dynamic_form');
        console.log(form);
        let isvalid=true;  
        let obj={};
        let saveResult=form.save();
        isvalid=isvalid && saveResult.isvalid;
        obj=saveResult.obj;
        // console.log(`>>>>>>>>>>>>obj `, obj );
        return  {isvalid,obj};
    }

    callParent(actionName,data){
        var actionEvt =new CustomEvent('action',
         {detail: { action : actionName,from:FROMRESETPWD, data }}
      );
    //   console.log("Watch: actionName ->"+actionName); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }
}