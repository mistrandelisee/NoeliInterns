
import { LightningElement, api, wire } from 'lwc';
import getTransfert from '@salesforce/apex/MA_RequestController.getTransfert';
import { labels } from 'c/rh_label';
import { icons } from 'c/rh_icons';
const EDIT_ACTION='Edit';
export default class Ma_request_details extends LightningElement {
    l={...labels}
    badge=[]; 
    data;
    icon ={request_info:icons.request_info, Edit:icons.Edit}
    @api recordId;
    isReady=false
    // get isReady() { return this.data?.id}
    get _request(){
        const e= this.data||{};
        const {LastTimeInPending, amount, codeReception, ownerId,status,id,createdDate} = e;
        const inLocation= ((e.inZone) ? e.inZone.name +' '+e.inZone.country?.name : '') || e.inZone?.currency
        const inCurrency= e.inZone?.country?.currency ||''
        const outLocation= ((e.outZone) ? e.outZone.name +' '+e.outZone.country?.name : '') || e.outZone?.currency
        const owner= ((e.owner) ? e.owner.firstname +' '+e.owner.lastname : '') || e.ownerId
       return  {LastTimeInPending, amount, codeReception, ownerId,status,id,inLocation,
                    inCurrency,
                    outLocation,
                    owner,
                    name: codeReception || (inLocation +' - >'+outLocation) || email,
                    createdDate : createdDate ? new Date(createdDate) : null}|| {};
    }
    get requestDetails(){
        console.log({...this._request});
        return [
            {
                label:this.l.Name,
                name:'name',
                value:this._request.name,
            },
            {
                label:this.l.Amount,
                name:'amount',
                isCurrency:true,
                code:this._request?.inCurrency,
                value:this._request.amount,
            },
            {
                label:this.l.Owner,
                name:'owner',
                value:this._request.owner,
                type:'Link',class:'Link',dataId:this._request.ownerId
            },
            {
                label:'Code de Reception',
                name:'codeReception',
                value:this._request.codeReception
            },
           
            
            
            
    
        ] || [];
    }
    get badge(){ 
        return [
        {name: 'requestBadge', class: this.classStyle(this._request?.status),label: this._request?.status}
        ];
    }
    get actionAvailable () {
        return [
            {
                variant:"base",
                label:this.l.Edit,
                name:EDIT_ACTION,
                title:this.l.Edit,
                iconName:this.icon.Edit,
                class:"icon-md slds-m-left_x-small"
            },
        ];
    }
    @wire(getTransfert, { transfertId: '$recordId' })
    wiredData({ error, data }) {
      if (data) {
        console.log('Data', data);
        if(!data.error){
            this.data=data?.data;
            this.isReady=true
        }else{
            if(data.resfreshToken){
                this.doRefreshToken({action: 'refresh', callback: {method:'getTransfert', data: {requestId: this.recordId}}});
            }

        }
        
        this.isloading(false);
      } else if (error) {
         console.error('Error:', error);
         this.isloading(false);
      }
    }

    handlerequestDetails(event){
        let action=event.detail.action;
        console.log('>>>>>>>>>>>>>. action ',action);
        /*if (action==EDIT_ACTION) {
            this.handleEdit();
        }else if(action=='goToLink'){
            const info = event.detail.info;
            let record={eltName:info.name,recordId:info.dataId}
            this.handleGoToLink(record);
        }*/
    }
    
    classStyle(className){

        switch(className){
            case 'CREATED':
                return "slds-float_left slds-theme_success";
            case 'CREATED':
                return "slds-float_left slds-theme_info";
            case 'Frozen':
                return "slds-float_left slds-theme_shade";
            case 'Banned':
                return "slds-float_left slds-theme_error";
            default:
                return "slds-float_left slds-theme_alt-inverse";
        }

    }
    isloading(detail){
        var actionEvt =new CustomEvent('loading', {detail} );
        this.dispatchEvent(actionEvt);
    }
    doRefreshToken(detail){
        var actionEvt =new CustomEvent('refreshtoken', {detail} );
        this.dispatchEvent(actionEvt);
    }
}