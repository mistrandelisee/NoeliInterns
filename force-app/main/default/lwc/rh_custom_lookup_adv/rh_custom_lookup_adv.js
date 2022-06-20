import lookUp from '@salesforce/apex/RH_CustomLookup_Controller.search';
import SearchRecords from '@salesforce/apex/RH_CustomLookup_Controller.SearchRecords';
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
    @api optionnal;
    @api disabled;
    @api returnFields;//['Name']
    renderedCallback(){
        console.log('is selected ', this.isValueSelected);
    }
    get _returnFields(){
        return this.returnFields || this.optionnal?.returnFields;
    };
    get _disabled(){
        return this.disabled || this.optionnal?.disabled;
    };
    
    @api queryFields;//['Name'] /**field in with you will query the serch term */
    get _queryFields(){
        return this.queryFields || this.optionnal?.queryFields;
    };
    @api sortColumn;
    get _sortColumn(){
        return this.sortColumn || this.optionnal?.sortColumn;
    };
    @api sortOrder;
    get _sortOrder(){
        return this.sortOrder || this.optionnal?.sortOrder;
    };
    @api limit;
    get _limit(){
        return this.limit || this.optionnal?.limit;
    };
    @api fieldMapping;
    get _fieldMapping(){
        return this.fieldMapping || this.optionnal?.fieldMapping;
    };
    @api nameField='Name';
    @api idField='Id';
    @api searchTimeout;
    searchTimer;
    searchTerm;
    errorMessage='';
    isSearching;
    //css
    @track boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    @track inputClass = '';
    get newLabel(){ return this.newLabelPrefix+' '+ (this.objectLabel || this.fieldLabel || this.objName) }
    get hasLabel(){ return this.fieldLabel}
    get formClass(){ return this.hasError ? 'slds-form-element slds-has-error' : 'slds-form-element '}
    get hasError (){ return this.errorMessage;}



   /* @wire(lookUp, { searchTerm: '$searchTerm', myObject: '$objName', filter: '$filter' })
    wiredRecords({ error, data }) {
        if (data) {
            this.error = undefined;
            this.records = data;
        } else if (error) {
            this.error = error;
            console.error(error);
            this.records = undefined;
        }
    }*/
    connectedCallback(){
        
        this.getRecords();
    }
    getRecords() {
        if (!this._disabled) {
            this.getRecordsApex();
        }
        
        
    }
    getRecordsApex(){
        this.isSearching=true;
        SearchRecords({
            'ObjectName' : this.objName,
            'ReturnFields' :  this._returnFields,
            'QueryFields' :  this._queryFields,
            'SearchText': this.searchTerm || '',
            'SortColumn' : this._sortColumn,
            'SortOrder' : this._sortOrder,
            'MaxResults' : this._limit,
            'Filter' : this.filter
         })
          .then(result => {
            console.log('ResultSearch');
            console.log( result);

            if (!result.error && result.Ok) {
                
                this.error = undefined;
                this.records = this.formatResponse(result.Records);
                console.log('ResultFromated');
                console.log( this.records);
            }else{
                this.errorMessage=result.msg;
            }
          })
          .catch(error => {
            this.error = error;
            console.error(error);
            this.records = [];
            this.errorMessage=error;
        })
        .finally(() => {
            this.isSearching=false;
        });
    }
    formatResponse(result){
        this.fieldMapping=this._fieldMapping?.length>0 ? this.fieldMapping : [{field:'Id',label:'Name'}] ;

        const mappings=this._fieldMapping;
        console.log(JSON.stringify(mappings));
        const mapInputs=new Map();
        const self = this;
        result.forEach(record => {

            mappings.forEach(mapping => {
                let Name=self.getValue(mapping.label,record);
                let Id=self.getValue(mapping.field,record);
                // records.push({Name,Id})
                mapInputs.set(Id, {Name,Id}) ;

            
            });

            
        });
        return Array.from(mapInputs.values());
        
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
        
        const delay=+this.searchTimeout || 1000;
        clearTimeout(this.searchTimer);
        this.searchTimer=setTimeout(() => {
            this.getRecords();
        }, delay);//2000
        
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
    getValue(field,obj){ // field == 'account.Name' obj={account:{Name: 'ACCOUNT VIP'}}  ===> 'ACCOUNT VIP'
        let fields=field.split('.');//multilevel object
        let value=obj;
        while(fields.length>0 && value){
            let infield=fields.shift();
            value=value[infield];
        }
        return value
    }
    @api updateField(item){
        console.log(`%%%%%%%%%%%% updateField `,{...item} );
        this.objName=item.objName ;
        this.searchPlaceholder=item.placeholder;
        this.iconName=item.iconName;
        this.newLabelPrefix=item.newLabel ;
        this.fieldLabel=item.label;
        this.fieldName=item.name  ;
        this.objectLabel=item.objectLabel;
        this.filter=item.filter;
        this.selectedId=item.value;
        this.selectedName=item.selectName;
        this.isValueSelected=item.isSelected;
        this.showAddNew=item.enableCreate;
        this.readOnly=item.readOnly;
        this.isRequired=item.required;
        this.optionnal=item;
        this.getRecords();
        return true;
    }

}