import { api, LightningElement } from 'lwc';

export default class Lwc_mocker_child extends LightningElement {

    @api
    formsInputs=[];
    get _formsInputs(){
        if(this.formsInputs?.length > 0) return [...this.formsInputs];
    }

    modifier(){
        console.log('IN modifier >>> formsInputs BEFORE');
        console.log(JSON.stringify(this.formsInputs));
        this.formsInputs=this.formsInputs.map(function(e){
            return {...e, join:e.name+e.value}
        })
        
        console.log('IN modifier >>> formsInputs AFTER');
        //console.log(JSON.stringify(this.formsInputs));
    }
    connectedCallback(){
        console.log('IN connectedCallback >>> formsInputs');
        //console.log(JSON.stringify(this.formsInputs));

    }
    renderedCallback(){
        console.log('IN renderedCallback >>> formsInputs');
        //console.log(JSON.stringify(this.formsInputs));
        //this._formsInputs = [...this.formsInputs];
        // this.modifier();
        let li = this.template.querySelectorAll('lightning-input');
        li.forEach(element => {
            console.log(`element.value`, element.value);
        });
    }

    get formsInputsjson(){
        return JSON.stringify(this.formsInputs);
    }
}