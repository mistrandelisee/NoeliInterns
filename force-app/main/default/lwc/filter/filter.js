import { LightningElement, track, wire,api } from 'lwc';
import picklistValues from '@salesforce/apex/logic.checkPicklist_values';

export default class Filter extends LightningElement {
   @track picklistData =[];
    @track all = 0;
   @api filedvalue =null;
   @api  objectvalue =null;
    
   
    @wire(picklistValues, { FieldApiName: '$filedvalue', ObjectApiName: '$objectvalue'}) 
    pickList({error,data}){
        if(data){
            // let tab = [];
            this.picklistData = data.sommaire;

            data.sommaire.forEach(element => {
                this.all = this.all + 1;
            });
        } else if (error) {
            console.error('Error:', error);
        }
    }

}