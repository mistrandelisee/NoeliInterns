import { api, LightningElement, track, wire } from 'lwc';
import { CurrentPageReference ,NavigationMixin} from 'lightning/navigation';
import saveEventApex from '@salesforce/apex/RH_EventController.saveEventApex';
import sendEventApex from '@salesforce/apex/RH_EventController.sendEventApex';



import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
import { icons } from 'c/rh_icons';
import { labels } from 'c/rh_label';

const DRAFT='Draft';
const SUBMIT='Submitted';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';
const CANCEL_ACTION = 'Cancel';
const SAVE_ACTION = 'Save';

const FILE_KEY='fileInput';
export default class Rh_event_edit extends NavigationMixin(LightningElement) {
    @track 
    fileData;
    @api eventId;
    @api currentEvent;
    @track inputsItems;
    @wire(CurrentPageReference) pageRef;
    
    action;
    icon={...icons};
    label={...labels};
    

    connectedCallback() {
        this.buildForm();
    }
    get editLabel(){return this.isNew ? this.label?.AddNewEvent :  this.label?.UpdateEvent;}
    get isNew() { return this.eventId ? false : true; }
    get saveLabel(){ return this.isNew ? this.label?.Save: this.label?.Update}
    buildForm(){
        const startTime=new Date().toISOString();
        this.inputsItems =[
            {
                label: this.label.Name,
                placeholder: this.label.NamePlc,
                name:'Name',
                type:'text',
                value:this.currentEvent?.Name,
                required:true,
                ly_md:'12', 
                ly_lg:'12',
                ly_xs:'12',
            },
            {
                label: this.label.Start,
                name:'StartDate',
                type:'Datetime',
                value:this.currentEvent?.Start_Dates__c,
                required:true,
                min: startTime,
                ly_md:'6', 
                ly_lg:'6',
                ly_xs:'12',
            },
            {
                label: this.label.End,
                name:'EndDate',
                type:'Datetime',
                min: startTime,
                value:this.currentEvent?.End_Dates__c,
                ly_md:'6', 
                ly_lg:'6',
                ly_xs:'12',
            },
            {
                label: this.label.Description,
                placeholder: this.label.DescriptionPlc,
                name:'Description',
                type:'textarea',
                value:this.currentEvent?.Description__c,
                required:true,
                ly_md:'12', 
                ly_lg:'12',
                ly_xs:'12'
            }
        ];

        const fileInput={
            label: this.label.UploadFile,
            // placeholder: this.label.DescriptionPlc,
            name:FILE_KEY,
            accept:".xlsx, .xls, .csv, .png, .doc, .docx, .pdf",
            type:"file" ,
            required:false,
            ly_md:'12', 
            ly_lg:'12',
            ly_xs:'12'
                                        
        }
        this.inputsItems.push(fileInput);
    }
    handleChanged(event){
        // this.rendered=false;
        const info=event.detail.info;
        if (info?.name==FILE_KEY) {
            this.openfileUpload(info.file)
        }
        console.log(event.detail.info);
        // this.publishChangedEvt({info: event.detail.info , event:event.detail.event});
    }
    openfileUpload(file) {
        this.bool = true;
        // const file = event.target.files[0]
        var reader = new FileReader()
        reader.onload = () => {
            var base64 = reader.result.split(',')[1]
            this.fileData = {
                'name': file.name,
                'base64': base64,
                'recordId': ''
            }
            console.log('File ===> ',this.fileData);
        }
        reader.readAsDataURL(file)
    }
    // handleCancel(){

    // }
    // handleSave(){

    // }
    // handleSend(){

    // }
    handleCancel(){
        this.action=CANCEL_ACTION;
        this.callParent(this.action,{});
        // window.history.back();
    }

    handleSave(evt){
        let record=this.prepareApexSave();
        if (record) {
            console.log(`record to Save `, record);
            if (this.isNew) {
                record.Status=DRAFT;
            }
           this.handleSaveApex(record,'Ss');
        }
    }
    handleSend(){
        let record=this.prepareApexSave();
        if (record) {
            console.log(`record to Send`, record);
            record.Status=SUBMIT;
            this.handleSendApex(record,'Ss');
        }
    }
    gotoDetail(){
        var pagenname ='Event';
        let states={'recordId': this.eventId};
        this.goToPage(pagenname,states);
    }
    prepareApexSave(){
        let record={};
        let result= this.save();
        if (result.isvalid) {
            record={...record,...result.obj};
            if (record.StartDate > record.EndDate ){
                // this.showToast('info', 'Toast Info', this.label.ToastInfoEvent2);
                this.showToast(WARNING_VARIANT,this.label.warningO,this.label.warn_period_confict );
                return void 0;
            }

            record.fileObj={  base64:this.fileData?.base64, filename:this.fileData?.name};
            record.hasfile=this.fileData?.name ? true : false;
        }else{
            console.log(`Is not valid `);
            return void 0;
        }
        record.Id=this.eventId ? this.eventId : null;
        return record;
    }
    handleSaveApex(obj,from=''){

        console.log('3--> obj', obj);
        this.startSpinner(true);
        saveEventApex({ objEven: JSON.stringify(obj)})
        .then(result => {
            console.log('### result handleSaveApex----->', result);
            if(this.isNew){
                this.showToast(SUCCESS_VARIANT,this.label.successOp, this.label.SuccessEven);
            }else{
                this.showToast(SUCCESS_VARIANT,this.label.successOp,this.label.EvenUpdateS);
            }
            this.eventId =result.Id;
            console.log('result _evId---> ', this.eventId);
            this.gotoDetail();
            
        })
        .catch(error => {
            console.error('error:', error);
            this.showToast(ERROR_VARIANT,'ERROR', (error?.body?.message|| error));
            // this.showToast('error', 'Error', this.label.FieldsError);
        })
        .finally(()=>{
            this.startSpinner(false);
        });
    }
    handleSendApex(obj,from=''){

        console.log('3--> obj', obj);
        this.startSpinner(true);
        sendEventApex({ objEven: JSON.stringify(obj)})
        .then(result => {
            console.log('### result handleSaveApex----->', result);
            
            if(this.isNew){
                this.showToast(SUCCESS_VARIANT,this.label.successOp, this.label.EvenSendSuccess);
            }else{
                this.showToast(SUCCESS_VARIANT,this.label.successOp,this.label.EvenUpdateSS);
            }
            this.eventId =result.Id;
            console.log('result _evId---> ', this.eventId);
            this.gotoDetail();
            
        })
        .catch(error => {
            console.error('error:', error);
            this.showToast(ERROR_VARIANT,'ERROR', (error?.body?.message|| error));
            // this.showToast('error', 'Error', this.label.FieldsError);
        })
        .finally(()=>{
            this.startSpinner(false);
        });
    }
    save(){
        let form=this.template.querySelector('c-rh_dynamic_form');
        console.log(form);
        let isvalid=true, obj={};
        const saveResult=form?.save();
        console.log(`>>>>>>>>>>>>saveResult `, saveResult );
        let outputs = saveResult.outputs;
        isvalid=isvalid && saveResult.isvalid;
        console.log(`>>>>>>>>>>>>outputs `, outputs );
        obj=saveResult.obj;
        console.log(`>>>>>>>>>>>>obj `, obj );
        // let {obj,isvalid}=saveResult;
        return  {isvalid,obj};
    }

    callParent(actionName,data){
        var actionEvt =new CustomEvent('action',
         {detail: { action : actionName,data }}
      );
      console.log("Watch: actionName ->"+actionName); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }
    goToPage(pagenname,state={}) {
        let states=state; 
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }
    startSpinner(b){
       fireEvent(this.pageRef, 'Spinner', {start:b});
    }
    showToast(variant, title, message){
        fireEvent(this.pageRef, 'Toast', {variant, title, message});
    }

}