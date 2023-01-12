import { api, LightningElement,track,wire } from 'lwc';
import { CurrentPageReference,NavigationMixin } from 'lightning/navigation';
import { registerListener,unregisterListener, unregisterAllListeners,fireEvent } from 'c/pubsub';

import getEventApex from '@salesforce/apex/RH_EventController.getEventDetails';
import sendEventApex from '@salesforce/apex/RH_EventController.sendEventApex';
import approvalEvent from '@salesforce/apex/RH_EventController.approvalEvent';
import deleteEventApex from '@salesforce/apex/RH_EventController.cancelEvent';


import { labels } from 'c/rh_label';
import { icons } from 'c/rh_icons';


const DELETE_ACTION='Delete';
const APPROVE_STATUS='Approved';
const REJECT_STATUS='Rejected';
const SUBMITTED_STATUS='Submitted';
const DRAFT_STATUS='Draft';

const OK_DELETE='OK_DELETE_EVENT';

const TITLE_LINK='title';
const OWNER_LINK='owner';
const APPROVER_LINK='Approver';
const LINK_ACTION='goToLink';
const USER_PAGENAME='rhusers';
const PAGENAME='Event'; 
const EDIT_ACTION='Edit';

const DRAFT='Draft';
const SUBMIT='Submitted';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';
const CANCEL_ACTION = 'Cancel';
const FROM_MODAL_OK_RESPONSE='positive';

export default class Rh_event_details extends NavigationMixin(LightningElement) {
    
    @api eventId;
    @api currentEvent;
    fromPage;
    @wire(CurrentPageReference) pageRef;
    
    action;
    icon={...icons};
    label={...labels};
    currUser={};
    headerActions=[];
    isMine=false;
    badge=[];
    mode='';
    approvalInputs=[];
    approvalLbl;
    approvalRecord={};
    actionRecord;
    eventDetails=[];
    get hasDetailsActions(){ return this.headerActions?.length >0}
    get hasInfo(){  return this.currentEvent?true:false; }
    get isAdmin() { return this.currUser?.isCEO || this.currUser?.isRHUser}
    get hasrecordid(){ return this.eventId?true:false; }

    get isApprover() { return this.isAdmin || this.currUser?.isApprover}

    get isApproved(){ return APPROVE_STATUS.toLowerCase() == this.currentEvent?.Status__c?.toLowerCase() ; }
    get isRejected(){ return REJECT_STATUS.toLowerCase() == this.currentEvent?.Status__c?.toLowerCase() ; }
    get isSubmitted(){ return SUBMITTED_STATUS.toLowerCase() ==this.currentEvent?.Status__c?.toLowerCase() ; }
    get isDraft(){ return DRAFT_STATUS.toLowerCase() ==this.currentEvent.Status__c?.toLowerCase() ; }
    get title(){ return this.currentEvent?.Name; }

    get isEditable(){return this.isDraft || this.isRejected}
    get isFinal(){return this.isApproved || this.isRejected}
    get isEntryReadOnly(){return !(this.isMine && this.isEditable)}

    get recordNotFounded(){ return this.label.recordNotFounded}

    get viewMode(){return this.mode!=EDIT_ACTION;}
    get editMode(){return this.mode==EDIT_ACTION;}
    get approval(){ return this.mode==APPROVE_STATUS || this.mode==REJECT_STATUS}

    connectedCallback() {
        const retUrl = this.getUrlParamValue(window.location.href, 'retURL');
        console.log('@@@@@ Id', this.recordId);
        if (retUrl) {
            this.fromPage=retUrl;
        }
		registerListener('ModalAction', this.doModalAction, this);
        this.getEventApex();
    }
    getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
    }
    doModalAction(event){
        console.log('doModalAction in user view ', JSON.stringify(event.action));
        switch (event.action) {
            case OK_DELETE:
                if(this.actionRecord?.Id){
                    this.deleteEvent(this.actionRecord);
                    this.actionRecord={};
                }
                
                break;

            default:
                this.actionRecord={}; 
                break;
        }
        this.ShowModal(false,null,[]);//close modal any way
        event.preventDefault();
    }
    deleteEvent(){
        this.startSpinner(true);
        deleteEventApex({ eventId: this.actionRecord?.Id })
        .then(result => {
            this.showToast(SUCCESS_VARIANT,this.label.successOp, this.label.EvenDeletionS);
            this.goToPage(this.fromPage || PAGENAME);
        })
        .catch(error => {
            console.error('error:', error);
            this.showToast(ERROR_VARIANT,'ERROR', (error?.body?.message|| error));
        })
        .finally(()=>{
            this.startSpinner(false);
        });
        
    }
    disconnectedCallback() {
        unregisterListener('ModalAction', this.doModalAction, this);
    }
    // recordNotFounded;
    getEventApex(){
        this.currentEvent={};
        this.startSpinner(true);
        console.log('RECORDID getEventApex ',this.eventId);
        getEventApex({ eventId: this.eventId })
          .then(result => {
            console.log('Result');
            console.log(result);
            if (!result.error && result.Ok) {
                this.isMine=result.isMine;
                this.currUser={...result.currentContact,
                                isCEO:result.isCEO,
                                isRHUser:result.isRHUser,
                                isTLeader:result.isTLeader,
                                isBaseUser:result.isBaseUser,
                                isApprover:result.isApprover,
                }
                this.currentEvent=result.Event;
                if (this.currentEvent?.Id) {
                    const elt=this.currentEvent;
                    const mapping=result.classMapping;
                    let st=(elt?.Status__c)? elt?.Status__c.toLowerCase():'';
                    let cx=mapping[st];
                    const badge={
                        name: 'evtBadge', 
                        class:cx? cx+' slds-float_left ' :self.classStyle(elt?.Status__c),
                        label: elt?.StatusLabel
                    }
                    //{name: 'userBadge', class: this.classStyle(this.currentEvent?.Status__c),label:this.currentEvent?.StatusLabel}
                    this.badge=[badge];
                    this.buildEventFields();
                    this.buildActions();
                }else{
                    // this.recordNotFounded=true;
                }
            }else{
                this.showToast(WARNING_VARIANT,this.label.warningOp, result.msg);
            }
          })
          .catch(error => {
            // this.recordNotFounded=true;
            this.showToast(ERROR_VARIANT,this.label.warningOp, error.message);
            console.error(error);
        })
        .finally(() => {
            this.startSpinner(false);
        });
    }
    getFiles(){ 
        let filesList=[],contentDocId,contentDocIdList=[],filesLists=[];
        getRelatedFilesByRecordId({recordId: eventId})
            .then(result=>{
                console.log('@@@ @@@ @@@ 1 result-->', result);
                filesList = result.data.map(elt =>{
                    var obj = {};
                    obj.label = elt.Name,
                    obj.value = elt.Name,
                    obj.fname = elt.Name,
                    obj.conVerId = elt.ContentVersionId,
                    obj.docId = elt.ContentDocumentId,
                    obj.url = elt.ContentDownloadUrl
                    return obj;
                })
                console.log('@@@ filesList @@@ ===> ',filesList);
                for(let i=0; i<this.filesList.length; i++){
                    contentDocId = filesList[i].docId;
                    contentDocIdList.push(filesList[i].docId);
                }
                
                console.log('@@@ contentDocId @@@ ===> ', contentDocIdList);
                let data_t =[];
                for(let key2 in result['data2']) {   
                    for(let key in result['data']) {
                        if(result['data'][key].ContentDocumentId == result['data2'][key2].Id){
                            data_t.push({Id:result['data2'][key2].Id, FileName: result['data2'][key2].Title, url: result['data'][key].ContentDownloadUrl});
                        }
                    }
                }
                filesLists = data_t;
                console.log('-->',filesLists);
            });
    
    }
    classStyle(status){
        switch(status){
            case APPROVE_STATUS:
                return "slds-float_left slds-theme_alt-inverse";
            case DRAFT_STATUS:
                return "slds-float_left slds-theme_info";
            case SUBMITTED_STATUS:
                return "slds-float_left slds-theme_warning";
            case REJECT_STATUS:
                return "slds-float_left slds-theme_error";
            default:
                return "slds-float_left slds-theme_info";
        }
    }

    buildEventFields(){
        this.eventDetails =[
            /*{
                label: this.label.Name, 
                name:'Name',
                type:'text',
                value:this.currentEvent?.Name,
            },*/
            {
                label:this.label.StartDate,
                name:'StartDate',
                type:'datetime',
                isDatetime:true,
                value:this.currentEvent?.Start_Dates__c,
            },
            {
                label:this.label.EndDate,
                name:'EndDate',
                type:'datetime',
                isDatetime:true,
                value:this.currentEvent?.End_Dates__c,
            },
        ];
        if (!this.isMine) {//current user doesn't owned the record
            this.eventDetails.push(
                {label:this.label.Owner,name:OWNER_LINK,value:this.currentEvent?.Contact_Id__r?.Name,
                    type:'Link',class:'Link',dataId:this.currentEvent?.CreatedBy?.Id /*link specifications*/
                }
            )
        }
        if (this.isFinal) { //the record is close for modification
            this.eventDetails.push(
                {label:this.label.Approver,name:APPROVER_LINK,value:this.currentEvent?.RH_Approver__r?.Name,
                    type:'Link',class:'Link',dataId:this.currentEvent?.RH_Approver__r?.RH_User__c /*link specifications*/},
            )
            if(this.currentEvent?.Message__c){
                this.eventDetails.push({label:this.label.Note,name:'Note',value:this.currentEvent?.Message__c },);
            }
        }
        this.eventDetails.push(
            {
                label: this.label.Description,
                name:'Description',
                type:'textarea',
                value:this.currentEvent.Description__c,
            }
        )
    }
    
    buildActions(){
        let Actions=[];
        
        if (this.isAdmin || (this.isMine&& this.isEditable)) {
            Actions.push(this.createAction("brand-outline",this.label.Delete,DELETE_ACTION,this.label.Delete,this.icon.Delete,'slds-m-left_x-small'));
        }
        if (this.isSubmitted ) {//if already submitted
            if (this.isApprover) {
                //add approve action 
                Actions.push(this.createAction("brand-outline",this.label.Share,APPROVE_STATUS,this.label.Share,this.icon.Share,'slds-m-left_x-small'));
                Actions.push(this.createAction("brand-outline",this.label.Reject,REJECT_STATUS,this.label.Reject,this.icon.reject,'slds-m-left_x-small'));
            }
        }
        if (this.isEditable) {//if draft or rejected
            if (this.isMine) {//is mine
                //add SUBMIT_ACTION ,EDIT_ACTION  
                Actions.push(this.createAction("brand-outline",this.label.Send,SUBMITTED_STATUS,this.label.Send,this.icon.submit,'slds-m-left_x-small'));
                Actions.push(this.createAction("brand-outline",this.label.Edit,EDIT_ACTION,this.label.Edit,this.icon.Edit,'slds-m-left_x-small'));
            }
        }
        console.log('Actions');
        console.log(Actions);
        this.headerActions=Actions;
    }
    handleHeaderActions(event){
        console.log('handleDetailsActions :', event.detail.action);
        const action= event.detail.action;
        const record={Id:this.eventId, action};
        switch (action) {

            case DELETE_ACTION:
                //this.goToPage('rhusers',{recordId:data?.recordId})
                this.actionRecord={...record}
                let text='';
                const Actions=[]
                const extra={style:'width:20vw;'};//
                text=this.label.PermissionDelete;
                extra.title=this.label.action_confirm;
                extra.style+='--lwc-colorBorder: var(--bannedColor);';
                Actions.push(this.createAction("brand-outline",this.label.ok_confirm,OK_DELETE,this.label.ok_confirm,this.icon.approve,'slds-m-left_x-small'));
                this.ShowModal(true,text,Actions,extra);
                break;

            case APPROVE_STATUS:
                //this.goToPage('rhusers',{recordId:data?.recordId})
                this.launchApproval(APPROVE_STATUS);
                break

            case REJECT_STATUS:
                //this.goToPage('rhusers',{recordId:data?.recordId})
                this.launchApproval(REJECT_STATUS);
                break;

            case SUBMITTED_STATUS:
                this.handleSend();
                //this.goToPage('rhusers',{recordId:data?.recordId})
                break

            case EDIT_ACTION:
                this.mode=EDIT_ACTION;
                //this.goToPage('rhusers',{recordId:data?.recordId})
                break;

        
            default:
                break;
        }
    }
    handleSend(){
        let record={Id:this.eventId,Status:SUBMIT,Name:this.currentEvent?.Name,Description:this.currentEvent?.Description__c,hasfile:false};
        this.startSpinner(true);
        sendEventApex({ objEven: JSON.stringify(record)})
        .then(result => {
            console.log('### result handleSaveApex----->', result);
            this.eventId =result.Id;
            console.log('result _evId---> ', this.eventId);
            this.showToast(SUCCESS_VARIANT,this.label.successOp, this.label.EvenSendSuccess);
            this.gotoDetail();
        })
        .catch(error => {
            console.error('error:', error);
            this.showToast(ERROR_VARIANT,'ERROR', (error?.body?.message|| error));
            
        })
        .finally(()=>{
            this.startSpinner(false);
        });
    }
    launchApproval(Status){
        //build approval form
         this.approvalInputs=[{
             label:this.label.Note,
             name:'Message',
             value: '',
             required:(Status==REJECT_STATUS),
             placeholder:this.label.NotePlc,
             className:'textarea',
             maxlength:25000,
             type:'textarea',
             ly_md:'12', 
             ly_lg:'12',
             ly_xs:'12',
             isTextarea:true
         }]
         this.approvalRecord={Id:this.eventId, Message:'',Status, approverId:this.currUser.Id,Name:this.currentEvent?.Name,Description:this.currentEvent?.Description__c,hasfile:false};
         this.mode=Status;//open form modal
         if(Status==APPROVE_STATUS){
             this.approvalLbl=this.label.Approve
         } else{
             this.approvalLbl=this.label.Reject
         }
    }
    handleNote(event){
        const info = event.detail;
        console.log(JSON.stringify(info));
        if (info.operation==FROM_MODAL_OK_RESPONSE) {//click on submit ..
            if (info.isvalid) {
                this.approvalRecord={...this.approvalRecord,...info.fields} ;
                this.doApporovalApex(this.approvalRecord);
            }
        }else{//cancel
            this.resetApproval();
        }
    }
    doApporovalApex(obj){
        this.startSpinner(true);
        approvalEvent({ eventJson:  JSON.stringify(obj) })
        .then(result => {
            this.showToast(SUCCESS_VARIANT,this.label.successOp,'');//, 'Action Done Successfully'
            this.resetApproval();

            //Refresh Page
            // this.reloadPage();
            this.gotoDetail();
        })
        .catch(error => {
            console.error('Error:', error);
            this.showToast(ERROR_VARIANT,this.label.warningOp, error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }
 
     
    resetApproval(){
        this.mode='';//close form modal
        this.approvalInputs=[];
        this.approvalRecord={};
    }

    handleUserAction(record,from=''){ 
        let text='';
        const Actions=[]
        const extra={style:'width:20vw;'};//
        switch (record.action) {
            case DISABLE_ACTION:
                record.Status=this.constants.LWC_DISABLE_CONTACT_STATUS;
                this.actionRecord=record;
                text=this.label.disable_confirm;
                extra.title=this.label.action_confirm;
                extra.style+='--lwc-colorBorder: var(--bannedColor);';
                // Actions.push(this.createAction("brand-outline",this.label.Cancel,'KO',this.label.Cancel,"utility:close",'slds-m-left_x-small'));
                Actions.push(this.createAction("brand-outline",this.label.ok_confirm,OK_DISABLE,this.label.ok_confirm,this.icon.check,'slds-m-left_x-small'));
                this.ShowModal(true,text,Actions,extra);
               
                // this.doUpdateStatus(record,from)
                break;
            case ACTIVE_ACTION:
                record.Status=this.constants.LWC_ACTIVE_CONTACT_STATUS;
                this.actionRecord=record;
                this.doUpdateStatus(record,from)
                break;
            /*case FREEZE_ACTION:
                record.Status=this.constants.LWC_FREEZE_CONTACT_STATUS;
                 text='Are you sure you want to freeze this User?';
                 extra.title='Confirm Freeze';
                 extra.style+='--lwc-colorBorder: var(--warningColor);';
                this.actionRecord=record;
                Actions.push(this.createAction("brand-outline",'Yes',OK_FREEZE,'Yes',"utility:close",'slds-m-left_x-small'));
                this.ShowModal(true,text,Actions,extra);
                break;*/
            case RESETPWD:
                // record.Status=this.constants.LWC_FREEZE_CONTACT_STATUS;
                    text=this.label.reset_confirm;
                    extra.title=this.label.action_confirm;
                    extra.style+='--lwc-colorBorder: var(--warningColor);';
                this.actionRecord=record;
                Actions.push(this.createAction("brand-outline",this.label.ok_confirm,RESETPWD,this.label.ok_confirm,this.icon.check,'slds-m-left_x-small'));
                this.ShowModal(true,text,Actions,extra);
                break;
            case PROMOTE_ACTION:
                record.Role=this.constants.LWC_CONTACT_ROLE_TL;
                this.actionRecord=record;
                this.doUpdateRole(record,from)
                break;
        
            default:
                break;
        }

    }
    handleEventDetails(event){
        let action=event.detail.action;
        console.log('>>>>>>>>>>>>>. action ',action);
        if (action==EDIT_ACTION) {
            // this.handleEdit();
        }else if(action=='goToLink'){
            const info = event.detail.info;
            let record={eltName:info.name,recordId:info.dataId}
            this.handleGoToLink(record);
        }
    }

    handleActionNew(event) {
        const data = event.detail;
        console.log('data >>', data, ' \n action ', data?.action);
        this.mode = data?.action;
    }

    handleRowAction( event ) {
        const actionName = event.detail.action.name;
        const rowId = event.detail.row.Id;
        console.log('rowId--> ' , rowId);
        console.log('actionName--> ' , actionName); 
        switch (actionName) {
            case 'DeleteFile':
                for(let i=0; i<this.contentDocIdList.length; i++){
                    if (rowId==this.contentDocIdList[i]){
                        this.contentDocId = rowId;
                        this.handleDeleteFile();
                    }
                }
                break;
            case 'Download':
                for(let key in this.filesLists){
                    if(this.filesLists[key].Id == rowId){
                        this.handleNavigate(this.filesLists[key].url);
                    }
                }
                break;
            default:
        }
    }
    handleNavigate(url) {
        const config = {
            type: 'standard__webPage',
            attributes: {
                url: url
            }
        };
        this[NavigationMixin.Navigate](config);
    }






    handleGoToLink(data){
        console.log(`handleGoToLink data `, JSON.stringify(data));
        this.startSpinner(false);
        switch (data?.eltName) {
            case OWNER_LINK:
                this.goToPage('rhusers',{recordId:data?.recordId})
                break;
            case APPROVER_LINK:
                this.goToPage('rhusers',{recordId:data?.recordId})
                break;
            case 'Group':
                this.goToPage('rhgroup',{recordId:data?.recordId})
                break;
        
            default:
                break;
        }
    }








    gotoDetail(){
        let states={'recordId': this.eventId};
        this.goToPage(PAGENAME,states);
    }

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