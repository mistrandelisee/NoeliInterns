import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import { labels } from 'c/rh_label';

import initConfig from '@salesforce/apex/RH_Users_controller.InitFilter';
import getContacts from '@salesforce/apex/RH_Users_controller.getContacts';
import userStatusUpdate from '@salesforce/apex/RH_Users_controller.userStatusUpdate'
import userRoleUpdate from '@salesforce/apex/RH_Users_controller.userRoleUpdate'
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners, fireEvent } from 'c/pubsub';
const NEW_ACTION = 'New';
const SUCCESS_VARIANT = 'success';
const WARNING_VARIANT = 'warning';


const ERROR_VARIANT = 'error';
const FROMRESETPWD = 'ResetPWD';
const RESET_ACTION = 'Reset';
const SAVE_ACTION = 'Save';

const ACTIVE_ACTION = 'active';
const DISABLE_ACTION = 'banned';
const FREEZE_ACTION = 'frozen';
const PROMOTE_ACTION = 'PromoteBaseUser';
const CARD_ACTION = 'stateAction';

const FROM_CHILD = 'FROM_CHILD';
const FROM_PARENT = 'FROM_PARENT';
export default class Rh_users extends NavigationMixin(LightningElement) {

    l = {
        ...labels,
        srchNamePlc: '',
    }
    Status = [];
    roles = [];
    OrderBys = [];
    @track allEmployees = [];
    recordId;
    contactrecord;
    contactNotFounded = false;
    @track accountFields = [];
    @track userDetails = [];
    // userFormInputs=[];
    currUser = {};

    keysFields = { accountName: 'ok' };
    keysLabels = {
        accountName: this.l.Company, FirstName: this.l.FirstName,
        RoleLabel: this.l.Role, Email: this.l.Email,
    };
    fieldsToShow = {
        FirstName: '', Email: '', RoleLabel: 'ok',
        accountName: 'ok',

    };

    filter = {
        searchText: null,
        status: null,
        startDate: null,
        endDate: null,
        role: null,
        isActive: null,
        orderBy: null,
        orderOn: null,
    }
    
    initialfilter = {
        searchText: null,
        status: null,
        startDate: null,
        endDate: null,
        role: null,
        isActive: null,
        orderBy: null,
        orderOn: null,
    }
    statusSelected;
    roleSelected;

    filterInputs = [];
    constants = {};

    StatusActions = [


        {
            variant: "base",
            label: this.l.Activate,
            name: ACTIVE_ACTION,
            title: this.l.Activate,
            iconName: "utility:user",
            class: "active-item"
        },
        {
            variant: "base",
            label: this.l.Freeze,
            name: FREEZE_ACTION,
            title: this.l.Freeze,
            iconName: "utility:resource_absence",
            class: "freeze-item"
        },
        {
            variant: "base",
            label: this.l.Disable,
            name: DISABLE_ACTION,
            title: this.l.Disable,
            iconName: "utility:block_visitor",
            class: "disable-item "
        }

    ]
    RoleActions = [
        {
            variant: "base",
            label: this.l.PromoteBaseUser,
            name: PROMOTE_ACTION,
            title: this.l.PromoteBaseUser,
            iconName: "utility:user",
            // class:"active-item"
        }
    ]
    detailsActions = [
    ]
    @wire(CurrentPageReference) pageRef;
// to be cancel
    get objectPageReference(){
        return this.pageRef? JSON.stringify(this.pageRef): '';   
    }
    
// end cancel
    action = '';
    isUser;
    actionAvailable = [];
    hasAction;
    hasRecords;
    // @track filterReady;

    get showNew() { return this.isAdmin && (this.action == '' || this.action == NEW_ACTION || this.action == SAVE_ACTION); }
    get hideView() { return this.action == '' || this.action != NEW_ACTION; }
    get hasDetailsActions() { return this.detailsActions?.length > 0 }
    get filterReady() { 
        getContacts({ filterTxt: JSON.stringify(this.initialfilter) }).then(result =>{
            console.log('#### PIGNOUF =====> '+result != null)
            this.hasRecords = (result != null) ? true : false; 
        })

        return this.hasRecords;
    }
    get isAdmin() { return this.currUser?.isCEO || this.currUser?.isRHUser }
    get hasrecordid() { return this.recordId ? true : false; }

    connectedCallback() {
        // to be canceled
        this.windowLocation=`window location ${window.location.origin}`;
        console.log(this.windowLocation);
        console.log('Curent page Information Page'+ JSON.stringify(this.pageRef));
        console.log('objectPageReference'+this.objectPageReference);

        //end cancel

        // this.filterReady = (this.allEmployees?.length > 0);

        if(this.getUrlParamValue(window.location.href, 'action') == NEW_ACTION) {
            this.action = this.getUrlParamValue(window.location.href, 'action');
        }

        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        if (this.recordId) {
            this.startSpinner(true);
            //this.getEmployeeInfos(this.recordId);
            // this.getExtraFields(this.recordId);
            this.startSpinner(false);
        } else {
            this.initFilter();
            this.getAllEmployees();
        }
    }
    initFilter() {
        // this.startSpinner(true)
        initConfig()
            .then(result => {
                console.log('Result INIT FILTER ');
                console.log(result);
                if (!result.error && result.Ok) {
                    this.currUser = {
                        ...result.currentContact,
                        isCEO: result.isCEO,
                        isRHUser: result.isRHUser,
                        isTLeader: result.isTLeader,
                        isBaseUser: result.isBaseUser,
                    }
                    this.Status = result.Picklists?.RH_Status__c;
                    this.roles = result.Picklists?.RH_Role__c;
                    this.OrderBys = result.OrderBys;
                    this.Status.unshift({
                        label: this.l.selectPlc, value: ''
                    });
                    this.roles.unshift({
                        label: this.l.selectPlc, value: ''
                    });
                    this.buildFilter();
                } else {
                    this.showToast(WARNING_VARIANT, 'ERROR', result.msg);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            }).finally(() => {
                // this.startSpinner(false)
            });
    }
    handleSubmitFilter(event) {
        const searchFilter = event.detail;
        this.handleSearch(searchFilter);
    }
    handleSearch(record) {
       
        console.log(`handleSearch record `, JSON.stringify(record));
        this.filter = {
            ... this.filter, ...record,
            orderOn: record.orderOn ? 'DESC' : 'ASC'
        };
        console.log(`handleSearch this.filter TO CALL `, JSON.stringify(this.filter));
        this.statusSelected=this.filter.status || this.statusSelected;
        this.roleSelected=this.filter.role || this.roleSelected;
        this.getAllEmployees();
    }

    getAllEmployees() {
        console.log(`getAllEmployees this.filter TO CALL `, JSON.stringify(this.filter));
        this.allEmployees = [];
        this.startSpinner(true);
        getContacts({ filterTxt: JSON.stringify(this.filter) }).then(result => {
            console.log('result @@@ + ' + (result));
            console.log(result);
            const self = this;
            if (!result.error && result.Ok) {
                this.constants = result.Constants;
                this.currUser = {
                    ...result.currentContact,
                    isCEO: result.isCEO,
                    isRHUser: result.isRHUser,
                    isTLeader: result.isTLeader,
                    isBaseUser: result.isBaseUser,
                }
                const isAD = this.isAdmin;
                this.allEmployees = []
                result.Employes.forEach(function (e) {
                    let item = { ...e };
                    item.title = e.LastName;
                    item.icon = "standard:people";
                    item.class = e.Status;

                    item.keysFields = self.keysFields;
                    item.keysLabels = self.keysLabels;
                    item.fieldsToShow = self.fieldsToShow;

                    let Actions = [];
                    //add status actions
                    if (isAD) {
                        Actions = Actions.concat(self.buildUserStatusActions(e.Status));
                        if ((self.constants.LWC_ACTIVE_CONTACT_STATUS?.toLowerCase() == e.Status?.toLowerCase())) {//
                            Actions = Actions.concat(self.buildUserRoleActions(e.RHRolec));
                        }
                    }


                    item.actions = Actions;
                    // console.log(`item`);
                    // console.log(item);
                    const mapping=result.classMapping;
                    let st=(e.Status)? e.Status.toLowerCase():'';
                    let cx=mapping[st];
                    
                    const badge = { name: 'badge', class: cx? cx+' slds-float_left ' :self.classStyle(e.Status), label: e.statusLabel }
                    item.addons = { badge };
                    if (isAD || (!isAD && (self.constants.LWC_ACTIVE_CONTACT_STATUS?.toLowerCase() == e.Status?.toLowerCase())))
                        self.allEmployees.push(item);
                });

                                
                this.setviewsList(this.allEmployees)

                this.currUser = {
                    ...result.currentContact,
                    isCEO: result.isCEO,
                    isRHUser: result.isRHUser,
                    isTLeader: result.isTLeader,
                    isBaseUser: result.isBaseUser,
                }
            } else {
                this.showToast(WARNING_VARIANT, 'ERROR', result.msg);
            }
        }).catch(e => {
            this.showToast(ERROR_VARIANT, 'ERROR', e.message);
            console.error(e);
        })
            .finally(() => {
                this.startSpinner(false);
            })
    }
    classStyle(className) {

        switch (className) {
            case 'active':
                return "slds-float_left slds-theme_success";
            case 'draft':
                return "slds-float_left slds-theme_alt-inverse";
            case 'frozen':
                return "slds-float_left slds-theme_shade";
            case 'banned':
                return "slds-float_left slds-theme_error";
            default:
                return "slds-float_left  slds-theme_info";
        }

    }
    resetFilter(){
          this.filter = {
            searchText: null,
            status: null,
            startDate: null,
            endDate: null,
            role: null,
            isActive: null,
            orderBy: null,
            orderOn: null,
        }
    }
    handleClickOnPill(event){
        const info = event.detail;
        console.log('data >>', info, ' \n name ', info?.name);
        const name = info?.name;
        this.resetFilter()
        const  filter ={...this.filter}
        filter[name] = info?.data?.value;
        
        this.handleSearch(filter);
    }
    handleActionNew(event) {

        // this.goToAction(NEW_ACTION);
        
        const data = event.detail;
        console.log('data >>', data, ' \n action ', data?.action);
        this.action = data?.action;

        // if (data?.action == NEW_ACTION){
        //     this.goToAction(NEW_ACTION);            
        // }else if(data?.action == SAVE_ACTION){
        //     this.getAllEmployees();
        // }

        switch (data?.action) {

            case NEW_ACTION:
                //relocate to url?action=new
                this.goToAction(NEW_ACTION);
                break;

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
    handleCardAction(event) {
        console.log('event parent ' + JSON.stringify(event.detail));
        const info = event.detail;
        if (info?.extra?.isTitle) {

            this.goToRequestDetail(info?.data?.UserId || info?.data?.id);
        }
        if (info?.action == CARD_ACTION) {//user clicks on the dropdown actions
            const record = { Id: info?.data?.id, action: info?.extra?.item };
            this.handleUserAction(record, FROM_CHILD);
        }
    }
    handleUserAction(record, from = '') {
        switch (record.action) {
            case DISABLE_ACTION:
                record.Status = this.constants.LWC_DISABLE_CONTACT_STATUS;
                this.doUpdateStatus(record, from)
                break;
            case ACTIVE_ACTION:
                record.Status = this.constants.LWC_ACTIVE_CONTACT_STATUS;
                this.doUpdateStatus(record, from)
                break;
            case FREEZE_ACTION:
                record.Status = this.constants.LWC_FREEZE_CONTACT_STATUS;
                this.doUpdateStatus(record, from)
                break;
            case PROMOTE_ACTION:
                record.Role = this.constants.LWC_CONTACT_ROLE_TL;
                this.doUpdateRole(record, from)
                break;

            default:
                break;
        }

    }

    setviewsList(items) {
        let cardsView = this.template.querySelector('c-rh_cards_view');
        cardsView?.setDatas(items);
    }

    //navigation Page
    goToAction(action) {
        var pagenname = 'rhusers';
        let states = { 'action': action };
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: pagenname
            },
            state: states
        });
    }

    goToRequestDetail(recordid) {
        var pagenname = 'rhusers'; //request page nam
        let states = { 'recordId': recordid }; //event.currentTarget.dataset.id , is the recordId of the request

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: pagenname
            },
            state: states
        });
    }

    getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
    }


    buildUserStatusActions(status) {
        return this.StatusActions.filter(function (action) {
            if (action.name.toLowerCase() != status?.toLowerCase()) {
                return action;
            }
        });
    }
    buildUserRoleActions(role) {
        return (role == this.constants?.LWC_CONTACT_ROLE_BU) ? this.RoleActions : [];
    }
    callApexUpdateStatus(record, from = '') {
        this.startSpinner(true)
        userStatusUpdate({ contactJson: JSON.stringify(record) })
            .then(result => {
                console.log('Result callApexUpdateStatus:: ');
                console.log(result);
                if (!result.error) {
                    if (from == FROM_PARENT) {
                        this.getEmployeeInfos(this.recordId);
                    } else {
                        this.getAllEmployees();
                    }
                } else {
                    this.showToast(ERROR_VARIANT, 'ERROR', result.msg);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            }).finally(() => {
                this.startSpinner(false)
            });
    }
    callApexUpdateRole(record, from = '') {
        this.startSpinner(true)
        userRoleUpdate({ contactJson: JSON.stringify(record) })
            .then(result => {
                console.log('Result callApexUpdateRole:: ');
                console.log(result);
                if (!result.error) {
                    if (from == FROM_PARENT) {
                        this.getEmployeeInfos(this.recordId);
                    } else {
                        this.getAllEmployees();
                    }
                } else {
                    this.showToast(ERROR_VARIANT, 'ERROR', result.msg);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            }).finally(() => {
                this.startSpinner(false)
            });
    }
    doUpdateStatus(record, from = '') {
        console.log('doUpdateRole > record ', record, ' FROM ', from);
        /**
         * record(id, status)
         */
        this.callApexUpdateStatus(record, from);
    }
    doUpdateRole(record, from = '') {
        console.log('doUpdateRole > record ', record, ' FROM ', from);
        /**
         * record(id, role)
         */
        this.callApexUpdateRole(record, from);
    }

    buildFilter() {

        this.filterInputs = [
            {
                label: this.l.Name,
                placeholder: this.l.srchNamePlc,
                name: 'searchText',
                type: 'text',
                value: '',
                ly_md: '3',
                ly_xs: '6',
                ly_lg: '3'
            }];
        if (this.isAdmin) {///add status only if is admin
            this.filterInputs.push({
                label: this.l.Status,
                name: 'status',

                picklist: true,
                options: this.Status,
                value: '',
                ly_md: '3',
                ly_xs: '6',
                ly_lg: '3'
            });
        }
        this.filterInputs = [...this.filterInputs,
        {
            label: this.l.Role,
            name: 'role',

            picklist: true,
            options: this.roles,
            value: '',
            ly_md: '3',
            ly_xs: '6',
            ly_lg: '3'
        },
        {
            label: this.l.From,
            placeholder: this.l.From,
            name: 'startDate',

            value: '',
            type: 'Date',
            ly_md: '3',
            ly_xs: '6',
            ly_lg: '3',
        },
        {
            label: this.l.To,
            placeholder: this.l.To,
            name: 'EndDate',

            value: '',
            type: 'Date',
            ly_md: '3',
            ly_xs: '6',
            ly_lg: '3',
        },
        {
            label: this.l.OrderBy,
            name: 'orderBy',

            picklist: true,
            options: this.OrderBys,
            value: 'CreatedDate',
            ly_md: '3',
            ly_xs: '12',
            ly_lg: '3'
        },


        {
            label: 'As',
            name: 'orderOn',
            checked: true,
            type: 'toggle',
            toggleActiveText: 'DESC',
            toggleInactiveText: 'ASC',
            ly_md: '6',
            ly_lg: '6'
        }


        ];
    }
    startSpinner(b) {
        fireEvent(this.pageRef, 'Spinner', { start: b });
    }
    showToast(variant, title, message) {
        fireEvent(this.pageRef, 'Toast', { variant, title, message });
    }

}