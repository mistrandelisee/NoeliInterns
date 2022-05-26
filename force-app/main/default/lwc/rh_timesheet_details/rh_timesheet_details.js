import { api, LightningElement,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import { labels } from 'c/rh_label';

import getTimeSheet from '@salesforce/apex/RH_Timesheet_Controller.getTimeSheet';
import initConfig from '@salesforce/apex/RH_Timesheet_Controller.InitEntryCreation';
import timeSheetEntryCreation from '@salesforce/apex/RH_Timesheet_Controller.timeSheetEntryCreation';
import submitTimeSheet from '@salesforce/apex/RH_Timesheet_Controller.submitTimeSheet';
import deleteTimeSheet from '@salesforce/apex/RH_Timesheet_Controller.deleteTimeSheet';
import deleteTimeSheetEntry from '@salesforce/apex/RH_Timesheet_Controller.deleteTimeSheetEntry';
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
const DRAFT_STATUS='nuovo';
const DELETE_ACTION='Delete';
const ADD_LINE_ACTION='ADD_LINE_ACTION';
const SUBMIT_ACTION='inviato';
export default class Rh_timesheet_details extends NavigationMixin(LightningElement)  {
    END_OF_DAY=20;//19h
    START_OF_DAY=8;//19h
    l={...labels,
        Submit:'Submit',
        Delete:'Delete',
        Approve:'Approve',
        AddLines:'Add Items',
    }
    /*StatusActions=[


        {
            variant:"base",
            label:this.l.Activate,
            name:ACTIVE_ACTION,
            title:this.l.Activate,
            iconName:"utility:user",
            class:"active-item"
        },
        {
            variant:"base",
            label:this.l.Freeze,
            name:FREEZE_ACTION,
            title:this.l.Freeze,
            iconName:"utility:resource_absence",
            class:"freeze-item"
        },
        {
            variant:"base",
            label:this.l.Disable,
            name:DISABLE_ACTION,
            title:this.l.Disable,
            iconName:"utility:block_visitor",
            class:"disable-item "
        }

    ]
    RoleActions=[
        {
            variant:"base",
            label:this.l.PromoteBaseUser,
            name:PROMOTE_ACTION,
            title:this.l.PromoteBaseUser,
            iconName:"utility:user",
            // class:"active-item"
        }
    ]*/
    detailsActions=[
    ]
    @api
    recordId;
    record;
    timeSheetFields=[];
    timesheetEntries=[];
    sheetNotFounded;
    currUser={};
    isMine=false;
    action='';
    sheetItem={};
    formEntry=[];
    myProjects=[];
    sectionExpanded=true;
    keysFields={TimeSheetNumber:'ok',Project:''};
    keysLabels={
        Project:'Project', 
        EndTimeF:'End Time',
        DurationInMinutes:'Duration',
        StartTimeF:'StaFrt Time'
    };
    fieldsToShow={
        Project:'',DurationInMinutes:'',
        StartTimeF:'ok',EndTimeF:'',
    };
    @wire(CurrentPageReference) pageRef;
    get hasDetailsActions(){ return this.detailsActions?.length >0}
    get newLineMode(){ return this.action==ADD_LINE_ACTION}
    get hasSheetInfo(){  return this.record?true:false; }
    get isAdmin() { return this.currUser?.isCEO || this.currUser?.isTLeader}
    get isApprover() { return this.isAdmin || this.currUser?.isApprover}
    get isEntryReadOnly(){
        return !(this.isMine && DRAFT_STATUS.toLowerCase() == this.record?.Status?.toLowerCase())
    }

    get lineIcon(){ return (this.isEntryReadOnly) ?'':'utility:edit' }
    get lineTitle(){ return (this.isEntryReadOnly) ?'Line details':'Create Line'}
    get iconName(){
        return (!this.sectionExpanded)? 'utility:chevrondown' : 'utility:chevronup'
    }
    toggleView(){
        this.sectionExpanded=!this.sectionExpanded;
    }
    connectedCallback(){
        console.log('RECORDID connectedCallback ',this.recordId);
       this.getTimsheetApex();
    }
    get title(){ return this.record?.TimeSheetNumber}
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
            item.icon="standard:people";
            item.class=e.Status;
            item.Project=e.RH_Project__r.Name;
            if (e.StartTime) {
                item.StartTimeF= new Date(e.StartTime).toLocaleTimeString() ;
            }
            if (e.EndTime) {
                item.EndTimeF= new Date(e.EndTime).toLocaleTimeString() ;
            }
            item.Project=e.RH_Project__r.Name;
            item.keysFields=self.keysFields;
            item.keysLabels=self.keysLabels;
            item.fieldsToShow=self.fieldsToShow;
            let Actions=[];
            //add status actions
            
            if (DRAFT_STATUS.toLowerCase() == self.record?.Status?.toLowerCase()) {//if draft
                if (self.isMine) {//is mine
                    //add DELETE_ACTION  
                    Actions.push(self.createAction("base",self.l.Edit,EDIT_ACTION,self.l.Edit,"utility:edit",'active-item'));
                    Actions.push(self.createAction("base",self.l.Delete,DELETE_ACTION,self.l.Delete,"utility:close",'active-item'));
                }
            }
            

            item.actions=Actions;
            console.log(`item`);
            console.log(item);
            return item;
        });
        this.setviewsList(this.timesheetEntries)
    }
    setviewsList(items){
        let cardsView=this.template.querySelector('c-rh_cards_view');
        cardsView?.setDatas(items);
    }
    buildActions(){
        let Actions=[];
        if (ACTIVE_ACTION.toLowerCase() == this.record.Status?.toLowerCase()) {//if already submitted
            if (this.isApprover) {
                //add approve action 
                Actions.push(this.createAction("brand-outline",this.l.Approve,APPROVE_ACTION,this.l.Approve,"utility:edit",'slds-m-left_x-small'));
            }
        }
        if (DRAFT_STATUS.toLowerCase() == this.record.Status?.toLowerCase()) {//if draft
            if (this.isMine) {//is mine
                //add SUBMIT_ACTION ,DELETE_ACTION  
                
                if (this.record.TimeSheetEntryCount > 0) { //submit action avalaible only if has sheets
                    Actions.push(this.createAction("brand-outline",this.l.Submit,SUBMIT_ACTION,this.l.Submit,"utility:edit",'slds-m-left_x-small'));
                }
                Actions.push(this.createAction("brand-outline",this.l.Delete,DELETE_ACTION,this.l.Delete,"utility:close",'slds-m-left_x-small'));
                // Actions.push(this.createAction("brand-outline",this.l.Edit,EDIT_ACTION,this.l.Edit,"utility:edit",'slds-m-left_x-small'));
                Actions.push(this.createAction("brand-outline",this.l.AddLines,ADD_LINE_ACTION,this.l.AddLines,"utility:add",'slds-m-left_x-small'));
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
            if (data?.eltName=='Owner') {
                this.goToPage('rhusers',{recordId:data?.info?.dataId})
            }
        }
    }
    handleDetailsActions(event){
        console.log('handleDetailsActions :', event.detail.action);
        const action=event.detail.action;
        switch (action) {
            case APPROVE_ACTION:
                
                break;
            case SUBMIT_ACTION:
                this.handleSubmitTimeSheet()
                break;
            case DELETE_ACTION:
                this.handleDeleteTimeSheet();
                break;
            case ADD_LINE_ACTION:
                this.sheetItem={};
                this.initEntryAction();
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
        this.toggleView();
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
                this.myProjects = result.Projects?.map(function(project) { return {label:project.RH_Project__r?.Name,value:project.RH_Project__c}});
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
        window.location.reload()
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
                label:'Status',
                name:'Status',
                value:this.record?.StatusLabel
            },
            
            {
                label:"Total Duration In Minutes",
                name:'TotalDurationInMinutes',
                value:this.record?.TotalDurationInMinutes
            },
            {
                label:"Total Duration In Hours",
                name:'TotalDurationInHours',
                value:this.record?.TotalDurationInHours
            },
            {
                label:'Date',
                name:'StartDate',
                value:this.record?.StartDate
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
    }
    buildEntryForm(){
        this.formEntry=[];
        const endTime=this.lastHours();
        const startTime=this.beginHours();
        this.formEntry=[
            /**
             * {
                label:'Task',
                name:'Task',
                picklist: true,
                options: this.myTasks,
                value: '',
                maxlength:100,
                ly_md:'12', 
                ly_lg:'12'
            },
             */
            {
                label:this.l.StartDate,
                placeholder:this.l.StartDate,
                name:'StartTime',
                required:true,
                value: this.sheetItem?.StartTime,
                min: startTime,
                max: endTime,
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
                value: this.sheetItem?.EndTime,
                min: startTime,
                max: endTime,
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
                label:'Project',
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
                label:'Project',
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
        const d = new Date();
        d.setUTCHours(this.END_OF_DAY, 0, 0, 0);
        console.log('Date END_OF_DAY ',d);
        console.log('Date END_OF_DAY GMT ',d.toISOString());
        return d.toISOString();
    }
    beginHours(){
        const d = new Date();
        d.setUTCHours(this.START_OF_DAY, 0, 0, 0);
        console.log('Date START_OF_DAY ',d);
        console.log('Date START_OF_DAY GMT ',d.toISOString());
        return d.toISOString();
    }
    createAction(variant,label,name,title,iconName,className){ 
        return {
            variant, label, name, title, iconName,  class:className
        };
    }
    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
     }
     showToast(variant, title, message){
         fireEvent(this.pageRef, 'Toast', {variant, title, message});
     }
}