import { api, LightningElement, wire } from 'lwc';
import { CurrentPageReference , NavigationMixin} from 'lightning/navigation';
export default class Rh_display_field extends NavigationMixin(LightningElement) {
    @wire(CurrentPageReference) pageRef;
    @api
    field;
    get isTextarea(){
        return this.field?.type=='textarea';
    }
    get isCurrency(){
        return this.field?.type=='number' || this.field?.isCurrency;
    }
    get isLink(){
        return this.field?.type=='url' || this.field?.isLink;
    }
    get isDatetime(){
        return this.field?.type=='Datetime' || this.field?.isDatetime;
    }
    get isAddress(){
        return this.field?.type=='address';
    }
    get isEmail(){
        return this.field?.type=='email';
    }
    get isCheckboxGroup(){
        return this.field?.type=='checkbox-group';
    }
    get isBase(){
        return ! (this.isTextarea  || this.isLink || this.isEmail || this.isCurrency || this.isDatetime || this.isAddress || this.isCheckboxGroup);
    }
    goToLink(event){
        console.log(`############################ goToLink`);
       let name=event.currentTarget.dataset.name;
       let info={...this.field};

       if (info?.url) {
            this.navigateToWebPage(info?.url);
       }else{
        var actionEvt =new CustomEvent('action',
            {detail: { action : 'goToLink',eltName: name,info }}
        );
        console.log("Watch: goToLink info  ->"+info); /*eslint-disable-line*/
        
        this.dispatchEvent(actionEvt);
       }
       
    }
    navigateToWebPage(url) {
        // Navigate to a URL
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url
            }
        },
        true // Replaces the current page in your browser history with the URL
      );
    }



}