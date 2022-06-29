import { LightningElement,wire,api } from 'lwc';
import getLastrequest from '@salesforce/apex/RH_Request_controller.getLastrequest';
import getLastEventList from '@salesforce/apex/RH_EventController.getMyLastEvent';
import getMyAccomplishment from '@salesforce/apex/RH_Accomplishment_Controller.getMyAccomplishment';


import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';


import { NavigationMixin } from 'lightning/navigation';

const limitRecord= 8;
export default class Rh_tabs_resume extends NavigationMixin(LightningElement) {

    requests=[]=[];
    events=[];
    accomplishments=[];
    enablelist=false;

    @wire(CurrentPageReference) pageRef;

    handleActive(event) {
        this.enablelist=false;
        const tab = event.target.value;
        switch (tab){
            case 'Request': 
                        this.handleRequest();
                        break;
            case 'Event': 
                         this.handleEvent();
                        break;
            case 'Accomplishment':       
                        this.handleAccomplishment();
                        break;
        }
    }

    handleEvent(){
        this.startSpinner(true);
        getLastEventList({endLimit:limitRecord})
        .then(result => {
            this.enablelist=true;
            this.events = result.map(function(e){
                let item={...e};
                item.summaryName=e.Name?.length>35? e.Name.slice(0, 35) +'...': e.Name ;
                return item;
            });
            this.startSpinner(false);
        })
        .catch(error => {
            this.startSpinner(false);
            //this.error = error;
        });
    }
    handleAccomplishment() {
        this.startSpinner(true);
        getMyAccomplishment({edLimit:limitRecord})
            .then(result => { 
                this.enablelist=true;
                
                this.accomplishments = result.map(function(e){
                    let item={...e};
                    item.summaryTitle=e.RH_Title__c?.length>35? e.RH_Title__c.slice(0, 35) +'...': e.RH_Title__c ;
                    return item;
                });
                this.startSpinner(false);
            })
            .catch(error => {
                this.startSpinner(false);
                //this.error = error;
            });
    }

    handleRequest() {
        this.startSpinner(true);
        getLastrequest({edLimit:limitRecord})
            .then(result => {
                this.enablelist=true;
                this.requests = result;
                this.startSpinner(false);
            })
            .catch(error => {
                this.startSpinner(false);
            });
    }

    goToRequest(event){
        if(event.detail.action=='Item'){
            const data=event.detail.data;
            console.log(data);
            this.goToPage('my-request',{'recordId': data.key})
        }
    }

    goToEvent(event){
        if(event.detail.action=='Item'){
            const data=event.detail.data;
            console.log(data);
            this.goToPage('Event',{'recordId': data.key})
        }
    }

    goToAccomplishments(event){
        if(event.detail.action=='Item'){
            const data=event.detail.data;
            console.log(data);
            this.goToPage('accomplishment',{'recordId': data.key})
        }
    }

     //navigation Page
     goToPage(pagenname,state={}) {
        let states=state; 
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }

    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
     }
     showToast(variant, title, message){
         fireEvent(this.pageRef, 'Toast', {variant, title, message});
     }

    
}