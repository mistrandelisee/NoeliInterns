import { LightningElement } from 'lwc';

export default class Rh_workgroup extends LightningElement {
    groupeId;
    isVisible = true;
    isVisiblecreate = false;
    isVisibleGroupmember = false;
    isVisibleDetailgroup = false;
    handleCreategroup(){
        this.isVisible = false;
        this.isVisiblecreate = true;
    }
    handleGroupmember(){
        this.isVisible = false;
        this.isVisiblecreate = false;
        this.isVisibleGroupmember = true;
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
}