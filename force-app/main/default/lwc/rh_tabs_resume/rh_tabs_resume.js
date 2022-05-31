import { LightningElement } from 'lwc';
import getLastrequest from '@salesforce/apex/RH_Request_controller.getLastrequest';
import getLastEventList from '@salesforce/apex/RH_EventController.getLastEventList';
import { NavigationMixin } from 'lightning/navigation';


export default class Rh_tabs_resume extends NavigationMixin(LightningElement) {

    requests;
    events;
    
    connectedCallback(){
        this.handleRequest();
        this.handleEvent();
    }

    handleEvent(){
        getLastEventList({endLimit:5})
        .then(result => {
            this.events = result;
        })
        .catch(error => {
            //this.error = error;
        });
    }
    handleRequest() {
        getLastrequest({edLimit:5})
            .then(result => {
                this.requests = result;
            })
            .catch(error => {
                //this.error = error;
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
}