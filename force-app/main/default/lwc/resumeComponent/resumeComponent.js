import { LightningElement, api, track } from 'lwc';
import sommaire from '@salesforce/apex/resumeController.sommaire';

export default class ResumeComponent extends LightningElement {

    @api sobject;
    @api field;
    @api condition;
    @track summary = [];



    connectedCallback(){
        this.getSommaire();
    }

    getSommaire(){
        sommaire({sobjet: this.sobject, field: this.field, condition: this.condition})
        .then(resultat => {
            if(!resultat.error){
                let total = 0;
                resultat.result.forEach(elt => {
                    total += elt.value;
                    const key=elt.label+ elt.value;
                    this.summary.push(
                        {
                            label: elt.label,
                            value: elt.value,key
                        }
                    )
                });
                this.summary.unshift(
                    {
                        label: 'All',
                        value: total,
                        key:'all'
                    }
                );
            }else{
                console.log('error', resultat.error);
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    }
}