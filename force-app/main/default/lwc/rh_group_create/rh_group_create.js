import { api, LightningElement } from 'lwc';
import getContactLeader from '@salesforce/apex/RH_groupController.getContactLeader';
import createGroupe from '@salesforce/apex/RH_groupController.createGroupe';
import { labels } from 'c/rh_label';

export default class Rh_group_create extends LightningElement {
    l={...labels}
    @api
    fieldInputs;
    leaders=[]; 
    @api objGroupe;
    @api groupeId;
    @api labelButton='Next';
    @api logo="utility:chevronright";
    @api newGroup = this.l.NewGroup;
    @api name = 'Next';
    @api statusGroup;
    updateView;
    handleClick (event){       
        console.log('source du button --->:', event.target.name);
        console.log('updateView dans le save--->:', this.updateView);
        console.log('statut groupe --->:', this.statusGroup);
        if( event.target.name=='Next'){
            this.statusGroup = 'Draft'
        }
       let form=this.template.querySelector('c-rh_dynamic_form');
        let saveResult=form.save();
        let outputs = saveResult.outputs;

        if (!outputs?.length > 0) {
             console.log('----required field missing -----');
             return ;        
        }
        this.template.querySelector('c-rh_spinner').start();
            createGroupe({ name: saveResult.obj.Namex, 
                           description: saveResult.obj.Description, 
                           Leader: saveResult.obj.Leader,
                           id: this.groupeId,
                           statut: this.statusGroup})
              .then(result => {
                console.log('Result:', result); 
                    this.dispatchEvent(new CustomEvent('groupmember',{detail: result})); 
                    this.template.querySelector('c-rh_spinner').stop();              
              })
              .catch(error => {
                console.error('Error:', error);
                this.template.querySelector('c-rh_spinner').stop();
            });
                         
    }
    handleClick1(){
        this.dispatchEvent(new CustomEvent('backto'));
    }
    formLoaded;
    initDefault(){
        this.fieldInputs= [
            {
                label: this.l.Name,
                placeholder:'Enter Name',
                name:'Namex',
                value: this.objGroupe?.Name,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Leader,
                placeholder:this.l.Leader,
                name:'Leader',
                value: this.objGroupe?.RH_Team_Leader__c,
                picklist:true,
                options:this.leaders,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Description,
                name:'Description',
                value:this.objGroupe?.RH_Description__c,
                placeholder:this.l.DescriptionPlc,
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
    console.log('backSource create--->:', this.backSource);
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
        this.updateView = true;
        console.log('updateView dans connectedCallback--->:', this.updateView);
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