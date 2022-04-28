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
    HideEdit = true;
    eventinformation = {};
    eventinformationEdite = {};
    isUpdate = false;
    bool = false;
    @api eventId;
    @track datas = [];
    @track datass = {};
    @track wiredEventList = [];
    accountFields = [];
    eventDetails;
    @track EventData = {
        Name:'',       
        Description:'',  
        StartDate:'', 
        EndDate:'',
        Status:'',
    };

    columns = [
        { label: 'Event_Name',
         fieldName: 'EventName', 
         type: 'button', 
         typeAttributes: {
            label: { 
                fieldName: 'EventName' 
            },
            name: 'eventName',
            title: 'Event_Name',
            variant: 'base',
        }
        },
        { label: 'Contact_Name', fieldName: 'ContactName', type: 'text', sortable: true },
        { label: 'Description', fieldName: 'Description', type: 'text', sortable: true },
        { label: 'Start_Date', fieldName: 'StartDate', type: 'date', sortable: true },
        { label: 'End_Date', fieldName: 'EndDate', type: 'date', sortable: true },
        { label: 'Status', fieldName: 'Status', type: 'text', sortable: true },
    ];

    @wire(getLatestEvents) evenList(result) {
        this.wiredEventList = result;
        console.log('@@wiredEventList--> ' , this.wiredEventList);
        if (result.data) {
            console.log('@@wiredatas--> ' , result.data);
                this.eventinformation = result.data.map(obj => {
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
            // const self=this;
            // result.data.forEach(elt => { 
            // let objetRep = {};
            // objetRep = {
            //     "id" : elt.Id,
            //     "EventName": elt?.Name,
            //     "ContactName": elt?.Contact_Id__r.Name,
            //     "Description":  elt?.Description__c,
            //     "StartDate": elt.Start_Date__c,
            //     "EndDate": elt.End_Date__c,
            //     "Status": elt.Status__c,
            //     icon:"standard:people",
                
            //     title: elt?.Name,
            //     keysFields:self.keysFields,
            //     keysLabels:self.keysLabels,
            //     fieldsToShow:self.fieldsToShow,
            // }
         
            // console.log('@@@@@objectReturn', objetRep);
            //     this.datas.push(objetRep);
            // });
            // // this.refreshTable(this.tabReq); 
            // this.setviewsList( this.datas);
            
            this.datas = this.eventinformation;
            console.log('@@@@@@@@wiredatas--> ' , this.datas);
            this.refreshTable(this.datas);
            this.error = undefined;
        } else if (result.error) {
          this.error = result.error;
          this.datas = [];
        }
    }

    setviewsList(items){
        let cardsView=this.template.querySelector('c-rh_cards_view');
        cardsView?.setDatas(items);
    }
    callRowAction( event ) {debugger
        this.eventId = JSON.parse(JSON.stringify(event.detail.row.Id));
        console.log('this.eventId--> ' , this.eventId);
        const actionName = event.detail.action.name;  
        console.log('actionName--> ' , actionName); 
        if ( actionName === 'eventName' ) {
            this.goToEventDetail(this.eventId);
            // this.buildAccountFields();
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
        }
        this.initDefault();
        this.optionsStatus();
    }
    // buildAccountFields(){
    //     this.accountFields=[
    //         {
    //             label:'Event Name',
    //             placeholder:'',
    //             name: this.eventinformationEdite[0].EventName,
    //             value: this.eventinformationEdite[0].EventName,
    //             required:true,
    //             ly_md:'12', 
    //             ly_lg:'12'
    //         },
    //         {
    //             label:'Description',
    //             placeholder:'',
    //             name:this.eventinformationEdite[0].Description,
    //             value:this.eventinformationEdite[0].Description,
    //             required:true,
    //             ly_md:'12', 
    //             ly_lg:'12'
    //         },
    //     ];
    //     console.log('accountFields --> ' , this.accountFields);
    // }
    @api 
    test(){
        console.log('@@@@@test eventId --> azertyukjghfdhjghlkgjhfsrt');
        // console.log('@@@@@test eventId--> ' , eventId);
    }
    @api 
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
                        value:this.eventinformationEdite[0].Status,
                        required:true,
                        ly_md:'12', 
                        ly_lg:'12'
                    },
                ];
                
            }
        }).catch(err =>{
            console.error('error',err)
        })
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
                if(result[0].Message__c && result[0].Message__c=='Event already sent'){
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Toast Info',
                        message: 'This event has been already approved !',
                        variant: 'info',
                        mode: 'dismissable'
                    }), );
                    this.closeComponentUpdate();
                }else{
                    refreshApex(this.wiredEventList);
                    this.closeComponentUpdate();
                    // Show success messsage
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success!!',
                        message: 'Event Update Successfully!!',
                        variant: 'success'
                    }), );
                }
            })
            .catch(error => {
                this.error = error.message;
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message: 'Update failed',
                    variant: 'error',
                    mode: 'dismissable'
                });
                this.dispatchEvent(evt);
            });
    }

    refreshTable(data) {
        const dataTableCmp = this.template.querySelector('c-rh_datatable_component');
        if (dataTableCmp) {
            dataTableCmp?.setDatas(data);
        } else {
            console.log('@@@@@@@@@@@@@Not found');
        }
    }
//#################################### Add Event ##################################################
    // handleOpenComponent() {
    //     this.template.querySelector('c-rh_add_event').openModal();
    // }
    showComponentBase = true;
    showComponentDetails = false;
    showComponentEdit = false;
    showModalDelete = false;
    @track StatusList =[];
    @api
    title;
    @api
    iconsrc;

    initDefault(){
        this.title=this.title || 'User Informations';
        this.iconsrc= this.iconsrc || 'utility:people';
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
                window.console.log('result ===> ', result.Status__c);
                if(result.Status__c=='Draft'){
                    refreshApex(this.wiredEventList);
                    this.data = result;
                    this.closeComponentEdit();
                    window.console.log('result ===> ', result);
                    // Show success messsage
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success!!',
                        message: 'Event Add Successfully but Not send to CEO!!',
                        variant: 'success'
                    }), );
                }else{
                    refreshApex(this.wiredEventList);
                    this.data = result;
                    this.closeComponentEdit();
                    window.console.log('result ===> ', result);
                    // Show success messsage
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success!!',
                        message: 'Event Add Successfully And send to CEO !!',
                        variant: 'success'
                    }), );
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
            });  
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
               console.log('tab-->', tab1);
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
    handlepredeleteEvent(){
        this.showModalDelete=true;
    }
    handledeleteEvent(){debugger
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        console.log('eid----->', this.recordId);
        deleteEvent({evid : this.recordId})
            .then(result => {
                this.data = result;
                console.log('res----->', result.Status__c);
                if(result.Status__c=='Pending'){
                    this.closeModalDelete();
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Toast Warning',
                        message: 'You should put status to draft before delete',
                        variant: 'warning',
                        mode: 'dismissable'
                    }), );
                }else{
                    refreshApex(this.wiredEventList);
                    this.closeModalDelete();
                    this.closeComponentEdit();
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success!!',
                        message: 'Event Delete Successfully!!',
                        variant: 'success'
                    }), );
                }
            })
            .catch(error => {
                // TODO Error handling
            });
    }
    closeModalDelete(){
        this.showModalDelete=false;
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
        // this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        // this.goToEventDetail(this.eventId);
        this.showComponentDetails = true;
        this.showComponentBase = false;
        this.showComponentEdit = false;
        this.isUpdate = false;
    }
//#############################################################################################################################
    @track inputsItems = [];

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
    buildform(){
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
}