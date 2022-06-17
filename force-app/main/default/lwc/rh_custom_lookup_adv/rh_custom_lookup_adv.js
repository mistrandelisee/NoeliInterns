import lookUp from '@salesforce/apex/RH_CustomLookup_Controller.search';
import { api, LightningElement, track, wire } from 'lwc';


export default class Rh_custom_lookup extends LightningElement {

    @api objName;
    @api readOnly;
    @api selectedId;
    @api fieldLabel;
    @api fieldName;
    @api isRequired;
    @api iconName;
    @api newLabelPrefix='New';
    @api objectLabel;
    @api showAddNew;
    @api filter = '';
    @api searchPlaceholder = 'Search';
    @api selectedName;
    @track records=[];
    @api isValueSelected;
    @track blurTimeout;
    searchTerm;
    errorMessage='';
    //css
    @track boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    @track inputClass = '';
    get newLabel(){ return this.newLabelPrefix+' '+ (this.objectLabel || this.fieldLabel || this.objName) }
    get hasLabel(){ return this.fieldLabel}
    get formClass(){ return this.hasError ? 'slds-form-element slds-has-error' : 'slds-form-element '}
    get hasError (){ return this.errorMessage;}



    @wire(lookUp, { searchTerm: '$searchTerm', myObject: '$objName', filter: '$filter' })
    wiredRecords({ error, data }) {
        if (data) {
            this.error = undefined;
            this.records = data;
        } else if (error) {
            this.error = error;
            console.error(error);
            this.records = undefined;
        }
    }
    handleClick() {
        this.searchTerm = '';
        this.inputClass = 'slds-has-focus';
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open';
    }

    onBlur() {
        this.blurTimeout = setTimeout(() => { this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus' }, 300);
    }

    onSelect(event) {
        let selectedId = event.currentTarget.dataset.id;
        let selectedName = event.currentTarget.dataset.name;
        this.selectedId=selectedId;
        const valueSelectedEvent = new CustomEvent('lookupselected', { detail:{value:selectedId,name:this.fieldName,selectedName:this.selectedName }  });
        this.dispatchEvent(valueSelectedEvent);
        this.isValueSelected = true;
        this.selectedName = selectedName;
        this.errorMessage='';
        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    }

    handleRemovePill() {
        if (!this.readOnly) {
            this.doRemovePill();
        }
    }
    doRemovePill() {
        this.isValueSelected = false;
        this.selectedId=null;
        this.selectedName=null;
    }

    onChange(event) {
        this.searchTerm = event.target.value;
    }
    createNewRecord(evt){
        const createLookupEvent = new CustomEvent('createlookup', { detail:{name:this.fieldName }  });
        this.dispatchEvent(createLookupEvent);
        console.log('CREATE RECORD');
    }
    @api
    validateField(){
        if (this.isRequired) {
            if (!this.isValueSelected) {
                this.errorMessage='This field is required';
            }
            return this.isValueSelected;
        }
        return true;
    }
    @api
    saveField(){
        const isValid=this.validateField();
        
        return {isValid, value: this.selectedId ,fieldName:this.fieldName,selectedName:this.selectedName};
    }

}