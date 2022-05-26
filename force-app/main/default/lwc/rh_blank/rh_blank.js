import { api, LightningElement } from 'lwc';

export default class Rh_blank extends LightningElement {
    @api cheight='50';

    get cssStyle(){
        return this.cheight ? `height:${this.cheight};` :`height:50px;`;
    }
}