import { api, LightningElement } from 'lwc';

export default class Rh_members_project_list extends LightningElement {
    @api columns;
    @api memberList;
}