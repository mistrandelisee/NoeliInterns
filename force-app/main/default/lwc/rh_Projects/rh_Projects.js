import { LightningElement ,track ,wire} from 'lwc';
import getProjectList from '@salesforce/apex/RH_Project_controller.getProjectList';
import getTeamMemberList from '@salesforce/apex/RH_Project_controller.getTeamMemberList';
import getInitialMembersList from '@salesforce/apex/RH_Project_controller.getInitialMembersList';
import getProject from '@salesforce/apex/RH_Project_controller.getProject';
import getEditMemberList from '@salesforce/apex/RH_Project_controller.getEditMemberList';
import insertUpdateMembers from '@salesforce/apex/RH_Project_controller.insertUpdateMembers';
import insertProjectMethod from '@salesforce/apex/RH_Project_controller.insertProjectMethod';
import uploadFile from '@salesforce/apex/RH_Project_controller.uploadFile';
import getRelatedFilesByRecordId from '@salesforce/apex/RH_Project_controller.getRelatedFilesByRecordId';
import {NavigationMixin} from 'lightning/navigation';

import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class Rh_Projects extends NavigationMixin(LightningElement) {
    @track initial =[];
    @track memberProjects = []; 
    @track notmemberProjects = [];   
    @track addParticipate = [];
    filesList =[];  
    visibleProjects; 
    curentProject;
    curentDetails;
    fileData;
    initermediate = [];
    showList = true;
    showDetails = false;
    showEdit =false;
    addAttach = false;
    showManage = false;
    showInsertform = false;
    showAddMembers= false;
    @track error;
    @track returnList =[];
    @track val =[];
    @track tabReq =[];
    @track memberSelected = [];
    @track memberNotSelected = [];
    @track inputsItems = [];
    @track allInitialContacts = [];
    @track projects = {
        Name:'',       
        Description__c:'',  
        Start_Date__c:'', 
        End_Date__c:'',
        Project_Manager__c:'',
    };


    keysFields={AddressedTo:'ok'};//non used now
    keysLabels={
    CreatedDate:'Create date',
    Statut:'Statut',

    Name:'Name',

    Description:'Description'
    };
    fieldsToShow={
        CreatedDate:'Create date',
        Statut:'Statut',
        Description:'Description'
    };

    connectedCallback(){
    getProjectList()
    .then(result => {
        console.log('result',result);
        // this.initial = result;
        let tabReq111 = [];
        for(let key in result) {
            // inputs[ret1[key]['label']] = ret1[key]['value'];
            let objetRep = {};
            objetRep = {
            "Description": result[key]?.Description__c,
            "Statut": result[key]?.Status__c,
            "CreatedDate":  (new Date(result[key].CreatedDate)).toLocaleString(),
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
        // this.curentProject=e.currentTarget.getAttribute("data-id");
        // console.log('onItemSelected:::',this.curentProject);
        // this.curentProject=e.currentTarget.getAttribute("data-id");
        // this.initermediate = this.initial.filter(element => element['project']['Id'] == this.curentProject);

        this.curentProject= e.detail.data.id;
        getProject({ProjectId :this.curentProject})
        .then(result => {
            console.log('result',result);
            this.memberProjects = result['projectMembers'];
            console.log(this.memberProjects);
            this.curentDetails =[
                {
                    label:'Project Name',
                    placeholder:'',
                    name:result['project']['Name'],
                    value: result['project']['Name'],
                    required:true,
                    ly_md:'12', 
                    ly_lg:'12'
                },
                {
                    label:'Project Description',
                    placeholder:'',
                    name:result['project']['Description__c'],
                    value: result['project']['Description__c'],
                    required:true,
                    ly_md:'12', 
                    ly_lg:'12'
                },
                {
                    label:'Status',
                    placeholder:'',
                    name:result['project']['Status__c'],
                    value: result['project']['Status__c'],
                    required:true,
                    ly_md:'12', 
                    ly_lg:'12'
                },
                {
                    label:'Project Link',
                    placeholder:'',
                    name:result['project']['Link__c'],
                    value: result['project']['Link__c'],
                    required:true,
                    ly_md:'12', 
                    ly_lg:'12'
                },
                {
                    label:'Project Start Date',
                    placeholder:'',
                    name:result['project']['Start_Date__c'],
                    value: result['project']['Start_Date__c'],
                    required:true,
                    ly_md:'12', 
                    ly_lg:'12'
                },
                
                {
                    label:'Project End Date',
                    placeholder:'',
                    name:result['project']['End_Date__c'],
                    value: result['project']['End_Date__c'],
                    required:true,
                    ly_md:'12', 
                    ly_lg:'12'
                },
                {
                    label:'Project Manager',
                    placeholder:'',
                    name:result['project']['Project_Manager__r']['Name'],
                    value: result['project']['Project_Manager__r']['Name'],
                    required:true,
                    ly_md:'12', 
                    ly_lg:'12'
                },
            ];
            getRelatedFilesByRecordId({recordId: this.curentProject})
            .then(result11=>{
                console.log(result11)
                this.filesList = Object.keys(result11).map(id=>({
                "label":result11[id].obj.Title,
                 "value": result11[id].obj.Title,
                 "fname": result11[id].obj.Title,

                 "url":`data:application/octet-stream;base64,${result11[id].link}`
                }))
                console.log(this.filesList);
            })

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
                this.allInitialContacts = result;
                let ret1;
                let inputs= {};
                let ret = this.template.querySelector('c-rh_dynamic_form').save();
                ret1 = ret['outputsItems'];
                for(let key in ret1) {
                     inputs[ret1[key]['label']] = ret1[key]['value'];
                }
                 this.projects.Name = inputs['Name'];
                this.projects.Description__c = inputs['Description'];
                this.projects.Start_Date__c = inputs['Start date'];
                this.projects.Project_Manager__c = inputs['Project Manager'];
                this.projects.End_Date__c = inputs['End date'];
        
                if(inputs['Name'] == null || inputs['Start date'] == null || inputs['Project Manager'] == null){
                    this.showList = false;
                    this.showDetails = false;
                    this.showEdit = false;
                    this.showManage = false;
                    this.showInsertform = true;
                    this.showAddMembers= false;
                    this.addAttach = false;
                }else{
                    this.showList = false;
                    this.showDetails = false;
                    this.showEdit = false;
                    this.showManage = false;
                    this.showInsertform = false;
                    this.showAddMembers= true;
                    this.addAttach = false;
                }
                
        
                console.log('ret',ret['outputsItems']);
                console.log('projects',this.projects);
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
        let returnlist = this.template.querySelector('c-rh_add_and_remove').getResult();
        console.log('returnlist',returnlist);
        for(let key in returnlist) {
            if(returnlist[key]['isAdd'] == true){
                initParticipate.push({'RH_Contact__c':returnlist[key]['Id'], 'RH_Project__c':this.curentProject});
            }
            if(returnlist[key]['isAdd'] == false){
                moveParticipate.push({'RH_Contact__c':returnlist[key]['Id']});
            }
             
        }

        insertUpdateMembers({AddMembers:initParticipate,MoveMembers:moveParticipate})
        .then(result=>{
            window.console.log('after save');
            getProjectList()
            .then(result => {
                console.log('result',result);
                this.initial = result;
            });
            // .catch(error => {
            //     console.log('error',error);
            //     this.error = error;
            //     this.returnList = undefined;
            // });
            const toastEvent = new ShowToastEvent({
              title:'Success!',
              message:'Members Updated successfully',
              variant:'success'
            });
            this.dispatchEvent(toastEvent);
            this.showList = true;
            this.showManage= false;
        })
        .catch(error=>{
            this.error=error.message;
            window.console.log('error',this.error);
        });
    }

    handleSave(e){
        
        let initParticipate = [];
        let returnlist = this.template.querySelector('c-rh_add_and_remove').getResult();
        console.log('returnlist',returnlist);
        for(let key in returnlist) {
            if(returnlist[key]['isAdd'] == true){
                initParticipate.push({'RH_Contact__c':returnlist[key]['Id']});
            }
            // if(returnlist[key]['isAdd'] == false){
            //     moveParticipate.push({'RH_Contact__c':returnlist[key]['Id']});
            // }
             
       }
       this.addParticipate = initParticipate;
       window.console.log('addParticipate' + this.addParticipate);
        insertProjectMethod({ProjectObj:this.projects,participation:initParticipate})
        .then(result=>{
            window.console.log('after save' + this.accountid);
            getProjectList()
            .then(result => {
                console.log('result',result);
                this.initial = result;
            });
            // .catch(error => {
            //     console.log('error',error);
            //     this.error = error;
            //     this.returnList = undefined;
            // });
            const toastEvent = new ShowToastEvent({
              title:'Success!',
              message:'Project created successfully',
              variant:'success'
            });
            this.dispatchEvent(toastEvent);
            this.showList = true;
            this.showAddMembers= false;
        })
        .catch(error=>{
            this.error=error.message;
            window.console.log('error',this.error);
        });

    }
    handleBack(e){
        this.showList = true;
        this.showDetails = false;
        this.showEdit = false;
        this.showManage = false;
        this.showInsertform = false;
        this.showAddMembers= false;
        this.addAttach = false;
    }
    handleBackToDetails(e){
        getRelatedFilesByRecordId({recordId: this.curentProject})
            .then(result11=>{
                console.log(result11)
                this.filesList = Object.keys(result11).map(item=>({"label":result11[item],
                 "value": item.Title,
                 "fname": 'testfile.'+item.FileExtension,

                 "url":`data:application/octet-stream;base64,${item.VersionData}`
                }))
                console.log(this.filesList);
            })
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
                var memberSelectedinit =[];
                var memberNotSelectedinit = [];
                 for(let key in result['projectMembers']) {
                        memberSelectedinit.push(result['projectMembers'][key]['RH_Contact__r']); 
                    }
                this.memberSelected = memberSelectedinit;
                for(let key in result['projectNotMembers']) {
                    memberNotSelectedinit.push(result['projectNotMembers'][key]); 
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
        console.log('option',option);
        this.inputsItems = [
                        {
                            label:'Name',
                            placeholder:'Enter your Project Name',
                            name:'Name',
                            type:'text',
                            required:true,
                            ly_md:'12', 
                            ly_lg:'12'
                        },
                        {
                            label:'Description',
                            placeholder:'Enter your Project Description',
                            name:'Description',
                            type:'textarea',
                            ly_md:'12', 
                            ly_lg:'12'
                        }, 
                        {
                            label:'Project Manager',
                            placeholder:'select Project Manager',
                            name:'Project_Manager__c',
                            picklist: true,
                            options:option,
                            required:true,
                            ly_md:'12', 
                            ly_lg:'12'
                        },
                        {
                            label:'Start date',
                            placeholder:'Enter Start date',
                            name:'StartDate',
                            type:'date',
                            required:true,
                            ly_md:'12', 
                            ly_lg:'12'
                        },
                        {
                            label:'End date',
                            placeholder:'Enter End date',
                            name:'EndDate',
                            type:'date',
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
            let title = `${filename} uploaded successfully!!`
            this.toast(title)
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
}