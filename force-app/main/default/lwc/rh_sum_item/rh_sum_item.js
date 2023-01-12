import { api, LightningElement } from 'lwc';

export default class Rh_sum_item extends LightningElement {
    @api iLabel; 
    @api iKey; 
    @api iValue; 
    @api selectedKey; 
    @api iClass; 
    @api iClickable; 
    @api aClass; 
    
    get value() { return this.iValue || ''; }
    get isActive() { return this.iKey === this.selectedKey; }
    get label() { return this.iLabel || ''; }
    get bLabel(){ return this.label + ' '+this.value; }
    get btitle(){ return this.label + ' '+this.value; }
    get bclass(){ return this.additionnalClass + (this.iClass || 'slds-badge_inverse'); }
    get additionnalClass(){
        let cx = 'bg-cus';
        cx+=' '+(this.isActive ? (this.aClass || 'isActive') : '');
        cx+=' '+ (this.iClickable ? ' cursor' : '');
        return cx+' '
    }
    handleClick(event) {
        this.callParent(this.iKey,{});
    }
    callParent(key,data){
        var actionEvt =new CustomEvent('action',
         {detail: { key : key,data }}
      );
      console.log("Watch item: key ->"+key); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }
}