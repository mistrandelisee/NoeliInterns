import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { publish, MessageContext } from 'lightning/messageService';
import authorizationChannel from "@salesforce/messageChannel/authorizationChannel__c";

export default class Ma_users_tab extends LightningElement {
    recordId;
    _isloading=true

    @wire(MessageContext)
    messageContext;


    
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
       if (currentPageReference) {
           this.recordId = currentPageReference.state?.c__recordId;
           this.recordId ? this.loading(true) : ''
           console.log(this.recordId);
       }
    }
    get showDetail(){
        return this.recordId ? true : false;
    }
    tabSet=[
        {
            label: 'Admininstrator',
            name:'ADMIN'
        },
        {
            label: 'Clients',
            name:'CLIENT' 
        },
        {
            label: 'Agents',
            name:'AGENT'
        },
        {
            label: 'Managers',
            name:'MANAGER'
        },
    ]
    isloading(event){
        this.loading(event.detail)
    }
    loading(b){
        this._isloading = b;
    }
    handleOnRefreshToken(event) {
        const payload = { action: 'refresh', toDo:'test' };

        publish(this.messageContext, authorizationChannel, payload);
    }

}