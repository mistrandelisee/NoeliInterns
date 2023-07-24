import { LightningElement,api,wire  } from 'lwc';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import LightningPrompt from 'lightning/prompt';

import initExport from '@salesforce/apex/RH_Export_Controller.initExport';
import exportData from '@salesforce/apex/RH_Export_Controller.exportData';

import { labels } from 'c/rh_label';
import { icons } from 'c/rh_icons';

const excelMode='CUSTOM';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';


const ERROR_VARIANT='error';

export default class Rh_export extends LightningElement {
    
    @wire(CurrentPageReference) pageRef;
    @api provider;
    @api sobject;
    @api items;
    @api filename;
    l={...labels, }
    icon={...icons}
    options=[];
    values=[];
    // initHeaderFields=[];
    selectedHeaderFields=[];
    
    @api hideBtn= false;
    @api disableBtn= false;
    

    selectedField=[];
    
    isShowModal = false;


    mapHeaders=new Map();
    get disableExportBtn(){
       return this.selectedField?.length==0 ? true: false;
    }

    get headerInit() {
        return {
            'PROVIDER': this.provider,
            'SOBJECT': this.sobject
        }
    };
    get _filename(){
        return this.filename || 'Export_data'+(this.sobject|| '')+'_'+(new Date().getTime());
    }
    get initHeaderFields(){
        return  Array.from(this.mapHeaders.values()) || [];
    }

    connectedCallback() {
		registerListener('valueMember', this.handleSelectedExportValues, this);
	}

    

    initialize(){
        console.log(`logg----`);
        console.log(this.headerInit);
        this.startSpinner(true);
        initExport({jsonStr: JSON.stringify(this.headerInit)})
        .then(result => {
            if(!result.error){
                // process
                this.mapHeaders=new Map();
                const self = this;
                // this.initHeaderFields= result.COLUMNS;
                let optionsList=[];
                let defaultSelected=[];
                result.COLUMNS.forEach(elt => {
                    const col={...elt}
                    const label= col.label?.replace('!','');
                    col.label= col.label?.includes('!') ? ( self.l[label] || label) : label;

                    optionsList.push({'label': col.label, 'value':col.name})
                    if (col.selected) {
                        defaultSelected.push(elt.name)
                    }
                    self.mapHeaders.set(col.name,col)
                });
                this.options=[...optionsList];
                this.values=[...defaultSelected];
                this.selectedField= [...defaultSelected];

                console.log('options : ',this.options);
                console.log('selected values: ', this.values);
            }else{
                console.log('error', result.message);
                this.showToast(ERROR_VARIANT,this.l.errorOp, result.message);
            }
        }).catch(error => {
            console.error('Error:', error);
            this.showToast(ERROR_VARIANT,this.l.errorOp, error);
        })
        .finally(() => {
            this.isShowModal = true;
            this.startSpinner(false);
        });
    }

    showModalBox() {  
        // this.isShowModal = true;
        this.initialize();
    }

    hideModalBox() {  
        this.isShowModal = false;
    }

    handleSelectedExportValues(event){
        let selected = event.tab;
        this.selectedField=[];
        this.selectedField = [...selected];
    }
    handlePromptClick() {
        LightningPrompt.open({
            message: this.l.FileName,
            //theme defaults to "default"
            label: 'Please Respond', // this is the header text
            defaultValue: this._filename, //this is optional
        }).then((result) => {
            //Prompt has been closed
            //result is input text if OK clicked
            //and null if cancel was clicked
            if(result){
                this.filename=result;
                this.doExportData();
            }
        });
    }
    handleExportData(event){
        if(! this.filename){
            this.handlePromptClick();
        }else{
            this.doExportData();
        }
    }
    doExportData(event){
        // let recordIds=[];
        // let header=[];

        // this.items?.forEach(elt => {
        //     recordIds.push(elt.id);
        // });
        this.selectedHeaderFields=[]
        const recordIds=this.items?.map(elt => elt.id);
        if (recordIds.length>0) {
            // this.initHeaderFields.forEach(elt=> {
            //     if (this.selectedField.includes(elt.name)) {
            //         header.push(elt);
            //     }
            // });
            this.selectedField.forEach(key=> {
                const col=this.mapHeaders.get(key);
                if (!!col) {
                    this.selectedHeaderFields.push(col);
                }
            });
            // this.selectedHeaderFields=this.initHeaderFields.filter((elt)=>this.selectedField.includes(elt.name));
            // this.selectedHeaderFields=[...header];

            const input={
                // 'COLUMNS':  header,
                'COLUMNS':  [...this.selectedHeaderFields],
                'RECORDS_ID': recordIds,
                'PROVIDER': this.provider,
                'SOBJECT': this.sobject
            }

            this.export(input);
        } else{
            console.log('error', 'RecordIds'); 
            this.showToast(ERROR_VARIANT,this.l.errorOp, 'no items');
        }
    }

    export(obj){
        console.log('export input');
        console.log(obj);
        this.startSpinner(true);
        exportData({jsonStr: JSON.stringify(obj)})
        .then(result => {
            if(!result.error){
                let exportCmp=this.template.querySelector('c-rh_export_excel');
                let header =  this.selectedHeaderFields.map(elt => {
                    let style= {};
                    let rowStyle= {};
                    try {
                        style=JSON.parse(elt.style);
                        rowStyle=JSON.parse(elt.rowStyle);
                    } catch (error) {
                        
                    }
                    return { 'key':elt.name, 'column':  elt.label,style,rowStyle};
                });

                let columns = result.datas;
                
                let exportData=exportCmp?.buildRows(header,columns);

                let cols=exportData.columns;
                if(header[0].style?.width){
                    cols=header.map((x)=>{  
                        return {width:x.style?.width|| 20}
                    });
                }
                exportCmp?.setDatas(exportData.rows,cols);

            }else{
                console.log('error', result.message);
                this.showToast(ERROR_VARIANT,this.l.errorOp, result.message);
            }
        }).catch(error => {
            console.error('Error:', error);
            this.showToast(ERROR_VARIANT,this.l.errorOp, error);
        })
        .finally(() => {
            this.startSpinner(false);
        });;
    }
    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
     }
     showToast(variant, title, message){
         fireEvent(this.pageRef, 'Toast', {variant, title, message});
     }
}