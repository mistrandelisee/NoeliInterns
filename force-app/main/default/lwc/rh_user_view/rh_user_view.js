import { api, LightningElement,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import { labels } from 'c/rh_label';

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
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
const EDIT_ACTION='Edit';
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


//MODAL Actions
const OK_DISABLE='OK_DISABLE';
const OK_FREEZE='OK_FREEZE';

export default class Rh_user_view extends NavigationMixin(LightningElement) {
    
l={...labels}
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
isUser;
jsonInfo=[];
actionAvailable=[];

hasAction;
    
    get hasDetailsActions(){ return this.detailsActions?.length >0}
    get hasEmployeeInfo(){  return this.contactrecord?true:false; }
    get isAdmin() { return this.currUser?.isCEO || this.currUser?.isTLeader}
    get hasrecordid(){ return this.recordId?true:false; }
    get userProjects(){ 
        if (this.contactrecord?.Projects__r?.length>0) {
         return this.contactrecord?.Projects__r.map(record=>record.RH_Project__r)   
        }else return [];
    }
    get timeSheets(){
        return this.contactrecord?.RH_TimeSheets__r || [];
    }

    editContactMode=false;
    connectedCallback(){
		registerListener('ModalAction', this.doModalAction, this);
        if (this.recordId) {
            this.getEmployeeInfos(this.recordId);
        }
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
                this.doUpdateStatus(this.actionRecord,OK_DISABLE)
                break;
            case OK_FREEZE:
                this.doUpdateStatus(this.actionRecord,OK_FREEZE)
                break;
            default:
                this.actionRecord={}; 
                break;
        }
        this.ShowModal(false,null,[]);//close modal any way
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
                text='Are you sure you want to disable this User?';
                extra.title='Confirm Deletion';
                extra.style+='--lwc-colorBorder: var(--bannedColor);';
                // Actions.push(this.createAction("brand-outline",this.l.Cancel,'KO',this.l.Cancel,"utility:close",'slds-m-left_x-small'));
                Actions.push(this.createAction("brand-outline",'Yes',OK_DISABLE,'Yes',"utility:close",'slds-m-left_x-small'));
                this.ShowModal(true,text,Actions,extra);
               
                // this.doUpdateStatus(record,from)
                break;
            case ACTIVE_ACTION:
                record.Status=this.constants.LWC_ACTIVE_CONTACT_STATUS;
                this.actionRecord=record;
                this.doUpdateStatus(record,from)
                break;
            case FREEZE_ACTION:
                record.Status=this.constants.LWC_FREEZE_CONTACT_STATUS;
                 text='Are you sure you want to freeze this User?';
                 extra.title='Confirm Freeze';
                 extra.style+='--lwc-colorBorder: var(--warningColor);';
                this.actionRecord=record;
                Actions.push(this.createAction("brand-outline",'Yes',OK_FREEZE,'Yes',"utility:close",'slds-m-left_x-small'));
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
                this.buildUserDetails(this.contactrecord);
                this.buildAccountFields(this.contactrecord);
                this.buildExtraField(this.contactrecord?.RH_Extra_Infos__c);
                if(this.isAdmin){
                    this.buildDetailsActions(this.contactrecord);
                    if(! this.isUser){
                        this.hasAction=true;
                        this.actionAvailable =[
                            {
                                variant:"base",
                                label:this.l.Edit,
                                name:EDIT_ACTION,
                                title:this.l.Edit,
                                iconName:"utility:edit",
                                class:"slds-m-left_x-small"
                            },
                        ];
                        //this.buildForm();
                    }
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
    handlUserDetails(event){
        let action=event.detail.action;
        console.log('>>>>>>>>>>>>>. action ',action);
        if (action==EDIT_ACTION) {
            this.handleEdit();
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
                 this.showToast(WARNING_VARIANT,'ERROR', result.msg);
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
            record.Activated=false;
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
        Actions.push(this.createAction("brand-outline",this.l.Disable,DISABLE_ACTION,this.l.Disable,"utility:close",'slds-m-left_x-small'));
        //Active
        if ((this.constants.LWC_ACTIVE_CONTACT_STATUS?.toLowerCase() != status?.toLowerCase())) {
            Actions.push(this.createAction("brand-outline",this.l.Activate,ACTIVE_ACTION,this.l.Activate,"utility:user",'slds-m-left_x-small'));
        }
        //freeze
        if (this.isUser && (this.constants.LWC_FREEZE_CONTACT_STATUS?.toLowerCase() != status?.toLowerCase())) {
            Actions.push(this.createAction("brand-outline",this.l.Freeze,FREEZE_ACTION,this.l.Freeze,"utility:resource_absence",'slds-m-left_x-small'));
        }
        return Actions;
    }
    createAction(variant,label,name,title,iconName,className){ 
        return {
            variant, label, name, title, iconName,  class:className
        };
    }
    buildUserRoleActions(role){
        return (role==this.constants?.LWC_CONTACT_ROLE_BU) ? this.RoleActions : [];
    }
    buildDetailsActions(e){
        let Actions=[];
        Actions=Actions.concat(this.buildUserStatusActions(e?.RH_Status__c));
        if ((this.constants.LWC_ACTIVE_CONTACT_STATUS?.toLowerCase() == e.Status?.toLowerCase())) {//
            Actions=Actions.concat(this.buildUserRoleActions(e?.RH_Role__c));
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
            },
            {
                label:this.l.StartDate,
                name:'StartDate',
                value: profileinformation?.RH_Started_Date__c,
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
            },
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
            }*/
    
        ];
        if (this.isUser) {
            
            this.userDetails=this.userDetails.concat([
                
                {
                    label:this.l.Phone,
                    name:'Phone',
                    value:profileinformation?.Phone,
                },
                {
                    label:this.l.City,
                    name:'City',
                    value:profileinformation?.OtherAddress,
                },
                {
                    label:this.l.Birthday,
                    name:'Birthday',
                    value:profileinformation?.Birthdate,
                },
                {
                    label:this.l.AboutMe,
                    name:'Description',
                    value:profileinformation?.Description,
                }
        
            ]);
        }
    
    }
    buildForm(){
        this.userFormInputs=[
            {
                label:'Last Name',
                placeholder:'Enter your Last Name',
                name:'LastName',
                value: this.contactrecord?.LastName,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'First Name',
                placeholder:'Enter your First Name',
                name:'FirstName',
                value: this.contactrecord?.FirstName,
                required:false,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Email',
                name:'Email',
                required:true,
                value: this.contactrecord?.Email,
                placeholder:'Email',
                maxlength:100,
                type:'email',
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Role',
                name:'Role',
                required:true,
                picklist: true,
                options: this.roles,
                value: this.contactrecord?.RH_Role__c,
                maxlength:100,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Group',
                name:'Group',
                picklist: true,
                options: this.groups,
                value: this.contactrecord?.RH_WorkGroup__c,
                maxlength:100,
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
                ly_md:'12', 
                ly_lg:'12',
                isText:true,//for avoid render blank field
            }
         
        
        ]
    }

}