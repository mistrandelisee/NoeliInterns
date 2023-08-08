import { LightningElement, track } from 'lwc';

export default class Ma_report_transactions extends LightningElement {
    @track _items=[]
    connectedCallback(){
        this.getReports()
    }


    getReports(){
        this._items=[
            {
                label:'En traitements',
                value: 70,
                key:'progres',
                icon:'',
                link:'http://'
            },
            {
                label:'En Attentes',
                value: 50,
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
    }

}