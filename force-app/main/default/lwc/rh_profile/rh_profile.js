import { api, LightningElement,wire, track } from 'lwc';
import getMyProfile from '@salesforce/apex/RH_Profile_controller.getMyProfile';
import UpdateInfo from '@salesforce/apex/RH_Profile_controller.UpdateInfo';
import changeMyPassword from '@salesforce/apex/RH_Profile_controller.changeMyPassword';
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
    l={...labels,}
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
        if (this.profileinformation?.contact?.Projects__r?.length>0) {
         return this.profileinformation?.contact?.Projects__r.map(record=>record.RH_Project__r)   
        }else return [];
    }
    getProfile() {
        this.startSpinner(true);
        getMyProfile({}).then(result =>{
            console.log('profile ');
            console.log(result);

            if (result.error) {
                console.error(result.msg);
                this.showToast(ERROR_VARIANT, this.l.errorOp, result.msg);
            }else{

                this.profileinformation = result;
                this.recordId=this.profileinformation?.contact?.Id;
                this.buildExtraField(this.profileinformation?.contact?.RH_Extra_Infos__c || '[]');
                this.refreshDetails();
                // let form = this.template.querySelector('c-rh_extra-fields');
                // if(form) form.setInfo(this.userextrafield);
            }
        }).catch(err =>{
            console.error('error',err)
            this.showToast(ERROR_VARIANT, this.l.errorOp, '');
        }).finally(() =>{
            this.startSpinner(false);
        })
    }
    
    buildExtraField(extrafield){
        this.jsonInfo=extrafield;
        let extraFieldCmp=this.template.querySelector('c-rh_extra_fields');
        extraFieldCmp.initializeMap(extrafield);
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
    handleUserInfoActions(evt){
        if(evt.action==SAVE_ACTION){
            const data={...evt.data,recordId:this.profileinformation?.contact?.Id};
            this.callUpdateInfoApex(data);

        }else if(evt.action==LINK_ACTION){
            this.handleGoToLink(evt.data)
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
        let states=statesx;
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }

    callUpdateInfoApex(info){
        this.startSpinner(true);
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
    UpdateExtraInfo(event){
        this.startSpinner(true);
        const cusEvt=event.detail;
        console.log('cusEvt >>',cusEvt,' \naction ',cusEvt?.action,' \ndata ',cusEvt?.data);
        const userinfo = cusEvt?.data;
        UpdateExtraInfo({
            recordId: this.recordId,
            extraInfo: userinfo
        }).then(result =>{
            console.log(`result>> `, result);
            if(!result.error){
                
                this.buildExtraField(result.input);
                this.showToast(SUCCESS_VARIANT,this.l.moreInfo, this.l.successOp);
            }else{
                this.showToast(WARNING_VARIANT,this.l.moreInfo, result.msg);
            }
            
        }).catch(error =>{
            console.error(error);
            this.showToast(ERROR_VARIANT,this.l.moreInfo,this.l.errorOp);
        })
        .finally(() =>{
            this.startSpinner(false);
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
        this.showToast(SUCCESS_VARIANT,  this.l.UserProfileTitle, this.l.successOp);

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
        this.startSpinner(true);
        console.log(`@@@@@ callUpdateInfoApex >>> Input : `,info);
        changeMyPassword({ changepasswordjson: JSON.stringify(info) })
          .then(result => {
            console.log('Result', result);
            if (!result.error && result.Ok) {
                this.showToast(SUCCESS_VARIANT, this.l.ChangePasswordTitle, this.l.successOp);
            }else{
                this.showToast(WARNING_VARIANT,this.l.ChangePasswordTitle, result.msg);
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

    quiteEditMode(cmp){
        cmp?.cancel();
    }
    
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
                value:this.profileinformation?.contact?.RoleLabel
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

            {
                label:this.l.Username,
                name:'Login',
                value:this.profileinformation?.user?.Username
            }, 
            {
                label:this.l.Country,
                name:'Country',
                value:this.profileinformation?.contact?.MailingCountry
            },
            {
                label:this.l.Province,
                name:'Province',
                value:this.profileinformation?.contact?.MailingState
            },
            {
                label:this.l.City,
                name:'City',
                value:this.profileinformation?.contact?.MailingCity
            },
            {
                label:this.l.Street,
                name:'Street',
                value:this.profileinformation?.contact?.MailingStreet
            },
            {
                label:this.l.PostalCode,
                name:'Postal Code',
                value:this.profileinformation?.contact?.MailingPostalCode
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
                placeholder:this.l.EmailPlc,
                name:'Email',
                required:true,
                value:this.profileinformation?.contact?.Email,
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
            // {
            //     label:this.l.City,
            //     placeholder:this.l.CityPlc,
            //     name:'City',
            //     type:'address',
            //     value:this.profileinformation?.contact?.OtherAddress,
            //     ly_md:'6', 
            //     ly_xs:'12', 
            //     ly_lg:'6'
            // }
            {
                addressLabel: this.l.Address,
                streetLabel: this.l.Street,
                cityLabel: this.l.City,
                countryLabel: this.l.Country,
                provinceLabel: this.l.Province,
                postalLabel: this.l.PostalCode,
                street : this.profileinformation?.contact?.MailingStreet,
                city: this.profileinformation?.contact?.MailingCity,
                country: this.profileinformation?.contact?.MailingCountry,
                // provincePlaceholder: this.profileinformation?.contact?.MailingState,
                province: this.profileinformation?.contact?.MailingState,
                code: this.profileinformation?.contact?.MailingPostalCode,
                disabled: false,
                required: true,
                countryProvinceMap: {
                    Cameroon: [
                        { label: 'North', value: 'North' },
                        { label: 'South', value: 'South' },
                        { label: 'Centre', value: 'Centre' },
                        { label: 'Est', value: 'Est' },
                        { label: 'West', value: 'West' },
                        { label: 'South-West', value: 'South-West' },
                        { label: 'South-Est', value: 'South-Est' },
                        { label: 'Extrem-North', value: 'Extrem-North' },
                        { label: 'Adamaoua', value: 'Adamaoua' },
                        { label: 'Littoral', value: 'Littoral' }
                    ],
                    Italia: [
                        { label: 'Milano', value: 'Milano' },
                        { label: 'Roma', value: 'Roma' },
                        { label: 'Vatican', value: 'Vatican' }
                    ]
                },
                countryOptions : [
                    { label: 'Cameroon', value: 'Cameroon' },
                    { label: 'Italia', value: 'Italia' }
                ],    
                name:'Address',
                type:'address',
                ly_md:'12', 
                ly_xs:'12', 
                ly_lg:'12'
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
            }, 
            
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
       fireEvent(this.pageRef, 'Spinner', {start:b});
    }
    showToast(variant, title, message){
        fireEvent(this.pageRef, 'Toast', {variant, title, message});
    }
    generatedTitle(title,records){
        let output =title || '';
        if (records) {
            output= title.replace(KEY_NB,records.length);
        }
        return output;
    }

}