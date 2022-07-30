import { LightningElement,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';

import { registerListener,unregisterListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
import { labels } from 'c/rh_label';
import { icons } from 'c/rh_icons';

import initConfig from '@salesforce/apex/RH_Timesheet_Controller.InitFilter';
import getTimeSheets from '@salesforce/apex/RH_Timesheet_Controller.getTimeSheets';
// import timeSheetCreation from '@salesforce/apex/RH_Timesheet_Controller.timeSheetCreation';
import submitTimeSheet from '@salesforce/apex/RH_Timesheet_Controller.submitTimeSheet';
import deleteTimeSheet from '@salesforce/apex/RH_Timesheet_Controller.deleteTimeSheet';


const NEW_ACTION='New';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';
const SAVE_ACTION='Save';
const CARD_ACTION='stateAction';
const FROM_CHILD='FROM_CHILD';
const DRAFT_STATUS='nuovo';
const DELETE_ACTION='Delete';
const SUBMIT_ACTION='inviato';
const OK_DELETE='OK_DELETE_SHT';
const ASC='ASC';
const DESC='DESC';
const PAGENAME ='rhtimesheet'

export default class Rh_timesheet extends NavigationMixin(LightningElement) {
    /**
     * Author: @EM
     * Reviewed #1 24-06-2022  @EM OK -ready to deploy
     */
   
    l={...labels, 
        
    }
    icon={...icons}
    @track timeSheets = [];
    recordId;
    userId;
    currUser={};
    isMine;
    actionRecord={}
    sheetsReady;
    Status=[];
    OrderBys=[];
    @track filterInputs=[];
    constants={};
    keysFields={TimeSheetNumber:'ok'};//not used
    keysLabels={
        StartDate:this.l.StartDate,EndDate:this.l.EndDate,
        StatusLabel:this.l.Status,
        TimeSheetEntryCount:this.l.Entries
    };
    fieldsToShow={
        StartDate:'',EndDate:'',
        TimeSheetEntryCount:'',
    };

    filter={
        status:null,
        startDate:null,
        endDate:null,
        isActive:null,
        orderBy:null,
        orderOn:null,
    };

    
    detailsActions=[
        {   variant:"brand-outline",
            class:" slds-m-left_x-small",
            label:this.l.New,
            name:NEW_ACTION,
            title:this.l.New,
            iconName:this.icon.Add,
            // class:"active-item"
        }
    ]
    @wire(CurrentPageReference) pageRef;
    action='';
    get showNew(){ return this.isMine && (this.action=='' || this.action==NEW_ACTION || this.action==SAVE_ACTION); }
    get showList(){  return this.action=='' || this.action!=NEW_ACTION; }
    get hasDetailsActions(){ return this.detailsActions?.length >0}
    get filterReady(){ return this.filterInputs?.length >0}
    get isAdmin() { return this.currUser?.isCEO || this.currUser?.isTLeader}
    get isApprover() { return this.isAdmin || this.currUser?.isApprover}
    get hasTimeSheets(){ return this.timeSheets.length >0; }
    get hasrecordid(){ return this.recordId?true:false; }
    
    
    connectedCallback(){
        registerListener('ModalAction', this.doModalAction, this);
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        if (this.recordId) {
            console.log(`RECORD ID`, this.recordId);
        }else{
            this.userId = this.getUrlParamValue(window.location.href, 'uId');
            this.initFilter();
            this.getTimesheets();//this.filter, this.userId
        }
    }
    
    initFilter(){
        // this.startSpinner(true)
        initConfig()
          .then(result => {
            console.log('Result INIT FILTER ');
            console.log(result);
            if (!result.error && result.Ok) {
                this.Status = result.Picklists?.Status;
                this.OrderBys = result.OrderBys;
                this.Status.unshift({
                    label:this.l.selectPlc,value:''
                });
                this.buildFilter();
            }else{
                this.showToast(WARNING_VARIANT,this.l.warningOp, result.msg);
            }
          })
          .catch(error => {
            console.error('Error in calling :', error);
        }).finally(() => {
            // this.startSpinner(false)
        });
    }


    handleSubmitFilter(event){
        const record=event.detail;
        this.filter={... this.filter ,...record ,
                    orderOn: record.orderOn ? DESC : ASC};
        this.getTimesheets();
    }

    getTimesheets(){
        this.timeSheets=[];
        this.startSpinner(true);
        getTimeSheets({     filterTxt:JSON.stringify(this.filter),
                            userId:this.userId})
        .then(result =>{
            this.sheetsReady=true;
            console.log('getTimesheets result ');
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
                    item.title=e.RH_Name__c;
                    item.id=e.Id;
                    item.icon=self.icon.timesheet;
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
                    const badge={name: 'timesheetBadge', class:self.classStyle(e.Status),label: e.StatusLabel}
                    item.addons={badge};
                    if (DRAFT_STATUS.toLowerCase() == e.Status?.toLowerCase()) {//if draft
                        if (self.isMine) {//is mine
                            //add SUBMIT_ACTION ,DELETE_ACTION  
                            if (e.TimeSheetEntryCount > 0) { //submit action avalaible only if has sheets
                                // Actions.push(self.createAction("base",self.l.Submit,SUBMIT_ACTION,self.l.Submit,"utility:edit",'active-item')); // remove
                            }
                            Actions.push(self.createAction("base",self.l.Delete,DELETE_ACTION,self.l.Delete,self.icon.Delete,'active-item'));
                        }
                    }
                    

                    item.actions=Actions;
                    console.log(`item`);
                    console.log(item);
                    return item;
                });
                this.setviewsList(this.timeSheets)
            }else{
                this.showToast(WARNING_VARIANT,this.l.warningOp, result.msg);
            }
        }).catch(e => {
            this.showToast(ERROR_VARIANT,this.l.errorOp, e.message);
            console.error(e);
        })
        .finally(() => {
           
            this.startSpinner(false);
        })
    }
    classStyle(className){

        switch(className){
            case 'approvato':
                return "slds-float_left slds-theme_success";
            case 'nuovo':
                return "slds-float_left slds-theme_info";
            case 'inviato':
                return "slds-float_left slds-theme_shade";
            case 'reject':
                return "slds-float_left slds-theme_error";
            default:
                return "slds-float_left slds-theme_alt-inverse";
        }

    }
    handleNewCreation(event){
        console.log('handleNewCreation :', event.detail.action);
        if (event.detail.action=='cancel') {
            this.openCreation=false;
        }
    }
    handleDetailsActions(event){
        console.log('handleDetailsActions :', event.detail.action);
        if (event.detail.action==NEW_ACTION) {
            //call create new Timesheet then redirect to the timesheet
            console.log('call create new Timesheet then redirect to the timesheet');
            // this.createTimesheetApex()
            this.opentimesheetCreation();
        }
        
    }
    openCreation=false;
    opentimesheetCreation(){
        this.openCreation=true;
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
                this.showToast(WARNING_VARIANT,this.l.warningOp, result.msg);
            }
          })
          .catch(e => {
            this.showToast(ERROR_VARIANT,this.l.errorOp, e.message);
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
            this.handleSheetAction(record, FROM_CHILD);
        }
    }
    handleSheetAction(record,from=''){ 
        switch (record.action) {
            case SUBMIT_ACTION:
                record.Status=this.constants.LWC_DISABLE_CONTACT_STATUS;
                //this.doUpdateStatus(record,from)
                break;
            case DELETE_ACTION:
                this.actionRecord={Id:record.Id}
                // this.handleDeleteTimeSheet(); //launch confirmation modal
                let text='';
                const Actions=[]
                const extra={style:'width:20vw;'};//
                text=this.l.delete_sheet_confirm;
                extra.title=this.l.action_confirm;
                extra.style+='--lwc-colorBorder: var(--bannedColor);';
                // Actions.push(this.createAction("brand-outline",this.l.Cancel,'KO',this.l.Cancel,"utility:close",'slds-m-left_x-small'));
                Actions.push(this.createAction("brand-outline",this.l.ok_confirm,OK_DELETE,this.l.ok_confirm,this.icon.approve,'slds-m-left_x-small'));
                this.ShowModal(true,text,Actions,extra);
                break;
            
        
            default:
                break;
        }

    }
    doModalAction(event){
        console.log('doModalAction in user view ', JSON.stringify(event.action));
        switch (event.action) {
            case OK_DELETE://delete timesheet
                if(this.actionRecord?.Id){
                    this.handleDeleteTimeSheet();
                    this.actionRecord=null;
                }
                break;
            
            default:
                this.actionRecord=null;
                this.sheetItem=null;
                break;
        }
        this.ShowModal(false,null,[]);//close modal any way
        // event.preventDefault();
    }
    handleDeleteTimeSheet(){
        this.startSpinner(true);
        deleteTimeSheet({ timesheetId:  this.actionRecord?.Id })
          .then(result => {
            console.log('Result', result);
            if (!result.error && result.Ok) {
                this.showToast(SUCCESS_VARIANT,this.l.successOp,  this.l.succesDelete);
                this.goToPage(PAGENAME);//to refresh the page
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
    
    handleSubmitTimeSheet(){
        this.startSpinner(true);
        submitTimeSheet({ timesheetId:  this.recordId })
          .then(result => {
            console.log('Result', result);
            if (!result.error && result.Ok) {
                //Refresh Page
                this.showToast(SUCCESS_VARIANT,this.l.successOp,  '');//this.l.succesDelete
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


    goToTimeSheetDetail(recordid) {
        let states={'recordId': recordid}; 
        this.goToPage(PAGENAME,states);
    }
    goToPage(pagenname,statesx={}) {
        let states=statesx; 
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }

    buildFilter(){
        this.filterInputs =[
            {
                label:this.l.Status,
                name:'status',
                picklist: true,
                options: this.Status,
                value: '',
                ly_md:'3',
                ly_xs:'12',  
                ly_lg:'3'
            },
            {
                label:this.l.From,
                placeholder:this.l.From,
                name:'startDate',
                value: '',
                type:'Date',
                ly_md:'3', 
                ly_xs:'6', 
                ly_lg:'3',
            },
            {
                label:this.l.To,
                placeholder:this.l.To,
                name:'EndDate',
                value: '',
                type:'Date',
                ly_md:'3', 
                ly_xs:'6', 
                ly_lg:'3',
            },
            {
                label:this.l.OrderBy,
                name:'orderBy',
                picklist: true,
                options: this.OrderBys,
                value: 'CreatedDate',
                ly_md:'3',
                ly_xs:'12',  
                ly_lg:'3'
            },
            {
                label:this.l.OrderOn,
                name:'orderOn',
                checked:true,
                type:'toggle',
                toggleActiveText:DESC,
                toggleInactiveText:ASC,
                ly_md:'6', 
                ly_lg:'6'
            }   
        ];
    }
    
    disconnectedCallback() {
        unregisterListener('ModalAction', this.doModalAction, this);
    }
    createAction(variant,label,name,title,iconName,className){ 
        return {
            variant, label, name, title, iconName,  class:className ,pclass :' slds-float_right'
        };
    }
    getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
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