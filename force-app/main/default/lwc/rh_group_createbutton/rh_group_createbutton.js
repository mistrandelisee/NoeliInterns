import { LightningElement } from 'lwc';

export default class Rh_group_createbutton extends LightningElement {
    handleClick() {
        this.dispatchEvent(new CustomEvent('creategroup'));
      }
}