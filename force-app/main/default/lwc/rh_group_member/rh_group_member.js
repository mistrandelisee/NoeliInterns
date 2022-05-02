import { LightningElement, api, track } from 'lwc';
import getContactForGroupe from '@salesforce/apex/RH_groupController.getContactForGroupe';
import addGroupMember from '@salesforce/apex/RH_groupController.addGroupMember';

export default class Rh_group_member extends LightningElement {
    @track listContact=[];
    @track listContactToInsert=[];
     contactId;
     contact2Id;
     @api idGroupe;
     handleBack(){
        this.dispatchEvent(new CustomEvent('previouspage'));
     }

    connectedCallback(){
        this.listContact=this.listContact || [];
        this.listContactToInsert=this.listContactToInsert || [];
        getContactForGroupe({ })
          .then(result => {
            console.log('Result', result);
            this.listContact =this.ccsUpdate(result.listeContact,'') ;
          })
          .catch(error => {
            console.error('Error:', error);
        });
    }

    handleChangeRight(event){
         this.contactId = event.currentTarget.dataset.id;
         
         this.listContact =this.ccsUpdate(this.listContact,this.contactId) ;
         console.log('contactId dans handleChangeRight:', this.contactId);
    }

    handleClickRight(){ 
        console.log('contactId',this.contactId);
        let objSelect = this.listContact.find(obj => obj.Id === this.contactId);
        objSelect.classe = 'slds-listbox__item';
        this.listContactToInsert.push(objSelect);
        this.listContact = this.listContact.filter(element => element.Id != this.contactId);
    
        console.log('listContactToInsert:', this.listContactToInsert);
    }

    handleChangeLeft(event){
        this.contact2Id = event.currentTarget.dataset.id;
         console.log('contactId dans handleChangeRight:', this.contact2Id);
         this.listContactToInsert =this.ccsUpdate(this.listContactToInsert,this.contact2Id) ;
    }
 
    handleClickLeft(){
        let objSelect = this.listContactToInsert.find(obj => obj.Id === this.contact2Id);
        objSelect.classe = 'slds-listbox__item';
        this.listContact.push(objSelect);
        this.listContactToInsert = this.listContactToInsert.filter(element => element.Id != this.contact2Id);
    }

    ccsUpdate(liste, id){
        let classe; 
        return liste.map(function(item)  {
            if(item.Id === id){
                item.classe = 'slds-listbox__item xhover' 
            }else{
                item.classe = 'slds-listbox__item'
            }
            return item;
        });
        
    }

    handleSaveMember(){
        addGroupMember({ liste: this.listeId(this.listContactToInsert) , id:this.idGroupe }) 
          .then(result => {
            console.log('Result', result);
            console.log('listeId', this.listeId(this.listContactToInsert));
            this.dispatchEvent(new CustomEvent('homegroupe'));
          })
          .catch(error => {
            console.error('Error:', error);
        });
    }

    listeId(liste){
        return liste.map(function(e){
            return e.Id
        });
    }
}