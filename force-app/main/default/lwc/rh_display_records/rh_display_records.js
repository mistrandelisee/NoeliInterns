import { LightningElement, api } from 'lwc';

export default class Rh_display_records extends LightningElement {
    @api records = [
        {"Name":"new mistrel","Email":"kafehisevou-3096@yopmail.com","Id":"0037Q000007HpbqQAC"},
        {"Name":"new mistrel1","Email":"kafehisevou-3096@yopmail.com","Id":"0037Q000007HpbqQAC"},
        {"Name":"new mistrel2","Email":"kafehisevou-3096@yopmail.com","Id":"0037Q000007HpbqQAC"},
        {"Name":"new mistrel3","Email":"kafehisevou-3096@yopmail.com","Id":"0037Q000007HpbqQAC"},
        ];


        @api handleChange(e) {
            return e.currentTarget.getAttribute("data-id");
        }
}