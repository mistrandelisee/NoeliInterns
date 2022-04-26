import { LightningElement,api } from 'lwc';

export default class Rh_success_operation extends LightningElement {

    successImg;
    @api title;
    @api information;
    @api recordid;
    connectedCallback(){
        console.log('information@@@@ ' +this.information);
        console.log('recordid@@@@+++ ' +this.recordid);
        console.log('information@@@@ ' +this.information);
    }

}