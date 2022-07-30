import { LightningElement, api } from 'lwc';
import getListeGroupe from '@salesforce/apex/RH_groupController.getListeGroupe';
import updateGroupStatut from '@salesforce/apex/RH_groupController.updateGroupStatut';

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

 //   desc = this.stringLenght(item.RH_Description__c, 20);
    connectedCallback(){ 
        
      this.handlegetGroupe();
        }

    handlegetGroupe(){
      getListeGroupe({  })
            .then( result => {

              const self=this;
              console.log('Result', result);
              this.listeGroup = result.listeGroupe.map(function (e ){
              let item={...e};
              item.title=e.Name;
              item.id=e.Id;
              item.icon="standard:team_member";
              item.class=e.RH_Status__c;
              item.leader=e.RH_Team_Leader__r.Name;
              item.RH_Description__c= self.stringLenght(item.RH_Description__c, 20);
                                   
              item.keysFields=self.keysFields;
              item.keysLabels=self.keysLabels;
              item.fieldsToShow=self.fieldsToShow;
              
              const badge={
                name: 'badge',
                label: e.RH_Status__c,
                class: self.classStyle(e.RH_Status__c),
              }
              item.addons = {badge: badge}

              let Actions=[];
              if((e.RH_Status__c==='Desactived')||(e.RH_Status__c==='Draft')){
                    Actions.push( {   variant:"brand-outline",
                    class:" slds-m-left_x-small",
                    label:"Active",
                    name:'Activated',
                    title:"Active",
                    iconName:"utility:add",
                    // class:"active-item"
                  })
              }
              if(e.RH_Status__c==='Activated'){
                  Actions.push({   variant:"brand-outline",
                    class:" slds-m-left_x-small",
                    label:"Desactive",
                    name:'Desactived',
                    title:"Active",
                    iconName:"utility:deprecate",
                    // class:"active-item"
                  })
              }
          
              item.actions=Actions;
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
          let statutJs;
          let returnVal;
          if (info?.extra?.isTitle) {
            console.log('Action Source card:',info?.extra?.isTitle);
              this.handleDetailGroupe(info?.data?.id);
          }else{ 
              if(info?.extra?.item === 'Activated'){
                 console.log('Action Source:',' clique sur active');
                 statutJs = info?.extra?.item;
               }
              if(info?.extra?.item === 'Desactived'){
                console.log('Action Source:',' clique sur Desactive');
                statutJs = info?.extra?.item;
            }

            updateGroupStatut({ id: info?.data?.id, statut: statutJs })
              .then(result => {
                console.log('Result', result);
                returnVal = result.statut;
                this.handlegetGroupe();
              })
              .catch(error => {
                console.error('Error:', error);
            });
          }
      }
        handleDetailGroupe(groupeId){
           
          console.log('groupeid2 :', groupeId);
        /*  let groupeId =  this.template.querySelector('[data-id={item.Id}]');
          console.log('groupeid :', groupeId); */
          this.dispatchEvent(new CustomEvent('detailgroupe', {detail: groupeId}));
        }

        stringLenght(str, val){
          if(str?.length>=val){
              console.log('chaine reduite:', str?.substring(0,val));
              return (str?.substring(0,val)+'...');
          }else{
            console.log('chaine initiale:', str?.substring(0,val));
              return str;
          } 
        }

        classStyle(className){

          switch(className){
              case 'Activated':
                  return "slds-float_left slds-theme_success";
              case 'Draft':
                  return "slds-float_left slds-theme_info";
              case 'Desactived':
                  return "slds-float_left slds-theme_shade";
              case 'Closed':
                  return "slds-float_left slds-theme_error";
              default:
                  return "slds-float_left slds-theme_alt-inverse";
          }
      
      }

}