import { LightningElement, wire, api, track } from 'lwc';
// import getMyEvent from '@salesforce/apex/RH_EventController.getMyEvent';
import getEventEdite from '@salesforce/apex/RH_EventController.getEventEdite';
import getLatestEvents from '@salesforce/apex/RH_EventController.getEventList';
import initConfig from '@salesforce/apex/RH_EventController.InitFilter';
import getEvent from '@salesforce/apex/RH_EventController.getEvent';
import uploadFile from '@salesforce/apex/RH_EventController.uploadFile'
import deleteFile from '@salesforce/apex/RH_EventController.deleteFile'
import { NavigationMixin } from 'lightning/navigation'; 
import { labels } from 'c/rh_label';
import getPicklistStatus from '@salesforce/apex/RH_EventController.getPicklistStatus';
import saveEvenWithoutStatus from '@salesforce/apex/RH_EventController.saveEvenWithoutStatus';
import createEvent from '@salesforce/apex/RH_EventController.createEvent';
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

    Status=[];
    OrderBys=[];

    showAttachement = false;
    showComponentBase = true;
    showComponentEdit = false;
    showComponentDetails = false;
    showModalDelete = false;


    disable = false;
    isFile = false;
    bool = false;
    bool1 = false;
    isUpdate = false;
    hidenButton = true;
    displayButton = true;
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
    filterInputs=[];
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
    filter={
        status:null,
        startDate:null,
        endDate:null,
        isActive:null,
        orderBy:null,
        orderOn:null,
    }
    columns = [
        { label: 'File Name', fieldName: 'FileName', type: 'text', sortable: true },
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
        // Status:'Status'
    };

    get hasDetailsActions(){ return this.detailsActions?.length >0}
    get filterReady(){ return this.filterInputs?.length >0}
    get isAdmin() { return this.currUser?.isCEO || this.currUser?.isRHUser}
    get hasrecordid(){ return this.recordId?true:false; }

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
            //this.buildFilter();
            this.initFilter();
        }
        this.initDefault();
        this.optionsStatus();
    }

  initFilter(){
        // this.startSpinner(true)
        initConfig()
          .then(result => {
            console.log('Result INIT FILTER ');
            console.log(result);
            if (!result.error && result.Ok) {
                this.Status = result.Picklists?.Status__c;
                // this.roles = result.Picklists?.RH_Role__c;
                this.OrderBys = result.OrderBys;
                this.Status.unshift({
                    label:this.l.selectPlc,value:''
                });
                this.buildFilter();
            }else{
                this.showToast(WARNING_VARIANT,'ERROR Initialising', result.msg);
            }
          })
          .catch(error => {
            console.error('Error in calling :', error);
        }).finally(() => {
            // this.startSpinner(false)
        });
    }

    buildFilter(){
        /*{
            searchText:null,
            status:null,
            startDate:null,
            endDate:null,
            role:null,
            isActive:null,
            orderBy:null,
            orderOn:null,
        }*/
        
            
            this.filterInputs =[
            {
                label:this.l.Name,
                placeholder:this.l.srchNamePlc,
                name:'searchText',
                value: '',
                ly_md:'3', 
                ly_xs:'6', 
                ly_lg:'3'
            },
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
                label:'As',
                name:'orderOn',
                checked:true,
                type:'toggle',
                toggleActiveText:'DESC',
                toggleInactiveText:'ASC',
                ly_md:'6', 
                ly_lg:'6'
            }   
        ];

    }

    handleSubmitFilter(event) {
        const record=event.detail;
        console.log(`handleSubmitFilter record `, JSON.stringify(record) );
        this.filter={... this.filter ,...record ,
            orderOn: record.orderOn ? 'DESC' : 'ASC'};
        console.log(`handleSubmitFilter this.filter TO CALL `, JSON.stringify(this.filter) );
        
        this.getAllEmployees();
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

    doSaveSucces(isSave){
        this.showToast('Success', 'Success !!', 'Event Add Successfully but Not send to CEO!!');
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
                this.showToast('info', 'Toast Info', 'Your end date cannot be less than start date !');
                
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
                        this.showToast('error', 'Error', 'Fields Error');
                    });

            }
        }

        
    }
    handleBeforeSave(){
        let ret = this.template.querySelector('c-rh_dynamic_form').save();
        if (ret.isvalid) {
            const record=ret.obj;
            this.EventData=record;
            var jsonEventData = JSON.stringify(this.EventData);
            this.strEventData = jsonEventData;
            if (record.StartDate > record.EndDate ){
                this.showToast('info', 'Toast Info', 'Your end date cannot be less than start date !');
            }else{
                saveEvenWithoutStatus({ objEven: this.strEventData})
                .then(result => {
                    console.log('### result----->', result );
                    console.log('### res----->', result);
                    this._eventData = JSON.stringify(result);
                    console.log('_eventData ---> ', this._eventData);
                    this.evId_ForFile = result.Id;
                    this.state = result.Status__c;
                    console.log('evId_ForFile ---> ', this.evId_ForFile);
                })
                .catch(error => {
                    this.error = error.message;
                    this.showToast('error', 'Error', 'Fields Error');
                });
            }
            
        }
    }
    handleBeforeUpdate(){
        this.isFile = true;
        let ret = this.template.querySelector('c-rh_dynamic_form').save();
        const record = ret.obj;
        this.EventData = record;
        var updatEven = JSON.stringify(this.EventData);
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        this.strUpdatEven = updatEven;
        console.log('eid----->', this.recordId);
        console.log('strUpdatEven----->', this.strUpdatEven);
        updateEven({ updEven: this.strUpdatEven, eId: this.recordId})
        .then(result => {
            this.data = result;
            window.console.log('result ===> ', result);
            this.evId_ForFile = result[0].Id;
            this.messageOfUpdate = result[0].Message__c;
        })
        .catch(error => {
            this.error = error.message;
            this.showToast('error', 'Error', 'Update failed');
        });
    }
    handleBeforeUpdateAndSendEvent(){
        this.isFile = true;
        let ret1;
        let inputs= {};
        let ret = this.template.querySelector('c-rh_dynamic_form').save();
        const record = ret.obj;
        this.EventData = record;
        var updatEven = JSON.stringify(this.EventData);
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        this.strUpdatEven = updatEven;
        console.log('eid----->', this.recordId);
        console.log('strUpdatEven----->', this.strUpdatEven);
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
            this.showToast('error', 'Error', 'Update failed');
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
                    this.showToast('Success', 'Success !!', 'Event Add Successfully but Not send to CEO!!');
                })
                .catch(error => {
                    this.error = error.message;
                    this.showToast('error', 'Error', 'Add failed');
                });
                
            }else if(this.error=='error'){
                this.showToast('error', 'Error', 'Add failed');
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
                    this.showToast('Success', 'success !!', 'Event Add Successfully And send to CEO !!');
                })
                .catch(error => {
                    this.error = error.message;
                    this.showToast('error', 'Error', 'Add failed');
                });
                
            }else if(this.error=='error'){
                this.showToast('error', 'Error', 'Add failed');
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
    }
    handleSaveEvent(){
        // this.doSave(true,this.bool);
        if(this.bool==true){
            this.handleBeforeSave();
            setTimeout(()=>{
                this.checkIdOfFileBeforeSaveOrBeforeUpdate();
                this.checkDataEventBeforeSave();
            },500);
        }else{
            this.handleBeforeSave();
            setTimeout(()=>{
                this.checkDataEventBeforeSave();
            },500);
        }
           
    }
    handleSaveAndSendEvent(){
        if(this.bool==true){
            this.handleBeforeSave();
            setTimeout(()=>{
                this.checkIdOfFileBeforeSaveOrBeforeUpdate();
                this.checkDataEventBeforeSaveAndSend();
            },500);
        }else{
            this.handleBeforeSave();
            setTimeout(()=>{
                this.checkDataEventBeforeSaveAndSend();
            },500);
        }
    }
    handleSendEvent(){
        // this.startSpinner(true);
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
    checkDataEventBeforeUpdate(){
        if(this.fileId){
            this.handleClick();
            if(this.messageOfUpdate=='Event has been already sent'){
                this.showToast('info', 'Toast Info', 'This event has been already approved !');
                
                this.backToDetails();
            }
            else{
                // this.closeComponentUpdate();
                this.backToDetails();
                this.showToast('success', 'success !!', 'Event Update Successfully !!');
            }
        }else{
            if(this.messageOfUpdate=='Event has been already sent'){
                this.showToast('info', 'Toast Info', 'This event has been already approved !');
                
                this.backToDetails();
            }
            else{
                // this.closeComponentUpdate();
                this.backToDetails();
                this.showToast('success', 'success !!', 'Event Update Successfully !!');
            } 
        }
    }
    handleUpdateEvent(){
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
    checkDataEventBeforeUpdateAndSendEvent(){
        if(this.fileId){
            this.handleClick();
            if(this._evId){
                window.console.log('Id ===> id', this._evId);
                this.senNotification(this._evId);
            }
            this.backToDetails();
            this.showToast('success', 'success !!', 'Event Update Successfully and send to CEO !!');
        }else{
            if(this._evId){
                window.console.log('Id ===> id', this._evId);
                this.senNotification(this._evId);
            }
            this.backToDetails();
            this.showToast('success', 'success !!', 'Event Update Successfully and send to CEO !!');
        }
    }
    handleUpdateAndSendEvent(){
        if(this.bool1==true){
            this.handleBeforeUpdateAndSendEvent();
            setTimeout(()=>{
                this.checkIdOfFileBeforeSaveOrBeforeUpdate();
                this.checkDataEventBeforeUpdateAndSendEvent();
            },500);
        }else{
            this.handleBeforeUpdate();
            setTimeout(()=>{
                this.checkDataEventBeforeUpdateAndSendEvent();
            },500);
        }
             
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
                        type:'datetime',
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
                        type:'datetime',
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
        }).catch(err =>{
            console.error('error',err)
        })
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
                label:'Event Name',
                placeholder:'Enter your Event Name',
                name:'Name',
                type:'text',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Start',
                placeholder:'Enter Start date',
                name:'StartDate',
                type:'Datetime',
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
                label:'End',
                placeholder:'Enter End date',
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
                label:'Event Name',
                placeholder:'Enter your Event Name',
                name:'Name',
                type:'text',
                value:this.data0[0].EventName,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Start date',
                placeholder:'Enter Start date',
                name:'StartDate',
                type:'Datetime',
                value:this.data0[0].StartDate,
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Description',
                placeholder:'Enter your Event Description',
                name:'Description',
                type:'textarea',
                value:this.data0[0].Description,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'End date',
                placeholder:'Enter End date',
                name:'EndDate',
                type:'Datetime',
                value:this.data0[0].EndDate,
                ly_md:'12', 
                ly_lg:'12'
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
        deleteFile({recId: this.recordId, docId:this.contentDocId})
        .then(result=>{
            this.showToast('success', 'success !!', 'File Delete Successfully!!');
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
    handleCancelUpdate(){
        this.showAttachement = false;
        this.showComponentEdit = true;
    }
    handlepredeleteEvent(){
        this.showModalDelete=true;
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