import { api, LightningElement, track } from 'lwc';

export default class Rh_spinner extends LightningElement {
    @track isSpinner;

    @api
    start() {
        this.isSpinner = true;
    }

    @api
    stop() {
        this.isSpinner = false;
    }
}