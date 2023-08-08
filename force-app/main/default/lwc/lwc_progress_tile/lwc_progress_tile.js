import { LightningElement, api } from 'lwc';

export default class Lwc_progress_tile extends LightningElement {
    @api item;
    @api count;
    @api icon;

    label={
        viewAll:'view All'
    }
    get _label(){
        return this.item?.label
    }
    get _icon(){
        return this.item?.icon || this.icon ||  "standard:case"
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
    get _count(){
        return `${this.item?.value} / ${ this._value}%`
    }
    get _style(){
        const style ={
            color:` --lwc-progressBarColorBackgroundFill: ${this.item?.fillColor || '#20B15A'} ;`
        }

        return style.color + ''
    }
}