import { LightningElement, wire, api, track  } from 'lwc';
import getPicklistStatus from '@salesforce/apex/RH_EventController.getPicklistStatus';
import saveEven from '@salesforce/apex/RH_EventController.saveEvent';
// importing to show toast notifictions
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class Rh_add_event extends LightningElement {
    @api showModal = false;
    @track StatusList;
    EventData = {};
    //get invoice Item
    handleSaveEvent(){debugger
        this.EventData=this.makeEventData();
        var jsonEventData = JSON.stringify(this.EventData);
        console.log('----->', jsonEventData);
        saveEven({ objEven: jsonEventData})
            .then(result => {
                this.data = result;
                window.console.log('result ===> ' + result);
                this.showModal = false;
                // Show success messsage
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success!!',
                    message: 'Account Add Successfully!!',
                    variant: 'success'
                }), );
            })
            .catch(error => {
                this.error = error.message;
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message: 'Add failed',
                    variant: 'error',
                    mode: 'dismissable'
                });
                this.dispatchEvent(evt);
            });
                     
        // this.closeModal();

        // var isValid = this.checkInvoiceItemFieldValididy();
        // if(isValid){
        //     this.EventData=this.makeEventData();
        // console.log('----->', this.EventData);
        // saveEven({ objEven: this.EventData})
        //     .then(result => {
        //         this.data = result;
        //         window.console.log('result ===> ' + result);
        //         this.showModal = false;
        //         // Show success messsage
        //         this.dispatchEvent(new ShowToastEvent({
        //             title: 'Success!!',
        //             message: 'Account Add Successfully!!',
        //             variant: 'success'
        //         }), );
        //     })
        //     .catch(error => {
        //         this.error = error.message;
        //         const evt = new ShowToastEvent({
        //             title: 'Error',
        //             message: 'Add failed',
        //             variant: 'error',
        //             mode: 'dismissable'
        //         });
        //         this.dispatchEvent(evt);
        //     });
        // }
        
        
    }

    makeEventData(){
        let Name =this.template.querySelector('[data-id="Name"]').value;
        // let ContactName =this.template.querySelector('[data-id="ContactName"]').value;
        let Description =this.template.querySelector('[data-id="Description"]').value;
        let StartDate =this.template.querySelector('[data-id="StartDate"]').value;
        let Status =this.template.querySelector('[data-id="Status"]').value;
        return {
            Name : Name,
            // ContactName : ContactName,
            Description : Description,
            StartDate : StartDate,
            Status : Status
          }
 
    }

    get optionsStatus() {
        getPicklistStatus()
            .then(result => {
                this.StatusList = result;
                //console.log('StatusList-->', this.StatusList);
            })
            .catch(error => {
                // TODO Error handling
            });
        return this.StatusList;
    }
    @api
    openModal() {
        this.showModal = true;
        //console.log('opening the model now -->', this.eventModal);
    }
    closeModal(){
        this.showModal = false;
    }

}