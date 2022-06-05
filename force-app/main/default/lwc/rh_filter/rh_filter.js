import {api, LightningElement, track } from 'lwc';

const labels= {
    Submit: 'Submit',
    Reset: 'Reset'
}

export default class Rh_filter extends LightningElement {

    inputChanged={};

    //@api fieldDetails=[];
//  

    fieldDetails=[
        {
            label:'Title',
            placeholder:'Enter Title',
            name:'Name',
            value:'Kbrel',
            required:true,
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
        }];

    @track fieldDetailsCopy=[];  

    @api title;
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
        this.fieldDetailsCopy= Object.values(this.fieldDetails);
    }

    handleActions(event){
        const action= event.detail.action;
        switch (action){
            case 'Submit':  
                            let form=this.template.querySelector('c-rh_dynamic_form').save();
                            //this.resetField();
                           
                            this.publishChangedEvt('submit',form?.obj);
                         break;
            case 'Reset':  
                         //this.fieldDetailsCopy=this.fieldDetails;
                         this.resetField();
                         this.publishChangedEvt('reset',{});
                      break;
        }
    }
    regenerateKeys(){
        this.fieldDetailsCopy=this.fieldDetailsCopy?.map(function(item, index) {
            let elt={...item};
            elt.name=  elt.name+ new Date().getTime();
            return elt;
        });

        console.log(`this.inputsItems`, this.inputsItems);
    }
    resetField(){
        this.regenerateKeys();
        
        setTimeout(() => {
            this.fieldDetailsCopy=[...this.fieldDetails];
        }, 10);
    }
    
    publishChangedEvt(evtName, evt){ 
        const event = new CustomEvent(evtName, {detail: evt});
               this.dispatchEvent(event);
        
    }
}