import { api, LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getInvoices from '@salesforce/apex/RH_Invoice_Controller.getInvoices';
import { labels } from 'c/rh_label';
import { icons } from 'c/rh_icons';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners, fireEvent } from 'c/pubsub';
const EDIT_ACTION='Edit';

export default class Rh_invoice_details extends NavigationMixin(LightningElement) {

    filter = {
        startDate: null,
        endDate: null,
        orderBy: null,
        orderOn: null,
    };
    constants = {};
    isMine;
    currUser = {};
    get isAdmin() { return this.currUser?.isCEO || this.currUser?.isTLeader }
    @api 
    invoice;
    @track invoiceFields = [];
    @api
    action;
    actionAvailable = [];
    @track icon = { ...icons };
    @track l = {
        ...labels,
        SaveNew: 'Save & New',
        Submit: 'Submit',
        Delete: 'Delete',
        Approve: 'Approve',
        AddLines: 'Add Items',
        ExportPDF: 'Export PDF',
        ExportXLS: 'Export XLSX',
        approvalTitle: 'APPROVAL ACTION',
        Date: 'Date',
        startTime: 'Start Time',
        endTime: 'End Time',
        noTimesheetItems: 'No Timesheet Items found for this timesheet. Use the Add times Action to add items',
        // 
        project: 'Project',
        ressource: 'Ressource',
        quantity: 'Quantity',
        amount: 'Amount',
    }

    connectedCallback() {
        console.log('-------------------->', this.invoice); 
        this.buildInvoiceFields();
        this.getInvoices(this.filter);
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
                label: this.l.StartDate,
                name: 'RH_InvoiceDate__c',
                value: this.invoice?.RH_InvoiceDate__c
            },
            {
                label: this.l.EndDate,
                name: 'RH_DueDate__c',
                value: this.invoice?.RH_DueDate__c
            },

            {
                label: this.l.po,
                name: 'RH_Po__c',
                value: this.invoice?.RH_Po__c
            },

            {
                label: this.l.invoice_to,
                name: 'Account',
                value: this.invoice?.RH_Account_Id__r?.Name
            },

            {
                label: this.l.amount,
                name: 'Amount',
                value: this.invoice?.RH_InvoiceItem_Sum__c
            },

        ];
    }

    handleAction(event) {

        const data = event.detail;
        console.log(`data ?? `, JSON.stringify(data));
        if (data?.action == 'goToLink') {
            const record = {
                eltName: data?.eltName,//is the link name
                recordId: data?.info?.dataId// recordid bind to his link
            };
            this.callParent(LINK_ACTION, record)
        } else {
            this.action = event.detail.action;
        }
    }


    get editMode() {
        return this.action == EDIT_ACTION;
    }

    handleActionNew(event) {
        const data = event.detail;
        console.log('data >>', data, ' \n action ', data?.action);
        this.action = data?.action;
        switch (data?.action) {
            case SAVE_ACTION:
                //refresh List
                this.getInvoices();
                break;
            default:
                break;
        }


    }

    getInvoices() {
        this.Invoices = [];
        this.startSpinner(true);
        getInvoices({ filterTxt: JSON.stringify(this.filter) }).then(result => {
            console.log('result @@@ ');
            console.log(result);
            const self = this;
            if (!result.error && result.Ok) {
                this.constants = result.Constants;
                this.isMine = result.isMine;
                this.currUser = {
                    ...result.currentContact,
                    isCEO: result.isCEO,
                    isRHUser: result.isRHUser,
                    isTLeader: result.isTLeader,
                    isBaseUser: result.isBaseUser,
                    isApprover: result.isApprover,
                }
                const isAD = this.isAdmin;
                this.Invoices = result.Invoices.map(function (e) {
                    let item = { ...e };
                    item.title = e.RH_Name__c || e.Name;
                    item.id = e.Id;
                    item.icon = "standard:people";
                    item.class = e.Status;
                    item.account = e.RH_Account_Id__r.Name;
                    item.keysFields = self.keysFields;
                    item.keysLabels = self.keysLabels;
                    item.fieldsToShow = self.fieldsToShow;

                    let Actions = [];


                    item.actions = Actions;
                    console.log(`item`);
                    console.log(item);
                    return item;
                });
                this.setviewsList(this.Invoices)
            } else {
                this.showToast(WARNING_VARIANT, 'ERROR in getting results', result.msg);
            }
        }).catch(e => {
            this.showToast(ERROR_VARIANT, 'ERROR Catch', e.message);
            console.error(e);
        })
            .finally(() => {
                this.startSpinner(false);
            })
    }

    setviewsList(items) {
        let cardsView = this.template.querySelector('c-rh_cards_view');
        cardsView?.setDatas(items);
    }

    showToast(variant, title, message) {
        fireEvent(this.pageRef, 'Toast', { variant, title, message });
    }
    startSpinner(b) {
        fireEvent(this.pageRef, 'Spinner', { start: b });
    }
}