import { api, LightningElement,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import { labels } from 'c/rh_label';

import getTimeSheet from '@salesforce/apex/RH_Timesheet_Controller.getTimeSheet';
import timeSheetCreation from '@salesforce/apex/RH_Timesheet_Controller.timeSheetCreation';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
const NEW_ACTION='New';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';


const ERROR_VARIANT='error';
const FROMRESETPWD='ResetPWD';
const RESET_ACTION='Reset';
const SAVE_ACTION='Save';

const ACTIVE_ACTION='active';
const DISABLE_ACTION='banned';
const FREEZE_ACTION='frozen';
const PROMOTE_ACTION='PromoteBaseUser';
const CARD_ACTION='stateAction';

const FROM_CHILD='FROM_CHILD';
const FROM_PARENT='FROM_PARENT';
export default class Rh_details_test extends LightningElement {
    l={...labels}
    /*StatusActions=[


        {
            variant:"base",
            label:this.l.Activate,
            name:ACTIVE_ACTION,
            title:this.l.Activate,
            iconName:"utility:user",
            class:"active-item"
        },
        {
            variant:"base",
            label:this.l.Freeze,
            name:FREEZE_ACTION,
            title:this.l.Freeze,
            iconName:"utility:resource_absence",
            class:"freeze-item"
        },
        {
            variant:"base",
            label:this.l.Disable,
            name:DISABLE_ACTION,
            title:this.l.Disable,
            iconName:"utility:block_visitor",
            class:"disable-item "
        }

    ]
    RoleActions=[
        {
            variant:"base",
            label:this.l.PromoteBaseUser,
            name:PROMOTE_ACTION,
            title:this.l.PromoteBaseUser,
            iconName:"utility:user",
            // class:"active-item"
        }
    ]*/
    detailsActions=[
        {   variant:"brand-outline",
            class:" slds-m-left_x-small",
            label:"New",
            name:NEW_ACTION,
            title:"New",
            iconName:"utility:add",
            // class:"active-item"
        }
    ]
    @api
    recordId;
    record;
    timeSheetFields=[];
    timesheetEntries=[];
    sheetNotFounded;
    get hasDetailsActions(){ return this.detailsActions?.length >0}
    get hasSheetInfo(){  return this.record?true:false; }
    connectedCallback(){
        console.log('RECORDID connectedCallback ',this.recordId);
        //this.getTimsheetApex();
    }
    getTimsheetApex(){
        this.startSpinner(true);
        console.log('RECORDID getTimsheetApex ',this.recordId);
        getTimeSheet({ timesheetId: this.recordId })
          .then(result => {
            console.log('Result', result);
            
            if (!result.error && result.Ok) {
                this.record=result.TimeSheet;
                if (this.record?.Id) {
                    this.timesheetEntries= result.TimeSheet?.TimeSheetEntries || [];
                    this.buildTimeSheetFields();
                }else{
                    this.sheetNotFounded=true;
                }
            }else{
                this.showToast(WARNING_VARIANT,'ERROR', result.msg);
            }
          })
          .catch(error => {
            this.sheetNotFounded=true;
            this.showToast(ERROR_VARIANT,'ERROR', error.message);
            console.error(error);
        })
        .finally(() => {
            this.startSpinner(false);
        });
    }
    
}