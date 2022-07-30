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
import { icons } from 'c/rh_icons';
import { labels } from 'c/rh_label';

export default class rh_Event_Management extends  NavigationMixin(LightningElement) {
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

    showComponentBase = true;
    showComponentDetailsForBaseUser = false;
    showComponentDetails = false;
    visible = true;
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
        ContactName: this.label.ContactName,
        Description: this.label.Description,
        StartDate: this.label.StartDate,
        EndDate: this.label.EndDate,
        Status: this.label.Status
    };
    fieldsToShow={ 
        // EventName:'Event Name',
        ContactName: 'Contact Name',
        Description: 'Description',
        StartDate: 'Start Date',
        EndDate: 'End Date',
        // Status:'Status'
    };
    get filterReady(){ return this.filterInputs?.length >0}
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
                "StartDate" : elt.Start_Dates__c?.split('T')[0],
                "EndDate" : elt.End_Dates__c?.split('T')[0],
                "Status" : elt.Status__c,
                "Description" :  str,

                icon:this.icon.user, 
                title: elt.Name,
                class: elt.Status__c=='Approved'? 'frozen': elt.Status__c=='Submitted'? 'banned': 'active',
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
            case 'Approved':
                return "slds-float_left slds-theme_success";
            case 'Submitted': 
                return "slds-float_left slds-theme_warning"; 
            default: 
                return "slds-float_left slds-theme_alt-inverse"; 
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
    handleSubmitFilter(event) {
        const record=event.detail;
        console.log(`handleSubmitFilter record `, JSON.stringify(record) );
        console.log(`this.datas `, this.datas);
        record.searchText ? this.datas = this.datas.filter(element =>((element.EventName).toUpperCase()) == (record.searchText.toUpperCase())) : this.datas;
        record.startDate ? this.datas = this.datas.filter(element =>element.StartDate ==  record.startDate) : this.datas;
        record.status ? this.datas = this.datas.filter(element =>element.Status ==  record.status) : this.datas;
        record.EndDate ? this.datas = this.datas.filter(element =>element.EndDate ==  record.EndDate) : this.datas;   
    }
    handleResetFilter(event) {
        this.getEventManager();
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
                        type:'date',
                        value:this.eventinformationEdite[0].StartDate,
                        required:true,
                        ly_md:'12', 
                        ly_lg:'12'
                    },
                    {
                        label: this.label.Status,
                        name:'Status',
                        picklist: true,
                        value:this.eventinformationEdite[0].Status,
                        required:true,
                        ly_md:'12', 
                        ly_lg:'12'
                    },
                    {
                        label: this.label.EndDate,
                        name:'EndDate',
                        type:'date',
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
                    let data_t =[];
                    for(let key2 in result['data2']) {   
                        for(let key in result['data']) {
                            if(result['data'][key].ContentDocumentId== result['data2'][key2].Id){
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
        if (event.detail.action=='Share'){
            this.eventId = this.getUrlParamValue(window.location.href, 'recordId');
            console.log('eventId --> ' ,this.eventId);
            this.getEventInformation(this.eventId);
        }

    }
    handleRejectEvent(event){
        if (event.detail.action=='Yes I m sure'){
            this.changeEventStatus(this.eventId);
            this.closeModalRejected();
        }
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
                            this.showToast('info', 'Toast Info', this.label.SendEvent);
                }else if(result[0].Status__c=='Submitted' && (result[0].Message__c=='Right no allowed')){
                    this.closeModalDelete();
                    this.showToast('info', 'Toast Info', this.label.RightDeletion);
                }else{
                    this.closeModalDelete();
                    this.showToast('success', 'Success!!', this.label.EvenDeletionS);
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
        if (event.detail.action=='Rejected'){
            this.eventId = this.getUrlParamValue(window.location.href, 'recordId');
            // this.eventId = event.currentTarget.getAttribute("data-id");
            console.log('eventId --> ' ,this.eventId);
            this.visible = false;
            this.showModalDelete = true;
        }
    }
    closeModalRejected(){
        this.showModalDelete = false;
        setTimeout(()=>{
            window.location.reload();
        },500);
    }
    closeModalDelete(event){
        if (event.detail.action=='Cancel'){
            this.showModalDelete = false;
        }
    }
    changeEventStatus(evId){debugger
        console.log('evId -- >' + evId);
        changeEventStatus({infoId:evId})
        .then(result =>{
            if (result.error) {
                console.error(result.msg);
            }else{
                console.log('@@@ Event --> ' , result);
                this.ContactId = result[0].Contact_Id__c;
                let desc = result[0].Description__c;
                let name = result[0].Name;
                if(result[0].Message__c=='Already approved'){
                    this.showToast('info', 'Toast Info', this.label.RejectFail);
                }else if(this.ContactId){
                    console.log('@@@EventContact--> ' , this.ContactId);
                    getIdUser({idU: this.ContactId})
                    .then(result =>{
                        console.log('@@User data --> ' , result);
                        for(let i=0; i<result.length; i++){
                            if(result[i].UserRole.Name=='Base User'){
                                sendNotif({strBody:desc, pgRefId:evId, strTargetId:result[i].Id, strTitle:name, setUserIds:result[i].Id})
                                    .then(result =>{
                                        if (result?.error) {
                                            console.error(result?.msg);
                                        }else{
                                            console.log('@@@ IDUSER --> ' , result[i].Id);
                                            console.log('event--> ' , result);
                                            this.showToast('Success', 'Success', this.label.EventSubS);
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
        // this.startSpinner(true);
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
                    this.showToast('info', 'Toast Info', this.label.EventA);
                }else{
                    console.log('++++++event++++-->  notification');
                    sendNotif({strBody:result[0].Description__c, pgRefId:evId, strTargetId:this.idUser, strTitle:result[0].Name, setUserIds:setUserIds})
                    .then(result =>{
                        if (result?.error) {
                            console.error(result?.msg);
                        }else{
                            console.log('event--> ' , result);
                            this.showToast('Success', 'Success', this.label.EventSubS);
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
        window.location.reload();
    }
    showToast(variant, title, message){
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);
    }
    handleOpenComponent() {
        this.showComponentBase = false;
        this.showComponentDetails = true;
    }
    closeComponentDetails(event){
        if (event.detail.action=='Back'){
            this.recordId = undefined;
            this.goToEventDetail(this.recordId);
            this.getEventManager();
            this.showComponentBase = true;
            this.showComponentDetails = false;
        }
    }
    detailsCloseComponentEdit=[
        {   
            variant:"brand-outline",
            
            label:"Back",
            name:'Back',
            title:"Back",
            iconName:this.icon.Back,
        }
    ]
    detailsPrerejectEvent=[
        {   
            variant:"brand-outline",
            
            label:"Rejected",
            name:'Rejected',
            title:"Rejected",
            iconName:this.icon.close,
        }
    ]
    detailsSendNotification=[
        {   
            variant:"brand-outline",
            
            label:"Share",
            name:'Share',
            title:"Share",
            iconName:this.icon.Share,
        }
    ]
    detailsDeleteEvent=[
        {   
            variant:"brand-outline",
            label:this.label.ok_confirm,
            name:'Yes I m sure',
            title:"Yes I m sure",
            iconName:this.icon.approve,
        }
    ]
    detailsCloseModalDelete=[
        {   
            variant:"brand-outline",
            label:this.label.Cancel,
            name:'Cancel',
            title:"Cancel",
            iconName:this.icon.close,  
        }
    ]
}