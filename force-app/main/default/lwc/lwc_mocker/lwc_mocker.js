import { LightningElement, track } from 'lwc';

export default class Lwc_mocker extends LightningElement {

    @track inputItems=[];
    connectedCallback(){

        this.initForm();
    }
    initForm(){
        this.inputItems=[
            {
                name: 'Salutation',
                value: 'Welcome'
            },
            {
                name: 'link',
                value: 'To'
            },
            {
                name: 'Location',
                value: 'Noeli'
            },
        ]
    }
    doUpdate(evt){
        //let x=new Date().getTime();
        this.inputItems=[
            {
                name: 'Salutation',
                value: 'GoodBye'
            },
            {
                name: 'link',
                value: 'From'
            },
            {
                name: 'Location',
                value: 'Noeli'
            },
        ];
    }
}