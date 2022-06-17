import { LightningElement, api, track,wire } from 'lwc';
import getGroupe from '@salesforce/apex/RH_groupController.getGroupe';
import deleteGroupe from '@salesforce/apex/RH_groupController.deleteGroupe';
import updateGroupStatut from '@salesforce/apex/RH_groupController.updateGroupStatut';
import { CurrentPageReference,NavigationMixin } from 'lightning/navigation';
import { labels } from 'c/rh_label';
import checkRole from '@salesforce/apex/RH_Utility.checkRole';



export default class Rh_group_detail  extends NavigationMixin(LightningElement) {
    @wire(CurrentPageReference) pageRef;
    data = [];
  //  columns = columns;
    rowOffset = 0;
    listId = [];
    statusEditGroup;
    detailGroup=true;
    l = {...labels};
    @api groupeId;
    @api groupe;
    @track accountFields=[];
    actionAvailable=[];
    actionAvailableActive=[];
    contactMemberss=[];
    newGroup = 'Edit group';
    @api statusGroup;
    //backSource='group_detail';

    @track columns = [
        { label: 'Label', fieldName: 'Name', type: 'button',typeAttributes:{label:{fieldName:'Name'},variant:'base'} },
        { label: 'Email', fieldName: 'Email', type: 'email' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' },
        { label: 'Lieu Residence', fieldName: 'quartier' },
    ];

    roleManage(){
        checkRole({ })
          .then(result => {
            console.log('Result role --->', result);
            if(result.isBaseUser||result.isTLeader) this.avail = [];
          })
          .catch(error => {
            console.error('Error:', error);
        });
    }

    connectedCallback(){

        console.log(JSON.stringify(this.l));
        console.log('backSource detail--->:', this.backSource);
        this.contactMembers = this.contactMembers || []; 
        getGroupe({ id: this.groupeId })
            .then(result => {
              console.log('Result');
              console.log(result);
              this.groupe=result;
              this.AvailableAction(this.groupe.RH_Status__c);
              this.buildAccountFields(result); 
            //  this.buildActionAvailable(result);
            //  this.contactMembers = result.RH_GroupMembers__r;
              this.statusGroup = result.RH_Status__c;
                console.log('contactgroup in groupDetail', this.contactMembers);
                console.log('statusGroup in groupDetail', this.statusGroup);
                this.dispatchEvent(new CustomEvent('contactgroup', {detail: result})); 
                console.log('contactMembers dans group detail', result.RH_GroupMembers__r);
              this.data = result?.RH_GroupMembers__r?.length > 0 ? result?.RH_GroupMembers__r :  []; 
              console.log('data for datable ---> :',this.data);
              this.refreshTable(this.data);
            })
            .catch(error => {
              console.error('Error:', error);
            }); 
            this.roleManage();  
    }
    refreshTable(data) {
        const dataTableCmp = this.template.querySelector('c-rh_datatable_component');
        if (dataTableCmp) {
            dataTableCmp?.setDatas(data);
        } else {
            console.log('@@@@@@@@@@@@@Not found');
        }
    }
    handleEditMember(){
        console.log('groupeId:==>', this.groupeId);
        this.dispatchEvent(new CustomEvent('editmember', {detail: this.groupeId}));
        
    }
    buildAccountFields(groupe){
        this.accountFields=[
            {
                label:this.l.Name,
                name:'Name',
                value:groupe.Name
            },
            {
                label:this.l.Leader,
                name:'Leader Name',
                value:groupe.RH_Team_Leader__r.Name,
                type: 'Link',
                class:'Link',
                dataId:groupe?.RH_Team_Leader__r?.RH_User__c
            },
            {
                label:this.l.Description,
                name:'Description',
                value:groupe.RH_Description__c
            },
            {
                label:this.l.Status,
                name:'Status',
                value:groupe.RH_Status__c	
            }

        ];

    }

    handleUserDetails(event){
        let action=event.detail.action;
        console.log('>>>>>>>>>>>>>. action ',action);
        if(action=='goToLink'){
            const info = event.detail.info;
            let record={eltName:info.name,recordId:info.dataId}
            this.handleGoToLink(record);
        }
    }
    handleGoToLink(data){
        console.log(`handleGoToLink data `, JSON.stringify(data));
        //this.startSpinner(false);
        switch (data?.eltName) {
           /* case 'Supervisor':
                this.goToPage('rhusers',{recordId:data?.recordId})
                break; */
            case 'Leader Name':
                this.goToPage('rhusers',{recordId:data?.recordId})
                break;
        
            default:
                break;
        }
    }

    goToPage(pagenname,state={}) {
        let states=state; 
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }
   
    updateStatus(status){
        for(var field of this.accountFields){
            if(field.name=='Status'){
                field.value = status;
            }
        }
    }
        actionAvailableActive=[
            {
                name:"Deleted",
                variant:"brand-outline",
                label:"Delete",
                iconName:"utility:delete",
                                class:"slds-m-left_x-small"
            },
            {
                name:"Edited",
                variant:"brand-outline",
                label:"Edit",
                iconName:"utility:edit",
                                class:"slds-m-left_x-small"
            },
            {
                name:"Activated",
                variant:"brand-outline",
                label:"Active",
                iconName:"utility:add",
                                class:"slds-m-left_x-small"
            }
            
         ];
         actionAvailable=[
            {
                name:"Deleted",
                variant:"brand-outline",
                label:"Delete",
                iconName:"utility:delete",
                                class:"slds-m-left_x-small"
            },
            {
                name:"Edited",
                variant:"brand-outline",
                label:"Edit",
                iconName:"utility:edit",
                                class:"slds-m-left_x-small"
            },
            {
                name:"Desactived",
                variant:"brand-outline",
                label:"Desactive",
                iconName:"utility:deprecate",
                                class:"slds-m-left_x-small"
            }
            
         ];
    avail = [];
    get hasDetailsActions(){ return this.avail?.length >0}
    AvailableAction(status){
         console.log('groupe result' + this.groupe);
        if(status == 'Activated'){
            this.avail = this.actionAvailable;
        }else{
            this.avail = this.actionAvailableActive;
        }
         
     }

     handleManageAction(event){
         console.log('Action Name ==-->:', event.detail.action);
        // this.detailGroup = false;
         if(event.detail.action=='Edited'){
            this.statusEditGroup = true;
            this.detailGroup = false;
         }
         if(event.detail.action=='Deleted'){
            deleteGroupe({ id: this.groupeId })
              .then(result => {
                console.log('Result', result.result);
                this.dispatchEvent(new CustomEvent('homegroupe'));
              })
              .catch(error => {
                console.error('Error:', error);
            });
         }
         if(event.detail.action=='Activated' || event.detail.action=='Desactived'){
            updateGroupStatut({ id: this.groupeId, statut: event.detail.action })
              .then(result => {
                console.log('Result', result);
                this.updateStatus(result.statut);
              })
              .catch(error => {
                console.error('Error:', error);
            });
        }
        
     }

     handleBack(){
        this.statusEditGroup = false;
        this.detailGroup = true;
     }
     handleupdategroup(){
        this.handleBack();
         window.location.reload();         
     }

     handleRowAction( event ) {
        console.log('dans le handlerow');
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

    goToLink(event){
        const action = event.detail.action;
        if(action == 'goToLink'){
            this.goToUserDetail(event.detail.eltName);
        }
        // this.selectedContact = this.contacts.data.find(contact => contact.Id === contactId);
    }
}