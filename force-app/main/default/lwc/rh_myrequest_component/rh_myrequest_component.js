import { LightningElement, track, wire } from 'lwc';
import { labels } from 'c/rh_label';
import { NavigationMixin } from 'lightning/navigation';
import getrequest from '@salesforce/apex/RH_Request_controller.getrequest';
import retreiveRequest from '@salesforce/apex/RH_Request_controller.retreiveRequest';
import getRecordType from '@salesforce/apex/RH_Request_controller.getRecordType';
import newRequest from '@salesforce/apex/RH_Request_controller.newRequest';
import getAdressedTo from '@salesforce/apex/RH_Request_controller.getAdressedTo';
import deleteRequest from '@salesforce/apex/RH_Request_controller.deleteRequest';

export default class Rh_myrequest_component extends NavigationMixin(LightningElement) {
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
    @track lastFieldInputsPermHoli = [];
    @track lastFieldInputsExplanation = [];
    @track isComplain = false;
    @track isPermHoli = false;
    @track isExplanation = false;
    @track editMode = false;
    @track typeId ;
    @track addressedRecord =[];
    @track formPersonanalInputDetails = [];
    @track formPersonanalInputDetailsComplain = [];
    @track formPersonanalInputDetailsPermHoli = [];
    @track formPersonanalInputDetailsExplanation = [];  
    @track resultRecord;

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

    get hasRecordId(){
        return this.recordId ? true : false;
    }

    // @wire(getrequest) 
    //     getReq({data,errr}){
    //         console.log('@@@@@objectReturn');
    getRequest(){
        getrequest()
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

    handleCardAction(event){
        console.log('event parent ' +JSON.stringify(event.detail));
        const info=event.detail;
        if (info?.extra?.isTitle) {
            // this.goToRequestDetail(this.recordId);
            this.goToRequestDetail(info?.data?.id);
        }
    }
    setviewsList(items){
        let cardsView=this.template.querySelector('c-rh_cards_view');
        cardsView?.setDatas(items);
    }

    
    buildformDetail(profileinformation){

        console.log('@@@@@RecordType.Name' + profileinformation?.RecordType.Name);
        if(profileinformation?.RecordType.Name == 'Complain'){
            this.formPersonanalInputDetails=[ 
                            
                        {
                            label:this.l.AddressedTo,
                            placeholder:this.l.AddressedTo,
                            name:'AddressedTo',
                            picklist: true,
                            options: this.addressedRecord,
                            value:profileinformation?.RH_Addressed_To__r?.Id,
                            required:false,
                            ly_md:'6', 
                            ly_lg:'6'
                        },
                        {
                            label:this.l.AddressedCc,
                            placeholder:this.l.AddressedCc,
                            name:'AddressedCc',
                            required:true,
                            value:profileinformation?.RH_Addressed_Cc__c,
                            ly_md:'6', 
                            ly_lg:'6'
                        },
                        {
                            label:this.l.Status,
                            name:'Status',
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
                            name:'RequestTypeName',
                            required:true,
                            value:profileinformation?.RecordType?.Name,
                            readOnly:true,
                            ly_md:'6', 
                            ly_lg:'6'
                        },
                        {
                            label:this.l.Description,
                            placeholder:this.l.Description,
                            name:'Description',
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
                name:'AddressedTo',
                picklist: true,
                options: this.addressedRecord,
                value:profileinformation?.RH_Addressed_To__r?.Name,
                required:false,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.AddressedCc,
                placeholder:this.l.AddressedCc,
                name:'AddressedCc',
                required:true,
                value:profileinformation?.RH_Addressed_Cc__c,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Status,
                name:'Status',
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
                name:'RequestTypeName',
                required:true,
                value:profileinformation?.RecordType?.Name,
                readOnly:true,
                ly_md:'12', 
                ly_lg:'6'
            },
            {
                label:this.l.Description,
                placeholder:this.l.Description,
                name:'Description',
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
                    name:'AddressedTo',
                    picklist: true,
                    options: this.addressedRecord,
                    value:profileinformation?.RH_Addressed_To__r?.Id,
                    required:false,
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:this.l.Status,
                    name:'Status',
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
                    name:'RequestTypeName',
                    required:true,
                    value:profileinformation?.RecordType?.Name,
                    readOnly:true,
                    ly_md:'6', 
                    ly_lg:'6'
                },
                
                {
                    label:this.l.Description,
                    placeholder:this.l.Description,
                    name:'Description',
                    value:profileinformation?.RH_Description__c,
                    required:true,
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:this.l.StartDate,
                    placeholder:this.l.StartDate,
                    name:'StartDate',
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
                    name:'EndDate',
                    value: profileinformation?.RH_End_date__c,
                    type:'Datetime',
                    ly_md:'6', 
                    ly_lg:'6',
                    isDatetime:true
                }
                    ];
        }
        
    }



    handlerselected(event){
        console.log('@@@@@@ray ' + JSON.stringify(event.detail) );
        this.recordId = event.detail.row.ID;
       this.goToRequestDetail(this.recordId);

    }


    handlechge(event){
        const item = event.detail.info;
        this.typeId = item.value;
        
       
        console.log('OUTPUT xxxx: item ',item);

        getAdressedTo()
        .then(result =>{
            this.addressedRecord = result.map(plValue => {
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
 
    handleChangeValue(){
        this.isNew = true;
        getRecordType()
        .then(result =>{
                this.optionsRecord = result.map(plValue => {
                                return {
                                    label: plValue.Name,
                                    value: plValue.Id
                                };
                            });
            this.buildform();
            this.optionsRecordList = result;
        })
        
    }
    handleCancel(){
        this.isNew = false;
        // window.location.reload();
    }
    handleNext(){
        this.isAllFields = true;
        this.openNext();
    }
    handleCancelDetail(){
        var pagenname ='my-request'; //request page nam
        // let states={'recordId': recordid}; //event.currentTarget.dataset.id , is the recordId of the request
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            // state: states
        });
    }
    handleDeleteValue(){
        deleteRequest({requestId : this.recordId})
        .then(result =>{
            if(result == 'OK'){
                this.showToast('success', 'success', 'OK');
                // this.getRequest();
                this.handleCancelDetail();
            }else{
                this.showToast('error', 'Error', result);
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    }

    handleEditValue(){
        getAdressedTo()
        .then(result =>{
            this.addressedRecord = result.map(plValue => {
                            return {
                                label: plValue.Name,
                                value: plValue.Id
                            };
                        });
                        this.buildformDetail(this.resultRecord);
                        this.editMode = true;
        }).catch(error => {
            console.error('Error:', error);
        });
       

    }

    // getAAdressedTo(){
    //     getAdressedTo()
    //     .then(result =>{
    //         this.addressedRecord = result.map(plValue => {
    //                         return {
    //                             label: plValue.Name,
    //                             value: plValue.Id
    //                         };
    //                     });
    //         this.buildformDetail(result);
    //     }).catch(error => {
    //         console.error('Error:', error);
    //     });
    // }

    handleCancelEdit(){
        this.editMode = false;
    }

    openNext(){
        this.optionsRecordList.forEach(op=> {
            console.log('@@@@@objectMap' + op);
            if(op.Id == this.typeId && op.Name == 'Complain'){
                this.isComplain = true;
                this.isExplanation = false;
                this.isPermHoli = false;
                this.buildformComplain();
            } 
            if(op.Id == this.typeId && op.Name == 'Explanation'){
                this.isExplanation = true;
                this.isComplain = false;
                this.isPermHoli = false;
                this.buildformExplanation();
            } 
            if(op.Id == this.typeId && op.Name == 'Holiday'){
                this.isPermHoli = true;
                this.isExplanation = false;
                this.isComplain = false;
                this.buildformPermHoli();
            } 
            if(op.Id == this.typeId && op.Name == 'Permisson'){
                this.isPermHoli = true;
                this.isExplanation = false;
                this.isComplain = false;
                this.buildformPermHoli();
            } 
        })
    }
    handleCancelLast(){
        this.isAllFields = false;
        this.isNew = false;
    }


    detailPage(){
        // this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        retreiveRequest({requestId : this.recordId})
        .then(result =>{
            console.log('@@@@result '+result);
            this.resultRecord = result;
            this.buildformDetail(result);
        }).catch(error =>{
            console.error(error);
        });
    }

    connectedCallback(){
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        if(this.recordId){
             this.detailPage(this.recordId);
        }else{
            this.getRequest();
        }
    }

    getUrlParamValue(url, key) {
		return new URL(url).searchParams.get(key);
    }

    goToRequestDetail(recordid) {
        var pagenname ='my-request'; //request page nam
        let states={'recordId': recordid}; //event.currentTarget.dataset.id , is the recordId of the request
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
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

    handleSave(evt){
        let result= this.save();
        if (result.isvalid) {
            this.emp={...this.emp,...result.obj};
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            if(this.emp.RH_StartDate > this.emp.RH_EndDate){
                this.showToast('error', 'Error', 'Take another date');
            }else{
                this.createRequest();
            }
            
        }else{
            console.log(`Is not valid `);
        }
        console.log(`emp`, this.emp);
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

    createRequest(){
        console.log('this.emp ///> ', this.emp);
        this.emp.RecordT = this.typeId ;
        newRequest({ 
            Requestjson: JSON.stringify(this.emp)})//{ con: this.emp }
          .then(result => {
            console.log('Result addEmployee', result);
            if (result.error) {
                this.showToast('error', 'Error', result.message);
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

    showToast(variant, title, message){
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);
    }

    buildform(){
        this.firstFieldInputs=[
            {
                label:'Type of Request',
                placeholder:'Select type',
                name:'TypeOfRequest',
                picklist: true,
                options: this.optionsRecord,
                maxlength:100,
                value: 'Request',
                required:true,
                ly_md:'3'
            }];
    }

    buildformComplain(){
            // this.lastFieldInputsComplain = [
            this.lastFieldInputsAll = [
            {
                label:'Addressed To',
                placeholder:'Select',
                name:'RH_AddressedTo',
                picklist: true,
                options: this.addressedRecord,
                value: '',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Addressed CC',
                placeholder:'Select',
                name:'RH_AddressedCc',
                picklist: true,
                options: this.addressedRecord,
                value: '',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Complain On',
                placeholder:'Select',
                name:'ComplainOn',
                value: '',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Description',
                placeholder:'type here',
                name:'RH_Description',
                className:'textarea',
                maxlength:25000,
                type:'textarea',
                value: '',
                required:true,
                ly_md:'6', 
                ly_lg:'6' 
            }
        ]
    }
    buildformPermHoli(){
        // this.lastFieldInputsPermHoli = [
            this.lastFieldInputsAll = [
                {
                    label:'Addressed To',
                    placeholder:'Select',
                    name:'RH_AddressedTo',
                    picklist: true,
                    options: this.addressedRecord,
                    value: '',
                    required:true,
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:'Description',
                    placeholder:'type here',
                    name:'RH_Description',
                    className:'textarea',
                    maxlength:25000,
                    type:'textarea',
                    value: '',
                    required:true,
                    ly_md:'6', 
                    ly_lg:'6' 
                },
                {
                    label:'Start date',
                    placeholder:'Select',
                    name:'RH_StartDate',
                    value: '',
                    required:true,
                    type:'Datetime',
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:'End date',
                    placeholder:'Select',
                    name:'RH_EndDate',
                    value: '',
                    required:true,
                    type:'Datetime',
                    ly_md:'6', 
                    ly_lg:'6'
                }
            ]
    }
    buildformExplanation(){
        // this.lastFieldInputsExplanation = [
            this.lastFieldInputsAll = [

                {
                    label:'Addressed To',
                    placeholder:'Select',
                    name:'RH_AddressedTo',
                    picklist: true,
                    options: this.addressedRecord,
                    value: '',
                    required:true,
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:'Addressed CC',
                    placeholder:'Select',
                    name:'RH_AddressedCc',
                    picklist: true,
                    options: this.addressedRecord,
                    value: '',
                    required:true,
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:'Description',
                    placeholder:'type here',
                    name:'RH_Description',
                    className:'textarea',
                    maxlength:25000,
                    type:'textarea',
                    value: '',
                    required:true,
                    ly_md:'6', 
                    ly_lg:'6' 
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