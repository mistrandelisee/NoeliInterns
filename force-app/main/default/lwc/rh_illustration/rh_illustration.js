import { LightningElement,api } from 'lwc';

export default class Rh_illustration extends LightningElement {
    @api message;
    @api title;
    @api type;
    @api size;

    sizeClass;


    fishIllustration=false;

    connectedCallback(){
        if(this.type=='fish'){
            this.fishIllustration=true;
        }
        this.prebuild();
    }

    prebuild(){
        this.sizeClass= this.size=='large'? 'slds-illustration slds-illustration_large' :'slds-illustration slds-illustration_small'
    }
}