import { LightningElement, wire, api, track } from 'lwc';
import getMyEventManager from '@salesforce/apex/RH_EventController.getMyEventManager';
import sendNotif from '@salesforce/apex/RH_EventController.sendNotifications';
import getInfUser from '@salesforce/apex/RH_EventController.getInfoUsers';
import getIdUser from '@salesforce/apex/RH_EventController.getIdUser';
import getInfBaseUser from '@salesforce/apex/RH_EventController.getInfBaseUsers';
import getEventInfo from '@salesforce/apex/RH_EventController.getEventInfos';
import changeEventStatus from '@salesforce/apex/RH_EventController.changeEventStatus';
import deleteEvent from '@salesforce/apex/RH_EventController.deleteEvent';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class Rh_Event_Management extends LightningElement {
    visible = false;
    showModalDelete = false;
    isApproved = false;
    eventinformation = {};
    @track datas = [];
    @api
    title;
    @api
    iconsrc;
    @track visibleDatas = [];
    idUser;
    eventId;
    contactid;
    IdBaseUser = [];
    EventInfo = {};
    EventInfos = {};
    wiredEventList;

    updateEventHandler(event){
        this.visibleDatas=[...event.detail.records]
        console.log(event.detail.records)
    }   
    initDefault(){
        this.title=this.title || 'User Informations';
        this.iconsrc= this.iconsrc || 'utility:people';
    }
    connectedCallback(){
        this.initDefault();
        this.getEventManager();
        this.getInfoUser();
        this.getInfoBaseUser();
    }
    getEventManager() {
        this.datas=[];
        getMyEventManager({}).then(result =>{
            this.wiredEventList = result;
            console.log('wiredEventList--> ' , this.wiredEventList);
            if (result.error) {
                console.error(result.msg);
            }else{
                console.log('event--> ' , result);
                this.eventinformation = result.map(obj => {
                    var newobj={};
                        newobj.Id=obj.Id
                        newobj.EventName=obj.Name;
                        newobj.ContactId=obj.Contact_Id__c;
                        newobj.ContactName=obj.Contact_Id__r.Name;
                        newobj.Description=obj.Description__c;
                        newobj.StartDate=obj.Start_Date__c;
                        newobj.EndDate=obj.End_Date__c;
                        newobj.Status=obj.Status__c;
                    return newobj;
                });
                console.log('eventManagerinformation--->', this.eventinformation);
                this.datas = this.eventinformation;
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
    sendNotification(event){
        this.eventId = event.currentTarget.getAttribute("data-id");
        console.log('eventId --> ' ,this.eventId);
        this.getEventInformation(this.eventId);

    }
    handlepRejectEvent(event){
        this.eventId = event.currentTarget.getAttribute("data-id");
        console.log('eventId --> ' ,this.eventId);
        this.changeEventStatus(this.eventId);
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
                            this.connectedCallback();
                            this.closeModalDelete();
                            // this.dispatchEvent(new ShowToastEvent({
                            // title: 'Toast Info',
                            // message: 'You should sent event before delete',
                            // variant: 'info',
                            // mode: 'dismissable'
                            // }), );
                            this.showToast('info', 'Toast Info', 'You should sent event before delete');
                }else{
                    this.closeModalDelete();
                    refreshApex(this.wiredEventList);
                    // this.dispatchEvent(new ShowToastEvent({
                    //     title: 'Success!!',
                    //     message: 'Event Delete Successfully!!',
                    //     variant: 'success'
                    // }), );
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
    getEventInformation(evId){
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
        return this.EventInfo;
    }
    showToast(variant, title, message){
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);
    }
}