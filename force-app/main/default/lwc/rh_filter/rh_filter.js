import {api, LightningElement, track } from 'lwc';
import { icons } from 'c/rh_icons';

const labels= {
    Submit: 'Submit',
    Reset: 'Reset'
}

export default class Rh_filter extends LightningElement {

    inputChanged={};
    displayFields=false;
    icon={...icons};
    pillList=[];
    form;

    labelRemove={};

    //@api fieldDetails=[];
//  

    fieldDetails=[
        {
            label:'Title',
            placeholder:'Enter Title',
            name:'Name',
            
            required:false,
            ly_md:'6', 
            ly_lg:'6'
        },
        {
            label:'Activate ?',
            name:'IsActive__c',
            checked:true,
            value:"Yes",
            type:'toggle',
            ly_md:'6', 
            ly_lg:'6'
        },
        {
            label:'description',
            placeholder:'Enter description',
            name:'Description',
            required:false,
            ly_md:'6', 
            ly_lg:'6'
        },
        {
            label:'do you agree? ',
            name:'Agree',
            required:false,
            ly_md:'6', 
            ly_lg:'6'
        }];
        
    @api title="Filter ";
    
    
    @track fieldDetailsCopy=[];  

    //@api title;
    @api timeOut;
    @api backcolor;

    filterAction= [ 
        {
            name: 'Submit',
            title : labels.Submit,
            label: labels.Submit,
            class: 'slds-float_right'
        },
        {
            name: 'Reset',
            title : labels.Reset,
            label: labels.Reset,
            class: 'slds-float_right'
        }
    ];

    connectedCallback(){
        this.fieldDetailsCopy= [...this.fieldDetails];
    }

    handleActions(event){
        const action= event.detail.action;
        switch (action){
            case 'Submit':  
                            this.form=this.template.querySelector('c-rh_dynamic_form').save();
                            this.labelRemove={};
                            this.handlePill(this.form?.obj);
                            this.publishChangedEvt('submit',this.form?.obj);
                         break;
            case 'Reset':  
                         //this.fieldDetailsCopy=this.fieldDetails;
                         this.labelRemove={};
                         this.pillList=[];
                         this.resetField(this.fieldDetails,'reset');
                      break;
        }
    }
    regenerateKeys(elt){
        this.fieldDetailsCopy=elt.map(function(item, index) {
            let elt={...item};
            elt.name=  elt.name+ new Date().getTime();
            return elt;
        });
    }
    resetField(elts,eventName){
        this.regenerateKeys(elts);
        
        setTimeout(() => {
            this.fieldDetailsCopy=[...elts];
        }, 10);

        setTimeout(() => {
            this.form=this.template.querySelector('c-rh_dynamic_form').save();
            this.publishChangedEvt(eventName,this.form?.obj);
        }, 20);
    }
    
    publishChangedEvt(evtName, evt){ 
        const event = new CustomEvent(evtName, {detail: evt});
               this.dispatchEvent(event);
        
    }

    handleDisplayFiled(){
        this.displayFields= !this.displayFields;
    }

    handlePill(field){
        var pillVal=[];
        for(var key in this.fieldDetails){
            let name =this.fieldDetails[key].name;
            let label =this.fieldDetails[key].label;
            let value;
            switch (this.fieldDetails[key]?.type){
                case 'toggle': 
                    value =this.fieldDetails[key].checked;
                    break;
                default:
                    value =this.fieldDetails[key].value;
                    break;
            }

            if(field[name] !== null && String(field[name]).length!=0){
                let obj={};
                obj[name]=field[name];
                obj.label=label;
                obj.pillValue=label +' : '+ field[name];
                pillVal.push(obj);
            } 
        }

        this.pillList=pillVal;
    }

    handleRemovePill(event){
        const pillIndex = event.detail.name;
        let pills= [...this.pillList];
        let elt= pills[pillIndex];
        pills.splice(pillIndex, 1); 
        this.pillList=[...pills];
        
        this.removeFieldValue(elt);
    }

    removeFieldValue(elt){
        var  fieldsCopy= [];
        for(var key in this.fieldDetails){
            fieldsCopy[key]= Object.assign({}, this.fieldDetails[key]);
        }
          
        //let fieldsCopy=[...this.fieldDetails];
        let forms= [...this.form.outputs];
        this.labelRemove[elt.label]='';
        for(var key in fieldsCopy){
            if(!this.labelRemove.hasOwnProperty(fieldsCopy[key].label)){
                if(fieldsCopy[key].type=='toggle'){
                    fieldsCopy[key].checked = forms[key].value;
                }else{
                    fieldsCopy[key].value = forms[key].value;
                } 
            }
             
        }
        this.resetField(fieldsCopy,'removePill');  
    }
}