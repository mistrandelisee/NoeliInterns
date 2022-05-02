import { LightningElement } from 'lwc';

export default class Rh_workgroup extends LightningElement {
    groupeId;
    idGroupe;
    objGroupe;
    isVisible = true;
    isVisiblecreate = false;
    isVisibleGroupmember = false;
    isVisibleDetailgroup = false;
    handleCreategroup(){
        this.isVisible = false;
        this.isVisiblecreate = true;
    }
    handleGroupmember(event){
        this.objGroupe = event.detail;
       /*  this.dispatchEvent(new CustomEvent()); */
        this.isVisible = false;
        this.isVisiblecreate = false;
        this.isVisibleGroupmember = true;
    }
    handleBacktogrouplist(){
        this.isVisible = true;
        this.isVisiblecreate = false;
    }
    handleDetailGroup(event){
        this.groupeId = event.detail;
        console.log('groupeiD parent ' +this.groupeId);
        this.isVisible = false;
        this.isVisiblecreate = false;
        this.isVisibleGroupmember = false;
        this.isVisibleDetailgroup = true;
    }
    connectedCallback(){
        console.log('in the parent component');
    }
    handlepreviousPage(){
        this.isVisible = false;
        this.isVisiblecreate = true;
        this.isVisibleGroupmember = false;
        this.isVisibleDetailgroup = false;

    }
   handleHomeGroupe(){
        this.isVisible = true;
        this.isVisiblecreate = false;
        this.isVisibleGroupmember = false;
        this.isVisibleDetailgroup = false;
    } 
    handleEditMember(){
        this.isVisible = false;
        this.isVisiblecreate = false;
        this.isVisibleGroupmember = true; 
        this.isVisibleDetailgroup = false;
    }
}