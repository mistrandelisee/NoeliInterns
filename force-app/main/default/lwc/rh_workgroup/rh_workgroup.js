import { LightningElement, wire } from 'lwc';
import { registerListener,unregisterListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
import { CurrentPageReference,NavigationMixin } from 'lightning/navigation';
export default class Rh_workgroup extends NavigationMixin(LightningElement) {
    @wire(CurrentPageReference) pageRef;
    groupeId;
    idGroupe;
    objGroupe;
    backSource;
    contactMembers=[];
    statusGroup;
    isVisible = true;
    isVisiblecreate = false;
    isVisibleGroupmember = false;
    isVisibleDetailgroup = false;
    groupe;

    handleCreategroup(){
        this.isVisible = false;
        this.isVisiblecreate = true;
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
        this.groupeId = event.detail;
        console.log('groupeiD parent ' +this.groupeId);
        this.goToPage('rhgroup',{'recordId': this.groupeId});
        /*this.isVisible = false;
        this.isVisiblecreate = false;
        this.isVisibleGroupmember = false;
        this.isVisibleDetailgroup = true;*/
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
            this.isVisible = true;
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
        this.isVisible = true;
        this.isVisiblecreate = false;
        this.isVisibleGroupmember = false;
        this.isVisibleDetailgroup = false;
    } 
    handleEditMember(){  
        this.backSource='group_detail';
        this.isVisible = false;
        this.isVisiblecreate = false;
        this.isVisibleGroupmember = true; 
        this.isVisibleDetailgroup = false;
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
    handlegotodetailgroup(){
        this.isVisible = false;
        this.isVisiblecreate = false;
        this.isVisibleGroupmember = false;
        this.isVisibleDetailgroup = true;
    }
}