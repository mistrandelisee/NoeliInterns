import { LightningElement,api } from 'lwc';

export default class Rh_group_createbutton extends LightningElement {
    @api label;
    handleClick() {
        this.template.querySelector('c-rh_spinner').start();
        this.dispatchEvent(new CustomEvent('creategroup'));
        window.setTimeout(() => {this.template.querySelector('c-rh_spinner').stop();}, 2000);
      }
}