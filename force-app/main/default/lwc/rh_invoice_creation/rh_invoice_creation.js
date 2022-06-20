import { LightningElement,wire,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { labels } from 'c/rh_label';
import { icons } from 'c/rh_icons';
import InitInvoiceCreation from '@salesforce/apex/RH_Invoice_Controller.InitInvoiceCreation';
import invoiceCreation from '@salesforce/apex/RH_Invoice_Controller.invoiceCreation';
import accountCreation from '@salesforce/apex/RH_Invoice_Controller.accountCreation';
import userCreation from '@salesforce/apex/RH_Users_controller.userCreation';

import checkUserCreation from '@salesforce/apex/RH_Users_controller.checkUserCreation';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
//Constants
const ACCOUNT_NAME_FIELD = 'AccountId';
const EDIT_ACTION='Edit';
const NEW_ACCOUNT='NEW_ACCOUNT';
const NEW_ACTION='New';
const VIEW_ACTION='View';
const SAVE_ACTION='Save';


const RESET_ACTION='Reset';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';
export default class Rh_invoice_creation extends NavigationMixin(LightningElement) {
    l={...labels,}
    
    icon={...icons}
    @api action='';
    inizier={};
    get newAccount() { return this.action==NEW_ACCOUNT}
    accountInputs=[];

    @api groups;
    @api invoice;
    roles=[];
    formInputs=[];
    record;
    listgroup=[];
    userfield ={};
    @wire(CurrentPageReference) pageRef;
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
    handleLookupSelection(event) {
        console.log("the selected record id is" + event.detail);
    }
    contactrecord;
    
    
    connectedCallback(){
        console.log('teste');
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

    get noneMode(){
        return this.action=='';
    }
    get newMode(){
        return this.action==NEW_ACTION || this.action==NEW_ACCOUNT;
    }
    handleChanged(event){
        const objReturned = event.detail;
        console.log('handleChanged');
        console.log(JSON.stringify(objReturned));
        if (ACCOUNT_NAME_FIELD==objReturned?.info?.name) {
            this.handleAccountChanged(objReturned?.info?.value)
        }
        // "info":{"value":"0017Q00000DdLLPQA3","name":"Rh_Account__c"}
    }
    updateFormField(fieldName,updates,type='default'){
        let form=this.template.querySelector('c-rh_dynamic_form');
        if (form) {
            const returned=form.updateField(fieldName,updates,type);
            console.log('updateFormField  returned '+returned);
        }
    }
    handleAccountChanged(accId){
        console.log('SELECTED ACCOUNT ID '+accId);
        
        let newGrpField={
            label:'Groups',
            name:'wGroup',
            picklist: true,
            options: this.groups,
            value: '',
            maxlength:100,
            ly_md:'6', 
            ly_lg:'6'
        }
        this.updateFormField('wGroup',newGrpField);
    }
    handleLookupCreation(event){
        const objReturned = event.detail;
        console.log('handleLookupCreation');
        console.log(JSON.stringify(objReturned));
        if (ACCOUNT_NAME_FIELD==objReturned?.name) {
            this.doCreateAccount();
        }
    }
    doCreateAccount(){
        this.accountInputs=[
            {
                label:'Name',
                placeholder:'Name',
                name:'Name',
                value: '',
                required:true,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Phone',
                placeholder:'Phone',
                name:'Phone',
                value: '',
                required:false,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
        ];
        this.action=NEW_ACCOUNT;
    }
    handleCreateAccountApexOK(obj){
        this.showToast(SUCCESS_VARIANT,this.l.successOp, '');
        this.action=NEW_ACTION;//close modal
        const accId=obj.Id;
        const accName=obj.Name;
        //update account field
        let updFieldAcc={
            // filter:this.inizier?.filter,
            value:accId,
            selectName:accName,
            isSelected:true,
        }
        this.updateFormField(ACCOUNT_NAME_FIELD,updFieldAcc);

    }
    handleCreateAccountApex(record){
        this.startSpinner(true)
        accountCreation({ accountJson: JSON.stringify(record) })
          .then(result => {
            console.log('Result callApexSave:: ');
            console.log(result);
            if ( !result.error && result.Ok) {
                this.handleCreateAccountApexOK(result.account)
            }else{
                this.showToast(ERROR_VARIANT,this.l.warningOp, result.msg);
            }
            
          })
          .catch(error => {
            console.error('Error:', error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }
    handleCreateAccount(event){
        const info = event.detail;
        console.log(JSON.stringify(info));
        if (info.operation=='positive') {
            if (info.isvalid) {
               const record ={...info.fields} ;
               this.handleCreateAccountApex(record);
            }
        }else{
            this.action=NEW_ACTION;  
        }
    }
    handleNew(){
       this.startSpinner(true)
       InitInvoiceCreation()
          .then(result => {
            console.log('Result INIT CONF');
            console.log(result);
            if (!result.error && result.Ok) {
                this.inizier=result;
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
    handleSaveInvoiceApexOK(obj){
        this.showToast(SUCCESS_VARIANT,this.l.successOp, '');
        this.invoice=obj;
        this.goToPage('rh-invoices',{'recordId': this.invoice?.Id});
    }
    handleSaveInvoiceApex(record){
        record.Id=this.invoice?.Id || null;
        this.startSpinner(true)
        invoiceCreation({ invoiceJson: JSON.stringify(record) })
          .then(result => {
            console.log('Result handleSaveInvoiceApex:: ');
            console.log(result);
            if ( !result.error && result.Ok) {
                this.handleSaveInvoiceApexOK(result.invoice)
            }else{
                this.showToast(ERROR_VARIANT,this.l.warningOp, result.msg);
            }
            
          })
          .catch(error => {
            console.error('Error:', error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }
    handleSave(evt){
        let record={};
        let result= this.save();
        if (result.isvalid) {
            record={...record,...result.obj};
            console.log(record);
            this.handleSaveInvoiceApex(record);
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            // this.callApexSave(record);
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
    
    buildForm(){
        this.formInputs=[
            {
                name:ACCOUNT_NAME_FIELD,
                objName:"Account",
                placeholder:'Select Account',
                iconName:"standard:account",
                newLabel:"Nuovo",
                label:"Invoice To",
                objectLabel:'Account',
                filter:this.inizier?.filter,
                // selectName:'',
                // isSelected:false
                required:true,
                enableCreate:true,
                type:'lookup',
                value: '',
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.po,
                placeholder:this.l.po,
                name:'po',
                value: '',
                required:true,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.StartDate,
                placeholder:this.l.StartDate,
                name:'startDate',
                required:true,
                value: '',
                type:'Date',
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.EndDate,
                placeholder:this.l.EndDate,
                name:'endDate',
                required:true,
                value: '',
                type:'Date',
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            }
         
        
        ]
    }
    callParent(actionName,data){
        var actionEvt =new CustomEvent('action',
         {detail: { action : actionName,data }}
      );
      console.log("Watch: actionName ->"+actionName); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }
    startSpinner(b){
       fireEvent(this.pageRef, 'Spinner', {start:b});
    }
    showToast(variant, title, message){
        fireEvent(this.pageRef, 'Toast', {variant, title, message});
    }
}