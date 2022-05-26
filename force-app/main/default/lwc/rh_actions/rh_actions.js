import { LightningElement,api } from 'lwc';

export default class Rh_actions extends LightningElement {
    hasRenderd;
    @api
    actionAvailable;
    connectedCallback() {
        this.prefilActions();
    }
    prefilActions(){
        if (this.actionAvailable?.length) {
            this.actionAvailable=this.actionAvailable.map(function(e){
                return {...e, class:e?.class?.includes('slds-float_left')? e?.class +' slds-m-left_x-small': e?.class+ ' slds-m-left_x-small slds-float_right' }
            })
            
        }
    }

    handleClick(event){
        let actionName=event.currentTarget.dataset.actionName;
        this.callParent(actionName,{})
      
    }
    callParent(actionName,data){
        var actionEvt =new CustomEvent('action',
         {detail: { action : actionName,data }}
      );
      console.log("Watch: actionName ->"+actionName); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }
}