import { LightningElement } from 'lwc';
import getMyProfile from '@salesforce/apex/RH_Profile.getMyProfile';
import getpickListValue from '@salesforce/apex/RH_Utility.getpickListValue';
export default class RhProfile extends LightningElement {
    
    profileinformation = {};
    roleoption=[];
    formPersonanalDetails=[];
    accountFields=[];
    connectedCallback(){
        this.getProfile();
    }
    getProfile() {
        getMyProfile({}).then(result =>{
            if (result.error) {
                console.error(result.msg);
            }else{

                debugger;
                console.log('profile ' +JSON.stringify(result));
                this.profileinformation = result;
                this.handlepickListValue();
            }
        }).catch(err =>{
            console.error('error',err)
        })
    }
    handleAction(event){
        let action=event.detail.action;
        let data=event.detail.data;
    }
    handlepickListValue() {
        getpickListValue({}).then(result =>{
            this.roleoption = result.RH_Role__c;
            console.log('roleoption ' ,JSON.stringify(this.roleoption));
            this.buildform();
            this.buildAccountFields();
        }).catch(err =>{
            console.error('error',err)
        })
    }
    buildform(){
        this.formPersonanalDetails=[
            {
                label:'Last Name',
                placeholder:'Enter your Last Name',
                name:'LastName',
                value:this.profileinformation?.contact.LastName,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'First Name',
                placeholder:'Enter your First Name',
                name:'FirstName',
                value:this.profileinformation?.contact.FirstName,
                required:false,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Email',
                name:'Email',
                required:true,
                value:this.profileinformation?.contact.Email,
                placeholder:'Email',
                maxlength:100,
                type:'email',
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Role',
                name:'Role',
                required:true,
                picklist: true,
                options: this.roleoption,
                value:this.profileinformation?.contact.RH_Role__c,
                maxlength:100,
                ly_md:'12', 
                ly_lg:'12'
            },
         
        
        ];
    }
    buildAccountFields(){
        this.accountFields=[
            {
                label:'Last Name',
                placeholder:'Enter your Last Name',
                name:'LastName',
                value:this.profileinformation?.contact.LastName,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'First Name',
                placeholder:'Enter your First Name',
                name:'FirstName',
                value:this.profileinformation?.contact.FirstName,
                required:false,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Email',
                name:'Email',
                required:true,
                value:this.profileinformation?.contact.Email,
                placeholder:'Email',
                maxlength:100,
                type:'email',
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Role',
                name:'Role',
                required:true,
                picklist: true,
                options: this.roleoption,
                value:this.profileinformation?.contact.RH_Role__c,
                maxlength:100,
                ly_md:'12', 
                ly_lg:'12'
            },
         
        
        ];
    }
}