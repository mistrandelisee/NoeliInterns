import { LightningElement,wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import newUser from '@salesforce/apex/RH_Profile.newUser';
import changeMyPassword from '@salesforce/apex/RH_Profile.changeMyPassword';
import getpickListValue from '@salesforce/apex/RH_Utility.getpickListValue';
import getMyProfile from '@salesforce/apex/RH_Profile.getMyProfile';

export default class Rh_profile_actions extends LightningElement {

    formUser = [];

    roleoption;
    AccountId;

    @wire(getpickListValue)
    handleResult({error, data}) {
        if(data) {
            this.roleoption = data.RH_Role__c;
            console.log('roleoption ' ,JSON.stringify(this.roleoption));
            this.buildform();
        } else {
            this.error = error;
        }
    } 

@track isNewUser = false;
@track isChangePassword = false;
passwordinformation;
userinformation;
profileinformation = {};
 
@track loading = false;


buildform(){
this.formUser=[
    {
        label:'Last Name',
        placeholder:'Enter your Last Name',
        name:'LastName',
        value: '',
        required:true,
        ly_md:'12', 
        ly_lg:'12'
    },
    {
        label:'First Name',
        placeholder:'Enter your First Name',
        name:'FirstName',
        value: '',
        required:false,
        ly_md:'12', 
        ly_lg:'12'
    },
    {
        label:'Email',
        name:'Email',
        required:true,
        value: '',
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
        value: '',
        maxlength:100,
        ly_md:'12', 
        ly_lg:'12'
    },
 

];
}

formPassword=[
    {
        label:'Current Password',
        placeholder:'Enter your Last Name',
        name:'oldpassword',
        value: '',
        type: 'password',
        required:true,
        ly_md:'12', 
        ly_lg:'12'
    },
    {
        label:'New PassWord',
        placeholder:'Enter your First Name',
        name:'newPassword',
        value: '',
        type: 'password',
        required:false,
        ly_md:'12', 
        ly_lg:'12'
    },
    {
        label:'Repeat Password',
        name:'verifyNewPassword',
        required:true,
        value: '',
        maxlength:100,
        type:'password',
        ly_md:'12', 
        ly_lg:'12'
    },
 

]

getProfile() {
    getMyProfile({}).then(result =>{
        debugger;
        console.log('profile ' +JSON.stringify(result));
        this.profileinformation = result;
    })
}
connectedCallback(){
    this.getProfile();
}


handleLoading() {
    this.loading = !this.loading;
}

    insertNewUser(){
        this.handleLoading();
        newUser({
            contactjson: this.userinformation
        }).then(() =>{
            this.isNewUser = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Insert Successfull',
                    variant: 'success',
                })
            );
        }).catch(e => {
            this.isNewUser = false;
            console.error(e);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: e.body,
                    variant: 'error',
                })
            );
            this.handleLoading();
        })
    }

    chgepassword(){
        this.handleLoading();
        changeMyPassword({
            changepasswordjson: this.passwordinformation
        }).then(result =>{
            this.isChangePassword = false;
            if(result?.error){
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'error',
                        message: result.msg,
                        variant: 'error',
                    })
                );
            }else{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'success',
                        message: 'Success',
                        variant: 'success',
                    })
                );
            }
            
        }).catch(e => {
            this.isChangePassword = false;
            console.error(e);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: e.body,
                    variant: 'error',
                })
            );
            this.handleLoading();
        })
    }

    handleNewUser(){
        this.isNewUser = true;
    }
    handleresset(){
        this.isChangePassword = true;
    }

    requestSend(event){
        switch(event.detail.operation){
            case 'negative':
                this.isNewUser = false;
                break;
            case 'positive':
                event.detail.fields.AccountId = this.profileinformation?.contact.AccountId;
                this.userinformation = JSON.stringify(event.detail.fields);
                console.log('String to send apex ' ,this.userinformation);
                this.insertNewUser();
                break;
            default: break;

        }
    }

    changepassword(event){
        switch(event.detail.operation){
            case 'negative':
                this.isChangePassword = false;
                break;
            case 'positive':
                this.passwordinformation = JSON.stringify(event.detail.fields);
                console.log('String to send apex ' ,this.passwordinformation);
                this.chgepassword();
                break;
            default: break;
        }
    }
}