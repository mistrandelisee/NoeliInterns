import { LightningElement, wire, api, track } from 'lwc';
import getPicklistStatus from '@salesforce/apex/RH_EventController.getPicklistStatus';
import getLatestEvents from '@salesforce/apex/RH_EventController.getEventList';
import filterRequest from '@salesforce/apex/RH_EventController.filterRequest';
import getMyEvents from '@salesforce/apex/RH_EventController.getMyEvents';
import { CurrentPageReference,NavigationMixin } from 'lightning/navigation';
import { registerListener,unregisterListener, unregisterAllListeners,fireEvent } from 'c/pubsub';

import { icons } from 'c/rh_icons';
import { labels } from 'c/rh_label';

// const DRAFT='Draft';
// const SUBMIT='Submitted';
// const TeamLeader = 'Team Leader';
// const RhManager = 'RH Manager';
// const HumanResourceManagment = 'Human Resource Managment';
// const RoleCEO = 'CEO';
// const GroupLeader = 'Group Leader';

const CANCEL_ACTION = 'Cancel';
const SAVE_ACTION = 'Save';
const APPROVE_STATUS='Approved';
const REJECT_STATUS='Rejected';
const SUBMITTED_STATUS='Submitted';
const DRAFT_STATUS='Draft'; 
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';

export default class Rh_Event extends  NavigationMixin(LightningElement) {
    @wire(CurrentPageReference) pageRef;
    icon={...icons};
    label={...labels};

    Status=[];
    OrderBys=[];
    adds={
        areMine: true
    }
    statusSelected;

    showAttachement = false;
    showComponentBase = true;
    showComponentEdit = false;
    showComponentDetails = false;
    showModalDelete = false;
    showComponentDetailsWithoutAction = false;
    disable = false;
    isFile = false;
    bool = false;
    bool1 = false;
    isUpdate = false;
    hidenButton = true;
    displayButton = true;
    displayButton2 = false;
    updateSave = false;
    data0={};
    eventinformation = {};
    eventinformationEdite = {};
    messageOfUpdate;
    eventDetails;
    fileData;
    file;
    fileId;
    varStartTime;
    letEndTime;
    contentDocId;
    _evId;
    data_Event;
    evId_ForFile;
    state;
    error;
    resObj={};
    _eventData = {};
    strEventData;
    strUpdatEven;
    @api recordId;
    @api contactId;
    @api eventId;
    azerty=[];
    @track filterInputs=[];
    contentDocIdList = [];
    @track inputFormFilter = [];
    filesList =[];
    filesLists = [];
    @track datas = [];
    @track wiredEventList = [];
    @track inputsItems = [];
    StatusList =[];
    @track EventData = {
        Name:'',       
        Description:'',  
        StartDate:'', 
        EndDate:'',
        Status:'',
    };
    

    initialfilter={
        status:null,
        startDate:null,
        endDate:null,
        isActive:null,
        orderBy:null,
        orderOn:null,
    };
    // columns = [
    //     { label: this.label.FileName, fieldName: 'FileName', type: 'text', sortable: true },
    //     {
    //         label: this.label.DownloadAttachment,
    //         type: 'button-icon',
    //         typeAttributes: {
    //             name: 'Download',
    //             iconName: this.icon.Download,
    //             title: 'Download',
    //             variant: 'border-filled',
    //             alternativeText: 'Download'
    //         }
    //     },
    //     {
    //         label: this.label.DeleteFile,
    //         type: 'button-icon',
    //         typeAttributes: {
    //             name: 'DeleteFile',
    //             iconName: this.icon.DeleteFile,
    //             title: 'DeleteFile',
    //             variant: 'border-filled',
    //             alternativeText: 'DeleteFile'
    //         }
    //     },
    // ];
    wireEventList;
    /**Start Display Icons */
    @api
    title;
    @api
    iconsrc;
    filter = {
        searchText: null,
        status: null,
        startDate: null,
        endDate: null,
        orderBy: null,
        orderOn: null,
    }
    detailsActionsSave=[
        {   variant:"brand-outline",
            class:" slds-var-m-right_medium",
            label:this.label.New,
            name:this.label.New,
            title:"New",
            iconName:this.icon.Add,
        }
    ]


    keysFields={
        EventName:'Event Name',
        ContactName: 'Contact Name',
        Description: 'Description',
        StartDate: 'Start Date',
        EndDate: 'End Date',
        Status:'Status'
    };
    keysLabels={
        EventName: this.label.Name, 
        ContactName: this.label.ContactName,
        Description: this.label.Description,
        StartDate: this.label.StartDate,
        EndDate: this.label.EndDate,
        Status:this.label.Status
    };
    fieldsToShow={ 
        // EventName:'Event Name',
        // ContactName: 'Contact Name',
        Description: 'Description',
        StartDate: 'Start Date',
        EndDate: 'End Date',
        // Status:'Status'
    };

    hasRecords;

    get filterReady(){ 
        return this.hasRecords;
    }
    resetFilter(){
        this.filter = {
            searchText: null,
            status: null,
            startDate: null,
            endDate: null,
            orderBy: null,
            orderOn: null,
      }
  }

    handleClickOnPill(event){
        const info = event.detail;
        console.log('data >>', info, ' \n name ', info?.name);
        const name = info?.name;
        this.resetFilter()
        const  filter ={...this.filter}
        filter[name] = info?.data?.value;
        
        this.handleSearch(filter);
    }
    handleSubmitFilter(event) {
        const searchFilter = event.detail;
        console.log('handleSubmitFilter record', JSON.stringify(event.detail) );
        this.handleSearch(searchFilter);
    }
    
    handleSearch(record) {
        let status= (record.status)? [record.status]:null;
        record = {...record,status};
        console.log(`handleSubmitFilter record `, JSON.stringify(record));
        this.filter = {
            ... this.filter, ...record,
            orderOn: record.orderOn ? 'DESC' : 'ASC'
        };
        console.log(`handleSubmitFilter this.filter TO CALL `, JSON.stringify(this.filter));
        this.statusSelected=(status)? status[0]:this.statusSelected;
        this.getEvents();
    }
    getEvents(init=false) {
        console.log(`getMyEvents this.filter TO CALL `, JSON.stringify(this.filter));
        this.datas = [];
        this.startSpinner(true);
        getMyEvents({ filterTxt: JSON.stringify(this.filter) }).then(result => {
            console.log('result @@@ + ' + (result));
            console.log(result);
            const self = this;
            if (!result.error && result.Ok) {
                //this.constants = result.Constants;
                /*this.currUser = {
                    ...result.currentContact,
                    isCEO: result.isCEO,
                    isRHUser: result.isRHUser,
                    isTLeader: result.isTLeader,
                    isBaseUser: result.isBaseUser,
                }
                const isAD = this.isAdmin;*/
                this.datas = []
                if (init) {
                    this.hasRecords = (result.Events != null) && (result.Events?.length > 0);
                    
                }
                result.Events.forEach(function (elt) {
                    console.log('elt-->',elt);
                    let objetRep = {};
                    let str = elt.Description__c;
                    if(str?.length>30) str = str?.substring(0,30);
                    objetRep = {
                        "id" : elt.Id,
                        "EventName": elt.Name,
                        "ContactName": elt.Contact_Id__r?.Name,
                        "StartDate" : elt.Start_Dates__c?.split('T')[0],
                        "EndDate" : elt.End_Dates__c?.split('T')[0],
                        "Status" : elt.Status__c,
                        "Description" :  str,
        
                        icon:self.icon.Event, 
                        title: elt.Name,
                        class: elt.Status__c=='Approved'? 'frozen': elt.Status__c=='Submitted'? 'banned': 'active',
                        keysFields:self.keysFields,
                        keysLabels:self.keysLabels,
                        fieldsToShow:self.fieldsToShow,
                    }
                    console.log('@@@@@objectReturn', objetRep);
                    const mapping=result.classMapping;
                    let st=(elt?.Status__c)? elt?.Status__c.toLowerCase():'';
                    let cx=mapping[st];
                    const badge={
                        name: 'badge', 
                        class:cx? cx+' slds-float_left ' :self.classStyle(elt?.Status__c),
                        label: elt?.StatusLabel
                    }
                    console.log('@@@@@@@@  badge  --> ' , badge);
                    objetRep.addons={badge};
                    self.datas.push(objetRep);
                    /*
                        let item = { ...e };
                        item.title = e.LastName;
                        item.icon = "standard:people";
                        item.class = e.Status;

                        item.keysFields = self.keysFields;
                        item.keysLabels = self.keysLabels;
                        item.fieldsToShow = self.fieldsToShow;

                        let Actions = [];
                        //add status actions
                        if (isAD) {
                            Actions = Actions.concat(self.buildUserStatusActions(e.Status));
                            if ((self.constants.LWC_ACTIVE_CONTACT_STATUS?.toLowerCase() == e.Status?.toLowerCase())) {//
                                Actions = Actions.concat(self.buildUserRoleActions(e.RHRolec));
                            }
                        }


                        item.actions = Actions;
                        console.log(`item`);
                        console.log(item);
                        const badge = { name: 'badge', class: self.classStyle(e.Status), label: e.statusLabel }
                        item.addons = { badge };
                        if (isAD || (!isAD && (self.constants.LWC_ACTIVE_CONTACT_STATUS?.toLowerCase() == e.Status?.toLowerCase())))
                            self.allEmployees.push(item);
                   
                    */     
                });
                this.setviewsList( this.datas);
                /*this.currUser = {
                    ...result.currentContact,
                    isCEO: result.isCEO,
                    isRHUser: result.isRHUser,
                    isTLeader: result.isTLeader,
                    isBaseUser: result.isBaseUser,
                }*/
            } else {
                this.showToast(WARNING_VARIANT, 'ERROR', result.msg);
            }
        }).catch(e => {
            this.showToast(ERROR_VARIANT, 'ERROR', e.message);
            console.error(e);
        })
        .finally(() => {
            this.startSpinner(false);
        })
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

    getNewEventList(){
        this.datas=[];
        getLatestEvents()
        .then(result =>{
            console.log('@@wiredatas--> ' , result);
            const self=this;
            result.forEach(elt => {
            console.log('elt-->',elt);
            let objetRep = {};
            let str = elt.Description__c;
            if(str?.length>30) str = str?.substring(0,30);
            objetRep = {
                "id" : elt.Id,
                "EventName": elt.Name,
                "ContactName": elt.Contact_Id__r?.Name,
                "StartDate" : elt.Start_Dates__c?.split('T')[0],
                "EndDate" : elt.End_Dates__c?.split('T')[0],
                "Status" : elt.StatusLabel,
                "Description" :  str,

                icon: this.icon.user, 
                title: elt.Name,
                class: elt.Status__c=='Rejected'? 'banned': elt.Status__c=='Submitted'? 'frozen': 'active',
                keysFields:self.keysFields,
                keysLabels:self.keysLabels,
                fieldsToShow:self.fieldsToShow,
            }
            console.log('@@@@@objectReturn', objetRep);
            const badge={
                name: 'badge', 
                class:self.classStyle(elt?.Status__c),
                label: elt?.StatusLabel
            }
            console.log('@@@@@@@@  badge  --> ' , badge);
            objetRep.addons={badge};
            this.datas.push(objetRep);
            }); 
            this.setviewsList( this.datas);
            console.log('@@@@@@@@wiredatas--> ' , this.datas);
        })
    }
    setviewsList(items){
        let cardsView=this.template.querySelector('c-rh_cards_view');
        console.log('@@@@@@@@ cardsView--> ' , cardsView);
        cardsView?.setDatas(items);
    }
    callBlockAction(event){
        console.log('event parent ' +JSON.stringify(event.detail));
        const info=event.detail;
        if (info?.extra?.isTitle) {
            this.goToEventDetail(info?.data?.id);
        }
    }
    goToEventDetail(recordid) {
        var pagenname ='Event';
        let states={'recordId': recordid};
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }

    getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
    }

    connectedCallback(){
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        console.log('@@@@@ Id', this.recordId);
        if (this.recordId) {
            console.log('@@@ recordId--> ' , this.recordId);
            // this.handleOpenComponent();
            this.showComponentBase = false;
            this.showComponentDetails=true;//to remove
            // this.getEventDetails(this.recordId);
        }else{
            this.initFilter();
            this.getEvents(true);
        }
        // this.initDefault();
    }

    handleResetFilter(event) {
        this.getNewEventList();
    }
    initFilter() {
        getPicklistStatus()
            .then(result => {
                console.log('@@@ result-->', result);
                this.StatusList = result;
                console.log('StatusList-->', this.StatusList);
                // this.buildFilter();
                this.buildFormFilter();
            })
            .catch(err => {
                console.error('error',err);
            });
    }
    buildFormFilter(){
        this.inputFormFilter=[
            {
                label: this.label.Name,
                placeholder: this.label.SearchByName,
                name:'name',
                type: 'text',
                required:false,
                ly_md:'3', 
                ly_lg:'3'
            },
            {
                label:this.label.Status,
                placeholder: this.label.Status,
                name:'status',
                picklist: true,
                options: this.StatusList,
                ly_md:'3', 
                ly_lg:'3'
            },
            {
                label:this.label.From,
                placeholder:this.label.From,
                name:'From',
                required:false,
                type: 'Date',
                ly_md: '3',
                ly_lg: '3',
            },
            {
                label:this.label.To,
                placeholder:this.label.To,
                name:'To',
                required:false,
                type: 'Date',
                ly_md: '3',
                ly_lg: '3',
            }];
    }
    handleSubmitFilterx(event) {
        this.datas=[];
        let searchText = event.detail.name;
        let name= event.detail.name;
        let status= event.detail.status;
        let startDate= event.detail.startDate;
        let endDate = event.detail.EndDate;
        console.log('handleSubmitFilter record', JSON.stringify(event.detail) );
        this.startSpinner(true);
        filterRequest({searchText:searchText,name:name,status:status,startDate:startDate,endDate:endDate})
        .then(result =>{
            console.log('@@@  result --> ', result );
            const self=this;
            result.forEach(elt => {
            console.log('elt-->',elt);
            let objetRep = {};
            let str = elt.Description__c;
            if(str?.length>30) str = str?.substring(0,30);
            objetRep = {
                "id" : elt.Id,
                "EventName": elt.Name,
                "ContactName": elt.Contact_Id__r?.Name,
                "StartDate" : elt.Start_Dates__c?.split('T')[0],
                "EndDate" : elt.End_Dates__c?.split('T')[0],
                "Status" : elt.StatusLabel,
                "Description" :  str,

                icon: this.icon.user, 
                title: elt.Name,
                class: elt.Status__c=='Rejected'? 'banned': elt.Status__c=='Submitted'? 'frozen': 'active',
                keysFields:self.keysFields,
                keysLabels:self.keysLabels,
                fieldsToShow:self.fieldsToShow,
            }
            console.log('@@@@@objectReturn', objetRep);
            const badge={
                name: 'badge', 
                class:self.classStyle(elt?.Status__c),
                label: elt?.StatusLabel
            }
            console.log('@@@@@@@@  badge  --> ' , badge);
            objetRep.addons={badge};
            this.datas.push(objetRep);
            }); 
            this.setviewsList( this.datas);
            console.log('@@@@@@@@wiredatas--> ' , this.datas);
        }).catch(error => {
            console.error('Error:', error);
        }).finally(() => {
           this.startSpinner(false)
        });
    }

    closeComponentEdit(){
        this.showComponentBase = true;
        this.showComponentDetails = false;
        this.showComponentEdit = false;
        // this.showAttachement = false;
        // this.isUpdate = false;
    }

    
    closeComponentUpdate(){
        this.showComponentDetails = true;
        this.showComponentBase = false;
        this.showComponentEdit = false;
        // this.isUpdate = false;
    }
    handleOpenComponentSave(event){
        if (event.detail.action==this.label.New) {
            this.showComponentEdit = true;
            // this.buildform();
            // this.isUpdate = false;
            this.showComponentBase = false;
            // this.showAttachement = false;
        }
    }
    
    
    handleActionNew(event) {
        const data = event.detail;
        console.log('data >>', data, ' \n action ', data?.action);
        this.action = data?.action;

        switch (data?.action) {

            case CANCEL_ACTION:
                
                break;

            case SAVE_ACTION:

                break;
            default:
                break;
        }


    }
    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
    }
    showToast(variant, title, message){
         fireEvent(this.pageRef, 'Toast', {variant, title, message});
    }
}