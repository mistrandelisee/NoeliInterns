import { api, LightningElement,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import { labels } from 'c/rh_label';
import { icons } from 'c/rh_icons';

import getInvoice from '@salesforce/apex/RH_Invoice_Controller.getInvoice';
import initConfig from '@salesforce/apex/RH_Invoice_Controller.InitInvoiceItemCreation';
import timeSheetEntryCreation from '@salesforce/apex/RH_Timesheet_Controller.timeSheetEntryCreation';
import submitTimeSheet from '@salesforce/apex/RH_Timesheet_Controller.submitTimeSheet';
import approvalTimesheet from '@salesforce/apex/RH_Timesheet_Controller.approvalTimesheet';
import deleteInvoice from '@salesforce/apex/RH_Invoice_Controller.deleteInvoice';
import deleteTimeSheetEntry from '@salesforce/apex/RH_Timesheet_Controller.deleteTimeSheetEntry';
import generatedPDF from '@salesforce/apex/RH_Timesheet_Controller.generatedPDF';


import { CurrentPageReference } from 'lightning/navigation';
import { registerListener,unregisterListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
const NEW_ACTION='New';
const EDIT_ACTION='Edit';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';


const ERROR_VARIANT='error';
const FROMRESETPWD='ResetPWD';
const RESET_ACTION='Reset';
const SAVE_ACTION='Save';

const ACTIVE_ACTION='active';
const DISABLE_ACTION='banned';
const FREEZE_ACTION='frozen';
const PROMOTE_ACTION='PromoteBaseUser';
const CARD_ACTION='stateAction';

const FROM_CHILD='FROM_CHILD';
const FROM_PARENT='FROM_PARENT';
//MODAL Actions
const OK_DELETE_ITEM='OK_DELETE_ITEM';
const OK_DELETE='OK_DELETE_ITEM';
const APPROVE_ACTION='approvato';
const REJECT_ACTION='Reject';
const DRAFT_STATUS='nuovo';
const SUBMITTED_STATUS='inviato';
const DELETE_ACTION='Delete';
const ADD_LINE_ACTION='ADD_LINE_ACTION';
const EXPORT_ACTION_PDF='EXPORT_ACTION_PDF';
const EXPORT_ACTION_XLS='EXPORT_ACTION_XLS';
const SUBMIT_ACTION='inviato';
const actions = [
    { label: 'Show details', name: EDIT_ACTION,iconPosition: 'left', iconName: icons.Edit, },
    { label: 'Delete', name: DELETE_ACTION ,iconPosition: 'left',iconName: icons.Delete}
];
export default class Rh_invoice_details extends NavigationMixin(LightningElement)  {
    END_OF_DAY=20;//GMT
    START_OF_DAY=8;//GMT
    l={...labels,
        SaveNew:'Save & New',
        Submit:'Submit',
        Delete:'Delete',
        Approve:'Approve',
        AddLines:'Add Items',
        ExportPDF:'Export PDF',
        ExportXLS:'Export XLSX',
        approvalTitle:'APPROVAL ACTION',
        Date:'Date',
        startTime:'Start Time',
        endTime:'End Time',
        noTimesheetItems:'No Timesheet Items found for this timesheet. Use the Add times Action to add items',
        // 
        project: 'Project',
        ressource: 'Ressource',
        quantity: 'Quantity',
        amount: 'Amount',
    }
    icon={...icons}
    detailsActions=[
    ]
    @api
    recordId;
    record;
    invoiceFields=[];
    invoicesEntries=[];
    sheetNotFounded;
    pdfExport;
    currUser={};
    isMine=false;
    action='';
    invoiceItem={};
    formEntry=[];
    myProjects=[];
    sectionExpanded=true;

    @track columns = [
        { label: 'Name', fieldName: 'title',sortable:true, type: 'button',typeAttributes:{label:{fieldName:'title'},variant:'base'} },
        { label: this.l.project, fieldName: 'Project',sortable:true, type: 'text' },
        { label: this.l.ressource, fieldName: 'ressource',sortable:true, type: 'text',cellAttributes: { alignment: 'left' }, },
        { label: this.l.amount, fieldName: 'RH_Amount__c',sortable:true, type: 'currency',cellAttributes: { alignment: 'left' }, },
        { label: this.l.quantity, fieldName: 'RH_Quantity__c',sortable:true, type: 'number',cellAttributes: { alignment: 'left' }, },
        { label: this.l.StartDate, fieldName: 'RH_StartDate__c',sortable:true, type: "date", typeAttributes:{
            weekday: "long", year: "numeric",
            month: "long", day: "2-digit",
            hour: "2-digit", minute: "2-digit"
        } },
        { label: this.l.EndDate, fieldName: 'RH_EndDate__c',sortable:true, type: "date",
        typeAttributes:{
            weekday: "long", year: "numeric",
            month: "long", day: "2-digit",
            hour: "2-digit", minute: "2-digit"
        } },
    ];
    invoiceItemsCols = [
        // Column #1
        {   key:'Project',
            column: this.l.Activity,
        },
        // Column #3
        {
            key:'DurationInMinutes',
            column: this.l.Duration_mins,
        },
        // Column #4
        {
            key:'StartTimeF',
            column: this.l.startTime,
        },
        // Column #2
        {
            key:'EndTimeF',
            column: this.l.endTime,
        }

        
    ]
    SheetCols = [
       /* {
            column:'Status',
            key:'Status',
        },
        
        {
            column:"Total Duration In Minutes",
            key:'TotalDurationInMinutes',
        },
        {
            column:"Total Duration In Hours",
            key:'TotalDurationInHours',
        },
        {
            column:'Date',
            key:'StartDate',
        }
        */
        {
            column:this.l.StartDate,
            key:'StartDate'
        },
        
        {
            column:this.l.EndDate,
            key:'EndDate'
        },
        {
            column:this.l.Status,
            key:'Status'
        },
        
        {
            column:this.l.total_dur_mins,
            key:'TotalDurationInMinutes'
        },
        
        {
            column:this.l.total_free_dur_mins,
            key:'RH_Total_Free_Duration_Minutes__c'
        },
        
        {
            column:this.l.total_work_dur_mins,
            key:'totalWorkingMinutes'
        },
        {
            column:this.l.total_dur_h,
            key:'TotalDurationInHours'
        },
        {
            column:this.l.total_free_dur_h,
            key:'RH_Total_Free_Duration_Hours__c',
        },
        {
            column:this.l.total_work_dur_h,
            key:'totalWorkingHours',
        }
    ]
    
    approvalInputs=[];
    approvalLbl;
    @wire(CurrentPageReference) pageRef;
    get hasDetailsActions(){ return this.detailsActions?.length >0}
    get newLineMode(){ return this.action==ADD_LINE_ACTION}
    get approval(){ return this.action==APPROVE_ACTION || this.action==REJECT_ACTION}
    get hasInvoiceInfo(){  return this.record?true:false; }
    get isAdmin() { return this.currUser?.isCEO || this.currUser?.isTLeader}
    get isApprover() { return this.isAdmin || this.currUser?.isApprover}
    get isApproved(){ return APPROVE_ACTION.toLowerCase() == this.record.Status?.toLowerCase() ; }

    get isRejected(){ return REJECT_ACTION.toLowerCase() == this.record.Status?.toLowerCase() ; }

    get isSubmitted(){ return SUBMITTED_STATUS.toLowerCase() ==this.record.Status?.toLowerCase() ; }

    get isDraft(){ return DRAFT_STATUS.toLowerCase() ==this.record.Status?.toLowerCase() ; }

    get isEditable(){return this.isDraft || this.isRejected}
    get isFinal(){return this.isApproved || this.isRejected}
    get isEntryReadOnly(){
        return !(this.isMine && this.isEditable)
    }
    get fileName(){ return this.title }

    get lineIcon(){ return (this.isEntryReadOnly) ?'':this.icon.Edit }
    get lineTitle(){ return (this.isEntryReadOnly) ?'Line details':'Create Line'}
    get iconName(){
        return (!this.sectionExpanded)? this.icon.chevrondown  : this.icon.chevronup 
    }
    toggleView(){
        this.sectionExpanded=!this.sectionExpanded;
    }
    connectedCallback(){
        registerListener('ModalAction', this.doModalAction, this);
        console.log('RECORDID connectedCallback ',this.recordId);
       this.getInvoiceApex();
    }
    get title(){ return this.record?.RH_Name__c || this.record?.Name}
    getInvoiceApex(){
        this.record={};
        this.startSpinner(true);
        console.log('RECORDID getInvoiceApex ',this.recordId);
        getInvoice({ invoiceId: this.recordId })
          .then(result => {
            console.log('Result', result);
            
            if (!result.error && result.Ok) {
                
                this.isMine=result.isMine;
                this.currUser={...result.currentContact,
                                isCEO:result.isCEO,
                                isRHUser:result.isRHUser,
                                isTLeader:result.isTLeader,
                                isBaseUser:result.isBaseUser,
                                isApprover:result.isApprover,
                }

                this.record=result.Invoice;
                if (this.record?.Id) {
                    const invoicesEntries=  this.record?.RH_Invoices_Items__r || [];
                    if (this.isEditable && this.isMine) {//if draft
                        this.columns=[...this.columns,
                         { type: 'action', typeAttributes: { rowActions: actions } },]
                    }   

                    this.buildInvoiceFields();
                    this.buildActions();
                    // this.buildEntriesList(invoicesEntries);
                }else{
                    this.sheetNotFounded=true;
                }
            }else{
                this.showToast(WARNING_VARIANT,this.l.warningOp, result.msg);
            }
          })
          .catch(error => {
            this.sheetNotFounded=true;
            this.showToast(ERROR_VARIANT,this.l.warningOp, error.message);
            console.error(error);
        })
        .finally(() => {
            this.startSpinner(false);
        });
    }
    buildEntriesList(invoicesEntries){
        const self=this;
        this.invoicesEntries=invoicesEntries.map(function (e ){
            let item={...e};
            item.title=e.TimeSheetEntryNumber;
            item.id=e.Id;
            item.icon=self.icon.timesheetEntry;
            item.class=e.Status;
            item.Project=e.RH_Project__r.Name;
            if (e.StartTime) {
                item.StartTimeF=new Date(e.StartTime).toLocaleString();// new Date(e.StartTime).toLocaleTimeString() ;
            }
            if (e.EndTime) {
                item.EndTimeF= new Date(e.EndTime).toLocaleString() ;
            }
            item.Project=e.RH_Project__r.Name;
            let Actions=[];
            //add status actions
            
            if (self.isEditable) {//if draft
                if (self.isMine) {//is mine
                    //add DELETE_ACTION  
                    Actions.push(self.createAction("base",self.l.Edit,EDIT_ACTION,self.l.Edit,self.icon.Edit,'active-item'));
                    Actions.push(self.createAction("base",self.l.Delete,DELETE_ACTION,self.l.Delete,self.icon.Delete,'active-item'));
                }
            }
            

            item.actions=Actions;
            console.log(`item`);
            console.log(item);
            return item;
        });
        this.refreshTable(this.invoicesEntries)
    }
    handleDataTableAction( event ) {
        const info=event.detail;
        console.log('event from datatable ' +JSON.stringify(info));
        this.invoiceItem=info.row;
        if (info?.action?.label?.fieldName=='title') {
            this.handleEditInvoiceEntry();
        }
        if (info?.action?.name) {//user clicks on the dropdown actions
            const record={Id:this.invoiceItem?.Id, action:info?.action?.name};
            switch (record.action) {
                case EDIT_ACTION:
                    this.handleEditInvoiceEntry();
                    break;
                case DELETE_ACTION:
                    let text='';
                    const Actions=[]
                    const extra={style:'width:20vw;'};//
                    text=this.l.delete_invoiceItem_confirm;
                    extra.title=this.l.action_confirm;
                    extra.style+='--lwc-colorBorder: var(--bannedColor);';
                    // Actions.push(this.createAction("brand-outline",this.l.Cancel,'KO',this.l.Cancel,"utility:close",'slds-m-left_x-small'));
                    Actions.push(this.createAction("brand-outline",this.l.ok_confirm,OK_DELETE_ITEM,this.l.ok_confirm,this.icon.check,'slds-m-left_x-small'));
                    this.ShowModal(true,text,Actions,extra);
                   
                    // this.handleDeleteInvoiceEntry(); //launch confirmation modal
                    break;
                default:
                    break;
            }
        }
    }
    refreshTable(data) {
        const dataTableCmp = this.template.querySelector('c-rh_datatable_component');
        if (dataTableCmp) {
            dataTableCmp?.setDatas(data);
        } else {
            console.log('@@@@@@@@@@@@@Not found');
        }
    }
    buildActions(){
        let Actions=[];
        Actions.push(this.createAction("brand-outline",this.l.Delete,DELETE_ACTION,this.l.Delete,this.icon.Delete,'slds-m-left_x-small'));
        Actions.push(this.createAction("brand-outline",this.l.ExportPDF,EXPORT_ACTION_PDF,this.l.ExportPDF,this.icon.exportPdf,'slds-m-left_x-small'));
        Actions.push(this.createAction("brand-outline",this.l.ExportXLS,EXPORT_ACTION_XLS,this.l.ExportXLS,this.icon.exportXls,'slds-m-left_x-small'));
        Actions.push(this.createAction("brand-outline",this.l.AddLines,ADD_LINE_ACTION,this.l.AddLines,this.icon.Add,'slds-m-left_x-small'));
        
        console.log('Actions');
        console.log(Actions);
        this.detailsActions=Actions;
    }
    
    handleGoToLink(event){
        const data=event.detail;
        console.log(`data ?? `, JSON.stringify(data));
        if (data?.action=='goToLink') {
            if (data?.eltName=='Owner' || data?.eltName=='Approver') {
                this.goToPage('rhusers',{recordId:data?.info?.dataId})
            }
        }
    }
    handleDetailsActions(event){
        console.log('handleDetailsActions :', event.detail.action);
        const action=event.detail.action;
        switch (action) {
            case DELETE_ACTION:
                this.actionRecord={Id:this.recordId}
                let text='';
                const Actions=[]
                const extra={style:'width:20vw;'};//
                text=this.l.delete_sheet_confirm;
                extra.title=this.l.action_confirm;
                extra.style+='--lwc-colorBorder: var(--bannedColor);';
                // Actions.push(this.createAction("brand-outline",this.l.Cancel,'KO',this.l.Cancel,"utility:close",'slds-m-left_x-small'));
                Actions.push(this.createAction("brand-outline",this.l.ok_confirm,OK_DELETE,this.l.ok_confirm,this.icon.check,'slds-m-left_x-small'));
                this.ShowModal(true,text,Actions,extra);
                break;
            case ADD_LINE_ACTION:
                this.invoiceItem={};
                this.action=ADD_LINE_ACTION;
                // this.initEntryAction();
                break;
            case EXPORT_ACTION_PDF:
                this.handlePrintInvoice();
                break;
            case EXPORT_ACTION_XLS:
                this.handlePrintInvoiceXLS();
                break;
            default:
                console.error('Actions ',action ,' not reconized');
                break;
        }
        
       /* if (event.detail.action==NEW_ACTION) {
            //call create new Timesheet then redirect to the timesheet
            console.log('call create new Timesheet then redirect to the timesheet');
            // this.createTimesheetApex()
        }*/
         //   this.handleUserAction(record, FROM_PARENT);
    }
    doModalAction(event){
        console.log('doModalAction in user view ', JSON.stringify(event.action));
        switch (event.action) {
            case OK_DELETE://delete timesheet
                if(this.actionRecord){
                    this.handleDeleteInvoice();
                    this.actionRecord=null;
                }
                break;
            case OK_DELETE_ITEM://delete timesheet item
                if(this.invoiceItem?.Id){
                    this.handleDeleteInvoiceEntry();
                    this.invoiceItem=null;

                }
                break;
            default:
                this.actionRecord=null;
                this.invoiceItem=null;
                break;
        }
        this.ShowModal(false,null,[]);//close modal any way
        // event.preventDefault();
    }
    disconnectedCallback() {
        
        unregisterListener('ModalAction', this.doModalAction, this);
        //code
    }
    actionRecord={};
    doApporoval(obj){
        this.startSpinner(true);
        approvalTimesheet({ SheetJson:  JSON.stringify(obj) })
          .then(result => {
            console.log('Result', result);
            if (!result.error && result.Ok) {
                this.showToast(SUCCESS_VARIANT,this.l.successOp,'');//, 'Action Done Successfully'
                this.resetApproval();

                //Refresh Page
                this.reloadPage();
            }else{
                this.showToast(WARNING_VARIANT,this.l.warningOp, result.msg);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            this.showToast(ERROR_VARIANT,this.l.warningOp, error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }

    approvalRecord={}
    handleNote(event){
        const info = event.detail;
        console.log(JSON.stringify(info));
        if (info.operation=='positive') {
            if (info.isvalid) {
                this.approvalRecord={...this.approvalRecord,...info.fields} ;
               this.doApporoval(this.approvalRecord);
            }
        }else{
            this.resetApproval();
        }
    }
    resetApproval(){
        this.action='';
        this.approvalInputs=[];
        this.approvalRecord={};
    }
    

    /*Generated PDF Functions*/
    handlePrintInvoice(){
        debugger
        this.startSpinner(true);
        generatedPDF({listId:this.recordId})
            .then(result =>{
                console.log(result)
                this.saveFile(result);
                this.startSpinner(false);   
            }).catch(error => {
                console.error('Error:', error);
                this.showToast(ERROR_VARIANT,this.l.warningOp, error);
            })
    }
    /*Generated PDF Functions*/
     handlePrintInvoiceXLS(){
        const HeaderTemplate=[{value: 'Sheet Informations', wrap: true, fontWeight: 'bold'}];
        const HeaderItemsTemplate=[{value: 'Sheet Items', wrap: true, fontWeight: 'bold'}];
        const divider=[];
        let exporter=this.template.querySelector('c-rh_export_excel');
        const sheetObj=exporter.buildRows(this.SheetCols,[this.record]);
        const invoiceItemsObj=exporter.buildRows(this.invoiceItemsCols,this.invoicesEntries);

        const allRows =[HeaderTemplate,...sheetObj.rows,divider,HeaderItemsTemplate,...invoiceItemsObj.rows] 
        const maxCols= sheetObj.columns?.length >=invoiceItemsObj.columns?.length ? sheetObj.columns   :  invoiceItemsObj.columns;
        console.log(allRows);
        console.log(maxCols);

         exporter.setDatas(allRows,maxCols);
    }

    saveFile(StringBlob) {
        var link = document.createElement('a');
        link.innerHTML = 'Download PDF file';
        link.download = this.fileName+'.pdf';
        link.href = 'data:application/octet-stream;base64,' + StringBlob;
        document.body.appendChild(link);
        link.click();
    }
    /*Generated PDF Functions */
    handleDeleteInvoice(){
        this.startSpinner(true);
        deleteInvoice({ invoiceId:  this.recordId })
          .then(result => {
            console.log('Result', result);
            if (!result.error && result.Ok) {
                //GO BACK TO PARENT
                this.showToast(SUCCESS_VARIANT,this.l.successOp,  this.l.succesDelete);
                this.goToPage('rhtimesheet');
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
    goToPage(pagenname,statesx={}) {
        let states=statesx; //event.currentTarget.dataset.id , is the recordId of the request
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }
    
    handleDeleteInvoiceEntry(){
        this.startSpinner(true);
        
        deleteTimeSheetEntry({ timesheetEntryId:this.invoiceItem?.Id })
          .then(result => {
            console.log('Result', result);
            if (!result.error && result.Ok) {
                //Refresh Page
                this.showToast(SUCCESS_VARIANT,this.l.successOp,  this.l.succesDelete);
                this.reloadPage();
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
    handleUpadateTimeSheetEntry(){

    }
    handleEditInvoiceEntry(skip=this.isEntryReadOnly){
        this.action=ADD_LINE_ACTION;
        /**skip :::skip initialization */
        // if (skip) {//view mode
        //     this.launchViewEntry();
        // }else{
        //     this.initEntryAction();
        // }
    }
    launchViewEntry(){
        this.buildEntryForm();
                
        this.action=ADD_LINE_ACTION;
        // this.toggleView();
    }
    selectedProject;
    initEntryAction(){
         
        this.startSpinner(true);
        const self=this;
        const config={accountId:this.record?.RH_Account_Id__c};
        initConfig({
            infoJson: JSON.stringify(config)
        })
          .then(result => {
            console.log('Result INIT CONF');
            console.log(result);
            if (!result.error && result.Ok) {
                this.myProjects=[];
                this.myProjects = this.myProjects.concat(result.ProjectsLeaded?.map(function(project) { return {label:project.Name,value:project.Id}}));
                const item={...this.invoiceItem};
                item.RH_Project__c= (this.invoiceItem?.RH_Project__c) ? this.invoiceItem?.RH_Project__c : 
                                                                     (   this.myProjects?.length==1 ? this.myProjects[0].value : '');
                this.invoiceItem=item;
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
    handleCreateEntryApexFinishOK(result,todo={}){
        this.showToast(SUCCESS_VARIANT,this.l.successOp,  '');//this.l.succesDelete
        if (todo.action=='SAVE_NEW') {
            this.invoiceItem={};
            this.launchViewEntry();
        }else{

            this.reloadPage();
        }

    }
    handleCreateEntryApex(obj,todo={}){
        this.startSpinner(true);
        obj.TimeSheetId=this.recordId;
        obj.Id=this.invoiceItem?.Id;
        timeSheetEntryCreation({ entryJson: JSON.stringify(obj) })
          .then(result => {
            console.log('Result', result);
            if (!result.error && result.Ok) {
                this.handleCreateEntryApexFinishOK(result,todo);
            }else{
                this.showToast(WARNING_VARIANT,this.l.warningOp, result.msg);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            this.showToast(ERROR_VARIANT,this.l.warningOp, error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }
    handleCardAction(event){
        console.log('event parent ' +JSON.stringify(event.detail));
        const info=event.detail;
        this.invoiceItem=info.data;
        if (info?.extra?.isTitle) {

            this.handleEditInvoiceEntry();
            //this.goToTimeSheetDetail(info?.data?.id);
            //TO DO Build Details and show it in edit panel
        }
        if (info?.action==CARD_ACTION) {//user clicks on the dropdown actions
            const record={Id:info?.data?.id, action:info?.extra?.item};
            switch (record.action) {
                case EDIT_ACTION:
                    this.handleEditInvoiceEntry();
                    break;
                case DELETE_ACTION:
                    this.handleDeleteInvoiceEntry();
                    break;
                default:
                    break;
            }
        }
    }
    reloadPage(){
        // window.location.reload()
        this.goToPage('rh-invoices',{recordId:this.recordId})
    }
    handleCancel(){
        this.action='';
    }
    handleSaveOLD(evt){
        let record={};
        let result= this.save();
        if (result.isvalid) {
            record={...record,...result.obj};
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            if (record.StartTime<record.EndTime) {
                this.handleCreateEntryApex(record);
            }else{
                console.warn('Start date must before end date');
                this.showToast(WARNING_VARIANT,'VALIDATION ERROR', 'Start date must before end date');
            }
            // this.callParent(SAVE_ACTION,record)
        }else{
            console.log(`Is not valid `);
        }
        console.log(`record `, record);
    }
    handleSaveNew(evt){
        this.doSave({action:'SAVE_NEW'})
    }
    handleSave(evt){
        this.doSave({action:'SAVE'})
    }

    doSave(todo){
        let record={};
        let result= this.save();
        if (result.isvalid) {
            record={...record,...result.obj};
            const stDateTime=new Date(record.Date+' '+record.StartTime);
            const eDateTime=new Date(record.Date+' '+record.EndTime);
            record.StartTime=stDateTime.toISOString();
            record.EndTime=eDateTime.toISOString();
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            var isWeekend = new Date(record.Date).getDay()%6==0;
            if (isWeekend) {
                this.showToast(WARNING_VARIANT,'VALIDATION ERROR', 'Please Select a weekday !!!');
            }else{
                
                if (record.StartTime<record.EndTime) {
                    this.handleCreateEntryApex(record,todo);
                }else{
                    console.warn('Start date must before end date');
                    this.showToast(WARNING_VARIANT,'VALIDATION ERROR', 'Start date must before end date');
                }

            }
            // this.callParent(SAVE_ACTION,record)
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

    buildInvoiceFields(){
        this.invoiceFields=[
            {
                label:this.l.StartDate,
                name:'RH_InvoiceDate__c',
                value:this.record?.RH_InvoiceDate__c
            },
            {
                label:this.l.EndDate,
                name:'RH_DueDate__c',
                value:this.record?.RH_DueDate__c
            },
            
            {
                label:this.l.po,
                name:'RH_Po__c',
                value:this.record?.RH_Po__c
            },
            
            {
                label:this.l.invoice_to,
                name:'Account',
                value:this.record?.RH_Account_Id__r.Name
            },
            
            {
                label:this.l.amount,
                name:'Amount',
                value:this.record?.RH_InvoiceItem_Sum__c
            },
            
        ];
    }
    buildEntryForm(){
        this.formEntry=[];
        const {beginDate, endDate}=this.dateInterval();
        const {beginTime, endTime}=this.timeInterval();
        this.formEntry=[
            {
                label:this.l.Date,
                placeholder:this.l.Date,
                name:'Date',
                required:true,
                value:this.formatDateValue(this.invoiceItem?.StartTime),
                min: beginDate,
                max: endDate,
                type:'Date',
                ly_md:'4', 
                ly_lg:'4',
                ly_xs:'12',
                isDatetime:true,
                isText:true,//for avoid render blank field
                readOnly:this.isEntryReadOnly
            },
            {
                label:this.l.startTime,
                placeholder:this.l.startTime,
                name:'StartTime',
                required:true,
                value:this.formatTime(this.invoiceItem?.StartTime),
                min: beginTime,
                max: endTime,
                type:'time',
                ly_md:'4', 
                ly_lg:'4',
                ly_xs:'6',
                isDatetime:true,
                isText:true,//for avoid render blank field
                readOnly:this.isEntryReadOnly
            },
            {
                label:this.l.endTime,
                placeholder:this.l.endTime,
                name:'EndTime',
                required:true,
                value: this.formatTime(this.invoiceItem?.EndTime),
                min: beginTime,
                max: endTime,
                type:'time',
                ly_md:'4', 
                ly_lg:'4',
                ly_xs:'6',
                isDatetime:true,
                isText:true,//for avoid render blank field
                readOnly:this.isEntryReadOnly
            },
            {
                label:this.l.Description,
                name:'Description',
                value: this.invoiceItem?.Description,
                placeholder:this.l.Description,
                className:'textarea',
                maxlength:25000,
                type:'textarea',
                ly_md:'12', 
                ly_lg:'12',
                ly_xs:'12',
                isTextarea:true,
                readOnly:this.isEntryReadOnly
            }
         
        
        ]
        let projetElt;
        if (this.isEntryReadOnly) {
            projetElt={
                label:'Activity',
                name:'ProjectId', 
                value: this.invoiceItem?.Project,
                required:true,
                maxlength:100,
                ly_md:'12', 
                ly_lg:'12',
                ly_xs:'12',
                isText:true,
                readOnly:this.isEntryReadOnly
            };
        }else{
            projetElt={
                label:'Activity',
                name:'ProjectId',
                picklist: true,
                options: this.myProjects,
                value: this.invoiceItem?.RH_Project__c,
                required:true,
                maxlength:100,
                ly_md:'12', 
                ly_lg:'12',
                ly_xs:'12',
                readOnly:this.isEntryReadOnly
            };
        }
        this.formEntry.unshift( projetElt );
    }
    lastHours(){
        const d =this.record?.StartDate ? new Date(this.record?.StartDate) : new Date();
        d.setUTCHours(this.END_OF_DAY, 0, 0, 0);
        console.log('Date END_OF_DAY ',d);
        console.log('Date END_OF_DAY GMT ',d.toISOString());
        return d.toISOString();
    }
    beginHours(){
        const d =this.record?.StartDate ? new Date(this.record?.StartDate) : new Date();
        d.setUTCHours(this.START_OF_DAY, 0, 0, 0);
        console.log('Date START_OF_DAY ',d);
        console.log('Date START_OF_DAY GMT ',d.toISOString());
        return d.toISOString();
    }
    formatDateValueOLD(dateIso){
        const d =dateIso ? new Date(dateIso) : (this.record?.StartDate ? new Date(this.record?.StartDate) : new Date());
        console.log('Date START_OF_DAY ',d);
        console.log('Date START_OF_DAY GMT ',d.toISOString());
        return d.toISOString();
    }

    lastDate(){
        const d =this.record?.EndDate ? new Date(this.record?.EndDate) : new Date();
        d.setUTCHours(this.END_OF_DAY, 0, 0, 0);
        console.log('Date END_OF_DAY ',d);
        console.log('Date END_OF_DAY GMT ',d.toISOString());
        return d.toISOString();
    }
    dateInterval(){
        let beginDate =this.record?.StartDate ? new Date(this.record?.StartDate) : new Date().toISOString();
        // let endDate =this.record?.EndDate ? new Date(this.record?.EndDate) : new Date();
        let endDate = new Date();// last date must e today
        console.log('***** dateInterval ');
        beginDate=beginDate.toISOString().split('T')[0];
        endDate=endDate.toISOString().split('T')[0];
        console.log('beginDate ',beginDate);
        console.log('endDate  ',endDate);

        return {beginDate, endDate};
    }
    timeInterval(){
        
        console.log('***** timeInterval ');
        const d =new Date();
        d.setUTCHours(this.START_OF_DAY, 0, 0, 0);
        const beginTime=this.formatTime(d);
        console.log('beginTime ',beginTime);
        d.setUTCHours(this.END_OF_DAY, 0, 0, 0);
        const endTime=this.formatTime(d);
        console.log('endTime ',endTime);

        return {beginTime, endTime};
    }
    formatDateValue(dateIso){
        const d =dateIso ? new Date(dateIso) : (this.record?.StartDate ? new Date(this.record?.StartDate) : new Date());
        console.log('Date formatDateValue new  ',d);
        console.log('Date START_OF_DAY GMT ',d.toISOString());
        return d.toISOString().split('T')[0];
    }
    formatTime(dateIso){
        const d =dateIso ? new Date(dateIso) : (this.record?.StartDate ? new Date(this.record?.StartDate) : new Date());
        console.log('Date formatTime new  ',d);
        const outTime=(d.getHours()+'').padStart(2, '0')+':'+(d.getMinutes()+'').padStart(2, '0');
        console.log('outTime ',outTime);
        return outTime;
    }
    /*
    lastHoursTime(){
        const d =this.record?.StartDate ? new Date(this.record?.StartDate) : new Date();
        d.setUTCHours(this.END_OF_DAY, 0, 0, 0);
        console.log('Date END_OF_DAY ',d);
        console.log('Date END_OF_DAY GMT ',d.toISOString());
        return d.toISOString().split('T')[1];
    }
    beginHoursTime(){
        const d =this.record?.StartDate ? new Date(this.record?.StartDate) : new Date();
        d.setUTCHours(this.START_OF_DAY, 0, 0, 0);
        console.log('Date START_OF_DAY ',d);
        console.log('Date START_OF_DAY GMT ',d.toISOString());
        return d.toISOString().split('T')[1];
    }*/
    /*formatDateValueTime(dateIso){
        const d =dateIso ? new Date(dateIso) : new Date();
        console.log('Date START_OF_DAY ',d);
        console.log('Date START_OF_DAY GMT ',d.toISOString());
        return d.toISOString().split('T')[1];
    }*/
    createAction(variant,label,name,title,iconName,className){ 
        return {
            variant, label, name, title, iconName,  class:className ,pclass :' slds-float_right'
        };
    }
    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
     }
     showToast(variant, title, message){
         fireEvent(this.pageRef, 'Toast', {variant, title, message});
     }
     
    ShowModal(show,text,actions,extra={}){
        fireEvent(this.pageRef, 'Modal', {show,text,actions,extra});
     }
}