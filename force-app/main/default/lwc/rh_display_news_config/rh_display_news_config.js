import { LightningElement,track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOrgConfig from '@salesforce/apex/RH_News_controller.getOrgConfig';
import setOrgConfig from '@salesforce/apex/RH_News_controller.setOrgConfig';
import getAllNews from '@salesforce/apex/RH_News_controller.getAllNews';
import getNewsDetails from '@salesforce/apex/RH_News_controller.getNewsDetails';
import updateNewsVisibility from '@salesforce/apex/RH_News_controller.updateNewsVisibility';



const SAVE_ACTION='Save';
const NEW_ACTION='New';

const ENABLED_ACTION='Enabled';
const DISABLED_ACTION='Disabled';

export default class Rh_display_news_config extends NavigationMixin(LightningElement) {

    config={};
    draftConfig={};
    r=0;
    allNews=[];

    newsRecord;
    @track newsInputDetails=[];
    recordId;

    keysFields={Name:'ok'};
    keysLabels={
        summaryTitle:'Title', summaryDescription:'Description',
    };
    fieldsToShow={
        summaryTitle:'ok', summaryDescription:'',
    };

    get hasNews(){
        return this.newsRecord?true:false;
    }
    get hasrecordid(){
        return this.recordId?true:false;
    }

    connectedCallback(){
        
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        if (this.recordId) {
            //this.startSpinner(true);
            this.displayNewsInfo(this.recordId);
           // this.startSpinner(false);
        }else{
            this.getConfig();
            this.getNews();
        }
    }

    displayNewsInfo(recordid){
       //this.startSpinner(true);
        getNewsDetails({
            recordId: recordid
        }).then(result =>{
            console.log('display news ' +JSON.stringify(result))
            if (result) {
                this.newsRecord = result;
                this.buildform(this.newsRecord);
            }else{
               // this.showToast(WARNING_VARIANT,'ERROR', result.msg);
                this.title = 'Failled';
                this.information = result.msg;
                this.contactNotFounded=true;
            }
        }).catch(e =>{
            //this.showToast(ERROR_VARIANT,'ERROR', e.message);
            console.error(e)
        }).finally(() => {
            //this.startSpinner(false);
        })
      }

      getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
      }

      buildform(newsInfo){
        this.newsInputDetails=[
            {
                label:'Title',
                placeholder:'Enter Title',
                name:'Name',
                value:newsInfo?.Name,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Activate ?',
                name:'IsActive__c',
                checked:newsInfo?.IsActive__c,
                type:'toggle',
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Description',
                name:'Description__c',
                value:newsInfo?.Description__c,
                placeholder:'Enter Description',
                className:'textarea',
                maxlength:25000,
                type:'textarea',
                ly_md:'12', 
                ly_lg:'12'
            }
        ];
    }


    action='';
    get showNew(){
        return this.action=='' || this.action==NEW_ACTION || this.action==SAVE_ACTION;
    }
    get hideView(){
        return this.action=='' || this.action!=NEW_ACTION;
    }


    getNews(){
        getAllNews()
            .then(result => {
                const self=this;
                this.allNews = result.map(function (e){
                    let item={...e};
                    item.title=e.Name?.length>27? e.Name.slice(0, 27) +'...': e.Name ;
                    item.icon="standard:news";
                    item.class=e.IsActive__c?'active':'banned';
                    item.id= e.Id;
                    item.summaryTitle= e.Name?.length>38? e.Name.slice(0, 38) +'...': e.Name ;
                    item.summaryDescription= e.Description__c?.length>80? e.Description__c.slice(0, 75) +'...': e.Description__c ;
                    item.keysFields=self.keysFields;
                    item.keysLabels=self.keysLabels;
                    item.fieldsToShow=self.fieldsToShow;
                    
                    let Actions=[
                        {
                            name:e.IsActive__c?'Disabled':'Enabled',
                            label:e.IsActive__c?'Disabled':'Enabled',
                            iconName: e.IsActive__c? 'utility:preview':'action:preview'
                           // class
                        }

                    ];


                    //add status actions
                    //Actions=Actions.concat(self.buildUserStatusActions(e.Status));
                    item.actions=Actions;
                    
                    console.log(`item`);
                    console.log(item);

                    return item;
                    
                })
                this.setviewsList(this.allNews);
            })
            .catch(error => {
                alert('KB ' + error);
                console.log(' error@@@@@@@@@@@@@@@@@@' + error );
            });
    }


    handleActionNew(event){
        const data=event.detail;
        console.log('data >>',data,' \n action ',data?.action);
        this.action=data?.action;
        switch (data?.action) {
            case SAVE_ACTION:
                //refresh List
                this.getNews();
                break;
            default:
                break;
        }
            
        
    }

    setviewsList(items){
        let cardsView=this.template.querySelector('c-rh_cards_view');
        cardsView?.setDatas(items);
    }

    getConfig(){
        getOrgConfig()
        .then(result => {
            if(result===null){
                this.config={
                    interval: 5000,
                    numberOfNews: 3
                } 
            }else{
                 this.config = result;
            } 
        })
        .catch(error => {
            this.error = error;
            console.log('@@@@@@@@@@ getConfig  '+error.body)
        });
    }

    handleCardAction(event){
        console.log('event parent ' +JSON.stringify(event.detail));
        const info=event.detail;
        if(info.extra.item==DISABLED_ACTION || info.extra.item==ENABLED_ACTION){
            let isVisible= info.extra.item==DISABLED_ACTION?false:true;
            this.updateVisibility(info?.data?.id,isVisible);
        }else{
            this.goToRequestDetail(info?.data?.id);
        }
       
        
    }

    updateVisibility(recordId,visibility){
        updateNewsVisibility({recordId: recordId , enabled: visibility })
        .then(result => {
            if(result){
                this.getNews();
            }
        })
        .catch(error => {
            this.error = error;
            console.log('@@@@@@@@@@ getConfig  '+error.body)
        });
    }

      //navigation Page

      goToRequestDetail(recordid) {
        var pagenname ='rhbannerConfig'; //request page nam
        let states={'recordId': recordid}; //event.currentTarget.dataset.id , is the recordId of the request
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }


    saveConfig(){
        this.draftConfig.interval = this.template.querySelector('[data-id="interval"]').value;
        this.draftConfig.numberOfNews =this.template.querySelector('[data-id="numberOfNews"]').value;

        let input = JSON.stringify(this.draftConfig);

        setOrgConfig({ data: input })
        .then((result) => {
            const evt = new ShowToastEvent({
                title: 'Save configuration',
                message: 'Your configuration has been successfully saved',
                variant: 'success',
            });
            this.dispatchEvent(evt);  
        })
        .catch((error) => {
            const evt = new ShowToastEvent({
                title: 'Configuration ',
                message: error.body,
                variant: 'error',
            });
            this.dispatchEvent(evt); 
        });
    }


}