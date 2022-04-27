import { LightningElement, api } from 'lwc';
import getGroupe from '@salesforce/apex/RH_groupController.getGroupe';
import { labels } from 'c/rh_label';

export default class Rh_group_detail extends LightningElement {
    l = {...labels};
    @api groupeId;
    accountFields=[];

    connectedCallback(){
        console.log(JSON.stringify(this.l));
        
        getGroupe({ id: this.groupeId })
            .then(result => {
              console.log('Result', result);
              this.buildAccountFields(result); 
            })
            .catch(error => {
              console.error('Error:', error);
            });
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