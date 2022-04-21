import { LightningElement ,track ,wire} from 'lwc';
import getProjectMembers from '@salesforce/apex/RH_Project_controller.getProjectMembers';
import insertProjectMethod from '@salesforce/apex/RH_Project_controller.insertProjectMethod';

import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class Rh_Projects extends LightningElement {
    @track initial =[];
    @track memberProjects = []; 
    @track notmemberProjects = [];   
    @track addParticipate = [];  
    visibleProjects; 
    curentProject;
    curentDetails;
    initermediate = [];
    showList = true;
    showDetails = false;
    showEdit =false;
    showManage = false;
    showInsertform = false;
    showAddMembers= false;
    @track error;
    @track returnList =[];
    @track val =[];
    @track memberSelected = [];
    @track memberNotSelected = [];
    @track inputsItems = [];
     allInitialContacts = [];
    @track projects = {
        Name:'',       
        Description__c:'',  
        Start_Date__c:'', 
        End_Date__c:'',
        Project_Manager__c:'',
    };

    @wire(getProjectMembers)
    wiredContacts({ error, data }) {
        console.log('data',data);
        if (data) {
            // this.contacts = data;
            this.error = undefined;

            let option = [];
            for(let key in data) {
                // Preventing unexcepted data
                if (data.hasOwnProperty(key)) { // Filtering the data in the loop
                    // this.returnList.push(data[key]['project']);
                    
                    this.returnList.push({project:data[key]['project'], member:data[key]['projectMembers'],notmember:data[key]['projectNotMembers'],allContact:data[key]['allContact']});
                }
            }
            this.initial = this.returnList;
            for(let key in data[0]['allInitContact']) {
                this.allInitialContacts .push({Id: data[0]['allInitContact'][key]['Id'] , Name: data[0]['allInitContact'][key]['Name'] });
            }
            
            let allInitialContacts11 = data[0]['allInitContact'];
            this.allInitialContacts = allInitialContacts11;
            console.log('this.allInitialContacts',this.allInitialContacts);
            console.log('allInitialContacts11',allInitialContacts11);
            for(let key in data[0]['allContact']) {
                option.push({label: data[0]['allContact'][key]['Name'] , value: data[0]['allContact'][key]['Id'] });
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
            console.log('return2'+JSON.stringify(this.returnList));
            console.log('val'+JSON.stringify(this.val));

        } else if (error) {
            this.error = error;
            this.returnList = undefined;
            console.log('error',error);
        }
    }


    // connectedCallback(){
    //     getProjectMembers()
    //     .then(result => {
    //         let option = [];
    //         for(let key in result) {
    //             // Preventing unexcepted data
    //             if (result.hasOwnProperty(key)) { // Filtering the data in the loop
    //                 // this.returnList.push(result[key]['project']);
    //                 this.returnList.push({project:result[key]['project'], member:result[key]['projectMembers'],notmember:result[key]['projectNotMembers'],allContact:result[key]['allContact']});
    //             }
    //         }
    //         this.initial = this.returnList;
    //         this.allInitialContacts = result[0]['allInitContact'];
    //         for(let key in result[0]['allContact']) {
    //             option.push({label: result[0]['allContact'][key]['Name'] , value: result[0]['allContact'][key]['Id'] });
    //        }
    //         console.log('option',option);
    //         this.inputsItems = [
    //             {
    //                 label:'Name',
    //                 placeholder:'Enter your Project Name',
    //                 name:'Name',
    //                 type:'text',
    //                 required:true,
    //                 ly_md:'12', 
    //                 ly_lg:'12'
    //             },
    //             {
    //                 label:'Description',
    //                 placeholder:'Enter your Project Description',
    //                 name:'Description',
    //                 type:'textarea',
    //                 ly_md:'12', 
    //                 ly_lg:'12'
    //             }, 
    //             {
    //                 label:'Project Manager',
    //                 placeholder:'select Project Manager',
    //                 name:'Project_Manager__c',
    //                 picklist: true,
    //                 options:option,
    //                 required:true,
    //                 ly_md:'12', 
    //                 ly_lg:'12'
    //             },
    //             {
    //                 label:'Start date',
    //                 placeholder:'Enter Start date',
    //                 name:'StartDate',
    //                 type:'date',
    //                 required:true,
    //                 ly_md:'12', 
    //                 ly_lg:'12'
    //             },
    //             {
    //                 label:'End date',
    //                 placeholder:'Enter End date',
    //                 name:'EndDate',
    //                 type:'date',
    //                 ly_md:'12', 
    //                 ly_lg:'12'
    //             },
    //         ];
    //         console.log('return2'+JSON.stringify(this.returnList));
    //         console.log('val'+JSON.stringify(this.val));
    //     })
    //     .catch(error => {
    //         this.error = error;
    //         this.returnList = undefined;
    //     });
    // }
    updateProjectHandler(event){
        this.visibleProjects=[...event.detail.records]
        console.log(event.detail.records)
    }   
    
    handleChange(e) {
        var memberSelectedinit = [];
        var memberNotSelectedinit = [];
        this.curentProject=e.currentTarget.getAttribute("data-id");
        console.log('onItemSelected:::',this.curentProject);
        this.curentProject=e.currentTarget.getAttribute("data-id");
        this.initermediate = this.initial.filter(element => element['project']['Id'] == this.curentProject);
        console.log('initermediate:::',this.initermediate);
        this.curentDetails =[
            {
                label:'Project Name',
                placeholder:'',
                name:this.initermediate[0]['project']['Name'],
                value: this.initermediate[0]['project']['Name'],
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Project Description',
                placeholder:'',
                name:this.initermediate[0]['project']['Description__c'],
                value: this.initermediate[0]['project']['Description__c'],
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Status',
                placeholder:'',
                name:this.initermediate[0]['project']['Status__c'],
                value: this.initermediate[0]['project']['Status__c'],
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Project Link',
                placeholder:'',
                name:this.initermediate[0]['project']['Link__c'],
                value: this.initermediate[0]['project']['Link__c'],
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Project Start Date',
                placeholder:'',
                name:this.initermediate[0]['project']['Start_Date__c'],
                value: this.initermediate[0]['project']['Start_Date__c'],
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            
            {
                label:'Project End Date',
                placeholder:'',
                name:this.initermediate[0]['project']['End_Date__c'],
                value: this.initermediate[0]['project']['End_Date__c'],
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Project Manager',
                placeholder:'',
                name:this.initermediate[0]['project']['Project_Manager__r']['Name'],
                value: this.initermediate[0]['project']['Project_Manager__r']['Name'],
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
        ];
        this.memberProjects = this.initermediate[0]['member'];
        this.notmemberProjects = this.initermediate[0]['notmember'];
        
        for(let key in this.memberProjects) {
            memberSelectedinit.push(this.memberProjects[key]['RH_Contact__r']); 
        }
        this.memberSelected = memberSelectedinit;
        // this.memberSelected.push(this.initermediate[0]['project']['Project_Manager__r']); 
        
        for(let key in this.notmemberProjects) {
            memberNotSelectedinit.push(this.notmemberProjects[key]); 
        }
        this.memberNotSelected  = memberNotSelectedinit;
        this.showList = false;
        this.showDetails = true;
        this.showEdit = false;
        this.showManage = false;
        this.showInsertform = false;
        console.log('onItemSelected:::',this.curentProject);
        
    }
    handleNext(e){
        
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
        }else{
            this.showList = false;
            this.showDetails = false;
            this.showEdit = false;
            this.showManage = false;
            this.showInsertform = false;
            this.showAddMembers= true;
        }
        

        console.log('ret',ret['outputsItems']);
        console.log('projects',this.projects);
    }
    handleSave(e){
        
        let moveParticipate = [];
        let returnlist = this.template.querySelector('c-rh_add_and_remove').getResult();
        console.log('returnlist',returnlist);
        for(let key in returnlist) {
            if(returnlist[key]['isAdd'] == true){
                this.addParticipate.push({'RH_Contact__c':returnlist[key]['Id']});
            }
            // if(returnlist[key]['isAdd'] == false){
            //     moveParticipate.push({'RH_Contact__c':returnlist[key]['Id']});
            // }
             
       }
       window.console.log('addParticipate' + this.addParticipate);
        insertProjectMethod({ProjectObj:this.projects,participation:this.addParticipate})
        .then(result=>{
            window.console.log('after save' + this.accountid);
            
            const toastEvent = new ShowToastEvent({
              title:'Success!',
              message:'Account created successfully',
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
    }
    handleBack1(e){
        this.showList = false;
        this.showDetails = true;
        this.showEdit = false;
        this.showManage = false;
        this.showInsertform = false;
        this.showAddMembers= false;
    }
    handleEdit(e){
        this.showList = false;
        this.showDetails = false;
        this.showEdit = true;
        this.showManage = false;
        this.showInsertform = false;
        this.showAddMembers= false;
    }
    handleManage(e){
        this.showList = false;
        this.showDetails = false;
        this.showEdit = false;  
        this.showManage = true; 
        this.showInsertform = false; 
        this.showAddMembers= false;
    }
    handlecreate(e){
        this.showList = false;
        this.showDetails = false;
        this.showEdit = false;  
        this.showManage = false; 
        this.showInsertform = true;
        this.showAddMembers= false;
    }
    handleBack111(e){
        this.showList = true;
        this.showDetails = false;
        this.showEdit = false;  
        this.showManage = false; 
        this.showInsertform = false;
        this.showAddMembers= false;
    }
}