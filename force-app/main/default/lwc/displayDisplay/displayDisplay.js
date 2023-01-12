import { LightningElement, api, track } from 'lwc';
import sommaire from '@salesforce/apex/resumeController.sommaire';

// import groupedResults from  '@salesforce/apex/SummaryObject.groupedResults';


export default class  extends LightningElement {
    @track
    sample_data = [
        /*{label: "label 1", value: 1},
        {label: "label 2", value: 2},
        {label: "label 3", value: 3}*/
    ];

    handleClick(){
        let input = this.template.querySelector(".input_text");
        let value = input.value;

        this.sample_data = [];
        for(let i = 0; i < value; i++){
            this.sample_data.push({label: `labooooooool`, value: i+1});
        }

        console.log(this.sample_data);
    }
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
                    this.sample_data.push(
                        {
                            label: elt.label,
                            value: elt.value 
                        }
                    )
                });
                this.sample_data.unshift(
                    {
                        label: 'All',
                        value: total
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