import { LightningElement, wire, api, track } from 'lwc';
import getRelatedFilesByRecordId from '@salesforce/apex/RH_EventController.getRelatedFilesByRecordId';
import getMyEventManager from '@salesforce/apex/RH_EventController.getMyEventManager';
import getPicklistStatus from '@salesforce/apex/RH_EventController.getPicklistStatus';
import changeEventStatus from '@salesforce/apex/RH_EventController.changeEventStatus';
import getInfBaseUser from '@salesforce/apex/RH_EventController.getInfBaseUsers';
import getEventEdite from '@salesforce/apex/RH_EventController.getEventEdite';
import sendNotif from '@salesforce/apex/RH_EventController.sendNotifications';
import getEventInfo from '@salesforce/apex/RH_EventController.getEventInfos';
import getInfUser from '@salesforce/apex/RH_EventController.getInfoUsers';
import deleteEvent from '@salesforce/apex/RH_EventController.deleteEvent';
import getIdUser from '@salesforce/apex/RH_EventController.getIdUser';
import getEvent from '@salesforce/apex/RH_EventController.getEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class rh_Event_Management extends  NavigationMixin(LightningElement) {
    showComponentBase = true;
    showComponentDetailsForBaseUser = false;
    showComponentDetails = false;
    visible = true;
    displayButton = false;
    displayButtonCEO = false;
    showModalDelete = false;
    isApproved = false;
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
    @track datas = [];

    /**Start Display Icons */
    @api title;
    @api iconsrc;
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
        ContactName: 'Contact Name',
        Description: 'Description',
        StartDate: 'Start Date',
        EndDate: 'End Date',
        Status:'Status'
    };

    getEventManager(){
        this.datas=[];
        getMyEventManager()
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
                class: elt.Status__c=='Approved'? 'frozen': 'active',
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
        var pagenname ='event-management'; //request page nam
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
            this.getEventManager();
        }
        this.initDefault();
        this.optionsStatus();
        this.getInfoUser();
        this.getInfoBaseUser();
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

    getEventDetails(eventId) {debugger
        getEvent({evId:eventId})
        .then(result =>{
            console.log('@@ result --> ' , result);
                if(result.Status__c=='Submitted'){
                    this.displayButton = true;
                }else{
                    this.displayButton = false;
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
                    console.log('result-->',result);
                    this.filesList = Object.keys(result).map(id=>({
                    "label":result[id].obj.Title,
                    "value": result[id].obj.Title,
                    "fname": result[id].obj.Title,

                    "url":`data:application/octet-stream;base64,${result[id].link}`
                    }))
                    console.log('@@@ ===> ',this.filesList);
                });
            }
        }).catch(err =>{
            console.error('error',err)
        })
    }    
    getInfoUser(){
        getInfUser({}).then(result =>{
            if (result.error) {
                console.error(result.msg);
            }else{
                this.idUser = result;
                console.log('userinfo--> ' , this.idUser);
            }
        }).catch(err =>{
            console.error('error',err)
        })
    }
    getInfoBaseUser(){
        getInfBaseUser({}).then(result =>{
            if (result.error) {
                console.error(result.msg);
            }else{
                console.log('BaseUserinfo--> ' , result);
                this.IdBaseUser = result;
            }
        }).catch(err =>{
            console.error('error',err)
        })
    }
    sendNotification(){
        this.eventId = this.getUrlParamValue(window.location.href, 'recordId');
        console.log('eventId --> ' ,this.eventId);
        this.getEventInformation(this.eventId);

    }
    handleRejectEvent(){
        this.changeEventStatus(this.eventId);
        this.closeModalDelete();
    }
    handledeleteEvent(){debugger
        let _id = this.eventId;
        console.log('_id----->', this.eventId);
        deleteEvent({evid : this.eventId})
            .then(result => {
                this.data = result;
                console.log('result----->', result);
                console.log('res----->', result[0].Status__c);
                console.log('Message----->', result[0].Message__c);
                if(result[0].Status__c=='Submitted' && (result[0].Message__c=='Event do not send')){
                            this.closeModalDelete();
                            this.showToast('info', 'Toast Info', 'You should sent event before delete');
                }else if(result[0].Status__c=='Submitted' && (result[0].Message__c=='Right no allowed')){
                    this.closeModalDelete();
                    this.showToast('info', 'Toast Info', 'You don\'t have right to deletion !!');
                }else{
                    this.closeModalDelete();
                    this.showToast('success', 'Success!!', 'Event Delete Successfully!!');
                }
            })
            .catch(error => {
                // TODO Error handling
            });
    }
    handlepredeleteEvent(event){
        this.eventId = event.currentTarget.getAttribute("data-id");
        console.log('eid----->', this.eventId);
        this.visible = true;
        this.showModalDelete = true;
    }
    handleprerejectEvent(event){
        this.eventId = this.getUrlParamValue(window.location.href, 'recordId');
        // this.eventId = event.currentTarget.getAttribute("data-id");
        console.log('eventId --> ' ,this.eventId);
        this.visible = false;
        this.showModalDelete = true;
    }
    closeModalDelete(){
        this.showModalDelete = false;
    }
    changeEventStatus(evId){
        console.log('evId -- >' + evId);
        changeEventStatus({infoId:evId})
        .then(result =>{
            if (result.error) {
                console.error(result.msg);
            }else{
                console.log('@@@ Event --> ' , result);
                this.ContactId = result[0].Contact_Id__c;
                let desc = result[0].Description__c;
                let status = result[0].Status__c;
                if(result[0].Message__c=='Already approved'){
                    this.showToast('info', 'Toast Info', 'You cannot rejected an event already approved');
                }else if(this.ContactId){
                    console.log('@@@EventContact--> ' , this.ContactId);
                    getIdUser({idU: this.ContactId})
                    .then(result =>{
                        console.log('@@User data --> ' , result);
                        for(let i=0; i<result.length; i++){
                            if(result[i].UserRole.Name=='Base User'){
                                console.log('@@@ IDUSER --> ' , result[i].Id);
                                sendNotif({strBody:desc, pgRefId:evId, strTargetId:result[i].Id, strTitle:status, setUserIds:result[i].Id})
                                    .then(result =>{
                                        if (result?.error) {
                                            console.error(result?.msg);
                                        }else{
                                            console.log('event--> ' , result);
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
                console.log('@@@evenName--> ' , result[0].Status__c + ' @@@evenDescription--> '+ result[0].Description__c);
                const setUserIds = [];
                for(let i=0; i<this.IdBaseUser.length; i++){
                    setUserIds.push(this.IdBaseUser[i].Id);
                }
                setUserIds.push(this.idUser);
                console.log('setUserIds --> ' ,this.IdBaseUser);
                console.log('setUserIds --> ' ,setUserIds);
                console.log('userinfo--> ' , this.idUser);
            }
        })
        .catch(err =>{
            console.error('error',err);
        })
    }
    getEventInformation(evId){debugger
        console.log('evId -- >' + evId);
        getEventInfo({infoId:evId})
        .then(result =>{
            if (result.error) {
                console.error(result.msg);
            }else{
                console.log('@@@EventInfo--> ' , result[0]);
                console.log('@@@evenName--> ' , result[0].Name + ' @@@evenDescription--> '+ result[0].Description__c);
                const setUserIds = [];
                for(let i=0; i<this.IdBaseUser.length; i++){
                    setUserIds.push(this.IdBaseUser[i].Id);
                }
                setUserIds.push(this.idUser);
                console.log('setUserIds --> ' ,setUserIds);
                console.log('userinfo--> ' , this.idUser);
                if(result[0].Message__c && result[0].Message__c=='Already approved'){
                    this.showToast('info', 'Toast Info', 'This event has been already shared !');
                }else{
                    console.log('++++++event++++-->  notification');
                    sendNotif({strBody:result[0].Description__c, pgRefId:evId, strTargetId:this.idUser, strTitle:result[0].Name, setUserIds:setUserIds})
                    .then(result =>{
                        if (result?.error) {
                            console.error(result?.msg);
                        }else{
                            console.log('event--> ' , result);
                            this.showToast('Success', 'Success', 'Event Submitted Successfully');
                            this.getEventManager()//refresh list
                        }
                    }).catch(err =>{
                        console.error('error',err)
                    })
                }

            }
        }).catch(err =>{
            console.error('error',err);
        })
        // return this.EventInfo;
    }
    showToast(variant, title, message){
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);
    }
    handleOpenComponent() {
        this.showComponentBase = false;
        this.showComponentDetails = true;
    }
    closeComponentDetails(){
        this.recordId = undefined;
        this.goToEventDetail(this.recordId);
        this.getEventManager();
        this.showComponentBase = true;
        this.showComponentDetails = false;
    }
}