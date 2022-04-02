import { api, LightningElement } from 'lwc';

export default class Rh_resume extends LightningElement {
    @api formsData=[];
    @api editMode;
    handleNavigate(event){
        //to remove when the page ref event will be implemented
        console.log('OUTPUT : NAV EVENT ',event);
        let selectedKey=event.detail.to;
        var modified =new CustomEvent('resumeselect',
         {detail: { to : selectedKey }}
      );
      console.log("Watch: modified ->"+modified); /*eslint-disable-line*/
      
      this.dispatchEvent(modified);
    }
}