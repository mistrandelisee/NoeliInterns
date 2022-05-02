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

    l = {...labels};
    @api groupeId;
    accountFields=[];
    contactMembers=[];

    connectedCallback(){
        console.log(JSON.stringify(this.l));
        this.contactMembers = this.contactMembers || []; 
        getGroupe({ id: this.groupeId })
            .then(result => {
              console.log('Result', result);
              this.buildAccountFields(result); 
              this.contactMembers = result.RH_GroupMembers__r;
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
        this.dispatchEvent(new CustomEvent('editmember'));
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
                label:this.l.GroupeMember,
                name:'The Groupe Member are',
                value:''
            }

        ];
    }
    
}