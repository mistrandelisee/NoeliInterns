import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { labels } from 'c/rh_label';
import { icons } from 'c/rh_icons';
import getAccomplishment from '@salesforce/apex/RH_Accomplishment_Controller.getAccomplishment';
import addAccomplishment from '@salesforce/apex/RH_Accomplishment_Controller.addAccomplishment';
import accomplishmentDetail from '@salesforce/apex/RH_Accomplishment_Controller.accomplishmentDetail';
import checkCurrentContact from '@salesforce/apex/RH_Accomplishment_Controller.checkCurrentContact';
import deleteAccomplishment from '@salesforce/apex/RH_Accomplishment_Controller.deleteAccomplishment';
import activateAccomplishment from '@salesforce/apex/RH_Accomplishment_Controller.activateAccomplishment';
import filterAccomplishment from '@salesforce/apex/RH_Accomplishment_Controller.filterAccomplishment';
import uploadFile from '@salesforce/apex/RH_News_controller.uploadFile';
import updateFile from '@salesforce/apex/RH_News_controller.updateFile';
import getFileInfos from '@salesforce/apex/RH_FileUploader.getFileInfos';
import deleteFiles from '@salesforce/apex/RH_FileUploader.deleteFiles';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent, registerListener, unregisterListener } from 'c/pubsub';

export default class Rh_accomplishment extends NavigationMixin(LightningElement) {

    @track itemCard = [];
    @track newForm = false;
    @track recordId;
    @track isDraft=false;
    @track isCurrent=false;
    @track showEdit;
    @track editMode = false;
    @track newFileData={};
    @track previewFile=false;
    isUpdate=false;
    l = {...labels};
    icon = {...icons};
    inputFormFilter = [];
    accomInputDetails = [];
    formEditInputs = [];
    newsFileDetails = [];
    @wire(CurrentPageReference) pageRef;
    status = 'Draft';
    formInputs=[];
    deleteId;

    keysLabels={
        Statut: 'Statut',
        Title: 'Title',
        Description: 'Description',
        date: 'Date',
        Submiter: 'Submit by'
    };
    fieldsToShow={
        Statut: 'Statut',
        date: 'Date',
        Submiter: 'Submit by'
    };

    statusOptions = [
        {
            label: 'Draft',
            value: 'Draft'
        },
        {
            label: 'Active',
            value: 'Active'
        }
    ];

    buildForm(){
        this.formInputs=[
            {
                label: this.l.Title,
                placeholder: this.l.TitlePlc,
                name:'title',
                value: '',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.DateLb,
                name:'myDate',
                required:false,
                placeholder:this.l.DatePlc,
                type:'Date',
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.UploadFile,
                name:'uploadFile',
                fileName: '',
                type:'file',
                accept:['.png','.jpg','.jpeg'] ,
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
            },
            {
                label:this.l.Description,
                placeholder:this.l.DescriptionPlc,
                name:'description',
                value: '',
                type:'textarea',
                required:false,
                ly_md:'12', 
                ly_lg:'12'
            }
        ]
    }

    buildFormFilter(){
        this.inputFormFilter=[
            {
                label: this.l.Title,
                placeholder: this.l.TitlePlc,
                name:'title',
                required:false,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Status,
                placeholder: this.l.StatusPlc,
                name:'status',
                picklist: true,
                options: this.statusOptions,
                ly_md:'6', 
                ly_lg:'6'
            }];
    }

    connectedCallback(){
        registerListener('ModalAction', this.doModalAction, this);
        registerListener('backbuttom', this.dobackbuttom, this);
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
        this.buildFormFilter();
        this.startSpinner(true);
        getAccomplishment().then(result =>{
            this.itemCard = [];
            const self=this;
            result.forEach(elt => { 
            let objetRep = {};
            objetRep = {
                "date": elt?.RH_Date__c,
                "Submiter":  elt.RH_Submiter__r?.Name.length>25? elt.RH_Submiter__r?.Name.slice(0, 25) +'...': elt.RH_Submiter__r?.Name,
                "id" : elt.Id,
                icon:"utility:education",
                
                title: elt?.RH_Title__c.length>30? elt?.RH_Title__c.slice(0, 30) +'...': elt?.RH_Title__c,
                keysFields:self.keysFields,
                keysLabels:self.keysLabels,
                fieldsToShow:self.fieldsToShow,
            }
            let Actions=[
                {
                    name:'Delete',
                    label:'Delete',
                    iconName:'action:delete'
                }
            ];
            if(elt?.RH_Status__c == 'Draft'){
                Actions.push( {
                    name:'Activate',
                    label:'Activate',
                    iconName:'action:preview'
                });   
            }
            objetRep.actions = Actions;
            const badge={name: 'badge', class:self.classStyle(elt?.RH_Status__c),label: elt?.RH_Status__c}
            objetRep.addons={badge};
            this.itemCard.push(objetRep);
            }); 
            this.setviewsList( this.itemCard)
        }).catch(error => {
            console.error('Error:', error);
        }).finally(() => {
            this.startSpinner(false);
        });
    }

    filterAccomplishment(event){
        this.startSpinner(true);
        let title= event.detail.title;
        let status= event.detail.status;

        filterAccomplishment({title: title , status: status })
        .then(result => {
            console.log('result', result);
            if(result){
                this.itemCard = [];
                const self=this;
                result.forEach(elt => { 
                    let objetRep = {};
                    objetRep = {
                        "date": elt?.RH_Date__c,
                        "Submiter": elt.RH_Submiter__r?.Name.length>25? elt.RH_Submiter__r?.Name.slice(0, 25) +'...': elt.RH_Submiter__r?.Name,
                        "id" : elt.Id,
                        icon:"utility:education",
                        
                        title: elt?.RH_Title__c.length>30? elt?.RH_Title__c.slice(0, 30) +'...': elt?.RH_Title__c,
                        keysFields:self.keysFields,
                        keysLabels:self.keysLabels,
                        fieldsToShow:self.fieldsToShow,
                    }
                    let Actions=[
                        {
                            name:'Delete',
                            label:'Delete',
                            iconName:'action:delete'
                        }
                    ];
                    if(elt?.RH_Status__c == 'Draft'){
                        Actions.push( {
                            name:'Activate',
                            label:'Activate',
                            iconName:'action:preview'
                        });   
                    }
                    objetRep.actions = Actions;
                    console.log(objetRep);
                    const badge={name: 'badge', class:self.classStyle(elt?.RH_Status__c),label: elt?.RH_Status__c}
                    objetRep.addons={badge};
                    this.itemCard.push(objetRep);
                }); 
                this.setviewsList( this.itemCard)
                console.log(this.itemCard);
            }
        })
        .catch(error => {
            this.startSpinner(false);
            this.showToast('error', 'Error', error.body);
            console.log('error', error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }

    classStyle(className){

        switch(className){
            case 'Active':
                return "slds-float_left slds-theme_success";
            case 'Draft':
                return "slds-float_left slds-theme_info";
            default:
                return "slds-float_left slds-theme_alt-inverse";
        }
    }

    setviewsList(items){
        let cardsView=this.template.querySelector('c-rh_cards_view');
        cardsView?.setDatas(items);
    }

    handleChangeValue(){
        this.newForm = true;
        this.buildForm();
    }

    handleEditchange(event){
        console.log('event ' +JSON.stringify(event));
        let fieldname = event.detail.name? event.detail.name:event.detail.info.name;
        switch(fieldname) {
            case 'uploadFile':
                this.newFileData = event.detail.info.file; 
                break;
            default:
                break;
        }
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

    uploadFile(idRec, redirect=false){
        if(this.newFileData?.size){
            this.getBase64(this.newFileData)
                .then(data => {
                    let base64= data.split(',')[1];
                    uploadFile({ base64: base64, filename: this.newFileData.name, recordId: idRec })
                        .then(result=>{
                            console.log('file upload --->', result);
                            if(redirect){
                            this.goToRequestDetail(this.recordId);
                            }
                        }).catch(error => {
                            console.error('Error:', error);
                        })
                    });
        }else{
            this.goToRequestDetail(this.recordId);
        }
    }

    updateFile(idRecUp, redirect=false){
        if(this.newFileData?.size){
            this.getBase64(this.newFileData)
            .then(data => {
                let base64= data.split(',')[1];
                updateFile({ base64: base64, filename: this.newFileData.name, ContentVersionId: idRecUp })
                    .then(result=>{
                        console.log('file update --->', result);
                        if(redirect){this.goToRequestDetail(this.recordId)}
                    }).catch(error => {
                        console.error('Error:', error);
                    })
                });
        }else{
            this.goToRequestDetail(this.recordId); 
        }
    }

    saveAccomplishment(input){
        this.startSpinner(true)
        addAccomplishment({ accomJson: JSON.stringify(input), status: this.status, idAcc: this.recordId })
          .then(result => {
            console.log('Result saveAccomplishment:: ');
            console.log(result);
            if(!result.error) {
                if(!this.isUpdate){
                    this.recordId=result.myRecord.Id;
                    this.uploadFile(result.myRecord.Id,true);
                    // this.handleCancelDetail();
                    this.showToast('success', 'Success', 'Accomplishment have been successfuly created');
                }else{
                    getFileInfos({
                        recordId: this.recordId
                    }).then(res =>{
                        console.log('File info ' +JSON.stringify(res))
                        let ctvId =  res.data[0]?.ContentVersionId;
                        if(ctvId){
                            this.updateFile(ctvId,true);
                            // this.goToRequestDetail(this.recordId);
                            this.showToast('success', 'Success', 'Accomplishment have been successfuly edited');
                        }else{
                            this.uploadFile(result.myRecord.Id,true);
                            // this.goToRequestDetail(this.recordId);
                            this.showToast('success', 'Success', 'Accomplishment have been successfuly edited');
                        }
                    }).catch(e =>{
                        console.error(e)
                    })
                }  
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
            getFileInfos({
                recordId: this.recordId
            }).then(res =>{
                console.log('File info ' +JSON.stringify(res))
                if (res) {
                    this.newFileData.name= res.data[0]?.Name;
                    this.buildFormDetails(result, res.data);
                    this.buildFormEdit(result, res.data);
                }
            }).catch(e =>{
                console.error(e)
            })
            if(result.RH_Status__c == 'Draft'){
                this.isDraft = true;
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
    
    buildFormDetails(detailsInfo, detailsFile){
        this.accomInputDetails =[
            {
                label:this.l.Name,
                name:'Name',
                type:'text',
                value:detailsInfo?.Name,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Title,
                name:'Title',
                type:'text',
                value:detailsInfo?.RH_Title__c,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Status,
                name:'Status',
                type:'text',
                value:detailsInfo?.RH_Status__c,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.IsPublic,
                name:'visibility',
                type:'toggle',
                value:detailsInfo?.RH_Visibility__c,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Submiter,
                name:'Submiter',
                type:'text',
                value:detailsInfo?.RH_Submiter__r.Name,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.DateLb,
                name:'Date',
                type:'date',
                value:detailsInfo?.RH_Date__c,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Description,
                name:'Description',
                type:'textarea',
                value:detailsInfo?.RH_Description__c,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.UploadFile,
                name:'uploadFile',
                value:detailsFile[0]?.Name,
                fileName: detailsFile[0]?.Name,
                type:'Link',
                accept:['.png','.jpg','.jpeg'] ,
                ly_md:'6', 
                ly_lg:'6'
            }
        ];
    }

    buildFormEdit(currentInfo, currentFile){
        this.formEditInputs =[
            {
                label:this.l.Title,
                name:'title',
                type:'text',
                value:currentInfo?.RH_Title__c,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.IsPublic,
                name:'visibility',
                type:'toggle',
                checked:currentInfo?.RH_Visibility__c,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.UploadFile,
                name:'uploadFile',
                value:currentFile[0]?.Name,
                fileName: currentFile[0]?.Name,
                type:'file',
                accept:['.png','.jpg','.jpeg'] ,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.DateLb,
                name:'myDate',
                type:'date',
                value:currentInfo?.RH_Date__c,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Description,
                name:'Description',
                type:'textarea',
                value:currentInfo?.RH_Description__c,
                ly_md:'12', 
                ly_lg:'12'
            }
        ];
        this.newsFileDetails=[
            {
                label:this.l.UploadFile,
                name:'image',
                fileName: currentFile[0]?.Name,
                type:'image',
                source: currentFile[0]?.ContentDownloadUrl
            }
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
        this.editMode = true;
    }

    activateAccom(idAcc){
        this.startSpinner(true);
        this.status = 'Active';
        activateAccomplishment({accomId: idAcc, status:this.status})
        .then(result =>{
            console.log('accomplishment --> ' , result);
            if(this.recordId){
                this.goToRequestDetail(this.recordId);
            }else{
                this.handleCancelDetail();
            }
            this.showToast('success', 'Success', 'Accomplishment have been successfuly activated');
        }).catch(error =>{
            console.error('error',error)
            this.showToast('error', 'Error', error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }

    handleActivate(){
        this.activateAccom(this.recordId);
    }

    deleteFiles(idRec, redirect=false){
        deleteFiles({recordId: idRec})
        .then(result =>{
            console.log('delete file --> ' , result);
            if(redirect){this.handleCancelDetail();}
        }).catch(error =>{
            console.error('error',error)
        }).finally(() => {
            this.startSpinner(false)
        });
    }

    deleteAccomplishment(idAccom){
        this.startSpinner(true);
        deleteAccomplishment({accId: idAccom})
        .then(result =>{
            console.log('delete accomplishment --> ' , result);
            this.deleteFiles(idAccom, true);
            this.showToast('success', 'Success', 'Accomplishment have been successfuly deleded');
        }).catch(error =>{
            console.error('error',error)
            this.showToast('error', 'Error', error);
        })
    }

    handleDeleteValue(){
         this.deleteId = this.recordId;
         this.showModalDelete();
        //this.deleteAccomplishment(this.recordId);
    }

    handleCancelEdit(){
        this.goToRequestDetail(this.recordId);
    }

    handleSaveEdit(){
        this.isUpdate = true;
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

    handlePreview(event){
        const action= event.detail.action;
        switch (action){
            case 'goToLink': this.previewFile=true; 
                         break;
            case 'closeModal': this.previewFile=false;
                         break;
        }
    }

    createAction(variant,label,name,title,iconName,className){ 
        return {
            variant, label, name, title, iconName,  class:className
        };
    }
    
    showModalDelete(){
        let Actions=[];
        let text='';
        const extra={style:'width:20vw;'};
        text='Are you sure you want to delete this Accomplishment?';
        extra.title='Confirm Deletion';
        extra.style+='--lwc-colorBorder: var(--bannedColor);';
        Actions.push(this.createAction("brand-outline","Yes","OK_DELETE","Yes",this.icon.check,'slds-m-left_x-small'));
        this.ShowModal(true,text,Actions,extra);
    }

    getBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
    }

    dobackbuttom(event) {
        unregisterListener('backbuttom', this.dobackbuttom, this);
        this.handleCancelDetail();
    }

    doModalAction(event){
        if(event.action == "OK_DELETE"){
            this.deleteAccomplishment(this.deleteId);
        }
        this.ShowModal(false,null,[]);
        event.preventDefault();
    }

    ShowModal(show,text,actions,extra={}){
        fireEvent(this.pageRef, 'Modal', {show,text,actions,extra});
    }

    showToast(variant, title, message){
        fireEvent(this.pageRef, 'Toast', {variant, title, message});
    }

    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
    }

    handleCardAction(event){
        console.log('event parent ' +JSON.stringify(event.detail));
        const info=event.detail;
        if(info.extra.item=='Activate'){
            this.activateAccom(info?.data?.id);
        }else{
            if(info.extra.item=='Delete'){
                this.deleteId = info?.data?.id;
                this.showModalDelete();
            }else{
               this.goToRequestDetail(info?.data?.id);
            } 
        }
    }
}