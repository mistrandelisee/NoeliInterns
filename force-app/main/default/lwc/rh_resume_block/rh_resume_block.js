import { api,wire, LightningElement } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';

export default class Rh_resume_block extends LightningElement {
    @api index;
    @api title;
    @api iconSrc;
    @api fields=[];
    @api editMode;
    @wire(CurrentPageReference) pageRef;
    connectedCallback(){
        this.title=this.title || 'Mock title';
        // if (this.fields.length<1) {
        //     for (let index = 0; index < 5; index++) {
        //         this.fields.push({name:index+'',label:'label'+index, value:'value'+index})
        //     }
        // }
        
    }
    navigateTo(event){
        let selectedKey=event.currentTarget.dataset.resumeKey;
        var modified =new CustomEvent('resumeselect',
         {detail: { to : selectedKey }}
      );
      console.log("Watch: modified ->"+modified); /*eslint-disable-line*/
      
      this.dispatchEvent(modified);
    
        // fireEvent(this.pageRef, 'NavigateTo', selectedKey); 
    }
}