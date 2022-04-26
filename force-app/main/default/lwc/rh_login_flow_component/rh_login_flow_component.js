import { api, LightningElement } from 'lwc';
import {
    FlowAttributeChangeEvent,
    FlowNavigationNextEvent,
} from 'lightning/flowSupport';
import getContact from '@salesforce/apex/RH_LoginFlowController.getContact';
export default class Rh_login_flow_component extends LightningElement {
    @api
    userId
    @api
    fullUrl
    @api
    variant
    @api
    availableActions = [];
     @api conId;
     @api conStatus;
    connectedCallback(){
        console.log(`xxxxxxxxxxxxxx>> `,this.userId);
        console.log("previous url is: " + document.referrer);
        console.log("URL url is: " + document.URL);
        console.log("document.cookie: " +this.getCookie('startUrl'));
        let startUrl=this.getCookie('startUrl');
        this.variant ='';
        if (startUrl) {
            var parts = startUrl.split("/s/");
            console.log(parts);
            if (parts.length === 2) {
                this.variant = parts[1];//string after /s/
            }
        }
        console.log("documentURI url is: " + document.documentURI);
        this.fullUrl=window.location.href;
        getContact({ userId: this.userId })
          .then(result => {
            console.log('Result', result);
            if (!result.error) {
                this.conId=result.contact.Id;
                this.conStatus=result.contact.RH_Status__c;
                this.goNext(); 
            }
            else console.error(result.msg);
            
          })
          .catch(error => {
            console.error('Error:', error);
        });
    }
     getCookie(name) {
        var cookieString = "; " + document.cookie;
        console.log(cookieString);
       
        var parts = cookieString.split("; " + name + "=");
        console.log(parts);
        if (parts.length === 2) {
            return parts.pop().split(";").shift();
        }
        return null;
    }
    createCookie(name, value, days) {
        var expires;
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        }
        else {
            expires = "";
        }
        document.cookie = name + "=" + escape(value) + expires + "; path=/";
    }
    handleChangeAttrib(attrName,attrvalue) {
        const attributeChangeEvent = new FlowAttributeChangeEvent(
            attrName,
            attrvalue
        );
        this.dispatchEvent(attributeChangeEvent);
    }

    handleGoNext() {
        // check if NEXT is allowed on this screen
        if (this.availableActions.find((action) => action === 'NEXT')) {
            // navigate to the next screen
            this.goNext();
        }
    }
    goNext(){
        const navigateNextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(navigateNextEvent);
    }
    getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
    }
}