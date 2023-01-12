import { api, LightningElement, wire } from 'lwc';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

export default class rh_dual_box extends LightningElement {
    @wire(CurrentPageReference) pageRef;
    @api name;
    @api label;
    @api sourceLabel;
    @api selectedLabel;
    @api fieldLevel;
    @api options= [];
    @api values= [];

  
    handleChange(e) {
        console.log(e.detail.value);
        let tab = e.detail.value;
        fireEvent(this.pageRef, 'valueMember', {tab});
    }
}