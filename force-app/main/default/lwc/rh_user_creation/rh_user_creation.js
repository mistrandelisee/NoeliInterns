import { LightningElement,wire,api } from 'lwc';
import { labels } from 'c/rh_label';
import initConfig from '@salesforce/apex/RH_Users_controller.InitUserCreation';
import userCreation from '@salesforce/apex/RH_Users_controller.userCreation';
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
    @api groups;
    roles=[];
    formInputs=[];
    record;
    listgroup=[];
    userfield ={};
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
            },
            {
                label:'Activate ?',
                name:'Activated',
                checked:true,
                type:'toggle',
                ly_md:'6', 
                ly_lg:'6'
            }
         
        
        ]
    }
    
    connectedCallback(){
        console.log('teste');
        // this.buildForm();
        //this.getActiveWorkgroupse();
    }
    callApexSave(input){
        userCreation({ contactJson: JSON.stringify(input) })
          .then(result => {
            console.log('Result callApexSave:: ');
            console.log(result);
            this.action='';
            this.callParent(SAVE_ACTION,{result})
          })
          .catch(error => {
            console.error('Error:', error);
        });
    }

    // getActiveWorkgroupse(){
    //     getActiveWorkgroups({

    //     }).then(result =>{
    //         console.log('result group ' +JSON.stringify(result));
    //         result.forEach(elt => {
    //             this.groups.push(elt.Name);
    //         });
    //         console.log('groupes ' +this.groups);
    //     }).catch(e =>{
    //         console.error(e);
    //     });
    // }

    handlechange(event){
        console.log('event ' +JSON.stringify(event));
        let fieldname = event.detail.name;
        // const sendEvent = new CustomEvent('inputchanged', {detail: event});
        // this.dispatchEvent(sendEvent);
        switch(fieldname) {
            case 'LastName':
                
                break;
            case 'FirstName':

                break;
            case 'Email':

                break;
            case 'Role':

                break;
            case 'Group':

                break;
        
            default:
                break;
        }
    }


    get newMode(){
        return this.action==NEW_ACTION;
    }
    handleNew(){
       
        initConfig()
          .then(result => {
            console.log('Result INIT CONF');
            console.log(result);
            if (!result.error && result.Ok) {
                this.groups = result.Groups?.map(function(g) { return {label:g.Name,value:g.Id}});
                this.roles = result.Picklists?.RH_Role__c;
                this.buildForm();
                this.action=NEW_ACTION;
                this.callParent(this.action,{});
            }else{
                this.showToast(WARNING_VARIANT,'ERROR', result.msg);
            }
          })
          .catch(error => {
            console.error('Error:', error);
        });
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
            this.callApexSave(record);
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
    //handle spinner
    startSpinner(b){
        let spinner=this.template.querySelector('c-rh_spinner');
        if (b) {    spinner?.start(); }
            else{   spinner?.stop();}
    }

    //handle toast
    showToast(variant, title, message){
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);
    }
}