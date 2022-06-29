import { LightningElement, api, track, wire } from 'lwc';
import getContactForGroupe from '@salesforce/apex/RH_groupController.getContactForGroupe';
import addGroupMember from '@salesforce/apex/RH_groupController.addGroupMember';
import activeGroupe from '@salesforce/apex/RH_groupController.activeGroupe';
import deleteGroupe from '@salesforce/apex/RH_groupController.deleteGroupe';
import updateGroupMember from '@salesforce/apex/RH_groupController.updateGroupMember';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

export default class Rh_group_member extends LightningElement {
    @wire(CurrentPageReference) pageRef;
    @track listContact=[];
    @track listContactToInsert=[];
    @track listConts=[];
     contactId;
     contact2Id;
     @api backSource;
     @api objGroupe;
     @api groupeId;
     @api contactMembers;
     @api statusGroup;
     statusBoutom = true;
     listOption = [];
     listId = [];

     handleBack(){
       if(this.backSource==='group_create'){
        deleteGroupe({ id: this.groupeId })
          .then(result => {
            console.log('Result', result.result);
            console.log('error then', result.error);
          })
          .catch(error => {
            console.error('Error:', error);
        });
      }
      this.dispatchEvent(new CustomEvent('previouspage'));  
   }

    connectedCallback(){
        registerListener('valueMember', this.dovalueMember, this);
        console.log('backSource groupe_member --->', this.backSource);
        this.listContact=this.listContact || [];
        this.listContactToInsert=this.listContactToInsert || [];
        getContactForGroupe({ })
          .then(result => {
            console.log('Result', result);
            console.log('groupeId ==', this.groupeId);
            this.listOption = this.updateListContact(result.listeContact);
            //this.listId = this.updateId(this.contactMembers);
            this.listContact =this.ccsUpdate(result.listeContact,'') ;
          })
          .catch(error => {
            console.error('Error:', error);
        });
        console.log('contactMembers: contact deja dans un groupe ==>', this.contactMembers);
        this.listId = this.updateId(this.contactMembers || []) ;
        this.listConts = this.listId;
        console.log('Id contactMembers dans group member ==>', this.listId);

        console.log('list id for insert =>:', this.listConts);
        console.log('statusGroup dans group Member ==>', this.statusGroup);
        if(this.statusGroup==='Activated'){
            this.statusBoutom = false;
        }
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
    label;
    value;
    updateListContact (liste){
      //  const obj = {label, value};
        return liste.map( function(item){
              return  {
                label: item.Name,
                value: item.Id,
                }
        });
    }

    updateId (liste){ 
        return liste.map( function(item){
              return item.Id
        });
    }

    handleSaveMember(){
       if(this.backSource==='group_create'){
          this.hgroupMember(this.listConts, this.groupeId,'false');
       }else{
          this.hupdateGroupMember(this.listConts,this.groupeId,'false');
      }
    }
    hgroupMember(lst,id,statut){
        addGroupMember({ liste:lst , id:id}) 
          .then(result => {
            console.log('Result', result);
            console.log('listeId', lst);
            if(statut==='true'){
                this.hactiveGroupe(id);
            }
            this.dispatchEvent(new CustomEvent('gotodetailgroup', {detail:id}));
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

    handleSaveMemberAndActive(){
        if(this.backSource==='group_create'){
          console.log('listconts--->:', this.listConts);
          console.log('groupeId--->:', this.groupeId);
          this.hgroupMember(this.listConts, this.groupeId,'true');
        }else{
          this.hupdateGroupMember(this.listConts,this.groupeId,'true');
        }
    }

    hactiveGroupe(id){
        activeGroupe({ id: id })
          .then(result => {
            console.log('Result', result.groupeId);
          })
          .catch(error => {
            console.error('Error:', error);
        });
    }
    
    dovalueMember(event){
         this.listConts = event.tab;
         console.log('list id for insert =>:', this.listConts);
    }

    hupdateGroupMember(lst,id,statut){
      updateGroupMember({ listId: lst, id: id})
      .then(result => {
        console.log('Result', result.result);
        if(statut==='true'){
          this.hactiveGroupe(id);
         } 
         this.dispatchEvent(new CustomEvent('previouspage'));
      })
      .catch(error => {
        console.error('Error:', error);
        console.error('Error:', resutl.error);
    });
    }
}