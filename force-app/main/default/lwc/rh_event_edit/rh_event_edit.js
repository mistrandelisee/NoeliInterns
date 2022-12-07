import { api, LightningElement, track, wire } from 'lwc';
import { CurrentPageReference ,NavigationMixin} from 'lightning/navigation';


import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
import { icons } from 'c/rh_icons';
import { labels } from 'c/rh_label';

const DRAFT='Draft';
const SUBMIT='Submitted';

export default class Rh_event_edit extends NavigationMixin(LightningElement) {
    
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
    get editLabel(){return this.isNew ? this.label?.AddNewEvent :  this.label?.UpdateEven;}
    get isNew() { return this.eventId ? false : true; }
    get saveLabel(){ return this.isNew ? this.label?.Save: this.label?.Update}
    buildForm(){
        this.inputsItems =[
            {
                label: this.label.Name,
                placeholder: this.label.NamePlc,
                name:'Name',
                type:'text',
                value:this.currentEvent?.EventName,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label: this.label.StartDate,
                placeholder: this.label.StartDatePlc,
                name:'StartDate',
                type:'Datetime',
                value:this.currentEvent?.StartDate,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label: this.label.Description,
                placeholder: this.label.DescriptionPlc,
                name:'Description',
                type:'textarea',
                value:this.currentEvent?.Description,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label: this.label.EndDate,
                placeholder: this.label.EndDatePlc,
                name:'EndDate',
                type:'Datetime',
                value:this.currentEvent?.EndDate,
                ly_md:'6', 
                ly_lg:'6'
            }
        ];
    }
    // handleCancel(){

    // }
    // handleSave(){

    // }
    // handleSend(){

    // }
    handleCancel(){
        this.action='';
        this.callParent(this.action,{});
        // window.history.back();
    }

    handleSave(evt){
        let record={};
        let result= this.save();
        if (result.isvalid) {
            record={...record,...result.obj};
            // this.callApexSave(record);
        }else{
            console.log(`Is not valid `);
        }
        console.log(`record `, record);
    }
    save(){
        let form=this.template.querySelector('c-rh_dynamic_form');
        console.log(form);
        //let isvalid=true, obj={};
        const saveResult=form?.save();
        console.log(`>>>>>>>>>>>>saveResult `, saveResult );
        /*let outputs = saveResult.outputs;
        isvalid=isvalid && saveResult.isvalid;
        console.log(`>>>>>>>>>>>>outputs `, outputs );
        obj=saveResult.obj;
        console.log(`>>>>>>>>>>>>obj `, obj );*/
        let {obj,isvalid}=saveResult;
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
        /*let spinner=this.template.querySelector('c-rh_spinner');
        if (b) {    spinner?.start(); }
            else{   spinner?.stop();}*/
       fireEvent(this.pageRef, 'Spinner', {start:b});
    }
    showToast(variant, title, message){
        /*
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);*/
        fireEvent(this.pageRef, 'Toast', {variant, title, message});
    }

}