import { api, LightningElement } from 'lwc';

export default class Rh_extra_field_item extends LightningElement {
    @api
    fieldInputs;
    @api
    fieldKey;
    connectedCallback(){
        this.initDefault();
    }

    initDefault(){
        this.fieldInputs= [
            {
                label:'',
                placeholder:'..label',
                name:'Label',
                value: '',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'',
                placeholder:'..value',
                name:'Value',
                value: '',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
        ];
    }
    handledelte(){
        this.callParent('DELETE_ACTION',{})
    }
    handlesave(evt){
        let record={};
        let result= this.save();
        if (result.isvalid) {
            record={...record,...result.obj};
            this.callParent('SAVE_ACTION',record)
        }else{
            console.log(`Is not valid `);
        }
        console.log(`record `, record);
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

    callParent(actionName,data){
        var actionEvt =new CustomEvent('action',
         {detail: { action : actionName,data,fieldkey:this.fieldkey }}
      );
      console.log("Watch: actionName ->"+actionName); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }
}