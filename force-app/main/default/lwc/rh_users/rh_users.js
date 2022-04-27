import { LightningElement,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import { labels } from 'c/rh_label';

import getContacts from '@salesforce/apex/RH_Users_controller.getContacts';
import getEmployeeDetails from '@salesforce/apex/RH_Users_controller.getEmployeeDetails'
import getExtraFields from '@salesforce/apex/RH_Users_controller.getExtraFields'
import userStatusUpdate from '@salesforce/apex/RH_Users_controller.userStatusUpdate'
import userRoleUpdate from '@salesforce/apex/RH_Users_controller.userRoleUpdate'
import changeMyPassword from '@salesforce/apex/RH_Profile_controller.changeMyPassword';
import changeUserPassword from '@salesforce/apex/RH_Users_controller.changeUserPassword';
// import getActiveWorkgroups from '@salesforce/apex/RH_WorkGroup_Query.getActiveWorkgroups';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
const NEW_ACTION='New';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';


const ERROR_VARIANT='error';
const FROMRESETPWD='ResetPWD';
const RESET_ACTION='Reset';
const SAVE_ACTION='Save';

const ACTIVE_ACTION='active';
const DISABLE_ACTION='banned';
const FREEZE_ACTION='frozen';
const PROMOTE_ACTION='PromoteBaseUser';
const CARD_ACTION='stateAction';

const FROM_CHILD='FROM_CHILD';
const FROM_PARENT='FROM_PARENT';
export default class Rh_users extends NavigationMixin(LightningElement) {

l={...labels}
@track groups=[];
@track listcontact = [];
recordId;
title;
information;
jsonInfo;
contactrecord;
contactNotFounded=false;
@track accountFields=[];
@track formPersonanalInputDetails=[];
currUser={};

keysFields={accountName:'ok'};
keysLabels={
    accountName:'Company', FirstName:'First Name',
    RHRolec:'Role',
};
fieldsToShow={
    accountName:'ok', FirstName:'',
    RHRolec:'ok',
};

constants={};

StatusActions=[


    {
        variant:"base",
        label:this.l.Activate,
        name:ACTIVE_ACTION,
        title:this.l.Activate,
        iconName:"utility:user",
        class:"active-item"
    },
    {
        variant:"base",
        label:this.l.Freeze,
        name:FREEZE_ACTION,
        title:this.l.Freeze,
        iconName:"utility:resource_absence",
        class:"freeze-item"
    },
    {
        variant:"base",
        label:this.l.Disable,
        name:DISABLE_ACTION,
        title:this.l.Disable,
        iconName:"utility:block_visitor",
        class:"disable-item "
    }

]
RoleActions=[
    {
        variant:"base",
        label:this.l.PromoteBaseUser,
        name:PROMOTE_ACTION,
        title:this.l.PromoteBaseUser,
        iconName:"utility:user",
        // class:"active-item"
    }
]
detailsActions=[
]
@wire(CurrentPageReference) pageRef;
action='';
    get showNew(){ return this.isAdmin && (this.action=='' || this.action==NEW_ACTION || this.action==SAVE_ACTION); }
    get hideView(){  return this.action=='' || this.action!=NEW_ACTION; }
    get hasDetailsActions(){ return this.detailsActions?.length >0}
    get hasEmployeeInfo(){  return this.contactrecord?true:false; }
    get isAdmin() { return this.currUser?.isCEO || this.currUser?.isTLeader}
    get hascontact(){ return this.listcontact.length >0; }
    get hasrecordid(){ return this.recordId?true:false; }
    connectedCallback(){
        
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        if (this.recordId) {
            this.startSpinner(true);
            this.getEmployeeInfos(this.recordId);
            this.getExtraFields(this.recordId);
            this.startSpinner(false);
        }else{
            this.getAllEmployees();
        }
    }
    getAllEmployees(){
        this.listcontact=[];
        this.startSpinner(true);
        getContacts({}).then(result =>{
            console.log('result @@@ + ' +(result));
            console.log(result);
            const self=this;
            if (!result.error && result.Ok) {
                this.constants=result.Constants;
                this.currUser={...result.currentContact,
                                isCEO:result.isCEO,
                                isRHUser:result.isRHUser,
                                isTLeader:result.isTLeader,
                                isBaseUser:result.isBaseUser,
                }
                const isAD=this.isAdmin;
                this.listcontact = result.Employes.map(function (e ){
                    let item={...e};
                    item.title=e.LastName;
                    item.icon="standard:people";
                    item.class=e.Status;
                    
                    item.keysFields=self.keysFields;
                    item.keysLabels=self.keysLabels;
                    item.fieldsToShow=self.fieldsToShow;

                    let Actions=[];
                    //add status actions
                    if (isAD) {
                        Actions=Actions.concat(self.buildUserStatusActions(e.Status));
                        Actions=Actions.concat(self.buildUserRoleActions(e.RHRolec));
                    }


                    item.actions=Actions;
                    console.log(`item`);
                    console.log(item);
                    return item;
                });
                this.setviewsList(this.listcontact)

                this.currUser={...result.currentContact,
                                isCEO:result.isCEO,
                                isRHUser:result.isRHUser,
                                isTLeader:result.isTLeader,
                                isBaseUser:result.isBaseUser,
                }
            }else{
                this.showToast(WARNING_VARIANT,'ERROR', result.msg);
            }
        }).catch(e => {
            this.showToast(ERROR_VARIANT,'ERROR', e.message);
            console.error(e);
        })
        .finally(() => {
            this.startSpinner(false);
        })
    }
    handleActionNew(event){
        const data=event.detail;
        console.log('data >>',data,' \n action ',data?.action);
        this.action=data?.action;
        switch (data?.action) {
            case SAVE_ACTION:
                //refresh List
                this.getAllEmployees();
                break;
            case FROMRESETPWD:
                
                break;
            default:
                break;
        }
            
        
    }
    handleuser(event){
   
        console.log('event parent ' +event.detail);
        //this.getEmployeeInfos(event.detail);
        
        this.goToRequestDetail(event.detail);
        
    }
    handleCardAction(event){
        console.log('event parent ' +JSON.stringify(event.detail));
        const info=event.detail;
        if (info?.extra?.isTitle) {
            this.goToRequestDetail(info?.data?.id);
        }
        if (info?.action==CARD_ACTION) {//user clicks on the dropdown actions
            const record={Id:info?.data?.id, action:info?.extra?.item};
            this.handleUserAction(record, FROM_CHILD);
        }
    }
    handleUserAction(record,from=''){ 
        switch (record.action) {
            case DISABLE_ACTION:
                record.Status=this.constants.LWC_DISABLE_CONTACT_STATUS;
                this.doUpdateStatus(record,from)
                break;
            case ACTIVE_ACTION:
                record.Status=this.constants.LWC_ACTIVE_CONTACT_STATUS;
                this.doUpdateStatus(record,from)
                break;
            case FREEZE_ACTION:
                record.Status=this.constants.LWC_FREEZE_CONTACT_STATUS;
                this.doUpdateStatus(record,from)
                break;
            case PROMOTE_ACTION:
                record.Role=this.constants.LWC_CONTACT_ROLE_TL;
                this.doUpdateRole(record,from)
                break;
        
            default:
                break;
        }

    }

    setviewsList(items){
        let cardsView=this.template.querySelector('c-rh_cards_view');
        cardsView?.setDatas(items);
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

    getEmployeeInfos(recordid){
        this.startSpinner(true);
        getEmployeeDetails({
            recordId: recordid
        }).then(result =>{
            console.log('display contact ' +JSON.stringify(result))
            if (!result.error && result.Ok) {
                this.contactrecord = result.Employe;
                this.currUser={...result.currentContact,
                                                    isCEO:result.isCEO,
                                                    isRHUser:result.isRHUser,
                                                    isTLeader:result.isTLeader,
                                                    isBaseUser:result.isBaseUser,
                                    }
                this.constants=result.Constants;
                this.buildform(this.contactrecord);
                this.buildAccountFields(this.contactrecord);
                if(this.isAdmin)
                    this.buildDetailsActions(this.contactrecord);
            }else{
                this.showToast(WARNING_VARIANT,'ERROR', result.msg);
                this.title = 'Failled';
                this.information = result.msg;
                this.contactNotFounded=true;
            }


        }).catch(e =>{
            this.showToast(ERROR_VARIANT,'ERROR', e.message);
            console.error(e)
        }).finally(() => {
            this.startSpinner(false);
        })
    }
    buildUserStatusActions(status){
        return this.StatusActions.filter(function(action) {
            if (action.name.toLowerCase() != status?.toLowerCase()) {
                return action;
            }
        });
    }
    buildUserRoleActions(role){
        return (role==this.constants?.LWC_CONTACT_ROLE_BU) ? this.RoleActions : [];
    }
    buildDetailsActions(e){
        let Actions=[];
        Actions=Actions.concat(this.buildUserStatusActions(e?.RH_Status__c));
        Actions=Actions.concat(this.buildUserRoleActions(e?.RH_Role__c));
        this.detailsActions=Actions.map(function(e, index) {return { ...e,variant:"brand-outline",class:e.class+" slds-m-left_x-small" } });
    }
    handleDetailsActions(event){
        console.log('handleDetailsActions :', event.detail.action);
        const record={Id:this.contactrecord.Id, action:event.detail.action};
            this.handleUserAction(record, FROM_PARENT);
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
    callApexUpdateStatus(record,from=''){
        this.startSpinner(true)
        userStatusUpdate({ contactJson: JSON.stringify(record) })
          .then(result => {
            console.log('Result callApexUpdateStatus:: ');
            console.log(result);
            if (!result.error) {
               if (from== FROM_PARENT) {
                this.getEmployeeInfos(this.recordId);
               }else{
                this.getAllEmployees();
               } 
            }else{
                this.showToast(ERROR_VARIANT,'ERROR', result.msg);
            }
          })
          .catch(error => {
            console.error('Error:', error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }
    callApexUpdateRole(record,from=''){
        this.startSpinner(true)
        userRoleUpdate({ contactJson: JSON.stringify(record) })
          .then(result => {
            console.log('Result callApexUpdateRole:: ');
            console.log(result);
            if (!result.error) {
                if (from== FROM_PARENT) {
                 this.getEmployeeInfos(this.recordId);
                }else{
                 this.getAllEmployees();
                } 
             }else{
                 this.showToast(ERROR_VARIANT,'ERROR', result.msg);
             }
          })
          .catch(error => {
            console.error('Error:', error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }
    doUpdateStatus(record,from=''){
        console.log('doUpdateRole > record ',record, ' FROM ',from);
        /**
         * record(id, status)
         */
        this.callApexUpdateStatus(record,from);
    }
    doUpdateRole(record,from=''){
        console.log('doUpdateRole > record ',record, ' FROM ',from);
        /**
         * record(id, role)
         */
         this.callApexUpdateRole(record,from);
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
        info.recordId= this.recordId;
        console.log(`@@@@@ callUpdateInfoApex >>> Input : `,info);
        changeUserPassword({ changepasswordjson: JSON.stringify(info) })
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
        this.quiteEditMode(this.template.querySelector('c-rh_reset_password'))
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

    startSpinner(b){
       fireEvent(this.pageRef, 'Spinner', {start:b});
    }
    showToast(variant, title, message){
        fireEvent(this.pageRef, 'Toast', {variant, title, message});
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