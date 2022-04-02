import { LightningElement, track } from 'lwc';
// import getDatas from '@salesforce/apex/formcontroller.getdatas';
const SEARCH_UNSELECTEDCLASS = 'slds-button_icon slds-button_icon-inverse slds-align_absolute-center';
const SEARCH_SELECTEDCLASS = 'slds-button_icon slds-button_icon-inverse slds-align_absolute-center SearchIcon';
const OPTION_SELECTEDCLASS = 'slds-listbox__option slds-listbox__option_plain slds-media slds-media_small slds-media_inline slds-is-selected';
const OPTION_UNSELECTEDCLASS = 'slds-listbox__option slds-listbox__option_plain slds-media slds-media_small slds-media_inline ';


import PO2_NoRequests from "@salesforce/label/c.PO2_NoRequests";
import PO2_CodiceComunicazioneOperatore from "@salesforce/label/c.PO2_CodiceComunicazioneOperatore";
import PO2_Motivo_Apertura from "@salesforce/label/c.PO2_Motivo_Apertura";
import PO2_Data_Creazione from "@salesforce/label/c.PO2_Data_Creazione";
import PO2_Scrolla_Per_Caricare from '@salesforce/label/c.PO2_Scrolla_Per_Caricare'
import PO2_No_More_Data from '@salesforce/label/c.PO2_No_More_Data';

import PO2_RichiesteInoltrate from "@salesforce/label/c.PO2_RichiesteInoltrate";
import PO2_StatoOrdine from "@salesforce/label/c.PO2_StatoOrdine";
import PO2_Cerca from "@salesforce/label/c.PO2_Cerca";
import PO2_Esporta_xlsx from "@salesforce/label/c.PO2_Esporta_xlsx";
import PO2_DataCreazioneDa from "@salesforce/label/c.PO2_DataCreazioneDa";
import PO2_DataCreazioneA from "@salesforce/label/c.PO2_DataCreazioneA";
import PO2_In_Lavorazione from '@salesforce/label/c.PO2_In_Lavorazione';
import PO2_Chiuso from '@salesforce/label/c.PO2_Chiuso';
import PO2_Scartato from '@salesforce/label/c.PO2_Scartato';
import PO2_Annullato from '@salesforce/label/c.PO2_Annullato';
import PO2_In_Verifica from '@salesforce/label/c.PO2_In_Verifica';
import PO2_InterruzioneCircuito from '@salesforce/label/c.PO2_InterruzioneCircuito';
import PO2_AttenuazioneNorma from '@salesforce/label/c.PO2_AttenuazioneNorma';
import PO2_ConnesioneInstabile from '@salesforce/label/c.PO2_ConnesioneInstabile';
import PO2_ParametroPerformance from '@salesforce/label/c.PO2_ParametroPerformance';
import PO2_ApparatiGuasti from '@salesforce/label/c.PO2_ApparatiGuasti';
import PO2_RichiestaServizi from '@salesforce/label/c.PO2_RichiestaServizi';
import PO2_RichiestaServiziPOP from '@salesforce/label/c.PO2_RichiestaServiziPOP';
import PO2_MancataNavigazione from '@salesforce/label/c.PO2_MancataNavigazione';
import PO2_Nessuno from '@salesforce/label/c.PO2_Nessuno';
import PO2_ScartoPacchetti from '@salesforce/label/c.PO2_ScartoPacchetti';
import PO2_Categoria_Segnalazione from '@salesforce/label/c.PO2_Categoria_Segnalazione'; //2020_1_0093 START
import PO2_Disservizio from '@salesforce/label/c.PO2_Disservizio';
import PO2_Servizi_Aggiuntivi from '@salesforce/label/c.PO2_Servizi_Aggiuntivi';
import PO2_Degrado from '@salesforce/label/c.PO2_Degrado'; //2020_1_0093 END
import PO2_In_Annullamento from '@salesforce/label/c.PO2_In_Annullamento';
import PO2_RichiestaChiusura from '@salesforce/label/c.PO2_RichiestaChiusura';
import PO2_Sospeso from '@salesforce/label/c.PO2_Sospeso';

//Metodo per recuperare i record inseriti
import getServiceNL from '@salesforce/apex/po2_assurance_reqInsInoltrate_Ctrl.getServiceNL';
import getExport from '@salesforce/apex/po2_assurance_reqInsInoltrate_Ctrl.getExport';

export default class Po2nl_assurance_richiesteInseriteInoltrate extends LightningElement {
    // -------------------
    defaultPageSize = 5;
    indexes_length = 4;
    @track SearchValues = [];
    @track filterBozzaPills = [];
    @track filterInoltatePills = [];

    label = {
        PO2_NoRequests,
        PO2_CodiceComunicazioneOperatore,
        PO2_Motivo_Apertura,
        PO2_Data_Creazione,

        PO2_RichiesteInoltrate,
        PO2_StatoOrdine,
        PO2_Cerca,
        PO2_Esporta_xlsx,
        PO2_DataCreazioneDa,
        PO2_DataCreazioneA,
        PO2_In_Lavorazione,
        PO2_Chiuso,
        PO2_Scartato,
        PO2_Annullato,
        PO2_In_Verifica,
        PO2_InterruzioneCircuito,
        PO2_AttenuazioneNorma,
        PO2_ConnesioneInstabile,
        PO2_ParametroPerformance,
        PO2_ApparatiGuasti,
        PO2_RichiestaServizi,
        PO2_RichiestaServiziPOP,
        PO2_MancataNavigazione,
        PO2_Nessuno,
        PO2_ScartoPacchetti,
        PO2_No_More_Data,
        PO2_Scrolla_Per_Caricare,
        PO2_Categoria_Segnalazione,
        PO2_Disservizio,
        PO2_Degrado,
        PO2_Servizi_Aggiuntivi,
        PO2_In_Annullamento,
        PO2_RichiestaChiusura,
        PO2_Sospeso
    }

    inoltrateColumns = [
        {
            label: this.label.PO2_CodiceComunicazioneOperatore,
            type: 'button',
            fieldName: 'codiceComunicazioneOLO',
            typeAttributes:
            {
                label: { fieldName: 'codiceComunicazioneOLO' },
                variant: 'base',
                value: 'codiceComunicazioneOLO',
                name: 'CodiceOrdine',
            }
        },
        {
            label: this.label.PO2_Data_Creazione,
            fieldName: "dataCreazione",
            type: "date",
            typeAttributes:{
                day:"2-digit",
                month:"2-digit",
                year:"2-digit"
            }
        },
        {
            label: this.label.PO2_Motivo_Apertura,
            fieldName: "motivoApertura",
            type: "text"
        },
        //2020_1_0093 START
        {
            label: this.label.PO2_Categoria_Segnalazione,
            fieldName: "categoriaSegnalazione",
            type: "text"
        },
        //2020_1_0093 END
        {
            label: this.label.PO2_StatoOrdine,
            fieldName: "statoOrdine",
            type: "text"
        },
        //2020_1_0257 START
        {
            label: 'Causale Sospensione',
            fieldName: "causaleSospensione",
            type: "text"
        },
        {
            label: 'Motivazione Sospensione',
            fieldName: "motivazioneSospensione",
            type: "text"
        },
        {
            label: 'Id Notifica',
            fieldName: "idNotifica",
            type: "text"
        }
        //2020_1_0257 END
    ];
    @track lastDate = null;
    @track inoltrateRichieste = [];
    @track filtrinoltare = {
        codOlo: '',
        motivoApe: '',
        statoOrdine: '',
        catSegn: '', //2020_1_0093
        dataCreazione: null,
        cauSosp: '',//2020_1_0257
        motivSosp: '',//2020_1_0257
        idNotify: ''//2020_1_0257
    }
    options = [
        {
            value: this.label.PO2_CodiceComunicazioneOperatore,
            key: 'codiceComunicazioneOLO', 
            selecdOptionStyle: OPTION_UNSELECTEDCLASS
        },
        {
            value: this.label.PO2_Data_Creazione,
            key: "dataCreazione",
            selecdOptionStyle: OPTION_UNSELECTEDCLASS
        },
        {
            value: this.label.PO2_Motivo_Apertura,
            key: "motivoApertura",
            selecdOptionStyle: OPTION_UNSELECTEDCLASS
        },
        {
            value: this.label.PO2_Categoria_Segnalazione,
            key: "categoriaSegnalazione",
            selecdOptionStyle: OPTION_UNSELECTEDCLASS
        },
        {
            value: this.label.PO2_StatoOrdine,
            key: "statoOrdine",
            selecdOptionStyle: OPTION_UNSELECTEDCLASS
        },
        {
            value: 'Causale Sospensione',
            key: "causaleSospensione",
            selecdOptionStyle: OPTION_UNSELECTEDCLASS
        },
        {
            value: 'Motivazione Sospensione',
            key: "motivazioneSospensione",
            selecdOptionStyle: OPTION_UNSELECTEDCLASS
        },
        {
            value: 'Id Notifica',
            key: "idNotifica",
            selecdOptionStyle: OPTION_UNSELECTEDCLASS
        }
            ];
    selectedOptions = [];
    hideContent = true;
    hideEsportaBox = false;
    selectedTab = 1;
    searchSectionVisible;
    isloading=false;
    connectedCallback(){
        const size=this.defaultPageSize*this.indexes_length;
        this.getInoltrateRichieste(size+1,0,false,false)
    }

    get searchIconClass() {
        return this.searchSectionVisible && this.isTab1Selected ? SEARCH_SELECTEDCLASS : SEARCH_UNSELECTEDCLASS
    }
    get hasInoltrateRichieste(){
        return this.inoltrateRichieste.length > 0;
    }
    get optStatoOrdine() {
        return [
            { label: this.label.PO2_Nessuno, value: "" },
            { label: this.label.PO2_In_Lavorazione, value: "In Lavorazione" },
            { label: this.label.PO2_Chiuso, value: "Chiuso" },
            { label: this.label.PO2_Scartato, value: "Scartato" },
            { label: this.label.PO2_Annullato, value: "Annullato" },
            { label: this.label.PO2_In_Verifica, value: "In Verifica" },
            { label: this.label.PO2_In_Annullamento, value: "In Annullamento" },
            { label: this.label.PO2_RichiestaChiusura, value: "Richiesta Chiusura" },
            { label: this.label.PO2_Sospeso, value: "Sospeso" }
        ]
    }

    get optCausaleApertura() {
        return [
            { label: this.label.PO2_Nessuno, value: "" },
            { label: this.label.PO2_InterruzioneCircuito, value: "001" },
            { label: this.label.PO2_AttenuazioneNorma, value: "002" },
            { label: this.label.PO2_ConnesioneInstabile, value: "003" },
            { label: this.label.PO2_ParametroPerformance, value: "004" },
            { label: this.label.PO2_ScartoPacchetti, value: "005" },
            { label: this.label.PO2_ApparatiGuasti, value: "006" },
            { label: this.label.PO2_RichiestaServizi, value: "007" },
            { label: this.label.PO2_RichiestaServiziPOP, value: "008" },
            { label: this.label.PO2_MancataNavigazione, value: "009" },
        ]
    }
    get optCatSegnalazione() {
        return [
            { label: this.label.PO2_Nessuno, value: "" },
            { label: this.label.PO2_Disservizio, value: "01" },
            { label: this.label.PO2_Degrado, value: "02" },
            { label: this.label.PO2_Servizi_Aggiuntivi, value: "03" },
        ]
    }
    get hasfilterInoltate(){
       return this.filterInoltatePills.length > 0;
    }
    getInoltrateRichieste(pSize,pOffset,refresh,filter){
        this.isloading=true;
        getServiceNL({
            codOlo: this.filtrinoltare.codOlo,
            motivoApe: this.filtrinoltare.motivoApe,
            catSegn: this.filtrinoltare.catSegn,//2020_1_0093
            statoOrdine: this.filtrinoltare.statoOrdine,
            dataCreazione: this.filtrinoltare.dataCreazione,
            cauSosp: this.filtrinoltare.cauSosp,//2020_1_0257
            motivSosp: this.filtrinoltare.motivSosp,//2020_1_0257
            idNotify: this.filtrinoltare.idNotify,//2020_1_0257
            lastDate: this.lastDate,
            qLimit:pSize,
            qOffset:pOffset
        })
        .then(result => {
            this.inoltrateRichieste = result;
            let N= result?.length || 0;
            if (refresh) this.refreshChild('inoltrate', N,filter );
            console.log('Result getInoltrateRichieste', result);
        })
        .catch(error => {
            console.error('Error: getInoltrateRichieste', error);
        }).finally(()=>{
            this.isloading=false;
        })
        ;
    }
    refreshChild(type,N,filter){
        let formTable=this.template.querySelector(`c-po2nl_form_datatable[data-type="${type}"]`);
        console.log('OUTPUT : ',formTable);
        if (formTable) {
            formTable.refreshPageIndexes('PARENT',N,filter);
        }
    }

    buildTable(event){
        let sizeTable=+event.detail.size || this.defaultPageSize;
        let offsetTable=+event.detail.offset || 0;
        this.getInoltrateRichieste(sizeTable+1,offsetTable,true,false)
    }

    //control search bar
    handleSearchBox() {
        if (!this.hideEsportaBox) {
            this.searchSectionVisible = !this.searchSectionVisible;
        }
    }

    //function add option 
    handleAdd(event) {
        debugger
        this.selectedOptions = [...this.selectedOptions, ...this.options.filter(
            option => option.selecdOptionStyle == OPTION_SELECTEDCLASS
        ).map(option => (
            { ...option, selecdOptionStyle: OPTION_UNSELECTEDCLASS }
        ))]
        this.options = this.options.filter(option => option.selecdOptionStyle != OPTION_SELECTEDCLASS)
    }

    //function remove option
    handleRemoved(event) {
        this.options = [...this.options, ...this.selectedOptions.filter(
            option => option.selecdOptionStyle == OPTION_SELECTEDCLASS
        ).map(option => (
            { ...option, selecdOptionStyle: OPTION_UNSELECTEDCLASS }
        ))]
        this.selectedOptions = this.selectedOptions.filter(option => option.selecdOptionStyle != OPTION_SELECTEDCLASS)
    }

    handleSelectedOptionDisponibile(event) {
        const valueSelected = event.currentTarget.title;
        this.options = this.options.map(option => ({
            ...option, selecdOptionStyle: option.value == valueSelected ? (
                option.selecdOptionStyle == OPTION_UNSELECTEDCLASS ? OPTION_SELECTEDCLASS : OPTION_UNSELECTEDCLASS
            ) : option.selecdOptionStyle
        }));
    }

    handleSelectedOptionSelezionato(event) {
        const valueSelected = event.currentTarget.title;
        this.selectedOptions = this.selectedOptions.map(option => ({
            ...option, selecdOptionStyle: option.value == valueSelected ? (
                option.selecdOptionStyle == OPTION_UNSELECTEDCLASS ? OPTION_SELECTEDCLASS : OPTION_UNSELECTEDCLASS
            ) : option.selecdOptionStyle
        }));
    }

    handleEsportaBox(event) {
        this.hideEsportaBox = this.hideEsportaBox ? false : true;
    }


    handleSearch(event) {
        const sourceType = event.target.dataset.type;
        console.log("source type==> "+ sourceType);
        let toSave = [
            ...this.template.querySelectorAll("lightning-input"),
            ...this.template.querySelectorAll("lightning-combobox")
        ];
    console.log('@@@@@@tosave before ', toSave);
        this.filterInoltatePills=[];
        toSave.forEach(el => {
            let value =el.value;

            switch (el.dataset.id) {
                case 'codOlo':
                    this.filtrinoltare.codOlo = el.value;
                    break;
                case 'dataCreazione':
                    this.filtrinoltare.dataCreazione = el.value? new Date(el.value).toJSON(): null;
                    this.filtrinoltare.dataCreazioneD = el.value;
                    break;
                case 'motivoApe':
                    this.filtrinoltare.motivoApe = el.value;
                    value= el.value ? this.findMotivoApertura(el.value): "";//get the label
                    break;
                //2020_1_0093 START
                case 'catSegn':
                    value = el.value? this.findCatSegnalazione(el.value): "";//get the label
                    this.filtrinoltare.catSegn = el.value;
                    break;
                case 'statoOrdine':
                    this.filtrinoltare.statoOrdine = el.value? el.value: "";
                    break;
                //2020_1_0257 START
                case 'cauSosp':
                    this.filtrinoltare.cauSosp = el.value;
                    break;
                case 'motivSosp':
                    this.filtrinoltare.motivSosp = el.value;
                    break;
                case 'idNotify':
                    this.filtrinoltare.idNotify = el.value;
                    break;
                    //2020_1_0257 END
                default:
                    break;
            }
            if (value) this.filterInoltatePills.push({ key: el.label,value, remove: false});

        }) 
        console.log(' onrsearch current bozza filtri==> ',this.filtrinoltare);
        const size=this.defaultPageSize*this.indexes_length;
        this.getInoltrateRichieste(size+1,0,true,true)

        console.log('@@@@@@tosave after ', JSON.stringify(toSave))
    }
    handleReset(event) {
        const size=this.defaultPageSize*this.indexes_length;
        this.SearchValues = [];
        this.filterInoltatePills=[];
        this.filtrinoltare = {
            codOlo: '',
            motivoApe: '',
            statoOrdine: '',
            catSegn: '', //2020_1_0093
            dataCreazione: null,
            cauSosp: '',//2020_1_0257
            motivSosp: '',//2020_1_0257
            idNotify: ''//2020_1_0257
        }
        this.getInoltrateRichieste(size+1,0,true,true);
    }
    handleRemovePill(event) {
        const label = event.detail.name || event.currentTarget.name;
        console.log('label==>', label);
        this.filterInoltatePills.forEach(e => {
            if (e.key == label) {
                e.remove = true;
            }
        })
        switch(label){
            case PO2_CodiceComunicazioneOperatore:
                this.filtrinoltare.codOlo = "";
                break;
            case PO2_Data_Creazione:
                this.filtrinoltare.dataCreazione = null;
                this.filtrinoltare.dataCreazioneD = null;
                break;
            case PO2_Motivo_Apertura:
                this.filtrinoltare.motivoApe = "";
                break;
            case PO2_Categoria_Segnalazione:
                this.filtrinoltare.catSegn ="";
                break;
            case PO2_StatoOrdine:
                this.filtrinoltare.statoOrdine = "";
                    break;
            case "Causale Sospensione":
                this.filtrinoltare.cauSosp = "";
                break;
            case "Motivazione Sospensione":
                this.filtrinoltare.motivSosp = "";
                break;
            case "Id Notifica":
                this.filtrinoltare.idNotify ="";
                break;
            default:
                break;
        }
        console.log('onremove filtrinoltare==> ', this.filtrinoltare);
        const size=this.defaultPageSize*this.indexes_length;
        this.getInoltrateRichieste(size+1,0,true,true);
    }

    handleEportaCsv(event) {
        if (this.selectedOptions.length > 0) {
            console.log(this.selectedOptions);
            getExport({
                codOlo: this.filtrinoltare.codOlo,
                motivoApe: this.filtrinoltare.motivoApe,
                catSegn: this.filtrinoltare.catSegn,//2020_1_0093
                statoOrdine: this.filtrinoltare.statoOrdine,
                dataCreazione: this.filtrinoltare.dataCreazione,
                cauSosp: this.filtrinoltare.cauSosp,//2020_1_0257
                motivSosp: this.filtrinoltare.motivSosp,//2020_1_0257
                idNotify: this.filtrinoltare.idNotify//2020_1_0257
            }).then(result => {
                if (result && result.length > 0) {
                    this.exportList = result;
                    this.exportCsv();
                }
            }).catch(e => {
                // eslint-disable-next-line no-console
                console.log(e);
            })
        }
    }
    //METODI PER L'ESPORTA CSV
    exportCsv() {
        console.log(this.exportList);
        let headers= this.getExportHeader(this.selectedOptions);
        this.csv = this.convertArrayOfObjectsToCSV(this.exportList,headers);
        var myblob = new Blob([this.csv]);
        var filename = 'Elenco Richieste Inserite';
        var extension = 'csv';
        this.downloadFile(myblob, filename, extension);
    }
    getExportHeader(header){
        let keys=[];
        let labels=[];
        header.forEach(column => {
            labels.push(column.value);
            keys.push(column.key);
        });
        return {labels , keys};
    }
    convertArrayOfObjectsToCSV(objectRecords,headers) {
        var headerArray = headers.labels;
        var keyArray = headers.keys;
        var csvStringResult, counter, keys, columnDivider, lineDivider, masterkey;
        if (objectRecords == null || !objectRecords.length) {
            return null;
        }
        columnDivider = ';';
        lineDivider = '\n';
        masterkey = headerArray;
        keys = keyArray;
        csvStringResult = '';
        csvStringResult += masterkey.join(columnDivider);
        csvStringResult += lineDivider;
        for (var i = 0; i < objectRecords.length; i++) {
            counter = 0;
            for (var sTempkey in keys) {
                var skey = keys[sTempkey];
                if (counter > 0) {
                    csvStringResult += columnDivider;
                }
                csvStringResult += '"' + (objectRecords[i][skey] != undefined ? objectRecords[i][skey] : '') + '"';
                counter++;
            }
            csvStringResult += lineDivider;
        }
        return csvStringResult;

    }
    downloadFile(blob, filename, extension) {
        var blobURL = URL.createObjectURL(blob);
        if (typeof window.navigator.msSaveBlob === "function") {
            window.navigator.msSaveBlob(blob, filename + "." + extension);
        } else {
            var link = document.createElement('a');
            link.setAttribute('href', blobURL);
            link.setAttribute('download', filename + "." + extension);
            link.setAttribute('target', '_self');
            document.body.appendChild(link);
            link.click();
        }
        setTimeout(() => {
            window.open('', '_self').close();
        }, 1000);

    }
    //FINE METODI PER L'ESPORTA CSV

    handleRequestSelected(event){
        const eventResult = event.detail.sLogId;       
        const eventToFire = new CustomEvent(
            'requestselected', 
            {
                'detail' : {
                            'sLogId' : eventResult
                            }
                
            }
        ); 
        this.dispatchEvent(eventToFire);
    }
     findCatSegnalazione(value) {
        switch (value) {
            case "01":
                return 'Disservizio';
            case "02":
                return 'Degrado';
            case "03":
                return 'Servizi Aggiuntivi';
            default:
                return '';
        }
    }
    findMotivoApertura(value) {
        switch (value) {
            case "001":
                return 'Interruzione Circuito';
            case "002":
                return 'Attenuazione non nella norma';
            case "003":
                return 'Connessione instabile';
            case "004":
                return 'Parametro performance di circuito fuori soglia contrattuale';
            case "005":
                return 'Scarto pacchetti su interfaccia';
            case "006":
                return 'Apparati guasti in sede cliente';
            case "007":
                return 'Richiesta servizi in sede cliente';
            case "008":
                return 'Richiesta servizi al POP';
            case "009":
                return 'Mancata navigazione internet';
            default:
                return '';
        }
    }
    //Eport in csv file
}