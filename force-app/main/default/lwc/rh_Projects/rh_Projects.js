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
import insertTask from '@salesforce/apex/RH_Project_controller.insertTask';
import getPriorityTaskPickListValues from '@salesforce/apex/RH_Project_controller.getPriorityTaskPickListValues';
import InitInvoiceCreation from '@salesforce/apex/RH_Invoice_Controller.InitInvoiceCreation';
import accountCreation from '@salesforce/apex/RH_Invoice_Controller.accountCreation';
import ActiveProject from '@salesforce/apex/RH_Project_controller.ActiveProject';
import {NavigationMixin} from 'lightning/navigation';
import checkRole from '@salesforce/apex/RH_Utility.checkRole';
import { labels } from 'c/rh_label';


import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
import { icons } from 'c/rh_icons';

const ACCOUNT_NAME_FIELD = 'AccountId';
const NEW_ACCOUNT='NEW_ACCOUNT';
const NEW_ACTION='New';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';

export default class Rh_Projects extends NavigationMixin(LightningElement) {
    
    inizier={};
    l={...labels,
        srchNamePlc: 'Search by name',
        OrderBy:'sort By',
        selectPlc:'Select an option',
        }
    icon ={...icons}
    @track initial =[];
     memberProjects = []; 
     ProjectsTask = [];
     memberPicklist = [];
     filterInputs=[];
    @track notmemberProjects = [];   
    @track addParticipate = [];
    @track listConts=[];
    @track filesList =[]; 
    optionpick =[]; 
    priorityPicklist =[];
    accountInputs=[];
    visibleProjects; 
    curentProject;
    curentDetails;
    TaskTab;
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
    showEditMembersBout= false;
    createTask= false;
    isVisible = false;
    isActivate = false;
    isClosed = false;
    newAccount = false;
    action;
    sfieldId;
     statusPicklist =[];
     Status =[];
     error;
     stack;
    @track returnList =[];
    @track val =[];
    @track tabReq =[];
    @track tabReqfilter =[];
    @track memberSelected = [];
    @track memberNotSelected = [];
    @track inputsItems = [];
    @track allInitialContacts = [];
    @track columns = [{label: this.l.Name,fieldName: 'Name',type: 'button',typeAttributes:{label:{fieldName:'Name'},variant:'base'}},{label: this.l.Email,fieldName: 'Email',type: 'text'}];
    @track columnsTask = [
        {label: this.l.AssignTo,fieldName: 'AssignTo',type: 'text'},
        {label: this.l.Description,fieldName: 'Description',type: 'text'},
        {label: this.l.Priority,fieldName: 'Priority',type: 'text'},
        {label: this.l.Status,fieldName: 'Status',type: 'text'},
    ];
    
    @track columnsAttach = [
        { label: 'File Name', fieldName: 'FileName', type: 'text', sortable: true },
        {
            label: 'Download',
            type: 'button-icon',
            typeAttributes: {
                name: 'Download',
                iconName: 'action:download',
                title: 'Download',
                variant: 'border-filled',
                alternativeText: 'Download'
            }
        },
    ];
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
    StartdDate:this.l.StartDate,
    Account:this.l.Account,

    Name:this.l.Name,
    };
    keysLabels={
    StartdDate:this.l.StartDate,
    Account:this.l.Account,

    Name:this.l.Name,
    };
    fieldsToShow={
        StartdDate:this.l.StartDate,
        Account:this.l.Account,
    };

    


     getPicklistValues(){
        getPickListValuesIntoList()
        .then(result => {
            console.log('piclist',result);
            let tab =[];
                for(let key in result) {
                    // this.statusPicklist.push({label: result[key] , value: result[key]});
                    tab.push({label: result[key] , value: result[key]});
                    // console.log('statusPicklistIntern:', this.statusPicklist);
                }
                
                this.statusPicklist = tab;
                this.statusPicklist = this.statusPicklist.filter(element => element.label != 'Draft');
                console.log('statusPicklistExter:', this.statusPicklist);
        })
     }

     getPriorityTaskPickList(){
        getPriorityTaskPickListValues()
        .then(result => {
            console.log('piclistTask',result);
            
                for(let key in result) {
                    this.priorityPicklist.push({label: result[key] , value: result[key]});
                }
                console.log('priorityPicklist:', this.priorityPicklist);
        })
        .catch(error => {
            console.log('Error:', error);
        });
     }
     
     roleManage(){
        checkRole({ })
          .then(result => {
            console.log('Result role --->', result);
            if(result.isCEO||result.isTLeader) this.isVisible = true;
          })
          .catch(error => {
            console.log('Error:', error);
        });
    }

    @wire(CurrentPageReference) pageRef;
    connectedCallback(){
        registerListener('valueMember', this.dovalueMember, this);
        this.curentProject = this.getUrlParamValue(window.location.href, 'recordId');
        this.handleNew();
        this.getPicklistValues();
        this.buildFilter();
        this.initDefault();
        this.roleManage();
        if (this.curentProject) {
            this.getdetailsProject(this.curentProject);
        }else{
            this.getAllprojects();
        }
        
        
        
    }

    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
     }


     showToast(variant, title, message){
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);
    }
     
 getAllprojects(){
    
    return new Promise((resolve, reject) => {
        getProjectList()
        .then(result => {
            console.log('result',result);
            const self=this;
            let tabReq111 = [];
            for(let key in result) {
                let objetRep = {};
                objetRep = {
                "Status": result[key]?.Status__c,
                "StartdDate":  result[key].Start_Date__c,
                "EndDate":  result[key].End_Date__c,
                "Name": result[key].Name,
                "id" : result[key].Id,
                "Account" : result[key].RH_Account_ID__r.Name,
                // icon:"standard:people",
                icon:this.icon.project,
                
                title: result[key]?.Name,
                keysFields:self.keysFields,
                keysLabels:self.keysLabels,
                fieldsToShow:self.fieldsToShow,
                }
                const badge={name: 'badge', class:self.classStyle(result[key]?.Status__c),label: result[key]?.Status__c}
                objetRep.addons={badge};
                console.log('@@@@@objectReturn' + objetRep);
                tabReq111.push(objetRep);
            }
            this.tabReq = tabReq111;
            this.tabReqfilter = tabReq111;
            
            this.setviewsList( this.tabReq)
            resolve("Promise resolved");
        })
        .catch(error => {
            console.log('error',error);
            // this.error = error;
            reject("Promise rejected");
            this.returnList = undefined;
        });
     
    });
 }

 classStyle(className){

    switch(className){
        case 'Active':
            return "slds-float_left slds-theme_success";
        case 'Draft':
            return "slds-float_left slds-theme_info";
        case 'frozen':
            return "slds-float_left slds-theme_shade";
        case 'Closed':
            return "slds-float_left slds-theme_error";
        default:
            return "slds-float_left slds-theme_alt-inverse";
    }

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

    initTaskForm(){
        let tabelement=[];
        this.getPriorityTaskPickList();
        for (let key in this.memberProjects) {
             tabelement.push({label:this.memberProjects[key].Name, value: this.memberProjects[key].ContId});
            
        }
        this.memberPicklist =tabelement;

        this.TaskTab =[
            {
                label:this.l.Priority,
                placeholder:this.l.TaskPh,
                name:'Priority',
                picklist: true,
                options:this.priorityPicklist,
                required:true,
                ly_md:'12', 
                ly_lg:'6'
            },
            
            {
                label:this.l.AssignTo,
                placeholder:this.l.AssignToPh,
                name:'AssignTo',
                picklist: true,
                options:this.memberPicklist,
                required:true,
                ly_md:'12', 
                ly_lg:'6'
            },
            
            {
                label:this.l.Description,
                placeholder:this.l.TaskDescr,
                name:'Description',
                type:'textarea',
                ly_md:'12', 
                ly_lg:'12'
            },
        ];
    }


    getdetailsProject(projectIds){
        getProject({ProjectId :projectIds})
        .then(result => {
            
            
            console.log('this.inizier?.filter',this.inizier?.filter);
            console.log('result',result);
            let bat =[];
                for(let key in result['projectMembers']) {
                    bat.push({Name: result['projectMembers'][key].RH_Contact__r.Name, Email: result['projectMembers'][key].RH_Contact__r.Email,Id: result['projectMembers'][key].RH_Contact__r.RH_User__c,ContId: result['projectMembers'][key].RH_Contact__r.Id});
                }
            this.memberProjects = bat;
            // this.memberProjects = result['projectMembers'];
            console.log(this.memberProjects);

            let bate =[];
                for(let key in result['taskList']) {
                    bate.push({AssignTo: result['taskList'][key].Who.Name, Description: result['taskList'][key].Description,Priority: result['taskList'][key].Priority,Status: result['taskList'][key].Status});
                }
            this.ProjectsTask = bate;
            console.log(this.ProjectsTask);
           
            if(result.project.Status__c == 'Closed'){
                this.isClosed = true;
                this.isActivate = true;
            }
            if(result.project.Status__c == 'Active'){
                this.isActivate = true;
                this.isClosed = false;
            }
           this.initTaskForm();
           

            getTeamMemberList()
            .then(result12 => {
               
                // let option= [];
                for(let key in result12) {
                    this.optionpick.push({label: result12[key]['Name'] , value: result12[key]['Id'] });
                    
                           }
                // this.optionpick = option;

                })
                .catch(error => {
                    console.log('error',error);
                    // this.error = error;
                });
                console.log('this.optionpick',this.optionpick);
                console.log('this.statusPicklist',this.statusPicklist);
                
            this.curentDetails =[
                {
                    label:this.l.Name,
                    name:'Name',
                    type:'text',
                    value: result.project.Name,
                    required:true,
                    ly_md:'12', 
                    ly_lg:'6'

                },
                {
                    label:this.l.Manager,
                    name:result.project.Project_Manager__r.RH_User__c,
                    value: result.project.Project_Manager__r.Name,
                    required:true,
                    // isLink: true,
                    type:'Link',
                    // options: this.optionpick,
                    ly_md:'12', 
                    ly_lg:'6'
                },
               
                {
                    label:this.l.Status,
                    name:'Status',
                    value: result.project.Status__c,
                    required:false,
                    picklist: true,
                    // options: tab,
                    // options: this.statusPicklist,
                    ly_md:'12', 
                    ly_lg:'6'
                },
                {
                    label:this.l.Account,
                    name:'Account',
                    value: result.project.RH_Account_ID__r.Name,
                    // required:true,
                    // picklist: true,
                    ly_md:'12', 
                    ly_lg:'6'
                },
                {
                    label:this.l.StartDate,
                    name:'Startdate',
                    value: result.project.Start_Date__c,
                    required:true,
                    type:'date',
                    ly_md:'12', 
                    ly_lg:'6'
                },
                
                {
                    label:this.l.EndDate,
                    name:'Enddate',
                    value: result.project.End_Date__c,
                    required:false,
                    type:'date',
                    ly_md:'12', 
                    ly_lg:'6'
                },
                {
                    label:this.l.Link,
                    name:'Link',
                    type:'text',
                    value: result.project.Link__c,
                    required:false,
                    ly_md:'12', 
                    ly_lg:'6'
                },
                {
                    label:this.l.Description,
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
                    label:this.l.Name,
                    placeholder:'',
                    name:'Name',
                    value: result.project.Name,
                    required:true,
                    ly_md:'12', 
                    ly_lg:'6'

                },

                {
                    label:this.l.Manager,
                    // placeholder:result.project.Project_Manager__r.Name,
                    name:'Manager',
                    value: result.project.Project_Manager__r.Id,
                    required:true,
                    picklist: true,
                    options: this.optionpick,
                    ly_md:'12', 
                    ly_lg:'6'
                },
                 {
                            name:ACCOUNT_NAME_FIELD,
                            objName:"Account",
                            placeholder:'Select Account',
                            iconName:"standard:account",
                            createNewLabel:this.l.new_account,
                            newLabel:"Nuovo",
                            label:this.l.Account,
                            objectLabel:'Account',
                            filter:this.inizier?.filter,
                            value: result.project.RH_Account_ID__c,
                            selectName:result.project.RH_Account_ID__r.Name,
                            isSelected:true,
                            required:true,
                            enableCreate:true,
                            type:'lookup',
                            ly_md:'12', 
                            ly_lg:'6'
                        },
                {
                    label:this.l.Status,
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
                    label:this.l.StartDate,
                    placeholder:'',
                    name:'Startdate',
                    value: result.project.Start_Date__c,
                    required:true,
                    type:'date',
                    ly_md:'12', 
                    ly_lg:'6'
                },
                
                {
                    label:this.l.EndDate,
                    placeholder:'',
                    name:'Enddate',
                    value: result.project.End_Date__c,
                    required:false,
                    type:'date',
                    ly_md:'12', 
                    ly_lg:'6'
                },
                {
                    label:this.l.Link,
                    placeholder:'',
                    name:'Link',
                    value: result.project.Link__c,
                    required:false,
                    ly_md:'12', 
                    ly_lg:'6'
                },
                {
                    label:this.l.Description,
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
                 "FileName": element.Name,

                 "url":  element.ContentDownloadUrl  
                //  "Download":  `<a href=${element.ContentDownloadUrl} download=${element.Name}>Download</a>`  
                }))
                console.log(this.filesList);
            })
            .catch(error => {
                console.log('error',error);
                // this.error = error;
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
            // this.error = error;
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

                let d1 = new Date(new Date().getTime() - 24*60*60*1000);
                let d2 = this.process(this.inputs['Startdate']);
                let d3 = this.process(this.inputs['Enddate']);
                if(this.inputs['Name'] == null || this.inputs['Startdate'] == null || this.inputs['Manager'] == null || d1 > d2 || d2 > d3){
                    // if(this.inputs['Name'] == null || this.inputs['Startdate'] == null || this.inputs['Manager'] == null || d1.getTime() > d2.getTime() || d2.getTime() > d3.getTime()){
                    
                    this.showInsertform = true;
                    this.showAddMembers= false;
                    this.sfieldId ='create';
                    if(d1 > d2){
                        this.showToast('error', 'Error', this.l.StartDateError);
                    }
                    if(d2.getTime() > d3.getTime()){
                        this.showToast('error', 'Error', this.l.EndDateError);
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
                // this.error = error;
                this.returnList = undefined;
            });
        
     
    }
    handleSaveEditMember(e){
        this.startSpinner(true);
        let initParticipate = [];
        let moveParticipate = [];
        // let returnlist = this.template.querySelector('c-rh_add_and_remove').getResult();
        console.log('this.listConts',this.listConts);
        

        insertUpdateMembers({AddMembers:this.listConts,IDProject:this.curentProject})
        .then(result=>{
            window.console.log('after save');
           this.getdetailsProject(this.curentProject);
           this.showToast('success', 'success !!', this.l.MemberSuccesUpdate);
            // this.dispatchEvent(toastEvent);
            this.showDetails = true;
            this.showManage= false;
        })
        .catch(error=>{
            // this.error=error.message;
            this.showToast('error', 'Error', this.l.MemberFailUpdate);
            window.console.log('error',this.error);
        })
        .finally(() => {
            this.startSpinner(false)
        });
    }


    handleSave(e){
        this.startSpinner(true);
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
            this.showToast('success', 'success !!', this.l.ProjectSuccesCreated);
            this.goToRequestDetail(result.Id);
            this.showAddMembers= false;
        })
        .catch(error=>{
            // this.error=error.message;
            window.console.log('error',this.error);
            this.showToast('error', 'Error', this.l.ProjectFailedCreate);
        })
        .finally(() => {
            this.startSpinner(false)
        });

    }


   



    handleSaveEdit(e){
        this.startSpinner(true);
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
                    this.showToast('success', 'success !!', this.l.ProjectUpdateSucces);
                    this.showDetails = true;
                    this.showEdit= false;
                })
                .catch(error=>{
                    // this.error=error.message;
                    this.showToast('error', 'Error', this.l.projectFailedUpdate);
                    window.console.log('error',this.error);
                })
                .finally(() => {
                    this.startSpinner(false)
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
        this.sfieldId ='edit';
    }
    handleManage(e){
        this.startSpinner(true);
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
                // this.error = error;
                this.returnList = undefined;
            })
            .finally(() => {
                this.startSpinner(false)
            });
    }
    handlecreate(e){
        this.handleNew();
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
                            label:this.l.Name,
                            placeholder:this.l.ProjectNamePlc,
                            name:'Name',
                            type:'text',
                            required:true,
                            ly_md:'12', 
                            ly_lg:'6'
                        },
                        {
                            name:ACCOUNT_NAME_FIELD,
                            objName:"Account",
                            placeholder:this.l.AccountPlc,
                            iconName:"standard:account",
                            newLabel:"Nuovo",
                            label:this.l.Account,
                            objectLabel:'Account',
                            filter:this.inizier?.filter,
                            // selectName:'',
                            // isSelected:false
                            required:true,
                            enableCreate:true,
                            type:'lookup',
                            value: '',
                            ly_md:'12', 
                            ly_lg:'6'
                        },
                        
                        
                        {
                            label:this.l.StartDate,
                            placeholder:this.l.StartDatePlc,
                            name:'Startdate',
                            type:'date',
                            required:true,
                            ly_md:'12', 
                            ly_lg:'6'
                        },
                        {
                            label:this.l.EndDate,
                            placeholder:this.l.EndDatePlc,
                            name:'Enddate',
                            type:'date',
                            ly_md:'12', 
                            ly_lg:'6'
                        },
                        {
                            label:this.l.Manager,
                            placeholder:this.l.ManagerPlc,
                            name:'Manager',
                            picklist: true,
                            options:option,
                            required:true,
                            ly_md:'12', 
                            ly_lg:'6'
                        },
                        {
                            label:this.l.Description,
                            placeholder:this.l.ProjectDescriptionPlc,
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
        this.sfieldId = 'create';
    })
    .catch(error => {
        console.log('error',error);
        // this.error = error;
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
        this.startSpinner(true);
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
        .catch(error => {
            console.log('error',error);
        })
        .finally(() => {
            this.startSpinner(false)
        });
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
        this.showEditMembersBout = true;
        console.log('list id for insert =>:', this.listConts);
    }

    process(date){
        var parts = date.split("-");
        console.log('parts[0] =>:', parts[0]);
        console.log('parts[1] =>:', parts[1]);
        console.log('parts[2] =>:', parts[2]);
        console.log('new[2] =>:', new Date(parts[0], parts[1] - 1, parts[2]));
        console.log('new[0] =>:', new Date());
        return new Date(parts[0], parts[1] - 1, parts[2]);
        
    }

    goToLink(event){
        const action = event.detail.action;
        if(action == 'goToLink'){
            this.goToUserDetail(event.detail.eltName);
        }
        // this.selectedContact = this.contacts.data.find(contact => contact.Id === contactId);
    }


    handleRowAction( event ) {
        // const actionName = event.detail.action.name;
        const row = event.detail.row.Id;
        console.log('row--> ' , row);
        this.goToUserDetail(row);
    }


    goToUserDetail(recordid) {
        var pagenname ='rhusers'; //request page nam
        let states={'recordId': recordid}; //event.currentTarget.dataset.id , is the recordId of the request
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }

    handleRowAction11( event ) {
        // const actionName = event.detail.action.name;
        const rowUrl = event.detail.row.url;
        console.log('rowUrl--> ' , rowUrl);
        // console.log('actionName--> ' , actionName); 
        this.handleNavigate(rowUrl);
                   
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

    buildFilter(){
        // this.getPicklistValues();
        this.filterInputs=[
            {
                label:this.l.Name,
                placeholder:this.l.srchNamePlc,
                name:'searchText',
                value: '',
                ly_md:'3', 
                ly_xs:'6', 
                ly_lg:'3'
            }];
            
            // console.log(`this.statusPicklist`, this.statusPicklist);
            this.filterInputs =[...this.filterInputs,
            // {
            //     label:this.l.Status,
            //     name:'status',
                
            //     picklist: true,
            //     options: this.statusPicklist,
            //     value: '',
            //     ly_md:'3',
            //     ly_xs:'6',  
            //     ly_lg:'3'
            // },
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

    handleSubmitFilter(event) {
        this.getAllprojects().then((res)=>{
        const record=event.detail;
        
        this.tabReq = this.tabReqfilter;
        console.log('-->', this.tabReq);
        console.log(`handleSubmitFilter record `, JSON.stringify(record) );
        console.log(`this.tabReq `, this.tabReq);
        record.searchText ? this.tabReq = this.tabReq.filter(element =>((element.Name).toUpperCase()).includes(record.searchText.toUpperCase())) : this.tabReq;
        record.startDate ? this.tabReq = this.tabReq.filter(element =>element.StartdDate >= record.startDate) : this.tabReq;
        record.status ? this.tabReq = this.tabReq.filter(element =>element.Status ==  record.status) : this.tabReq;
        record.EndDate ? this.tabReq = this.tabReq.filter(element =>element.EndDate >=  record.EndDate) : this.tabReq;
        }).catch((error)=>{
            console.log(`Handling error as we received ${error}`);
        });
        
    }

    handleResetFilter(event) {
        this.getAllprojects();
    }

    handleActive(e){
        let tempCopy=e.currentTarget.getAttribute("data-id");
        console.log('tempCopy',tempCopy);
        let actif = false;
        if(tempCopy == 'Active'){
            actif = true;
        }
        
            
        ActiveProject({ProjectId :this.curentProject,Isactivate:actif})
        .then(result => {
            window.console.log('after Activate');
            this.getdetailsProject(this.curentProject);
            this.showToast('success', 'success !!', this.l.ProjectActivate);
            this.goToRequestDetail(result.Id);
            // this.showAddMembers= false;
        })
        .catch(error => {
            console.log('error',error);
        });
    }

    handleTask(){
        this.createTask= true;
        this.showDetails=false;
    }
    handleFromTask(){
        this.createTask= false;
        this.showDetails=true;
    }
    handleCreateTask(){
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
            insertTask({taskto:inputs,IDProject:this.curentProject})
            .then(result=>{
                window.console.log('after update');
                window.console.log('result' , result);
                this.getdetailsProject(this.curentProject);
                this.showToast('success', 'success !!', 'Task Created Successfully!!');
                this.createTask= false;
                this.showDetails=true;
            })
            .catch(error=>{
                // this.error=error.message;
                this.showToast('error', 'Error', 'Created Task failed');
                window.console.log('error',this.error);
            });
    }

    handleLookupCreation(event){
        const objReturned = event.detail;
        console.log('handleLookupCreation');
        console.log(JSON.stringify(objReturned));
        if (ACCOUNT_NAME_FIELD==objReturned?.name) {
            console.log('handleLookupCreation11');
            this.doCreateAccount();
            console.log('handleLookupCreation22');
        }
    }
    doCreateAccount(){
        this.accountInputs=[
            {
                label:this.l.Name,
                placeholder:this.l.accountNamePlc,
                name:'Name',
                value: '',
                required:true,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Phone,
                placeholder:this.l.PhonePlc,
                name:'Phone',
                value: '',
                required:false,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
            {
                label:this.l.Cap,
                placeholder:this.l.CapPlc,
                name:'Cap',
                value: '',
                required:false,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
            {
                label:this.l.City,
                placeholder:this.l.CityPlc,
                name:'City',
                value: '',
                required:false,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
            {
                label:this.l.sdi,
                placeholder:this.l.sdiPlc,
                name:'Sdi',
                value: '',
                required:false,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
            {
                label:this.l.Email,
                placeholder:this.l.EmailPlc,
                name:'Email',
                value: '',
                required:false,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
            {
                label:this.l.Civico,
                placeholder:this.l.CivicoPlc,
                name:'Civico',
                value: '',
                required:true,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
        ];
        this.newAccount = true;
    }
    handleChanged(event){
        const objReturned = event.detail;
        console.log('handleChanged');
        console.log(JSON.stringify(objReturned));
        if (ACCOUNT_NAME_FIELD==objReturned?.info?.name) {
            this.handleAccountChanged(objReturned?.info?.value)
        }
        
    }

    updateFormField(fieldName,updates,type='default'){
        // let form=this.template.querySelector('c-rh_dynamic_form');
        let form=this.template.querySelector(`[data-id="${this.sfieldId}"]`)
        if (form) {
            const returned=form.updateField(fieldName,updates,type);
            console.log('updateFormField  returned '+returned);
        }
    }
    handleAccountChanged(accId){
        console.log('SELECTED ACCOUNT ID '+accId);
        
        let newGrpField={
            label:'Groups',
            name:'wGroup',
            picklist: true,
            options: this.groups,
            value: '',
            maxlength:100,
            ly_md:'6', 
            ly_lg:'6'
        }
        this.updateFormField('wGroup',newGrpField);
    }

    handleNew(){
        this.startSpinner(true)
        InitInvoiceCreation()
           .then(result => {
             console.log('Result INIT CONF');
             console.log(result);
             if (!result.error && result.Ok) {
                 this.inizier=result;
                 this.action=NEW_ACTION;
                 console.log('this.inizier',this.inizier);
             }else{
                 this.showToast(WARNING_VARIANT,'ERROR', result.msg);
             }
           })
           .catch(error => {
             console.error('Error:', error);
         }).finally(() => {
             this.startSpinner(false)
         });
     }


     handleCreateAccount(event){
        const info = event.detail;
        console.log(JSON.stringify(info));
        if (info.operation=='positive') {
            if (info.isvalid) {
               const record ={...info.fields} ;
               this.handleCreateAccountApex(record);
            }
        }else{
            this.newAccount=false;  
        }
    }

    handleCreateAccountApexOK(obj){
        this.showToast(SUCCESS_VARIANT,this.l.successOp, '');
        this.newAccount=false;//close modal
        const accId=obj.Id;
        const accName=obj.Name;
        //update account field
        let updFieldAcc={
            // filter:this.inizier?.filter,
            value:accId,
            selectName:accName,
            isSelected:true,
        }
        this.updateFormField(ACCOUNT_NAME_FIELD,updFieldAcc);

    }
    handleCreateAccountApex(record){
        this.startSpinner(true)
        accountCreation({ accountJson: JSON.stringify(record) })
          .then(result => {
            console.log('Result callApexSave:: ');
            console.log(result);
            if ( !result.error && result.Ok) {
                this.handleCreateAccountApexOK(result.account)
            }else{
                this.showToast(ERROR_VARIANT,this.l.warningOp, result.msg);
            }
            
          })
          .catch(error => {
            console.error('Error:', error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }
}