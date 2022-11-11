import { LightningElement,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import { labels } from 'c/rh_label';
import getInvoices from '@salesforce/apex/RH_Invoice_Controller.getInvoices';

import initConfig from '@salesforce/apex/RH_Invoice_Controller.InitFilter';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
const NEW_ACTION='New';
const WARNING_VARIANT='warning';


const ERROR_VARIANT='error';                                                                                            
const SAVE_ACTION='Save';

const ACTIVE_ACTION='active';
const DISABLE_ACTION='banned';
const FREEZE_ACTION='frozen';
const PROMOTE_ACTION='PromoteBaseUser';
const CARD_ACTION='stateAction';

export default class Rh_invoice extends NavigationMixin(LightningElement) {
   
    l={...labels, 
        // Number: 'Number',
        // From: 'From',
        // To: 'To',
        // OrderBy:'sort By',
        // selectPlc:'Select an option'
    }

    @track groups=[];
    @track timeSheets = [];
    @track Invoices = [];
    recordId;
    userId;
    title;
    information;
    currUser={};

    keysFields={TimeSheetNumber:'ok'};
    keysLabels={
        account:this.l.invoice_to, RH_Po__c:this.l.po,
        RH_InvoiceDate__c:this.l.StartDate
         ,RH_DueDate__c:this.l.EndDate,
    };
    fieldsToShow={
        
        account:'',RH_Po__c:'',
        RH_InvoiceDate__c:'ok',RH_DueDate__c:'ok',
         /*TotalDurationInHours:'',
       
        TotalDurationInMinutes:''*/
    };

    filter={
        startDate:null,
        endDate:null,
        orderBy:null,
        orderOn:null,
    };

    Status=[];
    OrderBys=[];

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
    // detailsActions=[
    //     {   variant:"brand-outline",
    //         class:" slds-m-left_x-small",
    //         label:"New",
    //         name:NEW_ACTION,
    //         title:"New",
    //         iconName:"utility:add",
    //         // class:"active-item"
    //     }
    // ]
    @wire(CurrentPageReference) pageRef;
    action='';
    get showNew(){ return this.isAdmin && (this.action=='' || this.action==NEW_ACTION || this.action==SAVE_ACTION); }
    get hideView(){  return this.action=='' || this.action!=NEW_ACTION; }
    // get hasDetailsActions(){ return this.detailsActions?.length >0}
    get filterReady(){ return this.filterInputs?.length >0}
    get isAdmin() { return this.currUser?.isCEO || this.currUser?.isTLeader}
    get isApprover() { return this.isAdmin || this.currUser?.isApprover}
    get hasInvoices(){ return this.Invoices?.length >0; }
    get hasrecordid(){ return this.recordId?true:false; }
    
    connectedCallback(){
        // console.log(`RECORD ID`, this.recordId);
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        if (this.recordId) {
            console.log(`RECORD ID`, this.recordId);
        }else{
            this.userId = this.getUrlParamValue(window.location.href, 'uId');
            this.initFilter();
            this.getInvoices(this.filter);
        }
    }
    
    initFilter(){
        // this.startSpinner(true)
        initConfig()
          .then(result => {
            console.log('Result INIT FILTER ');
            console.log(result);
            if (!result.error && result.Ok) {
                // this.Status = result.Picklists?.Status;
                // this.roles = result.Picklists?.RH_Role__c;
                this.OrderBys = result.OrderBys;
                // this.Status.unshift({
                //     label:this.l.selectPlc,value:''
                // });
                this.buildFilter();
            }else{
                this.showToast(WARNING_VARIANT,'ERROR Initialising', result.msg);
            }
          })
          .catch(error => {
            console.error('Error in calling :', error);
        }).finally(() => {
            // this.startSpinner(false)
        });
    }

    isMine;

    handleSubmitFilter(event){
        const record=event.detail;
        this.filter={... this.filter ,...record ,
                    orderOn: record.orderOn ? 'DESC' : 'ASC'};
        this.getInvoices();
    }


    getInvoices(){
        this.Invoices=[];
        this.startSpinner(true);
        getInvoices({filterTxt:JSON.stringify(this.filter)}).then(result =>{
            console.log('result @@@ ');
            console.log(result);
            const self=this;
            if (!result.error && result.Ok) {
                this.constants=result.Constants;
                this.isMine=result.isMine;
                this.currUser={...result.currentContact,
                                isCEO:result.isCEO,
                                isRHUser:result.isRHUser,
                                isTLeader:result.isTLeader,
                                isBaseUser:result.isBaseUser,
                                isApprover:result.isApprover,
                }
                const isAD=this.isAdmin;
                this.Invoices = result.Invoices.map(function (e ){
                    let item={...e};
                    item.title=e.RH_Name__c || e.Name;
                    item.id=e.Id;
                    item.icon="standard:people";
                    item.class=e.Status;
                    item.account=e.RH_Account_Id__r.Name;
                    item.keysFields=self.keysFields;
                    item.keysLabels=self.keysLabels;
                    item.fieldsToShow=self.fieldsToShow;

                    let Actions=[];
                    

                    item.actions=Actions;
                    console.log(`item`);
                    console.log(item);
                    return item;
                });
                this.setviewsList(this.Invoices)
            }else{
                this.showToast(WARNING_VARIANT,'ERROR in getting results', result.msg);
            }
        }).catch(e => {
            this.showToast(ERROR_VARIANT,'ERROR Catch', e.message);
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
                this.getInvoices();
                break;
            default:
                break;
        }
            
        
    }
    
    setviewsList(items){
        let cardsView=this.template.querySelector('c-rh_cards_view');
        cardsView?.setDatas(items);
    }
    handleCardAction(event){
        console.log('event parent ' +JSON.stringify(event.detail));
        const info=event.detail;
        if (info?.extra?.isTitle) {
            this.goToInvoiceDetail(info?.data?.id);
        }
        if (info?.action==CARD_ACTION) {//user clicks on the dropdown actions
            // const record={Id:info?.data?.id, action:info?.extra?.item};
            // this.handleUserAction(record, FROM_CHILD);
        }
    }
    

    getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
    }

    goToInvoiceDetail(recordid) {
        var pagenname ='rh-invoices'; //request page nam
        let states={'recordId': recordid}; //event.currentTarget.dataset.id , is the recordId of the request
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
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
        
            
            this.filterInputs =[
            // {
            //     label:this.l.Status,
            //     name:'status',
            
            //     picklist: true,
            //     options: this.Status,
            //     value: '',
            //     ly_md:'3',
            //     ly_xs:'12',  
            //     ly_lg:'3'
            // },
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

    createAction(variant,label,name,title,iconName,className){ 
        return {
            variant, label, name, title, iconName,  class:className ,pclass :' slds-float_right'
        };
    }
    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
     }
     showToast(variant, title, message){
         fireEvent(this.pageRef, 'Toast', {variant, title, message});
     }
}