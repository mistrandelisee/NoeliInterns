import { LightningElement,wire,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { labels } from 'c/rh_label';
import { icons } from 'c/rh_icons';
import initConfig from '@salesforce/apex/RH_Invoice_Controller.InitInvoiceItemCreation';

import InitInvoiceCreation from '@salesforce/apex/RH_Invoice_Controller.InitInvoiceCreation';
import invoiceItemCreation from '@salesforce/apex/RH_Invoice_Controller.invoiceItemCreation';
import ressourceCreation from '@salesforce/apex/RH_Invoice_Controller.ressourceCreation';

import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
//Constants

const RESSOURCE_NAME_FIELD = 'ressourceId';
const DESCFIELDS_NAME_FIELD='descriptionFields';
const DESC_NAME_FIELD='subject';
const PROJECT_NAME_FIELD = 'projectId';
const SDATE_NAME_FIELD = 'startDate';
const EDATE_NAME_FIELD = 'endDate';
const QTITY_NAME_FIELD = 'quantity';
const OPEN_FORM='OPEN_FORM';
const NEW_RESSOURCE='NEW_RESSOURCE';
const NEW_ACTION='New';
const EDIT_ACTION='Edit';
const VIEW_ACTION='View';
const SAVE_ACTION='Save';


const RESET_ACTION='Reset';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';
export default class Rh_invoice_creation extends NavigationMixin(LightningElement) {
    l={...labels,}
    
    icon={...icons}
    @api isEntryReadOnly;
    


    @api action='';
    @api mode='';
    inizier={};
    get openModal(){
        return this.action==OPEN_FORM || this.action==NEW_RESSOURCE;
    }
    get newRessource() { return this.action==NEW_RESSOURCE}
    ressourceInputs=[];
    @api invoiceItem={};
    @api invoice;
    roles=[];
    formInputs=[];
    Projects=[];
    Ressources=[];
    selectedProjectId;
    record;
    period={};
    get lineTitle(){
        return this.mode==EDIT_ACTION ? this.l.edit_inv_item : this.l.create_inv_item;
    }
    get lineIcon(){ return (this.isEntryReadOnly) ?'':this.icon.Edit }
    @wire(CurrentPageReference) pageRef;
    connectedCallback(){
        console.log('Rh_invoice_creation connectedCallback');
        this.handleEditInvoiceEntry()
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
    handleEditInvoiceEntry(skip=this.isEntryReadOnly){
        /**skip :::skip initialization */
        if (skip) {//view mode
            this.launchViewEntry();
        }else{
            this.initEntryAction();
        }
    }
    initEntryAction(){
         
        this.startSpinner(true);
        const self=this;
        const config={accountId:this.invoice?.RH_Account_Id__c};
        initConfig({
            infoJson: JSON.stringify(config)
        })
          .then(result => {
            console.log('Result INIT CONF');
            console.log(result);
            if (!result.error && result.Ok) {
                this.inizier.ressourceFilter=result.ressourceFilter || '';
                this.Projects=[];
                this.Projects = this.Projects.concat(result.Projects?.map(function(project) { return {label:project.Name,value:project.Id}}));
                const item={...this.invoiceItem};
                item.RH_ProjectId__c= (this.invoiceItem?.RH_ProjectId__c) ? this.invoiceItem?.RH_ProjectId__c : 
                                                                     (   this.Projects?.length==1 ? this.Projects[0].value : '');
                this.selectedProjectId=item.RH_ProjectId__c;
                this.invoiceItem=item;
                this.inizier.descriptions=result.Picklists?.RH_description_fields__c || [];
                this.launchViewEntry();
                // this.callParent(this.action,{});
            }else{
                this.showToast(WARNING_VARIANT,this.l.warningOp, result.msg);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            this.showToast(ERROR_VARIANT,this.l.errorOp, error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }
    launchViewEntry(){
        this.buildEntryForm();
        this.action=OPEN_FORM;
        // this.toggleView();
    }
    handleLookupSelection(event) {
        console.log("the selected record id is" + event.detail);
    }
    
    
    

    get noneMode(){
        return this.action=='';
    }
    get newMode(){
        return this.action==NEW_ACTION || this.action==NEW_RESSOURCE;
    }
    handleChanged(event){
        const objReturned = event.detail;
        console.log('handleChanged');
        console.log(JSON.stringify(objReturned));
        let qtity=0;
        const key=objReturned?.info?.name;
        if (PROJECT_NAME_FIELD==key) {
            this.handleProjectChanged(objReturned?.info?.value)
        }
        if (SDATE_NAME_FIELD==key) {
            this.period[SDATE_NAME_FIELD]=objReturned?.info?.value;
            qtity=this.handleCalculateQtity();
            qtity ? this.updatedQtityField(qtity) : '';
        }
        if (EDATE_NAME_FIELD==key) {
            this.period[EDATE_NAME_FIELD]=objReturned?.info?.value;
            qtity=this.handleCalculateQtity();
            qtity ? this.updatedQtityField(qtity) : '';        
        }
        if (DESCFIELDS_NAME_FIELD==key) {
            this.handleDescFieldsChanged(objReturned?.info?.value)
        }
        // "info":{"value":"0017Q00000DdLLPQA3","name":"Rh_Account__c"}
    }
    descFields={requiresElt:{},disableElt:{}};
    descFieldsUtil(value){
        const includeDescription=value?.find(x=>x=='RH_Subject__c');
        const includeRessource=value?.find(x=>x=='RH_Ressource__c');
        const includeProject=value?.find(x=>x=='RH_ProjectId__c');
        const requiresElt={Description: includeDescription,  Ressource:includeRessource, Project:includeProject}
        const disableElt={Description: !includeDescription,  Ressource:!includeRessource, Project:!includeProject}

        this.descFields= {requiresElt,disableElt}
        return this.descFields;
    }
    handleDescFieldsChanged(value){
        const {requiresElt,disableElt}=this.descFieldsUtil(value)
        let descField={
            required:requiresElt?.Description,
            name:DESC_NAME_FIELD,
            disabled:disableElt?.Description,
        };
        this.updateFormField(DESC_NAME_FIELD,descField,'');

        let newRsField={
            required:requiresElt?.Ressource,
            name:RESSOURCE_NAME_FIELD,
            disabled:disableElt?.Ressource,
        };
    
        this.updateFormField(RESSOURCE_NAME_FIELD,newRsField,'lookup');

        let projField={
            required:requiresElt?.Project,
            name:PROJECT_NAME_FIELD,
            disabled:disableElt?.Project,
        };
    
        this.updateFormField(PROJECT_NAME_FIELD,projField,'');

    }
    handleCalculateQtity(){
        try {
            const stDate=new Date(this.period[SDATE_NAME_FIELD]);
            const eDate=new Date(this.period[EDATE_NAME_FIELD]);
            const qtity=this.daysBetween(stDate,eDate);
            return qtity;
        } catch (error) {
            return 0;
        }
    }
    updatedQtityField(qtity){
        let qtityField={
            value:qtity,
            name:QTITY_NAME_FIELD,
        };
        this.updateFormField(QTITY_NAME_FIELD,qtityField);
    }
    daysBetween(stDate,eDate){

        let st=stDate;
        let nb=0;
        while (st<=eDate){
            if (st.getDay()%6!=0) { nb=nb+1;}
            st.setDate(st.getDate()+1);
        }
        return nb;

    }
    handleProjectChanged(projectId){
        
        console.log('SELECTED ACCOUNT ID '+projectId);
        this.selectedProjectId=projectId;
        const filter='RH_Project__c = \''+(this.selectedProjectId || this.invoiceItem?.RH_ProjectId__c)+'\'';
        const {requiresElt,disableElt}=this.descFields;
        let newRsField={
                selectName:'',
                value:'',
                isSelected:false,
                // required:true,
                name:RESSOURCE_NAME_FIELD,
                filter,
                // disabled:false,//on start disable this field
                ly_lg:'6',
                required:requiresElt?.Ressource,
                disabled:disableElt?.Ressource,
            };
        this.updateFormField(RESSOURCE_NAME_FIELD,newRsField,'lookup');
    }
    updateFormField(fieldName,updates,type='default'){
        let form=this.template.querySelector('c-rh_dynamic_form');
        if (form) {
            const returned=form.updateField(fieldName,updates,type);
            console.log('updateFormField  returned '+returned);
        }
    }
    handleLookupCreation(event){
        const objReturned = event.detail;
        console.log('handleLookupCreation');
        console.log(JSON.stringify(objReturned));
        if (RESSOURCE_NAME_FIELD==objReturned?.name) {
            this.doCreateRessource();
        }
    }
    doCreateRessource(){
        const filter=' Id NOT IN ( SELECT RH_Contact__c  FROM RH_Participation__c  WHERE RH_Project__c  = \''+(this.selectedProjectId || this.invoiceItem?.RH_ProjectId__c)+'\') '+' AND '+this.inizier.ressourceFilter;
        this.ressourceInputs=[
            {
                name:'ContactId',
                objName:"Contact",
                placeholder:this.l.employeePlc,
                iconName:this.icon.user,
                newLabel:this.l.New,
                label:this.l.employee,
                objectLabel:this.l.ressource,
                filter,
                required:true,
                limit:1000,//get all 
                type:'lookup',
                value: '',
                ly_md:'12', 
                ly_lg:'12'
            },
        ];
        this.action=NEW_RESSOURCE;
    }
    handleCreateRessourceApexOK(obj){
        this.showToast(SUCCESS_VARIANT,this.l.successOp, '');
        this.action=OPEN_FORM;//close modal
        const conId=obj?.Id;
        const conName=obj?.Name;
        //update account field
        let updFieldAcc={
            // filter:this.inizier?.filter,
            value:conId,
            selectName:conName,
            isSelected:true,
        }
        this.updateFormField(RESSOURCE_NAME_FIELD,updFieldAcc,'lookup');

    }
    handleCreateRessourceApex(record){
        record.ProjectId=this.selectedProjectId || this.invoiceItem?.RH_ProjectId__c;
        this.startSpinner(true)
        ressourceCreation({ ressourceJson: JSON.stringify(record) })
          .then(result => {
            console.log('Result callApexSave:: ');
            console.log(result);
            if ( !result.error && result.Ok) {
                this.handleCreateRessourceApexOK(result.contact)
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
    handleCreateRessource(event){
        const info = event.detail;
        console.log(JSON.stringify(info));
        if (info.operation=='positive') {
            if (info.isvalid) {
               const record ={...info.fields} ;
               this.handleCreateRessourceApex(record);
            }
        }else{
            this.action=OPEN_FORM;  
        }
    }
    handleCancel(){
        this.action='';
        this.reloadPage();
    }
    handleSaveInvoiceItemApexOK(obj){
        this.invoiceItem=obj;
        this.reloadPage();
    }
    reloadPage(){

        this.goToPage('rh-invoices',{'recordId': this.invoice?.Id});
    }
    initializeFrom(){
        this.invoiceItem={};
        this.formInputs=[];
        this.handleEditInvoiceEntry();
    }
    handleSaveInvoiceItemApex(record,from=''){
        record.Id=this.invoiceItem?.Id || null;
        record.invoiceId=this.invoice?.Id || null;
        record.currencyCode=this.invoice?.RH_Currency_Code__c || null;
        this.startSpinner(true)
        invoiceItemCreation({ entryJson: JSON.stringify(record) })
          .then(result => {
            console.log('Result handleSaveInvoiceItemApex:: ');
            console.log(result);
            if ( !result.error && result.Ok) {
                this.action='';
                this.showToast(SUCCESS_VARIANT,this.l.successOp, '');
                if(from ==='SAVENEW'){
                    this.initializeFrom();
                }else{
                    this.handleSaveInvoiceItemApexOK(result.invoiceItem)
                }
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
    handleSaveNew(evt){
        this.handleSave('SAVENEW')
    }
    handleSave(evt){
        let record={};
        let result= this.save();
        if (result.isvalid) {
            record={...record,...result.obj};
            console.log(record);
            this.handleSaveInvoiceItemApex(record,evt);
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

    returnFields=['RH_Contact__r.Name','RH_Project__r.Project_Manager__r.Name','RH_Contact__c','RH_Project__r.Project_Manager__c'];//get participants and project managers
    queryFields=['RH_Contact__r.Name'];//search text in the participants name or the tech leader of the project
    fieldMapping=[{field:'RH_Contact__c',label:'RH_Contact__r.Name'},
    {field:'RH_Project__r.Project_Manager__c',label:'RH_Project__r.Project_Manager__r.Name'}
]
    buildEntryForm(){
        const {beginDate, endDate}=this.dateInterval();
        
        this.period[EDATE_NAME_FIELD]=endDate;
        this.period[SDATE_NAME_FIELD]=beginDate;
        const filter='RH_Project__c = \''+(this.selectedProjectId || this.invoiceItem?.RH_ProjectId__c)+'\'';
        console.log('buildEntryForm');
        console.log({...this.invoiceItem});
        const qtity=this.invoiceItem?.RH_Quantity__c || this.handleCalculateQtity();

        let dfDescriptionField = ['RH_ProjectId__c'];
        let descriptions =  this.inizier?.descriptions || [];

        if (this.invoiceItem?.RH_description_fields__c) {
            dfDescriptionField=this.invoiceItem?.RH_description_fields__c.split(';');
        }
        const {requiresElt,disableElt}=this.descFieldsUtil(dfDescriptionField)


        this.formInputs=[
            {
                name:RESSOURCE_NAME_FIELD,
                objName:"RH_Participation__c",
                placeholder:this.l.ressourcePlc,
                iconName:this.icon.resource,
                newLabel:this.l.New,
                label:this.l.ressource,
                objectLabel:this.l.ressource,
                filter,
                selectName:this.invoiceItem?.RH_Ressource__r?.Name,
                isSelected:this.invoiceItem?.RH_Ressource__r?.Name ? true : false,
                // required:true,
                disabled: (this.selectedProjectId || this.invoiceItem?.RH_ProjectId__c) ? false: disableElt?.Ressource || true,//disable is no project selected
                enableCreate:true,
                returnFields:this.returnFields,
                queryFields:this.queryFields,
                fieldMapping:this.fieldMapping,
                limit:1000,//get all 
                type:'lookup',
                value: this.invoiceItem?.RH_Ressource__c,
                readOnly:this.isEntryReadOnly,
                required:requiresElt?.Ressource,
                ly_lg:'6',
                ly_xs:'12',
                ly_md:'6', 
            },
            {
                label:this.l.Subject,
                name: DESC_NAME_FIELD,
                value: this.invoiceItem?.RH_Subject__c,
                maxlength : 50,
                readOnly:this.disabledfields?.all || this.disabledfields?.descripion,
                required:requiresElt?.Description,
                disabled:disableElt?.Description,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'8'
            },
            {
                label:this.l.descriptionFields,
                name:DESCFIELDS_NAME_FIELD,
                type:'checkbox-group',
                // variant:'label-inline',
                value: dfDescriptionField,
                required:true,
                options : descriptions,
                readOnly:this.disabledfields?.all || this.disabledfields?.descripionFields,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'4'
            },
            
            {
                label:this.l.StartDate,
                placeholder:this.l.StartDate,
                name:SDATE_NAME_FIELD,
                required:true,
                value:this.formatDateValue(this.invoiceItem?.RH_StartDate__c,this.invoice?.RH_InvoiceDate__c),
                type:'Date',
                min: beginDate,
                //max: endDate,
                readOnly:this.isEntryReadOnly,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.EndDate,
                placeholder:this.l.EndDate,
                name:EDATE_NAME_FIELD,
                required:true,
                min: beginDate,
               //max: endDate,
                value:this.formatDateValue(this.invoiceItem?.RH_EndDate__c,this.invoice?.RH_DueDate__c),
                type:'Date',
                // helpText:'the end date must be less today',
                readOnly:this.isEntryReadOnly,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Quantity,
                placeholder:this.l.Quantity,
                name:QTITY_NAME_FIELD,
                required:true,
                min:1,
                value: qtity,
                type:'number',
                readOnly:this.isEntryReadOnly,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Rate,
                placeholder:this.l.Rate,
                name:'rate',
                required:true,
                min:1,
                value:this.invoiceItem?.RH_Rate__c || 0,
                type:'number',
                readOnly:this.isEntryReadOnly,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
         
        
        ]
        let projetElt;
        if (this.isEntryReadOnly) {
            projetElt={
                label:this.l.Project,
                name:PROJECT_NAME_FIELD, 
                value: this.invoiceItem?.Project,
                required:true,
                maxlength:100,
                ly_md:'12', 
                ly_lg:'6',
                ly_xs:'12',
                readOnly:this.isEntryReadOnly
            };
        }else{
            projetElt={
                label:this.l.Project,
                name:PROJECT_NAME_FIELD,
                picklist: true,
                options: this.Projects,
                value: this.invoiceItem?.RH_ProjectId__c,
                required:requiresElt?.Project,
                disabled:disableElt?.Project,
                // required:true,
                maxlength:100,
                ly_md:'12', 
                ly_lg:'6',
                ly_xs:'12',
                readOnly:this.isEntryReadOnly
            };
        }
        this.formInputs.unshift( projetElt );
    }
  
    dateInterval(){
        let beginDate =this.invoice?.RH_InvoiceDate__c ? new Date(this.invoice?.RH_InvoiceDate__c) : new Date();
        let endDate =this.invoice?.RH_DueDate__c ? new Date(this.invoice?.RH_DueDate__c) : new Date();
        // let endDate = new Date();// last date must e today
        console.log('***** dateInterval ');
        beginDate=beginDate.toISOString().split('T')[0];
        endDate=endDate.toISOString().split('T')[0];
        console.log('beginDate ',beginDate);
        console.log('endDate  ',endDate);

        return {beginDate, endDate};
    }
   
    formatDateValue(dateIso,dateIso2){
        const d =dateIso ? new Date(dateIso) : (dateIso2 ? new Date(dateIso2) : new Date());
        console.log('Date formatDateValue new  ',d);
        console.log('Date START_OF_DAY GMT ',d.toISOString());
        return d.toISOString().split('T')[0];
    }
    
}