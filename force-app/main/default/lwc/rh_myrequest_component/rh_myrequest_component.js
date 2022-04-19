import { LightningElement, track, wire } from 'lwc';
import { labels } from 'c/rh_label';
import { NavigationMixin } from 'lightning/navigation';
import getrequest from '@salesforce/apex/RH_Request_controller.getrequest';
import retreiveRequest from '@salesforce/apex/RH_Request_controller.retreiveRequest';
import getRecordType from '@salesforce/apex/RH_Request_controller.getRecordType';
import newRequest from '@salesforce/apex/RH_Request_controller.newRequest';
import getAdressedTo from '@salesforce/apex/RH_Request_controller.getAdressedTo';

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
    @track lastFieldInputsPermHoli = [];
    @track lastFieldInputsExplanation = [];
    @track isComplain = false;
    @track isPermHoli = false;
    @track isExplanation = false;
    @track typeId ;
    @track addressedRecord =[];
    @track formPersonanalInputDetails = [];  

    keysFields={AddressedTo:'ok'};//non used now
    keysLabels={
    CreatedDate:'Create date',
    Statut:'Statut',

    Request:'Request',

    AddressedTo:'Addressed To'
    };
    fieldsToShow={
        CreatedDate:'Create date',
        Statut:'Statut',
        AddressedTo:'Addressed To'
    };

    get hasRecordId(){
        return this.recordId ? true : false;
    }

    @wire(getrequest) 
        getReq({data,errr}){
            console.log('@@@@@objectReturn');
            if(data){
                const self=this;
                data.forEach(elt => { 
                let objetRep = {};
                objetRep = {
                    "Request": elt?.RH_Description__c,
                    "Statut": elt?.Rh_Status__c,
                    "CreatedDate":  (new Date(elt.CreatedDate)).toLocaleString(),
                    "AddressedTo": elt.RH_Addressed_To__r?.Name,
                    "ID" : elt.Id,
                    icon:"standard:people",
                    title: elt?.RH_Description__c,
                    keysFields:self.keysFields,
                    keysLabels:self.keysLabels,
                    fieldsToShow:self.fieldsToShow,
                }
             
                console.log('@@@@@objectReturn' + objetRep);
                    this.tabReq.push(objetRep);
                });
                // this.refreshTable(this.tabReq); 
                this.setviewsList( this.tabReq)

            }
            if(errr) console.error(errr);
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
        

        this.formPersonanalInputDetails=[
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
                label:this.l.AddressedTo,
                placeholder:this.l.AddressedTo,
                name:'AddressedTo',
                value:profileinformation?.RH_Addressed_To__c,
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
                maxlength:255,
                type:'email',
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:this.l.RequestTypeName,
                name:'RequestTypeName',
                required:true,
                value:profileinformation?.RH_RequestTypeName__c,
                readOnly:true,
                ly_md:'12', 
                ly_lg:'12'
            }
            
            // {
            //     label:this.l.Phone,
            //     placeholder:this.l.PhonePlc,
            //     name:'Phone',
            //     type:'phone',
            //     required:true,
            //     value:profileinformation?.Phone,
            //     ly_md:'6', 
            //     ly_lg:'6'
            // },

            /*{
                label:this.l.Username,
                placeholder:this.l.UsernamePlc,
                name:'Login',
                type:'email',
                required:true,
                value:profileinformation?.Username,
                ly_md:'6', 
                ly_lg:'6'
            },*/
            // {
            //     label:this.l.City,
            //     placeholder:this.l.CityPlc,
            //     name:'City',
            //     type:'address',
            //     value:profileinformation?.OtherAddress,
            //     ly_md:'6', 
            //     ly_lg:'6'
            // },
            // {
            //     label:this.l.Birthday,
            //     placeholder:this.l.BirthdayPlc,
            //     name:'Birthday',
            //     type:'date',
            //     required:true,
            //     value:profileinformation?.Birthdate,
            //     ly_md:'6', 
            //     ly_lg:'6'
            // },
            // {
            //     label:this.l.AboutMe,
            //     name:'Description',
            //     value:profileinformation?.Description,
            //     placeholder:this.l.AboutMePlc,
            //     className:'textarea',
            //     maxlength:25000,
            //     type:'textarea',
            //     ly_md:'12', 
            //     ly_lg:'12'
            // }
        
        ];
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


    detailPage(recordId){
        // this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        retreiveRequest({requestId : this.recordId})
        .then(result =>{
            console.log('@@@@result '+result);
            this.buildformDetail(result);
        }).catch(error =>{
            console.error(error);
        });
    }

    connectedCallback(){
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        if(this.recordId){
             this.detailPage(this.recordId);
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
            this.createRequest();
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
                this.isNew = false;
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
            this.lastFieldInputsComplain = [
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
        this.lastFieldInputsPermHoli = [
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
                    type:'Date',
                    ly_md:'6', 
                    ly_lg:'6'
                },
                {
                    label:'End date',
                    placeholder:'Select',
                    name:'RH_EndDate',
                    value: '',
                    required:true,
                    type:'Date',
                    ly_md:'6', 
                    ly_lg:'6'
                }
            ]
    }
    buildformExplanation(){
        this.lastFieldInputsExplanation = [
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