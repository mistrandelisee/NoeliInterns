import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { labels } from 'c/rh_label';
import getAccomplishment from '@salesforce/apex/RH_Accomplishment_Controller.getAccomplishment';
import addAccomplishment from '@salesforce/apex/RH_Accomplishment_Controller.addAccomplishment';
import accomplishmentDetail from '@salesforce/apex/RH_Accomplishment_Controller.accomplishmentDetail';
import checkCurrentContact from '@salesforce/apex/RH_Accomplishment_Controller.checkCurrentContact';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/pubsub';

export default class Rh_accomplishment extends NavigationMixin(LightningElement) {

    @track itemCard = [];
    @track newForm = false;
    @track recordId;
    @track isDraft;
    @track isCurrent;
    @track showEdit;
    @track isActive;
    l = {...labels};
    accomplishDetailInfo = [];
    accomInputDetails = [];
    @wire(CurrentPageReference) pageRef;
    status = 'Draft';
    formInputs=[];

    keysLabels={
        Statut: 'Statut',
        Title: 'Title',
        Description: 'Description',
        date: 'Date',
        Submiter: 'Submit by'
    };
    fieldsToShow={
        Statut: 'Statut',
        Type: 'Type',
        Title: 'Title',
        date: 'Date',
        Submiter: 'Submit by'
    };

    buildForm(){
        this.formInputs=[
            {
                label: this.l.Title,
                placeholder: this.l.TitlePlc,
                name:'title',
                value: '',
                required:false,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.DateLb,
                name:this.l.DatePlc,
                required:false,
                value: '',
                placeholder:'Enter your Date',
                type:'Date',
                ly_md:'6', 
                ly_lg:'6',
                isText:true
            },
            {
                label:this.l.Description,
                placeholder:this.l.DescriptionPlc,
                name:'description',
                value: '',
                type:'textarea',
                required:false,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Visibility,
                name:'visibility',
                checked:true,
                type:'toggle',
                ly_md:'6', 
                ly_lg:'6'
            }
        ]
    }

    connectedCallback(){
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        if(this.recordId){
            this.accomplishDetails(this.recordId); 
        }else{
            this.getAccomplish();
        }
    }

    get hasRecordId(){
        return this.recordId ? true : false;
    }

    getAccomplish(){
        getAccomplishment().then(result =>{
            const self=this;
            result.forEach(elt => { 
            let objetRep = {};
            objetRep = {
                "Statut": elt?.RH_Status__c,
                "Title": elt?.RH_Title__c,
                "Description": elt?.RH_Description__c,
                "date": elt?.RH_Date__c,
                "Submiter": elt.RH_Submiter__r?.Name,
                "id" : elt.Id,
                icon:"standard:people",
                
                title: elt?.Name,
                keysFields:self.keysFields,
                keysLabels:self.keysLabels,
                fieldsToShow:self.fieldsToShow,
            }
                this.itemCard.push(objetRep);
            }); 
            this.setviewsList( this.itemCard)
        })
    }

    setviewsList(items){
        let cardsView=this.template.querySelector('c-rh_cards_view');
        cardsView?.setDatas(items);
    }

    handleChangeValue(){
        this.newForm = true;
        this.buildForm();
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

    saveAccomplishment(input){
        this.startSpinner(true)
        addAccomplishment({ accomJson: JSON.stringify(input), status: this.status })
          .then(result => {
            console.log('Result saveAccomplishment:: ');
            console.log(result);
            if(!result.error) {
                this.showToast('success', 'Success', 'Accomplishment created successfuly');
                this.handleCancelDetail();
            }else{
                this.showToast('error', 'Error', result.msg);
                this.startSpinner(false)
            }
          })
          .catch(error => {
            console.error('Error:', error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }

    handleSave(){
        let record={};
        let result= this.save();
        if (result.isvalid) {
            record={...record,...result.obj};
            this.saveAccomplishment(record);
        }else{
            console.log(`Is not valid `);
        }
        console.log(`record `, record);
    }

    handleSaveActive(){
        this.status = 'Active';
        let record={};
        let result= this.save();
        if (result.isvalid) {
            record={...record,...result.obj};
            this.saveAccomplishment(record);
        }else{
            console.log(`Is not valid `);
        }
        console.log(`record `, record);
    }

    getUrlParamValue(url, key) {
		return new URL(url).searchParams.get(key);
    }

    goToRequestDetail(idAccom) {
        var pagenname ='accomplishment'; 
        let states={'recordId': idAccom};
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }

    accomplishDetails(idAccom) {
        accomplishmentDetail({idAccom: idAccom})
        .then(result =>{
            console.log('accomplishment --> ' , result);
            this.accomplishDetailInfo = result.map(obj => {
                let newobj={};
                newobj.Id = obj.Id;
                newobj.AccomName=obj.Name;
                newobj.AccomTitle=obj.RH_Title__c;
                newobj.AccomDescription=obj.RH_Description__c;
                newobj.AccomVisibility=obj.RH_Visibility__c;
                newobj.AccomDate=obj.RH_Date__c;
                newobj.AccomSubmiter=obj.RH_Submiter__r.Name;
                newobj.AccomStatus=obj.Rh_Status__c;
                return newobj;
            });
            this.buildFormDetails(this.accomplishDetailInfo);
            if(result.Rh_Status__c == 'Draft'){
                this.isDraft = true;
            }else{
                this.isActive = true;
            }
        }).catch(error =>{
            console.error('error',error)
        })

        checkCurrentContact({idAcc: idAccom})
        .then(result =>{
            console.log('accomplishment --> ' , result);
            this.isCurrent = result;
            this.showEdit = this.isCurrent && this.isDraft;
        }).catch(error =>{
            console.error('error',error)
        })
    }
    
    buildFormDetails(detailsInfo){
        this.accomInputDetails =[
            {
                label:'Name',
                name:'Name',
                type:'text',
                value:detailsInfo[0].AccomName,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Title',
                name:'Title',
                type:'text',
                value:datailsInfo[0].AccomTitle,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Status',
                name:'Status',
                picklist: true,
                value:detailsInfo[0].AccomStatus,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'visibility',
                name:'visibility',
                type:'checkbox',
                value:detailsInfo[0].AccomVisibility,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Submit By',
                name:'Submiter',
                type:'text',
                value:detailsInfo[0].AccomSubmiter,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Date',
                name:'Date',
                type:'date',
                value:detailsInfo[0].AccomDate,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Description',
                name:'Description',
                type:'textarea',
                value:detailsInfo[0].AccomDescription,
                ly_md:'12', 
                ly_lg:'12'
            },
        ];
    }

    handleCancel(){
        this.newForm = false;
    }

    handleCancelDetail(){
        var pagenname ='accomplishment';
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
        });
    }

    handleEditValue(){

    }

    handleActivate(){

    }

    handleDeleteValue(){

    }

    showToast(variant, title, message){
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);
    }

    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
     }

    handleCardAction(event){
        console.log('event parent ' +JSON.stringify(event.detail));
        const info=event.detail;
        if (info?.extra?.isTitle) {
            this.goToRequestDetail(info?.data?.id);
        }
    }
}