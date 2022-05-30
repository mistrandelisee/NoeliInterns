import { api, LightningElement,wire, track } from 'lwc';
import getMyProfile from '@salesforce/apex/RH_Profile_controller.getMyProfile';
import UpdateInfo from '@salesforce/apex/RH_Profile_controller.UpdateInfo';
import changeMyPassword from '@salesforce/apex/RH_Profile_controller.changeMyPassword';
import getpickListValue from '@salesforce/apex/RH_Utility.getpickListValue';
import UpdateExtraInfo from '@salesforce/apex/RH_Profile_controller.UpdateExtraInfo';
import { CurrentPageReference ,NavigationMixin} from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';

import { labels } from 'c/rh_label';
import { icons } from 'c/rh_icons';
//Constants
const EDIT_ACTION='Edit';
const VIEW_ACTION='View';
const SAVE_ACTION='Save';
const LINK_ACTION='GOTO';


const RESET_ACTION='Reset';

const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';

const FROMINFO='USER-INFO';

const FROMRESETPWD='ResetPWD';
const KEY_NB='#NB';
export default class Rh_profile extends NavigationMixin(LightningElement) {
    //extra='[{name:\'\', value:\'\'}]'
    l={...labels,
    Group:'Group',Supervisor:'Supervisor',
    myprojects:'My Projects (#NB)',
    mytimesheets:'My Timesheets (#NB)',
    myleadedGroups:'My Leaded Groups (#NB)',
    myleadedProjects:'My Leaded Projects (#NB)',
};
icon ={...icons}


    //user-info
    profileinformation = {};
    formPersonanalDetails=[];
    formPersonanalInputDetails=[];
    @track userextrafield = [];
    @track
    infoAction=VIEW_ACTION;
    @api
    recordId;
    //account-details
    jsonInfo;
    accountFields=[];
    @wire(CurrentPageReference) pageRef;
    connectedCallback(){
        this.getProfile();
    }
    get hasTimeSheets(){
        return this.timeSheets.length > 0;
    }
    get hasLeadedGroups(){
        return this.leadedGroups.length > 0;
    }
    get timeSheets(){
        return this.profileinformation?.contact?.RH_TimeSheets__r || [];
    }
    get leadedGroups(){
        return this.profileinformation?.myLeadedGroups || [];
    }
    get leadedProjects(){
        return this.profileinformation?.contact?.Projects_Leaded__r || [];
    }
    get myprojectTitle(){ return this.generatedTitle(this.l.myprojects,this.userProjects)}
    get myTimeSheetsTitle(){ return this.generatedTitle(this.l.mytimesheets,this.timeSheets)}
    get myLeadedGroupTitle(){ return this.generatedTitle(this.l.myleadedGroups,this.leadedGroups)}
    get myLeadedProjectTitle(){ return this.generatedTitle(this.l.myleadedProjects,this.leadedProjects)}
    get userProjects(){ 
        if (this.profileinformation?.Projects__r?.length>0) {
         return this.profileinformation?.Projects__r.map(record=>record.RH_Project__r)   
        }else return [];
    }
    getProfile() {
        this.startSpinner(true);
        getMyProfile({}).then(result =>{
            if (result.error) {
                console.log('profile ' +JSON.stringify(result));
                console.error(result.msg);
            }else{

                debugger;
                console.log('profile ');
                console.log(result);
                this.profileinformation = result;
                this.recordId=this.profileinformation?.contact?.Id;
                this.buildExtraField(this.profileinformation?.contact?.RH_Extra_Infos__c || '[]');
                // this.handlepickListValue();
                this.refreshDetails();
                let form = this.template.querySelector('c-rh_extra-fields');
                if(form) form.setInfo(this.userextrafield);
            }
        }).catch(err =>{
            console.error('error',err)
        }).finally(() =>{
            this.startSpinner(false);
        })
    }
    handleAction(event){
        this.startSpinner(true);
        const data=event.detail;
        console.log('data >>',data,' \nFORM ',data?.from);
        switch (data?.from) {
            case FROMINFO:
                this.handleUserInfoActions(data);
                break;
            case FROMRESETPWD:
                this.ChangePassword(data);
                break;
            default:
                this.startSpinner(false);
                break;
        }
        
    }
    handleGoToLink(data){
        console.log(`handleGoToLink data `, JSON.stringify(data));
        this.startSpinner(false);
        switch (data?.eltName) {
            case 'Supervisor':
                this.goToPage('rhusers',{recordId:data?.recordId})
                break;
            case 'Group':
                this.goToPage('rhgroup',{recordId:data?.recordId})
                break;
        
            default:
                break;
        }
        // if (data?.action=='goToLink') {
        //     if (data?.eltName=='Owner') {
        //         this.goToPage('rhusers',{recordId:data?.info?.dataId})
        //     }
        // }
    }
    goToTimsheet(event){
        if(event.detail.action=='Item'){
            const data=event.detail.data;
            console.log(data);
            this.goToPage('rhtimesheet',{'recordId': data.key})
        }
    }
    goToGroup(event){
        if(event.detail.action=='Item'){
            const data=event.detail.data;
            console.log(data);
            this.goToPage('rhgroup',{'recordId': data.key})
        }
    }
    goToProject(event){
        if(event.detail.action=='Item'){
            const data=event.detail.data;
            console.log(data);
            this.goToPage('rhproject',{'recordId': data.key})
        }
    }
    goToPage(pagenname,statesx={}) {
        let states=statesx; //event.currentTarget.dataset.id , is the recordId of the request
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }
    handleUserInfoActions(evt){
        

        if(evt.action==SAVE_ACTION){
            const data={...evt.data,recordId:this.profileinformation?.contact?.Id};
            this.callUpdateInfoApex(data);

        }else if(evt.action==LINK_ACTION){
            this.handleGoToLink(evt.data)
        }
    }

    callUpdateInfoApex(info){
        
        console.log(`@@@@@ callUpdateInfoApex >>> Input : `,info);

        UpdateInfo({ recordId: this.recordId,contactjson: JSON.stringify(info)})
        .then(result => {
            console.log('callUpdateInfoApex Result ', result);
            if (!result.error) {
                this.callUpdateInfoApexFinishOK(result);
            }else{
                this.callUpdateInfoApexFinishKO(result.msg)
            }
            
        })
        .catch(error => {
            console.error('callUpdateInfoApex Error : ', error);
            this.showToast(ERROR_VARIANT, this.l.UserProfileTitle, '');
        })
        .finally(() => {
            this.callUpdateInfoApexFinish();
        });

        
    }
    get getuserextrafield(){
        return this.userextrafield?.length>=0;
    }
    buildExtraField(extrafield){
            this.jsonInfo=extrafield;
            let extraFieldCmp=this.template.querySelector('c-rh_extra_fields');
            extraFieldCmp.initializeMap(extrafield);
    }
    buildExtraFieldOLD(extrafield){
        let tab = JSON.parse(extrafield);
        this.userextrafield= tab.map(
            function(elt, i)  {
                return {...elt, hide : false, index:i};
            } 
        );   
}
    //add 
    UpdateExtraInfo(event){

         const cusEvt=event.detail;
        console.log('cusEvt >>',cusEvt,' \naction ',cusEvt?.action);
        console.log('cusEvt >>',cusEvt,' \ndata ',cusEvt?.data);
        const userinfo = cusEvt?.data;
        UpdateExtraInfo({
            recordId: this.recordId,
            extraInfo: userinfo
        }).then(result =>{
            console.log(`result>> `, result);
            if(!result.error){
                
                this.buildExtraField(result.input);
                this.showToast(SUCCESS_VARIANT,' Extra informations', 'Saved');
            }else{
                this.showToast(WARNING_VARIANT,' Extra informations', result.msg);
            }
            
        }).catch(error =>{
            this.showToast(ERROR_VARIANT,' Extra informations', 'KO');
        })
    }
    UpdateExtraInfoOLD(event){

        console.log('handle eventField TO event', JSON.stringify(event.detail));
        console.log('handle eventField TO event', this.recordId);

        var userinfo = event.detail;
        UpdateExtraInfo({
            recordId: this.recordId,
            extraInfo: JSON.stringify(userinfo)
        }).then(result =>{
            if(!result.error){
                
                this.buildExtraField(result.input);
                let form = this.template.querySelector('c-rh_extra-fields');
                if(form) form.setInfo(this.userextrafield);
            }
            
            console.log('user extra fields ' +JSON.stringify( this.userextrafield))
        }).catch(error =>{
            console.error('error extraFields ' +error);
        })
    }

    callUpdateInfoApexFinish(){
        this.startSpinner(false);
        this.infoAction=VIEW_ACTION;
        this.quiteEditMode(this.template.querySelector('c-rh_profile_user_info'))
    }
    callUpdateInfoApexFinishOK(result){
        this.profileinformation = result;
        this.refreshDetails();
        this.showToast(SUCCESS_VARIANT,  this.l.UserProfileTitle, 'Informations Successfully Updated');

    }
    callUpdateInfoApexFinishKO(e){
        this.showToast(WARNING_VARIANT, this.l.UserProfileTitle, e);
    }

    ChangePassword(evt){
        const data={...evt.data};

        if(evt.action==RESET_ACTION)
            this.ChangePasswordApex(data);
    }
    ChangePasswordApex(info){
        console.log(`@@@@@ callUpdateInfoApex >>> Input : `,info);
        changeMyPassword({ changepasswordjson: JSON.stringify(info) })
          .then(result => {
            console.log('Result', result);
            if (!result.error && result.Ok) {
                this.ChangePasswordFinishOK();
            }else{
                this.ChangePasswordFinishKO(result.msg);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            this.showToast(ERROR_VARIANT, this.l.ChangePasswordTitle, '');
        })
        .finally(() => {
            this.ChangePasswordFinish();
        });
    }
    ChangePasswordFinish(){
        this.startSpinner(false);
        this.quiteEditMode(this.template.querySelector('c-rh_profile_reset_password'))
    }
    ChangePasswordFinishOK(){
        this.showToast(SUCCESS_VARIANT, this.l.ChangePasswordTitle, 'Password Successfully Changed');
    }
    ChangePasswordFinishKO(e){
        this.showToast(WARNING_VARIANT,this.l.ChangePasswordTitle, e);
    }

    quiteEditMode(cmp){
        cmp?.cancel();
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
                label:this.l.LastName,
                name:'LastName',
                value:this.profileinformation?.contact?.LastName,
            },
            {
                label:this.l.FirstName,
                name:'FirstName',
                value:this.profileinformation?.contact?.FirstName,
            },
            {
                label:this.l.Email,
                name:'Email',
                value:this.profileinformation?.contact?.Email,
            },
            {
                label:this.l.Role,
                name:'Role',
                value:this.profileinformation?.contact?.RH_Role__c
            },
            //Group Supervisor
            {
                label:this.l.Group,
                name:'Group',
                value:this.profileinformation?.myGroup?.Name,
                type:'Link',
                class:'Link',
                dataId:this.profileinformation?.myGroup?.Id
            },
            {
                label:this.l.Supervisor,
                name:'Supervisor',
                value:this.profileinformation?.myTeamLeader?.Name,
                type:'Link',
                class:'Link',
                dataId:this.profileinformation?.myTeamLeader?.RH_User__c || this.profileinformation?.myTeamLeader?.Id//choose first user id not the contact id
            },
            
            {
                label:this.l.Phone,
                name:'Phone',
                value:this.profileinformation?.contact?.Phone
            },

            /*{
                label:this.l.Username,
                name:'Login',
                value:this.profileinformation?.user?.Username
            },*/
            {
                label:this.l.City,
                name:'City',
                value:this.profileinformation?.contact?.OtherAddress
            },
            {
                label:this.l.Birthday,
                name:'Birthday',
                value:this.profileinformation?.contact?.Birthdate
            },
            {
                label:this.l.AboutMe,
                name:'Description',
                value:this.profileinformation?.contact?.Description
            }
         
        
        ];
    }
    buildform(){
        this.formPersonanalInputDetails=[
            {
                label:this.l.LastName,
                placeholder:this.l.LastNamePlc,
                name:'LastName',
                value:this.profileinformation?.contact?.LastName,
                required:true,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
            {
                label:this.l.FirstName,
                placeholder:this.l.FirstNamePlc,
                name:'FirstName',
                value:this.profileinformation?.contact?.FirstName,
                required:false,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
            {
                label:this.l.Email,
                name:'Email',
                required:true,
                value:this.profileinformation?.contact?.Email,
                placeholder:this.l.EmailPlc,
                maxlength:255,
                type:'email',
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
            {
                label:this.l.Birthday,
                placeholder:this.l.BirthdayPlc,
                name:'Birthday',
                type:'date',
                required:true,
                value:this.profileinformation?.contact?.Birthdate,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
            /*{
                label:this.l.Role,
                name:'Role',
                required:true,
                value:this.profileinformation?.contact?.RH_Role__c,
                readOnly:true,
                ly_md:'12', 
                ly_xs:'12', 
                ly_lg:'12'
            },*/
            
            {
                label:this.l.Phone,
                placeholder:this.l.PhonePlc,
                name:'Phone',
                type:'phone',
                required:true,
                value:this.profileinformation?.contact?.Phone,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },

            /*{
                label:this.l.Username,
                placeholder:this.l.UsernamePlc,
                name:'Login',
                type:'email',
                required:true,
                value:this.profileinformation?.user?.Username,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },*/
            {
                label:this.l.City,
                placeholder:this.l.CityPlc,
                name:'City',
                type:'address',
                value:this.profileinformation?.contact?.OtherAddress,
                ly_md:'6', 
                ly_xs:'12', 
                ly_lg:'6'
            },
            {
                label:this.l.AboutMe,
                name:'Description',
                value:this.profileinformation?.contact?.Description,
                placeholder:this.l.AboutMePlc,
                className:'textarea',
                maxlength:25000,
                type:'textarea',
                ly_md:'12', 
                ly_xs:'12', 
                ly_lg:'12'
            }
        
        ];
    }
    buildAccountFields(){
        this.accountFields=[
            {
                label:this.l.CompanyName,
                name:'Name',
                value:this.profileinformation?.account?.Name
            },
            {
                label:this.l.NumberOfEmployees,
                name:'NumberOfEmployees',
                value:this.profileinformation?.account?.NumberOfEmployees
            }
            ,
            {
                label:this.l.Website,
                name:'Website',
                value:this.profileinformation?.account?.Website,
                type:'Link',
                class:'Link',
                url:this.profileinformation?.account?.Website
            },
            {
                label:this.l.Phone,
                name:'Phone',
                value:this.profileinformation?.account?.Phone
            },
            {
                label:this.l.YearStarted,
                name:'YearStarted',
                value:this.profileinformation?.account?.YearStarted
            },
            {
                label:this.l.Industry,
                name:'Industry',
                value:this.profileinformation?.account?.Industry
            },
            {
                label:this.l.Description,
                name:'Description',
                value:this.profileinformation?.account?.Description
            }
        
        ];
    }
    startSpinner(b){
        /*let spinner=this.template.querySelector('c-rh_spinner');
        if (b) {    spinner?.start(); }
            else{   spinner?.stop();}*/
       fireEvent(this.pageRef, 'Spinner', {start:b});
    }
    showToast(variant, title, message){
        /*
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);*/
        fireEvent(this.pageRef, 'Toast', {variant, title, message});
    }
    generatedTitle(title,records){
        let output =title || '';
        if (records) {
            output= title.replace(KEY_NB,records.length);
        }
        return output;
    }


/*LastName
FirstName
Email
Role
AccountId
Login
City
Birthday
Phone*/
}