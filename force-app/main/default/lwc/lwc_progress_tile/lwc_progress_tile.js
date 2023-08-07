import { LightningElement, api } from 'lwc';

export default class Lwc_progress_tile extends LightningElement {
    @api item;
    @api count;

    get _label(){
        return this.item?.label
    }
    get _icon(){
        return "standard:groups"
    }
    get _value(){
        let _val=0
        try {
            _val= Math.round((this.item?.value * 100)/ this.count) 
        } catch (error) {
            console.warn(error);
        }
        console.log('value is ' + _val);
        return _val+''
    }
}