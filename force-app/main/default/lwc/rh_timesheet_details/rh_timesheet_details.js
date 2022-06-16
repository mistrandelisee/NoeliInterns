import { api, LightningElement,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import { labels } from 'c/rh_label';
import { icons } from 'c/rh_icons';

import getTimeSheet from '@salesforce/apex/RH_Timesheet_Controller.getTimeSheet';
import initConfig from '@salesforce/apex/RH_Timesheet_Controller.InitEntryCreation';
import timeSheetEntryCreation from '@salesforce/apex/RH_Timesheet_Controller.timeSheetEntryCreation';
import submitTimeSheet from '@salesforce/apex/RH_Timesheet_Controller.submitTimeSheet';
import approvalTimesheet from '@salesforce/apex/RH_Timesheet_Controller.approvalTimesheet';
import deleteTimeSheet from '@salesforce/apex/RH_Timesheet_Controller.deleteTimeSheet';
import deleteTimeSheetEntry from '@salesforce/apex/RH_Timesheet_Controller.deleteTimeSheetEntry';
import generatedPDF from '@salesforce/apex/RH_Timesheet_Controller.generatedPDF';


import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
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
export default class Rh_timesheet_details extends NavigationMixin(LightningElement)  {
    END_OF_DAY=20;//GMT
    START_OF_DAY=8;//GMT
    l={...labels,
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
        Activity:'Activity',
        Duration_mins:'Duration (Minutes)',
        total_dur_mins:"Total Duration In Minutes",
        total_free_dur_mins:"Total Free Duration In Minutes",
        total_work_dur_mins:"Total Working Duration In Minutes",
        total_dur_h:"Total Duration In Hours",
        total_free_dur_h:"Total Free Duration In Hours",
        total_work_dur_h:"Total Working Duration In Hours",
    }
    icon={...icons}
    detailsActions=[
    ]
    @api
    recordId;
    record;
    timeSheetFields=[];
    timesheetEntries=[];
    sheetNotFounded;
    pdfExport;
    currUser={};
    isMine=false;
    action='';
    sheetItem={};
    formEntry=[];
    myProjects=[];
    sectionExpanded=true;
    keysFields={TimeSheetNumber:'ok',Project:''};
    keysLabels={
        /**startTime
endTime
Activity
Duration_mins */
        Project:this.l.Activity, 
        EndTimeF:this.l.endTime,
        DurationInMinutes:this.l.Duration_mins,
        StartTimeF:this.l.startTime,
    };
    fieldsToShow={
        Project:'',DurationInMinutes:'',
        StartTimeF:'ok',EndTimeF:'',
    };

    @track columns = [
        { label: 'Name', fieldName: 'title',sortable:true, type: 'button',typeAttributes:{label:{fieldName:'title'},variant:'base'} },
        { label: this.l.Activity, fieldName: 'Project',sortable:true, type: 'text' },
        { label: this.l.Duration_mins, fieldName: 'DurationInMinutes',sortable:true, type: 'text',cellAttributes: { alignment: 'left' }, },
        { label: this.l.startTime, fieldName: 'StartTime',sortable:true, type: "date", typeAttributes:{
            weekday: "long", year: "numeric",
            month: "long", day: "2-digit",
            hour: "2-digit", minute: "2-digit"
        } },
        { label: this.l.endTime, fieldName: 'EndTime',sortable:true, type: "date",
        typeAttributes:{
            weekday: "long", year: "numeric",
            month: "long", day: "2-digit",
            hour: "2-digit", minute: "2-digit"
        } },
    ];
    SheetItemsCols = [
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
    get hasSheetInfo(){  return this.record?true:false; }
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
        console.log('RECORDID connectedCallback ',this.recordId);
       this.getTimsheetApex();
    }
    get title(){ return this.record?.RH_Name__c}
    getTimsheetApex(){
        this.record={};
        this.startSpinner(true);
        console.log('RECORDID getTimsheetApex ',this.recordId);
        getTimeSheet({ timesheetId: this.recordId })
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

                this.record=result.TimeSheet;
                if (this.record?.Id) {
                    const timesheetEntries= result.TimeSheet?.TimeSheetEntries || [];
                    /** @type {TotalDurationInMinutes
TotalDurationInHours
RH_Total_Free_Duration_Minutes__c
RH_Total_Free_Duration_Hours__c}*/
                    this.record.totalWorkingHours= (this.record.TotalDurationInHours || 0) - (this.record.RH_Total_Free_Duration_Hours__c || 0) ;
                    this.record.totalWorkingMinutes= (this.record.TotalDurationInMinutes || 0) - (this.record.RH_Total_Free_Duration_Minutes__c || 0) ;
                    if (this.isEditable && this.isMine) {//if draft
                        this.columns=[...this.columns,
                         { type: 'action', typeAttributes: { rowActions: actions } },]
                    }   

                    this.buildTimeSheetFields();
                    this.buildActions();
                    this.buildEntriesList(timesheetEntries);
                }else{
                    this.sheetNotFounded=true;
                }
            }else{
                this.showToast(WARNING_VARIANT,'ERROR', result.msg);
            }
          })
          .catch(error => {
            this.sheetNotFounded=true;
            this.showToast(ERROR_VARIANT,'ERROR', error.message);
            console.error(error);
        })
        .finally(() => {
            this.startSpinner(false);
        });
    }
    buildEntriesList(TimeSheetEntries){
        const self=this;
        this.timesheetEntries=TimeSheetEntries.map(function (e ){
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
            item.keysFields=self.keysFields;
            item.keysLabels=self.keysLabels;
            item.fieldsToShow=self.fieldsToShow;
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
        // this.setviewsList(this.timesheetEntries)
        this.refreshTable(this.timesheetEntries)
    }
    setviewsList(items){
        let cardsView=this.template.querySelector('c-rh_cards_view');
        cardsView?.setDatas(items);
    }
    handleDataTableAction( event ) {
        const info=event.detail;
        // const actionName = event.detail.action.name;
        console.log('event from datatable ' +JSON.stringify(info));
        this.sheetItem=info.row;
        if (info?.action?.label?.fieldName=='title') {

            this.handleEditTimeSheetEntry();
            //this.goToTimeSheetDetail(info?.data?.id);
            //TO DO Build Details and show it in edit panel
        }
        if (info?.action?.name) {//user clicks on the dropdown actions
            const record={Id:this.sheetItem?.Id, action:info?.action?.name};
            switch (record.action) {
                case EDIT_ACTION:
                    this.handleEditTimeSheetEntry();
                    break;
                case DELETE_ACTION:
                    this.handleDeleteTimeSheetEntry();
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
        if (this.isSubmitted ) {//if already submitted
            if (this.isApprover) {
                //add approve action 
                Actions.push(this.createAction("brand-outline",this.l.Approve,APPROVE_ACTION,this.l.Approve,this.icon.approve,'slds-m-left_x-small'));
                Actions.push(this.createAction("brand-outline",this.l.Reject,REJECT_ACTION,this.l.Reject,this.icon.reject,'slds-m-left_x-small'));
            }
            Actions.push(this.createAction("brand-outline",this.l.ExportPDF,EXPORT_ACTION_PDF,this.l.ExportPDF,this.icon.exportPdf,'slds-m-left_x-small'));
            Actions.push(this.createAction("brand-outline",this.l.ExportXLS,EXPORT_ACTION_XLS,this.l.ExportXLS,this.icon.exportXls,'slds-m-left_x-small'));
        }
        if (this.isFinal) { //export
            Actions.push(this.createAction("brand-outline",this.l.ExportPDF,EXPORT_ACTION_PDF,this.l.ExportPDF,this.icon.exportPdf,'slds-m-left_x-small'));
            Actions.push(this.createAction("brand-outline",this.l.ExportXLS,EXPORT_ACTION_XLS,this.l.ExportXLS,this.icon.exportXls,'slds-m-left_x-small'));
        }
        if (this.isEditable) {//if draft or rejected
            if (this.isMine) {//is mine
                //add SUBMIT_ACTION ,DELETE_ACTION  
                
                if (this.record.TimeSheetEntryCount > 0) { //submit action avalaible only if has sheets
                    Actions.push(this.createAction("brand-outline",this.l.Submit,SUBMIT_ACTION,this.l.Submit,this.icon.submit,'slds-m-left_x-small'));
                }
                Actions.push(this.createAction("brand-outline",this.l.Delete,DELETE_ACTION,this.l.Delete,this.icon.Delete,'slds-m-left_x-small'));
                // Actions.push(this.createAction("brand-outline",this.l.Edit,EDIT_ACTION,this.l.Edit,"utility:edit",'slds-m-left_x-small'));
                Actions.push(this.createAction("brand-outline",this.l.AddLines,ADD_LINE_ACTION,this.l.AddLines,this.icon.Add,'slds-m-left_x-small'));
            }
        }
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
            case APPROVE_ACTION:
                this.handleApprovalTimeSheet(APPROVE_ACTION);
                break;
            case REJECT_ACTION:
                this.handleApprovalTimeSheet(REJECT_ACTION);
                break;
            case SUBMIT_ACTION:
                this.handleSubmitTimeSheet();
                break;
            case DELETE_ACTION:
                this.handleDeleteTimeSheet();
                break;
            case ADD_LINE_ACTION:
                this.sheetItem={};
                this.initEntryAction();
                break;
            case EXPORT_ACTION_PDF:
                this.handleExportTimeSheet();
                break;
            case EXPORT_ACTION_XLS:
                this.handleExportXLSTimeSheet();
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
    doApporoval(obj){
        this.startSpinner(true);
        approvalTimesheet({ SheetJson:  JSON.stringify(obj) })
          .then(result => {
            console.log('Result', result);
            if (!result.error && result.Ok) {
                this.showToast(SUCCESS_VARIANT,'SUCCES', 'Action Done Successfully');
                this.resetApproval();

                //Refresh Page
                this.reloadPage();
            }else{
                this.showToast(WARNING_VARIANT,'ERROR', result.msg);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            this.showToast(ERROR_VARIANT,'ERROR', error);
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
    handleApprovalTimeSheet(status){
       
        this.approvalInputs=[{
            label:this.l.Note,
            name:'note',
            value: '',
            required:(status==REJECT_ACTION),
            placeholder:this.l.NotePlc,
            className:'textarea',
            maxlength:25000,
            type:'textarea',
            ly_md:'12', 
            ly_lg:'12',
            ly_xs:'12',
            isTextarea:true
        }]
        this.approvalRecord={Id:this.recordId, note:'',status, approverId:this.currUser.Id};
        this.action=status;//open modal
        if(status==APPROVE_ACTION){
            this.approvalLbl=this.l.Approve
        } else{
            this.approvalLbl=this.l.Reject
        }
    }

    /*Generated PDF Functions*/
    handleExportTimeSheet(){
        debugger
        this.startSpinner(true);
        generatedPDF({listId:this.recordId})
            .then(result =>{
                console.log(result)
                this.saveFile(result);
                this.startSpinner(false);   
            }).catch(error => {
                console.error('Error:', error);
                this.showToast(ERROR_VARIANT,'ERROR', error);
            })
    }
    /*Generated PDF Functions*/
     handleExportXLSTimeSheet(){
        const HeaderTemplate=[{value: 'Sheet Informations', wrap: true, fontWeight: 'bold'}];
        const HeaderItemsTemplate=[{value: 'Sheet Items', wrap: true, fontWeight: 'bold'}];
        const divider=[];
        let exporter=this.template.querySelector('c-rh_export_excel');
        const sheetObj=exporter.buildRows(this.SheetCols,[this.record]);
        const sheetItemsObj=exporter.buildRows(this.SheetItemsCols,this.timesheetEntries);

        const allRows =[HeaderTemplate,...sheetObj.rows,divider,HeaderItemsTemplate,...sheetItemsObj.rows] 
        const maxCols= sheetObj.columns?.length >=sheetItemsObj.columns?.length ? sheetObj.columns   :  sheetItemsObj.columns;
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
    handleDeleteTimeSheet(){
        this.startSpinner(true);
        deleteTimeSheet({ timesheetId:  this.recordId })
          .then(result => {
            console.log('Result', result);
            if (!result.error && result.Ok) {
                //GO BACK TO PARENT
                this.goToPage('rhtimesheet');
            }else{
                this.showToast(WARNING_VARIANT,'ERROR', result.msg);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            this.showToast(ERROR_VARIANT,'ERROR', error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }
    handleSubmitTimeSheet(){
        this.startSpinner(true);
        submitTimeSheet({ timesheetId:  this.recordId })
          .then(result => {
            console.log('Result', result);
            if (!result.error && result.Ok) {
                //Refresh Page
                this.reloadPage();
            }else{
                this.showToast(WARNING_VARIANT,'ERROR', result.msg);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            this.showToast(ERROR_VARIANT,'ERROR', error);
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
    
    handleDeleteTimeSheetEntry(){
        this.startSpinner(true);
        
        deleteTimeSheetEntry({ timesheetEntryId:this.sheetItem?.Id })
          .then(result => {
            console.log('Result', result);
            if (!result.error && result.Ok) {
                //Refresh Page
                this.reloadPage();
            }else{
                this.showToast(WARNING_VARIANT,'ERROR', result.msg);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            this.showToast(ERROR_VARIANT,'ERROR', error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }
    handleUpadateTimeSheetEntry(){

    }
    handleEditTimeSheetEntry(){
        if (this.isEntryReadOnly) {//view mode
            this.launchViewEntry();
        }else{
            this.initEntryAction();
        }
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
        
        initConfig()
          .then(result => {
            console.log('Result INIT CONF');
            console.log(result);
            if (!result.error && result.Ok) {
                this.myProjects=[];
                this.myProjects = this.myProjects.concat(result.freeActivities?.map(function(project) { return {label:project.Name,value:project.Id}}));
                this.myProjects =this.myProjects.concat( result.Projects?.map(function(project) { return {label:project.RH_Project__r?.Name,value:project.RH_Project__c}}));
                this.myProjects = this.myProjects.concat(result.ProjectsLeaded?.map(function(project) { return {label:project.Name,value:project.Id}}));
                const item={...this.sheetItem};
                item.RH_Project__c= (this.sheetItem?.RH_Project__c) ? this.sheetItem?.RH_Project__c : 
                                                                     (   this.myProjects?.length==1 ? this.myProjects[0].value : '');
                this.sheetItem=item;
                this.launchViewEntry();
                // this.callParent(this.action,{});
            }else{
                this.showToast(WARNING_VARIANT,'ERROR', result.msg);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            this.showToast(ERROR_VARIANT,'ERROR', error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }
    handleCreateEntryApexFinishOK(result){
        this.reloadPage();

    }
    handleCreateEntryApex(obj){
        this.startSpinner(true);
        obj.TimeSheetId=this.recordId;
        obj.Id=this.sheetItem?.Id;
        timeSheetEntryCreation({ entryJson: JSON.stringify(obj) })
          .then(result => {
            console.log('Result', result);
            if (!result.error && result.Ok) {
                this.handleCreateEntryApexFinishOK(result);
            }else{
                this.showToast(WARNING_VARIANT,'ERROR', result.msg);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            this.showToast(ERROR_VARIANT,'ERROR', error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }
    handleCardAction(event){
        console.log('event parent ' +JSON.stringify(event.detail));
        const info=event.detail;
        this.sheetItem=info.data;
        if (info?.extra?.isTitle) {

            this.handleEditTimeSheetEntry();
            //this.goToTimeSheetDetail(info?.data?.id);
            //TO DO Build Details and show it in edit panel
        }
        if (info?.action==CARD_ACTION) {//user clicks on the dropdown actions
            const record={Id:info?.data?.id, action:info?.extra?.item};
            switch (record.action) {
                case EDIT_ACTION:
                    this.handleEditTimeSheetEntry();
                    break;
                case DELETE_ACTION:
                    this.handleDeleteTimeSheetEntry();
                    break;
                default:
                    break;
            }
        }
    }
    reloadPage(){
        // window.location.reload()
        this.goToPage('rhtimesheet',{recordId:this.recordId})
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
    handleSave(evt){
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
                    this.handleCreateEntryApex(record);
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

    buildTimeSheetFields(){
        this.timeSheetFields=[
            /*{
                label:'Name',
                name:'Name',
                value:this.record?.TimeSheetNumber
            },*/
            
            {
                label:this.l.StartDate,
                name:'StartDate',
                value:this.record?.StartDate
            },
            
            {
                label:this.l.EndDate,
                name:'EndDate',
                value:this.record?.EndDate
            },
            {
                label:this.l.Status,
                name:'Status',
                value:this.record?.StatusLabel
            },
            
            {
                label:this.l.total_dur_mins,
                name:'TotalDurationInMinutes',
                value:this.record?.TotalDurationInMinutes
            },
            
            {
                label:this.l.total_free_dur_mins,
                name:'TotalDurationInMinutes',
                value:this.record?.RH_Total_Free_Duration_Minutes__c
            },
            
            {
                label:this.l.total_work_dur_mins,
                name:'TotalDurationInMinutes',
                value:this.record?.totalWorkingMinutes
            },
            {
                label:this.l.total_dur_h,
                name:'TotalDurationInHours',
                value:this.record?.TotalDurationInHours
            },
            {
                label:this.l.total_free_dur_h,
                name:'TotalDurationInHours',
                value:this.record?.RH_Total_Free_Duration_Hours__c
            },
            {
                label:this.l.total_work_dur_h,
                name:'TotalDurationInHours',
                value:this.record?.totalWorkingHours
            }
            
            


         
        
        ];
        if (!this.isMine) {
            this.timeSheetFields.push(
                {
                    label:'Owner',
                    name:'Owner',
                    value:this.record?.Owner?.Name,
                    type:'Link',
                    class:'Link',
                    dataId:this.record?.OwnerId
                }
            )
        }
        if (this.isFinal) {
            this.timeSheetFields.push(
                {
                    label:'Approver',
                    name:'Approver',
                    value:this.record?.RH_Approver__r?.Name,
                    type:'Link',
                    class:'Link',
                    dataId:this.RH_Approver__r?.RH_User__c
                },
                {
                    label:this.l.Note,
                    name:'Note',
                    value:this.record?.RH_NoteApprover__c
                }
            )
        }
    }
    buildEntryFormOLD(){
        this.formEntry=[];
        const endTime=this.lastHours();
        const startTime=this.beginHours();
       /* const endTimex=this.lastHoursTime();
        const startTimex=this.beginHoursTime();*/
        this.formEntry=[
            
            {
                label:this.l.StartDate,
                placeholder:this.l.StartDate,
                name:'StartTime',
                required:true,
                // value: this.sheetItem?.StartTime,
                value:this.formatDateValue(this.sheetItem?.StartTime),
                // min: startTime,
                // max: endTime,
                type:'Datetime',
                ly_md:'6', 
                ly_lg:'6',
                ly_xs:'12',
                isDatetime:true,
                isText:true,//for avoid render blank field
                readOnly:this.isEntryReadOnly
            },
            {
                label:this.l.EndDate,
                placeholder:this.l.EndDate,
                name:'EndTime',
                required:true,
                // value: this.sheetItem?.EndTime,
                value: this.formatDateValue(this.sheetItem?.EndTime),
                // min: startTime,
                // max: endTime,
                type:'Datetime',
                ly_md:'6', 
                ly_lg:'6',
                ly_xs:'12',
                isDatetime:true,
                isText:true,//for avoid render blank field
                readOnly:this.isEntryReadOnly
            },
            {
                label:this.l.Description,
                name:'Description',
                value: this.sheetItem?.Description,
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
                value: this.sheetItem?.Project,
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
                value: this.sheetItem?.RH_Project__c,
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
                value:this.formatDateValue(this.sheetItem?.StartTime),
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
                value:this.formatTime(this.sheetItem?.StartTime),
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
                value: this.formatTime(this.sheetItem?.EndTime),
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
                value: this.sheetItem?.Description,
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
                value: this.sheetItem?.Project,
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
                value: this.sheetItem?.RH_Project__c,
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
        let endDate =this.record?.EndDate ? new Date(this.record?.EndDate) : new Date();
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
}