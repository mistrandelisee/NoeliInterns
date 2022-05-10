import { LightningElement,wire,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { labels } from 'c/rh_label';
import initConfig from '@salesforce/apex/RH_Users_controller.InitUserCreation';
import userCreation from '@salesforce/apex/RH_Users_controller.userCreation';

import checkUserCreation from '@salesforce/apex/RH_Users_controller.checkUserCreation';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
//Constants
const EDIT_ACTION='Edit';
const NEW_ACTION='New';
const VIEW_ACTION='View';
const SAVE_ACTION='Save';


const RESET_ACTION='Reset';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';
export default class Rh_user_creation extends NavigationMixin(LightningElement) {
    l={...labels}
    action;
    @api groups;
    roles=[];
    formInputs=[];
    record;
    listgroup=[];
    userfield ={};
    @wire(CurrentPageReference) pageRef;
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
                name:'wGroup',
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
            },
            {
                label:this.l.StartDate,
                placeholder:this.l.StartDate,
                name:'StartDate',
                required:true,
                value: '',
                type:'Date',
                ly_md:'12', 
                ly_lg:'12',
                isText:true,//for avoid render blank field
            }
         
        
        ]
    }
    //navigation Page
    goToPage(pagenname,state={}) {
        let states=state; 
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }
    contactrecord;
    check(){
        checkUserCreation({ conID: this.contactrecord.Id })
          .then(result => {
            console.log('Result');
            console.log(result);
            if ( !result.error) {
                if (result.Ok) {
                    //user created
                    console.log( result);
                    
                    this.goToPage('rhusers',{'recordId': result?.users[0].Id});
                }else{
                    this.checkUserCreationJS();
                }
            }else{
                //has intern error
                this.showToast(ERROR_VARIANT,'ERROR', result.msg);
                this.startSpinner(false)
            }
          })
          .catch(error => {
            console.error('Error:', error);
            this.showToast(ERROR_VARIANT,'ERROR', error);
            this.startSpinner(false)
        });
    }
    checkUserCreationJS(){
        let self=this;
        setTimeout(() => {
            self.check();
        }, 1000);
        
    }
    
    connectedCallback(){
        console.log('teste');
        // this.buildForm();
        //this.getActiveWorkgroupse();
    }
    callApexSave(input){
        this.startSpinner(true)
        userCreation({ contactJson: JSON.stringify(input) })
          .then(result => {
            console.log('Result callApexSave:: ');
            console.log(result);
            if ( !result.error && result.Ok) {
                    //user created
                    console.log( result);
                    this.contactrecord=result?.conctactUser;
                    if(input.Activated) {this.checkUserCreationJS();}  
                        else this.goToPage('rhusers',{'recordId': this.contactrecord.Id});
            }else{
                this.showToast(ERROR_VARIANT,'ERROR', result.msg);
                this.startSpinner(false)
            }
            
            // this.action='';
            // this.callParent(SAVE_ACTION,{result})
          })
          .catch(error => {
            console.error('Error:', error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }


    get newMode(){
        return this.action==NEW_ACTION;
    }
    handleNew(){
       this.startSpinner(true)
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
        }).finally(() => {
            this.startSpinner(false)
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
    startSpinner(b){
        /*let spinner=this.template.querySelector('c-rh_spinner');
        if (b) {    spinner?.start(); }
            else{   spinner?.stop();}*/
       fireEvent(this.pageRef, 'Spinner', {start:b});
    }
    showToast(variant, title, message){
        /*
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);*/
        fireEvent(this.pageRef, 'Toast', {variant, title, message});
    }
}