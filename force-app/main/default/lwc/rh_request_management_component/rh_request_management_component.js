import { LightningElement, track } from 'lwc';
import { labels } from 'c/rh_label';
import { NavigationMixin } from 'lightning/navigation';
import getRequestToManage from '@salesforce/apex/RH_Request_controller.getRequestToManage';
import retreiveRequest from '@salesforce/apex/RH_Request_controller.retreiveRequest';
import updateRequestForRejet from '@salesforce/apex/RH_Request_controller.updateRequestForRejet';


export default class Rh_request_management_component extends NavigationMixin(LightningElement) {
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
    @track isExplanation = false;
    @track editMode = false;
    @track isDraft = false;
    @track isOpen = false;
    @track cloneMode = false;
    @track isApprovedRejeted = false;
    @track isRejetedOrApproved = false;
    @track RejetedOrApproved ;
    @track typeId ;
    @track addressedRecord =[];
    @track formPersonanalInputDetails = [];
    @track formPersonanalInputDetailsComplain = [];
    @track formPersonanalInputDetailsPermHoli = [];
    @track formPersonanalInputDetailsExplanation = [];  
    @track resultRecord;
    @track statusDetail;
    @track appOrRej;


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

    // connectedCallback(){
    //     this.getRequestToManage();
    // }

    get hasRecordId(){
        return this.recordId ? true : false;
    }

    getRequestToManage(){
        getRequestToManage()
        .then(result =>{
            const self=this;
            result.forEach(elt => { 
            let objetRep = {};
            objetRep = {
                "Request": elt?.RH_Description__c,
                "Statut": elt?.Rh_Status__c,
                "CreatedDate":  (new Date(elt.CreatedDate)).toLocaleString(),
                "AddressedTo": elt.RH_Addressed_To__r?.Name,
                "Type": elt.RecordType.Name,
                "id" : elt.Id,
                icon:"standard:people",
                
                title: elt?.Name,
                keysFields:self.keysFields,
                keysLabels:self.keysLabels,
                fieldsToShow:self.fieldsToShow,
            }
         
            console.log('@@@@@objectReturn' + objetRep);
                this.tabReq.push(objetRep);
            });
            // this.refreshTable(this.tabReq); 
            this.setviewsList( this.tabReq)
        })
    }

    handleRejetRequest(){
        this.isApprovedRejeted = true;
        this.RejetedOrApproved = 'Rejeted';
        this.appOrRej ='Rejet request';
        this.buildRejetForm();

    }
    handleApproveRequest(){
        this.isApprovedRejeted = true;
        this.RejetedOrApproved = 'Approved';
        this.appOrRej ='Approve request';
        this.buildRejetForm();
    }

    // handleSaveApprove(){
    //     let result= this.save();
    //     if (result.isvalid) {
    //         this.emp={...this.emp,...result.obj};
    //         this.emp.IdRequest = this.recordId;
    //         this.emp.StatusRequest = 'Approved';
    //             this.createRequestApprove();
            
    //     }else{
    //         console.log(`Is not valid `);
    //     }
    //     console.log(`emp`, this.emp);
    // }

    handleSaveRejet(){
        let result= this.save();
        if (result.isvalid) {
            this.emp={...this.emp,...result.obj};
            this.emp.IdRequest = this.recordId;
            this.emp.StatusRequest = this.RejetedOrApproved;
                this.createRequestRejet();
            
        }else{
            console.log(`Is not valid `);
        }
        console.log(`emp`, this.emp);
    }

    handleCancelRejet(){
        this.isApprovedRejeted = false;
    }

    setviewsList(items){
        let cardsView=this.template.querySelector('c-rh_cards_view');
        cardsView?.setDatas(items);
    }

    detailPage(){
        // this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        retreiveRequest({requestId : this.recordId})
        .then(result =>{
            console.log('@@@@result '+result);
            this.resultRecord = result;
            this.typeId = result.RecordTypeId;
            this.statusDetail = result.Rh_Status__c;
            this.buildformDetail(result);
            if(result.RecordType.Name == 'Complain'){
                this.isComplain = true;
            }
            if (result.Rh_Status__c == 'Rejeted' || result.Rh_Status__c == 'Approved') {
                this.isRejetedOrApproved = true;
            }

            // if(result.Rh_Status__c == 'Draft'){
            //     this.isDraft = true;
            // }else{
            //     this.isOpen = true;
            // }
        }).catch(error =>{
            console.error(error);
        });
    }

    connectedCallback(){
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        if(this.recordId){
             this.detailPage(this.recordId);
        }else{
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
            // this.goToRequestDetail(this.recordId);
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
            // state: states
        });
    }

    createRequestApprove(){
        console.log('this.emp ///> ', this.emp);
        this.emp.RecordT = this.recordId ;
        updateRequestForApprove({ 
            RecordT: this.recordId,
            Reason: this.emp?.RH_Reason,
            StatusApprove: this.emp.StatusRequest})//{ con: this.emp }
          .then(result => {
            console.log('Result updateRequestForApprove', result);
            if (result.error) {
                this.showToast('error', 'Error', result.msg);
            }else{
                this.showToast('success', 'success', 'ok');
                this.handleCancelDetail();
                // this.tabReq = [];
                // this.getRequest();
                // this.isNew = false;
            }
          })
          .catch(error => {
            console.error('Error:', error);
        }).finally(()=>{
            });
    }

    createRequestRejet(){
        console.log('this.emp ///> ', this.emp);
        this.emp.RecordT = this.recordId ;
        updateRequestForRejet({ 
            RecordT: this.recordId,
            Reason: this.emp?.RH_Reason,
            StatusRejeted: this.emp.StatusRequest})//{ con: this.emp }
          .then(result => {
            console.log('Result createRequestRejet', result);
            if (result.error) {
                this.showToast('error', 'Error', result.msg);
            }else{
                this.showToast('success', 'success', 'ok');
                this.handleCancelDetail();
                // this.tabReq = [];
                // this.getRequest();
                // this.isNew = false;
            }
          })
          .catch(error => {
            console.error('Error:', error);
        }).finally(()=>{
            });
    }
    
    // createRequest(){
    //     console.log('this.emp ///> ', this.emp);
    //     this.emp.RecordT = this.typeId ;
    //     newRequest({ 
    //         Requestjson: JSON.stringify(this.emp)})//{ con: this.emp }
    //       .then(result => {
    //         console.log('Result createRequest', result);
    //         if (result.error) {
    //             this.showToast('error', 'Error', result.msg);
    //         }else{
    //             this.showToast('success', 'success', 'ok');
    //             this.handleCancelDetail();
    //             // this.tabReq = [];
    //             // this.getRequest();
    //             // this.isNew = false;
    //         }
    //       })
    //       .catch(error => {
    //         console.error('Error:', error);
    //     }).finally(()=>{
    //         });
    // }

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

    buildformDetail(profileinformation){

        console.log('@@@@@RecordType.Name' + profileinformation?.RecordType.Name);
        if(profileinformation?.RecordType.Name == 'Complain'){
            this.formPersonanalInputDetails=[ 
                            
                        {
                            label:this.l.AddressedTo,
                            placeholder:this.l.AddressedTo,
                            name:'RH_AddressedTo',
                            picklist: true,
                            options: this.addressedRecord,
                            value:profileinformation?.RH_Addressed_To__r?.Name,
                            required:false,
                            ly_md:'6', 
                            ly_lg:'6'
                        },
                        {
                            label:this.l.Come,
                            placeholder:this.l.Come,
                            name:'RH_Owner',
                            value:profileinformation?.CreatedBy.Name,
                            required:true,
                            ly_md:'6', 
                            ly_lg:'6'
                        },
                        {
                            label:this.l.AddressedCc,
                            placeholder:this.l.AddressedCc,
                            name:'RH_AddressedCc',
                            required:true,
                            value:profileinformation?.RH_Addressed_Cc__c,
                            ly_md:'6', 
                            ly_lg:'6'
                        },
                        {
                            label:this.l.Status,
                            name:'StatusRequest',
                            required:true,
                            value:profileinformation?.Rh_Status__c,
                            placeholder:this.l.Status,
                            readOnly:true,
                            maxlength:255,
                            type:'email',
                            ly_md:'6', 
                            ly_lg:'6'
                        },
                        {
                            label:this.l.RequestTypeName,
                            name:'RecordT',
                            required:true,
                            value:profileinformation?.RecordType?.Name,
                            readOnly:true,
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
        }
        if(profileinformation?.RecordType.Name == 'Explanation'){
            this.formPersonanalInputDetails=[
            
            {
                label:this.l.AddressedTo,
                placeholder:this.l.AddressedTo,
                name:'RH_AddressedTo',
                picklist: true,
                options: this.addressedRecord,
                value:profileinformation?.RH_Addressed_To__r?.Name,
                required:false,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Come,
                placeholder:this.l.Come,
                name:'RH_Owner',
                value:profileinformation?.CreatedBy.Name,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.AddressedCc,
                placeholder:this.l.AddressedCc,
                name:'RH_AddressedCc',
                required:true,
                value:profileinformation?.RH_Addressed_Cc__c,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Status,
                name:'StatusRequest',
                required:true,
                value:profileinformation?.Rh_Status__c,
                placeholder:this.l.Status,
                readOnly:true,
                maxlength:255,
                type:'email',
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.RequestTypeName,
                name:'RecordT',
                required:true,
                value:profileinformation?.RecordType?.Name,
                readOnly:true,
                ly_md:'12', 
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
        }
        if(profileinformation?.RecordType.Name == 'Holiday' || profileinformation?.RecordType.Name == 'Permisson'){
            this.formPersonanalInputDetails=[
                
                {
                    label:this.l.AddressedTo,
                    placeholder:this.l.AddressedTo,
                    name:'RH_AddressedTo',
                    picklist: true,
                    options: this.addressedRecord,
                    value:profileinformation?.RH_Addressed_To__r?.Name,
                    required:false,
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:this.l.Come,
                    placeholder:this.l.Come,
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
                    placeholder:this.l.Status,
                    readOnly:true,
                    maxlength:255,
                    type:'email',
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:this.l.RequestTypeName,
                    name:'RecordT',
                    required:true,
                    value:profileinformation?.RecordType?.Name,
                    readOnly:true,
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
                },
                {
                    label:this.l.StartDate,
                    placeholder:this.l.StartDate,
                    name:'RH_StartDate',
                    required:true,
                    value: profileinformation?.RH_Start_date__c,
                    type:'Datetime',
                    ly_md:'6', 
                    ly_lg:'6',
                    isDatetime:true
                },
                {
                    label:this.l.EndDate,
                    placeholder:this.l.EndDate,
                    name:'RH_EndDate',
                    value: profileinformation?.RH_End_date__c,
                    type:'Datetime',
                    ly_md:'6', 
                    ly_lg:'6',
                    isDatetime:true
                }
                    ];
        }
        
    }

    buildRejetForm(){
        // this.lastFieldInputsComplain = [
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