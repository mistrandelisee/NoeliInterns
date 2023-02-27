import { LightningElement,api,wire  } from 'lwc';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';


import initExport from '@salesforce/apex/RH_Export_Controller.initExport';
import exportData from '@salesforce/apex/RH_Export_Controller.exportData';

const excelMode='CUSTOM';

export default class Rh_export extends LightningElement {
    
    @wire(CurrentPageReference) pageRef;
    @api provider;
    @api sobject;
    @api items;
    options=[];
    values=[];
    initHeaderFields=[];
    selectedHeaderFields=[];
    
    @api hideBtn= false;
    @api disableBtn= false;
    

    selectedField=[];
    
    isShowModal = false;

    get disableExportBtn(){
       return this.selectedField?.length==0 ? true: false;
    }

    get headerInit() {
        return {
            'PROVIDER': this.provider,
            'SOBJECT': this.sobject
        }
    };

    connectedCallback() {
		registerListener('valueMember', this.handleSelectedExportValues, this);
        this.initialize();
	}

    

    initialize(){
        console.log(`logg----`);
        console.log(this.headerInit);
        initExport({jsonStr: JSON.stringify(this.headerInit)})
        .then(result => {
            if(!result.error){
                // process
                this.initHeaderFields= result.COLUMNS;
                let optionsList=[];
                let defaultSelected=[];
                result.COLUMNS.forEach(elt => {
                    optionsList.push({'label': elt.label, 'value':elt.name})
                    if (elt.selected) {
                        defaultSelected.push(elt.name)
                    }
                });
                this.options=[...optionsList];
                this.values=[...defaultSelected];
                this.selectedField= [...defaultSelected];

                console.log('options : ',this.options);
                console.log('selected values: ', this.values);
            }else{
                console.log('error', result.message);
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    }

    showModalBox() {  
        this.isShowModal = true;
    }

    hideModalBox() {  
        this.isShowModal = false;
    }

    handleSelectedExportValues(event){
        let selected = event.tab;
        this.selectedField=[];
        this.selectedField = [...selected];
    }

    handleExportData(event){
        let recordIds=[];
        let header=[];

        this.items?.forEach(elt => {
            recordIds.push(elt.id);
        });

        if (recordIds.length>0) {
            this.initHeaderFields.forEach(elt=> {
                if (this.selectedField.includes(elt.name)) {
                    header.push(elt);
                }
            });

            this.selectedHeaderFields=[...header];

            const input={
                'COLUMNS':  header,
                'RECORDS_ID': recordIds
            }

            this.export(input);
        } else{
            console.log('error', 'RecordIds'); 
        }
    }

    export(obj){
        exportData({jsonStr: JSON.stringify(obj)})
        .then(result => {
            if(!result.error){
                let exportCmp=this.template.querySelector('c-rh_export_excel');
                let header =  this.selectedHeaderFields.map(elt => {
                    let style= {};
                    try {
                        style=JSON.parse(elt.style);
                    } catch (error) {
                        
                    }
                    return { 'key':elt.name, 'column':  elt.label,style};
                });

                let columns = result.datas;
                
                let exportData=exportCmp?.buildRows(header,columns);
                exportCmp?.setDatas(exportData.rows,exportData.columns);

            }else{
                console.log('error', result.message);
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    }
}