import { api, LightningElement } from 'lwc';

export default class Rh_dynamic_form extends LightningElement {
    @api inputsItems=[];
    @api title;
    @api backcolor;
    section = 'form-section';
     

    preCompileDefaultValues(){
        this.inputsItems=this.inputsItems?.map(function(item, index) {
            let elt={...item};
            elt.ly_xs=  elt.ly_xs ?  elt.ly_xs: '6';
            elt.ly_md=  elt.ly_md ?  elt.ly_md: '4';
            elt.ly_lg=  elt.ly_lg ?  elt.ly_lg: '3';
            elt.isTextarea=  elt.type=='textarea' ? true: false;
            elt.isText=  elt.type=='text' ? true: ! (elt.isTextarea || elt.picklist);//is text or not textarea or picklist
            console.log(`elt`, elt);
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
    renderedCallback(){
        this.backgroundcolor();
    }
    connectedCallback(){
        console.log('ddd');
        // let addbackgroung = this.template.querySelector('[class="form-section"]');
        // let addbackgroung = this.template.querySelector('[data-id="section"]');
        // if(this.backcolor){
        //     addbackgroung.classList.add('backgroundcolor');
        // }
        // this.title=this.title || 'Form 0';
        this.inputsItems=(this.inputsItems?.length>0)?this.inputsItems:[]
        this.preCompileDefaultValues();
        
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
                const cmp=self.template.querySelector(`[data-id="${key}"]`);
                if (cmp) {
                     output[key]=cmp.value;
                    if (item.type=='datetime') {
                        try {
                            let dateTimevalue=cmp.value;
                            let datevalue=dateTimevalue? new Date(dateTimevalue).toLocaleDateString() :'';
                            let datelabel=item.label?  item.label.replace('/','').replace('ora','').replace('hour','') :' Date';
                            let timevalue=dateTimevalue? new Date(dateTimevalue).toLocaleTimeString() :'';
                            let timelabel=item.label?  item.label.replace('/','').replace('Data','').replace('Date','') :' Time';

                            outputs.push({label:datelabel,name:key+'d',value:datevalue});
                            outputs.push({label:timelabel,name:key+'t',value:timevalue});
                        } catch (error) {
                            console.log('OUTPUT  : Error while spliting date time output ',error);
                            outputs.push({label:item.label,name:key,value:cmp.value});
                        }
                        
                    }else{
                        outputs.push({label:item.label,name:key,value:cmp.value});
                    }
                    
                    outputsItems.push({...item,value:cmp.value});
                }
            });
        }
        // console.log('OUTPUT VALUE : ',output);
        console.log('OUTPUTS VALUES : ',outputs);
        console.log('OUTPUTS VALUES outputsItems : ',outputsItems);
        return {isvalid,outputs,obj:output,outputsItems};
    }
    timer;
    handleChanged(event) {
        const value = event.detail.value;
        console.log('OUTPUT : ',value);
        clearTimeout(this.timer);
        this.timer=setTimeout(() => {
            this.publishChangedEvt(event);
        }, 2000);
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
            let cmp=self.template.querySelector(`[data-id="${key}"]`);
            if (cmp) {
                isvalid = isvalid && cmp.reportValidity('');
                // if(!cmp.reportValidity('')) {
                //     isvalid = false;
                // }
            }
        });
        // console.log('>>>>>> inputsItems ',this.inputsItems);
       console.log('@@@@@@@@@@ isvalid '+isvalid);
       return isvalid;
   }




}