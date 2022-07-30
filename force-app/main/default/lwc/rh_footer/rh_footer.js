import { LightningElement,wire } from 'lwc';
import changeLanguage from '@salesforce/apex/RH_Users_controller.changeLanguage';
import getUserLanguage from '@salesforce/apex/RH_Users_controller.getUserLanguage';
import { labels } from 'c/rh_label';

import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';

	
import labelName from '@salesforce/label/c.rh_test_Language';

import FLAGS from '@salesforce/resourceUrl/rh_flags';


export default class Rh_footer extends LightningElement {



    

    lang= labelName;
    label={...labels};

    initLang;
    scdLang;
    thdLang;
    langList=false;
    

    picklistLang=[
        { label: this.label.Italian , value: 'it', img: FLAGS+'/It.jpg' },
        { label: this.label.French , value: 'fr', img: FLAGS+'/Fr.jpg'},
        { label: this.label.English , value: 'en_US', img:  FLAGS+'/En.jpg'}
    ];

    allLangValue=[];

    defaultLang;
    copyright;

    get options() {
        return this.allLangValue;
    }

    @wire(CurrentPageReference) pageRef;



    startSpinner(b){
       fireEvent(this.pageRef, 'Spinner', {start:b});
    }
    showToast(variant, title, message){
        fireEvent(this.pageRef, 'Toast', {variant, title, message});
    }
/*
    handleChange(event) {
        let value = event.detail.value;
        changeLanguage({lang: value})
            .then(result => {
                console.log(' user info : '+ result);
                location.reload();
                this.startSpinner(true);
            })
            .catch(error => {
                this.error = error;
            });
        
    }*/

    handleChange(event) {
        let value = event.currentTarget.dataset.id;
        changeLanguage({lang: value})
        .then(result => {
            console.log(' user info : '+ result);
            location.reload();
            this.startSpinner(true);
        })
        .catch(error => {
            this.error = error;
        });

    }



    connectedCallback(){
        this.startSpinner(true);
        this.initialize();
        this.footerInitLabel();

        
        //this.scdLang = FLAGS+'/Fr.jpg';
        //this.thdLang = FLAGS+'/It.jpg';

    }

    initialize(){
        getUserLanguage()
        .then(result => {
            console.log(' getUserLanguage  : '+ result);
            let userLang= result?.userInfo?.LanguageLocaleKey;
           // this.defaultLang= userLang;
           
           switch (userLang) {
            case 'it':
                this.initLang = FLAGS+'/It.jpg';
                break;
            case 'fr':
                this.initLang = FLAGS+'/Fr.jpg';
            break;
            case 'en_US':
                this.initLang = FLAGS+'/En.jpg';
                break;
           }

           
            this.allLangValue= this.picklistLang.filter(e=> e.value != userLang);

            this.startSpinner(false);

            /*
            if(result?.lang){
                let langList=[];

                for(var key in result.lang ){
                    langList.push({ label: key , value:  result.lang[key]  })
                }
              
                this.picklistLang= [...langList];
                this.defaultLang= userLang;
            }

            console.log('  this.picklistLang  : '+  this.picklistLang);*/
        })
        .catch(error => {
            this.error = error;
            this.startSpinner(false);
        });
    }

    footerInitLabel(){
        this.copyright=  this.label.Copyright.replace('(#NB)',new Date().getFullYear())  ;
    }

    
    enableChoice(){
        this.langList= !this.langList;
    }


}