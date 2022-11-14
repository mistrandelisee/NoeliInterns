import { LightningElement, track, wire } from 'lwc';
import { registerListener,unregisterListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
import { CurrentPageReference,NavigationMixin } from 'lightning/navigation';
import checkRole from '@salesforce/apex/RH_Utility.checkRole';
import { labels } from 'c/rh_label';
import getContactLeader from '@salesforce/apex/RH_groupController.getContactLeader';
import initConfig from '@salesforce/apex/RH_groupController.InitFilter';
import getFilteredGrp from '@salesforce/apex/RH_groupController.getFilteredGrp';


export default class Rh_workgroup extends NavigationMixin(LightningElement) {
    l={...labels}
     /*   Name: 'Group Name',
        srchNamePlc: 'Search by name',
        From:'From',
        To:'To',
        OrderBy:'sort By',
        selectPlc:'Select an option',
        Tlead : 'Team Lead',
        }*/

    @wire(CurrentPageReference) pageRef;
    groupeId;
    idGroupe;
    objGroupe;
    backSource;
    UserRole;
    createBouton;
    contactMembers=[];
    statusGroup;
    isVisible = false;
    isVisiblecreate = false;
    isVisibleGroupmember = false;
    isVisibleDetailgroup = false;
    createUser = false;
    groupe;
    StatusListe=[];
    roles=[];
    currUser={};
    listeGroup = [];
    iSAdmin = false;
    filter={
        searchText:null,
        status:null,
        orderBy:null,
        orderOn:null,
    }
    statutMember='';

    get isAdmin() { return this.currUser?.isCEO || this.currUser?.isRHUser}

    keysFields={groupeName:'ok'};
    keysLabels={
      Name:'Name', leader:'Group Leader',
      RH_Description__c:'Description',
    };
    fieldsToShow={
      Name:'ok', leader:'',
      RH_Description__c:'ok',
    };

    handleCreategroup(){
        this.template.querySelector('c-rh_spinner').start();
        this.isVisible = false;
        this.isVisiblecreate = true;
        //this.template.querySelector('c-rh_spinner').stop();
        window.setTimeout(() => {this.template.querySelector('c-rh_spinner').stop(); /*this.isLoading = false;*/}, 2000);
    }
    handleGroupmember(event){
        this.objGroupe = event.detail;
        this.groupeId = event.detail.Id;
        this.backSource='group_create';
       /*  this.dispatchEvent(new CustomEvent()); */
        this.isVisible = false;
        this.isVisiblecreate = false;
        this.isVisibleGroupmember = true;
    }
    handleBacktogrouplist(){
        // this.isVisible = true;
        // this.isVisiblecreate = false;
        this.goToPage('rhgroup',{});
    }
    handleDetailGroup(event){
        let thisgroupeId = event.detail;
        console.log('groupeiD parent ' +thisgroupeId);
        this.goToPage('rhgroup',{'recordId': thisgroupeId});
        /*this.isVisible = false;
        this.isVisiblecreate = false;
        this.isVisibleGroupmember = false;
        this.isVisibleDetailgroup = true;*/
    }
    roleManage(){
        checkRole({ })
          .then(result => {
            console.log('Result role --->', result);
            if(result.isCEO||result.isRHUser) {
                this.createBouton = true;
                this.iSAdmin = true;
            }
          })
          .catch(error => {
            console.error('Error:', error);
        });
    }
    connectedCallback(){
        console.log('in the parent component');

        registerListener('backbuttom', this.dobackbuttom, this);
        this.groupeId = this.getUrlParamValue(window.location.href, 'recordId');
        if (this.groupeId) {
            this.isVisible = false;
            this.isVisiblecreate = false;
            this.isVisibleGroupmember = false;
            this.isVisibleDetailgroup = true;
        }else{
            this.roleManage();
            this.initFilter();
        }
    }
    getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
    }
    goToPage(pagenname,state={}) {
        //var pagenname ='rhgroup'; //request page nam
        //let states={'recordId': recordid}; //event.currentTarget.dataset.id , is the recordId of the request
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state
        });
    }
    handlepreviousPage(){
        if(this.backSource==='group_create'){
            this.isVisible = false;
            this.isVisiblecreate = true;
            this.isVisibleGroupmember = false;
            this.isVisibleDetailgroup = false;
        }else{
            this.isVisible = false;
            this.isVisiblecreate = false;
            this.isVisibleGroupmember = false;
            this.isVisibleDetailgroup = true
        }
        
    }
   handleHomeGroupe(){
        /*this.isVisible = true;
        this.isVisiblecreate = false;
        this.isVisibleGroupmember = false;
        this.isVisibleDetailgroup = false;*/
        this.goToPage('rhgroup',{});
    } 

    handleEditMember(event){  
        this.template.querySelector('c-rh_spinner').start();
        //this.statutMember = this.handleNoAvailablemember(event);
        this.backSource='group_detail';
        this.isVisible = false;
        this.isVisiblecreate = false;
        this.isVisibleGroupmember = true; 
        this.isVisibleDetailgroup = false;
        /*if(this.statutMember =='noMember'){
            this.isVisibleGroupmember = false;
            this.createUser = true;
        } */
        this.template.querySelector('c-rh_spinner').stop(); 
    }

    dobackbuttom(event){
        unregisterListener('backbuttom', this.dobackbuttom, this);
        console.log('fdgfdgfdgfdfgdgfdgfdg');
        //this.handleHomeGroupe();
        this.goToPage('rhgroup',{});
        // event.preventDefault();
    }
    handleContactgroup(event){
        this.groupe = event.detail;
        this.contactMembers = this.groupe.RH_GroupMembers__r;
        this.statusGroup = this.groupe.RH_Status__c;
        console.log('statusGroup in workgroup ==>', this.statusGroup);
    }
    handleEditGroupe(){
        console.log('handleEditGroupe: ===->', 'dans le workgroup');
        this.isVisibleDetailgroup = false;
        this.handleCreategroup();
    }
    handlegotodetailgroup(event){
        this.groupeId = event.detail;
        this.goToPage('rhgroup',{'recordId': this.groupeId});
        /*this.isVisible = false;
        this.isVisiblecreate = false;
        this.isVisibleGroupmember = false;
        this.isVisibleDetailgroup = true;*/
    }
     filterInputs=[];
    
    buildFilter(){
        this.filterInputs=[
            {
                label:this.l.groupName,
                placeholder:this.l.srchNamePlc,
                name:'searchText',
                value: '',
                ly_md:'3', 
                ly_xs:'6', 
                ly_lg:'3'
            }];
            if(this.iSAdmin){
                this.filterInputs.push({ 
                label:this.l.Status,
                name:'status',
            
                picklist: true,
                options: this.StatusListe,
                value: '',
                ly_md:'3',
                ly_xs:'6',  
                ly_lg:'3'
            });
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
                this.StatusListe = result.Picklists?.RH_Status__c;
                this.StatusListe.unshift({
                    label:this.l.selectPlc,value:''
                });
                this.buildFilter();
                this.isVisible = true;
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
        this.template.querySelector('c-rh_spinner').start();
        const record=event.detail;
        console.log(`handleSubmitFilter record `, JSON.stringify(record) );
        this.filter={... this.filter ,...record ,
            orderOn: record.orderOn ? 'DESC' : 'ASC'};
        console.log(`handleSubmitFilter this.filter TO CALL `, JSON.stringify(this.filter) );
        
        this.getSearchGroup(JSON.stringify(this.filter));
        //this.template.querySelector('c-rh_spinner').stop();
    }

    getSearchGroup(filtre){
        getFilteredGrp({filterTxt:filtre})
          .then(result => {
            const self = this;
            console.log('Result serach -=-=->', result);
            if(!result.error){

                this.listeGroup = result.liste.map(function (e ){
                    let item={...e};
                    item.title=e.Name;
                    item.id=e.Id;
                    item.icon="standard:team_member";
                    item.class=e.RH_Status__c;
                    item.leader=e.RH_Team_Leader__r.Name;
                    item.RH_Description__c= self.stringLenght(item.RH_Description__c, 20);
                                         
                    item.keysFields=self.keysFields;
                    item.keysLabels=self.keysLabels;
                    item.fieldsToShow=self.fieldsToShow;
                    
                    const badge={
                      name: 'badge',
                      label: e.RH_Status__c,
                      class: self.classStyle(e.RH_Status__c),
                    }
                    item.addons = {badge: badge}
      
                    let Actions=[];
                    if((e.RH_Status__c==='Desactived')||(e.RH_Status__c==='Draft')){
                          Actions.push( {   variant:"brand-outline",
                          class:" slds-m-left_x-small",
                          label:"Active",
                          name:'Activated',
                          title:"Active",
                          iconName:"utility:add",
                          // class:"active-item"
                        })
                    }
                    if(e.RH_Status__c==='Activated'){
                        Actions.push({   variant:"brand-outline",
                          class:" slds-m-left_x-small",
                          label:"Desactive",
                          name:'Desactived',
                          title:"Active",
                          iconName:"utility:deprecate",
                          // class:"active-item"
                        })
                    }
                
                    item.actions=Actions;
                    return item; 
                     });

            }
            this.template.querySelector('c-rh_spinner').stop();
          })
          .catch(error => {
            console.error('Error:', error);
            console.log('Error ---- :', error);
        });
    }

    stringLenght(str, val){
        if(str?.length>=val){
            console.log('chaine reduite:', str?.substring(0,val));
            return (str?.substring(0,val)+'...');
        }else{
          console.log('chaine initiale:', str?.substring(0,val));
            return str;
        } 
      }

      classStyle(className){

        switch(className){
            case 'Activated':
                return "slds-float_left slds-theme_success";
            case 'Draft':
                return "slds-float_left slds-theme_info";
            case 'Desactived':
                return "slds-float_left slds-theme_shade";
            case 'Closed':
                return "slds-float_left slds-theme_error";
            default:
                return "slds-float_left slds-theme_alt-inverse";
        }
    
    }

    handleNoAvailablemember(){        
        this.isVisibleGroupmember = false;
        this.createUser = true;
    }

    handleCreateUser(){
        this.goToPage('rhusers',{action:'New'});
    }
}