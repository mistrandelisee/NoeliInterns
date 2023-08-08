import { LightningElement, api } from 'lwc';

export default class Lwc_report_card extends LightningElement {
    @api title;
    @api subtitle;
    @api icon;
    @api items=[
        {
            label:'En traitements',
            value: 70,
            key:'progres',
            icon:'',
            link:'http://'
        },
        {
            label:'En Attentes',
            value: 20,
            key:'open',
            icon:'',
            link:'http://'
        }
        ,
        {
            label:'Echecs',
            value: 5,
            key:'fails',
            icon:'',
            link:'http://'
        }
    ]
    
    get _counts(){
        return  this.items?.reduce((acc,item) => {
        return acc+ item.value; ;
        },0) || 0;
    };
    

    get _footertext(){
        return `${this.coutTitle || 'Total'} : `// ${this._counts}
    }

}