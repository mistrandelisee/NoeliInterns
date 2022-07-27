import { LightningElement,wire,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { labels } from 'c/rh_label';
import { icons } from 'c/rh_icons';
import timeSheetCreation from '@salesforce/apex/RH_Timesheet_Controller.timeSheetCreation';
import invoiceCreation from '@salesforce/apex/RH_Invoice_Controller.invoiceCreation';
import accountCreation from '@salesforce/apex/RH_Invoice_Controller.accountCreation';
import userCreation from '@salesforce/apex/RH_Users_controller.userCreation';

import checkUserCreation from '@salesforce/apex/RH_Users_controller.checkUserCreation';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
//Constants
const MODAL_MODE = 'modal';
const STD_MODE='std';


const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';
const PAGENAME ='rhtimesheet'

export default class Rh_timesheet_creation extends NavigationMixin(LightningElement) {
    l={...labels,
        new_timesheet:'New timesheet'}
    DEFAULT_CURRENCY='EUR';
    curriencies=[
        { label: 'EUR', value: 'EUR' },
        { label: 'FCFA', value: 'FCFA' },
    ];
    @api mode=STD_MODE;
    icon={...icons}
    @api action='';
    
    formInputs=[];
    @api timesheet;

    @wire(CurrentPageReference) pageRef;

    get asModal(){
        return this.mode==MODAL_MODE;
    }
    get asStd(){
        return this.mode==STD_MODE;
    }
    handleCancel(){
        this.callParent('cancel',{});
    }
    connectedCallback(){
        this.buildForm();
    }
    
    handleModalCreateTimesheet(event){
        const info = event.detail;
        console.log(JSON.stringify(info));
        if (info.operation=='positive') {
            if (info.isvalid) {
               const record ={...info.fields} ;
               this.prepareSave(record);
            }
        }else{
            this.handleCancel();
        }
    }
    createTimesheetApex(timesheet){
        this.startSpinner(true);
        timesheet={...timesheet, Id:this.timesheet?.Id}
        timeSheetCreation({
            sheetJson: JSON.stringify(timesheet)
        })
          .then(result => {
            console.log('Result timeSheetCreation');
            console.log( result);

            if (!result.error && result.Ok) {
                this.goToTimeSheetDetail(result.Timesheet.Id);
            }else{
                this.showToast(WARNING_VARIANT,this.l.warningOp, result.msg);
            }
          })
          .catch(e => {
            this.showToast(ERROR_VARIANT,this.l.errorOp, e.message);
            console.error(e);
        })
        .finally(() => {
            this.startSpinner(false);
        });
    }
    goToTimeSheetDetail(recordid) {
        let states={'recordId': recordid}; 
        this.goToPage(PAGENAME,states);
    }
    goToPage(pagenname,statesx={}) {
        let states=statesx; 
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }
    prepareSave(timesheet){
        if (timesheet.startDate<timesheet.endDate) {
            this.createTimesheetApex(timesheet);
        }else{
            console.warn('Start date must before end date');
            this.showToast(WARNING_VARIANT,this.l.warningO,this.l.warn_period_confict );
        }
    }
    handleSave(evt){
        let timesheet={};
        let result= this.save();
        if (result.isvalid) {
            
            timesheet={...timesheet,...result.obj};
            console.log(timesheet);
            this.prepareSave(timesheet)
        }else{
            console.log(`Is not valid `);
        }
    }
    save(){
        let form=this.template.querySelector('c-rh_dynamic_form');
        console.log(form);
        let isvalid=true;  
        let obj={};
        
        let saveResult=form.save();
        console.log(`>>>>>>>>>>>>saveResult `, saveResult );
        let outputs = saveResult.outputs;
        isvalid=isvalid && saveResult.isvalid;
        console.log(`>>>>>>>>>>>>outputs `, outputs );
        obj=saveResult.obj;
        console.log(`>>>>>>>>>>>>obj `, obj );
        return  {isvalid,obj};
    }
    get disabledfields(){ 
        return {
            all: this.timesheet?.TimeSheetEntries?.length > 0 
        }
    }

    buildForm(){
        this.formInputs=[
            
            {
                label:this.l.StartDate,
                placeholder:this.l.StartDate,
                name:'startDate',
                required:true,
                value: this.timesheet?.StartDate,
                readOnly:this.disabledfields?.all || this.disabledfields?.start,
                type:'Date',
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.EndDate,
                placeholder:this.l.EndDate,
                readOnly:this.disabledfields?.all || this.disabledfields?.end,
                name:'endDate',
                required:true,
                value: this.timesheet?.EndDate,
                type:'Date',
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
        
        ]
    }
    callParent(actionName,data){
        var actionEvt =new CustomEvent('action',
         {detail: { action : actionName,data }}
      );
      console.log("Watch: actionName ->"+actionName); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }
    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
    }
    showToast(variant, title, message){
        fireEvent(this.pageRef, 'Toast', {variant, title, message});
    }
}