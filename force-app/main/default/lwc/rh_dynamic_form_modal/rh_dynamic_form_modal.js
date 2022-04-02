import { LightningElement,api,track } from 'lwc';

export default class Rh_dynamic_form_modal extends LightningElement {
@api formModalInputs;
operation;
record;
@api title;
@api backcolor;

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
    if (result.isvalid) {
        
        this.record={...this.record,...result.obj};
        obj.fields = this.record;
        obj.operation = this.operation;
        const myEvent = new CustomEvent('buttonclicked', {
            detail: obj
        });
        this.dispatchEvent(myEvent);

        // this.emp[TYPE_FIELD_NAME]=this.empType;
    }else{
        console.log(`Is not valid `);
    }
    console.log(`emp`, this.record);
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