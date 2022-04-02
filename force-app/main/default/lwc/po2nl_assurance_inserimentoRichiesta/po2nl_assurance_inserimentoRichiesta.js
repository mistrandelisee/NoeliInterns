import { LightningElement, track, api ,wire} from 'lwc';
// import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
// import Id from '@salesforce/user/Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import PO2_InserimentoRichiestaTT from "@salesforce/label/c.PO2_InserimentoRichiestaTT";
import PO2_ModificaRichiestaTT from "@salesforce/label/c.PO2_ModificaRichiestaTT";
import PO2_send from "@salesforce/label/c.PO2WR_Send";
import PO2_discard from "@salesforce/label/c.PO2_discard";
import communityURL from '@salesforce/label/c.community_url';
import PO2_Codice_Ticket_Olo from '@salesforce/label/c.PO2_Codice_Ticket_Olo';
import PO2_Categoria_Segnalazione from '@salesforce/label/c.PO2_Categoria_Segnalazione';
import PO2_ID_Risorsa from '@salesforce/label/c.PO2_ID_Risorsa';
import PO2_DataOraInizioGuasto from '@salesforce/label/c.PO2_DataOraInizioGuasto';
import PO2_Identificativo_Appuntamento from '@salesforce/label/c.PO2_Identificativo_Appuntamento';
import PO2_Nome_Cliente from '@salesforce/label/c.PO2_Nome_Cliente';
import PO2_Cognome_Cliente from '@salesforce/label/c.PO2_Cognome_Cliente';
import PO2_Recapito_Telefonico_Cliente_1 from '@salesforce/label/c.PO2_Recapito_Telefonico_Cliente_1';
import PO2_Recapito_Telefonico_Cliente_2 from '@salesforce/label/c.PO2_Recapito_Telefonico_Cliente_2';
import PO2_Telefono_VI_Referente from '@salesforce/label/c.PO2_Telefono_VI_Referente';
import PO2_Nome_Referente_Tecnico_Operatore from '@salesforce/label/c.PO2_Nome_Referente_Tecnico_Operatore';
import PO2_Telefono_Referente_Tecnico_Operatore from '@salesforce/label/c.PO2_Telefono_Referente_Tecnico_Operatore';
import PO2_Motivo_Apertura from '@salesforce/label/c.PO2_Motivo_Apertura';
import PO2_DescrizioneProblema from '@salesforce/label/c.PO2_DescrizioneProblema';
import PO2_Tipo_Collaudo from '@salesforce/label/c.PO2_Tipo_Collaudo';
import PO2_SLA_On_Demand from '@salesforce/label/c.PO2_SLA_On_Demand';
import PO2_DataOraInizioGuastoMustBeBeforeToday from '@salesforce/label/c.PO2_DataOraInizioGuastoMustBeBeforeToday';
import PO2_GuastoGpon from '@salesforce/label/c.PO2_GuastoGpon';
import PO2_KitDiConsegna from '@salesforce/label/c.PO2_KitDiConsegna';
import PO2_Progetto_Speciale from '@salesforce/label/c.PO2_Progetto_Speciale';//2020_1_0401
import PO2_TroubleTicket from '@salesforce/label/c.PO2_TroubleTicket';
import PO2_datiCliente from '@salesforce/label/c.PO2_Dati_Cliente';
import PO2_Next from '@salesforce/label/c.PO2_Next';
import PO2_Previous from '@salesforce/label/c.PO2_Indietro';

import PO2_Elimina from "@salesforce/label/c.PO2_Elimina";

import PO2_RichiestaEliminata from "@salesforce/label/c.PO2_RichiestaEliminata";
//Metodo di salva request
import SAVE_REQUEST from '@salesforce/apex/po2_assurance_insertRequest_Ctrl.saveRequest';
//Metodo per recuperare il service log in caso di modify
import GET_LOG_BY_ID from '@salesforce/apex/po2_assurance_insertRequest_Ctrl.getLogById';

//Modifica actions
import GET_LOG_BY_ID_MODIF from '@salesforce/apex/po2_assurance_requestDetailPage_Ctrl.getLogById';
import SEND_REQUEST from '@salesforce/apex/po2_assurance_requestDetailPage_Ctrl.sendRequest';
//Metodo per aggiornare il service log
import UPDATE_REQUEST from '@salesforce/apex/po2_assurance_insertRequest_Ctrl.updateRequest';

import DELETE_SERVICE_LOG from '@salesforce/apex/po2_assurance_requestDetailPage_Ctrl.deleteRequestLog';

import ZIP_ICONS from '@salesforce/resourceUrl/Po2wr_Icons';

export default class Po2nl_assurance_inserimentoRichiesta extends LightningElement {
    @api slIdBySidebar = '';
    @track isModify = false;
    @track openDeleteModal = false;
    @track sl = {};
    @track objectListApparati = [];
	@track objectListServiziAggiuntivi = [];
    phoneImg = ZIP_ICONS + '/raggruppa16684.svg';
    userImg = ZIP_ICONS + '/raggruppa16692.svg';
    // userId = Id;
    // @wire(getRecord, { recordId: '$userId', fields })
	// user;
    @track optCategoriaSegnalazione = [{label : 'Seleziona', value : ''},
        {label : 'Disservizio', value : '01'},
        {label : 'Degrado', value : '02'},
        {label : 'Servizi Aggiuntivi', value : '03'}
    ];
    @track optMotivoApertura = [{label : 'Seleziona', value : ''},
    {label : 'Interruzione circuito', value : '001'},
    {label : 'Attenuazione non nella norma', value : '002'},
    {label : 'Connessione instabile', value : '003'},
    {label : 'Scarto pacchetti su interfaccia', value : '004'},
    {label : 'Parametri performance di circuito fuori soglia contrattuale', value : '005'},
    {label : 'Apparati guasti in sede cliente', value : '006'},
    {label : 'Richiesta servizi in sede cliente', value : '007'},
    {label : 'Richiesta servizi al POP', value : '008'},
    {label : 'Mancata navigazione Internet', value : '009'}
    ];
    //2020_1_0093 END
    @track optGuastoGpon = [{label : 'Seleziona', value : ''},
        {label : 'Riscontrato su intera GPON', value : 'Y'},
        {label : 'Non riscontrato su intera GPON', value : 'N'},
    ];
    /*Root properties*/
    helpBlocks=[
        {Id:1, 
            description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
             Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
             Excepteur sint occaecat cupidatat non proident, 
             sunt in culpa qui officia deserunt mollit anim id est laborum.`,
             title:'Segnalazione Guasti - Inserimento nuova richiesta'}   
    ]
    helpHeader=`Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
     Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
     Excepteur sint occaecat cupidatat non proident, 
     sunt in culpa qui officia deserunt mollit anim id est laborum.`;
    rootText="Segnalazione Guasti  /";
    currentText="Inserimento nuova richiesta";
    helpBtnVisible=true;

    /**Root properties */
    isRendered=false;
    saved=false;
    annulate=false;
    steps=[];
    index=1;
    lastIndex=3;
    firstIndex=1;
    resumes=[];
    @track inputsItems=[];
    @track inputsItems2=[];
    saveViewFields=[];
    obj={};
    label = {
        PO2_TroubleTicket,
        PO2_InserimentoRichiestaTT,
        PO2_ModificaRichiestaTT,
        PO2_send,
        PO2_discard,
        PO2_Codice_Ticket_Olo,
        PO2_Categoria_Segnalazione,
        PO2_ID_Risorsa,
        PO2_DataOraInizioGuasto,
        PO2_Identificativo_Appuntamento,
        PO2_Nome_Cliente,
        PO2_Cognome_Cliente,
        PO2_Recapito_Telefonico_Cliente_1,
        PO2_Recapito_Telefonico_Cliente_2,
        PO2_Telefono_VI_Referente,
        PO2_Nome_Referente_Tecnico_Operatore,
        PO2_Telefono_Referente_Tecnico_Operatore,
        PO2_Motivo_Apertura,
        PO2_DescrizioneProblema,
        PO2_Tipo_Collaudo,
        PO2_SLA_On_Demand,
        PO2_DataOraInizioGuastoMustBeBeforeToday,
        PO2_GuastoGpon,
        PO2_KitDiConsegna,
        PO2_datiCliente,
        PO2_Next,
        PO2_Previous,
        PO2_Progetto_Speciale ,
        PO2_Elimina,
        PO2_RichiestaEliminata
    }
    // get accountName() {
	// 	return getFieldValue(this.user.data, ACCOUNT_FIELD);
	// }
    get notDisplayForm (){
        return  this.saved || this.annulate;
    } 
    buildForms(){

        //Set form values
        //forms block
        let ReferenteTecnico_fileds=[
            {
                label:this.label.PO2_Nome_Referente_Tecnico_Operatore,
                name:'EOF_NOME_REFERENTE_TECNICO_OLO__c',
                required:true,
                value:this.sl?.EOF_NOME_REFERENTE_TECNICO_OLO__c,
                helpText:'help for Nome referente tecnico operatore',
                placeholder:'Inserisci il nome',
                maxlength:255,
                type:'text'
            },
            {
                label:this.label.PO2_Telefono_Referente_Tecnico_Operatore,
                name:'EOF_TELEFONO_REFERENTE_TECNICO_OLO__c',
                required:true,
                value:this.sl?.EOF_TELEFONO_REFERENTE_TECNICO_OLO__c,
                helpText:'help for Telefono referente tecnico operatore',
                placeholder:'Inserisci il cognome',
                type:'text',
                maxlength:70,
                pattern:'^[0-9]*$'
            },
            
            {
                label:this.label.PO2_Telefono_VI_Referente,
                name:'OF_Telefono_IV_Referente__c',
                required:false,
                value:this.sl?.OF_Telefono_IV_Referente__c,
                helpText:'help for Telefono IV referente',
                placeholder:'Inserisci il telefono',
                maxlength:50,
                type:'text'
            }

        ]
        let inputform11={
            title:'Referente Tecnico',
            items:ReferenteTecnico_fileds,
            key:'0011'
        };

        let dati_segnalazatione_fields=[
            {
                label:this.label.PO2_Codice_Ticket_Olo,
                name:'EOF_Codice_Comunicazione_OLO__c',
                required:true,
                value: this.sl?.EOF_Codice_Comunicazione_OLO__c,
                helpText:'help for Codice ticket OLO',
                placeholder:'Inserisci il codice ticket OLO',
                maxlength:50,
                type:'text'
            },
            {
                label:this.label.PO2_ID_Risorsa,
                name:'EOF_ID_Risorsa__c',
                required:true,
                value: this.sl?.EOF_ID_Risorsa__c,
                helpText:'help for ID Risorsa COR',
                placeholder:'Inserisci l id risorsa',
                maxlength:50,
                type:'text'
            },
            {
                label:this.label.PO2_Categoria_Segnalazione,
                placeholder:"Select Segnalazione",
                name:'OF_Categoria_Segnalazione__c',
                helpText:'help text for Categoria Segnalazione',
                value: this.sl?.OF_Categoria_Segnalazione__c ? this.sl?.OF_Categoria_Segnalazione__c : '',
                required:true,
                picklist:true,
                options:this.optCategoriaSegnalazione
            },
            {
                label:this.label.PO2_Motivo_Apertura,
                placeholder:"Select Motiva",
                name:'OF_Motivo_Apertura__c',
                value: this.sl?.OF_Motivo_Apertura__c ? this.sl?.OF_Motivo_Apertura__c : '' ,
                required:true,
                picklist:true,
                helpText:'help text for Motiva apertura',
                options:this.optMotivoApertura
            },
            {
                label:this.label.PO2_DescrizioneProblema,
                name:'OF_Descrizione_Problema__c',
                required:true,
                value: this.sl?.OF_Descrizione_Problema__c,
                helpText:'help for Descrizione Problema',
                placeholder:'Inserisci una descrizione',
                type:'text'
            },
            {
                label:this.label.PO2_GuastoGpon,
                placeholder:"Select Guasto",
                name:'OF_TT_Guasto_Gpon__c',
                value: this.sl?.OF_TT_Guasto_Gpon__c,
                required:true,
                picklist:true,
                helpText:'help text for Guasto gpon',
                options:this.optGuastoGpon
            },
            {
                label:this.label.PO2_DataOraInizioGuasto,
                name:'EOF_Data_Ora_Inizio_Guasto__c',
                value: this.sl?.EOF_Data_Ora_Inizio_Guasto__c,
                helpText:'help for Inizio guasto',
                required: true,
                max: new Date().toISOString(),//from check validation
                type:'datetime'
            },
            {
                label:this.label.PO2_KitDiConsegna,
                name:'OF_TT_KIT_CONSEGNA__c',
                required:false,
                value: this.sl?.OF_TT_KIT_CONSEGNA__c,
                helpText:'help for Kit di consegna',
                placeholder:'Inserisci li Kit di consegna',
                maxlength:10,
                type:'text'
            },
            {
                label:this.label.PO2_Progetto_Speciale,
                name:'EOF_CODICE_PROGETTO_SPECIALE__c',
                required:false,
                value: this.sl?.EOF_CODICE_PROGETTO_SPECIALE__c,
                helpText:'help for Kit di consegna',
                placeholder:'Inserisci li Kit di consegna',
                maxlength:50,
                type:'text'
            }

        ]
        let inputform10={
            title:'Inserimento dati segnalazatione',
            items:dati_segnalazatione_fields,
            key:'0010'
        };
        let dati_cliente_fields=[
            {
                label:this.label.PO2_Nome_Cliente,
                name:'EOF_Nome_Cliente__c',
                required:true,
                value: this.sl?.EOF_Nome_Cliente__c,
                helpText:'help for Nome cliente',
                placeholder:'Inserisci il nome cliente',
                maxlength:50,
                type:'text'
            },
            {
                label:this.label.PO2_Cognome_Cliente,
                name:'EOF_COgnome_CLiente__c',
                required:true,
                value: this.sl?.EOF_COgnome_CLiente__c,
                helpText:'help for Cognome cliente',
                placeholder:'Inserisci il Cognome o ragione cliente',
                maxlength:70,
                type:'text'
            },
            {
                label:this.label.PO2_Recapito_Telefonico_Cliente_1,
                name:'EOF_RECAPITO_TELEFONICO_CLIENTE_1__c',
                required:true,
                value: this.sl?.EOF_RECAPITO_TELEFONICO_CLIENTE_1__c,
                helpText:'help for Recapito Telefonico cliente',
                placeholder:'Inserisci il telefono',
                maxlength:50,
                type:'text'
            },
            {
                label:this.label.PO2_Recapito_Telefonico_Cliente_2,
                name:'EOF_RECAPITO_TELEFONICO_CLIENTE_2__c',
                required:false,
                value: this.sl?.EOF_RECAPITO_TELEFONICO_CLIENTE_2__c,
                helpText:'help for Recapito Telefonico',
                placeholder:'Inserisci il recapito 2',
                maxlength:50,
                type:'text'
            },
            {
                label:this.label.PO2_Identificativo_Appuntamento,
                name:'OF_SH_Token_id__c',
                required:false,
                value: this.sl?.OF_SH_Token_id__c,
                helpText:'help for Nome cliente',
                placeholder:'Inserisci l indentificativo',
                maxlength:50,
                type:'text'
            }
        ];
        
        let inputform00={
            title:'Inserimento dati cliente',
            items:dati_cliente_fields,
            key:'0000'
        };
        this.inputsItems =[];
        this.inputsItems2 =[];
        this.inputsItems.push(inputform00);
        // this.inputsItems.push(input2);

        this.inputsItems2.push(inputform10);
        this.inputsItems2.push(inputform11);
    }
    renderedCallback(){
        console.log('IN RENDERED');
        if (! this.isRendered) {
            let key=this.index;
            console.log(`IN RENDERED key=========> `, key);
            this.hideShowViewCmp(this.index);
            this.isRendered=true;
            if (this.isLast && this.isModify) {
                this.template.querySelector("div.slds-spinner_container")?.classList?.toggle("slds-hide");
            }
        }
        
    }
    connectedCallback(){
        // registerListener('NavigateTo', this.handleNavigateTo, this); //not existing my org
        //steps
        // for (let index = 1; index <= this.lastIndex; index++) {
            this.steps=[
                {
                label:this.label.PO2_datiCliente,
                key:1
                },
                 {
                    label:'Dati di segnalazione',
                    key:2
                },
                {
                        label:'Riepilogo',
                        key:3,
                        last:true

                }
        ];
            
        // }
        
        
        var slogid;
        if(this.slIdBySidebar != undefined && this.slIdBySidebar != ''){
            slogid = this.slIdBySidebar;
            this.clearSlId();
        }else{
            slogid = this.getOperationType();
        }
        //Se trovo slogid, siamo in modify mode
        if(slogid != undefined && slogid != 'Not found' && slogid != null ){
            this.isModify = true;
             this.retrieveRequestLog(slogid);
             this.index=this.lastIndex;
             
        }else{
            //is new
            this.buildForms();
            // this.hideShowViewCmp(this.index);
        }
        console.log('SL >>> ',this.sl);



    }
    get isLast(){
        return this.lastIndex==this.index;
    }
    get isFirstOrLast(){
        return this.isLast || this.isFirst;
    }
    get isFirst(){
        return this.firstIndex==this.index;
    }
    get Resumes(){
        //get defined resumes
        return this.resumes.filter(x => (x!=null && x!=undefined));
    }
    handleNext(){
      let switchOk=this.handleSwitch();
      if (switchOk) {
            this.index=this.index+1;
            this.template.querySelector('c-po2nl_progress_indicator').updateCss(this.index);
            this.hideShowViewCmp(this.index);
            this.saveRequest();
      }
      console.log('ISLAST??????? ',this.isLast);
    }
    hideShowViewCmp(key){

        let cmp=this.template.querySelector(`[data-step-id="${key}"]`);
        console.log('cmp=========== >',cmp);
        if (cmp) {
            const cmpClass = cmp.classList;
            if (cmpClass) {
                cmpClass.toggle('slds-hide');
            }
        }
    }
    initview(index){
        for (let key = this.firstIndex; key <= this.lastIndex; key++) {
            let cmp=this.template.querySelector(`[data-step-id="${key}"]`);
            console.log('cmp=========== >',cmp);
            if (cmp) {
                const cmpClass = cmp.classList;
                if (cmpClass) {
                    cmpClass.add('slds-hide');
                    if (key==index) {
                        cmpClass.remove('slds-hide');
                    }
                }
            }
        }
        
    }
    handleNavigateTo(event){
        console.log(`NAVIGATE TO event`, event);
        this.hideShowViewCmp(this.lastIndex);//close resume section
        console.log(`event`, event.detail.to);
        this.index=+event.detail.to;
        this.hideShowViewCmp(this.index);
        this.template.querySelector('c-po2nl_progress_indicator').updateCss(this.index);//update progress indicator
    }
    handlePrevious(){
        this.hideShowViewCmp(this.index);//hide current section
        this.index=this.index-1;
        this.template.querySelector('c-po2nl_progress_indicator').updateCss(this.index);//update progress indicator
        this.hideShowViewCmp(this.index);//show previous
        console.log('isFirst??????? ',this.isFirst);
    }
    generateResumeFromSL(){
        let dateTimevalue=this.sl?.EOF_Data_Ora_Inizio_Guasto__c;
        let dateTimeLabel=this.label.PO2_DataOraInizioGuasto;
        let datevalue=dateTimevalue? new Date(dateTimevalue).toLocaleDateString() :'';
        let datelabel=dateTimeLabel?  dateTimeLabel.replace('/','').replace('ora','').replace('hour','') :' Date';
        let timevalue=dateTimevalue? new Date(dateTimevalue).toLocaleTimeString() :'';
        let timelabel=dateTimeLabel? dateTimeLabel.replace('/','').replace('Data','').replace('Date','') :' Time';

        this.resumes[2]={
            values:[
                {
                    label:this.label.PO2_Codice_Ticket_Olo,
                    name:'EOF_Codice_Comunicazione_OLO__c',
                    value: this.sl?.EOF_Codice_Comunicazione_OLO__c
                },
                {
                    label:this.label.PO2_ID_Risorsa,
                    name:'EOF_ID_Risorsa__c',
                    value: this.sl?.EOF_ID_Risorsa__c
                },
                {
                    label:this.label.PO2_Categoria_Segnalazione,
                    name:'OF_Categoria_Segnalazione__c',
                    value: this.sl?.OF_Categoria_Segnalazione__c ? this.sl?.OF_Categoria_Segnalazione__c : '',
                    
                },
                {
                    label:this.label.PO2_Motivo_Apertura,
                    name:'OF_Motivo_Apertura__c',
                    value: this.sl?.OF_Motivo_Apertura__c ? this.sl?.OF_Motivo_Apertura__c : '' ,
                },
                {
                    label:this.label.PO2_DescrizioneProblema,
                    name:'OF_Descrizione_Problema__c',
                    required:true,
                    value: this.sl?.OF_Descrizione_Problema__c
                },
                {
                    label:this.label.PO2_GuastoGpon,
                    name:'OF_TT_Guasto_Gpon__c',
                    value: this.sl?.OF_TT_Guasto_Gpon__c
                },
                {
                    label:datelabel,
                    name:'EOF_Data_Ora_Inizio_Guasto__cd',
                    value: datevalue
                },
                {
                    label:timelabel,
                    name:'EOF_Data_Ora_Inizio_Guasto__ct',
                    value:timevalue
                },
                {
                    label:this.label.PO2_KitDiConsegna,
                    name:'OF_TT_KIT_CONSEGNA__c',
                    value: this.sl?.OF_TT_KIT_CONSEGNA__c
                },
                {
                    label:this.label.PO2_Progetto_Speciale,
                    name:'EOF_CODICE_PROGETTO_SPECIALE__c',
                    value: this.sl?.EOF_CODICE_PROGETTO_SPECIALE__c
                },
                {
                label:this.label.PO2_Nome_Referente_Tecnico_Operatore,
                name:'EOF_NOME_REFERENTE_TECNICO_OLO__c',
                value:this.sl?.EOF_NOME_REFERENTE_TECNICO_OLO__c
            },
            {
                label:this.label.PO2_Telefono_Referente_Tecnico_Operatore,
                name:'EOF_TELEFONO_REFERENTE_TECNICO_OLO__c',
                value:this.sl?.EOF_TELEFONO_REFERENTE_TECNICO_OLO__c
            
            },
            
            {
                label:this.label.PO2_Telefono_VI_Referente,
                name:'OF_Telefono_IV_Referente__c',
                value:this.sl?.OF_Telefono_IV_Referente__c,
            }
            
                ],key:2,title:'Inserimento dati segnalazatione',src:this.userImg
        };
        this.resumes[1]={
            values:[
                {
                    label:this.label.PO2_Nome_Cliente,
                    name:'EOF_Nome_Cliente__c',
                    value: this.sl?.EOF_Nome_Cliente__c
                },
                {
                    label:this.label.PO2_Cognome_Cliente,
                    name:'EOF_COgnome_CLiente__c',
                    value: this.sl?.EOF_COgnome_CLiente__c
                },
                {
                    label:this.label.PO2_Recapito_Telefonico_Cliente_1,
                    name:'EOF_RECAPITO_TELEFONICO_CLIENTE_1__c',
                    value: this.sl?.EOF_RECAPITO_TELEFONICO_CLIENTE_1__c
                },
                {
                    label:this.label.PO2_Recapito_Telefonico_Cliente_2,
                    name:'EOF_RECAPITO_TELEFONICO_CLIENTE_2__c',
                    value: this.sl?.EOF_RECAPITO_TELEFONICO_CLIENTE_2__c
                },
                {
                    label:this.label.PO2_Identificativo_Appuntamento,
                    name:'OF_SH_Token_id__c',
                    value: this.sl?.OF_SH_Token_id__c
                }
            ],key:1,title:'Inserimento dati cliente',src:this.phoneImg
        };
    }
    handleSwitch(){//switch next
        let key=this.index;
        let switchOk=true
        let formBlock=this.template.querySelector(`c-po2nl_dynamic_form_block[data-step-id="${key}"]`);
        console.log('formBlock=========== >',formBlock);
        if (formBlock) {
            let saveResult=formBlock.save();
            const values= saveResult.outputs;
            const title= saveResult.resumetitle;
            const src= saveResult.src;
            this.obj={...this.obj,...saveResult.obj};
            this.sl={...this.sl,...saveResult.obj};
            switchOk=saveResult.isvalid;
            if (switchOk) this.hideShowViewCmp(this.index);//hide current section
            this.resumes[key]={
                values,key,title,src
            };
        } 
        console.log('OUTPUT : RESUMES ',this.resumes);
        return switchOk;
    }
    handleSave(){//for invia btn
        console.log(`Object to save `, this.obj );
        console.log('OUTPUT : isModify ',this.isModify);
        this.template.querySelector("div.slds-spinner_container")?.classList?.toggle("slds-hide");//launch spinner ,it'll be stopped in retrieveRequestLog
        this.retrieveRequestLog(this.sl.Id,true);//retrieve according to the modifica component ,then sent .
    }
    handleCancel(){
        this.openDeleteModal=true;
        //this.cancelRequest();
    }
    refreshForms(){
        this.isModify=false;
        this.resumes=[];
        this.sl = {}; 
        this.buildForms();
        // this.initview(this.firstIndex);
        this.index=this.firstIndex;
        this.template.querySelector('c-po2nl_progress_indicator')?.updateCss(this.index);//update progress indicator
        
        this.isRendered=false;
    }
    //In caso di modifica, recupero il log di request
    // retrieveRequestLoOLD(logId){
    //     GET_LOG_BY_ID({
    //         sLogId : logId
    //     })
    //     .then(
    //         (result) => {
    //             this.template.querySelector("div.slds-spinner_container").classList.toggle("slds-hide");
    //             if(result != null && result != undefined){
    //                 this.sl = result;
    //                 this.buildForms();
    //             }
    //             this.template.querySelector("div.slds-spinner_container").classList.toggle("slds-hide");
    //         }

    //     )
    //     .catch(
    //         (error) => {
    //             console.log('Errore nel salvataggio della richiesta => ' + JSON.stringify(error, undefined, 2));
    //             this.showNotification('ERROR', this.label.PO2_GenericError, 'ERROR');
    //             this.template.querySelector("div.slds-spinner_container").classList.toggle("slds-hide");
    //         }
    //     )
    // }
    saveRequest(){
        //before continue trim some fields as it was in the old logic
        this.sl.EOF_CODICE_PROGETTO_SPECIALE__c= this.sl.EOF_CODICE_PROGETTO_SPECIALE__c?.trim();
        this.sl.OF_TT_KIT_CONSEGNA__c= this.sl.OF_TT_KIT_CONSEGNA__c?.trim();
        this.sl.EOF_Codice_Comunicazione_OLO__c= this.sl.EOF_Codice_Comunicazione_OLO__c?.trim();
        this.sl.OF_SH_Token_id__c= this.sl.OF_SH_Token_id__c?.trim();
        this.sl.EOF_ID_Risorsa__c= this.sl.EOF_ID_Risorsa__c?.trim();
        //all validy checks has been done 
        this.template.querySelector("div.slds-spinner_container").classList.toggle("slds-hide");
        // if(!this.isModify){
        if(this.sl.Id){
            this.aggiornamentoRichiesta();
            
        }else{
            this.inserimentoRichiesta();
        }
    }
    handleSuccessNext(event){
        this.saved=false;
        console.log(`event action // `, event.detail.action);
        const action=event.detail.action;
        if (action=='New') {
            this.refreshForms();
        }else{
                        
            this.goToList(this.sl.Id) 
        }
    }
    handleDeleteNext(event){
        this.openDeleteModal=false;
        console.log(`event action // `, event.detail.action);
        const action=event.detail.action;
        if (action=='OK') {
            this.annulate=true;
            console.log(`Delete OK` );
            this.deleteRequest(this.sl.Id);
            
           
        }else{
            console.log(`Delete KO` );
        }
    }
    goToList(slId){
        const eventToFire = new CustomEvent(
            'gotorichiesteinserite',
            {
                'detail' : {
                            'sLogId' : slId
                            }

            }
        );
        this.dispatchEvent(eventToFire);

    }
    openNext(){
        this.saveViewFields.push(
            {
                label:'Codice ticket OLO ',
                value:this.sl.EOF_Codice_Comunicazione_OLO__c,
                name:'codice'
            }
        );
        this.saved=true;
    }
    inserimentoRichiesta(){
        SAVE_REQUEST({
            sLog : this.sl
        })
        .then(
            (result) => {
                this.sl = result;
                //this.goToURL(communityURL + '/assurance-detail-page?slogid='+this.sl.Id);
                //Aggiornamento integrazione sidebar
                // this.saveViewFields.push(
                //     {
                //         label:'Codice ticket OLO ',
                //         value:this.sl.EOF_Codice_Comunicazione_OLO__c,
                //         name:'codice'
                //     }
                // );
                // this.saved=true;
                // this.goToDetail_v2(this.sl.Id);
                this.template.querySelector("div.slds-spinner_container").classList.toggle("slds-hide");
            }
        )
        .catch(
            (error) => {
                console.log('Errore nel salvataggio della richiesta => ' + JSON.stringify(error, undefined, 2));
                this.showNotification('ERROR', this.label.PO2_GenericError, 'ERROR');
                this.template.querySelector("div.slds-spinner_container").classList.toggle("slds-hide");
            }
        )
    }
    aggiornamentoRichiesta(){
        UPDATE_REQUEST({
            sLog : this.sl
        })
        .then(
            (result) => {
                this.sl = result;
                //this.goToURL(communityURL + '/assurance-detail-page?slogid='+this.sl.Id);
                //Aggiornamento integrazione sidebar
                // this.saveViewFields.push(
                //     {
                //         label:'Codice ticket OLO ',
                //         value:this.sl.EOF_Codice_Comunicazione_OLO__c,
                //         name:'codice'
                //     }
                // );
                // this.saved=true;
                this.template.querySelector("div.slds-spinner_container").classList.toggle("slds-hide");
                // this.goToDetail_v2(this.sl.Id);
            }
        )
        .catch(
            (error) => {
                console.log('Errore nell\'aggiornamento della richiesta => ' + JSON.stringify(error, undefined, 2));
                this.showNotification('ERROR', this.label.PO2_GenericError, 'ERROR');
                this.template.querySelector("div.slds-spinner_container").classList.toggle("slds-hide");
            }
        )
    }
    //Vado a vedere se è presente slogid, così da capire se siamo in modifica o in inserimento
    getOperationType(){
        var sLogId;
        var sPageURL = decodeURIComponent(window.location.search.substring(1)); //You get the whole decoded URL of the page.
        var sURLVariables = sPageURL.split('&'); //Split by & so that you get the key value pairs separately in a list
        var sParameterName;
        var i;
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('='); //to split the key from the value.
            if (sParameterName[0] === 'slogid') { //lets say you are looking for param name - firstName
                sLogId = (sParameterName[1] === undefined) ? 'Not found' : sParameterName[1];
            }

        }
        return sLogId;
    }
    cancelRequest(){
        this.template.querySelector("div.slds-spinner_container").classList.toggle("slds-hide");
        if(this.isModify){
            //debugger; 
            this.goToDetail_v2(this.sl.Id);
        }else{
            //??? What TO DO?
            // this.goToURL(communityURL); //bug !!! always redirecting
            window.location.replace("/OFPortaleServizi/s/services");
            //or window.location.reload();
     
        }
    }
    goToURL(url) {
        window.location.href = url;
    }
    showNotification(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
    //Versione go to detail per adeguarsi alla sidebar
    goToDetail_v2(slId){
        const eventToFire = new CustomEvent(
            'gotodetail',
            {
                'detail' : {
                            'sLogId' : slId
                            }

            }
        );
        this.dispatchEvent(eventToFire);
    }
    //Ho la necessità di inviare un evento per pulire la variabile slId del parent component, altrimenti mantiene l'id e vengono eseguite operazioni su di esso
    clearSlId(){
        //debugger; 
        const eventToFire = new CustomEvent(
            'clearid',
            {
            }
        );
        this.dispatchEvent(eventToFire);
    }
    //---------------------Modifica
    get isBozza() {
		return (this.sl?.EOF_Stato_Richiesta__c == 'Bozza') ? true : false;
	}
    get isNewOrBozza(){
        return ( this.sl?.EOF_Stato_Richiesta__c == null ||this.sl?.EOF_Stato_Richiesta__c == undefined || this.sl?.EOF_Stato_Richiesta__c == 'Bozza') ? true : false;
    }
    //Fa la callout al controller per recuperare il slog
	retrieveRequestLog(serviceLogId,invia=false) {
		//debugger; 
		GET_LOG_BY_ID_MODIF({
			sLogId: serviceLogId
		})
			.then(
				(result) => {
                    
					//debugger; 
					if (result != null && result != undefined) {
                        console.log(result);
						this.sl = this.modifyPicklistValues(result.sLog);
                        this.buildForms();//build form with the SL field values
                        this.generateResumeFromSL();
						
						this.objectListApparati = (result.lstApparati != null && result.lstApparati != undefined)
							? this.transformAzioneApparato(result.lstApparati)
							: [];
						this.objectListServiziAggiuntivi = (result.lstServAgg != null && result.lstServAgg != undefined)
							? this.transformCodiceServAgg(result.lstServAgg)
							: [];
                        if (invia) {
                            this.inoltraRequest();
                        }
					} else {
						this.showNotification('Error', 'Request not found', 'ERROR');
					}
				}
			)
			.catch(
				(error) => {
					console.log('Errore nella retrieve della request => ' + JSON.stringify(error, undefined, 2));
					this.showNotification('ERROR', this.label.PO2_GenericError, 'ERROR');
					
				}
			).finally(()=>{
                this.template.querySelector("div.slds-spinner_container")?.classList?.toggle("slds-hide");
            })
	}
	transformAzioneApparato(lstApp) {
		for (var i = 0; i < lstApp.length; i++) {
			if (lstApp[i].OF_SA_AZIONE_APPARATO__c == '0') {
				lstApp[i].AZIONE_APPARATO = 'Consegna';
			} else if (lstApp[i].OF_SA_AZIONE_APPARATO__c == '1') {
				lstApp[i].AZIONE_APPARATO = 'Consegna e installazione';
			} else if (lstApp[i].OF_SA_AZIONE_APPARATO__c == '2') {
				lstApp[i].AZIONE_APPARATO = 'Solo installazione';
			}
			// 2020_1_0407.00 START
			if(lstApp[i].EOF_Esito_Consegna_Apparato__c){
				switch(lstApp[i].EOF_Esito_Consegna_Apparato__c){
					case '0':
						lstApp[i].ESITO_CONSEGNA_APPARATO = 'Apparato non consegnato';
						break;
					case '1':
						lstApp[i].ESITO_CONSEGNA_APPARATO = 'Apparato solo da consegnare: consegnato';
						break;
					case '2':
						lstApp[i].ESITO_CONSEGNA_APPARATO = 'Apparato da consegnare e installare: consegnato e installato';
						break;
					case '3':
						lstApp[i].ESITO_CONSEGNA_APPARATO = 'Apparato da consegnare e installare: consegnato ma non installato';
						break;
					case '4':
						lstApp[i].ESITO_CONSEGNA_APPARATO = 'Apparato solo da installare: installato';
						break;
					case '5':
						lstApp[i].ESITO_CONSEGNA_APPARATO = 'Apparato solo da installare: non installato';
						break;
					default:
						lstApp[i].ESITO_CONSEGNA_APPARATO = '';
				}
			}
			// 2020_1_0407.00 END
		}
		return lstApp;
	}
	transformCodiceServAgg(lstServAgg) {
		for (var i = 0; i < lstServAgg.length; i++) {
			if (lstServAgg[i].OF_Codice_Servizio_Aggiuntivo__c == '01') {
				lstServAgg[i].CODICE_SERVIZIO_AGGIUNTIVO = 'Ribaltamento impianto in sede cliente';
			} else if (lstServAgg[i].OF_Codice_Servizio_Aggiuntivo__c == '02') {
				lstServAgg[i].CODICE_SERVIZIO_AGGIUNTIVO = 'Prolungamento in sede cliente';
			} else if (lstServAgg[i].OF_Codice_Servizio_Aggiuntivo__c == '03') {
				lstServAgg[i].CODICE_SERVIZIO_AGGIUNTIVO = 'Sostituzione apparato in sede cliente';
			} else if (lstServAgg[i].OF_Codice_Servizio_Aggiuntivo__c == '04') {
				lstServAgg[i].CODICE_SERVIZIO_AGGIUNTIVO = 'Accompagnamento al POP';
			} else if (lstServAgg[i].OF_Codice_Servizio_Aggiuntivo__c == '05') {
				lstServAgg[i].CODICE_SERVIZIO_AGGIUNTIVO = 'Accesso al POP';
			} else if (lstServAgg[i].OF_Codice_Servizio_Aggiuntivo__c == '06') {
				lstServAgg[i].CODICE_SERVIZIO_AGGIUNTIVO = 'Manutenzione - Problemi di alimentazione';
			} else if (lstServAgg[i].OF_Codice_Servizio_Aggiuntivo__c == '07') {
				lstServAgg[i].CODICE_SERVIZIO_AGGIUNTIVO = 'Manutenzione - Problemi di climatizzazione';
			} else if (lstServAgg[i].OF_Codice_Servizio_Aggiuntivo__c == '08') {
				lstServAgg[i].CODICE_SERVIZIO_AGGIUNTIVO = 'Manutenzione - Problemi ambientali';
			} else if (lstServAgg[i].OF_Codice_Servizio_Aggiuntivo__c == '09') {
				lstServAgg[i].CODICE_SERVIZIO_AGGIUNTIVO = 'Remote Hands - Cablatura & patch nel POP';
			} else if (lstServAgg[i].OF_Codice_Servizio_Aggiuntivo__c == '10') {
				lstServAgg[i].CODICE_SERVIZIO_AGGIUNTIVO = 'Remote Hands - Intervento su apparato HW';
			} else if (lstServAgg[i].OF_Codice_Servizio_Aggiuntivo__c == '11') {
				lstServAgg[i].CODICE_SERVIZIO_AGGIUNTIVO = 'Remote Hands - Accensione/spegnimento/reboot apparato';
			} else if (lstServAgg[i].OF_Codice_Servizio_Aggiuntivo__c == '12') {
				lstServAgg[i].CODICE_SERVIZIO_AGGIUNTIVO = 'Remote Hands - Etichettature';
			} else if (lstServAgg[i].OF_Codice_Servizio_Aggiuntivo__c == '13') {
				lstServAgg[i].CODICE_SERVIZIO_AGGIUNTIVO = 'Remote Hands - Verifica allarmi';
			} else if (lstServAgg[i].OF_Codice_Servizio_Aggiuntivo__c == '14') {
				lstServAgg[i].CODICE_SERVIZIO_AGGIUNTIVO = 'Esecuzione test list completa su apparati OLO in sede cliente';
			} else if (lstServAgg[i].OF_Codice_Servizio_Aggiuntivo__c == '15') {
				lstServAgg[i].CODICE_SERVIZIO_AGGIUNTIVO = 'Attestazione cavi in sede cliente';
			}
			// 24/07/20 LM 2020_1_0257 START
			console.log(lstServAgg[i].OF_SA_ESITO_SERVIZIO__c);
			if (lstServAgg[i].OF_SA_ESITO_SERVIZIO__c == '0') {
				lstServAgg[i].ESITO_SERVIZIO = 'servizio effettuato / attivato';
			}
			else if (lstServAgg[i].OF_SA_ESITO_SERVIZIO__c == '1') {
				lstServAgg[i].ESITO_SERVIZIO = 'servizio non effettuato / attivato';
            }
            lstServAgg[i].MOTIVAZIONE_SERVIZIO = lstServAgg[i].OF_SA_MOTIVAZIONE_SERVIZIO__c;
            lstServAgg[i].ESTENSIONE_IMPIANTO = lstServAgg[i].OF_Estensione_Impianto__c;
            lstServAgg[i].METRI_TOT = lstServAgg[i].OF_Metri_TOT__c;
			// 24/07/20 LM 2020_1_0257 END
		}
		return lstServAgg;
	}
    modifyPicklistValues(servLog) {
		//debugger; 
		//categoria segnalazione
		if (servLog.OF_Categoria_Segnalazione__c == '01') {
			servLog.CATEGORIA_SEGNALAZIONE = 'Disservizio';
		} else if (servLog.OF_Categoria_Segnalazione__c == '02') {
			servLog.CATEGORIA_SEGNALAZIONE = 'Degrado';
		} else if (servLog.OF_Categoria_Segnalazione__c == '03') {
			servLog.CATEGORIA_SEGNALAZIONE = 'Servizi Aggiuntivi';
		}
		//Tipo Collaudo
		if (servLog.OF_Tipo_collaudo__c == '0') {
			servLog.TIPO_COLLAUDO = 'Nessuno';
		} else if (servLog.OF_Tipo_collaudo__c == '1') {
			servLog.TIPO_COLLAUDO = 'Base';
		} else if (servLog.OF_Tipo_collaudo__c == '2') {
			servLog.TIPO_COLLAUDO = 'Silver';
		} else if (servLog.OF_Tipo_collaudo__c == '3') {
			servLog.TIPO_COLLAUDO = 'Gold';
		} else if (servLog.OF_Tipo_collaudo__c == '4') {
			servLog.TIPO_COLLAUDO = 'Platinum';
		}
		//Sla on demand
		if (servLog.OF_SLA_On_Demand__c == '00') {
			servLog.SLA_ON_DEMAND = 'Nessuno';
		} else if (servLog.OF_SLA_On_Demand__c == '01') {
			servLog.SLA_ON_DEMAND = 'Premium 1';
		} else if (servLog.OF_SLA_On_Demand__c == '02') {
			servLog.SLA_ON_DEMAND = 'Premium 2';
		} else if (servLog.OF_SLA_On_Demand__c == '03') {
			servLog.SLA_ON_DEMAND = 'Premium 3';
		}
		//Motivo Apertura
		if (servLog.OF_Motivo_Apertura__c == '001') {
			servLog.MOTIVO_APERTURA = 'Interruzione circuito';
		} else if (servLog.OF_Motivo_Apertura__c == '002') {
			servLog.MOTIVO_APERTURA = 'Attenuazione non nella norma';
		} else if (servLog.OF_Motivo_Apertura__c == '003') {
			servLog.MOTIVO_APERTURA = 'Connessione instabile';
		} else if (servLog.OF_Motivo_Apertura__c == '004') {
			servLog.MOTIVO_APERTURA = 'Scarto pacchetti su interfaccia';
		} else if (servLog.OF_Motivo_Apertura__c == '005') {
			servLog.MOTIVO_APERTURA = 'Parametri performance di circuito fuori soglia contrattuale';
		} else if (servLog.OF_Motivo_Apertura__c == '006') {
			servLog.MOTIVO_APERTURA = 'Apparati guasti in sede cliente';
		} else if (servLog.OF_Motivo_Apertura__c == '007') {
			servLog.MOTIVO_APERTURA = 'Richiesta servizi in sede cliente';
		} else if (servLog.OF_Motivo_Apertura__c == '008') {
			servLog.MOTIVO_APERTURA = 'Richiesta servizi al POP';
		} else if (servLog.OF_Motivo_Apertura__c == '009') {
			servLog.MOTIVO_APERTURA = 'Mancata navigazione Internet';
		}
		//GUASTO_GPON
		if (servLog.OF_TT_Guasto_Gpon__c == 'Y') {
			servLog.GUASTO_GPON = 'Riscontrato su intera GPON';
		} else if (servLog.OF_TT_Guasto_Gpon__c == 'N') {
			servLog.GUASTO_GPON = 'Non riscontrato su intera GPON';
		}
		//VERIFICA_APPARATO_CLIENTE
		if (servLog.EOF_Verifica_apparato_cliente__c == 'Y') {
			servLog.VERIFICA_CLIENTE = 'E\' richiesta la verifica dell’apparato presso il cliente';
		} else if (servLog.EOF_Verifica_apparato_cliente__c == 'N') {
			servLog.VERIFICA_CLIENTE = 'Non è richiesta la verifica dell’apparato presso il cliente';
		}
		return servLog;
	}
    //2020_1_0093 END
	inoltraRequest() {
		this.template.querySelector("div.slds-spinner_container").classList.toggle("slds-hide");
		SEND_REQUEST({
			sl: this.sl,
			lstApparati: this.objectListApparati,
			lstServAgg: this.objectListServiziAggiuntivi
		})
			.then(
				(result) => {
					//debugger; 
					if (result != null && result != undefined) {
						//debugger; 
						if (result.EOF_STATO_ORDINE__c != 'error') {
							//debugger; 
							//window.location.reload()
							// console.log(result.Id);
							// this.goToDetail_v2(result.Id);
                            this.openNext();
						} else {
							//debugger; 
							this.showNotification('ERROR', result.EOF_MOTIVAZIONE__c, 'ERROR');
                            this.openNext();//to remove
						}
					}
					this.template.querySelector("div.slds-spinner_container").classList.toggle("slds-hide");
				}
			)
			.catch(
				(error) => {
					//debugger; 
					console.log('Errore nell\'inoltro della richiesta => ' + JSON.stringify(error, undefined, 2));
					this.showToast('ERROR', this.label.PO2_GenericError, 'ERROR');
					this.template.querySelector("div.slds-spinner_container").classList.toggle("slds-hide");
                    this.openNext();//to remove
				}
			)
	}
    //delete
    deleteRequest(logId) {
		this.template.querySelector("div.slds-spinner_container").classList.toggle("slds-hide");
		DELETE_SERVICE_LOG({
			slogId: logId
		})
			.then(
				(result) => {
					if (result) {
                        
						this.showNotification('Success', this.label.PO2_RichiestaEliminata, 'Success');
						// setTimeout(() => {
                        if(this.isModify){
                            //go back to the list
                            this.goToList(logId) 
                        }else{
                            //prepare new form
                            this.refreshForms();
                            this.template.querySelector("div.slds-spinner_container").classList.toggle("slds-hide");
                            
                        }
						// }, 3000);
					} else {
						this.showNotification('ERROR', this.label.PO2_GenericError, 'ERROR');
						this.template.querySelector("div.slds-spinner_container").classList.toggle("slds-hide");
					}
				}
			).catch((e)=>{
                console.log(`error during the delete`, e);
                this.showNotification('ERROR', this.label.PO2_GenericError, 'ERROR');
            })
            .finally(()=>{
                this.annulate=false;
            })
	}
}