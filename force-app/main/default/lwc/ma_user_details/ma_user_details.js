import { LightningElement, api, wire } from 'lwc';
import getUser from '@salesforce/apex/MA_UsersController.getUser';
import { labels } from 'c/rh_label';
import { icons } from 'c/rh_icons';
const EDIT_ACTION='Edit';
export default class Ma_user_details extends LightningElement {
    l={...labels}
    badge=[]; 
    data;
    icon ={user_info:icons.user_info, Edit:icons.Edit}
    @api recordId;
    isReady=false
    // get isReady() { return this.data?.id}
    get _user(){
        const e= this.data||{};
        const {firstname, lastname, email, gender,status,id,createdDate,role} = e;
        const country= ((e.cityObj) ? e.cityObj.country?.name : '') || e.country
        const city= ((e.cityObj) ? e.cityObj.name  : '') || e.city
        return  {id,firstname, lastname, email, gender,status,country,city,
                        name: firstname || lastname || email,role,
                        createdDate : createdDate || null
                    } || {};
    }
    get userDetails(){
        console.log({...this._user});
        return [
            {
                label:this.l.LastName,
                name:'LastName',
                value:this._user.lastname,
            },
            {
                label:this.l.FirstName,
                name:'FirstName',
                value:this._user.firstname?.toUpperCase(),
            },
            {
                label:this.l.Email,
                name:'Email',
                value:this._user.email,
                type:'email',
            },
            {
                label:this.l.Language,
                name:'Language',
                value:this._user.language
            },
           {
                label:this.l.Role,
                name:'Role',
                value:this._user.role
            },
            {
                label:this.l.Country,
                name:'Country',
                value:this._user.country
            },
            {
                label:this.l.City,
                name:'City',
                value:this._user.city
            },
            
            
            
    
        ] || [];
    }
    get badge(){ 
        return [
        {name: 'userBadge', class: this.classStyle(this._user?.status),label: this._user?.status}
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
    @wire(getUser, { userId: '$recordId' })
    wiredData({ error, data }) {
      if (data) {
        console.log('Data', data);
        if(!data.error){
            this.data=data?.data;
            this.isReady=true
        }else{
            if(data.resfreshToken){
                this.doRefreshToken({action: 'refresh', callback: {method:'getUser', data: {userId: this.recordId}}});
            }

        }
        
        this.isloading(false);
      } else if (error) {
         console.error('Error:', error);
         this.isloading(false);
      }
    }

    handleUserDetails(event){
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