import { LightningElement } from 'lwc';

export default class Rh_custom_lookup_parent extends LightningElement {

    handleAccountSelection(event) {
        console.log("the selected record id is" + event.detail);
    }
}