import { LightningElement, wire } from 'lwc';
import Id from '@salesforce/user/Id';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import TOKEN_FIELD from '@salesforce/schema/User.MA_Token__c';
import USERNAME_NAME_FIELD from '@salesforce/schema/User.MA_Username__c';
import USERID_FIELD from '@salesforce/schema/User.MA_UserId__c';
import PASSWORD_FIELD from '@salesforce/schema/User.MA_Password__c';
import authorizationChannel from "@salesforce/messageChannel/authorizationChannel__c";

import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';
/*
import {
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext,
} from 'lightning/messageService';*/
export default class Ma_token_refresh extends LightningElement {
    userId=Id;
    subscription = null;
    // @wire(MessageContext)
    // messageContext;
    @wire(getRecord, { recordId: '$userId', fields: [TOKEN_FIELD, USERNAME_NAME_FIELD, USERID_FIELD, PASSWORD_FIELD] })
    user;
    openLogin;
    get firebaseUid() {
        return getFieldValue(this.user?.data, USERID_FIELD);
    }
    /*
    // Encapsulate logic for Lightning message service subscribe and unsubsubscribe
    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                authorizationChannel,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    // Handler for message received by component
    handleMessage(message) {
        console.log(`message`, {...message});
        console.log('userid', this.firebaseUid);
        this.openLogin=true;
    }

    // Standard lifecycle hooks used to subscribe and unsubsubscribe to the message channel
    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }
    */
    channelName = '/event/RH_FirebaseAuthRequest__e';
    isSubscribeDisabled = false;
    isUnsubscribeDisabled = !this.isSubscribeDisabled;

    subscription = {};

    // Tracks changes to channelName text field
    handleChannelName(event) {
        this.channelName = event.target.value;
    }

    // Initializes the component
    connectedCallback() {
        // Register error listener
        this.registerErrorListener();

        setTimeout(() => {
            this.handleSubscribe()
        }, 500);
    }
    disconnectedCallback() {
        this.handleUnsubscribe();
    }

    // Handles subscribe button click
    handleMessage(message) {
        console.log(`message`, {...message});
        console.log('userid', this.firebaseUid);
        this.openLogin=true;
    }
    handleSubscribe() {
        const self=this;
        // Callback invoked whenever a new event message is received
        const messageCallback = function (response) {
            console.log('New message received: ', JSON.stringify(response));
            // Response contains the payload of the new message received
            self.handleMessage(response);
        };

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelName, -1, messageCallback).then((response) => {
            // Response contains the subscription information on subscribe call
            console.log(
                'Subscription request sent to: ',
                JSON.stringify(response.channel)
            );
            this.subscription = response;
           
        });
    }

    // Handles unsubscribe button click
    handleUnsubscribe() {
        

        // Invoke unsubscribe method of empApi
        unsubscribe(this.subscription, (response) => {
            console.log('unsubscribe() response: ', JSON.stringify(response));
            // Response is true for successful unsubscribe
        });
    }

   

    registerErrorListener() {
        // Invoke onError empApi method
        onError((error) => {
            console.log('Received error from server: ', JSON.stringify(error));
            // Error contains the server-side error
        });
    }

    handleClose(){
        this.openLogin=false;
    }

}