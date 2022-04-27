import { LightningElement, api } from 'lwc';
import NAME_FIELD from '@salesforce/schema/Project__c.Name';
import END_DATE_FIELD from '@salesforce/schema/Project__c.End_Date__c';
import DESCRIPTION_FIELD from '@salesforce/schema/Project__c.Description__c';
import LINK_FIELD from '@salesforce/schema/Project__c.Link__c';
import START_DATE_FIELD from '@salesforce/schema/Project__c.Start_Date__c';
import STATUS_FIELD from '@salesforce/schema/Project__c.Status__c';

export default class Rh_edit_project extends LightningElement {

    nameField = NAME_FIELD;
    endDateField = END_DATE_FIELD;
    descriptionField = DESCRIPTION_FIELD;
    linkField = LINK_FIELD;
    startDateField = START_DATE_FIELD;
    statusField = STATUS_FIELD;

    // Flexipage provides recordId and objectApiName
    @api recordId;
    @api objectApiName ='Project__c';
}