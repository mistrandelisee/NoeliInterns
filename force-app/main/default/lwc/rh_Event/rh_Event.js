import { LightningElement, wire, api, track } from 'lwc';
import getRelatedFilesByRecordId from '@salesforce/apex/RH_EventController.getRelatedFilesByRecordId';
import saveEvenWithoutStatus from '@salesforce/apex/RH_EventController.saveEvenWithoutStatus';
import getEventEditeByCreatedById from '@salesforce/apex/RH_EventController.getUserInfoId';
import updateAndSendEven from '@salesforce/apex/RH_EventController.updateAndSendEven'; 
import getPicklistStatus from '@salesforce/apex/RH_EventController.getPicklistStatus';
import saveAndSendEvent from '@salesforce/apex/RH_EventController.saveAndSendEvent';
import getLatestEvents from '@salesforce/apex/RH_EventController.getEventList';
import filterRequest from '@salesforce/apex/RH_EventController.filterRequest';
import saveEventApex from '@salesforce/apex/RH_EventController.saveEventApex';
import sendNotif from '@salesforce/apex/RH_EventController.sendNotifications';
import getEventEdite from '@salesforce/apex/RH_EventController.getEventEdite';
import getIdUserCEO from '@salesforce/apex/RH_EventController.getIdUserCEO';
// import createEvent from '@salesforce/apex/RH_EventController.createEvent';
import checkStatus from '@salesforce/apex/RH_EventController.checkStatus';
import deleteEvent from '@salesforce/apex/RH_EventController.deleteEvent';
import updateEven from '@salesforce/apex/RH_EventController.updateEven';
import uploadFile from '@salesforce/apex/RH_EventController.uploadFile';
import deleteFile from '@salesforce/apex/RH_EventController.deleteFile';
import sendEvent from '@salesforce/apex/RH_EventController.sendEvent';
import saveEven from '@salesforce/apex/RH_EventController.saveEvent';
import getEvent from '@salesforce/apex/RH_EventController.getEvent';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation'; 

import { icons } from 'c/rh_icons';
import { labels } from 'c/rh_label';

const DRAFT='Draft';
const SUBMIT='Submitted';
const TeamLeader = 'Team Leader';
const RhManager = 'RH Manager';
const HumanResourceManagment = 'Human Resource Managment';
const RoleCEO = 'CEO';
const GroupLeader = 'Group Leader';
export default class Rh_Event extends  NavigationMixin(LightningElement) {
    icon={...icons};
    label={...labels};

    Status=[];
    OrderBys=[];

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
    filter={
        status:null,
        startDate:null,
        endDate:null,
        isActive:null,
        orderBy:null,
        orderOn:null,
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
        {
            label: this.label.DeleteFile,
            type: 'button-icon',
            typeAttributes: {
                name: 'DeleteFile',
                iconName: this.icon.DeleteFile,
                title: 'DeleteFile',
                variant: 'border-filled',
                alternativeText: 'DeleteFile'
            }
        },
    ];
    wireEventList;
    /**Start Display Icons */
    @api
    title;
    @api
    iconsrc;
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
    get filterReady(){ return this.inputFormFilter?.length >0}
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
    classStyle(className){

        switch(className){ 
            case 'Submitted': 
                return "slds-float_left slds-theme_warning"; 
            case 'Draft': 
                return "slds-float_left slds-theme_alt-inverse"; 
            case 'Rejected': 
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
            this.handleOpenComponent();
            this.getEventDetails(this.recordId);
        }else{
            this.getNewEventList();
        }
        this.optionsStatus();
        this.initDefault();
    }

    handleResetFilter(event) {
        this.getNewEventList();
    }
    optionsStatus() {
        getPicklistStatus()
            .then(result => {
                console.log('@@@ result-->', result);
                this.StatusList = result;
                console.log('StatusList-->', this.StatusList);
                this.buildFilter();
                this.buildFormFilter();
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
    buildFormFilter(){
        this.inputFormFilter=[
            {
                label: this.label.Name,
                placeholder: this.label.SearchByName,
                type: 'Test',
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
    handleSubmitFilter(event) {
        this.datas=[];
        let name= event.detail.searchText;
        let status= event.detail.status;
        let startDate= event.detail.startDate;
        let endDate = event.detail.EndDate;
        console.log('handleSubmitFilter record', JSON.stringify(event.detail) );
        this.startSpinner(true);
        filterRequest({name:name,status:status,startDate:startDate,endDate:endDate})
        .then(result =>{
            console.log('@@@result --> ', result );
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

    senNotification(evId){
        console.log('@@senNotification User evId --> ' , evId);
        getIdUserCEO({})
        .then(result =>{
            console.log('@@senNotification User data --> ' , result);
            for(let i=0; i<result.length; i++){
                console.log('@@@ All IDUSER --> ' , result[i].Id);
                console.log('@@@ UserRole.Name --> ' , result[i].UserRole.Name);
                if(result[i].UserRole.Name==RoleCEO || result[i].UserRole.Name==HumanResourceManagment  
                                                    || result[i].UserRole.Name==RhManager 
                                                    || result[i].UserRole.Name==TeamLeader 
                                                    || result[i].UserRole.Name==GroupLeader){

                    console.log('@@@ IDUSER CEO --> ' , result[i].Id);
                    let name = this.data_Event[0].Name;
                    let desc = this.data_Event[0].Description__c;
                    console.log('@@@ status || desc --> ' , name +' || '+ desc);
                    sendNotif({strBody:desc, pgRefId:evId, strTargetId:result[i].Id, strTitle:name, setUserIds:result[i].Id})
                        .then(result =>{
                            if (result?.error) {
                                console.error(result?.msg);
                            }else{
                                console.log('event-->   Success');
                                this.showToast('Success', 'Success', this.label.successOp);
                            }
                        }).catch(err =>{
                            console.log('event-->   error');
                            console.error('error',err);
                            //this.showToast('error', 'error', this.label.errorOp);
                        })
                }
            }
        })
        .catch(err =>{
            console.error('error',err);
            this.showToast('error', 'error', this.label.ErrorId);
        })
    }
    
    addDays(){
        let today = new Date();
        var _dd = String(today.getDate()).padStart(2, '0');
        var _mm = String(today.getMonth() + 1).padStart(2, '0'); 
        var _yyyy = today.getFullYear();
      
        today = _yyyy + '-' + _mm + '-' + _dd;
        var elt = today.split('-');
        let j = elt[2];
        let m = elt[1];
        let a = elt[0];
        console.log('@@@ année -->', j + ' ' +m +' '+a);
        return {
            j : j,
            m : m,
            a : a
        };
    }

    doSaveSucces(isSave){
        this.showToast('Success', 'Success !!', this.label.SuccessEven);
        this.goToEventDetail(this.recordId);
        window.console.log('result ===> ', result);
    }
    doSave(isSave,withFile){
        let ret = this.template.querySelector('c-rh_dynamic_form').save();
        if (ret.isvalid) {
            const record=ret.obj;
            if (record.StartDate > record.EndDate ) {
                this.showToast('info', 'Toast Info', this.label.InfoDate);
                
            }else{

                record.status=isSave ? DRAFT : SUBMIT;
                this.EventData=record;
                var jsonEventData = JSON.stringify(this.EventData);
                this.strEventData = jsonEventData;
                console.log('### strEventData----->', this.strEventData);
                createEvent({ objEven: this.strEventData})
                    .then(result => {
                        console.log('### result----->', result );
                        this.recordId= result.Id;
                        this.evId_ForFile = result.Id;
                        this.state = result.Status__c;
                        console.log('evId_ForFile ---> ', this.evId_ForFile);
                        if (withFile) {
                            this.checkIdOfFileBeforeSaveOrBeforeUpdate(); 
                            this.SaveFile(isSave);
                            this.checkDataEventBeforeSave();
                           
                        }else{
                            this.doSaveSucces(isSave);
                        }
                        
                    })
                    .catch(error => {
                        this.error = error.message;
                        this.showToast('error', 'Error', this.label.FieldsError);
                    });

            }
        }

        
    }
    handleBeforeSave(){
        let ret = this.template.querySelector('c-rh_dynamic_form').save();
        if (ret.isvalid) {
            const record=ret.obj;
            this.EventData=record;
            console.log('### EventData----->', JSON.stringify(this.EventData));
            var jsonEventData = JSON.stringify(this.EventData);
            this.strEventData = jsonEventData;
            if (record.StartDate > record.EndDate ){
                this.showToast('info', 'Toast Info', this.label.ToastInfoEvent2);
            }else{
                this.startSpinner(true);
                saveEvenWithoutStatus({ objEven: this.strEventData})
                .then(result => {
                    console.log('### result----->', result );
                    this._eventData = JSON.stringify(result);
                    console.log('_eventData ---> ', this._eventData);
                    this.evId_ForFile = result.Id;
                    this.state = result.Status__c;
                    console.log('evId_ForFile ---> ', this.evId_ForFile);
                    this.startSpinner(false);
                })
                .catch(error => {
                    this.error = error.message;
                    this.showToast('error', 'Error', this.label.FieldsError);
                });
            }
            
        }
    }
    handleBeforeUpdate(){
        let ret = this.template.querySelector('c-rh_dynamic_form').save();
        const record = ret.obj;
        this.EventData = record;
        var updatEven = JSON.stringify(this.EventData);
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        this.strUpdatEven = updatEven;
        console.log('eid----->', this.recordId);
        console.log('strUpdatEven----->', this.strUpdatEven);
        this.startSpinner(true);
        updateEven({ updEven: this.strUpdatEven, eId: this.recordId})
        .then(result => {
            this.data = result;
            window.console.log('result ===> ', result);
            this.evId_ForFile = result[0].Id;
            this.messageOfUpdate = result[0].Message__c;
        })
        .catch(error => {
            this.error = error.message;
            this.showToast('error', 'Error', this.label.UpdateFailed);
        });
    }
    handleBeforeUpdateAndSendEvent(){
        this.isFile = true;
        let ret = this.template.querySelector('c-rh_dynamic_form').save();
        const record = ret.obj;
        this.EventData = record;
        var updatEven = JSON.stringify(this.EventData);
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        this.strUpdatEven = updatEven;
        console.log('eid----->', this.recordId);
        console.log('strUpdatEven----->', this.strUpdatEven);
        this.startSpinner(true);
        updateAndSendEven({ updEven: this.strUpdatEven, eId: this.recordId})
        .then(result => {
            this.data_Event = result;
            this._evId = result[0].Id;
            this.evId_ForFile = result[0].Id;
            console.log('result _evId---> ', this._evId);
            window.console.log('result ===> ', result);
        })
        .catch(error => {
            this.error = error.message;
            this.showToast('error', 'Error', this.label.UpdateFailed);
        });
    }
    checkIdOfFileBeforeSaveOrBeforeUpdate(){
        console.log('&&& &&& evId_ForFile----->', this.evId_ForFile);
        if(this.evId_ForFile){
            this.fileData.recordId=this.evId_ForFile;
            this.fileId = this.fileData.recordId;
            console.log('### filedata-----> ', this.fileData);
        }
    }
    checkDataEventBeforeSave(){
        if(this.fileId){
            console.log('### filedata-----> true');
            this.handleClick();
            console.log('@@@_eventData ---> ', this._eventData);
            if(this.state==''){
                console.log('@@@File --->  TRUE', this.evId_ForFile);
                saveEven({ objEven: this._eventData, eId: this.evId_ForFile})
                .then(result => {
                    console.log('&&&& &&&& result ---> ', result);
                    this.goToEventDetail(result[0].Id);
                    window.console.log('result ===> ', result);
                    this.showToast('Success', 'Success !!',  this.label.SuccessEven);
                })
                .catch(error => {
                    this.error = error.message;
                    this.showToast('error', 'Error', this.label.AddFailed);
                });
                
            }else if(this.error=='error'){
                this.showToast('error', 'Error', this.label.AddFailed);
            }
        }else{
            console.log('@@@_eventData ---> ', this._eventData);
            if(this.state==''){
                console.log('@@@File --->  FALSE', this.evId_ForFile);
                saveEven({ objEven: this._eventData, eId: this.evId_ForFile})
                .then(result => {
                    console.log('&&&& &&&& result ---> ', result);
                    this.goToEventDetail(result[0].Id);
                    window.console.log('result ===> ', result);
                    this.showToast('Success', 'Success !!',  this.label.SuccessEven);
                })
                .catch(error => {
                    this.error = error.message;
                    this.showToast('error', 'Error', this.label.AddFailed);
                });
                
            }else if(this.error=='error'){
                this.showToast('error', 'Error', this.label.AddFailed);
            } 
        }
    }
    checkDataEventBeforeSaveAndSend(){
        if(this.fileId){
            this.handleClick();
            console.log('@@@_eventData ---> ', this._eventData);
            if(this.state==''){
                console.log('@@@ --->  TRUE', this.evId_ForFile);
                saveAndSendEvent({ objEven: this._eventData, eId: this.evId_ForFile})
                .then(result => {
                    this.data_Event = result;
                    this._evId = result[0].Id;
                    console.log('result _evId---> ', this._evId);
                    if(this._evId){
                        this.senNotification(this._evId);
                    }
                    this.goToEventDetail(result[0].Id);
                    this.showToast('Success', 'success !!', this.label.SucessEvenS);
                })
                .catch(error => {
                    this.error = error.message;
                    this.showToast('error', 'Error', this.label.AddFailed);
                });
                
            }else if(this.error=='error'){
                this.showToast('error', 'Error', this.label.AddFailed);
            }
        }else{
            console.log('@@@_eventData ---> ', this._eventData);
            if(this.state==''){
                console.log('@@@ --->  TRUE', this.evId_ForFile);
                saveAndSendEvent({ objEven: this._eventData, eId: this.evId_ForFile})
                .then(result => {
                    this.data_Event = result;
                    this._evId = result[0].Id;
                    console.log('result _evId---> ', this._evId);
                    if(this._evId){
                        this.senNotification(this._evId);
                    }
                    // this.getNewEventList();
                    // this.closeComponentEdit();
                    this.goToEventDetail(result[0].Id);
                    this.showToast('Success', 'success !!', this.label.SucessEvenS);
                })
                .catch(error => {
                    this.error = error.message;
                    this.showToast('error', 'Error', this.label.AddFailed);
                });
                
            }else if(this.error=='error'){
                this.showToast('error', 'Error', this.label.AddFailed);
            }
        }
    }
    handleSaveEvent(){debugger
        this.handleSaveEventNew();
           
    }

    handleSaveEventNew(){
        if (this.handleSave()) {
            this.EventData.Id=this.recordId;
            this.EventData.Status='Draft';
            console.log('EventData.Id---> ', this.EventData.Id);
            console.log('EventData---> ', this.EventData);
            this.handleSaveApex(this.EventData);
        }
        
           
    }
    handleSaveApexFinishDraft(){
        this.showToast('Success', 'success !!', this.label.SucessEvenS);
        this.goToEventDetail(this._evId);
        this.startSpinner(false);
    }
    handleSaveApexFinishUpdDraft(){
        this.backToDetails();
        this.showToast('success', 'success !!', this.label.EvenUpdateS);
        this.startSpinner(false);
    }
    handleSaveApexFinishSubmit(result){
        this.data_Event=[result]
        console.log('[result] --> ', this.data_Event);
        this.senNotificationNew(this._evId);
    }
    handleSaveApexFinishUpdSubmit(result){
        this.data_Event=[result];
        console.log('@@ result ---> ', this.data_Event);
        this.senNotificationNew(this._evId,'upd');
    }
    handleSaveApex(obj,from=''){debugger
        console.log('3--> obj', obj);
        this.startSpinner(true);
        saveEventApex({ objEven: JSON.stringify(obj)})
        .then(result => {
            console.log('### result handleSaveApex----->', result);
            this._evId = result.Id;
            console.log('result _evId---> ', this._evId);
            switch (from) {
                case 'updDraft': //udte qnd send updDraft
                    this.handleSaveApexFinishUpdDraft(result);
                    break;
                case 'Ss': // sqve qnd send
                    this.handleSaveApexFinishSubmit(result);
                    break;
                case 'updSub':
                    this.handleSaveApexFinishUpdSubmit(result);
                break;
                default:
                    this.handleSaveApexFinishDraft();
                    break;
            }
            
        })
        .catch(error => {
            this.error = error.message;
            this.showToast('error', 'Error', this.label.FieldsError);
            //this.startSpinner(false);
        })
        .finally(()=>{
            this.startSpinner(false);
        });
    }
    handleSave(){
        this.EventData={};
        let ret = this.template.querySelector('c-rh_dynamic_form').save();
        if (ret.isvalid) {
            const record=ret.obj;
            this.EventData=record;
            console.log('### EventData----->', JSON.stringify(this.EventData));
           
            if (record.StartDate > record.EndDate ){
                this.showToast('info', 'Toast Info', this.label.ToastInfoEvent2);
            }else{
                this.EventData={ ...this.EventData , hasfile:this.bool,
                    fileObj:{  base64:this.fileData?.base64, filename:this.fileData?.filename}
                    };
                var jsonEventData = JSON.stringify(this.EventData);
                this.strEventData = jsonEventData;
                return this.EventData;
            }
            
        }
        return null
    }
    senNotificationNew(evId,from='00'){
        console.log('@@senNotification User evId --> ' , evId);
        getIdUserCEO({})
        .then(result =>{
            console.log('@@senNotification User data --> ' , result);
            for(let i=0; i<result.length; i++){
                console.log('@@@ All IDUSER --> ' , result[i].Id);
                console.log('@@@ UserRole.Name --> ' , result[i].UserRole.Name);
                if(result[i].UserRole.Name==RoleCEO || result[i].UserRole.Name==HumanResourceManagment 
                                                    || result[i].UserRole.Name==RhManager 
                                                    || result[i].UserRole.Name==TeamLeader){
                    console.log('@@@ IDUSER CEO --> ' , result[i].Id);
                    console.log('@@@ data_Event --> ' , this.data_Event);
                    let name = this.data_Event[0].Name;
                    let desc = this.data_Event[0].Description__c;
                    console.log('@@@ status || desc --> ' , name +' || '+ desc);
                    sendNotif({strBody:desc, pgRefId:evId, strTargetId:result[i].Id, strTitle:name, setUserIds:result[i].Id})
                        .then(result =>{
                            if (result?.error) {
                                console.error(result?.msg);
                            }else{
                                console.log('event-->   Success');
                                if(from=='upd'){
                                    this.showToast('success', 'success !!', this.label.EvenUpdateSS);
                                }else{
                                    this.showToast('Success', 'Success', this.label.successOp);
                                }
                                setTimeout(() => {
                                    this.goToEventDetail(evId);
                                }, 1000);
                                
                            }
                        }).catch(err =>{
                            console.log('event-->   error');
                            console.error('error',err);
                            //this.showToast('error', 'error', this.label.errorOp);
                        }).finally(()=>{
                            this.startSpinner(false);
                        });
                }
            }
        })
        .catch(err =>{
            console.error('error',err);
            this.showToast('error', 'error', this.label.ErrorId);
            this.startSpinner(false);
        })
    }

    handleSaveAndSendEvent(){
        this.handleSaveAndSendEventNew()
    }
    handleSaveAndSendEventNew(){
        if (this.handleSave()) {
            this.EventData.Id=this.recordId;
            this.EventData.Status='Submitted';

            this.handleSaveApex(this.EventData,'Ss');
        }
    }
    closeComponentEdit(){
        this.showComponentBase = true;
        this.showComponentDetails = false;
        this.showComponentEdit = false;
        this.showAttachement = false;
        this.isUpdate = false;
    }

    
    closeComponentUpdate(){
        this.showComponentDetails = true;
        this.showComponentBase = false;
        this.showComponentEdit = false;
        this.isUpdate = false;
    }
    backToPreviousComponent(){
        this.recordId = undefined;
        this.goToEventDetail(this.recordId);
        this.getNewEventList();
        this.showComponentBase = true;
        this.showComponentDetails = false;
        this.showComponentEdit = false;
        this.isUpdate = false;
    }
    closeComponentDetails(event){
        if (event.detail.action==this.label.Back){
        this.recordId = undefined;
        this.goToEventDetail(this.recordId);
        this.getNewEventList();
        this.showComponentBase = true;
        this.showComponentDetails = false;
        this.showComponentEdit = false;
        this.isUpdate = false;
        }
    }
    //-----------------florent end--------------
    handleSendEvent(event){
        sendEvent({evId : this.recordId})
        .then(result => {
            this.resObj=result[0]
            console.log('resObj --> ', this.resObj);
            this._evId = result[0].Id;
            console.log('this._evId--> ', this._evId);
            this.handleSaveApexFinishUpdSubmit(this.resObj);
            // const obj={};
            // obj.Id=this.recordId;
            // obj.Name= result[0].Name;
            // obj.Description= result[0].Description__c;
            // obj.StartDate= result[0].Start_Dates__c;
            // obj.EndDate= result[0].End_Dates__c;
            // obj.Status='Submitted';
            // this.handleSaveApex(obj,'updSub');
        })
        .catch(error => {
            console.error(error.msg);
        });
        //this.handleSendEventNew();
    }
    handleSendEventNew(){
        this.EventData.Id=this.recordId;
        this.EventData.Status='Submitted';
        console.log('EventData', this.EventData);
        this.handleSaveApex(this.EventData,'updSub');
    }
    handleUpdateEvent(){debugger
        this.handleUpdateEventNew()
    }
    handleUpdateEventNew(){
        if (this.handleSave()) {
            this.EventData.Id=this.recordId;
            this.EventData.Status='Draft';
            console.log('EventData.Id---> ', this.EventData.Id);
            console.log('EventData---> ', this.EventData);
            this.handleSaveApex(this.EventData,'updDraft');
        }
    }
    handleUpdateAndSendEvent(){debugger
        this.handleUpdateAndSendEventNew();  
    }
    handleUpdateAndSendEventNew(){debugger
        if (this.handleSave()) {
            this.EventData.Id=this.recordId;
            this.EventData.Status='Submitted';
            window.console.log('EventData.Id', this.EventData.Id);
            window.console.log('EventData', this.EventData);
            this.handleSaveApex(this.EventData,'updSub');
        }
    }

    handledeleteEvent(event){debugger
        if (event.detail.action==this.label.ok_confirm){
            this.startSpinner(true);
            this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
            console.log('eid----->', this.recordId);
            deleteEvent({evid : this.recordId})
            .then(result => {
                this.data = result;
                console.log('res----->', result[0].Status__c);
                console.log('Message----->', result[0].Message__c);
                console.log('CreatedBy----->', result[0].CreatedBy.UserRole.Name);
                if(result[0].Status__c=='Approved' && (result[0].Message__c=='Right no allowed')){
                            this.closeModalAfterDelete();
                            this.showToast('info', 'Toast Info', this.label.RightDeletion);
                }else{
                    switch (result[0].Status__c) {
                        case 'Submitted':
                            this.closeModalAfterDelete();
                            this.showToast('info', 'Toast Info', this.label.ToastEvent1);
                                break;
                        default:
                            this.closeModalAfterDelete();
                            this.backToPreviousComponent();
                            this.showToast('success', 'success !!', this.label.successOp);
                                break;
                    }
                }
                this.startSpinner(false);
            })
            .catch(error => {
                console.error(error?.msg);
                this.showToast('error', 'Error', this.label.errorOp);
            });
        }
    }
    closeModalAfterDelete(){
        this.showModalDelete=false;
    }
    closeModalDelete(event){debugger
        if (event.detail.action==this.label.Cancel){
            this.showModalDelete=false;
        }
    }
    handleBeforeEdit(){
        this.startSpinner(true);
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        console.log('eid----->', this.recordId);
        checkStatus({evid : this.recordId})
        .then(result => {
            this.data = result;
            if(result.Message__c=='No right to modify the event'){
                this.showToast('info', 'Toast Info', this.label.RightAccess);
                this.handleOpenComponent();
            }else{
                this.showComponentEdit = true;
                this.updateSave = true;
                isUpdate = false;
            }
        })
        .catch(error => {
            console.error(error.msg);
        });
        this.startSpinner(false);
    }
    getEventDetails(eventId) {debugger
        console.log('eventId--> ' , eventId);
        getEventEdite({evenId: eventId})
        .then(result =>{
            if (result.error) {
                console.error(result.msg);
                this.showToast('error', 'error', this.label.errorOp);
            }else{
                    console.log('result --> ' , result);
                    let status = result[0].Status__c;
                    let creatById = result[0].Contact_Id__c;
                    console.log('conId1 --> ' , creatById);
                    getEventEditeByCreatedById()
                    .then(result1 =>{
                        console.log('conId2 --> ' , result1);
                        if(result1==creatById){
                            this.displayButton2 = false;
                            this.displayButton = true;
                            this.hidenButton = true;
                            if(status=='Rejected'){
                                this.showComponentDetails = true;
                                this.hidenButton = false;
                                this.displayButton = false;
                                this.displayButton2 = true;
                                console.log('event 1--> ' , result);
                                this.data0 = result.map(obj => {
                                    var newobj={};
                                        newobj.Id = obj.Id;
                                        newobj.EventName=obj.Name;
                                        newobj.ContactName=obj.Contact_Id__r.Name;
                                        newobj.Description=obj.Description__c;
                                        newobj.StartDate= obj.Start_Dates__c; 
                                        newobj.EndDate= obj.End_Dates__c;
                                        newobj.Status=obj.Status__c;
                                    return newobj;
                                });
                                console.log('data0  1--->', this.data0);
                                this.eventinformationEdite = result.map(obj => {
                                    var newobj={};
                                        newobj.Id = obj.Id;
                                        newobj.EventName=obj.Name;
                                        newobj.ContactName=obj.Contact_Id__r.Name;
                                        newobj.Description=obj.Description__c;
                                        newobj.StartDate= obj.Start_Dates__c.split('T')[0]+'  à '+ obj.Start_Dates__c.split('T')[1].substring(0,5); 
                                        newobj.EndDate= obj.End_Dates__c.split('T')[0]+'  à '+obj.End_Dates__c.split('T')[1].substring(0,5);
                                        newobj.Status=obj.StatusLabel;
                                    return newobj;
                                });
                                this.data = this.eventinformationEdite;
                                console.log('eventinformationEdite--->', this.eventinformationEdite);
                                // this.optionsStatus();
                                this.eventDetails =[
                                    {
                                        label: this.label.EventName, 
                                        name:'Name',
                                        type:'text',
                                        value:this.eventinformationEdite[0].EventName,
                                        required:true,
                                        ly_md:'12', 
                                        ly_lg:'12'
                                    },
                                    {
                                        label:this.label.StartDate,
                                        name:'StartDate',
                                        type:'datetime',
                                        value:this.eventinformationEdite[0].StartDate,
                                        required:true,
                                        ly_md:'12', 
                                        ly_lg:'12'
                                    },
                                    {
                                        label:this.label.Status,
                                        name:'Status',
                                        picklist: true,
                                        value:this.eventinformationEdite[0].Status,
                                        required:true,
                                        ly_md:'12', 
                                        ly_lg:'12'
                                    },
                                    {
                                        label:this.label.EndDate,
                                        name:'EndDate',
                                        type:'datetime',
                                        value:this.eventinformationEdite[0].EndDate,
                                        ly_md:'12', 
                                        ly_lg:'12'
                                    },
                                    {
                                        label: this.label.Description,
                                        name:'Description',
                                        type:'textarea',
                                        value:this.eventinformationEdite[0].Description,
                                        ly_md:'12', 
                                        ly_lg:'12'
                                    },
                                ];
                                getRelatedFilesByRecordId({recordId: eventId})
                                .then(result=>{
                                    console.log('@@@ @@@ @@@ 1 result-->', result);
                                    this.filesList = result.data.map(elt =>{
                                        var obj = {};
                                        obj.label = elt.Name,
                                        obj.value = elt.Name,
                                        obj.fname = elt.Name,
                                        obj.conVerId = elt.ContentVersionId,
                                        obj.docId = elt.ContentDocumentId,
                                        obj.url = elt.ContentDownloadUrl
                                        return obj;
                                    })
                                    console.log('@@@ filesList @@@ ===> ',this.filesList);
                                    for(let i=0; i<this.filesList.length; i++){
                                        this.contentDocId = this.filesList[i].docId;
                                        this.contentDocIdList.push(this.filesList[i].docId);
                                    }
                                    debugger
                                    console.log('@@@ contentDocId @@@ ===> ', this.contentDocIdList);
                                    let data_t =[];
                                    for(let key2 in result['data2']) {   
                                        for(let key in result['data']) {
                                            if(result['data'][key].ContentDocumentId == result['data2'][key2].Id){
                                                data_t.push({Id:result['data2'][key2].Id, FileName: result['data2'][key2].Title, url: result['data'][key].ContentDownloadUrl});
                                            }
                                        }
                                    }
                                    this.filesLists = data_t;
                                    console.log('-->',this.filesLists);
                                });
                            }else if(status=='Submitted'){
                                this.showComponentDetails = true;
                                this.hidenButton = false;
                                this.displayButton = false;
                                console.log('event 2--> ' , result);
                                this.data0 = result.map(obj => {
                                    var newobj={};
                                        newobj.Id = obj.Id;
                                        newobj.EventName=obj.Name;
                                        newobj.ContactName=obj.Contact_Id__r.Name;
                                        newobj.Description=obj.Description__c;
                                        newobj.StartDate= obj.Start_Dates__c; 
                                        newobj.EndDate= obj.End_Dates__c;
                                        newobj.Status=obj.Status__c;
                                    return newobj;
                                });
                                console.log('data0  2--->', this.data0);
                                this.eventinformationEdite = result.map(obj => {
                                    var newobj={};
                                        newobj.Id = obj.Id;
                                        newobj.EventName=obj.Name;
                                        newobj.ContactName=obj.Contact_Id__r.Name;
                                        newobj.Description=obj.Description__c;
                                        newobj.StartDate= obj.Start_Dates__c.split('T')[0]+'  à '+ obj.Start_Dates__c.split('T')[1].substring(0,5); 
                                        newobj.EndDate= obj.End_Dates__c.split('T')[0]+'  à '+obj.End_Dates__c.split('T')[1].substring(0,5);
                                        newobj.Status=obj.StatusLabel;
                                    return newobj;
                                });
                                this.data = this.eventinformationEdite;
                                console.log('eventinformationEdite--->', this.eventinformationEdite);
                                // this.optionsStatus();
                                this.eventDetails =[
                                    {
                                        label: this.label.EventName, 
                                        name:'Name',
                                        type:'text',
                                        value:this.eventinformationEdite[0].EventName,
                                        required:true,
                                        ly_md:'12', 
                                        ly_lg:'12'
                                    },
                                    {
                                        label:this.label.StartDate,
                                        name:'StartDate',
                                        type:'datetime',
                                        value:this.eventinformationEdite[0].StartDate,
                                        required:true,
                                        ly_md:'12', 
                                        ly_lg:'12'
                                    },
                                    {
                                        label:this.label.Status,
                                        name:'Status',
                                        picklist: true,
                                        value:this.eventinformationEdite[0].Status,
                                        required:true,
                                        ly_md:'12', 
                                        ly_lg:'12'
                                    },
                                    {
                                        label:this.label.EndDate,
                                        name:'EndDate',
                                        type:'datetime',
                                        value:this.eventinformationEdite[0].EndDate,
                                        ly_md:'12', 
                                        ly_lg:'12'
                                    },
                                    {
                                        label: this.label.Description,
                                        name:'Description',
                                        type:'textarea',
                                        value:this.eventinformationEdite[0].Description,
                                        ly_md:'12', 
                                        ly_lg:'12'
                                    },
                                ];
                                getRelatedFilesByRecordId({recordId: eventId})
                                .then(result=>{
                                    console.log('@@@ @@@ @@@ 1 result-->', result);
                                    this.filesList = result.data.map(elt =>{
                                        var obj = {};
                                        obj.label = elt.Name,
                                        obj.value = elt.Name,
                                        obj.fname = elt.Name,
                                        obj.conVerId = elt.ContentVersionId,
                                        obj.docId = elt.ContentDocumentId,
                                        obj.url = elt.ContentDownloadUrl
                                        return obj;
                                    })
                                    console.log('@@@ filesList @@@ ===> ',this.filesList);
                                    for(let i=0; i<this.filesList.length; i++){
                                        this.contentDocId = this.filesList[i].docId;
                                        this.contentDocIdList.push(this.filesList[i].docId);
                                    }
                                    debugger
                                    console.log('@@@ contentDocId @@@ ===> ', this.contentDocIdList);
                                    let data_t =[];
                                    for(let key2 in result['data2']) {   
                                        for(let key in result['data']) {
                                            if(result['data'][key].ContentDocumentId == result['data2'][key2].Id){
                                                data_t.push({Id:result['data2'][key2].Id, FileName: result['data2'][key2].Title, url: result['data'][key].ContentDownloadUrl});
                                            }
                                        }
                                    }
                                    this.filesLists = data_t;
                                    console.log('-->',this.filesLists);
                                });
                            }else{
                                this.showComponentDetails = true;
                                console.log('event 3--> ' , result);
                                this.data0 = result.map(obj => {
                                    var newobj={};
                                        newobj.Id = obj.Id;
                                        newobj.EventName=obj.Name;
                                        newobj.ContactName=obj.Contact_Id__r.Name;
                                        newobj.Description=obj.Description__c;
                                        newobj.StartDate= obj.Start_Dates__c; 
                                        newobj.EndDate= obj.End_Dates__c;
                                        newobj.Status=obj.Status__c;
                                    return newobj;
                                });
                                console.log('data0  3--->', this.data0);
                                this.eventinformationEdite = result.map(obj => {
                                    var newobj={};
                                        newobj.Id = obj.Id;
                                        newobj.EventName=obj.Name;
                                        newobj.ContactName=obj.Contact_Id__r.Name;
                                        newobj.Description=obj.Description__c;
                                        newobj.StartDate= obj.Start_Dates__c.split('T')[0]+'  à '+ obj.Start_Dates__c.split('T')[1].substring(0,5); 
                                        newobj.EndDate= obj.End_Dates__c.split('T')[0]+'  à '+obj.End_Dates__c.split('T')[1].substring(0,5);
                                        newobj.Status=obj.StatusLabel;
                                    return newobj;
                                });
                                this.data = this.eventinformationEdite;
                                console.log('eventinformationEdite--->', this.eventinformationEdite);
                                // this.optionsStatus();
                                this.eventDetails =[
                                    {
                                        label: this.label.EventName, 
                                        name:'Name',
                                        type:'text',
                                        value:this.eventinformationEdite[0].EventName,
                                        required:true,
                                        ly_md:'12', 
                                        ly_lg:'12'
                                    },
                                    {
                                        label:this.label.StartDate,
                                        name:'StartDate',
                                        type:'datetime',
                                        value:this.eventinformationEdite[0].StartDate,
                                        required:true,
                                        ly_md:'12', 
                                        ly_lg:'12'
                                    },
                                    {
                                        label:this.label.Status,
                                        name:'Status',
                                        picklist: true,
                                        value:this.eventinformationEdite[0].Status,
                                        required:true,
                                        ly_md:'12', 
                                        ly_lg:'12'
                                    },
                                    {
                                        label:this.label.EndDate,
                                        name:'EndDate',
                                        type:'datetime',
                                        value:this.eventinformationEdite[0].EndDate,
                                        ly_md:'12', 
                                        ly_lg:'12'
                                    },
                                    {
                                        label: this.label.Description,
                                        name:'Description',
                                        type:'textarea',
                                        value:this.eventinformationEdite[0].Description,
                                        ly_md:'12', 
                                        ly_lg:'12'
                                    },
                                ];
                                getRelatedFilesByRecordId({recordId: eventId})
                                .then(result=>{
                                    console.log('@@@ @@@ @@@ 1 result-->', result);
                                    this.filesList = result.data.map(elt =>{
                                        var obj = {};
                                        obj.label = elt.Name,
                                        obj.value = elt.Name,
                                        obj.fname = elt.Name,
                                        obj.conVerId = elt.ContentVersionId,
                                        obj.docId = elt.ContentDocumentId,
                                        obj.url = elt.ContentDownloadUrl
                                        return obj;
                                    })
                                    console.log('@@@ filesList @@@ ===> ',this.filesList);
                                    for(let i=0; i<this.filesList.length; i++){
                                        this.contentDocId = this.filesList[i].docId;
                                        this.contentDocIdList.push(this.filesList[i].docId);
                                    }
                                    debugger
                                    console.log('@@@ contentDocId @@@ ===> ', this.contentDocIdList);
                                    let data_t =[];
                                    for(let key2 in result['data2']) {   
                                        for(let key in result['data']) {
                                            if(result['data'][key].ContentDocumentId == result['data2'][key2].Id){
                                                data_t.push({Id:result['data2'][key2].Id, FileName: result['data2'][key2].Title, url: result['data'][key].ContentDownloadUrl});
                                            }
                                        }
                                    }
                                    this.filesLists = data_t;
                                    console.log('-->',this.filesLists);
                                });
                            }
                        }
                    })
                    .catch(err =>{
                        console.error('error',err);
                        this.showToast('error', 'error', this.label.errorOp);
                        
                    })
                
                }
            }).catch(err =>{
                console.error('error',err);
                this.showToast('error', 'error', this.label.errorOp);
            })
    } 
    displayEventData(){
        console.log('event 5--> ' , result);
        this.data0 = result.map(obj => {
            var newobj={};
                newobj.Id = obj.Id;
                newobj.EventName=obj.Name;
                newobj.ContactName=obj.Contact_Id__r.Name;
                newobj.Description=obj.Description__c;
                newobj.StartDate= obj.Start_Dates__c; 
                newobj.EndDate= obj.End_Dates__c;
                newobj.Status=obj.StatusLabel;
            return newobj;
        });
        console.log('data0  5--->', this.data0);
        this.eventinformationEdite = result.map(obj => {
            var newobj={};
                newobj.Id = obj.Id;
                newobj.EventName=obj.Name;
                newobj.ContactName=obj.Contact_Id__r.Name;
                newobj.Description=obj.Description__c;
                newobj.StartDate= obj.Start_Dates__c.split('T')[0]+'  à '+ obj.Start_Dates__c.split('T')[1].substring(0,5); 
                newobj.EndDate= obj.End_Dates__c.split('T')[0]+'  à '+obj.End_Dates__c.split('T')[1].substring(0,5);
                newobj.Status=obj.StatusLabel;
            return newobj;
        });
        this.data = this.eventinformationEdite;
        console.log('eventinformationEdite--->', this.eventinformationEdite);
        // this.optionsStatus();
        this.eventDetails =[
            {
                label: this.label.EventName, 
                name:'Name',
                type:'text',
                value:this.eventinformationEdite[0].EventName,
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:this.label.StartDate,
                name:'StartDate',
                type:'datetime',
                value:this.eventinformationEdite[0].StartDate,
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:this.label.Status,
                name:'Status',
                picklist: true,
                value:this.eventinformationEdite[0].Status,
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:this.label.EndDate,
                name:'EndDate',
                type:'datetime',
                value:this.eventinformationEdite[0].EndDate,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label: this.label.Description,
                name:'Description',
                type:'textarea',
                value:this.eventinformationEdite[0].Description,
                ly_md:'12', 
                ly_lg:'12'
            },
        ];
        getRelatedFilesByRecordId({recordId: eventId})
        .then(result=>{
            console.log('@@@ @@@ @@@ 1 result-->', result);
            this.filesList = result.data.map(elt =>{
                var obj = {};
                obj.label = elt.Name,
                obj.value = elt.Name,
                obj.fname = elt.Name,
                obj.conVerId = elt.ContentVersionId,
                obj.docId = elt.ContentDocumentId,
                obj.url = elt.ContentDownloadUrl
                return obj;
            })
            console.log('@@@ filesList @@@ ===> ',this.filesList);
            for(let i=0; i<this.filesList.length; i++){
                this.contentDocId = this.filesList[i].docId;
                this.contentDocIdList.push(this.filesList[i].docId);
            }
            debugger
            console.log('@@@ contentDocId @@@ ===> ', this.contentDocIdList);
            let data_t =[];
            for(let key2 in result['data2']) {   
                for(let key in result['data']) {
                    if(result['data'][key].ContentDocumentId == result['data2'][key2].Id){
                        data_t.push({Id:result['data2'][key2].Id, FileName: result['data2'][key2].Title, url: result['data'][key].ContentDownloadUrl});
                    }
                }
            }
            this.filesLists = data_t;
            console.log('-->',this.filesLists);
        });
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
    buildform(){
        this.inputsItems = [
            {
                label: this.label.Name,
                placeholder: this.label.NamePlc,
                name:'Name',
                type:'text',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label: this.label.Start,
                placeholder: this.label.StartDatePlc,
                name:'StartDate',
                type:'Datetime',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label: this.label.Description,
                placeholder: this.label.DescriptionPlc,
                name:'Description',
                type:'textarea',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label: this.label.End,
                placeholder:this.label.EndDatePlc,
                name:'EndDate',
                type:'Datetime',
                ly_md:'6', 
                ly_lg:'6'
            },
            // {
            //     label:'Status',
            //     placeholder:'Select Status',
            //     name:'Status',
            //     picklist: true,
            //     options:this.StatusList,
            //     required:true,
            //     ly_md:'12', 
            //     ly_lg:'12'
            // },
        ];
    }

    buildformEdit(){
        this.inputsItems =[
            {
                label: this.label.Name,
                placeholder: this.label.NamePlc,
                name:'Name',
                type:'text',
                value:this.data0[0].EventName,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label: this.label.StartDate,
                placeholder: this.label.StartDatePlc,
                name:'StartDate',
                type:'Datetime',
                value:this.data0[0].StartDate,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label: this.label.Description,
                placeholder: this.label.DescriptionPlc,
                name:'Description',
                type:'textarea',
                value:this.data0[0].Description,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label: this.label.EndDate,
                placeholder: this.label.EndDatePlc,
                name:'EndDate',
                type:'Datetime',
                value:this.data0[0].EndDate,
                ly_md:'6', 
                ly_lg:'6'
            },
            // {
            //     label:'Status',
            //     placeholder:'Select Status',
            //     name:'Status',
            //     picklist: true,
            //     options:this.StatusList,
            //     value:this.data0[0].Status,
            //     required:true,
            //     ly_md:'12', 
            //     ly_lg:'12'
            // },
        ];
    }
    openfileUpload(event) {
        this.bool = true;
        const file = event.target.files[0]
        var reader = new FileReader()
        reader.onload = () => {
            var base64 = reader.result.split(',')[1]
            this.fileData = {
                'filename': file.name,
                'base64': base64,
                'recordId': ''
            }
            this.fileId = this.fileData.recordId;
            console.log('File Id ===> ',this.fileId);
            console.log('File ===> ',this.fileData);
        }
        reader.readAsDataURL(file)
    }
    openfileUploadForUpdate(event) { debugger
        this.bool = true;
        const file = event.target.files[0]
        var reader = new FileReader()
        reader.onload = () => {
            var base64 = reader.result.split(',')[1]
            this.fileData = {
                'filename': file.name,
                'base64': base64,
                'recordId': ''
            }
            this.fileId = this.fileData.recordId;
            console.log('File ===> ',this.fileId);
            console.log('File ===> ',this.fileData);
        }
        reader.readAsDataURL(file)
    }
    handleDeleteFile(){
        console.log('recordId 1---> ', this.recordId);
        console.log('recordId 2---> ', this.contentDocId);
        this.startSpinner(true);
        deleteFile({recId: this.recordId, docId:this.contentDocId})
        .then(result=>{
            this.showToast('success', 'success !!', this.label.FileDeleteSuccessfully);
            window.location.reload();
        })
    }
    handleClick(){
        const {base64, filename, recordId} = this.fileData
        uploadFile({ base64, filename, recordId })
        .then(result=>{
            this.fileData = null;
            this.isFile = true;
        })
        // this.showToast('success', 'success !!', 'File Upload Successfully!!');
    }
    SaveFile(){
        const {base64, filename, recordId} = this.fileData
        uploadFile({ base64, filename, recordId })
        .then(result=>{
            this.fileData = null;
            this.isFile = true;
            this.doSaveSucces(isSave);

        })
        .catch( e =>{
            console.error(e);
            this.showToast('error', 'error', this.label.errorOp);
        })
        // this.showToast('success', 'success !!', 'File Upload Successfully!!');
    }
    toast(title){
        const toastEvent = new ShowToastEvent({
            title, 
            variant:"success"
        })
        this.dispatchEvent(toastEvent)
    }
    handleOpenComponent() {
        this.showComponentBase = false;
        //this.showComponentDetails = true;
    }
    handleEdit(event){debugger
        if (event.detail.action==this.label.Edit){
            this.handleBeforeEdit();
            this.buildformEdit();
            this.showComponentBase = false;
            this.showComponentDetails = false;
            this.isUpdate = true;
        }
    }
    handleOpenComponentSave(event){
        if (event.detail.action==this.label.New) {
            this.showComponentEdit = true;
            this.buildform();
            this.isUpdate = false;
            this.showComponentBase = false;
            this.showAttachement = false;
        }
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
    // Start New change 
    detailsActionsSaveEvent=[
        {   variant:"brand-outline",
            class:" slds-m-right_medium",
            label:this.label.Save,
            name:this.label.Save,
            title:this.label.Save,
            iconName:this.icon.Save,
        }
    ]
    // End New change
    //----------------------started---------------------------------------
    detailsSaveAndSendEvent=[
        {   variant:"brand-outline",
            class:" slds-m-right_medium",
            label:this.label.SaveAndSend,
            name:this.label.SaveAndSend,
            title:this.label.SaveAndSend,
            iconName:this.icon.Save,
        }
    ]
    detailsCloseComponentEdit=[
        {   
            variant:"brand-outline",
            label:this.label.Back,
            name:this.label.Back,
            title:this.label.Back,
            iconName:this.icon.Back,
        }
    ]
    detailspredeleteEvent=[
        {   
            variant:"brand-outline",
            label:this.label.Delete,
            name:this.label.Delete,
            title:this.label.Delete,
            iconName:this.icon.Delete,
        }
    ]
    detailspreEditEvent=[
        {   
            variant:"brand-outline",
            label:this.label.Edit,
            name:this.label.Edit,
            title:this.label.Edit,
            iconName:this.icon.Edit,
        }
    ]
    detailspreSendEvent=[
        {   
            variant:"brand-outline",
            label:this.label.Send,
            name:this.label.Send,
            title:this.label.Send,
            iconName:this.icon.submit,
        }
    ]
    detailsUpdateAndSendEvent=[
        {   variant:"brand-outline",
            class:" slds-m-right_medium",
            label:this.label.UpdateAndSend,
            name:this.label.UpdateAndSend,
            title:this.label.UpdateAndSend,
            iconName:this.icon.Save,
        }
    ]
    detailsDeleteEvent=[
        {   variant:"brand-outline",
            class:" slds-m-right_medium",
            label:this.label.ok_confirm,
            name:this.label.ok_confirm,
            title:this.label.ok_confirm,
            iconName:this.icon.approve,
        }
    ]
    detailsModalDelete=[
        {   variant:"brand-outline",
            class:" slds-m-right_medium",
            label:this.label.Cancel,
            name:this.label.Cancel,
            title:this.label.Cancel,
            iconName:this.icon.close,
        }
    ]
    //--------------------finish--------------------------------

    nextToAttachementSave(){
        this.disable = false;
        this.showAttachement = true;
        this.isUpdate = false;
        this.showComponentEdit = false;
    }
    nextToAttachementUpdate(){
        this.disable = false;
        this.showAttachement = true;
        this.isUpdate = true;
        this.showComponentEdit = false;
    }
    backToDetails(){
        this.showAttachement = false;
        this.showComponentDetails = true;
        location.reload();
    }
    handleCancelUpdate(){
        this.showAttachement = false;
        this.showComponentEdit = true;
    }
    handlepredeleteEvent(event){
        if (event.detail.action==this.label.Delete){
            this.showModalDelete=true;
        }
    }
    //handle spinner
    startSpinner(b){
        let spinner=this.template.querySelector('c-rh_spinner');
        if (b) {    spinner?.start(); }
            else{   spinner?.stop();}
    }

    //handle toast
    showToast(variant, title, message){
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);
    }
}