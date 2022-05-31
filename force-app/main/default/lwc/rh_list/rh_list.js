import { api, LightningElement } from 'lwc';

export default class Rh_list extends LightningElement {
    @api
    cssClass;

     @api headerTitle;
     @api headerIcon;
    @api
    keyId='Id';
    @api
    keyValue='Name';
    @api
    records;
    /**
     * [{key:'1', value:'record1'}]
    
    */
   get listClass(){
       return this.cssClass ?  this.cssClass : 'slds-has-dividers_around slds-has-block-links_space ';
   }
   get items(){ 
       if (this.records?.length>0) {
           const self = this;
            return this.records.map(function(record){
                let item={};
                item.key=record[self.keyId];
                item.value=record[self.keyValue];
                return item;
            })   

       }else return [];
   }
   goToLink(event){
        console.log(`############################ goToLink`);
        let name=event.currentTarget.dataset.name;
        let type=event.currentTarget.dataset.type;
        this.callParent(type,{key:name})
        
    }
    callParent(action,data){
        var actionEvt =new CustomEvent('action', {detail: {action,data}} );
        this.dispatchEvent(actionEvt);
    }
}