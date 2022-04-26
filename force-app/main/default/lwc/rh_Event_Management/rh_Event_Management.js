import { LightningElement, wire, api, track } from 'lwc';
import getMyEventManager from '@salesforce/apex/RH_EventController.getMyEventManager';
import sendNotif from '@salesforce/apex/RH_EventController.sendNotifications';
import getInfUser from '@salesforce/apex/RH_EventController.getInfoUsers';
import getInfBaseUser from '@salesforce/apex/RH_EventController.getInfBaseUsers';
import getEventInfo from '@salesforce/apex/RH_EventController.getEventInfos';


export default class Rh_Event_Management extends LightningElement {
    eventinformation = {};
    @track datas = [];
    @api
    title;
    @api
    iconsrc;
    visibleDatas;
    idUser;
    eventId;
    IdBaseUser = [];
    EventInfo = {};
    EventInfos = {};

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
        getMyEventManager({}).then(result =>{
            if (result.error) {
                console.error(result.msg);
            }else{
                console.log('event--> ' , result);
                this.eventinformation = result.map(obj => {
                    var newobj={};
                        newobj.Id=obj.Id
                        newobj.EventName=obj.Name;
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
                console.log('BaseUserinfo--> ' , result[0]);
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
    getEventInformation(evId){
        console.log('evId -- >' + evId);
        getEventInfo({infoId:evId}).then(result =>{
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
                sendNotif({strBody:result[0].Description__c, pgRefId:evId, strTargetId:this.idUser, strTitle:result[0].Name, setUserIds:setUserIds}).then(result =>{
                    if (result?.error) {
                        console.error(result?.msg);
                    }else{
                        console.log('event--> ' , result);
                    }
                }).catch(err =>{
                    console.error('error',err)
                })

            }
        }).catch(err =>{
            console.error('error',err);
        })
        return this.EventInfo;
    }

}