import { api, LightningElement } from 'lwc';

export default class Rh_dynamic_form extends LightningElement {
    @api inputsItems=[];
     items=[];
    @api title;
    @api timeOut;
    @api backcolor;
    
    @api fileData;
    section = 'form-section';
    rendered;


    preCompileDefaultValues(){
        this.timeOut=this.timeOut || 0;
        this.inputsItems=this.inputsItems?.map(function(item, index) {
            let elt={...item};
            elt.ly_xs=  elt.ly_xs ?  elt.ly_xs: '12';
            elt.ly_md=  elt.ly_md ?  elt.ly_md: '4';
            elt.ly_lg=  elt.ly_lg ?  elt.ly_lg: '3';
            elt.keyField=  elt.name+ new Date().getTime();

            return elt;
        });

        console.log(`this.inputsItems`, this.inputsItems);
        
        
        
    }
    regenerateKeys(){
        this.inputsItems=this.inputsItems?.map(function(item, index) {
            let elt={...item};
            elt.keyField=  elt.name+ new Date().getTime();
            return elt;
        });

        console.log(`this.inputsItems`, this.inputsItems);
    }
     backgroundcolor(){
        console.log('get');
        let addbackgroung = this.template.querySelector('[data-id="section"]');
        if(this.backcolor && addbackgroung){
           return addbackgroung.classList.add('backgroundcolor');
        } 
    }
    
    connectedCallback(){
        this.timeOut=this.timeOut || 0;
        console.log('ddd');
        // let addbackgroung = this.template.querySelector('[class="form-section"]');
        // let addbackgroung = this.template.querySelector('[data-id="section"]');
        // if(this.backcolor){
        //     addbackgroung.classList.add('backgroundcolor');
        // }
        // this.title=this.title || 'Form 0';
        this.inputsItems=(this.inputsItems?.length>0)?this.inputsItems:[]
       this.preCompileDefaultValues();
    //    setTimeout(() => {
    //     this.inputsItems=[]
    //     console.log(`@@@@@@@@@@@@@@@@@@@@@@@@@@@in Timeout`);
    //   }, 10e3);
    // this.items=[...this.inputsItems];
        
    }
    renderedCallback(){
        console.log('renderedCallback >>>> Rh_dynamic_form');
    }
    
    @api save(){
        const isvalid =this.validateFields(); 
        let output={};
        let outputs=[];
        let outputsItems=[];
        if (isvalid) {
            let self=this;
            this.inputsItems.forEach(function(item){
                const key=item.name;
                let cmp=self.template.querySelector(`c-rh_dynamic_form_item[data-item-id="${key}"]`);
                // const cmp=self.template.querySelector(`[data-id="${key}"]`);
                if (cmp) {
                     let saveFieldResult=cmp.saveField();
                     outputs=outputs.concat(saveFieldResult.outputs);
                     outputsItems=outputsItems.concat(saveFieldResult.outputsItems);
                     output={...output , ...saveFieldResult.obj};
                }
            });
        }
        // console.log('OUTPUT VALUE : ',output);
        console.log('OUTPUTS VALUES  PARENT outputsItems111 : ',{isvalid,outputs,obj:output,outputsItems});
        return {isvalid,outputs,obj:output,outputsItems};
    }

    timer;
   handleChanged(event){
        // this.rendered=false;
        console.log(event.detail.info);
        this.publishChangedEvt({info: event.detail.info , event:event.detail.event});
    }
    handleLookupCreation(event){
        const info = event.detail;
        const createEvent = new CustomEvent('createlookup', {detail: info});
               this.dispatchEvent(createEvent);
    }
    publishChangedEvt(evt){
        console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$4 Publish evt ' ,evt);
        
        const event = new CustomEvent('inputchanged', {detail: evt});
               this.dispatchEvent(event);
        
    }

   @api validateFields() {
    console.log('start verification');   
    let isvalid = true;
    let self=this;
    this.inputsItems.forEach(function(item){
        let key=item.name;
        
        let cmp=self.template.querySelector(`c-rh_dynamic_form_item[data-item-id="${key}"]`);
        if (cmp) {
            isvalid = isvalid && cmp.validateField();
            // if(!cmp.reportValidity('')) {
            //     isvalid = false;
            // }
        }
    });
   
        // console.log('>>>>>> inputsItems ',this.inputsItems);
    console.log('@@@@@@@@@@ isvalid '+isvalid);
    return isvalid;
    }
    @api updateField(key,updates,type='default') {
        
        let cmp=this.template.querySelector(`c-rh_dynamic_form_item[data-item-id="${key}"]`);
        if (cmp) {
            return cmp.updateField(updates,type);
        }
        return false;
    }
   attachDataListsToTextBox(){
    const dataLists=this.template.querySelectorAll('[data-type="dataList"]');
    dataLists.forEach(dataList => {
        console.log(`dataList>>> element`);
        console.log(dataList);
        const dataListId = dataList.id;
        const key = dataList.dataset.listid;
        console.log(`dataList>>> key `,key);
        const input = this.template.querySelector('[data-id="' + key + '"]')
        if (input) {
            input.setAttribute("list", dataListId);
        }
    });
   }
   attachDataListToTextBox(inputName, dataListName) {
        const dataList = this.template.querySelector('[data-id="' + dataListName + '"]');
        if (dataList) {
            const dataListId = dataList.id;
            const input = this.template.querySelector('[data-id="' + inputName + '"]')
            if (input) {
                input.setAttribute("list", dataListId);
            }
        }
    }




}