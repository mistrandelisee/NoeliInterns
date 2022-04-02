import { api, LightningElement } from 'lwc';
const EDIT_ACTION='ResetPWD';
export default class Rh_profile_reset_password extends LightningElement {
    label={
        resetPassword:"Reset Password"
    }
    @api
    mode;
    @api
    recordId;
    
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
        return this.action==EDIT_ACTION;
    }
    initDefault(){
        this.fieldInputs= [
            {
                label:'Current Password',
                placeholder:'Enter your Last Name',
                name:'oldpassword',
                value: '',
                type: 'password',
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'New PassWord',
                placeholder:'Enter your First Name',
                name:'newPassword',
                value: '',
                type: 'password',
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Repeat Password',
                name:'verifyNewPassword',
                required:true,
                value: '',
                maxlength:100,
                type:'password',
                ly_md:'12', 
                ly_lg:'12'
            },
        ];
    }
    connectedCallback(){
        this.initDefault();
     }
     handleClick(){
        this.action=EDIT_ACTION;
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

            this.callParent('Save',record)
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
         {detail: { action : actionName,data }}
      );
      console.log("Watch: actionName ->"+actionName); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }
}