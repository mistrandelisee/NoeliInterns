import { LightningElement, api } from 'lwc';
import getContactForGroupe from '@salesforce/apex/RH_groupController.getContactForGroupe';

export default class Rh_group_member extends LightningElement {
    @api listContact;

    connectedCallback(){
        getContactForGroupe({ })
          .then(result => {
            console.log('Result', result);
            this.listContact = result.listeContact;
          })
          .catch(error => {
            console.error('Error:', error);
        });
    }
}