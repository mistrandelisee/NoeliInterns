import { LightningElement, track, wire } from 'lwc';
import { registerListener, unregisterListener, unregisterAllListeners, fireEvent } from 'c/pubsub';
import { labels } from 'c/rh_label';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import getrequest from '@salesforce/apex/RH_Request_controller.getrequest';
import retreiveRequest from '@salesforce/apex/RH_Request_controller.retreiveRequest';
import getAllRecordType from '@salesforce/apex/RH_Request_controller.getAllRecordType';
import getStatus from '@salesforce/apex/RH_Request_controller.getStatus';
import isBaseUsers from '@salesforce/apex/RH_Request_controller.isBaseUsers';
import newRequest from '@salesforce/apex/RH_Request_controller.newRequest';
import deleteRequest from '@salesforce/apex/RH_Request_controller.deleteRequest';
import updateRequest from '@salesforce/apex/RH_Request_controller.updateRequest';
import getContacts from '@salesforce/apex/RH_Request_controller.getContacts';
import filterRequest from '@salesforce/apex/RH_Request_controller.filterRequest';

const columns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Email', fieldName: 'Email', type: 'email' },
    { label: 'Role', fieldName: 'Role' },
];


export default class Rh_myrequest_component extends NavigationMixin(LightningElement) {
    @wire(CurrentPageReference) pageRef;
    emp;
    columns = columns;
    l = { ...labels };
    @track tabReq = [];
    @track dataCC = [];
    @track recordId;
    @track Description;
    @track Status;
    @track End_date;
    @track Start_date;
    @track isNew = false;
    @track isAllFields = false;
    @track badge = [];
    optionsRecord = [];
    @track optionsRecordList = [];
    @track firstFieldInputs = [];
    @track lastFieldInputsComplain = [];
    @track lastFieldInputsAll = [];
    @track lastFieldInputsPermHoli = [];
    @track lastFieldInputsExplanation = [];
    @track isComplain = false;
    @track isPermHoli = false;
    @track isExplanation = false;
    @track editMode = false;
    @track isDraft = false;
    @track isOpen = false;
    @track cloneMode = false;
    @track typeId;
    @track addressedRecord = [];
    @track formPersonanalInputDetails = [];
    @track formPersonanalInputClone = [];
    @track formPersonanalInputDetailsComplain = [];
    @track formPersonanalInputDetailsPermHoli = [];
    @track formPersonanalInputDetailsExplanation = [];
    @track resultRecord;
    @track statusDetail;
    @track showSpinner = false;
    @track requestType;
    allContact=[];
    @track inputFormFilter=[];
    @track isOpenDualBox=false;
    @track listConts=[];
    @track listContsValue=[];
    allRecType = [];
    isBase;
    natureOpt;
    okDelete;
    todo;

    keysFields = { AddressedTo: 'ok' };//non used now
    keysLabels = {
        CreatedDate: this.l.CreatedDate,
        Statut: 'Statut',
        Type: this.l.RequestTypeName,
        Request: 'Request',

        AddressedTo: this.l.AddressedTo
    };
    fieldsToShow = {
        CreatedDate: this.l.CreatedDate,
        Statut: 'Statut',
        Type: this.l.RequestTypeName,
        AddressedTo: this.l.AddressedTo
    };
    
    statusOptions = [
        {
            label: this.l.All,
            value: 'All'
        }
    ];

    hasRecords;

    get hasRecordId() {
        return this.recordId ? true : false;
    }
    
    get enableForm() {
        filterRequest({ searchText:'', })
        .then(result => {
            console.log('#### PIGNOUF =====> '+result != null)
            this.hasRecords = (result != null) ? true : false; 
        })
        return this.hasRecords;
    }

    buildFormFilter(optRecType){
        this.inputFormFilter=[
            {
                label: this.l.RequestTypeName,
                placeholder: this.l.RequestTypeName,
                name:'RequestType',
                picklist: true,
                options: optRecType,
                required:false,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Status,
                placeholder: this.l.Status,
                name:'status',
                picklist: true,
                options: this.statusOptions,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.From,
                placeholder:this.l.From,
                name:'From',
                required:false,
                type: 'Date',
                ly_md: '3',
                ly_lg: '3',
            },
            {
                label:this.l.To,
                placeholder:this.l.To,
                name:'To',
                required:false,
                type: 'Date',
                ly_md: '3',
                ly_lg: '3',
            }];
    }

    // @wire(getrequest) 
    //     getReq({data,errr}){
    //         console.log('@@@@@objectReturn');
    filterRequest(event){
        let searchText = event.detail.searchText;
        let reqType= event.detail.RequestType;
        let status= event.detail.status;
        let dateFrom= event.detail.From;
        let dateTo = event.detail.To;
        this.startSpinner(true);
        filterRequest({searchText:searchText, requestType: reqType, status: status, dateFrom: dateFrom, dateTo: dateTo})
            .then(result => {
                this.tabReq = [];
                const self = this;
                result.forEach(elt => {
                    let objetRep = {};
                    objetRep = {
                        "Request": elt?.RH_Description__c,
                        "CreatedDate": (new Date(elt.CreatedDate)).toLocaleString(),
                        "AddressedTo": elt.RH_Addressed_To__r?.Name,
                        "Type": elt.RecordType.Name,
                        "id": elt.Id,

                        title: elt?.Name,
                        keysFields: self.keysFields,
                        keysLabels: self.keysLabels,
                        fieldsToShow: self.fieldsToShow,
                    }

                    console.log('@@@@@objectReturn' + objetRep);
                    const badge={name: 'badge', class:self.classStyle(elt?.Rh_Status__c),label:elt?.Rh_Status}
                    objetRep.addons={badge};
                    this.tabReq.push(objetRep);
                });
                // this.refreshTable(this.tabReq); 
                this.setviewsList(this.tabReq)
            }).catch(error => {
                console.error('Error:', error);
            }).finally(() => {
               this.startSpinner(false)
            });
    }

    getRequest() {
        this.startSpinner(true);
        getrequest()
            .then(result => {
                this.tabReq = [];
                this.buildFormFilter(this.allRecType);
                const self = this;
                result.forEach(elt => {
                    let objetRep = {};
                    objetRep = {
                        "Request": elt?.RH_Description__c,
                        "CreatedDate": (new Date(elt.CreatedDate)).toLocaleString(),
                        "AddressedTo": elt.RH_Addressed_To__r?.Name,
                        "Type": elt.RecordType.Name,
                        "id": elt.Id,

                        title: elt?.Name,
                        keysFields: self.keysFields,
                        keysLabels: self.keysLabels,
                        fieldsToShow: self.fieldsToShow,
                    }

                    console.log('@@@@@objectReturn' + objetRep);
                    const badge={name: 'badge', class:self.classStyle(elt?.Rh_Status__c),label: elt?.Rh_Status}
                    objetRep.addons={badge};
                    this.tabReq.push(objetRep);
                });
                this.setviewsList(this.tabReq)
            }).catch(error => {
                console.error('Error:', error);
            }).finally(() => {
                this.startSpinner(false)
            });
    }
    
    classStyle(className){
        switch(className){
            case 'Approved':
                return "slds-float_left slds-theme_success";
            case 'Draft':
                return "slds-float_left slds-theme_info";
            case 'Submited':
                return "slds-float_left slds-theme_warning";
            case 'Rejected':
                return "slds-float_left slds-theme_error";
            default:
                return "slds-float_left slds-theme_alt-inverse";
        }
    }

    handleCardAction(event) {
        console.log('event parent ' + JSON.stringify(event.detail));
        const info = event.detail;
        if (info?.extra?.isTitle) {
            // this.goToRequestDetail(this.recordId);
            // this.requestType = info?.data.RequestTypeName;
            this.goToRequestDetail(info?.data?.id);
        }
    }
    setviewsList(items) {
        let cardsView = this.template.querySelector('c-rh_cards_view');
        cardsView?.setDatas(items);
    }

    buildformDetail(profileinformation, addrName) {
        let std = new Date(profileinformation?.RH_Start_date__c);
        let stmonth = std.getMonth()+1 > 9 ? std.getMonth()+1 : '0'+(std.getMonth()+1); 
        let stdat = std.getDate() > 9 ? std.getDate() : '0'+std.getDate();
        let stDate = std.getFullYear()+'-'+stmonth+'-'+stdat;
        let end = new Date(profileinformation?.RH_End_date__c);
        let enmonth = end.getMonth()+1 > 9 ? end.getMonth()+1 : '0'+(end.getMonth()+1); 
        let endat = end.getDate() > 9 ? end.getDate() : '0'+end.getDate();
        let enDate = end.getFullYear()+'-'+enmonth+'-'+endat;
        let objNte =   {
            label: profileinformation?.RecordType.DeveloperName == 'Complain' || profileinformation?.RecordType.DeveloperName == 'Explanation' ? this.l.reason : this.l.Note,
            placeholder: 'Note',
            name: 'RH_Note',
            value: profileinformation?.RH_Reason__c,
            required: true,
            ly_md: '6',
            ly_lg: '6'
        }

        let objAns = {
            
            label:this.l.Answer,
            name:'RH_Reason',
            value:profileinformation?.RH_Answer__c,
            required:true,
            ly_md:'6', 
            ly_lg:'6'
        }
        let dateSb ={
            label:this.l.SubmitedDate,
            name:'RH_Date_Submit__c',
            value:profileinformation?.RH_Date_Submit__c,
            required:true,
            ly_md:'6', 
            ly_lg:'6'
        }
        let dateResp = {
            label:this.l.RespondedDate,
            name:'RH_Date_Response__c',
            value:profileinformation?.RH_Date_Response__c,
            required:true,
            ly_md:'6', 
            ly_lg:'6'
        }

        console.log('@@@@@RecordType.Name' + profileinformation?.RecordType.DeveloperName);
        if (profileinformation?.RecordType.DeveloperName == 'Complain') {
            
            this.formPersonanalInputDetails = [

                {
                    label: this.l.AddressedTo,
                    placeholder: this.l.AddressedTo,
                    name: 'RH_AddressedTo',
                    type:'text',
                    value: profileinformation?.RH_Addressed_To__r?.Name,
                    required: false,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.RequestTypeName,
                    name: 'RecordT',
                    required: true,
                    value: profileinformation?.RecordType.Name,
                    readOnly: true,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.Status,
                    name: 'StatusRequest',
                    required: true,
                    value: profileinformation?.Rh_Status,
                    placeholder: this.l.Status,
                    readOnly: true,
                    maxlength: 255,
                    type: 'email',
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.ComplainOn,
                    placeholder: this.l.ComplainOn,
                    name: 'ComplainOn',
                    type:'text',
                    value: profileinformation?.RH_Complain_On__r?.Name,
                    required: false,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.AddressedCc,
                    placeholder: this.l.AddressedCc,
                    name: 'RH_AddressedCc',
                    required: true,
                    value: addrName,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.Description,
                    placeholder: this.l.Description,
                    name: 'RH_Description',
                    value: profileinformation?.RH_Description__c,
                    required: true,
                    ly_md: '6',
                    ly_lg: '6'
                }
            ];
            if (profileinformation?.RH_Date_Submit__c != null) {
                
                this.formPersonanalInputDetails.push(dateSb);
            }
            if (profileinformation?.RH_Date_Response__c != null) {
                
                this.formPersonanalInputDetails.push(dateResp);
            }
            if (profileinformation?.RH_Reason__c != null) {
                
                this.formPersonanalInputDetails.push(objNte);
            }
        }
        if (profileinformation?.RecordType.DeveloperName == 'Explanation') {
            this.formPersonanalInputDetails = [

                {
                    label: this.l.AddressedTo,
                    placeholder: this.l.AddressedTo,
                    name: 'RH_AddressedTo',
                    picklist: true,
                    options: this.addressedRecord,
                    value: profileinformation?.RH_Addressed_To__r?.Name,
                    required: false,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.RequestTypeName,
                    name: 'RecordT',
                    required: true,
                    value: profileinformation?.RecordType.Name,
                    readOnly: true,
                    ly_md: '12',
                    ly_lg: '6'
                },
                {
                    label: this.l.Status,
                    name: 'StatusRequest',
                    required: true,
                    value: profileinformation?.Rh_Status,
                    placeholder: this.l.Status,
                    readOnly: true,
                    maxlength: 255,
                    type: 'email',
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.Description,
                    placeholder: this.l.Description,
                    name: 'RH_Description',
                    value: profileinformation?.RH_Description__c,
                    required: true,
                    ly_md: '6',
                    ly_lg: '6'
                }
            ];
            if (profileinformation?.RH_Date_Submit__c != null) {
                
                this.formPersonanalInputDetails.push(dateSb);
            }
            if (profileinformation?.RH_Date_Response__c != null) {
                
                this.formPersonanalInputDetails.push(dateResp);
            }
            if (profileinformation?.RH_Reason__c != null) {
                
                this.formPersonanalInputDetails.push(objNte);
            }
            if (profileinformation?.RH_Answer__c != null) {
                
                this.formPersonanalInputDetails.push(objAns);
            }
        }
        if (profileinformation?.RecordType.DeveloperName == 'Permisson') {
            this.formPersonanalInputDetails = [

                {
                    label: this.l.AddressedTo,
                    placeholder: this.l.AddressedTo,
                    name: 'RH_AddressedTo',
                    picklist: true,
                    options: this.addressedRecord,
                    value: profileinformation?.RH_Addressed_To__r?.Name,
                    required: false,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.RequestTypeName,
                    name: 'RecordT',
                    required: true,
                    value: profileinformation?.RecordType.Name,
                    readOnly: true,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.Status,
                    name: 'StatusRequest',
                    required: true,
                    value: profileinformation?.Rh_Status,
                    placeholder: this.l.Status,
                    readOnly: true,
                    maxlength: 255,
                    type: 'email',
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.Description,
                    placeholder: this.l.Description,
                    name: 'RH_Description',
                    value: profileinformation?.RH_Description__c,
                    required: true,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.StartDate,
                    placeholder: this.l.StartDate,
                    name: 'RH_StartDate',
                    required: true,
                    value: profileinformation?.RH_Start_date__c,
                    type: 'datetime',
                    ly_md: '6',
                    ly_lg: '6',
                    isDatetime: true
                },
                {
                    label: this.l.EndDate,
                    placeholder: this.l.EndDate,
                    name: 'RH_EndDate',
                    value: profileinformation?.RH_End_date__c,
                    type: 'datetime', 
                    ly_md: '6',
                    ly_lg: '6',
                    isDatetime: true
                }
            ];
            if (profileinformation?.RH_Date_Submit__c != null) {
                
                this.formPersonanalInputDetails.push(dateSb);
            }
            if (profileinformation?.RH_Date_Response__c != null) {
                
                this.formPersonanalInputDetails.push(dateResp);
            }
            if (profileinformation?.RH_Reason__c != null) {
                
                this.formPersonanalInputDetails.push(objNte);
            }
        }
        if (profileinformation?.RecordType.DeveloperName == 'Holiday') {
            this.formPersonanalInputDetails = [

                {
                    label: this.l.AddressedTo,
                    placeholder: this.l.AddressedTo,
                    name: 'RH_AddressedTo',
                    picklist: true,
                    options: this.addressedRecord,
                    value: profileinformation?.RH_Addressed_To__r?.Name,
                    required: false,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.RequestTypeName,
                    name: 'RecordT',
                    required: true,
                    value: profileinformation?.RecordType.Name,
                    readOnly: true,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.Status,
                    name: 'StatusRequest',
                    required: true,
                    value: profileinformation?.Rh_Status,
                    placeholder: this.l.Status,
                    readOnly: true,
                    maxlength: 255,
                    type: 'email',
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.Description,
                    placeholder: this.l.Description,
                    name: 'RH_Description',
                    value: profileinformation?.RH_Description__c,
                    required: true,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.StartDate,
                    placeholder: this.l.StartDate,
                    name: 'RH_StartDate',
                    required: true,
                    value: stDate,
                    type:'text',
                    ly_md: '6',
                    ly_lg: '6',
                },
                {
                    label: this.l.EndDate,
                    placeholder: this.l.EndDate,
                    name: 'RH_EndDate',
                    value: enDate, 
                    type:'text',
                    ly_md: '6',
                    ly_lg: '6',
                }
            ];
            if (profileinformation?.RH_Date_Submit__c != null) {
                
                this.formPersonanalInputDetails.push(dateSb);
            }
            if (profileinformation?.RH_Date_Response__c != null) {
                
                this.formPersonanalInputDetails.push(dateResp);
            }
            if (profileinformation?.RH_Reason__c != null) {
                
                this.formPersonanalInputDetails.push(objNte);
            }
        }

    }
    buildformClone(profileinformation) {

        console.log('@@@@@RecordType.Name' + profileinformation?.RecordType.Name);
        if (profileinformation?.RecordType.DeveloperName == 'Complain') {
            this.formPersonanalInputClone = [

                {
                    label: this.l.AddressedTo,
                    placeholder: this.l.AddressedTo,
                    name: 'RH_AddressedTo',
                    picklist: true,
                    options: this.addressedRecord,
                    value: profileinformation?.RH_Addressed_To__r?.Id,
                    required: false,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.ComplainOn,
                    placeholder: this.l.ComplainOn,
                    name: 'ComplainOn',
                    picklist: true,
                    options: this.allContact,
                    value: profileinformation?.RH_Complain_On__r?.Id,
                    required: false,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.RequestTypeName,
                    name: 'RecordT',
                    required: true,
                    value: profileinformation?.RecordType.Name,
                    readOnly: true,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.Description,
                    placeholder: this.l.Description,
                    name: 'RH_Description',
                    value: profileinformation?.RH_Description__c,
                    className: 'textarea',
                    type: 'textarea',
                    required: true,
                    ly_md: '6',
                    ly_lg: '6'
                }
            ];
        }
        if (profileinformation?.RecordType.DeveloperName == 'Explanation') {
            this.formPersonanalInputClone = [

                {
                    label: this.l.AddressedTo,
                    placeholder: this.l.AddressedTo,
                    name: 'RH_AddressedTo',
                    picklist: true,
                    options: this.addressedRecord,
                    value: profileinformation?.RH_Addressed_To__r?.Id,
                    required: false,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.RequestTypeName,
                    name: 'RecordT',
                    required: true,
                    value: profileinformation?.RecordType.Name,
                    readOnly: true,
                    ly_md: '12',
                    ly_lg: '6'
                },
                {
                    label: this.l.Description,
                    placeholder: this.l.Description,
                    name: 'RH_Description',
                    value: profileinformation?.RH_Description__c,
                    className: 'textarea',
                    type: 'textarea',
                    required: true,
                    ly_md: '6',
                    ly_lg: '6'
                }
            ];
        }
        if (profileinformation?.RecordType.DeveloperName == 'Permisson') {
            this.formPersonanalInputClone = [

                {
                    label: this.l.AddressedTo,
                    placeholder: this.l.AddressedTo,
                    name: 'RH_AddressedTo',
                    picklist: true,
                    options: this.addressedRecord,
                    value: profileinformation?.RH_Addressed_To__r?.Id,
                    required: false,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.RequestTypeName,
                    name: 'RecordT',
                    required: true,
                    value: profileinformation?.RecordType.Name,
                    readOnly: true,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.StartDate,
                    placeholder: this.l.StartDate,
                    name: 'RH_StartDate',
                    required: true,
                    value: profileinformation?.RH_Start_date__c,
                    type: 'Datetime',
                    ly_md: '6',
                    ly_lg: '6',
                    isDatetime: true
                },
                {
                    label: this.l.EndDate,
                    placeholder: this.l.EndDate,
                    name: 'RH_EndDate',
                    value: profileinformation?.RH_End_date__c,
                    type: 'Datetime',
                    ly_md: '6',
                    ly_lg: '6',
                    isDatetime: true
                },
                {
                    label: this.l.Description,
                    placeholder: this.l.Description,
                    name: 'RH_Description',
                    value: profileinformation?.RH_Description__c,
                    className: 'textarea',
                    type: 'textarea',
                    required: true,
                    ly_md: '6',
                    ly_lg: '6'
                }
            ];
        }
        if (profileinformation?.RecordType.DeveloperName == 'Holiday') {
            this.formPersonanalInputClone = [

                {
                    label: this.l.AddressedTo,
                    placeholder: this.l.AddressedTo,
                    name: 'RH_AddressedTo',
                    picklist: true,
                    options: this.addressedRecord,
                    value: profileinformation?.RH_Addressed_To__r?.Id,
                    required: false,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.RequestTypeName,
                    name: 'RecordT',
                    required: true,
                    value: profileinformation?.RecordType.Name,
                    readOnly: true,
                    ly_md: '6',
                    ly_lg: '6'
                },
                {
                    label: this.l.StartDate,
                    placeholder: this.l.StartDate,
                    name: 'RH_StartDate',
                    required: true,
                    value: profileinformation?.RH_Start_date__c,
                    type: 'Date',
                    ly_md: '6',
                    ly_lg: '6',
                },
                {
                    label: this.l.EndDate,
                    placeholder: this.l.EndDate,
                    name: 'RH_EndDate',
                    value: profileinformation?.RH_End_date__c,
                    type: 'Date',
                    ly_md: '6',
                    ly_lg: '6',
                },
                {
                    label: this.l.Description,
                    placeholder: this.l.Description,
                    name: 'RH_Description',
                    value: profileinformation?.RH_Description__c,
                    className: 'textarea',
                    type: 'textarea',
                    required: true,
                    ly_md: '6',
                    ly_lg: '6'
                }
            ];
        }

    }

    handlerselected(event) {
        console.log('@@@@@@ray ' + JSON.stringify(event.detail));
        this.recordId = event.detail.row.ID;
        this.goToRequestDetail(this.recordId);

    }


    openDualBox(){
        console.log('@@@@@isOpenDualBox');
        this.isOpenDualBox = !this.isOpenDualBox;
    }

    handlechge(event) {
        const item = event.detail.info;
        this.typeId = item.value;

        console.log('OUTPUT xxxx: item ', item);

        getContacts()
            .then(result => {
                this.addressedRecord = result.adressedTo.map(plValue => {
                    return {
                        label: plValue.Name,
                        value: plValue.Id
                    };
                });
                this.allContact = result.complainOn.map(plValue => {
                    return {
                        label: plValue.Name,
                        value: plValue.Id
                    };
                });
                this.handleNext();
            }).catch(error => {
                console.error('Error:', error);
            });
    }

    getStatus(){
        getStatus()
           .then(result => {
                result.Rh_Status__c.forEach(plValue => {
                    this.statusOptions.push(
                        {
                            label: plValue.label,
                            value: plValue.value
                        }
                    )
                });
            });
    }

    getAllRecordType(){
        isBaseUsers()
            .then(res => {
                this.isBase = res;
            })
        getAllRecordType()
            .then(result => {
                this.allRecType = result.map(plValue => {
                    return {
                        label: plValue.Name,
                        value: plValue.Id
                    };
                });
                result.forEach(plValue => {
                    if(plValue.DeveloperName != 'Explanation'){
                        if(plValue.DeveloperName != 'Complain'  || !this.isBase){
                            this.optionsRecord.push(
                                {
                                    label: plValue.Name,
                                    value: plValue.Id
                                }
                            );
                        }
                    }
                });
                this.optionsRecordList = result;
                console.log('recordalltype',result);
            })
    }

    handleChangeValue() {
        this.isNew = true;
        this.buildform();
    }

    handleCancel() {
        this.isNew = false
    }
    handleNext() {
        this.isAllFields = true;
        this.openNext();
    }

    handleCancelDetail() {
        var pagenname = 'my-request'; //request page nam
        // let states={'recordId': recordid}; //event.currentTarget.dataset.id , is the recordId of the request

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: pagenname
            },
            // state: states
        });
    }

    handleDeleteValue() {
        this.okDelete = '';
        this.startSpinner(true);
        deleteRequest({ requestId: this.recordId })
            .then(result => {
                if (result == 'OK') {
                    console.log('recordDelete',this.recordId)
                    this.showToast('success', 'success', this.l.RequestDeleded);
                    // this.getRequest();
                    this.handleCancelDetail();
                } else {
                    this.showToast('error', 'Error', result);
                }
            }).catch(error => {
                console.error('Error:', error);
            }).finally(() => {
                this.startSpinner(false);
            });
    }

    handleEditValue() {
        this.editMode = true;
        getContacts()
            .then(result => {
                this.addressedRecord = result.adressedTo.map(plValue => {
                    return {
                        label: plValue.Name,
                        value: plValue.Id
                    };
                });
                if(this.resultRecord.RecordType.DeveloperName == 'Complain'){
                    this.allContact = result.complainOn.map(plValue => {
                        return {
                            label: plValue.Name,
                            value: plValue.Id
                        };
                    });
                }
                this.buildformClone(this.resultRecord);
                this.requestType = this.resultRecord?.RecordType.Name;
            }).catch(error => {
                console.error('Error:', error);
            });
    }

    handleCancelEdit() {
        this.editMode = false;
    }

    dovalueMember(event){
        this.listConts = event.tab;
        console.log('list id for insert =>:', this.listConts);
    }

    openNext() {
        this.optionsRecordList.forEach(op => {
            console.log('@@@@@objectMap' + op);
            if (op.Id == this.typeId && op.DeveloperName == 'Complain') {
                this.isComplain = true;
                this.isExplanation = false;
                this.isPermHoli = false;
                this.requestType = op.Name;
                this.buildformComplain();
            }
            if (op.Id == this.typeId && op.DeveloperName == 'Holiday') {
                this.isPermHoli = true;
                this.isExplanation = false;
                this.isComplain = false;
                this.requestType = op.Name;
                this.buildformHoli();
            }
            if (op.Id == this.typeId && op.DeveloperName == 'Permisson') {
                this.isPermHoli = true;
                this.isExplanation = false;
                this.isComplain = false;
                this.requestType = op.Name;
                this.buildformPerm();
            }
        })
    }

    handleCancelLast() {
        this.isAllFields = false;
        this.isNew = false;
    }

    detailPage() {
        // this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        retreiveRequest({ requestId: this.recordId })
            .then(result => {
                console.log('@@@@result ' + result);
                this.resultRecord = result;
                this.typeId = result.RecordTypeId;
                this.statusDetail = result.Rh_Status__c;
                if(result.RecordType.DeveloperName == 'Complain'){
                    this.isComplain = true;
                }
                let NameAdressed;
                if(result.Adressedccs__r){
                    this.listContsValue = result.Adressedccs__r.map(elt => elt.RH_Contact__c);
                    let tabName = result.Adressedccs__r.map(elt => elt.RH_Contact__r.Name);
                    NameAdressed = tabName.join(',');
                }
                this.badge=[{name: 'badgeDetail', class: this.classStyle(result.Rh_Status__c),label: result.Rh_Status}];
                this.buildformDetail(this.resultRecord, NameAdressed);
                this.requestType = result?.RecordType.Name;
                if (result.Rh_Status__c == 'Draft') {
                    this.isDraft = true;
                } else {
                    this.isOpen = true;
                }
            }).catch(error => {
                console.error(error);
            });
    }

    connectedCallback() {
        registerListener('backbuttom', this.dobackbuttom, this);
        registerListener('ModalAction', this.doModalAction, this);
        registerListener('valueMember', this.dovalueMember, this);    
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        if (this.recordId) {
            this.detailPage(this.recordId);
        } else {
            this.getStatus();
            this.getAllRecordType();
            this.getRequest();
        }
    }
    
    handleCardActionPop(event) {
        this.okDelete = 'DELETE';
        let text = '';
        const Actions = []
        const extra = { style: 'width:20vw;' };
        text = this.l.delete_Request_confirm;
        extra.title = this.l.deleteRequestConfirm;
        extra.style += '--lwc-colorBorder: var(--bannedColor);';
        Actions.push(this.createAction("brand-outline", this.l.okConfirm, this.okDelete, 'Yes', "action:approval", 'slds-m-left_x-small'));
        this.ShowModal(true, text, Actions, extra);

    }
    doModalAction(event) {
        console.log('doModalAction in user view ', JSON.stringify(event.action));
        switch (event.action) {
            case this.okDelete:
                this.handleDeleteValue();
                break;
        }
        this.ShowModal(false, null, []);//close modal any way
        event.preventDefault();
    }
    actionRecord = {};

    getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
    }

    goToRequestDetail(recordid) {
        var pagenname = 'my-request'; //request page nam
        let states = { 'recordId': recordid }; //event.currentTarget.dataset.id , is the recordId of the request

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: pagenname
            },
            state: states
        });
    }


    createAction(variant, label, name, title, iconName, className) {
        return {
            variant, label, name, title, iconName, class: className ,pclass :' slds-float_right'
        };
    }

    refreshTable(data) {
        const dataTableCmp = this.template.querySelector('c-rh_datatable_component');
        if (dataTableCmp) {
            dataTableCmp?.setDatas(data);
        } else {
            console.log('@@@@@@@@@@@@@Not found');
        }
    }

    handleSendValue() {
        this.startSpinner(true);
        updateRequest({ requestId: this.recordId})
            .then(result => {
                if (result == 'OK') {
                    this.showToast('success', 'success', this.l.RequestSend);
                    // this.getRequest();
                    // this.handleCancelDetail();
                    this.goToRequestDetail(this.recordid);
                } else {
                    this.showToast('error', 'Error', result);
                }
            }).catch(error => {
                console.error(error);
            }).finally(() => {
                this.startSpinner(false);
            });
    }

    handleCloneValue() {
        this.cloneMode = true;
        getContacts()
            .then(result => {
                this.addressedRecord = result.adressedTo.map(plValue => {
                    return {
                        label: plValue.Name,
                        value: plValue.Id
                    };
                });
                if(this.resultRecord.RecordType.DeveloperName == 'Complain'){
                    this.allContact = result.complainOn.map(plValue => {
                        return {
                            label: plValue.Name,
                            value: plValue.Id
                        };
                    });
                }
                this.buildformClone(this.resultRecord);
                this.requestType = this.resultRecord?.RecordType.Name;
            }).catch(error => {
                console.error('Error:', error);
            });
    }
    handleCancelClone() {
        this.cloneMode = false;
    }
    handleSaveClone() {
        let result = this.save();
        if (result.isvalid) {
            this.emp = { ...this.emp, ...result.obj };
            this.emp.StatusRequest = 'Draft';
            this.emp.ACC = this.listConts.join(',');
            // this.emp.StatusRequest = this.statusDetail;
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            var dateVar = new Date();
            //Current Date 
            let currentDate = new Date(dateVar.getTime() + dateVar.getTimezoneOffset() * 60000).toISOString();
            console.log(currentDate);
            if (currentDate > this.emp.RH_StartDate || this.emp.RH_StartDate > this.emp.RH_EndDate) {
                this.showToast('error', 'Error', this.l.RequestErrorDate);
            } else {
                this.natureOpt = this.l.RequestCloned;
                this.createRequest();
            }
        } else {
            console.log(`Is not valid `);
        }
        console.log(`emp`, this.emp);
    }
    handleSaveCloneAndSend() {
        let result = this.save();
        if (result.isvalid) {
            this.emp = { ...this.emp, ...result.obj };
            this.emp.StatusRequest = 'Submited';
            this.emp.ACC = this.listConts.join(',');
            // this.emp.StatusRequest = this.statusDetail;
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            var dateVar = new Date();
            //Current Date 
            let currentDate = new Date(dateVar.getTime() + dateVar.getTimezoneOffset() * 60000).toISOString();
            console.log(currentDate);
            if (currentDate > this.emp.RH_StartDate || this.emp.RH_StartDate > this.emp.RH_EndDate) {
                this.showToast('error', 'Error', this.l.RequestErrorDate);
            } else {
                this.natureOpt = this.l.RequestClonedAndSend;
                this.createRequest();
            }
        } else {
            console.log(`Is not valid `);
        }
        console.log(`emp`, this.emp);

    }
    handleSaveEditAndSend() {
        let result = this.save();
        if (result.isvalid) {
            this.emp = { ...this.emp, ...result.obj };
            this.emp.IdRequest = this.recordId;
            this.emp.StatusRequest = 'Submited';
            this.emp.ACC = this.listConts.join(',');
            // this.emp.StatusRequest = this.statusDetail;
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            var dateVar = new Date();
            //Current Date 
            let currentDate = new Date(dateVar.getTime() + dateVar.getTimezoneOffset() * 60000).toISOString();
            console.log(currentDate);
            if (currentDate > this.emp.RH_StartDate || this.emp.RH_StartDate > this.emp.RH_EndDate) {
                this.showToast('error', 'Error', this.l.RequestErrorDate);
            } else {
                this.natureOpt = this.l.RequestEditedAndSend;
                this.createRequest();
            }
        } else {
            console.log(`Is not valid `);
        }
        console.log(`emp`, this.emp);
    }

    handleSaveEdit() {
        let result = this.save();
        if (result.isvalid) {
            this.emp = { ...this.emp, ...result.obj };
            this.emp.IdRequest = this.recordId;
            this.emp.StatusRequest = 'Draft';
            this.emp.ACC = this.listConts.join(',');
            // this.emp.StatusRequest = this.statusDetail;
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            var dateVar = new Date();
            //Current Date 
            let currentDate = new Date(dateVar.getTime() + dateVar.getTimezoneOffset() * 60000).toISOString();
            console.log(currentDate);
            if (currentDate > this.emp.RH_StartDate || this.emp.RH_StartDate > this.emp.RH_EndDate) {
                this.showToast('error', 'Error', this.l.RequestErrorDate);
            } else {
                this.natureOpt = this.l.RequestEdited;
                this.createRequest();
            }
        } else {
            console.log(`Is not valid `);
        }
        console.log(`emp`, this.emp);
    }

    handleSave() {
        let result = this.save();
        if (result.isvalid) {
            this.emp = { ...this.emp, ...result.obj };
            this.emp.StatusRequest = 'Draft';
            this.emp.ACC = this.listConts.join(',');
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            var dateVar = new Date();
            //Current Date 
            let currentDate = new Date(dateVar.getTime() + dateVar.getTimezoneOffset() * 60000).toISOString();
            console.log(currentDate);
            if (currentDate > this.emp.RH_StartDate || this.emp.RH_StartDate > this.emp.RH_EndDate) {
                this.showToast('error', 'Error', this.l.RequestErrorDate);
            } else {
                this.natureOpt = this.l.RequestCreated;
                this.createRequest();
            }
        } else {
            console.log(`Is not valid `);
        }
        console.log(`emp`, this.emp);
    }

    handleSaveAndSend() {
        let result = this.save();
        if (result.isvalid) {
            this.emp = { ...this.emp, ...result.obj };
            this.emp.StatusRequest = 'Submited';
            this.emp.ACC = this.listConts.join(',');
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            var dateVar = new Date();
            //Current Date 
            let currentDate = new Date(dateVar.getTime() + dateVar.getTimezoneOffset() * 60000).toISOString();
            console.log(currentDate);
            if (currentDate > this.emp.RH_StartDate || this.emp.RH_StartDate > this.emp.RH_EndDate) {
                this.showToast('error', 'Error', this.l.RequestErrorDate);
            } else {
                this.natureOpt = this.l.RequestCreatedAndSend;
                this.createRequest();
            }
        } else {
            console.log(`Is not valid `);
        }
        console.log(`emp`, this.emp);
    }

    save() {
        let form = this.template.querySelector('c-rh_dynamic_form');
        console.log(form);
        let isvalid = true;
        let obj = {};

        let saveResult = form.save();
        console.log(`>>>>>>>>>>>>saveResult `, saveResult);
        let outputs = saveResult.outputs;
        isvalid = isvalid && saveResult.isvalid;
        console.log(`>>>>>>>>>>>>outputs `, outputs);
        obj = saveResult.obj;
        console.log(`>>>>>>>>>>>>obj `, obj);
        return { isvalid, obj };
    }

    createRequest() {
        console.log('this.emp ///> ', this.emp);
        this.emp.RecordT = this.typeId;
        this.startSpinner(true);
        newRequest({
            Requestjson: JSON.stringify(this.emp)
        })//{ con: this.emp }
            .then(result => {
                console.log('Result createRequest', result);
                if (result.error) {
                    this.showToast('error', 'Error', result.msg);
                } else {
                    this.showToast('success', 'success', this.natureOpt);
                    // this.handleCancelDetail();
                    this.goToRequestDetail(result.RequestUser.Id);
                    // this.tabReq = [];
                    // this.getRequest();
                    // this.isNew = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
            }).finally(() => {
                this.startSpinner(false);
            });
    }

    ShowModal(show, text, actions, extra = {}) {
        fireEvent(this.pageRef, 'Modal', { show, text, actions, extra });
    }

    showToast(variant, title, message){
        fireEvent(this.pageRef, 'Toast', {variant, title, message});
    }

    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
    }

    dobackbuttom(event) {
        unregisterListener('backbuttom', this.dobackbuttom, this);
        console.log('fdgfdgfdgfdfgdgfdgfdg');
        //this.handleHomeGroupe();
        this.goToPage('my-request', {});
        // event.preventDefault();
    }

    goToPage(pagenname, state = {}) {
        //var pagenname ='rhgroup'; //request page nam
        //let states={'recordId': recordid}; //event.currentTarget.dataset.id , is the recordId of the request

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: pagenname
            },
            state
        });
    }


    buildform() {
        this.firstFieldInputs = [
            {
                label: this.l.RequestTypeName,
                placeholder: this.l.RequestTypeName,
                name: 'TypeOfRequest',
                picklist: true,
                options: this.optionsRecord,
                maxlength: 100,
                value: 'Request',
                required: true,
                ly_md: '3'
            }];
    }

   buildformComplain() {
        // await this.getAllContact();
        // this.lastFieldInputsComplain = [
        this.lastFieldInputsAll = [
            {
                label: this.l.AddressedTo,
                placeholder: this.l.AddressedTo,
                name: 'RH_AddressedTo',
                picklist: true,
                options: this.addressedRecord,
                value: '',
                required: true,
                ly_md: '6',
                ly_lg: '6'
            },
            // {
            //     label: 'Addressed CC',
            //     placeholder: 'Select',
            //     name: 'RH_AddressedCc',
            //     picklist: true,
            //     options: this.addressedRecord,
            //     value: '',
            //     required: true,
            //     ly_md: '6',
            //     ly_lg: '6'
            // },
            {
                label: this.l.ComplainOn,
                placeholder: this.l.ComplainOn,
                name: 'ComplainOn',
                picklist: true,
                options: this.allContact,
                value: '',
                required: true,
                ly_md: '6',
                ly_lg: '6'
            },
            {
                label: this.l.Description,
                placeholder: this.l.Description,
                name: 'RH_Description',
                className: 'textarea',
                maxlength: 25000,
                type: 'textarea',
                value: '',
                required: true,
                ly_md: '6',
                ly_lg: '6'
            }
        ]
    }
    buildformPerm() {
        // this.lastFieldInputsPermHoli = [
        this.lastFieldInputsAll = [
            {
                label: this.l.AddressedTo,
                placeholder: this.l.AddressedTo,
                name: 'RH_AddressedTo',
                picklist: true,
                options: this.addressedRecord,
                value: '',
                required: true,
                ly_md: '6',
                ly_lg: '6'
            },
            {
                label: this.l.Description,
                placeholder: this.l.Description,
                name: 'RH_Description',
                className: 'textarea',
                maxlength: 25000,
                type: 'textarea',
                value: '',
                required: true,
                ly_md: '6',
                ly_lg: '6'
            },
            {
                label: this.l.StartDate,
                placeholder: this.l.StartDate,
                name: 'RH_StartDate',
                value: '',
                required: true,
                type: 'Datetime',
                ly_md: '6',
                ly_lg: '6'
            },
            {
                label: this.l.EndDate,
                placeholder: this.l.EndDate,
                name: 'RH_EndDate',
                value: '',
                required: true,
                type: 'Datetime',
                ly_md: '6',
                ly_lg: '6'
            }
        ]
    }

    buildformHoli() {
        // this.lastFieldInputsPermHoli = [
        this.lastFieldInputsAll = [
            {
                label: this.l.AddressedTo,
                placeholder: this.l.AddressedTo,
                name: 'RH_AddressedTo',
                picklist: true,
                options: this.addressedRecord,
                value: '',
                required: true,
                ly_md: '6',
                ly_lg: '6'
            },
            {
                label: this.l.Description,
                placeholder: this.l.Description,
                name: 'RH_Description',
                className: 'textarea',
                maxlength: 25000,
                type: 'textarea',
                value: '',
                required: true,
                ly_md: '6',
                ly_lg: '6'
            },
            {
                label: this.l.StartDate,
                placeholder: this.l.StartDate,
                name: 'RH_StartDate',
                value: '',
                required: true,
                type: 'Date',
                ly_md: '6',
                ly_lg: '6'
            },
            {
                label: this.l.EndDate,
                placeholder: this.l.EndDate,
                name: 'RH_EndDate',
                value: '',
                required: true,
                type: 'Date',
                ly_md: '6',
                ly_lg: '6'
            }
        ]
    }

    buildformExplanation() {
        // this.lastFieldInputsExplanation = [
        this.lastFieldInputsAll = [

            {
                label: this.l.AddressedTo,
                placeholder: this.l.AddressedTo,
                name: 'RH_AddressedTo',
                picklist: true,
                options: this.addressedRecord,
                value: '',
                required: true,
                ly_md: '6',
                ly_lg: '6'
            },
            {
                label: 'Addressed CC',
                placeholder: 'Select',
                name: 'RH_AddressedCc',
                picklist: true,
                options: this.addressedRecord,
                value: '',
                required: true,
                ly_md: '6',
                ly_lg: '6'
            },
            {
                label: this.l.Description,
                placeholder: this.l.Description,
                name: 'RH_Description',
                className: 'textarea',
                maxlength: 25000,
                type: 'textarea',
                value: '',
                required: true,
                ly_md: '6',
                ly_lg: '6'
            }
        ]
    }

    columnsVisited = [
        {
            label: 'Request', fieldName: 'Request',
            sortable: true,
            type: 'button',
            typeAttributes:
            {
                label: { fieldName: 'Request' },
                variant: 'base',
                value: 'Id'
            },
            sortable: true
        },
        {
            label: 'Statut', fieldName: 'Statut', type: "text",
            sortable: true
        },
        {
            label: 'Create date', fieldName: 'CreatedDate', type: "text",
            sortable: true
        },
        {
            label: 'Addressed To', fieldName: 'AddressedTo', type: "text",
            sortable: true
        }
    ];


}