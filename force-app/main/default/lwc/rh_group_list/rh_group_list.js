import { LightningElement, api } from 'lwc';
import getListeGroupe from '@salesforce/apex/RH_groupController.getListeGroupe';
import getLeader from '@salesforce/apex/RH_groupController.getLeader';

export default class Rh_group_list extends LightningElement {
    @api listeGroup=[];
    hideCp = true;

    keysFields={groupeName:'ok'};
    keysLabels={
      Name:'Name', leader:'Group Leader',
      RH_Description__c:'Description',
    };
    fieldsToShow={
      Name:'ok', leader:'',
      RH_Description__c:'ok',
    };

    connectedCallback(){ 
        getListeGroupe({  })
            .then( result => {

              const self=this;
              console.log('Result', result);
              this.listeGroup = result.listeGroupe.map(function (e ){
              let item={...e};
              item.title=e.Name;
              item.id=e.Id;
              item.icon="standard:team_member";
              item.class=e.RH_Description__c;
              item.leader=e.RH_Team_Leader__r.Name;
                                   
              item.keysFields=self.keysFields;
              item.keysLabels=self.keysLabels;
              item.fieldsToShow=self.fieldsToShow;

              return item;
               });
               this.setviewsList(this.listeGroup)
            })
            .catch(error => {
              console.error('Error:', error) 
            });
            
        }

        setviewsList(items){
          let cardsView=this.template.querySelector('c-rh_cards_view');
          cardsView?.setDatas(items);
       }
       handleCardAction(event){
          console.log('event parent ' +JSON.stringify(event.detail));
          const info=event.detail;
          if (info?.extra?.isTitle) {
              this.handleDetailGroupe(info?.data?.id);
          }
      }
        handleDetailGroupe(groupeId){
           
          console.log('groupeid2 :', groupeId);
        /*  let groupeId =  this.template.querySelector('[data-id={item.Id}]');
          console.log('groupeid :', groupeId); */
          this.dispatchEvent(new CustomEvent('detailgroupe', {detail: groupeId}));
        }

}