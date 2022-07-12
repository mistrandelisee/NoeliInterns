import { api, LightningElement } from 'lwc';

export default class Rh_dynamic_form_item extends LightningElement {
    @api item;
    @api timeOut;
    
    timer;
    @api fileData;
    get ly_md(){
        return this.item?.ly_md ?   this.item.ly_md: '4';
    }
    get ly_xs(){
        return this.item?.ly_xs ?   this.item.ly_xs: '12';
    }
    get ly_lg(){
        return this.item?.ly_lg ?   this.item.ly_lg: '3';
    }
    get isTextarea(){
        return this.item?.type=='textarea';
    }
    get isRadio(){
        return this.item?.type=='radio';
    }
    get isFile(){
        return this.item?.type=='file';
    }
    get isBase(){
        return ! (this.isTextarea || this.picklist || this.isFile || this.isRadio || this.isLookup);
    }
    get isDefault(){
        return !(this.isLookup);
    }
    get isLookup(){
        return this.item?.type=='lookup';
    }
    get filter(){ return this.item?.filter || ''}
    get picklist(){ return this.item?.picklist;};
    get radioType(){ return this.item?.radioType|| 'button';};
    get toggleActiveText(){ return this.item?.toggleActiveText || 'Active'};
    get toggleInactiveText(){ return this.item?.toggleInactiveText || 'Inactive'};
    connectedCallback(){
        console.log('ITEM');
        console.log(this.item);
    }
    handleChanged(event) {
        this.timeOut=this.timeOut || 0;
        const delay= +this.timeOut;
        const value = event.detail.value;
        const name = event.currentTarget.dataset.id;
        const file=event.target.files?event.target.files[0]:null; 
        console.log('OUTPUT : ',value);
        console.log('OUTPUT :name  ',name);
        clearTimeout(this.timer);
        this.timer=setTimeout(() => {
            this.publishChangedEvt({info: {name, value,file} , event:event});
        }, delay);//2000
       
    }
    handleLookupSelection(event){
        const info = event.detail;
        this.publishChangedEvt({info: {...info} , event:event});
        this.timer=setTimeout(() => {
            
        }, delay);//2000
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
    @api saveField(){
       if(this.isDefault){
       return this.saveDefaultField()
       }else{
            if (this.isLookup) {
              return  this.saveLookupField()
            }
       }
    }
    saveLookupField(){
        const isvalid =this.validateLookupField(); 
        const item=this.item;
        console.log('######### SAVE LOOKUP >> '+item.name );
        let output={};
        let outputs=[];
        let outputsItems=[];
        if (isvalid) {
            const key=item.name;
            let lookupCmp=this.template.querySelector(`c-rh_custom_lookup_adv[data-id="${key}"]`);
            if (lookupCmp) {
                const retunrObj=lookupCmp.saveField();
                console.log(retunrObj);
                output[key]=retunrObj.value || null;
                outputs.push({label:item.label,name:key,value:retunrObj.value});
                outputsItems.push({...item,value:retunrObj.value,...retunrObj});
            }
            
        }

        return {isvalid,outputs,obj:output,outputsItems};
    }
     saveDefaultField(){
        const isvalid =this.validateField(); 
        const item=this.item;
        let output={};
        let outputs=[];
        let outputsItems=[];
        if (isvalid) {
            let self=this;
            const key=item.name;
            const fieldInput=self.template.querySelector(`[data-id="${key}"]`);
            if (fieldInput) {
                    output[key]=fieldInput.value || null;
                switch (item.type) {
                    case 'datetime':
                        try {
                            let dateTimevalue=fieldInput.value;
                            let datevalue=dateTimevalue? new Date(dateTimevalue).toLocaleDateString() :'';
                            let datelabel=item.label?  item.label.replace('/','').replace('ora','').replace('hour','') :' Date';
                            let timevalue=dateTimevalue? new Date(dateTimevalue).toLocaleTimeString() :'';
                            let timelabel=item.label?  item.label.replace('/','').replace('Data','').replace('Date','') :' Time';

                            outputs.push({label:datelabel,name:key+'d',value:datevalue});
                            outputs.push({label:timelabel,name:key+'t',value:timevalue});
                        } catch (error) {
                            console.log('OUTPUT  : Error while spliting date time output ',error);
                            outputs.push({label:item.label,name:key,value:fieldInput.value});
                        }
                        break;
                    case 'toggle':
                        output[key]=fieldInput.checked;
                        outputs.push({label:item.label,name:key,value:fieldInput.checked});
                        break;
                    default:
                        outputs.push({label:item.label,name:key,value:fieldInput.value});
                        break;
                }
                
                
                outputsItems.push({...item,value:fieldInput.value});
            }
           
        }
        // console.log('OUTPUT VALUE : ',output);
        // console.log('OUTPUT FIELD VALUES : ',outputs);
        // console.log('OUTPUT FIELD VALUES outputsItems : ',outputsItems);
        // console.log('OUTPUT FIELD VALUES ALL : ',{isvalid,outputs,obj:output,outputsItems});
        return {isvalid,outputs,obj:output,outputsItems};
    }
     validateDefaultField() {
        const item=this.item;
         
        let isvalid = true;
        let key=item.name;
        let fieldInput=this.template.querySelector(`[data-id="${key}"]`);
        if (fieldInput) {
            isvalid = isvalid && fieldInput.reportValidity('');
        }
        console.log('######### VALIDATION >> '+item.name +' IS VALIDATION >>'+isvalid); 
    //    console.log('@@@@@@@@@@ isvalid '+isvalid);
       return isvalid;
   }
   validateLookupField(){
        const item=this.item;
            
        let isvalid = true;
        let key=item.name;
        let lookupCmp=this.template.querySelector(`c-rh_custom_lookup_adv[data-id="${key}"]`);
        if (lookupCmp) {
            isvalid = isvalid && lookupCmp.validateField();
        }
        console.log('######### LOOKUP VALIDATION >> '+item.name +' IS VALIDATION >>'+isvalid);
        return isvalid;
    }
   @api validateField() {
        if(this.isDefault){
        return  this.validateDefaultField()
        }else{
            if (this.isLookup) {
                return this.validateLookupField()
            }
        }
    }

    @api updateField(updates,type='default') {
        type=(type=='default') ? this.item.type : type;
        if(type=='lookup'){
            return this.updateLookupField(updates);
        }else{
            return  this.updateDefaultField(updates);
        }
    }
    updateLookupField(updates){
        this.item={...this.item,...updates};
        let key=this.item?.name;
        let lookupCmp=this.template.querySelector(`c-rh_custom_lookup_adv[data-id="${key}"]`);
        if (lookupCmp) {
            return  lookupCmp.updateField(this.item);
        }
        return false;
    }
    updateDefaultField(updates){
        this.item={...this.item,...updates};
        return true;
    }
}