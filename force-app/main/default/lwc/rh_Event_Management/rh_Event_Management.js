import { LightningElement, wire, api, track } from 'lwc';


import { CurrentPageReference,NavigationMixin } from 'lightning/navigation';
import { registerListener,unregisterListener, unregisterAllListeners,fireEvent } from 'c/pubsub';

import getMyEventManager from '@salesforce/apex/RH_EventController.getMyEventManager';
import getPicklistStatus from '@salesforce/apex/RH_EventController.getPicklistStatus';
import getOtherEvents from '@salesforce/apex/RH_EventController.getOtherEvents';

import { icons } from 'c/rh_icons';
import { labels } from 'c/rh_label';


const DELETE_ACTION='Delete';
const APPROVE_STATUS='Approved';
const REJECT_STATUS='Rejected';
const SUBMITTED_STATUS='Submitted';
const DRAFT_STATUS='Draft'; 
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';

const PAGE_NAME='event-management';

export default class rh_Event_Management extends  NavigationMixin(LightningElement) {
    @wire(CurrentPageReference) pageRef;
    l={...labels,
        //searchText:null,
        /*Name: 'Name',
        srchNamePlc: 'Search by name',
        From:'From',
        To:'To',
        OrderBy:'sort By',
        selectPlc:'Select an option',*/
        };
    icon={...icons};
    label={...labels};
    
    adds={
        areMine: false
    }
    statusSelected;

    showComponentBase = true;
    showComponentDetailsForBaseUser = false;
    showComponentDetails = false;
    visibleReject = false;
    visibleDelete = false
    displayButton = false;
    displayButtonCEO = false;
    showModalDelete = false;
    isApproved = false;
    @track filterInputs=[];
    @track visibleDatas = [];
    idUser;
    contactid;
    IdBaseUser = [];
    EventInfo = {};
    EventInfos = {};

    eventinformation = {};
    eventinformationEdite = {};
    eventDetails;
    @api recordId;
    @api eventId;
    filesList =[];
    filesLists = [];
    @track datas = [];
    filter = {
        searchText: null,
        status: null,
        startDate: null,
        endDate: null,
        orderBy: null,
        orderOn: null,
    }

    columns = [
        { label: this.label.FileName, fieldName: 'FileName', type: 'text', sortable: true },
        {
            label: this.label.DownloadAttachment,
            type: 'button-icon',
            typeAttributes: {
                name: 'Download',
                iconName: this.icon.Download,
                title: 'Download',
                variant: 'border-filled',
                alternativeText: 'Download'
            }
        },
    ];

    /**Start Display Icons */
    @api title;
    @api iconsrc;
    initDefault(){
        this.title=this.title || 'User Informations';
        this.iconsrc= this.iconsrc || this.icon.user;
    }
    /**End Display Icons*/

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
        ContactName: this.label.Owner,
        Description: this.label.Description,
        StartDate: this.label.StartDate,
        EndDate: this.label.EndDate,
        Status: this.label.Status
    };
    fieldsToShow={ 
        // EventName:'Event Name',
        ContactName: 'Contact Name',
        StartDate: 'Start Date',
        EndDate: 'End Date',
        Description: 'Description',
        // Status:'Status'
    };
    
    hasRecords;

    get filterReady(){ 
        return this.hasRecords;
    }
    connectedCallback(){
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        console.log('@@@@@ Id', this.recordId);
        if (this.recordId) {
            console.log('@@@ recordId--> ' , this.recordId);
            this.goToEventDetail(this.recordId);
        }else{
            this.initFilter();
            this.getEvents(true);
        }
    }
    getEvents(init=false) {
        console.log(`getEvents this.filter TO CALL `, JSON.stringify(this.filter));
        this.datas = [];
        this.startSpinner(true);
        getOtherEvents({ filterTxt: JSON.stringify(this.filter) }).then(result => {
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
                    // const badge={
                    //     name: 'badge', 
                    //     class:self.classStyle(elt?.Status__c),
                    //     label: elt?.StatusLabel
                    // }
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
        var pagenname ='Event'; //request page nam
        let states={'recordId': recordid,retURL:PAGE_NAME}; //event.currentTarget.dataset.id , is the recordId of the request
        
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
        console.log(`handleSearch record `, JSON.stringify(record));
        this.filter = {
            ... this.filter, ...record,
            orderOn: record.orderOn ? 'DESC' : 'ASC'
        };
        console.log(`handleSearch this.filter TO CALL `, JSON.stringify(this.filter));
        this.statusSelected=(status)? status[0]:this.statusSelected;
        this.getEvents();
    }
    /*handleSubmitFilter(event) {
        console.log('handleSubmitFilter record', JSON.stringify(event.detail) );
        let status= (event.detail.status)? [event.detail.status]:null;
        const record = {...event.detail,status};
        console.log(`handleSubmitFilter record `, JSON.stringify(record));
        this.filter = {
            ... this.filter, ...record,
            orderOn: record.orderOn ? 'DESC' : 'ASC'
        };
        console.log(`handleSubmitFilter this.filter TO CALL `, JSON.stringify(this.filter));
       
        this.getEvents();
    }*/
    handleResetFilter(event) {
        this.getEvents();
    }
    initFilter() {
        getPicklistStatus()
            .then(result => {
                console.log('@@@ result-->', result);
                this.StatusList = result;
                console.log('StatusList-->', this.StatusList);
                this.buildFilter();
            })
            .catch(err => {
                console.error('error',err);
            });
    }
    buildFilter(){
        console.log('### StatusList-->', this.StatusList);
        this.filterInputs=[
            {
                label:this.label.Name,
                placeholder:this.l.srchNamePlc,
                name:'searchText',
                value: '',
                ly_md:'3', 
                ly_xs:'6', 
                ly_lg:'3'
            }];
            
            this.filterInputs =[...this.filterInputs,
            {
                label:this.label.Status,
                name:'status',
            
                picklist: true,
                options: this.StatusList,
                value: '',
                ly_md:'3',
                ly_xs:'6',  
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
         
        
        ];
    }
    
    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
    }
    showToast(variant, title, message){
         fireEvent(this.pageRef, 'Toast', {variant, title, message});
    }
    
}