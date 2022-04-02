import { LightningElement,api,track } from 'lwc';

export default class Rh_extraFields extends LightningElement {
    isView=true;

    handlechange(){
        this.isView = false;
    }

}