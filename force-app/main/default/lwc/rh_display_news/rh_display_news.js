import { LightningElement, api } from 'lwc';
import getActiveNews from '@salesforce/apex/RH_News_controller.getActiveNews';
import getOrgConfig from '@salesforce/apex/RH_News_controller.getOrgConfig';

export default class Rh_display_news extends LightningElement {

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
                this.bannerNews= this.news['News'].map((e,Index) => { 
                    return Index==0?{
                        Title: e.Name,
                        Description: e.Description__c,
                        Image:  this.getImageUrl(this.news['ListBase64'][e.Id]),
                        Index:Index+1,
                        Visibility: 'slds-show'
                    }:{
                        Title: e.Name,
                        Description: e.Description__c,
                        Image:  this.getImageUrl(this.news['ListBase64'][e.Id]),
                        Index:Index+1,
                        Visibility:'slds-hide'
                    }
                });

                this.bannerStyle=`color: white; background-image: url(${this.bannerNews[1].Image});
                                height:200px;background-position:center;background-color: rgba(0, 0, 0, 0.7);
                                background-blend-mode: multiply;
                `;
                //this.bannerStyle="color: red; background-image: `url(${this.bannerNews[0].Image})`;"
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

    getImageUrl(base64){
        if(base64){
            var file=this.dataBase64toFile(base64,'Image.png');
            return URL.createObjectURL(file) 
        }
    }

    dataBase64toFile(base64) {
        var arr = base64.split(','),
            //mime = arr[0].match(/:(.*?);/)[1],
            filename= arr[0],
            bstr = atob(arr[1]), 
            n = bstr.length, 
            u8arr = new Uint8Array(n);
            
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new File([u8arr], filename, /*{type:'image/jpeg'}*/);
    }
}