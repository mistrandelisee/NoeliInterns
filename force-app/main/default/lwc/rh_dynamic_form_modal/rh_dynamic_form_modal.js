import { LightningElement,api,track } from 'lwc';
import { labels } from 'c/rh_label';

export default class Rh_dynamic_form_modal extends LightningElement {
@api formModalInputs;
operation;
record;
@api title;
@api backcolor;
@api modalCss;
@api
btnOkLabel = 'Create';
l={...labels}
@api
btnCancel
@api
btnCreate
connectedCallback(){
    this.btnCancel= this.btnCancel ? this.btnCancel : this.l.Cancel;
    this.btnCreate= this.btnCreate ? this.btnCreate : this.l.Submit;
}
cancelRequest(){ 
    this.operation = 'negative';
    let obj ={};
    obj.operation = this.operation;
    obj.fields = {};
    const myEvent = new CustomEvent('buttonclicked', {
        detail: obj
    });
    this.dispatchEvent(myEvent);
}

handleSave(evt){
    this.operation = 'positive';
    let obj={};
    let result= this.save();
    obj.isvalid=result.isvalid;
    obj.operation = this.operation;
    if (result.isvalid) {
        
        this.record={...this.record,...result.obj};
        obj.fields = this.record;
       

        // this.emp[TYPE_FIELD_NAME]=this.empType;
    }else{
        console.log(`Is not valid `);
    }
    
    console.log(`emp`, this.record);
    const myEvent = new CustomEvent('buttonclicked', {
        detail: obj
    });
    this.dispatchEvent(myEvent);
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

}