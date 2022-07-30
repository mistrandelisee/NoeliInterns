import { LightningElement, wire, api, track } from 'lwc';
import getRelatedFilesByRecordId from '@salesforce/apex/RH_EventController.getRelatedFilesByRecordId';
import saveEvenWithoutStatus from '@salesforce/apex/RH_EventController.saveEvenWithoutStatus';
import getEventEditeByCreatedById from '@salesforce/apex/RH_EventController.getUserInfoId';
import updateAndSendEven from '@salesforce/apex/RH_EventController.updateAndSendEven'; 
import getPicklistStatus from '@salesforce/apex/RH_EventController.getPicklistStatus';
import saveAndSendEvent from '@salesforce/apex/RH_EventController.saveAndSendEvent';
import getLatestEvents from '@salesforce/apex/RH_EventController.getEventList';
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
export default class Rh_Event extends  NavigationMixin(LightningElement) {
    l={...labels,
        //searchText:null,
        Name: 'Name',
        srchNamePlc: 'Search by name',
        From:'From',
        To:'To',
        OrderBy:'sort By',
        selectPlc:'Select an option',
        };
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
    _eventData = {};
    strEventData;
    strUpdatEven;
    @api recordId;
    @api contactId;
    @api eventId;
    azerty=[];
    @track filterInputs=[];
    contentDocIdList = [];
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
    get filterReady(){ return this.filterInputs?.length >0}
    getNewEventList(){
        this.datas=[];
        getLatestEvents()
        .then(result =>{
            console.log('@@wiredatas--> ' , result);
            const self=this;
            result.forEach(elt => { 
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
                label: elt?.Status__c
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

    handleSubmitFilter(event) {
        const record=event.detail;
        console.log(`handleSubmitFilter record `, JSON.stringify(record) );
        console.log(`this.datas `, this.datas);
        record.searchText ? this.datas = this.datas.filter(element =>((element.EventName).toUpperCase()) == (record.searchText.toUpperCase())) : this.datas;
        record.startDate ? this.datas = this.datas.filter(element =>element.StartDate ==  record.startDate) : this.datas;
        record.status ? this.datas = this.datas.filter(element =>element.Status ==  record.status) : this.datas;
        record.EndDate ? this.datas = this.datas.filter(element =>element.EndDate ==  record.EndDate) : this.datas;   
    }

    senNotification(evId){
        console.log('@@senNotification User evId --> ' , evId);
        getIdUserCEO({})
        .then(result =>{
            console.log('@@senNotification User data --> ' , result);
            for(let i=0; i<result.length; i++){
                console.log('@@@ All IDUSER --> ' , result[i].Id);
                console.log('@@@ UserRole.Name --> ' , result[i].UserRole.Name);
                if(result[i].UserRole.Name=='CEO' || result[i].UserRole.Name=='Human Resource Managment' || result[i].UserRole.Name=='RH Manager'){
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
                            console.error('error',err);
                            this.showToast('error', 'error', this.label.errorOp);
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
        //this.getNewEventList();
        //this.closeComponentEdit();
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
                    console.log('### res----->', result);
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
                console.log('@@@ --->  TRUE', this.evId_ForFile);
                saveEven({ objEven: this._eventData, eId: this.evId_ForFile})
                .then(result => {
                    console.log('&&&& &&&& result ---> ', result);
                    // this.getNewEventList();
                    // this.closeComponentEdit();
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
                console.log('@@@ --->  TRUE', this.evId_ForFile);
                saveEven({ objEven: this._eventData, eId: this.evId_ForFile})
                .then(result => {
                    console.log('&&&& &&&& result ---> ', result);
                    // this.getNewEventList();
                    // this.closeComponentEdit();
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
    // handleSaveEvent(){
    //     // this.doSave(true,this.bool);
    //     if(this.bool==true){
    //         this.handleBeforeSave();
    //         setTimeout(()=>{
    //             this.checkIdOfFileBeforeSaveOrBeforeUpdate();
    //             this.checkDataEventBeforeSave();
    //         },1000);
    //     }else{
    //         this.handleBeforeSave();
    //         this.checkDataEventBeforeSave();
    //         setTimeout(()=>{
    //             this.checkDataEventBeforeSave();
    //         },1000);
    //     }
           
    // }
    //-----------------florent start--------------
    handleSaveAndSendEvent(event){
        if (event.detail.action=='SaveAndSend'){
            if(this.bool==true){
                this.handleBeforeSave();
                setTimeout(()=>{
                    this.checkIdOfFileBeforeSaveOrBeforeUpdate();
                    this.checkDataEventBeforeSaveAndSend();
                },1000);
            }else{
                this.handleBeforeSave();
                setTimeout(()=>{
                    this.checkDataEventBeforeSaveAndSend();
                },1000);
            }
        }
    }

    closeComponentEdit(event){
        if (event.detail.action=='Back'){
        this.showComponentBase = true;
        this.showComponentDetails = false;
        this.showComponentEdit = false;
        this.showAttachement = false;
        this.isUpdate = false;
        }
    }

    
    closeComponentUpdate(event){
        if (event.detail.action=='Back'){
        this.showComponentDetails = true;
        this.showComponentBase = false;
        this.showComponentEdit = false;
        this.isUpdate = false;
        }
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
        if (event.detail.action=='Back'){
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
        if (event.detail.action=='Send'){
            this.startSpinner(true);
            this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
            console.log('eid----->', this.recordId);
            sendEvent({evId: this.recordId})
            .then(result => {
                console.log('result ---> ', result);
                this.data_Event = result;
                this._evId = result[0].Id;
                console.log('result _evId---> ', this._evId);
                if(this._evId){
                    this.senNotification(this._evId);
                }
                // this.getNewEventList();
                // this.closeComponentEdit();
                this.goToEventDetail(result[0].Id);
                this.showToast('success', 'success !!', this.label.EvenSendSuccess);
            })
            .catch(error =>{
                this.error = error.message;
                this.showToast('error', 'Error', this.label.AddFailed);
            })
        }
    }
    // handleCancelSave(){
    //     this.startSpinner(true);
    //     if(this.state==''){
    //         console.log('@@@ --->  TRUE', this.evId_ForFile);
    //         cancelEven({eId: this.evId_ForFile})
    //         .then(result => {
    //             console.log('result ---> ', result);
    //             this.getNewEventList();
    //             this.closeComponentEdit();
    //             window.console.log('result ===> ', result);
    //         })
    //         .catch(error => {
    //             this.error = error.message;
    //             this.showToast('error', 'Error', this.label.AddFailed);
    //         });
            
    //     }else if(this.error=='error'){
    //         this.showToast('error', 'Error', this.label.AddFailed);
    //     }
    // }
    checkDataEventBeforeUpdate(){
        if(this.fileId){
            this.handleClick();
            if(this.messageOfUpdate=='Event has been already sent'){
                this.showToast('info', 'Toast Info', this.label.EvenApproved);
                
                this.backToDetails();
            }
            else{
                // this.closeComponentUpdate();
                this.backToDetails();
                this.showToast('success', 'success !!', this.label.EvenUpdateS);
            }
        }else{
            if(this.messageOfUpdate=='Event has been already sent'){
                this.showToast('info', 'Toast Info', this.label.EvenApproved);
                
                this.backToDetails();
            }
            else{
                // this.closeComponentUpdate();
                this.backToDetails();
                this.showToast('success', 'success !!', this.label.EvenUpdateS);
            } 
        }
    }
    handleUpdateEvent(event){
        if (event.detail.action=='Update'){
            console.log('bool1 bool1---> ', this.bool1);
            if(this.bool1==true){
                this.handleBeforeUpdate();
                setTimeout(()=>{
                    this.checkIdOfFileBeforeSaveOrBeforeUpdate();
                    this.checkDataEventBeforeUpdate();
                },1000);
            }else{
                this.handleBeforeUpdate();
                setTimeout(()=>{
                    this.checkDataEventBeforeUpdate();
                },1000);
            }
        }
    }
    checkDataEventBeforeUpdateAndSendEvent(){
        window.console.log('fileId ===> fileId', this.fileId);
        if(this.fileId){
            this.handleClick();
            window.console.log('Id ===> id', this._evId);
            if(this._evId){
                console.log('Id ===> true');
                this.senNotification(this._evId);
            }
            setTimeout(()=>{
                this.backToDetails();
                this.showToast('success', 'success !!', this.label.EvenUpdateSS);
            },1000);
        }else{
            window.console.log('Id2 ===> id2', this._evId);
            if(this._evId){
                console.log('Id2 ===>  true');
                this.senNotification(this._evId);
            }
            setTimeout(()=>{
                this.backToDetails();
                this.showToast('success', 'success !!', this.label.EvenUpdateSS);
            },500);
        }
    }
    handleUpdateAndSendEvent(event){
        if (event.detail.action=='Update And Send'){
            if(this.bool1==true){
                this.handleBeforeUpdateAndSendEvent();
                setTimeout(()=>{
                    this.checkIdOfFileBeforeSaveOrBeforeUpdate();
                    this.checkDataEventBeforeUpdateAndSendEvent();
                },1000);
            }else{
                this.handleBeforeUpdateAndSendEvent();
                setTimeout(()=>{
                    this.checkDataEventBeforeUpdateAndSendEvent();
                },1000);
            }
        }    
    }

    handledeleteEvent(event){debugger
        if (event.detail.action=='Yes I m sure'){
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
    closeModalDelete(event){
        if (event.detail.action=='Cancel'){
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
                                this.hidenButton = false;
                                this.displayButton = false;
                                this.displayButton2 = true;
                                console.log('event --> ' , result);
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
                                console.log('data0--->', this.data0);
                                this.eventinformationEdite = result.map(obj => {
                                    var newobj={};
                                        newobj.Id = obj.Id;
                                        newobj.EventName=obj.Name;
                                        newobj.ContactName=obj.Contact_Id__r.Name;
                                        newobj.Description=obj.Description__c;
                                        newobj.StartDate= obj.Start_Dates__c.split('T')[0]+'  à '+ obj.Start_Dates__c.split('T')[1].substring(0,5); 
                                        newobj.EndDate= obj.End_Dates__c.split('T')[0]+'  à '+obj.End_Dates__c.split('T')[1].substring(0,5);
                                        newobj.Status=obj.Status__c;
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
                                this.hidenButton = false;
                                this.displayButton = false;
                                console.log('event --> ' , result);
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
                                console.log('data0--->', this.data0);
                                this.eventinformationEdite = result.map(obj => {
                                    var newobj={};
                                        newobj.Id = obj.Id;
                                        newobj.EventName=obj.Name;
                                        newobj.ContactName=obj.Contact_Id__r.Name;
                                        newobj.Description=obj.Description__c;
                                        newobj.StartDate= obj.Start_Dates__c.split('T')[0]+'  à '+ obj.Start_Dates__c.split('T')[1].substring(0,5); 
                                        newobj.EndDate= obj.End_Dates__c.split('T')[0]+'  à '+obj.End_Dates__c.split('T')[1].substring(0,5);
                                        newobj.Status=obj.Status__c;
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
                                console.log('event --> ' , result);
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
                                console.log('data0--->', this.data0);
                                this.eventinformationEdite = result.map(obj => {
                                    var newobj={};
                                        newobj.Id = obj.Id;
                                        newobj.EventName=obj.Name;
                                        newobj.ContactName=obj.Contact_Id__r.Name;
                                        newobj.Description=obj.Description__c;
                                        newobj.StartDate= obj.Start_Dates__c.split('T')[0]+'  à '+ obj.Start_Dates__c.split('T')[1].substring(0,5); 
                                        newobj.EndDate= obj.End_Dates__c.split('T')[0]+'  à '+obj.End_Dates__c.split('T')[1].substring(0,5);
                                        newobj.Status=obj.Status__c;
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
                        }else{
                            this.displayButton = false;
                            this.hidenButton = false;
                            console.log('event --> ' , result);
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
                            console.log('data0--->', this.data0);
                            this.eventinformationEdite = result.map(obj => {
                                var newobj={};
                                    newobj.Id = obj.Id;
                                    newobj.EventName=obj.Name;
                                    newobj.ContactName=obj.Contact_Id__r.Name;
                                    newobj.Description=obj.Description__c;
                                    newobj.StartDate= obj.Start_Dates__c.split('T')[0]+'  à '+ obj.Start_Dates__c.split('T')[1].substring(0,5); 
                                    newobj.EndDate= obj.End_Dates__c.split('T')[0]+'  à '+obj.End_Dates__c.split('T')[1].substring(0,5);
                                    newobj.Status=obj.Status__c;
                                return newobj;
                            });
                            this.data = this.eventinformationEdite;
                            console.log('eventinformationEdite--->', this.eventinformationEdite);
                            // this.optionsStatus();
                            this.eventDetails =[
                                {
                                    label: this.label.Name, 
                                    name:'Name',
                                    type:'text',
                                    value:this.eventinformationEdite[0].EventName,
                                    required:true,
                                    ly_md:'12', 
                                    ly_lg:'12'
                                },
                                {
                                    label: this.label.StartDate,
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
        console.log('event --> ' , result);
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
        console.log('data0--->', this.data0);
        this.eventinformationEdite = result.map(obj => {
            var newobj={};
                newobj.Id = obj.Id;
                newobj.EventName=obj.Name;
                newobj.ContactName=obj.Contact_Id__r.Name;
                newobj.Description=obj.Description__c;
                newobj.StartDate= obj.Start_Dates__c.split('T')[0]+'  à '+ obj.Start_Dates__c.split('T')[1].substring(0,5); 
                newobj.EndDate= obj.End_Dates__c.split('T')[0]+'  à '+obj.End_Dates__c.split('T')[1].substring(0,5);
                newobj.Status=obj.Status__c;
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
    openfileUploadForUpdate(event) { 
        this.bool1 = true;
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
        this.showComponentDetails = true;
    }
    handleEdit(event){
        if (event.detail.action=='Edit'){
            this.handleBeforeEdit();
            this.buildformEdit();
            this.showComponentBase = false;
            this.showComponentDetails = false;
            this.isUpdate = true;
        }
    }
    // handleOpenComponentSave(){ 
    //     this.showComponentEdit = true;
    //     this.buildform();
    //     this.isUpdate = false;
    //     this.showComponentBase = false;
    //     this.showAttachement = false;
    // }
    handleOpenComponentSave(event){
        if (event.detail.action=='New Event') {
            this.showComponentEdit = true;
            this.buildform();
            this.isUpdate = false;
            this.showComponentBase = false;
            this.showAttachement = false;
        }
    }
    handleSaveEvent(event){
        if (event.detail.action=='Save') {
            // this.doSave(true,this.bool);
            if(this.bool==true){
                this.handleBeforeSave();
                setTimeout(()=>{
                    this.checkIdOfFileBeforeSaveOrBeforeUpdate();
                    this.checkDataEventBeforeSave();
                },1000);
            }else{
                this.handleBeforeSave();
                this.checkDataEventBeforeSave();
                setTimeout(()=>{
                    this.checkDataEventBeforeSave();
                },1000);
            }
        }
    }
    detailsActionsSave=[
        {   variant:"brand-outline",
            class:" slds-var-m-right_medium",
            label:"New Event",
            name:'New Event',
            title:"New",
            iconName:this.icon.Add,
        }
    ]
    // Start New change 
    detailsActionsSaveEvent=[
        {   variant:"brand-outline",
            class:" slds-m-right_medium",
            label:"Save",
            name:'Save',
            title:"Save",
            iconName:this.icon.Save,
        }
    ]
    // End New change
    //----------------------started---------------------------------------
    detailsSaveAndSendEvent=[
        {   variant:"brand-outline",
            class:" slds-m-right_medium",
            label:"SaveAndSend",
            name:'SaveAndSend',
            title:"SaveAndSend",
            iconName:this.icon.Save,
        }
    ]
    detailsCloseComponentEdit=[
        {   
            variant:"brand-outline",
            // class:" slds-m-left_medium",
            
            label:"Back",
            name:'Back',
            title:"Back",
            iconName:this.icon.Back,
        }
    ]
    detailspredeleteEvent=[
        {   
            variant:"brand-outline",
            // class:" slds-m-left_medium",
            
            label:this.label.Delete,
            name:'Delete',
            title:"Delete",
            iconName:this.icon.Delete,
        }
    ]
    detailspreEditEvent=[
        {   
            variant:"brand-outline",
            // class:" slds-m-left_medium",
            
            label:this.label.Edit,
            name:'Edit',
            title:"Edit",
            iconName:this.icon.Edit,
        }
    ]
    detailspreSendEvent=[
        {   
            variant:"brand-outline",
            // class:" slds-m-left_medium",
            
            label:this.label.Send,
            name:'Send',
            title:"Send",
            iconName:this.icon.submit,
        }
    ]
    detailsUpdateEvent=[
        {   variant:"brand-outline",
            class:" slds-m-right_medium",
            label:this.label.Update,
            name:'Update',
            title:"Update",
            iconName:this.icon.Save,
        }
    ]
    detailsUpdateAndSendEvent=[
        {   variant:"brand-outline",
            class:" slds-m-right_medium",
            label:this.label.UpdateAndSend,
            name:'Update And Send',
            title:"Update And Send",
            iconName:this.icon.Save,
        }
    ]
    detailsDeleteEvent=[
        {   variant:"brand-outline",
            class:" slds-m-right_medium",
            label:this.label.ok_confirm,
            name:'Yes I m sure',
            title:"Yes I m sure",
            iconName:this.icon.approve,
        }
    ]
    detailsModalDelete=[
        {   variant:"brand-outline",
            class:" slds-m-right_medium",
            label:this.label.Cancel,
            name:'Cancel',
            title:"Cancel",
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
        location.reload();
        this.showAttachement = false;
        this.showComponentDetails = true;
    }
    handleCancelUpdate(){
        this.showAttachement = false;
        this.showComponentEdit = true;
    }
    handlepredeleteEvent(event){
        if (event.detail.action=='Delete'){
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