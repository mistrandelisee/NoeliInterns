import { api, LightningElement,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import { labels } from 'c/rh_label';
import { icons } from 'c/rh_icons';

import getContacts from '@salesforce/apex/RH_Users_controller.getContacts';
import getEmployeeDetails from '@salesforce/apex/RH_Users_controller.getEmployeeDetails';
import userStatusUpdate from '@salesforce/apex/RH_Users_controller.userStatusUpdate';
import userRoleUpdate from '@salesforce/apex/RH_Users_controller.userRoleUpdate';
import changeUserPassword from '@salesforce/apex/RH_Users_controller.changeUserPassword';

import initConfig from '@salesforce/apex/RH_Users_controller.InitUserCreation';
import userCreation from '@salesforce/apex/RH_Users_controller.userCreation';

import checkUserCreation from '@salesforce/apex/RH_Users_controller.checkUserCreation';

// import getActiveWorkgroups from '@salesforce/apex/RH_WorkGroup_Query.getActiveWorkgroups';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener,unregisterListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
const EDIT_ACTION='Edit';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';


const ERROR_VARIANT='error';
const FROMRESETPWD='ResetPWD';
const RESET_ACTION='Reset';
const SAVE_ACTION='Save';

const ACTIVE_ACTION='active';
const DISABLE_ACTION='banned';
const RESETPWD='RESETPWD';
const FREEZE_ACTION='frozen';
const PROMOTE_ACTION='PromoteBaseUser';
const CARD_ACTION='stateAction';

const FROM_CHILD='FROM_CHILD';
const FROM_PARENT='FROM_PARENT';


//MODAL Actions
const OK_DISABLE='OK_DISABLE';
const OK_FREEZE='OK_FREEZE';

const KEY_NB='#NB';
const DEFAULT_CURRENCY='EUR';
export default class Rh_user_view extends NavigationMixin(LightningElement) {
    
l={...labels,
}

badge=[];
icon ={...icons}
@track groups=[];
@track roles=[];
@api recordId;
title;
information;
contactrecord;
contactNotFounded=false;
@track accountFields=[];
@track userDetails=[];
userFormInputs=[];
currUser={};

constants={};

@track skill_config={
    ly_xs:'12',
    ly_md:'12',
    ly_lg:'12',
}

RoleActions=[
    {
        variant:"base",
        label:this.l.PromoteBaseUser,
        name:PROMOTE_ACTION,
        title:this.l.PromoteBaseUser,
        iconName:this.icon.promote,
        class:'slds-m-left_x-small',
        pclass :' slds-float_right'
        // class:"active-item"
    }
]
detailsActions=[]
@wire(CurrentPageReference) pageRef;
action='';
isUser;
jsonInfo=[];
actionAvailable=[];
curriencies=[
    { label: 'EUR', value: 'EUR' },
    { label: 'FCFA', value: 'FCFA' },
];

get lg_user(){
    return this.isUser ? '6' : '12'
}
get md_user(){
    return this.isUser ? '7' : '12'
}
hasAction;
    
    get hasDetailsActions(){ return this.detailsActions?.length >0}
    get hasEmployeeInfo(){  return this.contactrecord?true:false; }
    get isAdmin() { return this.currUser?.isCEO || this.currUser?.isRHUser}
    get hasrecordid(){ return this.recordId?true:false; }
    get userProjects(){ 
        if (this.contactrecord?.Projects__r?.length>0) {
         return this.contactrecord?.Projects__r.map(record=>record.RH_Project__r)   
        }else return [];
    }
    get timeSheets(){
        return this.contactrecord?.RH_TimeSheets__r || [];
    }
    get accomplishments(){
        return this.contactrecord?.Accomplishments__r || [];
    }
    get leadedGroups(){
        return this.contactrecord?.WorkGroups_Leader__r || [];
    }
    get leadedProjects(){
        return this.contactrecord?.Projects_Leaded__r || [];
    }
    get projectTitle(){ return this.generatedTitle(this.l.projects,this.userProjects)}
    get TimeSheetsTitle(){ return this.generatedTitle(this.l.timesheets,this.timeSheets)}
    get LeadedGroupTitle(){ return this.generatedTitle(this.l.leadedGroups,this.leadedGroups)}
    get LeadedProjectTitle(){ return this.generatedTitle(this.l.leadedProjects,this.leadedProjects)}
    get AccomplishmentsTitle(){ return this.generatedTitle(this.l.Accomplishments,this.accomplishments)}
    

    editContactMode=false;
    connectedCallback(){
		registerListener('ModalAction', this.doModalAction, this);
        if (this.recordId) {
            this.getEmployeeInfos(this.recordId);
        }
    }
    disconnectedCallback() {
        unregisterListener('ModalAction', this.doModalAction, this);
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
    handleCardAction(event){
        console.log('event parent ' +JSON.stringify(event.detail));
        const info=event.detail;
        if (info?.extra?.isTitle) {
            
            this.goToRequestDetail(info?.data?.UserId || info?.data?.id);
        }
        if (info?.action==CARD_ACTION) {//user clicks on the dropdown actions
            const record={Id:info?.data?.id, action:info?.extra?.item};
            this.handleUserAction(record, FROM_CHILD);
        }
    }
    doModalAction(event){
        console.log('doModalAction in user view ', JSON.stringify(event.action));
        switch (event.action) {
            case OK_DISABLE:
                if(this.actionRecord?.Id){
                    this.doUpdateStatus(this.actionRecord,OK_DISABLE)
                    this.actionRecord={};
                }
                
                break;
            case OK_FREEZE:
                if(this.actionRecord?.Id){
                    this.doUpdateStatus(this.actionRecord,OK_FREEZE)
                    this.actionRecord={};
                }
                
                break;
            case RESETPWD:
                if (this.actionRecord.action == RESETPWD) {
                    this.ChangePasswordApex({});
                    this.actionRecord={};
                }
                break;
            default:
                this.actionRecord={}; 
                break;
        }
        this.ShowModal(false,null,[]);//close modal any way
        event.preventDefault();
    }
    actionRecord={};
    handleUserAction(record,from=''){ 
        let text='';
        const Actions=[]
        const extra={style:'width:20vw;'};//
        switch (record.action) {
            case DISABLE_ACTION:
                record.Status=this.constants.LWC_DISABLE_CONTACT_STATUS;
                this.actionRecord=record;
                text=this.l.disable_confirm;
                extra.title=this.l.action_confirm;
                extra.style+='--lwc-colorBorder: var(--bannedColor);';
                // Actions.push(this.createAction("brand-outline",this.l.Cancel,'KO',this.l.Cancel,"utility:close",'slds-m-left_x-small'));
                Actions.push(this.createAction("brand-outline",this.l.ok_confirm,OK_DISABLE,this.l.ok_confirm,this.icon.check,'slds-m-left_x-small'));
                this.ShowModal(true,text,Actions,extra);
               
                // this.doUpdateStatus(record,from)
                break;
            case ACTIVE_ACTION:
                record.Status=this.constants.LWC_ACTIVE_CONTACT_STATUS;
                this.actionRecord=record;
                this.doUpdateStatus(record,from)
                break;
            /*case FREEZE_ACTION:
                record.Status=this.constants.LWC_FREEZE_CONTACT_STATUS;
                 text='Are you sure you want to freeze this User?';
                 extra.title='Confirm Freeze';
                 extra.style+='--lwc-colorBorder: var(--warningColor);';
                this.actionRecord=record;
                Actions.push(this.createAction("brand-outline",'Yes',OK_FREEZE,'Yes',"utility:close",'slds-m-left_x-small'));
                this.ShowModal(true,text,Actions,extra);
                break;*/
            case RESETPWD:
                // record.Status=this.constants.LWC_FREEZE_CONTACT_STATUS;
                    text=this.l.reset_confirm;
                    extra.title=this.l.action_confirm;
                    extra.style+='--lwc-colorBorder: var(--warningColor);';
                this.actionRecord=record;
                Actions.push(this.createAction("brand-outline",this.l.ok_confirm,RESETPWD,this.l.ok_confirm,this.icon.check,'slds-m-left_x-small'));
                this.ShowModal(true,text,Actions,extra);
                break;
            case PROMOTE_ACTION:
                record.Role=this.constants.LWC_CONTACT_ROLE_TL;
                this.actionRecord=record;
                this.doUpdateRole(record,from)
                break;
        
            default:
                break;
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


    getEmployeeInfos(recordid){
        this.startSpinner(true);
        getEmployeeDetails({
            recordId: recordid
        }).then(result =>{
            console.log('display contact ' );
            console.log(result);
            if (!result.error && result.Ok) {
                this.editContactMode=false;
                this.isUser=result.isUser;
                this.contactrecord = result.Employe;
                this.currUser={...result.currentContact,
                                                    isCEO:result.isCEO,
                                                    isRHUser:result.isRHUser,
                                                    isTLeader:result.isTLeader,
                                                    isBaseUser:result.isBaseUser,
                                    }
                this.constants=result.Constants;
                const statusLabel=result.Employe?.statusLabel ;
                const status=result.Employe?.status ;
                this.badge=[{name: 'userBadge', class: this.classStyle(statusLabel),label: statusLabel}];
                this.buildUserDetails(this.contactrecord);
                this.buildAccountFields(this.contactrecord);
                this.buildExtraField(this.contactrecord?.RH_Extra_Infos__c);
                if(this.isAdmin){
                    this.buildDetailsActions(this.contactrecord);
                    // if(! this.isUser){
                        this.hasAction=true;
                        this.actionAvailable =[
                            {
                                variant:"base",
                                label:this.l.Edit,
                                name:EDIT_ACTION,
                                title:this.l.Edit,
                                iconName:this.icon.Edit,
                                class:"icon-md slds-m-left_x-small"
                            },
                        ];
                        //this.buildForm();
                    // }
                }
                    
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
    classStyle(className){

        switch(className){
            case 'Active':
                return "slds-float_left slds-theme_success";
            case 'Draft':
                return "slds-float_left slds-theme_info";
            case 'Frozen':
                return "slds-float_left slds-theme_shade";
            case 'Banned':
                return "slds-float_left slds-theme_error";
            default:
                return "slds-float_left slds-theme_alt-inverse";
        }

    }
    handleUserDetails(event){
        let action=event.detail.action;
        console.log('>>>>>>>>>>>>>. action ',action);
        if (action==EDIT_ACTION) {
            this.handleEdit();
        }else if(action=='goToLink'){
            const info = event.detail.info;
            let record={eltName:info.name,recordId:info.dataId}
            this.handleGoToLink(record);
        }
    }
    handleGoToLink(data){
        console.log(`handleGoToLink data `, JSON.stringify(data));
        this.startSpinner(false);
        switch (data?.eltName) {
            case 'Supervisor':
                this.goToPage('rhusers',{recordId:data?.recordId})
                break;
            case 'Group':
                this.goToPage('rhgroup',{recordId:data?.recordId})
                break;
        
            default:
                break;
        }
    }
    handleEdit(){
        this.startSpinner(true)
         initConfig()
           .then(result => {
             console.log('Result INIT CONF');
             console.log(result);
             if (!result.error && result.Ok) {
                 this.groups = result.Groups?.map(function(g) { return {label:g.Name,value:g.Id}});
                 this.roles = result.Picklists?.RH_Role__c;
                 this.buildForm();
                 this.editContactMode=true;
             }else{
                 this.showToast(WARNING_VARIANT,this.l.errorOp, result.msg);
             }
           })
           .catch(error => {
             console.error('Error:', error);
         }).finally(() => {
             this.startSpinner(false)
         });
     }
     handleCancel(){
        this.editContactMode=false;
        this.userFormInputs=[];
    }
    handleSave(evt){
        let record={};
        let result= this.save();
        if (result.isvalid) {
            record={...record,...result.obj};
            record.Id=this.contactrecord.Id;
            record.Activated=null;
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            this.callApexSave(record);
        }else{
            console.log(`Is not valid `);
        }
        console.log(`record `, record);
    }
    save(){
        let form=this.template.querySelector('c-rh_dynamic_form');
        console.log(form);
        let isvalid=true;  
        let obj={};
        
        let saveResult=form.save();
        console.log(`>>>>>>>>>>>>saveResult `, saveResult );
        let outputs = saveResult.outputs;
        isvalid=isvalid && saveResult.isvalid;
        console.log(`>>>>>>>>>>>>outputs `, outputs );
        obj=saveResult.obj;
        console.log(`>>>>>>>>>>>>obj `, obj );
        return  {isvalid,obj};
    }
    FinishCallApexSaveOK(){
        this.getEmployeeInfos(this.recordId);
    }
     callApexSave(input){
        this.startSpinner(true)
        userCreation({ contactJson: JSON.stringify(input) })
          .then(result => {
            console.log('Result callApexSave:: ');
            console.log(result);
            if(! result.error && result.Ok)
                this.FinishCallApexSaveOK();
                else
                this.showToast(ERROR_VARIANT,'ERROR', result.msg);  
          })
          .catch(error => {
            console.error('Error:', error);
        }).finally(() => {
            this.startSpinner(false)
        });
    }
    buildUserStatusActions(status){
        const Actions=[];

        //delete
        if ((this.constants.LWC_DISABLE_CONTACT_STATUS?.toLowerCase() != status?.toLowerCase())) {
            Actions.push(this.createAction("brand-outline",this.l.Disable,DISABLE_ACTION,this.l.Disable,this.icon.ban,'slds-m-left_x-small'));
        }
        
        //Active
        if ((this.constants.LWC_ACTIVE_CONTACT_STATUS?.toLowerCase() != status?.toLowerCase())) {
            Actions.push(this.createAction("brand-outline",this.l.Activate,ACTIVE_ACTION,this.l.Activate,this.icon.approve,'slds-m-left_x-small'));
        }
        //freeze
        if (this.isUser && (this.constants.LWC_FREEZE_CONTACT_STATUS?.toLowerCase() != status?.toLowerCase())) { //Not used in any logic
            // Actions.push(this.createAction("brand-outline",this.l.Freeze,FREEZE_ACTION,this.l.Freeze,"utility:resource_absence",'slds-m-left_x-small'));
        }
        return Actions;
    }
    createAction(variant,label,name,title,iconName,className){ 
        return {
            variant, label, name, title, iconName,  class:className ,pclass :' slds-float_right'
        };
    }
    buildUserRoleActions(role){
        return (role==this.constants?.LWC_CONTACT_ROLE_BU) ? this.RoleActions : [];
    }
    buildDetailsActions(e){
        let Actions=[];
        Actions=Actions.concat(this.buildUserStatusActions(e?.RH_Status__c));
        if ((this.constants.LWC_ACTIVE_CONTACT_STATUS?.toLowerCase() == e.RH_Status__c?.toLowerCase())) {//
            Actions=Actions.concat(this.buildUserRoleActions(e?.RH_Role__c));
            if (this.isUser) {
                Actions.push(this.createAction("brand-outline",this.l.ChangePasswordTitle,RESETPWD,this.l.ChangePasswordTitle,this.icon.close,'slds-m-left_x-small'));
            }
        }
        
        this.detailsActions=Actions.map(function(e, index) {return { ...e,variant:"brand-outline",class:e.class+" slds-m-left_x-small" } });
    }
    handleDetailsActions(event){
        console.log('handleDetailsActions :', event.detail.action);
        const record={Id:this.contactrecord.Id, action:event.detail.action};
            this.handleUserAction(record, FROM_PARENT);
    }
    goToProject(event){
        if(event.detail.action=='Item'){
            const data=event.detail.data;
            console.log(data);
            this.goToPage('rhproject',{'recordId': data.key})
        }
    }
    goToTimsheet(event){
        if(event.detail.action=='Item'){
            const data=event.detail.data;
            console.log(data);
            this.goToPage('rhtimesheet',{'recordId': data.key})
        }
    }
    goToAccomplishment(event){
        if(event.detail.action=='Item'){
            const data=event.detail.data;
            console.log(data);
            this.goToPage('accomplishment',{'recordId':data.key})
        }
    }
    goToGroup(event){
        if(event.detail.action=='Item'){
            const data=event.detail.data;
            console.log(data);
            this.goToPage('rhgroup',{'recordId': data.key})
        }
    }
     
  
      
    buildExtraField(extrafield){
        extrafield=extrafield || [];
        if(extrafield){
            this.jsonInfo= extrafield;
            let extraFieldCmp=this.template.querySelector('c-rh_extra_fields');
            extraFieldCmp?.initializeMap(extrafield);
        }
    }
    check(){
        checkUserCreation({ conID: this.contactrecord.Id })
          .then(result => {
            console.log('Result');
            console.log(result);
            if ( !result.error) {
                if (result.Ok) {
                    //user created
                    console.log( result);
                    this.goToPage('rhusers',{'recordId': result?.users[0].Id});
                }else{
                    this.checkUserCreationJS();
                }
            }else{
                //has intern error
                this.showToast(ERROR_VARIANT,'ERROR', result.msg);
                this.startSpinner(false)
            }
          })
          .catch(error => {
            console.error('Error:', error);
            this.showToast(ERROR_VARIANT,'ERROR', error);
            this.startSpinner(false)
        });
    }
    checkUserCreationJS(){
        let self=this;
        setTimeout(() => {
            self.check();
        }, 1000);
        
    }
    callApexUpdateStatus(record,from=''){
        this.startSpinner(true)
        userStatusUpdate({ contactJson: JSON.stringify(record) })
          .then(result => {
            console.log('Result callApexUpdateStatus:: ');
            console.log(result);
            if (!result.error) {
               if (record.Status== this.constants.LWC_ACTIVE_CONTACT_STATUS) {
                 this.checkUserCreationJS();
               } else{
                if (record.Status== this.constants.LWC_DISABLE_CONTACT_STATUS) {
                    this.goToPage('rhusers');
                  }else{
                    this.getEmployeeInfos(this.recordId);
                  }
               }
            }else{
                this.showToast(ERROR_VARIANT,'ERROR', result.msg);
                this.startSpinner(false)
            }
          })
          .catch(error => {
            console.error('Error:', error);
            this.startSpinner(false)
        }).finally(() => {
            // this.startSpinner(false)
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

        //if(evt.action==RESET_ACTION)
            //this.ChangePasswordApex(data);
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
    ShowModal(show,text,actions,extra={}){
        fireEvent(this.pageRef, 'Modal', {show,text,actions,extra});
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
    
    buildUserDetails(profileinformation){
        this.userDetails=[
            {
                label:this.l.LastName,
                name:'LastName',
                placeholder:this.l.LastNamePlc,
                value:profileinformation?.LastName,
            },
            {
                label:this.l.FirstName,
                name:'FirstName',
                value:profileinformation?.FirstName,
            },
            {
                label:this.l.Email,
                name:'Email',
                value:profileinformation?.Email,
                type:'email',
            },
            {
                label:this.l.Language,
                name:'Language',
                value:profileinformation?.Languages__c
            },
           {
                label:this.l.Role,
                name:'Role',
                value:profileinformation?.RoleLabel
            },
            
            {
                label:this.l.Group,
                name:'Group',
                value:profileinformation?.RH_WorkGroup__r?.Name,
                type:'Link',
                class:'Link',
                dataId:profileinformation?.RH_WorkGroup__r?.Id
            },
            {
                label:this.l.StartDate,
                name:'StartDate',
                value: profileinformation?.RH_Started_Date__c,
            },
            
            
    
        ];
        if (this.isAdmin) {
            this.userDetails.push({
                label: this.l.Salary,
                name: 'Salary',
                value: profileinformation?.RH_Salary__c,
                isCurrency:true,
                code:DEFAULT_CURRENCY,
            })
        }
        if (this.isUser) {
            
            this.userDetails=this.userDetails.concat([
                
                {
                    label:this.l.Phone,
                    name:'Phone',
                    value:profileinformation?.Phone,
                },
                {
                    label:this.l.Country,
                    name:'Country',
                    value:profileinformation?.MailingCountry
                },
                {
                    label:this.l.Province,
                    name:'Province',
                    value:profileinformation?.MailingState
                },
                {
                    label:this.l.City,
                    name:'City',
                    value:profileinformation?.MailingCity
                },
                {
                    label:this.l.Street,
                    name:'Street',
                    value:profileinformation?.MailingStreet
                },
                {
                    label:this.l.PostalCode,
                    name:'Postal Code',
                    value:profileinformation?.MailingPostalCode
                },
                {
                    label:this.l.Birthday,
                    name:'Birthday',
                    value:profileinformation?.Birthdate,
                },
                {
                    label:this.l.About,
                    name:'Description',
                    value:profileinformation?.Description,
                }
        
            ]);
        }
        if (this.isAdmin) {
            this.userDetails.push({
                label: this.l.ApprNote,
                name: 'Note',
                value: this.notes,
                type:'textarea'
            })
        }
    
    }
    get notes() {
        const notes=this.contactrecord?.Notes?.map(x=>x.Body)|| [];
        return notes.join('<br>');
    }
    buildForm(){
        this.userFormInputs=[
            {
                label:this.l.LastName,
                placeholder:this.l.LastNamePlc,
                name:'LastName',
                value: this.contactrecord?.LastName,
                required:true,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.FirstName,
                placeholder:this.l.FirstNamePlc,
                name:'FirstName',
                value: this.contactrecord?.FirstName,
                required:false,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Email,
                placeholder:this.l.EmailPlc,
                name:'Email',
                required:true,
                value: this.contactrecord?.Email,
                maxlength:100,
                type:'email',
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Role,
                name:'Role',
                required:true,
                picklist: true,
                options: this.roles,
                value: this.contactrecord?.RH_Role__c,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.Group,
                name:'Group',
                picklist: true,
                options: this.groups,
                value: this.contactrecord?.RH_WorkGroup__c,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.StartDate,
                placeholder:this.l.StartDate,
                name:'StartDate',
                required:true,
                value: this.contactrecord?.RH_Started_Date__c,
                type:'Date',
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6',
                isText:true,//for avoid render blank field
            },
            {
                label:`${this.l.Salary} (${DEFAULT_CURRENCY})`,
                placeholder:this.l.Salary,
                name:'Salary',
                required:true,
                min:1,
                value:this.contactrecord?.RH_Salary__c || 0,
                type:'number',
                // readOnly:this.isEntryReadOnly,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.l.ApprNote,
                name:'Notes',
                value:this.notes,
                placeholder:this.l.ApprNote,
                className:'textarea',
                maxlength:32000,
                type:'textarea',
                ly_md:'12', 
                ly_xs:'12', 
                ly_lg:'12'
            },/*,
            {
                label:this.l.Currency,
                name:'currencyCode',
                type:'radio',
                variant:'label-inline',
                value: DEFAULT_CURRENCY,
                required:true,
                options : this.curriencies,
                readOnly:true,
                ly_xs:'12', 
                ly_md:'6', 
                ly_lg:'6'
            },*/
         
        
        ]
    }
    generatedTitle(title,records){
        let output =title || '';
        if (records) {
            output= title.replace(KEY_NB,records.length);
        }
        return output;
    }

}