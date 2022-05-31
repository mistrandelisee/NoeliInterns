import { LightningElement ,track ,wire,api} from 'lwc';
import getProjectList from '@salesforce/apex/RH_Project_controller.getProjectList';
import getTeamMemberList from '@salesforce/apex/RH_Project_controller.getTeamMemberList';
import getInitialMembersList from '@salesforce/apex/RH_Project_controller.getInitialMembersList';
import getProject from '@salesforce/apex/RH_Project_controller.getProject';
import getEditMemberList from '@salesforce/apex/RH_Project_controller.getEditMemberList';
import insertUpdateMembers from '@salesforce/apex/RH_Project_controller.insertUpdateMembers';
import insertProjectMethod from '@salesforce/apex/RH_Project_controller.insertProjectMethod';
import uploadFile from '@salesforce/apex/RH_Project_controller.uploadFile';
import insertProjectupdated from '@salesforce/apex/RH_Project_controller.insertProjectupdated';
import getFileInfos from '@salesforce/apex/RH_FileUploader.getFileInfos';
import getRelatedFilesByRecordId from '@salesforce/apex/RH_Project_controller.getRelatedFilesByRecordId';
import getPickListValuesIntoList from '@salesforce/apex/RH_Project_controller.getPickListValuesIntoList';
import {NavigationMixin} from 'lightning/navigation';


import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';

export default class Rh_Projects extends NavigationMixin(LightningElement) {
    @track initial =[];
     memberProjects = []; 
    @track notmemberProjects = [];   
    @track addParticipate = [];
    @track listConts=[];
    @track filesList =[]; 
    optionpick =[]; 
    visibleProjects; 
    curentProject;
    curentDetails;
    curentDetailsToUpdate;
    fileData;
    initermediate = [];
    showList = true;
    showDetails = false;
    showEdit =false;
    addAttach = false;
    showManage = false;
    showInsertform = false;
    showAddMembers= false;
     statusPicklist =[];
    @track error;
    @track returnList =[];
    @track val =[];
    @track tabReq =[];
    @track memberSelected = [];
    @track memberNotSelected = [];
    @track inputsItems = [];
    @track allInitialContacts = [];
    @track columns = [{label: 'Name',fieldName: 'Name',type: 'text'},{label: 'Email adress',fieldName: 'Email',type: 'text'}];
    @track columnsAttach = [{label: 'File Name',fieldName: 'File Name',type: 'text'},
                            {label: 'Download',fieldName: 'Download',
                            type: 'url',typeAttributes: { tooltip: { fieldName: 'Download' } },
                            }];
     inputs= {};
     @api
     title;
     @api
    iconsrc;
    initDefault(){
        this.title=this.title || 'User Informations';
        this.iconsrc= this.iconsrc || 'utility:people';
    }
    keysFields={
    StartdDate:'Start date',
    Statut:'Statut',

    Name:'Name',
    };
    keysLabels={
    StartdDate:'Start date',
    Statut:'Statut',

    Name:'Name',
    };
    fieldsToShow={
        StartdDate:'Start date',
        Statut:'Statut',
    };

    


     getPicklistValues(){
        getPickListValuesIntoList()
        .then(result => {
            console.log('piclist',result);
            // this.statusPicklist =[];
                for(let key in result) {
                    this.statusPicklist.push({label: result[key] , value: result[key]});
                }
                // this.statusPicklist = tab;
        })
     }
     

    @wire(CurrentPageReference) pageRef;
    connectedCallback(){
        registerListener('valueMember', this.dovalueMember, this);
        this.curentProject = this.getUrlParamValue(window.location.href, 'recordId');
        if (this.curentProject) {
            this.getdetailsProject(this.curentProject);
        }else{
            this.getAllprojects();
        }
        this.initDefault();
    }

    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
     }

     showToast(variant, title, message){
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);
    }
     
 getAllprojects(){
    getProjectList()
    .then(result => {
        console.log('result',result);
        const self=this;
        let tabReq111 = [];
        for(let key in result) {
            let objetRep = {};
            objetRep = {
            "Statut": result[key]?.Status__c,
            "StartdDate":  result[key].Start_Date__c,
            "Name": result[key].RH_Addressed_To__r?.Name,
            "id" : result[key].Id,
            icon:"standard:people",
            
            title: result[key]?.Name,
            keysFields:self.keysFields,
            keysLabels:self.keysLabels,
            fieldsToShow:self.fieldsToShow,
            }
    
            console.log('@@@@@objectReturn' + objetRep);
            tabReq111.push(objetRep);
        }
        this.tabReq = tabReq111;
        this.setviewsList( this.tabReq)
    })
    .catch(error => {
        console.log('error',error);
        this.error = error;
        this.returnList = undefined;
    });
 }

setviewsList(items){
    let cardsView=this.template.querySelector('c-rh_cards_view');
    cardsView?.setDatas(items);
}


    

    handleCardAction(e) {
       

        //  this.curentProject= e.detail.data.id;
        const info=e.detail;
        if (info?.extra?.isTitle) {
            this.goToRequestDetail(info?.data?.id);
        }
       
        
    }

    goToRequestDetail(recordid) {
        var pagenname ='rhproject'; //request page nam
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

      get hasrecordid(){
          return this.curentProject?true:false;
      }

    getdetailsProject(projectIds){
        getProject({ProjectId :projectIds})
        .then(result => {
            this.getPicklistValues();
            console.log('result',result);
            let bat =[];
                for(let key in result['projectMembers']) {
                    bat.push({Name: result['projectMembers'][key].RH_Contact__r.Name, Email: result['projectMembers'][key].RH_Contact__r.Email});
                }
            this.memberProjects = bat;
            // this.memberProjects = result['projectMembers'];
            console.log(this.memberProjects);
            let index;

           

            getTeamMemberList()
            .then(result => {
               
                // let option= [];
                for(let key in result) {
                    this.optionpick.push({label: result[key]['Name'] , value: result[key]['Id'] });
                    
                           }
                // this.optionpick = option;

                })
                .catch(error => {
                    console.log('error',error);
                    this.error = error;
                });
                console.log('this.optionpick',this.optionpick);
                console.log('this.statusPicklist',this.statusPicklist);
                
            this.curentDetails =[
                {
                    label:'Name',
                    name:'Name',
                    type:'text',
                    value: result.project.Name,
                    required:true,
                    ly_md:'12', 
                    ly_lg:'12'

                },
                {
                    label:'Manager',
                    name:'Manager',
                    value: result.project.Project_Manager__r.Name,
                    required:true,
                    picklist: true,
                    // options: this.optionpick,
                    ly_md:'12', 
                    ly_lg:'12'
                },
               
                {
                    label:'Status',
                    name:'Status',
                    value: result.project.Status__c,
                    required:false,
                    picklist: true,
                    // options: tab,
                    // options: this.statusPicklist,
                    ly_md:'12', 
                    ly_lg:'12'
                },
                {
                    label:'Link',
                    name:'Link',
                    type:'text',
                    value: result.project.Link__c,
                    required:false,
                    ly_md:'12', 
                    ly_lg:'12'
                },
                {
                    label:'Start date',
                    name:'Startdate',
                    value: result.project.Start_Date__c,
                    required:true,
                    type:'date',
                    ly_md:'12', 
                    ly_lg:'12'
                },
                
                {
                    label:'End date',
                    name:'Enddate',
                    value: result.project.End_Date__c,
                    required:false,
                    type:'date',
                    ly_md:'12', 
                    ly_lg:'12'
                },
                {
                    label:'Description',
                    name:'Description',
                    type:'textarea',
                    value: result.project.Description__c,
                    required:false,
                    ly_md:'12', 
                    ly_lg:'12'
                },
            ];

            this.curentDetailsToUpdate =[
                {
                    label:'Name',
                    placeholder:'',
                    name:'Name',
                    value: result.project.Name,
                    required:true,
                    ly_md:'12', 
                    ly_lg:'6'

                },
                {
                    label:'Manager',
                    // placeholder:result.project.Project_Manager__r.Name,
                    name:'Manager',
                    // value: str,
                    value: result.project.Project_Manager__r.Id,
                    required:true,
                    picklist: true,
                    options: this.optionpick,
                    ly_md:'12', 
                    ly_lg:'6'
                },
               
                {
                    label:'Status',
                    placeholder:'',
                    name:'Status',
                    value: result.project.Status__c,
                    required:false,
                    picklist: true,
                    // options: tab,
                    options: this.statusPicklist,
                    ly_md:'12', 
                    ly_lg:'6'
                },
                {
                    label:'Link',
                    placeholder:'',
                    name:'Link',
                    value: result.project.Link__c,
                    required:false,
                    ly_md:'12', 
                    ly_lg:'6'
                },
                {
                    label:'Start date',
                    placeholder:'',
                    name:'Startdate',
                    value: result.project.Start_Date__c,
                    required:true,
                    type:'date',
                    ly_md:'12', 
                    ly_lg:'6'
                },
                
                {
                    label:'End date',
                    placeholder:'',
                    name:'Enddate',
                    value: result.project.End_Date__c,
                    required:false,
                    type:'date',
                    ly_md:'12', 
                    ly_lg:'6'
                },
                {
                    label:'Description',
                    placeholder:'',
                    name:'Description',
                    type:'textarea',
                    value: result.project.Description__c,
                    required:false,
                    ly_md:'12', 
                    ly_lg:'12'
                },
            ];

            getRelatedFilesByRecordId({recordId: projectIds})
            .then(result11=>{
                console.log('file111',result11)
                this.filesList = (result11.data).map(element=>({
                "label":element.Name,
                 "value": element.Name,
                 "File Name": element.Name,

                 "Download":  element.ContentDownloadUrl  
                //  "Download":  `<a href=${element.ContentDownloadUrl} download=${element.Name}>Download</a>`  
                }))
                console.log(this.filesList);
            })
            .catch(error => {
                console.log('error',error);
                this.error = error;
            });
            // .then(result11=>{
            //     console.log('file111',result11)
            //     this.filesList = (result11.data).map(element=>({
            //     "label":element.Name,
            //      "value": element.Name,
            //      "fname": element.Name,

            //      "url": element.ContentDownloadUrl
            //     }))
            //     console.log(this.filesList);
            // })


            this.showList = false;
            this.showDetails = true;
            this.showEdit = false;
            this.showManage = false;
            this.showInsertform = false;
            this.addAttach = false;
            console.log('onItemSelected:::',this.curentProject);

        })
        .catch(error => {
            console.log('error',error);
            this.error = error;
            this.returnList = undefined;
        });
    }

    handleNext(e){

            getInitialMembersList()
            .then(result => {
                console.log('result',result);
                let bat =[];
                for(let key in result) {
                    bat.push({value: result[key].Id, label: result[key].Name});
                }
                // this.allInitialContacts = bat;
                let ret1;
                let undefin;
                // let inputs= {};
                let ret = this.template.querySelector('c-rh_dynamic_form').save();
                ret1 = ret['outputsItems'];
                for(let key in ret1) {
                    this.inputs[ret1[key]['name']] = ret1[key]['value'];
                }
                let taber = bat.filter(word => word.value != this.inputs['Manager']);
                this.allInitialContacts = taber;

                let d1 = new Date();
                let d2 = this.process(this.inputs['Startdate']);
                let d3 = this.process(this.inputs['Enddate']);
                if(this.inputs['Name'] == null || this.inputs['Startdate'] == null || this.inputs['Manager'] == null || d1.getTime() > d2.getTime() || d2.getTime() > d3.getTime()){
                    
                    this.showInsertform = true;
                    this.showAddMembers= false;
                    if(d1.getTime() > d2.getTime()){
                        this.showToast('error', 'Error', 'Start date must be grater than today');
                    }
                    if(d2.getTime() > d3.getTime()){
                        this.showToast('error', 'Error', 'End date must be grater than start date');
                    }
                }else{
                    this.showInsertform = false;
                    this.showAddMembers= true;
                }
                
        
                console.log('ret',ret['outputsItems']);
                console.log('this.inputs',this.inputs);
            })
            .catch(error => {
                console.log('error',error);
                this.error = error;
                this.returnList = undefined;
            });
        
     
    }
    handleSaveEditMember(e){
        let initParticipate = [];
        let moveParticipate = [];
        // let returnlist = this.template.querySelector('c-rh_add_and_remove').getResult();
        console.log('this.listConts',this.listConts);
        

        insertUpdateMembers({AddMembers:this.listConts,IDProject:this.curentProject})
        .then(result=>{
            window.console.log('after save');
           this.getdetailsProject(this.curentProject);
           this.showToast('success', 'success !!', 'Members Updated Successfully!!');
            // this.dispatchEvent(toastEvent);
            this.showDetails = true;
            this.showManage= false;
        })
        .catch(error=>{
            this.error=error.message;
            this.showToast('error', 'Error', 'Update failed');
            window.console.log('error',this.error);
        });
    }


    handleSave(e){
        let tempCopy=e.currentTarget.getAttribute("data-id");
        console.log('tempCopy',tempCopy);
        let actif = false;
        if(tempCopy == 'actif'){
            actif = true;
        }
        console.log('listConts',this.listConts);
        insertProjectMethod({project:this.inputs,participation:this.listConts,Isactivate:actif})
        .then(result=>{
            window.console.log('after save');
            this.getAllprojects();
            this.showToast('success', 'success !!', 'Project created Successfully!!');
            this.goToRequestDetail(result.Id);
            this.showAddMembers= false;
        })
        .catch(error=>{
            this.error=error.message;
            window.console.log('error',this.error);
            this.showToast('error', 'Error', 'insert failed');
        });

    }


   



    handleSaveEdit(e){
        window.console.log('this.curentProject ',this.curentProject);
            let inputs= {};
             
            let ret1;
                let ret = this.template.querySelector('c-rh_dynamic_form').save();
                ret1 = ret['outputsItems'];
                // ret11 = ret.obj;
                window.console.log('ret.obj' , ret.obj);
                for(let key in ret1) {
                     inputs[ret1[key]['name']] = ret1[key]['value'];
                }

                
                window.console.log('ret1' , ret['outputsItems']);
                window.console.log('inputs' , inputs);
                insertProjectupdated({project:inputs,IDProject:this.curentProject})
                .then(result=>{
                    window.console.log('after update');
                    window.console.log('result' , result);
                    this.getdetailsProject(this.curentProject);
                    this.showToast('success', 'success !!', 'Project Updated Successfully!!');
                    this.showDetails = true;
                    this.showEdit= false;
                })
                .catch(error=>{
                    this.error=error.message;
                    this.showToast('error', 'Error', 'Update failed');
                    window.console.log('error',this.error);
                });
    }

    handleBack(e){
        this.curentProject = undefined;
        this.goToRequestDetail(this.curentProject);
        this.showList = true;
        this.showDetails = false;
        this.showEdit = false;
        this.showManage = false;
        this.showInsertform = false;
        this.showAddMembers= false;
        this.addAttach = false;
    }
    handleBackToDetails(e){
        
        this.showList = false;
        this.showDetails = true;
        this.showEdit = false;
        this.showManage = false;
        this.showInsertform = false;
        this.showAddMembers= false;
        this.addAttach = false;
    }
    handleEdit(e){
        this.showList = false;
        this.showDetails = false;
        this.showEdit = true;
        this.showManage = false;
        this.showInsertform = false;
        this.showAddMembers= false;
        this.addAttach = false;
    }
    handleManage(e){

        getEditMemberList({ProjectId :this.curentProject})
            .then(result => {
                console.log('result',result);
                // this.initial = result;
                let memberSelectedinit =[];
                let memberNotSelectedinit = [];
                 for(let key in result['projectMembers']) {
                        memberSelectedinit.push( result['projectMembers'][key]['RH_Contact__r'].Id); 
                    }
                    console.log('memberSelectedinit',memberSelectedinit);
                this.memberSelected = memberSelectedinit;
                for(let key in result['projectNotMembers']) {
                    memberNotSelectedinit.push(  { value: result['projectNotMembers'][key].Id, label: result['projectNotMembers'][key].Name }); 
                }
                this.memberNotSelected  = memberNotSelectedinit;

                this.showList = false;
                this.showDetails = false;
                this.showEdit = false;  
                this.showManage = true; 
                this.showInsertform = false; 
                this.showAddMembers= false;
                this.addAttach = false;
            })
            .catch(error => {
                console.log('error',error);
                this.error = error;
                this.returnList = undefined;
            });
    }
    handlecreate(e){
        getTeamMemberList()
    .then(result => {
       
        let option = [];
        for(let key in result) {
                        option.push({label: result[key]['Name'] , value: result[key]['Id'] });
                   }
        // this.optionpick = option;
        console.log('option',option);
        this.inputsItems = [
                        {
                            label:'Name',
                            placeholder:'Enter your Project Name',
                            name:'Name',
                            type:'text',
                            required:true,
                            ly_md:'12', 
                            ly_lg:'6'
                        },
                        
                        {
                            label:'Manager',
                            placeholder:'select Project Manager',
                            name:'Manager',
                            picklist: true,
                            options:option,
                            required:true,
                            ly_md:'12', 
                            ly_lg:'6'
                        },
                        {
                            label:'Start date',
                            placeholder:'Enter Start date',
                            name:'Startdate',
                            type:'date',
                            required:true,
                            ly_md:'12', 
                            ly_lg:'6'
                        },
                        {
                            label:'End date',
                            placeholder:'Enter End date',
                            name:'Enddate',
                            type:'date',
                            ly_md:'12', 
                            ly_lg:'6'
                        },
                        {
                            label:'Description',
                            placeholder:'Enter your Project Description',
                            name:'Description',
                            type:'textarea',
                            ly_md:'12', 
                            ly_lg:'12'
                        },
                    ];
        this.showList = false;
        this.showDetails = false;
        this.showEdit = false;  
        this.showManage = false; 
        this.showInsertform = true;
        this.showAddMembers= false;
        this.addAttach = false;
    })
    .catch(error => {
        console.log('error',error);
        this.error = error;
        this.returnList = undefined;
    });
        
    }
    handleBack111(e){
        this.showList = true;
        this.showDetails = false;
        this.showEdit = false;  
        this.showManage = false; 
        this.showInsertform = false;
        this.showAddMembers= false;
        this.addAttach = false;
    }
    handleBacktoForm(e){
        this.showInsertform = true;
        this.showAddMembers= false;
    }

    handleAttach(e){
        this.showList = false;
        this.showDetails = false;
        this.showEdit = false;  
        this.showManage = false; 
        this.showInsertform = false;
        this.showAddMembers= false;
        this.addAttach = true;
    }
    openfileUpload(event) {
        const file = event.target.files[0]
        var reader = new FileReader()
        reader.onload = () => {
            var base64 = reader.result.split(',')[1]
            this.fileData = {
                'filename': file.name,
                'base64': base64,
                'recordId': this.curentProject
            }
            console.log(this.fileData)
        }
        reader.readAsDataURL(file)
    }

    handleClick(){
        const {base64, filename, recordId} = this.fileData
        uploadFile({ base64, filename, recordId }).then(result=>{
            this.fileData = null
            this.getdetailsProject(recordId);
            let title = `${filename} uploaded successfully!!`
           
            this.showToast('success', 'success !!', title);
            this.showList = false;
            this.showDetails = true;
            this.showEdit = false;  
            this.showManage = false; 
            this.showInsertform = false;
            this.showAddMembers= false;
            this.addAttach = false;
        })
    }

    toast(title){
        const toastEvent = new ShowToastEvent({
            title, 
            variant:"success"
        })
        this.dispatchEvent(toastEvent)
    }

    previewHandler(event){
        console.log(event.target.dataset.id)
        this[NavigationMixin.Navigate]({ 
            type:'comm__namedPage',
            attributes:{ 
                name:'filePreview'
            },
            state:{ 
                selectedRecordId: event.target.dataset.id
                // selectedRecordId: event.target.dataset.ContentDocumentId
            }
        })
    }

    dovalueMember(event){
        this.listConts = event.tab;
        console.log('list id for insert =>:', this.listConts);
    }

    process(date){
        var parts = date.split("-");
        return new Date(parts[0], parts[1] - 1, parts[2]);
     }
}