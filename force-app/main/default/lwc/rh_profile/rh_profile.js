import { LightningElement, track } from 'lwc';
import getMyProfile from '@salesforce/apex/RH_Profile.getMyProfile';
import getpickListValue from '@salesforce/apex/RH_Utility.getpickListValue';

//Constants
const EDIT_ACTION='Edit';
const VIEW_ACTION='View';
const SAVE_ACTION='Save';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';

const FROMINFO='USER-INFO';

export default class Rh_profile extends LightningElement {
    
    //user-info
    profileinformation = {};
    formPersonanalDetails=[];
    formPersonanalInputDetails=[];
    @track
    infoAction=VIEW_ACTION;

    //account-details

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
                // this.handlepickListValue();
                this.refreshDetails();
            }
        }).catch(err =>{
            console.error('error',err)
        })
    }
    handleAction(event){
        this.startSpinner(true);
        // let action=event.detail.action;
        if (event.detail?.from ==FROMINFO ) {
            const data=event.detail;
            console.log('data >>',data,' \nFORM ',FROMINFO);
            this.UpdateUserInfo(data);
        }
    }
    UpdateUserInfo(evt){
        const data={...evt.data,recordId:this.profileinformation?.contact.Id};

        if(evt.action==SAVE_ACTION)
            this.callUpdateInfoApex(data);
    }
    callUpdateInfoApex(info){
        console.log(`@@@@@ callUpdateInfoApex >>> Input : `,info);

        setTimeout(() => {
            this.callUpdateInfoApexFinish();
            this.callUpdateInfoApexFinishOK();
        },3000)
    }
    callUpdateInfoApexFinish(){
        this.startSpinner(false);
        this.infoAction=VIEW_ACTION;
    }
    callUpdateInfoApexFinishOK(){
        this.showToast(SUCCESS_VARIANT, 'User Informations', 'Informations Successfully Updated');
    }
    /*
    handlepickListValue() {
        getpickListValue({}).then(result =>{
            this.roleoption = result.RH_Role__c;
            console.log('roleoption ' ,JSON.stringify(this.roleoption));
            
        }).catch(err =>{
            console.error('error',err)
        })
    }*/
    refreshDetails(){
        this.buildform();
        this.buildSumary();
        this.buildAccountFields();
    }
    buildSumary(){
        this.formPersonanalDetails=[
            {
                label:'Last Name',
                name:'LastName',
                value:this.profileinformation?.contact.LastName
            },
            {
                label:'First Name',
                name:'FirstName',
                value:this.profileinformation?.contact.FirstName
            },
            {
                label:'Email',
                name:'Email',
                required:true,
                value:this.profileinformation?.contact.Email
            },
            {
                label:'Role',
                name:'Role',
                value:this.profileinformation?.contact.RH_Role__c,
            },
         
        
        ];
    }
    buildform(){
        this.formPersonanalInputDetails=[
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
                value:this.profileinformation?.contact.RH_Role__c,
                readOnly:true,
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
         
        
        ];
    }
    startSpinner(b){
        let spinner=this.template.querySelector('c-rh_spinner');
        if (b) {    spinner?.start(); }
            else{   spinner?.stop();}
    }
    showToast(variant, title, message){
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);
    }
}