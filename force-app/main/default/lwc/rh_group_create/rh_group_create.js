import { api, LightningElement } from 'lwc';
import getContactLeader from '@salesforce/apex/RH_groupController.getContactLeader';
import createGroupe from '@salesforce/apex/RH_groupController.createGroupe';

export default class Rh_group_create extends LightningElement {
    @api
    fieldInputs;
    leaders=[];
    handleClick (){
     
    /*    let form=this.template.querySelector('c-rh_dynamic_form');
        let saveResult=form.save();
        let outputs = saveResult.outputs;
     
            createGroupe({ name: saveResult.obj.Namex, 
                           description: saveResult.obj.Description, 
                           Leader: saveResult.obj.Leader })
              .then(result => {
                console.log('Result:', result); */
                this.dispatchEvent(new CustomEvent('groupmember')); 
   /*           })
              .catch(error => {
                console.error('Error:', error);
            });             */
    }
    
    formLoaded;
    initDefault(){
        this.fieldInputs= [
            {
                label:'Name',
                placeholder:'Enter Name',
                name:'Namex',
                value: '',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Leader',
                placeholder:'Leader',
                name:'Leader',
                value: '',
                picklist:true,
                options:this.leaders,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Description',
                name:'Description',
                value:"",
                placeholder:'Give a description for the group',
                className:'textarea',
                maxlength:25000,
                type:'textarea',
                ly_md:'12', 
                ly_lg:'12'
            }
        ]
    }
    connectedCallback(){
    //    this.initDefault();
       getContactLeader()
          .then(result => {
            console.log('Result', result);
            this.leaders= result.map(function(item ) {
                return { label: item.Name,value: item.Id}
            });
            this.initDefault();
            this.formLoaded=true
          })
          .catch(error => {
            console.error('Error:', error);
        });
     }


     handleCancel(){
        this.action='';
    }
    handleSave(evt){
        let record={};
        let result= this.save();
        if (result.isvalid) {     
            record={...record,...result.obj};
            // this.emp[TYPE_FIELD_NAME]=this.empType;

            this.callParent("SAVE_ACTION",record)
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
         {detail: { action : actionName,from:FROMINFO,data }}
      );
      console.log("Watch: actionName ->"+actionName); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }
}