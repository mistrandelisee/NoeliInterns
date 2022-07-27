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


const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';
export default class Rh_invoice_creation extends NavigationMixin(LightningElement) {
    l={...labels,
        Number:'Number'
    }
    DEFAULT_CURRENCY='EUR';
    curriencies=[
        { label: 'EUR', value: 'EUR' },
        { label: 'FCFA', value: 'FCFA' },
    ];
    icon={...icons}
    @api action='';
    inizier={};
    
    @api 
    disabledfields;
    get newAccount() { return this.action==NEW_ACCOUNT}
    accountInputs=[];

    @api groups;
    @api invoice;
    @api hideNew;
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
        if (this.editMode) {
            this.hideNew=true
            this.handleNew(false);
        }
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
    get formMode() {
        return this.editMode  || this.newMode ;
    }
    get editMode() {
        return this.action == EDIT_ACTION ;
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
                label:this.l.accountName,
                placeholder:this.l.accountNamePlc,
                name:'Name',
                value: '',
                required:true,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Phone,
                placeholder:this.l.PhonePlc,
                name:'Phone',
                value: '',
                required:false,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
            {
                label:this.l.Cap,
                placeholder:this.l.CapPlc,
                name:'Cap',
                value: '',
                required:false,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
            {
                label:this.l.City,
                placeholder:this.l.CityPlc,
                name:'City',
                value: '',
                required:false,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
            {
                label:this.l.sdi,
                placeholder:this.l.sdiPlc,
                name:'Sdi',
                value: '',
                required:false,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
            {
                label:this.l.Email,
                placeholder:this.l.EmailPlc,
                name:'Email',
                value: '',
                required:false,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
            {
                label:this.l.Civico,
                placeholder:this.l.CivicoPlc,
                name:'Civico',
                value: '',
                required:true,
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
    handleNewClik() {
        this.handleNew()
    }
    handleNew(isNew=true){
       this.startSpinner(true)
       InitInvoiceCreation()
          .then(result => {
            console.log('Result INIT CONF');
            console.log(result);
            if (!result.error && result.Ok) {
                this.inizier=result;

                this.buildForm();
                if (isNew) {
                    this.action = NEW_ACTION;
                    this.callParent(this.action, {});
                }
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
            if (record.startDate<record.endDate) {
                this.handleSaveInvoiceApex(record);
            }else{
                console.warn('Start date must before end date');
                this.showToast(WARNING_VARIANT,this.l.warningO,this.l.warn_period_confict );
            }
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
                label:this.l.Number,
                placeholder:this.l.Number,
                name:'RHNumber',
                value: this.invoice?.RH_Number__c,
                readOnly:this.disabledfields?.all || this.disabledfields?.number,
                required:true,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6',
                maxlength:50,
                pattern:'[0-9]+?'
            },
            {
                name:ACCOUNT_NAME_FIELD,
                objName:"Account",
                placeholder:this.l.invoice_toPlc,
                iconName:this.icon.client,
                createNewLabel:this.l.new_account,
                label:this.l.invoice_to,
                objectLabel:'Account',
                filter:this.inizier?.filter,
                selectName: this.invoice?.RH_Account_Id__r?.Name,
                value: this.invoice?.RH_Account_Id__c,
                isSelected:this.editMode,
                limit:20,
                required:true,
                enableCreate:true,
                readOnly:this.disabledfields?.all || this.disabledfields?.account,
                type:'lookup',
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.po,
                placeholder:this.l.po,
                name:'po',
                value: this.invoice?.RH_Po__c,
                readOnly:this.disabledfields?.all || this.disabledfields?.po,
                required:true,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Currency,
                name:'currencyCode',
                type:'radio',
                variant:'label-inline',
                value: this.invoice?.RH_Currency_Code__c || this.inizier?.DEFAULT_CURRENCY,
                required:true,
                options : this.inizier?.picklists.RH_Currency_Code__c || this.curriencies,
                readOnly:this.disabledfields?.all || this.disabledfields?.currency,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.StartDate,
                placeholder:this.l.StartDate,
                name:'startDate',
                required:true,
                value: this.invoice?.RH_InvoiceDate__c,
                readOnly:this.disabledfields?.all || this.disabledfields?.start,
                type:'Date',
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.EndDate,
                placeholder:this.l.EndDate,
                readOnly:this.disabledfields?.all || this.disabledfields?.end,
                name:'endDate',
                required:true,
                value: this.invoice?.RH_DueDate__c,
                type:'Date',
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
        
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