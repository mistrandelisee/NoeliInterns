import { api, LightningElement } from 'lwc';
import {icons } from 'c/rh_icons';
export default class Rh_helper_info extends LightningElement {
    icon ={...icons}
    @api
    helpText;

    @api
    isCustom;
    get contentText(){
        return this.isCustom ? '' : this.helpText;
    }
    openToolTip(){
        this.isCustom=true;
    }
}