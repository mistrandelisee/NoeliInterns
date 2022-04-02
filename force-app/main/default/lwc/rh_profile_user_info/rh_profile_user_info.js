import { api, LightningElement } from 'lwc';
const EDIT_ACTION='Edit';
export default class Rh_profile_user_info extends LightningElement {
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
        this.fieldInputs=this.fieldInputs || [
            {
                label:'Last Name',
                placeholder:'Enter your Last Name',
                name:'LastName',
                value: 'Miatrsn',
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
                label:'Phone',
                placeholder:'Enter your First Name',
                name:'FirstName',
                value: '',
                required:false,
                ly_md:'6', 
                ly_lg:'6'
            }
        ];
    }
    connectedCallback(){
        //this.initDefault();
        this.actionAvailable =[
            {
                variant:"base",
                label:"Edit",
                name:"Edit",
                title:"Looks like a link",
                iconName:"utility:edit",
                class:"slds-m-left_x-small"
            },
        ];
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