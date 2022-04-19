import { LightningElement } from 'lwc';
import { labels } from 'c/rh_label';
//Constants
const EDIT_ACTION='Edit';
const NEW_ACTION='New';
const VIEW_ACTION='View';
const SAVE_ACTION='Save';


const RESET_ACTION='Reset';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';
export default class Rh_user_creation extends LightningElement {
    l={...labels}
    action;
    groups=[];
    roles=[];
    formInputs=[];
    record;
    buildForm(){
        this.formInputs=[
            {
                label:'Last Name',
                placeholder:'Enter your Last Name',
                name:'LastName',
                value: '',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'First Name',
                placeholder:'Enter your First Name',
                name:'FirstName',
                value: '',
                required:false,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Email',
                name:'Email',
                required:true,
                value: '',
                placeholder:'Email',
                maxlength:100,
                type:'email',
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Role',
                name:'Role',
                required:true,
                picklist: true,
                options: this.roles,
                value: 'Base User',
                maxlength:100,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Group',
                name:'Group',
                picklist: true,
                options: this.groups,
                value: '',
                maxlength:100,
                ly_md:'6', 
                ly_lg:'6'
            }
         
        
        ]
    }
    connectedCallback(){
        this.buildForm();
    }


    get newMode(){
        return this.action==NEW_ACTION;
    }
    handleNew(){
        this.action=NEW_ACTION;

        this.callParent(this.action,{});
    }
    handleCancel(){
        this.action='';
        this.callParent(this.action,{});
    }
    handleSave(evt){
        let record={};
        let result= this.save();
        if (result.isvalid) {
            record={...record,...result.obj};
            // this.emp[TYPE_FIELD_NAME]=this.empType;

            this.callParent(SAVE_ACTION,record)
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