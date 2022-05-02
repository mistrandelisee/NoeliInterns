import { LightningElement, wire, api, track } from 'lwc';
// import getMyEvent from '@salesforce/apex/RH_EventController.getMyEvent';
import getEventEdite from '@salesforce/apex/RH_EventController.getEventEdite';
import getLatestEvents from '@salesforce/apex/RH_EventController.getEventList';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';
//#################################### Add Event ##################################################  

import getPicklistStatus from '@salesforce/apex/RH_EventController.getPicklistStatus';
import saveEven from '@salesforce/apex/RH_EventController.saveEvent';
import updateEven from '@salesforce/apex/RH_EventController.updateEven';
import deleteEvent from '@salesforce/apex/RH_EventController.deleteEvent';
// importing to show toast notifictions
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Rh_Event extends  NavigationMixin(LightningElement) {
    showComponentBase = true;
    showComponentEdit = false;
    showComponentDetails = false;
    showModalDelete = false;
    isUpdate = false;
    eventinformation = {};
    eventinformationEdite = {};
    eventDetails;
    @api contactId;
    @api eventId;
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
        ContactName: 'Contact Name',
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
                "Description" :  str,
                "StartDate" : elt.Start_Date__c,
                "EndDate" : elt.End_Date__c,
                "Status" : elt.Status__c,

                icon:"standard:people", 
                title: elt.Name,
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
                // this.buildformEdit();
            })
            .catch(error => {
                // TODO Error handling
            });
        return this.StatusList;
    }
    //comment
    handleSaveEvent(){debugger
        let ret1;
        let inputs= {};
        let ret = this.template.querySelector('c-rh_dynamic_form').save();
        ret1 = ret['outputs'];
        for(let key in ret1) {
            inputs[ret1[key]['label']] = ret1[key]['value'];
        }
        this.EventData.Name = inputs['Event Name'];
        this.EventData.Description = inputs['Description'];
        this.EventData.StartDate = inputs['Start date'];
        this.EventData.Status = inputs['Status'];
        this.EventData.EndDate = inputs['End date'];
        var jsonEventData = JSON.stringify(this.EventData);
        console.log('----->', jsonEventData);
        saveEven({ objEven: jsonEventData})
            .then(result => {
                // this.contactId = result.Contact_Id__c;
                // this.dispatchEvent(new CustomEvent('sendid', {
                //     detail: this.contactId
                // }));
                // window.console.log('result Contact_Id__c ===> ', result.Contact_Id__c);
                if(result.Status__c=='Draft'){
                    this.getNewEventList();
                    this.closeComponentEdit();
                    window.console.log('result ===> ', result);
                    // Show success messsage
                    // this.dispatchEvent(new ShowToastEvent({
                    //     title: 'Success!!',
                    //     message: 'Event Add Successfully but Not send to CEO!!',
                    //     variant: 'success'
                    // }), );
                    this.showToast('Success', 'Success !!', 'Event Add Successfully but Not send to CEO!!');
                }else{
                    this.getNewEventList();
                    this.closeComponentEdit();
                    window.console.log('result ===> ', result);
                    // Show success messsage
                    // this.dispatchEvent(new ShowToastEvent({
                    //     title: 'Success!!',
                    //     message: 'Event Add Successfully And send to CEO !!',
                    //     variant: 'success'
                    // }), );
                    this.showToast('Success', 'success !!', 'Event Add Successfully And send to CEO !!');
                }
            })
            .catch(error => {
                this.error = error.message;
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message: 'Add failed',
                    variant: 'error',
                    mode: 'dismissable'
                });
                this.dispatchEvent(evt);
                this.showToast('error', 'Error', 'Add failed');
            });  
    }
    handleUpdateEvent(){debugger
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
        console.log('eid----->', this.recordId);
        console.log('EventData----->', this.EventData);
        updateEven({ updEven: updatEven, eId: this.recordId})
            .then(result => {
                this.data = result;
                window.console.log('result ===> ', result);
                if(result[0].Message__c && result[0].Message__c=='Event has been already sent'){
                    this.showToast('info', 'Toast Info', 'This event has been already approved !');
                    this.closeComponentUpdate();
                }else if(result[0].Message__c=='Event has been already rejected'){
                    this.showToast('info', 'Toast Info', 'This event has been already rejected !');
                    this.closeComponentUpdate();
                }else{
                    refreshApex(this.wiredEventList);
                    this.closeComponentUpdate();
                    this.showToast('success', 'success !!', 'Event Update Successfully!!');
                }
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
                            // this.dispatchEvent(new ShowToastEvent({
                            // title: 'Toast Info',
                            // message: 'You don\'t have right to deletion !!',
                            // variant: 'info',
                            // mode: 'dismissable'
                            // }), );
                            this.showToast('info', 'Toast Info', 'You don\'t have right to deletion !!');
                }else{
                    switch (result[0].Status__c) {
                        case 'Submitted':
                            this.closeModalDelete();
                            // this.dispatchEvent(new ShowToastEvent({
                            // title: 'Toast Info',
                            // message: 'You should put status to draft before delete',
                            // variant: 'info',
                            // mode: 'dismissable'
                            // }), );
                            this.showToast('info', 'Toast Info', 'You should put status to draft before delete');
                                break;
                        default:
                            // this.getNewEventList();
                            this.closeModalDelete();
                            this.closeComponentDetails();
                            // this.dispatchEvent(new ShowToastEvent({
                            // title: 'Success!!',
                            // message: 'Event Delete Successfully!!',
                            // variant: 'success'
                            // }), );
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
    getEventDetails(eventId) {
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
                        placeholder:'Enter your Event Name',
                        name:'Name',
                        type:'text',
                        value:this.eventinformationEdite[0].EventName,
                        required:true,
                        ly_md:'12', 
                        ly_lg:'12'
                    },
                    {
                        label:'Start date',
                        placeholder:'Enter Start date',
                        name:'StartDate',
                        type:'date',
                        value:this.eventinformationEdite[0].StartDate,
                        required:true,
                        ly_md:'12', 
                        ly_lg:'12'
                    },
                    {
                        label:'Status',
                        placeholder:'Select Status',
                        name:'Status',
                        picklist: true,
                        value:this.eventinformationEdite[0].Status,
                        required:true,
                        ly_md:'12', 
                        ly_lg:'12'
                    },
                    {
                        label:'End date',
                        placeholder:'Enter End date',
                        name:'EndDate',
                        type:'date',
                        value:this.eventinformationEdite[0].EndDate,
                        ly_md:'12', 
                        ly_lg:'12'
                    },
                    {
                        label:'Description',
                        placeholder:'Enter your Event Description',
                        name:'Description',
                        type:'textarea',
                        value:this.eventinformationEdite[0].Description,
                        ly_md:'12', 
                        ly_lg:'12'
                    },
                ];
                
            }
        }).catch(err =>{
            console.error('error',err)
        })
    }    buildform(){
        this.inputsItems = [
            {
                label:'Event Name',
                placeholder:'Enter your Event Name',
                name:'Name',
                type:'text',
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Description',
                placeholder:'Enter your Event Description',
                name:'Description',
                type:'textarea',
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Start date',
                placeholder:'Enter Start date',
                name:'StartDate',
                type:'date',
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'End date',
                placeholder:'Enter End date',
                name:'EndDate',
                type:'date',
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Status',
                placeholder:'Select Status',
                name:'Status',
                picklist: true,
                options:this.StatusList,
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
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
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Description',
                placeholder:'Enter your Event Description',
                name:'Description',
                type:'textarea',
                value:this.eventinformationEdite[0].Description,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Start date',
                placeholder:'Enter Start date',
                name:'StartDate',
                type:'date',
                value:this.eventinformationEdite[0].StartDate,
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'End date',
                placeholder:'Enter End date',
                name:'EndDate',
                type:'date',
                value:this.eventinformationEdite[0].EndDate,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Status',
                placeholder:'Select Status',
                name:'Status',
                picklist: true,
                options:this.StatusList,
                value:this.eventinformationEdite[0].Status,
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
        ];
    }

    handleOpenComponent() {
        this.showComponentBase = false;
        this.showComponentDetails = true;
    }
    handleEdit(){
        this.showComponentEdit = true;
        this.buildformEdit();
        this.showComponentBase = false;
        this.showComponentDetails = false;
        this.isUpdate = true;
    }
    handleOpenComponentSave(){ 
        this.showComponentEdit = true;
        this.buildform();
        this.isUpdate = false;
        this.showComponentBase = false;
    }
    closeComponentDetails(){
        this.getNewEventList();
        this.showComponentBase = true;
        this.showComponentDetails = false;
        this.showComponentEdit = false;
        this.isUpdate = false;
    }
    closeComponentEdit(){
        this.showComponentBase = true;
        this.showComponentDetails = false;
        this.showComponentEdit = false;
        this.isUpdate = false;
    }
    closeComponentUpdate(){
        this.showComponentDetails = true;
        this.showComponentBase = false;
        this.showComponentEdit = false;
        this.isUpdate = false;
    }
    showToast(variant, title, message){
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);
    }
    //################################## Add Event ##################################################
    // handleOpenComponent() {
    //     this.template.querySelector('c-rh_add_event').openModal();
    // }
}