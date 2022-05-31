import { LightningElement, wire, api, track } from 'lwc';
// import getMyEvent from '@salesforce/apex/RH_EventController.getMyEvent';
import getEventEdite from '@salesforce/apex/RH_EventController.getEventEdite';
import getLatestEvents from '@salesforce/apex/RH_EventController.getEventList';
import getEvent from '@salesforce/apex/RH_EventController.getEvent';
import uploadFile from '@salesforce/apex/RH_EventController.uploadFile'
import deleteFile from '@salesforce/apex/RH_EventController.deleteFile'

import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';
//#################################### Add Event ##################################################  

import getPicklistStatus from '@salesforce/apex/RH_EventController.getPicklistStatus';
import saveEvenWithoutStatus from '@salesforce/apex/RH_EventController.saveEvenWithoutStatus';
import saveEven from '@salesforce/apex/RH_EventController.saveEvent';
import cancelEven from '@salesforce/apex/RH_EventController.cancelEven';
import sendEvent from '@salesforce/apex/RH_EventController.sendEvent';
import saveAndSendEvent from '@salesforce/apex/RH_EventController.saveAndSendEvent';
import getRelatedFilesByRecordId from '@salesforce/apex/RH_EventController.getRelatedFilesByRecordId';
import checkcontentDocumentByRcrdId from '@salesforce/apex/RH_EventController.checkcontentDocumentByRcrdId';
import checkcontentDocumentId from '@salesforce/apex/RH_EventController.checkcontentDocumentId';
import updateEven from '@salesforce/apex/RH_EventController.updateEven';
import updateAndSendEven from '@salesforce/apex/RH_EventController.updateAndSendEven'; 
import checkStatus from '@salesforce/apex/RH_EventController.checkStatus';
import deleteEvent from '@salesforce/apex/RH_EventController.deleteEvent';
import getIdUserCEO from '@salesforce/apex/RH_EventController.getIdUserCEO';
import sendNotif from '@salesforce/apex/RH_EventController.sendNotifications';
//import getMyEventManager from '@salesforce/apex/RH_EventController.getMyEventManager';
// importing to show toast notifictions
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Rh_Event extends  NavigationMixin(LightningElement) {
    showAttachement = false;
    showComponentBase = true;
    showComponentEdit = false;
    showComponentDetails = false;
    showModalDelete = false;
    disable = false;
    isFile = false;
    isUpdate = false;
    hidenButton = true;
    displayButton = true;
    updateSave = false;
    eventinformation = {};
    eventinformationEdite = {};
    eventDetails;
    fileData;
    file;
    fileId;
    contentDocId;
    _evId;
    _dataEvent;
    evId_ForFile;
    state;
    error;
    _eventData = {};
    strEventData;
    strUpdatEven;
    @api recordId;
    @api contactId;
    @api eventId;
    contentDocIdList = [];
    filesList =[];
    filesLists = [];
    @track datas = [];
    @track wiredEventList = [];
    @track inputsItems = [];
    @track StatusList =[];
    @track EventData = {
        Name:'',       
        Description:'',  
        StartDate:'', 
        EndDate:'',
        Status:'',
    };
    columns = [
        // { label: 'Id', fieldName: 'rowId' },
        { label: 'File Name', fieldName: 'FileName', type: 'text', sortable: true },
        { 
            label: 'Download', 
            fieldName: 'Download',  
            type: 'url', 
            typeAttributes: {
                label: { fieldName: 'Download' }, 
                target: '_blank'}, 
                sortable: true },
        {
            label: 'Download',
            type: 'button-icon',
            typeAttributes: {
                name: 'Download',
                iconName: 'action:download',
                title: 'Download',
                variant: 'border-filled',
                alternativeText: 'Download'
            }
        },
        {
            label: 'Delete File',
            type: 'button-icon',
            typeAttributes: {
                name: 'DeleteFile',
                iconName: 'action:delete',
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
        this.iconsrc= this.iconsrc || 'utility:people';
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
        EventName:'Event Name', 
        ContactName: 'Contact Name',
        Description: 'Description',
        StartDate: 'Start Date',
        EndDate: 'End Date',
        Status:'Status'
    };
    fieldsToShow={ 
        // EventName:'Event Name',
        // ContactName: 'Contact Name',
        Description: 'Description',
        StartDate: 'Start Date',
        EndDate: 'End Date',
        Status:'Status'
    };

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
                "StartDate" : elt.Start_Date__c,
                "EndDate" : elt.End_Date__c,
                "Status" : elt.Status__c,
                "Description" :  str,

                icon:"standard:people", 
                title: elt.Name,
                class: elt.Status__c=='Rejected'? 'banned': elt.Status__c=='Submitted'? 'frozen': 'active',
                keysFields:self.keysFields,
                keysLabels:self.keysLabels,
                fieldsToShow:self.fieldsToShow,
            }
         
            console.log('@@@@@objectReturn', objetRep);
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
        var pagenname ='Event'; //request page nam
        let states={'recordId': recordid}; //event.currentTarget.dataset.id , is the recordId of the request
        
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
        this.initDefault();
        this.optionsStatus();
    }
    optionsStatus() {
        getPicklistStatus()
            .then(result => {
                let option = [];
                for(let i=0; i<result.length; i++) {
                    option.push(result[i].value);
               }
               let tab = option.pop();
               let tab1 = option.pop();
               console.log('tab-->', tab);
               console.log('tab1-->', tab1);
               console.log('option-->', option);
               this.StatusList = option.map(elt =>({ label:elt ,value:elt}));
               this.StatusList;
               console.log('StatusList-->', tab);
            })
            .catch(error => {
                // TODO Error handling
            });
        return this.StatusList;
    }

    handleSaveAndSendEvent(){
        if(this.fileId){
            this.handleClick();
        }
        console.log('@@@_eventData ---> ', this._eventData);
        if(this.state==''){
            console.log('@@@ --->  TRUE', this.evId_ForFile);
            saveAndSendEvent({ objEven: this._eventData, eId: this.evId_ForFile})
            .then(result => {
                this._dataEvent = result;
                this._evId = result[0].Id;
                console.log('result _evId---> ', this._evId);
                if(this._evId){
                    this.senNotification(this._evId);
                }
                this.getNewEventList();
                this.closeComponentEdit();
                this.showToast('Success', 'success !!', 'Event Add Successfully And send to CEO !!');
            })
            .catch(error => {
                this.error = error.message;
                this.showToast('error', 'Error', 'Add failed');
            });
            
        }else if(this.error=='error'){
            this.showToast('error', 'Error', 'Add failed');
        }
    }
    senNotification(evId){
        console.log('@@senNotification User evId --> ' , evId);
        getIdUserCEO({})
        .then(result =>{
            console.log('@@senNotification User data --> ' , result);
            for(let i=0; i<result.length; i++){
                console.log('@@@ All IDUSER --> ' , result[i].Id);
                if(result[i].UserRole.Name=='CEO'){
                    console.log('@@@ IDUSER CEO --> ' , result[i].Id);
                    let status = this._dataEvent[0].Status__c;
                    let desc = this._dataEvent[0].Description__c;
                    console.log('@@@ status || desc --> ' , status +' || '+ desc);
                    sendNotif({strBody:desc, pgRefId:evId, strTargetId:result[i].Id, strTitle:status, setUserIds:result[i].Id})
                        .then(result =>{
                            if (result?.error) {
                                console.error(result?.msg);
                            }else{
                                console.log('event-->   Success');
                                this.showToast('Success', 'Success', 'Event Submitted Successfully');
                            }
                        }).catch(err =>{
                            console.error('error',err)
                        })
                }
            }
        })
        .catch(err =>{
            console.error('error',err);
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
    handleBeforeSave(){debugger
        let ret1;
        let inputs= {};
        let ret = this.template.querySelector('c-rh_dynamic_form').save();
        ret1 = ret['outputs'];
        for(let key in ret1) {
            inputs[ret1[key]['label']] = ret1[key]['value'];
        }
        this.EventData.Name = inputs['Event Name'];
        this.EventData.Description = inputs['Description'];
        this.EventData.Status = inputs['Status'];
        let currentStartDate = inputs['Start date'];
        let today = this.addDays();
        var elt = currentStartDate.split('-');
        let j = elt[2];
        let m = elt[1];
        let a = elt[0];
        console.log('### today.m----->  ',today.j + '-' + today.m);
        console.log('### m----->  ', j + '-' + m);
        if(j<today.j || m<today.m){
            console.log('### StartDate----->  false');
            this.showToast('info', 'Toast Info', 'Your start date cannot be less than today\'s !');
        }else{
            console.log('### StartDate----->  true');
            this.EventData.StartDate = currentStartDate;
            let currentEndDate = inputs['End date'];
            var _elt = currentEndDate.split('-');
            let _j = _elt[2];
            let _m = _elt[1];
            let _a = _elt[0];
            console.log('### m----->  ',j + '-' + m);
            console.log('### _m----->  ', _j + '-' + _m);
            if(_j<j || _m<m){
                this.showToast('info', 'Toast Info', 'Your end date cannot be less than start date !');
                console.log('### EndDate----->  false');
            }else{
                console.log('### EndDate----->  true');
                this.EventData.EndDate = currentEndDate;
                var jsonEventData = JSON.stringify(this.EventData);
                this.strEventData = jsonEventData;
        
                console.log('### strEventData----->', this.strEventData);
                saveEvenWithoutStatus({ objEven: jsonEventData})
                    .then(result => {
                        this._eventData = JSON.stringify(result);
                        console.log('_eventData ---> ', this._eventData);
                        this.evId_ForFile = result.Id;
                        this.state = result.Status__c;
                        console.log('evId_ForFile ---> ', this.evId_ForFile);
                    })
                    .catch(error => {
                        this.error = error.message;
                        // this.showToast('error', 'Error', 'Add failed');
                    });
                this.nextToAttachementSave();
            }
        }
    }
    handleSaveEvent(){
        if(this.fileId){
            this.handleClick();
        }
        console.log('@@@_eventData ---> ', this._eventData);
        if(this.state==''){
            console.log('@@@ --->  TRUE', this.evId_ForFile);
            saveEven({ objEven: this._eventData, eId: this.evId_ForFile})
            .then(result => {
                console.log('result ---> ', result);
                this.getNewEventList();
                this.closeComponentEdit();
                window.console.log('result ===> ', result);
                this.showToast('Success', 'Success !!', 'Event Add Successfully but Not send to CEO!!');
            })
            .catch(error => {
                this.error = error.message;
                this.showToast('error', 'Error', 'Add failed');
            });
            
        }else if(this.error=='error'){
            this.showToast('error', 'Error', 'Add failed');
        }
             
    }
    handleSendEvent(){
        // this.startSpinner(true);
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        console.log('eid----->', this.recordId);
        sendEvent({evId: this.recordId})
        .then(result => {
            console.log('result ---> ', result);
            this._dataEvent = result;
            this._evId = result[0].Id;
            console.log('result _evId---> ', this._evId);
            if(this._evId){
                this.senNotification(this._evId);
            }
            this.getNewEventList();
            this.closeComponentEdit();
            this.showToast('success', 'success !!', 'Event Send Successfully !!');
        })
        .catch(error =>{
            this.error = error.message;
            this.showToast('error', 'Error', 'Add failed');
        })
    }
    handleCancelSave(){
        if(this.state==''){
            console.log('@@@ --->  TRUE', this.evId_ForFile);
            cancelEven({eId: this.evId_ForFile})
            .then(result => {
                console.log('result ---> ', result);
                this.getNewEventList();
                this.closeComponentEdit();
                window.console.log('result ===> ', result);
            })
            .catch(error => {
                this.error = error.message;
                this.showToast('error', 'Error', 'Add failed');
            });
            
        }else if(this.error=='error'){
            this.showToast('error', 'Error', 'Add failed');
        }
    }
    handleBeforeUpdate(){debugger
        this.isFile = true;
        let ret1;
        let inputs= {};
        let ret = this.template.querySelector('c-rh_dynamic_form').save();
        ret1 = ret['outputs'];
        console.log('ret1----->', ret1);
        for(let key in ret1) {
            inputs[ret1[key]['label']] = ret1[key]['value'];
        }
        this.EventData.Name = inputs['Event Name'];
        this.EventData.Description = inputs['Description'];
        this.EventData.StartDate = inputs['Start date'];
        this.EventData.Status = inputs['Status'];
        this.EventData.EndDate = inputs['End date'];
        var updatEven = JSON.stringify(this.EventData);
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        this.strUpdatEven = updatEven;
        console.log('eid----->', this.recordId);
        console.log('strUpdatEven----->', this.strUpdatEven);
        this.nextToAttachementUpdate();
    }
    handleUpdateEvent(){
        if(this.fileId){
            this.handleClick();
        }
        updateEven({ updEven: this.strUpdatEven, eId: this.recordId})
            .then(result => {
                this.data = result;
                window.console.log('result ===> ', result);
                // if(result[0].Message__c=='No right to modify the event'){
                //     this.showToast('info', 'Toast Info', 'You no longer have the right to modify the event !');
                //     this.closeComponentUpdate();
                // }else 
                if(result[0].Message__c=='Event has been already sent'){
                    this.showToast('info', 'Toast Info', 'This event has been already approved !');
                    
                    this.backToDetails();
                }
                // else if(result[0].Message__c=='Event has been already rejected'){
                //     this.showToast('info', 'Toast Info', 'This event has been already rejected !');
                //     this.closeComponentUpdate();
                // }
                else{
                    // this.closeComponentUpdate();
                    this.backToDetails();
                    this.showToast('success', 'success !!', 'Event Update Successfully !!');
                }
            })
            .catch(error => {
                this.error = error.message;
                this.showToast('error', 'Error', 'Update failed');
            });
    }
    handleCancelUpdate(){
        this.showAttachement = false;
        this.showComponentEdit = true;
    }
    handleUpdateAndSendEvent(){debugger
        if(this.fileId){
            this.handleClick();
        }
        updateAndSendEven({ updEven: this.strUpdatEven, eId: this.recordId})
            .then(result => {
                this._dataEvent = result;
                this._evId = result[0].Id;
                console.log('result _evId---> ', this._evId);
                window.console.log('result ===> ', result);
                if(this._evId){
                    this.senNotification(this._evId);
                }
                this.backToDetails();
                this.showToast('success', 'success !!', 'Event Update Successfully and send to CEO !!');
            })
            .catch(error => {
                this.error = error.message;
                this.showToast('error', 'Error', 'Update failed');
            });
    }
    handlepredeleteEvent(){
        this.showModalDelete=true;
    }
    handledeleteEvent(){debugger
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
                            this.closeModalDelete();
                            this.showToast('info', 'Toast Info', 'You don\'t have right to deletion !!');
                }else{
                    switch (result[0].Status__c) {
                        case 'Submitted':
                            this.closeModalDelete();
                            this.showToast('info', 'Toast Info', 'Sorry you no longer have right deleted');
                                break;
                        default:
                            this.closeModalDelete();
                            this.closeComponentDetails();
                            this.showToast('success', 'success !!', 'Event Delete Successfully!!');
                                break;
                    }
                }
            })
            .catch(error => {
                // TODO Error handling
            });
    }
    closeModalDelete(){
        this.showModalDelete=false;
    }
    handleBeforeEdit(){
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        console.log('eid----->', this.recordId);
        checkStatus({evid : this.recordId})
        .then(result => {
            this.data = result;
            if(result.Message__c=='No right to modify the event'){
                this.showToast('info', 'Toast Info', 'You no longer have the right to modify the event !');
                this.handleOpenComponent();
            }else{
                this.showComponentEdit = true;
                this.updateSave = true;
                isUpdate = false;
            }
        })
        .catch(error => {
            // TODO Error handling
        });
    }
    getEventDetails(eventId) {debugger
        // this.startSpinner(true);
        getEvent({evId:eventId})
        .then(result =>{
            console.log('@@result Status__c--> ' , result);
            if(result.Status__c=='Rejected' ){
                console.log('@@result Status__c--> ' , result.Status__c);
                this.hidenButton = false;
            }else if(result.Status__c=='Submitted'){
                this.hidenButton = false;
                this.displayButton = false;
            }else{
                console.log('@@result Status__c--> ' , result.Status__c);
                this.hidenButton = true;
                this.displayButton = true;
            }
        })
        console.log('eventId--> ' , eventId);
        getEventEdite({evenId: eventId})
        .then(result =>{
            if (result.error) {
                console.error(result.msg);
            }else{
                console.log('event --> ' , result);
                this.eventinformationEdite = result.map(obj => {
                    var newobj={};
                        newobj.Id = obj.Id;
                        newobj.EventName=obj.Name;
                        newobj.ContactName=obj.Contact_Id__r.Name;
                        newobj.Description=obj.Description__c;
                        newobj.StartDate=obj.Start_Date__c;
                        newobj.EndDate=obj.End_Date__c;
                        newobj.Status=obj.Status__c;
                    return newobj;
                });
                this.data = this.eventinformationEdite;
                console.log('eventinformationEdite--->', this.eventinformationEdite);
                this.optionsStatus();
                this.eventDetails =[
                    {
                        label:'Event Name',
                        name:'Name',
                        type:'text',
                        value:this.eventinformationEdite[0].EventName,
                        required:true,
                        ly_md:'12', 
                        ly_lg:'12'
                    },
                    {
                        label:'Start date',
                        name:'StartDate',
                        type:'date',
                        value:this.eventinformationEdite[0].StartDate,
                        required:true,
                        ly_md:'12', 
                        ly_lg:'12'
                    },
                    {
                        label:'Status',
                        name:'Status',
                        picklist: true,
                        value:this.eventinformationEdite[0].Status,
                        required:true,
                        ly_md:'12', 
                        ly_lg:'12'
                    },
                    {
                        label:'End date',
                        name:'EndDate',
                        type:'date',
                        value:this.eventinformationEdite[0].EndDate,
                        ly_md:'12', 
                        ly_lg:'12'
                    },
                    {
                        label:'Description',
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
                    this.filesLists = result.data.map(elt =>{
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
                        // this.contentDocIdList.push(this.filesList[i].docId);
                    }
                    console.log('@@@ contentDocId @@@ ===> ', this.contentDocIdList);
                    let _data =[];
                    for(let key in result['data']) {
                        _data.push({rowId: result['data'][key].ContentDocumentId, FileName: result['data'][key].Name,Id:result[key].Id});
                    }
                    this.filesList = _data;
                    console.log('-->',this.filesList);
                });
            }
        }).catch(err =>{
            console.error('error',err)
        })
    } 
    handleRowAction( event ) {
        const actionName = event.detail.action.name;
        const row = event.detail.row.Id;
        console.log('row--> ' , row);
        console.log('actionName--> ' , actionName); 
        switch (actionName) {
            case 'DeleteFile':
                checkcontentDocumentByRcrdId({recId:this.recordId})
                .then(result =>{
                    let rowId = result;
                    console.log('----> result' , rowId);
                    for(let i=0; i<this.contentDocIdList.length; i++){
                        if (rowId==this.contentDocIdList[i]){
                            this.contentDocId = rowId;
                            this.handleDeleteFile();
                        }
                    }
                })
                break;
            case 'Download':
                // this.template.querySelector('[data-id="1"]').click();
                break;
            default:
        }
    }
    buildform(){
        this.inputsItems = [
            {
                label:'Event Name',
                placeholder:'Enter your Event Name',
                name:'Name',
                type:'text',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Start date',
                placeholder:'Enter Start date',
                name:'StartDate',
                type:'date',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Description',
                placeholder:'Enter your Event Description',
                name:'Description',
                type:'textarea',
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'End date',
                placeholder:'Enter End date',
                name:'EndDate',
                type:'date',
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
                label:'Event Name',
                placeholder:'Enter your Event Name',
                name:'Name',
                type:'text',
                value:this.eventinformationEdite[0].EventName,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Start date',
                placeholder:'Enter Start date',
                name:'StartDate',
                type:'date',
                value:this.eventinformationEdite[0].StartDate,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Description',
                placeholder:'Enter your Event Description',
                name:'Description',
                type:'textarea',
                value:this.eventinformationEdite[0].Description,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'End date',
                placeholder:'Enter End date',
                name:'EndDate',
                type:'date',
                value:this.eventinformationEdite[0].EndDate,
                ly_md:'6', 
                ly_lg:'6'
            },
            // {
            //     label:'Status',
            //     placeholder:'Select Status',
            //     name:'Status',
            //     picklist: true,
            //     options:this.StatusList,
            //     value:this.eventinformationEdite[0].Status,
            //     required:true,
            //     ly_md:'12', 
            //     ly_lg:'12'
            // },
        ];
    }
    openfileUpload(event) { 
        const file = event.target.files[0]
        var reader = new FileReader()
        reader.onload = () => {
            var base64 = reader.result.split(',')[1]
            this.fileData = {
                'filename': file.name,
                'base64': base64,
                'recordId': this.evId_ForFile
            }
            this.fileId = this.fileData.recordId;
            console.log('File Id ===> ',this.fileId);
            console.log('File ===> ',this.fileData);
        }
        reader.readAsDataURL(file)
    }
    openfileUploadForUpdate(event) { 
        const file = event.target.files[0]
        var reader = new FileReader()
        reader.onload = () => {
            var base64 = reader.result.split(',')[1]
            this.fileData = {
                'filename': file.name,
                'base64': base64,
                'recordId': this.recordId
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
        // deleteFile({recId: this.recordId, docId:this.contentDocId})
        // .then(result=>{
        //     this.showToast('success', 'success !!', 'File Delete Successfully!!');
        //     window.location.reload();
        // })
    }
    handleClick(){
        const {base64, filename, recordId} = this.fileData
        uploadFile({ base64, filename, recordId })
        .then(result=>{
            this.fileData = null;
            this.isFile = true;
        })
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
    handleEdit(){
        this.handleBeforeEdit();
        this.buildformEdit();
        this.showComponentBase = false;
        this.showComponentDetails = false;
        this.isUpdate = true;
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
    detailsActionsSave=[
        {   variant:"brand-outline",
            class:" slds-m-right_medium",
            label:"New Event",
            name:'New Event',
            title:"New",
            iconName:"utility:add",
        }
    ]
    closeComponentDetails(){
        // this.startSpinner(true);
        this.recordId = undefined;
        this.goToEventDetail(this.recordId);
        this.getNewEventList();
        this.showComponentBase = true;
        this.showComponentDetails = false;
        this.showComponentEdit = false;
        this.isUpdate = false;
        // this.startSpinner(false);
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
        // checkcontentDocumentId({recId:this.recordId,docId:this.contentDocId})
        // .then(result =>{
        //     console.log('----> result' , result);
        //     if (result==true){
        //         this.disable = true;
        //         this.showAttachement = true;
        //         this.isUpdate = true;
        //         this.showComponentEdit = false;
        //     }else{
        //         this.disable = false;
        //         this.showAttachement = true;
        //         this.isUpdate = true;
        //         this.showComponentEdit = false;
        //     }
        // })
    }
    backToDetails(){
        location.reload();
        this.showAttachement = false;
        this.showComponentDetails = true;
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
    //################################## Add Event ##################################################
    // handleOpenComponent() {
    //     this.template.querySelector('c-rh_add_event').openModal();
    // }
}