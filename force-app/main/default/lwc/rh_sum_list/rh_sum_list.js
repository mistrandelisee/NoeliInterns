import { LightningElement, api, track } from 'lwc';
import getSummaries from '@salesforce/apex/RH_Summarizer.getSummaries';
import All from '@salesforce/label/c.rh_All';
const GROUPBY_KEY = 'GROUPBY';
const FIELDS_KEY = 'FIELDS';
const OBJECT_KEY = 'SOBJECT';
const CONDITIONS_KEY = 'CONDS';
const CLASS_KEY = 'PROVIDER';
const ALL_KEY = 'ALLKEY';
export default class Rh_sum_list extends LightningElement {

    @api sobject;
    @api field;
    @api hideAll;
    @api filterKey;
    @api condition;
    @api dProvider;
    @track summary = [];
    @api selectedKey ;
    @api iClickable; 
    allkey;
    @api adds;

    get toSend() {
        return {
            'GROUPBY': this.field || null ,
            'FIELDS': null,
            'SOBJECT': this.sobject || null ,
            'CONDS': this.condition  || null,
            'PROVIDER': this.dProvider || null,
            ...this.adds
        }

    };


    connectedCallback(){
        this.getSommaire();
        this.allkey='ALLKEY'+new Date().getTime();
        this.selectedKey=this.allkey;
    }

    getSommaire(){
        console.log(`logg----`);
        console.log(this.toSend);
        getSummaries({jsonStr: JSON.stringify(this.toSend)})
        .then(result => {
            if(!result.error){
                let total = 0;
                result.records.forEach(elt => {
                    total += elt.value;
                    const key=elt.label+ elt.value;
                    this.summary.push(
                        {...elt}
                    )
                });
                if (total > 0 && !this.hideAll) {
                    this.summary.unshift(
                        {
                            label: All,
                            value: total,
                            key:this.allkey
                        }
                    ); 
                }
                
                console.log(this.summary);
            }else{
                console.log('error', result.message);
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    }
    handleClick(event){
        const data = event.detail;
        console.log('data >>', data, ' \n action ', data?.action);
        this.selectedKey = data?.key;
        const _data={value: (this.selectedKey==this.allkey? null:this.selectedKey) ,field:this.field, object:this.sobject};
        this.callParent(this.filterKey || this.field,_data);
    }
    callParent(key,data){
        var actionEvt =new CustomEvent('action',
         {detail: { name : key,data }}
      );
      console.log("Watch item: key ->"+key); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }
}