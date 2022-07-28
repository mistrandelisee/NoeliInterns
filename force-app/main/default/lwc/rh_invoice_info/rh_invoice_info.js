import { api, LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getInvoices from '@salesforce/apex/RH_Invoice_Controller.getInvoices';
import { labels } from 'c/rh_label';
import { icons } from 'c/rh_icons';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners, fireEvent } from 'c/pubsub';
const EDIT_ACTION='Edit';

export default class Rh_invoice_info extends NavigationMixin(LightningElement) {
    get editMode() {
        return this.action == EDIT_ACTION;
    }
    
    @api 
    invoice;
    @track invoiceFields = [];
    @api
    action;
    @api 
    disabledfields;
    actionAvailable = [];
    @track icon = { ...icons };
    @track l = {
        ...labels,
    }

    connectedCallback() {
        console.log('-------------------->', {...this.invoice}); 
        this.buildInvoiceFields();
        this.actionAvailable = [
            {
                variant: "base",
                label: this.l.Edit,
                name: "Edit",
                title: this.l.Edit,
                iconName: this.icon.Edit,
                class: " icon-md slds-m-left_x-small"
            },
        ];
    } 

     @wire(CurrentPageReference) pageRef;
     buildInvoiceFields() {
        this.invoiceFields = [
            {
                label: this.l.Number,
                name: 'RH_Number__c',
                value: this.invoice?.RH_Number__c
            },
            {
                label: this.l.invoice_to,
                name: 'Account',
                value: this.invoice?.RH_Account_Id__r?.Name,
            },

            {
                label: this.l.po,
                name: 'RH_Po__c',
                value: this.invoice?.RH_Po__c
            },


            {
                label: this.l.amount,
                name: 'Amount',
                value: this.invoice?.RH_InvoiceItem_Sum__c,
                isCurrency:true,
                code:this.invoice?.RH_Currency_Code__c,
            },
            {
                label: this.l.StartDate,
                name: 'RH_InvoiceDate__c',
                value: this.invoice?.RH_InvoiceDate__c
            },
            {
                label: this.l.DueDate,
                name: 'RH_DueDate__c',
                value: this.invoice?.RH_DueDate__c
            },

        ];

        this.disabledfields={
            account:this.invoice?.RH_Invoices_Items__r?.length>0,
            po:this.invoice?.RH_Invoices_Items__r?.length>0,
            currency:this.invoice?.RH_Invoices_Items__r?.length>0,
            start:this.invoice?.RH_Invoices_Items__r?.length>0,
            end:this.invoice?.RH_Invoices_Items__r?.length>0,
        }
    }

    handleAction(event) {

        const data = event.detail;
        console.log(`data ?? `, JSON.stringify(data));
        if (data?.action == 'goToLink') {
            const record = {
                eltName: data?.eltName,//is the link name
                recordId: data?.info?.dataId// recordid bind to his link
            };
            // this.callParent(LINK_ACTION, record)
        } else {//is edit
            this.action = event.detail.action;
        }
    }
    handleActionNew(event){
        this.action = event.detail?.action;
    }


   

   

    

    showToast(variant, title, message) {
        fireEvent(this.pageRef, 'Toast', { variant, title, message });
    }
    startSpinner(b) {
        fireEvent(this.pageRef, 'Spinner', { start: b });
    }
}