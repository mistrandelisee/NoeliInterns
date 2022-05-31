import { LightningElement,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import { labels } from 'c/rh_label';

import getTimeSheets from '@salesforce/apex/RH_Timesheet_Controller.getTimeSheets';
import timeSheetCreation from '@salesforce/apex/RH_Timesheet_Controller.timeSheetCreation';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
const NEW_ACTION='New';
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
const SUBMIT_ACTION='inviato';
export default class Rh_timesheet extends NavigationMixin(LightningElement) {
    l={...labels,  }
    @track groups=[];
    @track timeSheets = [];
    recordId;
    userId;
    title;
    information;
    currUser={};

    keysFields={TimeSheetNumber:'ok'};
    keysLabels={
        TimeSheetNumber:'Name', TotalDurationInHours:'Total Duration In Hours',
        StartDate:'StartDate',TotalDurationInMinutes:'Total Duration In Minutes',StatusLabel:'Status',TimeSheetEntryCount:'Entries'
    };
    fieldsToShow={
         TotalDurationInHours:'',TimeSheetEntryCount:'',
        StartDate:'ok',TotalDurationInMinutes:'',StatusLabel:''
    };

    constants={};

    StatusActions=[


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
    ]
    detailsActions=[
        {   variant:"brand-outline",
            class:" slds-m-left_x-small",
            label:"New",
            name:NEW_ACTION,
            title:"New",
            iconName:"utility:add",
            // class:"active-item"
        }
    ]
    @wire(CurrentPageReference) pageRef;
    action='';
    get showNew(){ return this.isMine && (this.action=='' || this.action==NEW_ACTION || this.action==SAVE_ACTION); }
    get hideView(){  return this.action=='' || this.action!=NEW_ACTION; }
    get hasDetailsActions(){ return this.detailsActions?.length >0}
    get isAdmin() { return this.currUser?.isCEO || this.currUser?.isTLeader}
    get isApprover() { return this.isAdmin || this.currUser?.isApprover}
    get hasTimeSheets(){ return this.timeSheets.length >0; }
    get hasrecordid(){ return this.recordId?true:false; }
    connectedCallback(){
        // console.log(`RECORD ID`, this.recordId);
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        if (this.recordId) {
            console.log(`RECORD ID`, this.recordId);
        }else{
            this.userId = this.getUrlParamValue(window.location.href, 'uId');
            this.getTimesheets(this.userId);
        }
    }
    isMine;
    getTimesheets(){
        this.timeSheets=[];
        this.startSpinner(true);
        getTimeSheets({}).then(result =>{
            console.log('result @@@ + ' +(result));
            console.log(result);
            const self=this;
            if (!result.error && result.Ok) {
                this.constants=result.Constants;
                this.isMine=result.isMine;
                this.currUser={...result.currentContact,
                                isCEO:result.isCEO,
                                isRHUser:result.isRHUser,
                                isTLeader:result.isTLeader,
                                isBaseUser:result.isBaseUser,
                                isApprover:result.isApprover,
                }
                const isAD=this.isAdmin;
                this.timeSheets = result.TimeSheets.map(function (e ){
                    let item={...e};
                    item.title=e.TimeSheetNumber;
                    item.id=e.Id;
                    item.icon="standard:people";
                    item.class=e.Status;
                    
                    item.keysFields=self.keysFields;
                    item.keysLabels=self.keysLabels;
                    item.fieldsToShow=self.fieldsToShow;

                    let Actions=[];
                    //add status actions
                    /*
                    if (self.isMine) {
                        Actions=Actions.concat(self.buildUserStatusActions(e.Status));
                        Actions=Actions.concat(self.buildUserRoleActions(e.RHRolec));
                    }*/
                    if (ACTIVE_ACTION.toLowerCase() == e.Status?.toLowerCase()) {//if already submitted
                        if (self.isApprover) {
                            //add approve action 
                            Actions.push(self.createAction("base",self.l.Approve,APPROVE_ACTION,self.l.Approve,"utility:edit",'active-item'));
                        }
                    }
                    if (DRAFT_STATUS.toLowerCase() == e.Status?.toLowerCase()) {//if draft
                        if (self.isMine) {//is mine
                            //add SUBMIT_ACTION ,DELETE_ACTION  
                            if (e.TimeSheetEntryCount > 0) { //submit action avalaible only if has sheets
                                Actions.push(self.createAction("base",self.l.Submit,SUBMIT_ACTION,self.l.Submit,"utility:edit",'active-item'));
                            }
                            Actions.push(self.createAction("base",self.l.Delete,DELETE_ACTION,self.l.Delete,"utility:close",'active-item'));
                        }
                    }
                    

                    item.actions=Actions;
                    console.log(`item`);
                    console.log(item);
                    return item;
                });
                this.setviewsList(this.timeSheets)
            }else{
                this.showToast(WARNING_VARIANT,'ERROR', result.msg);
            }
        }).catch(e => {
            this.showToast(ERROR_VARIANT,'ERROR', e.message);
            console.error(e);
        })
        .finally(() => {
            this.startSpinner(false);
        })
    }

    handleDetailsActions(event){
        console.log('handleDetailsActions :', event.detail.action);
        if (event.detail.action==NEW_ACTION) {
            //call create new Timesheet then redirect to the timesheet
            console.log('call create new Timesheet then redirect to the timesheet');
            this.createTimesheetApex()
        }
         //   this.handleUserAction(record, FROM_PARENT);
    }
    createTimesheetApex(){
        this.startSpinner(true);
        timeSheetCreation()
          .then(result => {
            console.log('Result timeSheetCreation');
            console.log( result);

            if (!result.error && result.Ok) {
                this.goToTimeSheetDetail(result.Timesheet.Id);
            }else{
                this.showToast(WARNING_VARIANT,'ERROR', result.msg);
            }
          })
          .catch(e => {
            this.showToast(ERROR_VARIANT,'ERROR', e.message);
            console.error(e);
        })
        .finally(() => {
            this.startSpinner(false);
        });
    }
    setviewsList(items){
        let cardsView=this.template.querySelector('c-rh_cards_view');
        cardsView?.setDatas(items);
    }
    handleCardAction(event){
        console.log('event parent ' +JSON.stringify(event.detail));
        const info=event.detail;
        if (info?.extra?.isTitle) {
            this.goToTimeSheetDetail(info?.data?.id);
        }
        if (info?.action==CARD_ACTION) {//user clicks on the dropdown actions
            const record={Id:info?.data?.id, action:info?.extra?.item};
            this.handleUserAction(record, FROM_CHILD);
        }
    }
    handleUserAction(record,from=''){ 
        switch (record.action) {
            case DISABLE_ACTION:
                record.Status=this.constants.LWC_DISABLE_CONTACT_STATUS;
                //this.doUpdateStatus(record,from)
                break;
            case ACTIVE_ACTION:
                record.Status=this.constants.LWC_ACTIVE_CONTACT_STATUS;
                //this.doUpdateStatus(record,from)
                break;
            case FREEZE_ACTION:
                record.Status=this.constants.LWC_FREEZE_CONTACT_STATUS;
                //this.doUpdateStatus(record,from)
                break;
            case PROMOTE_ACTION:
                record.Role=this.constants.LWC_CONTACT_ROLE_TL;
                //this.doUpdateRole(record,from)
                break;
        
            default:
                break;
        }

    }

    getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
    }

    goToTimeSheetDetail(recordid) {
        var pagenname ='rhtimesheet'; //request page nam
        let states={'recordId': recordid}; //event.currentTarget.dataset.id , is the recordId of the request
        
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