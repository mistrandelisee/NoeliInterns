import { LightningElement, track, wire } from 'lwc';
import { fireEvent } from 'c/pubsub';
import { labels } from 'c/rh_label';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import getRequestToManage from '@salesforce/apex/RH_Request_controller.getRequestToManage';
import retreiveRequest from '@salesforce/apex/RH_Request_controller.retreiveRequest';
import checkAdressedTo from '@salesforce/apex/RH_Request_controller.checkAdressedTo';
import updateRequestForResponse from '@salesforce/apex/RH_Request_controller.updateRequestForResponse';
import getContacts from '@salesforce/apex/RH_Request_controller.getContacts';
import getExplanationType from '@salesforce/apex/RH_Request_controller.getExplanationType';
import newRequest from '@salesforce/apex/RH_Request_controller.newRequest';
import updateAnswerExp from '@salesforce/apex/RH_Request_controller.updateAnswerExp';
import getRequestByParent from '@salesforce/apex/RH_Request_controller.getRequestByParent';
import filterRequestToManage from '@salesforce/apex/RH_Request_controller.filterRequestToManage';
import getAllRecordType from '@salesforce/apex/RH_Request_controller.getAllRecordType';


export default class Rh_request_management_component extends NavigationMixin(LightningElement) {
    
    @wire(CurrentPageReference) pageRef;
    emp;
    l = {...labels};
    @track tabReq = [];
    @track recordId;
    @track Description ;
    @track Status ;
    @track End_date ;
    @track Start_date ;
    @track isNew = false;
    @track isAllFields = false;
    @track optionsRecord = [];
    @track optionsRecordList = [];
    @track firstFieldInputs = [];
    @track lastFieldInputsComplain = [];
    @track lastFieldInputsAll = [];
    @track fieldForRejet = [];
    @track lastFieldInputsPermHoli = [];
    @track lastFieldInputsExplanation = [];
    @track isComplain = false;
    @track isPermHoli = false;
    @track showNewExp = false;
    @track editMode = false;
    @track isDraft = false;
    @track isOpen = false;
    @track cloneMode = false;
    @track isApprovedRejeted = false;
    @track isRejetedOrApproved = false;
    @track isManageExp = false;
    @track isDetails = true;
    @track isAdressedTo;
    @track RejetedOrApproved ;
    @track typeId ;
    @track addressedRecord =[];
    @track formPersonanalInputDetails = [];
    @track formPersonanalInputDetailsComplain = [];
    @track formPersonanalInputDetailsPermHoli = [];
    @track formPersonanalInputDetailsExplanation = [];  
    @track resultRecord;
    @track statusDetail;
    @track titleExp;
    @track adressExp;
    @track appOrRej;
    @track answerForm=[];
    @track showAnswer = false;
    @track isExplanation = false;
    @track isExpAns = false;
    @track inputFormFilter=[];
    inputExplanForm = [];
    allContact = [];
    childRequests = [];
    allRecType = [];
    valueComplain;


    keysFields={AddressedTo:'ok'};//non used now
    keysLabels={
    CreatedDate:'Create date',
    Statut:'Statut',
    Type: 'Type',
    Request:'Request',

    AddressedTo:'Addressed To'
    };
    fieldsToShow={
        CreatedDate:'Create date',
        Statut:'Statut',
        Type: 'Type',
        AddressedTo:'Addressed To'
    };

    statusOptions = [
        {
            label: 'All',
            value: 'All'
        },
        {
            label: 'Approved',
            value: 'Approved'
        },
        {
            label: 'Draft',
            value: 'Draft'
        },
        {
            label: 'Rejected',
            value: 'Rejected'
        },
        {
            label: 'Submited',
            value: 'Submited'
        },
        {
            label: 'Responded',
            value: 'Responded'
        }
    ];

    get hasRecordId(){
        return this.recordId ? true : false;
    }

    getAllRecordType(){
        getAllRecordType()
            .then(result => {
                this.allRecType = result.map(plValue => {
                    return {
                        label: plValue.Name,
                        value: plValue.Id
                    };
                });
            })
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
                label:'From',
                placeholder:'From',
                name:'From',
                required:false,
                type: 'Date',
                ly_md: '3',
                ly_lg: '3',
            },
            {
                label:'To',
                placeholder:'To',
                name:'To',
                required:false,
                type: 'Date',
                ly_md: '3',
                ly_lg: '3',
            }];
    }

    get enableForm() {
        return this.inputFormFilter?.length>0 ? true : false;
    }

    filterRequestToManage(event){
        let reqType= event.detail.RequestType;
        let status= event.detail.status;
        let dateFrom= event.detail.From;
        let dateTo = event.detail.To;
        this.startSpinner(true);
        filterRequestToManage({requestType: reqType, status: status, dateFrom: dateFrom, dateTo: dateTo})
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
                    const badge={name: 'badge', class:self.classStyle(elt?.Rh_Status__c),label: elt?.Rh_Status__c}
                    objetRep.addons={badge};
                    this.tabReq.push(objetRep);
                });
                // this.refreshTable(this.tabReq); 
                this.setviewsList(this.tabReq)
            }).catch(error => {
                console.error('Error:', error);
            }).finally(() => {
                this.startSpinner(false);
            });
    }

    getRequestToManage(){
        this.startSpinner(true);
        getRequestToManage()
        .then(result =>{
            this.tabReq = [];
            this.buildFormFilter(this.allRecType);
            const self=this;
            result.forEach(elt => { 
            let objetRep = {};
            objetRep = {
                "Request": elt?.RH_Description__c,
                "CreatedDate":  (new Date(elt.CreatedDate)).toLocaleString(),
                "AddressedTo": elt.RH_Addressed_To__r?.Name,
                "Type": elt.RecordType.Name,
                "id" : elt.Id,
                title: elt?.Name,
                keysFields:self.keysFields,
                keysLabels:self.keysLabels,
                fieldsToShow:self.fieldsToShow,
            }
         
                console.log('@@@@@objectReturn' + objetRep);
                const badge={name: 'badge', class:self.classStyle(elt?.Rh_Status__c),label: elt?.Rh_Status__c}
                objetRep.addons={badge};
                this.tabReq.push(objetRep);
            });
            // this.refreshTable(this.tabReq); 
            this.setviewsList( this.tabReq)
        }).catch(error => {
            console.error('Error:', error);
        }).finally(() => {
            this.startSpinner(false);
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

    getExplanationType(){
        getExplanationType()
            .then(result => {
                this.typeId = result.Id;
            })
    }

    handleRejetRequest(){
        this.isDetails = false;
        this.isApprovedRejeted = true;
        this.RejetedOrApproved = 'Rejected';
        this.appOrRej ='Rejet request';
        this.buildRejetForm();
    }

    handleApproveRequest(){
        this.isDetails = false;
        this.isApprovedRejeted = true;
        this.RejetedOrApproved = 'Approved';
        this.appOrRej ='Approve request';
        this.buildRejetForm();
    }

    handleSaveResponse(){
        let result= this.save();
        if (result.isvalid) {
            this.emp={...this.emp,...result.obj};
            this.emp.IdRequest = this.recordId;
            this.emp.StatusRequest = this.RejetedOrApproved;
            this.createRequestResponse();
        }else{
            console.log(`Is not valid `);
        }
        console.log(`emp`, this.emp);
    }

    handleCancelRejet(){
        this.isApprovedRejeted = false;
        this.isDetails = true;
    }

    setviewsList(items){
        let cardsView=this.template.querySelector('c-rh_cards_view');
        cardsView?.setDatas(items);
    }
    
    handleExplanation(){
        this.isDetails = false;
        this.showNewExp = true;
        this.getExplanationType();
        getContacts()
            .then(result => {
                this.allContact = result.complainOn.map(plValue => {
                    return {
                        label: plValue.Name,
                        value: plValue.Id
                    };
                });
                this.buildFormExplanation();
            }).catch(error => {
                console.error('Error:', error);
            });
    }
    
    handleCancelExplanation(){
        this.showNewExp = false;
        this.isDetails = true;
    }
    
    createExplanation(){
        this.startSpinner(true);
        newRequest({
            Requestjson: JSON.stringify(this.emp)
        })
        .then(result => {
            console.log('Result Explanation', result);
            if (result.error) {
                this.showToast('error', 'Error', result.msg);
            } else {
                this.showToast('success', 'success', 'Explanation have been created and send successfully');
                this.goToRequestDetail(this.recordId);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        }).finally(() => {
            this.startSpinner(false);
        });
    }

    handleSendExplanation(){
        console.log('this.typeId ///> ', this.typeId);
        let result = this.save();
        if (result.isvalid) {
            this.emp = { ...this.emp, ...result.obj };
            this.emp.RecordT = this.typeId;
            this.emp.StatusRequest = 'Submited';
            this.emp.ParentRequestId = this.recordId;
            this.createExplanation();
        } else {
            console.log(`Is not valid `);
            this.showSpinner = false;
        }
        console.log(`emp`, this.emp);
    }
    
    sendAnswerExp(){
        this.startSpinner(true);
        updateAnswerExp({ 
            requestId: this.recordId,
            answer: this.emp.RH_Answer})
        .then(result => {
            console.log('Result updateAnswerExp', result);
            if (result.error) {
                this.showToast('error', 'Error', result.msg);
            }else{
                this.showToast('success', 'success', 'Answer explanation have been send successfully');
                this.goToRequestDetail(this.recordId);
            }
        }).catch(error => {
            console.error('Error:', error);
        }).finally(()=>{
            this.startSpinner(false);
        });
    }

    handleSendExp(){
        let result= this.save();
        if (result.isvalid) {
            this.emp={...this.emp,...result.obj};
            this.sendAnswerExp()
        }else{
            console.log(`Is not valid `);
        }
        console.log(`emp`, this.emp);
    }

    handleCancelExp(){
        this.showAnswer = false;
    }

    detailPage(){
        retreiveRequest({requestId : this.recordId})
        .then(result =>{
            console.log('@@@@result '+result);
            this.resultRecord = result;
            this.statusDetail = result.Rh_Status__c;
            if(result.RecordType.Name == 'Complain'){
                this.valueComplain = result.RH_Complain_On__r.Id;
                this.isComplain = true;
            }
            if(result.RecordType.Name == 'Explanation'){
                if(!result.RH_Answer__c){
                    this.isExpAns = true;
                }
                this.isExplanation = true;
            }
            let listContsValue = [];
            let NameAdressed;
            if(result.Adressedccs__r){
                listContsValue = result.Adressedccs__r.map(elt => elt.RH_Contact__c);
                let tabName = result.Adressedccs__r.map(elt => elt.RH_Contact__r.Name);
                NameAdressed = tabName.join(',');
            }
            this.buildformDetail(this.resultRecord, NameAdressed);
            if (result.Rh_Status__c == 'Rejected' || result.Rh_Status__c == 'Approved') {
                this.isRejetedOrApproved = true;
            }
            checkAdressedTo({requestId : this.recordId})
            .then(res =>{
                this.isAdressedTo = res;
            }).catch(err =>{
                console.error(err);
            });
        }).catch(error =>{
            console.error(error);
        });
        getRequestByParent({requestId : this.recordId})
        .then(result =>{
            if(result){
                this.buildFormRequestChild(result);
                this.isComplain = false;
                this.isManageExp = true;
                this.adressExp = result.RH_Addressed_To__r.Name;
                this.titleExp = 'Explanation To: '+this.adressExp;
            }
        }).catch(error =>{
            console.error(error);
        });
    }

    handleAnswerExp(){
        this.showAnswer = true;
        this.answerForm = [
            {
                label: 'Answer',
                placeholder: 'Answer',
                name: 'RH_Answer',
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

    connectedCallback(){
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        if(this.recordId){
            this.detailPage(this.recordId);
        }else{
            this.getAllRecordType();
            this.getRequestToManage();
        }
    }

    getUrlParamValue(url, key) {
		return new URL(url).searchParams.get(key);
    }
    
    handleCardAction(event){
        console.log('event parent ' +JSON.stringify(event.detail));
        const info=event.detail;
        if (info?.extra?.isTitle) {
            this.goToRequestDetail(info?.data?.id);
        }
    }


    goToRequestDetail(recordid) {
        var pagenname ='request-management'; //request page nam
        let states={'recordId': recordid}; //event.currentTarget.dataset.id , is the recordId of the request
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }

    handleCancelDetail(){
        var pagenname ='request-management'; //request page nam
        // let states={'recordId': recordid}; //event.currentTarget.dataset.id , is the recordId of the request
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
        });
    }

    createRequestResponse(){
        console.log('this.emp ///> ', this.emp);
        this.emp.RecordT = this.recordId ;
        this.startSpinner(true);
        updateRequestForResponse({ 
            RecordT: this.recordId,
            Reason: this.emp?.RH_Reason,
            Status: this.emp.StatusRequest})
          .then(result => {
            console.log('Result createRequestResponse', result);
            if (result.error) {
                this.showToast('error', 'Error', result.msg);
            }else{
                this.showToast('success', 'success', 'Request have been '+this.emp.StatusRequest+' correctly');
                this.handleCancelDetail();
            }
        }).catch(error => {
            console.error('Error:', error);
        }).finally(()=>{
            this.startSpinner(false);
        });
    }

    showToast(variant, title, message){
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);
    }

    save(){
        let form=this.template.querySelector('c-rh_dynamic_form');
        console.log(form);
        let isvalid=true;  
        let obj={};
        
        let saveResult=form.save();
        console.log(`>>>>>>>>>>>>saveResult `, saveResult );
        let outputs = saveResult.outputs;
        isvalid=isvalid && saveResult.isvalid;
        console.log(`>>>>>>>>>>>>outputs `, outputs );
        obj=saveResult.obj;
        console.log(`>>>>>>>>>>>>obj `, obj );
        return  {isvalid,obj};
    }

    showToast(variant, title, message){
        fireEvent(this.pageRef, 'Toast', {variant, title, message});
    }

    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
    }

    buildFormRequestChild(infosChild){
        let objAns = {
            label:'Answer',
            name:'RH_Answer',
            value:infosChild?.RH_Answer__c,
            required:true,
            ly_md:'12', 
            ly_lg:'12'
        }
        let dateResp = {
            label:'Responded Date',
            name:'RH_Date_Response__c',
            value:infosChild?.RH_Date_Response__c,
            required:true,
            ly_md:'6', 
            ly_lg:'6'
        }
        this.childRequests = [
            {
                label:this.l.Description,
                name:'RH_Description',
                value:infosChild?.RH_Description__c,
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Submited Date',
                name:'RH_Date_Submit__c',
                value:infosChild?.RH_Date_Submit__c,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            }
        ];
        if (infosChild.RH_Date_Response__c != null) {
                
            this.childRequests.push(dateResp);
        }
        if (infosChild?.RH_Answer__c != null) {
            
            this.childRequests.splice(1, 0, objAns);
        }
    }

    buildformDetail(profileinformation, adrrName){

        console.log('@@@@@RecordType.Name' + profileinformation?.RecordType.Name);
        let dateResp = {
            label:'Responded Date',
            name:'RH_Date_Response__c',
            value:profileinformation?.RH_Date_Response__c,
            required:true,
            ly_md:'6', 
            ly_lg:'6'
        }
        let objAns = {
            label:'Answer',
            name:'RH_Answer',
            value:profileinformation?.RH_Answer__c,
            required:true,
            ly_md:'12', 
            ly_lg:'12'
        }
        if(profileinformation?.RecordType.Name == 'Complain'){
            this.formPersonanalInputDetails=[ 
                            
                        {
                            label: this.l.ComplainOn,
                            name: 'ComplainOn',
                            value:profileinformation?.RH_Complain_On__r?.Name,
                            required:false,
                            ly_md:'6', 
                            ly_lg:'6'
                        },
                        {
                            label:this.l.Come,
                            name:'RH_Owner',
                            value:profileinformation?.CreatedBy.Name,
                            required:true,
                            ly_md:'6', 
                            ly_lg:'6'
                        },
                        {
                            label:this.l.AddressedCc,
                            name:'RH_AddressedCc',
                            required:true,
                            value:adrrName,
                            ly_md:'6', 
                            ly_lg:'6'
                        },
                        {
                            label:this.l.Status,
                            name:'StatusRequest',
                            required:true,
                            value:profileinformation?.Rh_Status__c,
                            ly_md:'6', 
                            ly_lg:'6'
                        },
                        {
                            label:this.l.RequestTypeName,
                            name:'RecordT',
                            required:true,
                            value:profileinformation?.RecordType?.Name,
                            ly_md:'6', 
                            ly_lg:'6'
                        },
                        {
                            label:this.l.Description,
                            name:'RH_Description',
                            value:profileinformation?.RH_Description__c,
                            required:true,
                            ly_md:'6', 
                            ly_lg:'6'
                        },
                        {
                            label:'Submited Date',
                            name:'RH_Date_Submit__c',
                            value:profileinformation?.RH_Date_Submit__c,
                            required:true,
                            ly_md:'6', 
                            ly_lg:'6'
                        }
                    ];
                    if (profileinformation?.RH_Date_Response__c != null) {
                
                        this.formPersonanalInputDetails.push(dateResp);
                    }
        }
        if(profileinformation?.RecordType.Name == 'Explanation'){
            this.formPersonanalInputDetails=[
            
                {
                    label:this.l.AddressedTo,
                    name:'RH_AddressedTo',
                    value:profileinformation?.RH_Addressed_To__r?.Name,
                    required:false,
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:this.l.Come,
                    name:'RH_Owner',
                    value:profileinformation?.CreatedBy.Name,
                    required:true,
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:this.l.Status,
                    name:'StatusRequest',
                    required:true,
                    value:profileinformation?.Rh_Status__c,
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:this.l.RequestTypeName,
                    name:'RecordT',
                    required:true,
                    value:profileinformation?.RecordType?.Name,
                    ly_md:'12', 
                    ly_lg:'6'
                },
                {
                    label:'Submited Date',
                    name:'RH_Date_Submit__c',
                    value:profileinformation?.RH_Date_Submit__c,
                    required:true,
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:this.l.Description,
                    name:'RH_Description',
                    value:profileinformation?.RH_Description__c,
                    required:true,
                    ly_md:'6', 
                    ly_lg:'6'
                }
            ];
            if (profileinformation?.RH_Date_Response__c != null) {
                this.formPersonanalInputDetails.splice(5, 0, dateResp)
            }
            if (profileinformation?.RH_Answer__c != null) {
                
                this.formPersonanalInputDetails.push(objAns);
            }
        }
        if(profileinformation?.RecordType.Name == 'Holiday' || profileinformation?.RecordType.Name == 'Permisson'){
            this.formPersonanalInputDetails=[ 
                {
                    label:this.l.AddressedTo,
                    name:'RH_AddressedTo',
                    value:profileinformation?.RH_Addressed_To__r?.Name,
                    required:false,
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:this.l.Come,
                    name:'RH_Owner',
                    value:profileinformation?.CreatedBy.Name,
                    required:true,
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:this.l.Status,
                    name:'StatusRequest',
                    required:true,
                    value:profileinformation?.Rh_Status__c,
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:this.l.RequestTypeName,
                    name:'RecordT',
                    required:true,
                    value:profileinformation?.RecordType?.Name,
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:this.l.StartDate,
                    name:'RH_StartDate',
                    required:true,
                    value: profileinformation?.RH_Start_date__c,
                    type:'Datetime',
                    ly_md:'6', 
                    ly_lg:'6',
                },
                {
                    label:this.l.EndDate,
                    name:'RH_EndDate',
                    value: profileinformation?.RH_End_date__c,
                    type:'Datetime',
                    ly_md:'6', 
                    ly_lg:'6',
                },
                {
                    label:'Submited Date',
                    name:'RH_Date_Submit__c',
                    value:profileinformation?.RH_Date_Submit__c,
                    required:true,
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:this.l.Description,
                    placeholder:this.l.Description,
                    name:'RH_Description',
                    value:profileinformation?.RH_Description__c,
                    required:true,
                    ly_md:'6', 
                    ly_lg:'6'
                }
            ];
            if (profileinformation?.RH_Date_Response__c != null) {
                
                this.formPersonanalInputDetails.splice(7, 0, dateResp)
            }
        }
        
    }

    buildFormExplanation(){ 
        
        this.inputExplanForm = [
            {
                label:this.l.AddressedTo,
                placeholder:this.l.AddressedTo,
                name:'RH_AddressedTo',
                picklist: true,
                options: this.allContact,
                value: this.valueComplain,
                ly_md:'6', 
                ly_lg:'6'
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

    buildRejetForm(){
        this.fieldForRejet = [
            {
                label:'Note',
                placeholder:'Type Here',
                name:'RH_Reason',
                className:'textarea',
                maxlength:25000,
                type:'textarea',
                value: '',
                ly_md:'6', 
                ly_lg:'6'
            }
        ]
    }

}