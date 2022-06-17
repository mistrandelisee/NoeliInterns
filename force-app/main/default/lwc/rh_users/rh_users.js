import { LightningElement,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import { labels } from 'c/rh_label';

import initConfig from '@salesforce/apex/RH_Users_controller.InitFilter';
import getContacts from '@salesforce/apex/RH_Users_controller.getContacts';
import userStatusUpdate from '@salesforce/apex/RH_Users_controller.userStatusUpdate'
import userRoleUpdate from '@salesforce/apex/RH_Users_controller.userRoleUpdate'
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

l={...labels,
Name: 'Name',
srchNamePlc: 'Search by name',
From:'From',
To:'To',
OrderBy:'sort By',
selectPlc:'Select an option',
}
Status=[];
roles=[];
OrderBys=[];
@track allEmployees = [];
recordId;
contactrecord;
contactNotFounded=false;
@track accountFields=[];
@track userDetails=[];
// userFormInputs=[];
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
filter={
    searchText:null,
    status:null,
    startDate:null,
    endDate:null,
    role:null,
    isActive:null,
    orderBy:null,
    orderOn:null,
}
filterInputs=[];
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
isUser;
actionAvailable=[];
hasAction;
    get showNew(){ return this.isAdmin && (this.action=='' || this.action==NEW_ACTION || this.action==SAVE_ACTION); }
    get hideView(){  return this.action=='' || this.action!=NEW_ACTION; }
    get hasDetailsActions(){ return this.detailsActions?.length >0}
    get filterReady(){ return this.filterInputs?.length >0}
    get isAdmin() { return this.currUser?.isCEO || this.currUser?.isRHUser}
    get hasrecordid(){ return this.recordId?true:false; }
    connectedCallback(){
        
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        if (this.recordId) {
            this.startSpinner(true);
            //this.getEmployeeInfos(this.recordId);
            // this.getExtraFields(this.recordId);
            this.startSpinner(false);
        }else{
            this.initFilter();
            this.getAllEmployees();
        }
    }
    initFilter(){
        // this.startSpinner(true)
        initConfig()
          .then(result => {
            console.log('Result INIT FILTER ');
            console.log(result);
            if (!result.error && result.Ok) {
                this.currUser={...result.currentContact,
                                    isCEO:result.isCEO,
                                    isRHUser:result.isRHUser,
                                    isTLeader:result.isTLeader,
                                    isBaseUser:result.isBaseUser,
                    }
                this.Status = result.Picklists?.RH_Status__c;
                this.roles = result.Picklists?.RH_Role__c;
                this.OrderBys = result.OrderBys;
                this.Status.unshift({
                    label:this.l.selectPlc,value:''
                });
                this.roles.unshift({
                    label:this.l.selectPlc,value:''
                });
                this.buildFilter();
            }else{
                this.showToast(WARNING_VARIANT,'ERROR', result.msg);
            }
          })
          .catch(error => {
            console.error('Error:', error);
        }).finally(() => {
            // this.startSpinner(false)
        });
    }

    handleSubmitFilter(event) {
        const record=event.detail;
        console.log(`handleSubmitFilter record `, JSON.stringify(record) );
        this.filter={... this.filter ,...record ,
            orderOn: record.orderOn ? 'DESC' : 'ASC'};
        console.log(`handleSubmitFilter this.filter TO CALL `, JSON.stringify(this.filter) );
        
        this.getAllEmployees();
    }

    getAllEmployees(){
        console.log(`getAllEmployees this.filter TO CALL `, JSON.stringify(this.filter) );
        this.allEmployees=[];
        this.startSpinner(true);
        getContacts({filterTxt:JSON.stringify(this.filter)}).then(result =>{
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
                this.allEmployees = []
                result.Employes.forEach(function (e ){
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
                        if ((self.constants.LWC_ACTIVE_CONTACT_STATUS?.toLowerCase() == e.Status?.toLowerCase())) {//
                            Actions=Actions.concat(self.buildUserRoleActions(e.RHRolec));
                        }
                    }


                    item.actions=Actions;
                    console.log(`item`);
                    console.log(item);

                    if(isAD || (!isAD && (self.constants.LWC_ACTIVE_CONTACT_STATUS?.toLowerCase() == e.Status?.toLowerCase())))
                        self.allEmployees.push(item) ;
                });
                this.setviewsList(this.allEmployees)

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

    buildFilter(){
        /*{
            searchText:null,
            status:null,
            startDate:null,
            endDate:null,
            role:null,
            isActive:null,
            orderBy:null,
            orderOn:null,
        }*/
        this.filterInputs=[
            {
                label:this.l.Name,
                placeholder:this.l.srchNamePlc,
                name:'searchText',
                value: '',
                ly_md:'3', 
                ly_xs:'6', 
                ly_lg:'3'
            }];
            if (this.isAdmin) {///add status only if is admin
                this.filterInputs.push({
                    label:this.l.Status,
                    name:'status',
                
                    picklist: true,
                    options: this.Status,
                    value: '',
                    ly_md:'3',
                    ly_xs:'6',  
                    ly_lg:'3'
                });
            }
            this.filterInputs =[...this.filterInputs,
            {
                label:this.l.Role,
                name:'role',
               
                picklist: true,
                options: this.roles,
                value: '',
                ly_md:'3',
                ly_xs:'6',  
                ly_lg:'3'
            },
            {
                label:this.l.From,
                placeholder:this.l.From,
                name:'startDate',
               
                value: '',
                type:'Date',
                ly_md:'3', 
                ly_xs:'6', 
                ly_lg:'3',
            },
            {
                label:this.l.To,
                placeholder:this.l.To,
                name:'EndDate',
               
                value: '',
                type:'Date',
                ly_md:'3', 
                ly_xs:'6', 
                ly_lg:'3',
            },
            {
                label:this.l.OrderBy,
                name:'orderBy',
               
                picklist: true,
                options: this.OrderBys,
                value: 'CreatedDate',
                ly_md:'3',
                ly_xs:'12',  
                ly_lg:'3'
            },

            
            {
                label:'As',
                name:'orderOn',
                checked:true,
                type:'toggle',
                toggleActiveText:'DESC',
                toggleInactiveText:'ASC',
                ly_md:'6', 
                ly_lg:'6'
            }
         
        
        ];
    }
    startSpinner(b){
       fireEvent(this.pageRef, 'Spinner', {start:b});
    }
    showToast(variant, title, message){
        fireEvent(this.pageRef, 'Toast', {variant, title, message});
    }

}