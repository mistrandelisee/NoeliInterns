import { api, LightningElement } from 'lwc';

export default class Rh_preview extends LightningElement {
    @api inputsItems=[];


    closeModal(){
        var actionEvt =new CustomEvent('action',
            {detail: { action : 'closeModal'}}
        );

        this.dispatchEvent(actionEvt);
    }

    connectedCallback(){
        this.inputsItems=(this.inputsItems?.length>0)?this.inputsItems:[]
        this.preCompileDefaultValues();   
    }

    preCompileDefaultValues(){
        this.timeOut=this.timeOut || 0;
        this.inputsItems=this.inputsItems?.map(function(item, index) {
            let elt={...item};
            elt.isImage=  elt.type=='image' ? true: false;
            console.log(`elt`, elt);
            return elt;
        });
        console.log(`this.inputsItems`, this.inputsItems);       
    }


}