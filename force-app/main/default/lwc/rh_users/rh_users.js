import { LightningElement,track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import { labels } from 'c/rh_label';

import getContact from '@salesforce/apex/RH_Users_controller.getContact';
import displayContactInfo from '@salesforce/apex/RH_Users_controller.displayContactInfo'
import getExtraFields from '@salesforce/apex/RH_Users_controller.getExtraFields'
import changeMyPassword from '@salesforce/apex/RH_Profile_controller.changeMyPassword';
import getActiveWorkgroups from '@salesforce/apex/RH_WorkGroup_Query.getActiveWorkgroups';

const NEW_ACTION='New';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';

export default class Rh_users extends NavigationMixin(LightningElement) {

l={...labels}
@track groups=[];
@track listcontact = [];
recordId;
title;
information;
jsonInfo;
contactrecord;
@track accountFields=[];
@track formPersonanalInputDetails=[];
action='';
    get showNew(){
        return this.action=='' || this.action==NEW_ACTION;
    }
    get hideView(){
        return this.action=='' || this.action!=NEW_ACTION;
    }
    connectedCallback(){
        
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        if (this.recordId) {
            this.startSpinner(true);
            this.displayContactInfo(this.recordId);
            this.getExtraFields(this.recordId);
            this.startSpinner(false);
        }else{
            this.getContactList();
        }
        //this.displayContactInfo();
        this.getActiveWorkgroupse();
    }

    getActiveWorkgroupse(){
        getActiveWorkgroups({}).then(result =>{
            console.log('result group ' +JSON.stringify(result));
            result.forEach(elt => {
                this.groups.push(elt.Name);
            });
            console.log('groupes ' +this.groups);
        }).catch(e =>{
            console.error(e);
        });
    }

    getContactList(){
        getContact({}).then(result =>{
            console.log('result @@@ + ' +JSON.stringify(result));
            this.listcontact = result;
        }).catch(e => {
            this.showToast(ERROR_VARIANT,'ERROR', e.message);
            console.error(e);
        })
    }

    get hascontact(){
        return this.listcontact.length >0;
    }
    handleActionNew(event){
        const data=event.detail;
        console.log('data >>',data,' \n action ',data?.action);
        this.action=data?.action;
        /*switch (data?.action) {
            case NEW_ACTION:
                
                break;
            case FROMRESETPWD:
                
                break;
            default:
                break;
        }*/
            
        
    }
    handleuser(event){
   
        console.log('event parent ' +event.detail);
        //this.displayContactInfo(event.detail);
        
        this.goToRequestDetail(event.detail);
        
    }

    //navigation Page

    goToRequestDetail(recordid) {
        var pagenname ='rhusers'; //request page nam
        let states={'recordId': recordid}; //event.currentTarget.dataset.id , is the recordId of the request
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }

    getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
      }

      get hasrecordid(){
          return this.recordId?true:false;
      }

      displayContactInfo(recordid){
        displayContactInfo({
            recordId: recordid
        }).then(result =>{
            console.log('display contact ' +JSON.stringify(result))
            this.contactrecord = result;
            this.buildform(this.contactrecord);
            this.buildAccountFields(this.contactrecord);
        }).catch(e =>{
            this.showToast(ERROR_VARIANT,'ERROR', e.message);
            console.error(e)
        })

        if(!this.contactrecord){
            this.title = 'Failled';
            this.information = 'Not Information for this Id: ';
        }
      }
      
      get hascontacts(){
          return this.contactrecord?true:false;
      }
  
      
      buildExtraField(extrafield){
        this.jsonInfo=extrafield;
        if(this.jsonInfo){
            let extraFieldCmp=this.template.querySelector('c-rh_extra_fields');
            extraFieldCmp?.initializeMap(extrafield);
        }
        
      }


      getExtraFields(recordid){
        getExtraFields({
            recordId:recordid
        }).then(result =>{
            console.log('result extra field ' +result);
            this.buildExtraField(result);
        }).catch(e=>{
            this.showToast(ERROR_VARIANT,'ERROR', e.message);
            console.error(e);
        })
      }

      buildform(profileinformation){
        this.formPersonanalInputDetails=[
            {
                label:this.l.LastName,
                placeholder:this.l.LastNamePlc,
                name:'LastName',
                value:profileinformation?.LastName,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.FirstName,
                placeholder:this.l.FirstNamePlc,
                name:'FirstName',
                value:profileinformation?.FirstName,
                required:false,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Email,
                name:'Email',
                required:true,
                value:profileinformation?.Email,
                placeholder:this.l.EmailPlc,
                maxlength:255,
                type:'email',
                ly_md:'12', 
                ly_lg:'12'
            },
            /*{
                label:this.l.Role,
                name:'Role',
                required:true,
                value:profileinformation?.RH_Role__c,
                readOnly:true,
                ly_md:'12', 
                ly_lg:'12'
            },*/
            
            {
                label:this.l.Phone,
                placeholder:this.l.PhonePlc,
                name:'Phone',
                type:'phone',
                required:true,
                value:profileinformation?.Phone,
                ly_md:'6', 
                ly_lg:'6'
            },

            /*{
                label:this.l.Username,
                placeholder:this.l.UsernamePlc,
                name:'Login',
                type:'email',
                required:true,
                value:profileinformation?.Username,
                ly_md:'6', 
                ly_lg:'6'
            },*/
            {
                label:this.l.City,
                placeholder:this.l.CityPlc,
                name:'City',
                type:'address',
                value:profileinformation?.OtherAddress,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Birthday,
                placeholder:this.l.BirthdayPlc,
                name:'Birthday',
                type:'date',
                required:true,
                value:profileinformation?.Birthdate,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.AboutMe,
                name:'Description',
                value:profileinformation?.Description,
                placeholder:this.l.AboutMePlc,
                className:'textarea',
                maxlength:25000,
                type:'textarea',
                ly_md:'12', 
                ly_lg:'12'
            }
        
        ];
    }
   
    // handle password 

    handleAction(event){
        this.startSpinner(true);
        const data=event.detail;
        console.log('data >>',data,' \nFORM ',data?.from);
        switch (data?.from) {
            case FROMRESETPWD:
                this.ChangePassword(data);
                break;
            default:
                break;
        }
        
    }

    ChangePassword(evt){
        const data={...evt.data};

        if(evt.action==RESET_ACTION)
            this.ChangePasswordApex(data);
    }

    ChangePasswordApex(info){
        console.log(`@@@@@ callUpdateInfoApex >>> Input : `,info);
        changeMyPassword({ changepasswordjson: Json.stringify(info) })
          .then(result => {
            console.log('Result', result);
            if (!result.error && result.Ok) {
                this.ChangePasswordFinishOK();
            }else{
                this.ChangePasswordFinishKO(result.msg);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            this.showToast(ERROR_VARIANT, this.l.ChangePasswordTitle, '');
        })
        .finally(() => {
            this.ChangePasswordFinish();
        });
    }

    ChangePasswordFinish(){
        this.startSpinner(false);
        this.quiteEditMode(this.template.querySelector('c-rh_profile_reset_password'))
    }

    ChangePasswordFinishOK(){
        this.showToast(SUCCESS_VARIANT, this.l.ChangePasswordTitle, 'Password Successfully Changed');
    }
    ChangePasswordFinishKO(e){
        this.showToast(WARNING_VARIANT,this.l.ChangePasswordTitle, e);
    }

    quiteEditMode(cmp){
        cmp?.cancel();
    }

    //handle spinner
    startSpinner(b){
        let spinner=this.template.querySelector('c-rh_spinner');
        if (b) {    spinner?.start(); }
            else{   spinner?.stop();}
    }

    //handle toast
    showToast(variant, title, message){
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);
    }

    // build Account
    buildAccountFields(profileinformation){
        this.accountFields=[
            {
                label:this.l.CompanyName,
                name:'Name',
                value:profileinformation?.Account?.Name
            },
            {
                label:this.l.NumberOfEmployees,
                name:'NumberOfEmployees',
                value:profileinformation?.Account?.NumberOfEmployees
            }
            ,
            {
                label:this.l.Website,
                name:'Website',
                value:profileinformation?.Account?.Website,
                type:'Link',
                class:'Link',
                url:profileinformation?.Account?.Website
            },
            {
                label:this.l.Phone,
                name:'Phone',
                value:profileinformation?.Account?.Phone
            },
            {
                label:this.l.YearStarted,
                name:'YearStarted',
                value:profileinformation?.Account?.YearStarted
            },
            {
                label:this.l.Industry,
                name:'Industry',
                value:profileinformation?.Account?.Industry
            },
            {
                label:this.l.Description,
                name:'Description',
                value:profileinformation?.Account?.Description
            }

         
        
        ];
    }
}