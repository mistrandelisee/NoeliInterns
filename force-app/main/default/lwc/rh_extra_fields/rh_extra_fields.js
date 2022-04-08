import { api, LightningElement } from 'lwc';

export default class Rh_extra_fields extends LightningElement {

    @api
    jsonField;

    get fieldTab(){

    }
    get fieldToshow(){

        return [
            {
            key:'222',
            fields:[{
                        label:'',
                        placeholder:'..label',
                        name:'Label',
                        value: '',
                        required:true,
                        ly_md:'6', 
                        ly_lg:'6'
                    },
                    {
                        label:'',
                        placeholder:'..value',
                        name:'Value',
                        value: '',
                        required:true,
                        ly_md:'6', 
                        ly_lg:'6'
                    },
            
            ]
             },
             {
                key:'111',
                fields:[{
                            label:'',
                            placeholder:'..label',
                            name:'Label',
                            value: '',
                            required:true,
                            ly_md:'6', 
                            ly_lg:'6'
                        },
                        {
                            label:'',
                            placeholder:'..value',
                            name:'Value',
                            value: '',
                            required:true,
                            ly_md:'6', 
                            ly_lg:'6'
                        },
                
                ]
                 }
    ]

    }

    handleAction(event){
        this.startSpinner(true);
        const cusEvt=event.detail;
        console.log('cusEvt >>',cusEvt,' \action ',cusEvt?.action);
        switch (cusEvt?.action) {
            case 'DELETE_ACTION':
                console.log('key >>',cusEvt?.fieldkey,' \data ',cusEvt?.data);
                break;
            case 'SAVE_ACTION':
                console.log('key >>',cusEvt?.fieldkey,' \data ',cusEvt?.data);
                break;
            default:
                break;
        }
        
    }


}