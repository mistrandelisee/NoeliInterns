import { LightningElement, api } from 'lwc';
import getActiveNews from '@salesforce/apex/RH_News_controller.getActiveNews';
import getOrgConfig from '@salesforce/apex/RH_News_controller.getOrgConfig';
import CommunityBackground1 from '@salesforce/contentAssetUrl/CommunityBackground1jpg';
import CommunityBackground2 from '@salesforce/contentAssetUrl/CommunityBackground2jpg';
import CommunityBackground3 from '@salesforce/contentAssetUrl/CommunityBackground3jpg';

export default class Rh_display_news extends LightningElement {

    news=[];
    bannerNews=[];
    slide=1;
    config={};
    interval;
    
    allImages=[CommunityBackground3,CommunityBackground2, CommunityBackground1];

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
        let value=this.config.numberOfNews;
        getActiveNews({ endLimit:  value })
            .then(result => {
                this.news = result;
                this.bannerNews= this.news.map((e,Index) => { 
                    return Index==0?{
                        Title: e.Name,
                        Description: e.Description__c,
                        Image: this.allImages[Index],
                        Index:Index+1,
                        Visibility: 'slds-show'
                    }:{
                        Title: e.Name,
                        Description: e.Description__c,
                        Image: Index+1 > this.allImages.length? this.allImages[Index % this.allImages.length]: this.allImages[Index],
                        Index:Index+1,
                        Visibility:'slds-hide'
                    }
                });

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
            this.getNews();
        })
        .catch(error => {
            this.error = error;
            console.log('@@@@@@@@@@ Rh_display_news  getConfig  '+error.message)
        });
    }
}