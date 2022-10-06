import { LightningElement, api, track,wire } from 'lwc';
import getGroupe from '@salesforce/apex/RH_groupController.getGroupe';
import deleteGroupe from '@salesforce/apex/RH_groupController.deleteGroupe';
import updateGroupStatut from '@salesforce/apex/RH_groupController.updateGroupStatut';
import { CurrentPageReference,NavigationMixin } from 'lightning/navigation';
import { labels } from 'c/rh_label';
import checkRole from '@salesforce/apex/RH_Utility.checkRole';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
import { icons } from 'c/rh_icons';

const OK_DELETE='Deleted';

export default class Rh_group_detail  extends NavigationMixin(LightningElement) {
    @wire(CurrentPageReference) pageRef;

    l={...labels,
    }
    icon ={...icons}

    data = [];
    rowOffset = 0;
    listId = [];
    statusEditGroup;
    detailGroup=true;
    l = {...labels};
    @api groupeId;
    @api groupe;
    @track accountFields=[];
    actionAvailable=[];
    actionAvailableActive=[];
    contactMemberss=[];
    newGroup = 'Edit group';
    @api statusGroup;
    isLoading=false;

    constants={};
    //backSource='group_detail';

    @track columns = [
        { label: 'Label', fieldName: 'Name', type: 'button',typeAttributes:{label:{fieldName:'Name'},variant:'base'} },
        { label: 'Email', fieldName: 'Email', type: 'email' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' },
        { label: 'Lieu Residence', fieldName: 'quartier' },
    ];

    roleManage(){
        checkRole({ })
          .then(result => {
            console.log('Result role --->', result);
            if(result.isBaseUser||result.isTLeader) this.avail = [];
          })
          .catch(error => {
            console.error('Error:', error);
        });
    }

    connectedCallback(){

        console.log(JSON.stringify(this.l));
        console.log('backSource detail--->:', this.backSource);
        this.contactMembers = this.contactMembers || []; 
        getGroupe({ id: this.groupeId })
            .then(result => {
              console.log('Result');
              console.log(result);
              this.groupe=result;
              this.AvailableAction(this.groupe.RH_Status__c);
              this.buildAccountFields(result); 
            //  this.buildActionAvailable(result);
            //  this.contactMembers = result.RH_GroupMembers__r;
              this.statusGroup = result.RH_Status__c;
                console.log('contactgroup in groupDetail', this.contactMembers);
                console.log('statusGroup in groupDetail', this.statusGroup);
                this.dispatchEvent(new CustomEvent('contactgroup', {detail: result})); 
                console.log('contactMembers dans group detail', result.RH_GroupMembers__r);
              this.data = result?.RH_GroupMembers__r?.length > 0 ? result?.RH_GroupMembers__r :  []; 
              console.log('data for datable ---> :',this.data);
              this.refreshTable(this.data);
            })
            .catch(error => {
              console.error('Error:', error);
            }); 
            this.roleManage();  

            registerListener('ModalAction', this.doModalAction, this);
    }
    refreshTable(data) {
        const dataTableCmp = this.template.querySelector('c-rh_datatable_component');
        if (dataTableCmp) {
            dataTableCmp?.setDatas(data);
        } else {
            console.log('@@@@@@@@@@@@@Not found');
        }
    }
    handleEditMember(){
        console.log('groupeId:==>', this.groupeId);
        this.dispatchEvent(new CustomEvent('editmember', {detail: this.groupeId}));
        
    }
    buildAccountFields(groupe){
        this.accountFields=[
            {
                label:this.l.Name,
                name:'Name',
                value:groupe.Name
            },
            {
                label:this.l.Leader,
                name:'Leader Name',
                value:groupe.RH_Team_Leader__r.Name,
                type: 'Link',
                class:'Link',
                dataId:groupe?.RH_Team_Leader__r?.RH_User__c
            },
            {
                label:this.l.Description,
                name:'Description',
                value:groupe.RH_Description__c
            },
            {
                label:this.l.Status,
                name:'Status',
                value:groupe.RH_Status__c	
            }

        ];

    }

    handleUserDetails(event){
        let action=event.detail.action;
        console.log('>>>>>>>>>>>>>. action ',action);
        if(action=='goToLink'){
            const info = event.detail.info;
            let record={eltName:info.name,recordId:info.dataId}
            this.handleGoToLink(record);
        }
    }
    handleGoToLink(data){
        console.log(`handleGoToLink data `, JSON.stringify(data));
        //this.startSpinner(false);
        switch (data?.eltName) {
           /* case 'Supervisor':
                this.goToPage('rhusers',{recordId:data?.recordId})
                break; */
            case 'Leader Name':
                this.goToPage('rhusers',{recordId:data?.recordId})
                break;
        
            default:
                break;
        }
    }

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
   
    updateStatus(status){
        for(var field of this.accountFields){
            if(field.name=='Status'){
                field.value = status;
            }
        }
    }
        actionAvailableActive=[
            {
                name:"Deleted",
                variant:"brand-outline",
                label:"Delete",
                iconName:"utility:delete",
                class:"slds-m-left_x-small",
                pclass :' slds-float_right'
            },
            {
                name:"Edited",
                variant:"brand-outline",
                label:"Edit",
                iconName:"utility:edit",
                class:"slds-m-left_x-small",
                pclass :'slds-float_right'
            },
            {
                name:"Activated",
                variant:"brand-outline",
                label:"Active",
                iconName:"utility:add",
                class:"slds-m-left_x-small",
                pclass :' slds-float_right'
            }
            
         ];
         actionAvailable=[
            {
                name:"Deleted",
                variant:"brand-outline",
                label:"Delete",
                iconName:"utility:delete",
                class:"slds-m-left_x-small",
                pclass :' slds-float_right'
            },
            {
                name:"Edited",
                variant:"brand-outline",
                label:"Edit",
                iconName:"utility:edit",
                class:"slds-m-left_x-small",
                pclass :' slds-float_right'
            },
            {
                name:"Desactived",
                variant:"brand-outline",
                label:"Desactive",
                iconName:"utility:deprecate",
                class:"slds-m-left_x-small",
                pclass :' slds-float_right'
            }
            
         ];
    avail = [];
    get hasDetailsActions(){ return this.avail?.length >0}
    AvailableAction(status){
         console.log('groupe result' + this.groupe);
        if(status == 'Activated'){
            this.avail = this.actionAvailable;
        }else{
            this.avail = this.actionAvailableActive;
        }
         
     }

     actionRecord={};
     handleManageAction(event){
        let text='';
        const Actions=[]
        const extra={style:'width:20vw;'};

         console.log('Action Name ==-->:', event.detail.action);
        // this.detailGroup = false;
         if(event.detail.action=='Edited'){
            //this.isLoading = true;
            this.template.querySelector('c-rh_spinner').start();
            this.statusEditGroup = true;
            this.detailGroup = false;
            window.setTimeout(() => {this.template.querySelector('c-rh_spinner').stop(); /*this.isLoading = false;*/}, 2000);
          //  this.template.querySelector('c-rh_spinner').stop();
         }
         if(event.detail.action=='Deleted'){
            
            /*deleteGroupe({ id: this.groupeId })
              .then(result => {
                console.log('Result', result.result);
                this.dispatchEvent(new CustomEvent('homegroupe'));
              })
              .catch(error => {
                console.error('Error:', error);
            });*/

            //record.Status='this.constants.LWC_DISABLE_CONTACT_STATUS';
            //this.actionRecord=record;
            text=this.l.delete_confirm;
            extra.title=this.l.action_confirm;
            extra.style+='--lwc-colorBorder: var(--bannedColor);';
            // Actions.push(this.createAction("brand-outline",this.l.Cancel,'KO',this.l.Cancel,"utility:close",'slds-m-left_x-small'));
            Actions.push(this.createAction("brand-outline",this.l.ok_confirm,OK_DELETE,this.l.ok_confirm,this.icon.check,'slds-m-left_x-small'));
            this.ShowModal(true,text,Actions,extra);
         }
         if(event.detail.action=='Activated' || event.detail.action=='Desactived'){
            updateGroupStatut({ id: this.groupeId, statut: event.detail.action })
              .then(result => {
                console.log('Result', result);
                this.updateStatus(result.statut);
                this.AvailableAction(result.statut);
              })
              .catch(error => {
                console.error('Error:', error);
            });
        }

     }

     handleBack(){
        this.statusEditGroup = false;
        this.detailGroup = true;
     }
     handleupdategroup(){
        this.handleBack();
         window.location.reload();         
     }

     handleRowAction( event ) {
        console.log('dans le handlerow');
        // const actionName = event.detail.action.name;
        const row = event.detail.row.RH_User__c;
        console.log('row--> ' , row);
        this.goToUserDetail(row);
    }
 

    goToUserDetail(recordid) {
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

    goToLink(event){
        const action = event.detail.action;
        if(action == 'goToLink'){
            this.goToUserDetail(event.detail.eltName);
        }
        // this.selectedContact = this.contacts.data.find(contact => contact.Id === contactId);
    }

    ShowModal(show,text,actions,extra={}){
        fireEvent(this.pageRef, 'Modal', {show,text,actions,extra});
     }

     doModalAction(event){
        console.log('doModalAction in user view ', JSON.stringify(event.action));
        //this.isLoading=true;
        this.template.querySelector('c-rh_spinner').start();
        if(event.action=='Deleted'){
            deleteGroupe({ id: this.groupeId }) 
              .then(result => {
                console.log('Result', result.result);
                this.dispatchEvent(new CustomEvent('homegroupe'));
                //this.isLoading=false;
                this.template.querySelector('c-rh_spinner').stop();
              })
              .catch(error => {
                console.error('Error:', error);
            });
        }else{
            this.template.querySelector('c-rh_spinner').stop();
        }
        /*
        switch (event.action) {
            case OK_DISABLE:
                this.doUpdateStatus(this.actionRecord,OK_DISABLE)
                this.actionRecord={};
                break;
            case OK_FREEZE:
                this.doUpdateStatus(this.actionRecord,OK_FREEZE)
                this.actionRecord={};
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
        }*/
        this.ShowModal(false,null,[]);//close modal any way
        event.preventDefault();
    }

    createAction(variant,label,name,title,iconName,className){ 
        return {
            variant, label, name, title, iconName,  class:className ,pclass :' slds-float_right'
        };
    }
}