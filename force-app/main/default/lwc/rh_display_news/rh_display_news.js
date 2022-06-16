import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getActiveNews from '@salesforce/apex/RH_News_controller.getActiveNews';
import getOrgConfig from '@salesforce/apex/RH_News_controller.getOrgConfig';
import CommunityBackground1jpg from '@salesforce/contentAssetUrl/CommunityBackground1jpg';



export default class Rh_display_news extends NavigationMixin(LightningElement) {
    news=[];
    bannerNews=[];
    slide=1;
    config={};
    interval;
    bannerStyle;


    connectedCallback(){
        debugger
        this.getConfig();
    }

    renderedCallback(){
    }

    disconnectedCallback(){
       window.clearInterval(this.interval);
    }
    
    getNews(){
        getActiveNews()
            .then(result => {
                this.news = result;
                this.bannerNews= this.news.map((e,Index) => { 
                    return Index==0?{
                        Id: e.Id,
                        Title: e.Name.length>70? e.Name.slice(0, 67) +'...': e.Name,
                        Description: e.Description__c.length>230? e.Description__c.slice(0, 230) +'...': e.Description__c ,
                        Image:  e.Image__c? e.Image__c: CommunityBackground1jpg,
                        Index:Index+1,
                        Visibility: 'slds-show'
                    }:{
                        Id: e.Id,
                        Title: e.Name.length>70? e.Name.slice(0, 67) +'...': e.Name,
                        Description: e.Description__c.length>230? e.Description__c.slice(0, 230) +'...': e.Description__c,
                        Image:  e.Image__c? e.Image__c: CommunityBackground1jpg,
                        Index:Index+1,
                        Visibility:'slds-hide'
                    }
                });

                this.bannerStyle=`color: white; background-image: url(${this.bannerNews[0].Image});
                                height:200px;background-position:center;background-color: rgba(0, 0, 0, 0.7);
                                background-blend-mode: multiply;text-align: center;font-size:  larger;
                `;
                this.interval= window.setInterval(() => {
                    this.next();
                  }, this.config.interval);

            })
            .catch(error => {
                alert('KB ' + error);
                console.log(' error@@@@@@@@@@@@@@@@@@' + error );
            });
    }

    next(){
        this.slide= this.slide+1; 
        this.handleSlide();
    }

    previous(){
        this.slide= this.slide-1;
        this.handleSlide();
    }

    handleSlide(){
        if(this.slide > this.bannerNews.length){
            this.slide=1;
        }else if(this.slide <1){
            this.slide= this.bannerNews.length;
        }

        this.bannerNews= this.bannerNews.map((e,Index) => { 
            return this.slide-1 == Index?{
                ...e,
                Visibility: 'slds-show'
            }:{
                ...e,
                Visibility:'slds-hide'
            }
        });

        this.bannerStyle=`color: white; background-image: url(${this.bannerNews[this.slide-1].Image});
        height:200px;background-position:center;background-color: rgba(0, 0, 0, 0.7);
        background-blend-mode: multiply;text-align: center;font-size:  larger;--lwc-spacingSmall: 0px;
        `;
    }

    getConfig(){
        getOrgConfig()
        .then(result => {
            if(result===null){
                this.config={
                    interval: 5000
                } 
            }else{
                 this.config = result;
            } 
            this.getNews();
        })
        .catch(error => {
            this.error = error;
            console.log('@@@@@@@@@@ Rh_display_news  getConfig  '+error.message)
        });
    }


    handleNewsDetail(event){
        const recordId= event?.target?.dataset?.id;
        if(recordId){
            this.goToNewsDetail(recordId);
        }
    }


    goToNewsDetail(recordid) {
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
}