import { LightningElement, api } from 'lwc';
import getGroupe from '@salesforce/apex/RH_groupController.getGroupe';
import { labels } from 'c/rh_label';

const columns = [
    { label: 'Label', fieldName: 'Name' },
    { label: 'Email', fieldName: 'Email', type: 'email' },
    { label: 'Phone', fieldName: 'Phone', type: 'phone' },
    { label: 'Lieu Residence', fieldName: 'quartier' },
];

export default class Rh_group_detail extends LightningElement {
    data = [];
    columns = columns;
    rowOffset = 0;
    listId = [];
    statusEditGroup;
    detailGroup=true;
    l = {...labels};
    @api groupeId;
    @api groupe;
    accountFields=[];
    contactMemberss=[];
    newGroup = 'Edit group';
    @api statusGroup;
    //backSource='group_detail';

    connectedCallback(){

        console.log(JSON.stringify(this.l));
        console.log('backSource detail--->:', this.backSource);
        this.contactMembers = this.contactMembers || []; 
        getGroupe({ id: this.groupeId })
            .then(result => {
              console.log('Result');
              console.log(result);
              this.groupe=result;
              this.buildAccountFields(result); 
            //  this.contactMembers = result.RH_GroupMembers__r;
              this.statusGroup = result.RH_Status__c;
                console.log('contactgroup in groupDetail', this.contactMembers);
                console.log('statusGroup in groupDetail', this.statusGroup);
                this.dispatchEvent(new CustomEvent('contactgroup', {detail: result})); 
                console.log('contactMembers dans group detail', result.RH_GroupMembers__r);
              this.data = result?.RH_GroupMembers__r?.length > 0 ? result?.RH_GroupMembers__r :  []; 
              this.refreshTable(this.data);
            })
            .catch(error => {
              console.error('Error:', error);
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
                value:groupe.RH_Team_Leader__r.Name
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
     actionAvailable=[
        {
            name:"Edite",
            variant:"base",
            label:"Edit",
            iconName:"utility:edit"
        }
     ];

     handleEditGroup(){
        this.statusEditGroup = true;
        this.detailGroup = false;
        /* console.log('handleEditGroup: ===>', 'dans le group_detail');
         this.dispatchEvent(new CustomEvent('editgroup'));*/
     }

     handleBack(){
        this.statusEditGroup = false;
        this.detailGroup = true;
     }
     handleupdategroup(){
        this.handleBack();
         window.location.reload();         
     }
}