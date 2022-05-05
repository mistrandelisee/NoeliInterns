import { api, LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
import { labels } from 'c/rh_label';
export default class Rh_confirmation_modal extends LightningElement {
    l={...labels}
    @wire(CurrentPageReference) pageRef;
    @api
    actionAvailable;
    @api
    richText;
    @api
    styleCss;
    @api
    styleClass;
    @api
    title;
    get hasTitle(){
        return this.title;
    }
    connectedCallback() {
        this.initCSS();
    }
    initCSS() {
        this.styleClass='slds-modal__container '+(this.styleClass?this.styleClass:'');
        this.styleCss=''+ (this.styleCss?this.styleCss:'');
    }
    handleFooterActions(event){
        console.log('handleDetailsActions :', event.detail.action);
        const action=event.detail.action;
        fireEvent(this.pageRef, 'ModalAction', {action});
    }
    
    cancelRequest(event){
        const action = event.currentTarget.dataset.actionName;
        fireEvent(this.pageRef, 'ModalAction', {action});
    }
}