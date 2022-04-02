import { api, LightningElement } from 'lwc';
import RH_Icons from '@salesforce/resourceUrl/RH_Icons';
export default class Rh_success_operation extends LightningElement {
    @api
    title
    successImg = RH_Icons + '/Icons/sucess_operation.svg';
    // successImg = RH_Icons + '/raggruppa16344.svg';
    @api fields=[];
    @api textInfo;
    handleAction(event){
        let actionName=event.currentTarget.dataset.actionName;
        var actionEvt =new CustomEvent('action',
         {detail: { action : actionName }}
      );
      console.log("Watch: actionName ->"+actionName); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }
}