import { api, LightningElement } from 'lwc';

const CARD_ACTION='stateAction';
export default class Rh_card extends LightningElement {
    @api
    iconeName ;
    @api
    className ;
    @api
    availableActions
    @api
    record
    @api
    title
    @api
    keysFields
    @api
    keysLabels

    @api
    fieldsToShow
    isRendered;
    column=1;
    outputFields=[{
        label:'gg',
        placeholder:'',
        name:'xxxx',
        value: 'xcvcbvv',
    }];
    initFields(obj){
        this.outputFields=[];
        if (obj) {
            for (const key in this.fieldsToShow) {//order the filed to show obj
                //if (this.fieldsToShow.hasOwnProperty.call(this.fieldsToShow, key)) {
                    if (obj.hasOwnProperty.call(obj, key)) {
                        const element = obj[key];
                        let e={
                            label:this.keysLabels[key] || 'Missing',
                            name:key,
                            value: element,
                        };
                        this.outputFields.push(e);
                    }
                //}
                
            }
        }
    }
    renderedCallback(){
        if (!this.isRendered) {
            this.iconeName=this.iconeName || "";
            this.title=this.title || "";
            this.availableActions=this.availableActions || [];
            this.keysFields=this.keysFields || {};
            this.keysLabels=this.keysLabels || {};
            this.fieldsToShow=this.fieldsToShow || {};
            this.record=this.record || {
                Name__c:'tesst',
                Price: 5,
                Date__c: '2020_1_0257'
            };
            // console.log(`availableActions `,this.availableActions );
            // console.log(`iconeName `,this.iconeName );
            // console.log(`iconeName `,this.record );
            
            this.isRendered=true;
             this.initFields(this.record);
        }
        
    }
    get hasActions(){
            return this.availableActions?.length > 0;
    }
    get hasFieldsRows(){
        return this.outputFields?.length >0;
     }
    get getFieldsRows(){
        let outfields=[];
        let outrows=[];
        let i=1;
        for (let index = 0; index < this.outputFields.length; index++) {
            const field = this.outputFields[index];
            outrows.push({...field,
                isLink: field.type=='Link'});
            
            if (i==(+this.column) || index == this.outputFields.length-1) {//if second pair or last elt
                outfields.push({index,fields:outrows});
                outrows=[];
                i=0;
            }
            i=i+1;
        }
        // console.log(`outfields  `, outfields );
        return outfields;
    }
    

    selectedItemValue;

    handleOnselect(event) {
       const name = event.detail.value;
        this.callParent(CARD_ACTION,this.record,{item:name})
    }

    goToLink(event){
        console.log(`############################ goToLink`);
       let name=event.currentTarget.dataset.name;
       this.callParent(name,this.record,{isTitle:name=='title'})
       
    }
    callParent(actionName,data,extra={}){
        var actionEvt =new CustomEvent('action',
         {detail: { action : actionName,data,extra }}
      );
      console.log("Watch:Rh_card  callParent  actionName ->"+JSON.stringify(actionName) ); /*eslint-disable-line*/
      console.log("Watch:Rh_card  callParent  data ->"+JSON.stringify(data) ); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }


}