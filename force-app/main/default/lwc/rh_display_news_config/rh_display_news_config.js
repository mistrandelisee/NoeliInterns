import { LightningElement,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getOrgConfig from '@salesforce/apex/RH_News_controller.getOrgConfig';
import setOrgConfig from '@salesforce/apex/RH_News_controller.setOrgConfig';
import getAllNews from '@salesforce/apex/RH_News_controller.getAllNews';
import getNewsDetails from '@salesforce/apex/RH_News_controller.getNewsDetails';
import updateNewsVisibility from '@salesforce/apex/RH_News_controller.updateNewsVisibility';
import updateNews from '@salesforce/apex/RH_News_controller.updateNews';
import updateFile from '@salesforce/apex/RH_News_controller.updateFile';
import filterNews from '@salesforce/apex/RH_News_controller.filterNews';
import deleteNews from '@salesforce/apex/RH_News_controller.deleteNews';
import getFileInfos from '@salesforce/apex/RH_FileUploader.getFileInfos';
import checkRole from '@salesforce/apex/RH_Utility.checkRole';
import getUserLanguage from '@salesforce/apex/RH_Users_controller.getUserLanguage';

import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';

import { icons } from 'c/rh_icons';
import { labels } from 'c/rh_label';

const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';


const SAVE_ACTION='Save';
const NEW_ACTION='New';

const ENABLED_ACTION='Enabled';
const DISABLED_ACTION='Disabled';
const DELETE_ACTION='Delete';

const CANCEL_ACTION='Cancel';




export default class Rh_display_news_config extends NavigationMixin(LightningElement) {

    icon={...icons};
    label={...labels};
    config={};
    draftConfig={};
    r=0;
    allNews=[];
    hasadmin=true;
    editNews=false;
    previewFile=false;
    newFileData={};

    newsRecord={};
    detailsActions=[];
    detailsEditActions=[];
    @track newsInputDetails=[];
    @track newsEditDetails=[];
    @track newsFileDetails=[];
    @track newsTranslate= [];
    recordId;

    bannerTitle;
    displayFields=false;
    inputFilter=[];
    isModalOpen = false;

    enableIt ; 
    enableFr ;
    enableEn;

    dataId;
    isBaseUser=true;
    isTranslate=false;

    keysFields={Name:'ok'};
    keysLabels={
        summaryTitle: this.label.Title, summaryDescription: this.label.Description,
    };
    fieldsToShow={
        summaryTitle:'ok', summaryDescription:'',
    };
    // add
    inputBannerConfig=[];
    
    bannerConfigAction= [];


    @wire(CurrentPageReference) pageRef;

    get hasNews(){
        return this.newsRecord && (!this.editNews?true:false ) && (!this.isTranslate?true:false);
    }
    get hasrecordid(){
        return this.recordId?true:false;
    }
    get isfilterBuild(){
        return  this.inputFilter?.length>0;
    }

    get enableList(){
        return  this.allNews?.length>0;
    }

     connectedCallback(){
        registerListener('ModalAction', this.doModalAction, this);
        registerListener('backbuttom', this.staticBack, this);
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        this.checkUserRole();
        if (this.recordId) {
            //this.startSpinner(true);
            this.displayNewsInfo(this.recordId);
        }else{
            //this.getConfig();
            this.getNews();

        }
    }

    buildFormConfig(){
        this.inputBannerConfig=[
            {
                label: this.label.Interval,
                placeholder: this.label.IntervalPlc,
                name:'Interval',
                required:false,
                ly_md:'6', 
                ly_lg:'6'
            }
        ];
        
        this.bannerConfigAction= [ 
          {
                name: 'Save',
                title : this.label.Save,
                label: this.label.Save,
                class: 'slds-float_right'
            },{
                name: 'Cancel',
                title : this.label.Cancel,
                label: this.label.Cancel,
                class: 'slds-float_left'
            }
        ];

        this.inputFilter=[
            {
                label: this.label.Title,
                placeholder: this.label.TitlePlc,
                name:'Name',
                required:false,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label: this.label.Description,
                placeholder: this.label.DescriptionPlc,
                name:'Description__c',
                required:false,
                ly_md:'6', 
                ly_lg:'6'
            }];

            if(!this.isBaseUser){
                this.inputFilter.push({
                    label: this.label.Activate,
                    name:'IsActive__c',
                    checked:true,
                    type:'toggle',
                    ly_md:'6', 
                    ly_lg:'6'
                });
            }
    }



    checkUserRole(){
        checkRole({ })
          .then(result => {
            if(result.isCEO||result.isRHUser) this.isBaseUser = false;
            this.buildFormConfig();
          })
          .catch(error => {
            console.error('Error:', error);
        });
    }

    displayNewsInfo(recordid){
       //this.startSpinner(true);
        getNewsDetails({
            recordId: recordid
        }).then(result =>{
            console.log('display news ' +JSON.stringify(result))
            if (result) {
                this.newsRecord = result?.News;
                this.newsRecord.lang = result?.Lang;
                this.activeLang(this.newsRecord);
                this.handleFileInfo(this.recordId);       
               /* this.buildform(this.newsRecord);
                this.buildAction(this.newsRecord);*/
            }
        }).catch(e =>{
            this.showToast(ERROR_VARIANT,'ERROR', e?.body?.message);
            console.error(e)
        }).finally(() => {
            this.startSpinner(false);
        })
      }

      activeLang(record){
        if(record?.TitleIt__c?.length>0)
            this.enableIt=true;
        if(record?.TitleFr__c?.length>0)
            this.enableFr=true;
        if(record?.TitleEn__c?.length>0)
            this.enableEn=true;
      }

      handleFileInfo(recordid){
        //this.startSpinner(true);
        getFileInfos({
             recordId: recordid
         }).then(result =>{
             console.log('File info ' +JSON.stringify(result))
             if (result) {
                 this.newFileData.name= result.data[0]?.Name;
                 this.newsRecord.fileName = result.data[0]?.Name;
                 this.newsRecord.fileUrl =  result.data[0]?.ContentDownloadUrl;
                 this.newsRecord.ContentVersionId =  result.data[0]?.ContentVersionId;
                 this.buildform(this.newsRecord);
                 this.buildAction(this.newsRecord);
             }
         }).catch(e =>{
             this.showToast(ERROR_VARIANT,'ERROR', e.message);
             console.error(e)
         }).finally(() => {
             //this.startSpinner(false);
         })
       }

      getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
      }

      
      buildform(newsInfo){

        let title;
        let descrip;

        switch (newsInfo?.lang){
            case 'it':  title= newsInfo?.TitleIt__c;
                        descrip= newsInfo?.DescriptionIt__c; 
                         break;
            case 'fr':  title= newsInfo?.TitleFr__c;
                        descrip= newsInfo?.DescriptionFr__c;
                         break;
            case 'en_US': title= newsInfo?.TitleEn__c ;
                          descrip= newsInfo?.DescriptionEn__c;                       
                         break;
        }
        this.newsInputDetails=[
            {
                label: this.label.Title,
                placeholder: this.label.TitlePlc,
                name:'Name',
                value:title,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label: this.label.Activate,
                name:'IsActive__c',
                checked:newsInfo?.IsActive__c,
                value:newsInfo?.IsActive__c? "Yes": "No",
                type:'toggle',
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label: this.label.Description,
                name:'Description__c',
                value:descrip,
                placeholder: this.label.DescriptionPlc,
                className:'textarea',
                maxlength:25000,
                type:'textarea',
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label: this.label.UploadFile,
                name:'uploadFile',
                value:newsInfo?.fileName,
                fileName: newsInfo?.fileName,
               // isLink: true,
               // href: newsInfo?.Image__c,
                type:'Link',
                accept:['.png','.jpg','.jpeg'] ,
                ly_md:'12', 
                ly_lg:'12'
            }
        ];

        this.newsEditDetails= this.newsInputDetails.filter(e => e.type != 'Link');
        this.newsEditDetails.push({
            label: this.label.UploadFile,
            name:'uploadFile',
            fileName: newsInfo?.fileName,
            type:'file',
            accept:['.png','.jpg','.jpeg'] ,
            ly_md:'12', 
            ly_lg:'12'
        });

        this.newsFileDetails=[
            {
                label: this.label.UploadFile,
                name:'image',
                fileName: newsInfo?.fileName,
                type:'image',
                source: newsInfo?.fileUrl, 
            }
        ];
    }

    buildAction(newsInfo){
        if(this.isBaseUser==false){
            this.detailsActions= [
                {
                    name: 'Edit',
                    title :  this.label.Edit,
                    label: this.label.Edit,
                    iconName: this.icon.Edit,
                    class: 'slds-float_right slds-m-left_x-small'
                },
                {
                    name: 'Delete',
                    title :  this.label.Delete,
                    label: this.label.Delete,
                    iconName: this.icon.Delete,
                    class: 'slds-float_right slds-m-left_x-small'
                },
                {
                    name: newsInfo.IsActive__c? 'Deactivated':'Activated', 
                    title : newsInfo.IsActive__c? 'Deactivated':'Activated',
                    label:  newsInfo.IsActive__c? 'Deactivated':'Activated',
                    class: 'slds-float_right slds-m-left_x-small'
                },
                {
                    name: 'Translate',
                    title :  this.label.Translate,
                    label: this.label.Translate,
                    iconName: this.icon.Add,
                    class: 'slds-float_right slds-m-left_x-small' 
                }
            ];

            this.detailsEditActions= [ 
                {
                    name: 'Save',
                    title :  this.label.Save,
                    label: this.label.Save,
                    class: 'slds-float_right'
                },{
                    name: 'Cancel',
                    title : this.label.Cancel,
                    label: this.label.Cancel,
                    class: 'slds-float_right'
                }
            ];
        }
    }

    buildTranslate(inputNews){
        let lang = [
            { label: this.label.Italian , value: 'it' },
            { label: this.label.French , value: 'fr' },
            { label: this.label.English , value: 'en_US'}
        ];

        let title;
        let descrip;
        
        switch (inputNews?.lang){
            case 'it':  title= inputNews?.TitleIt__c;
                        descrip= inputNews?.DescriptionIt__c; 
                         break;
            case 'fr':  title= inputNews?.TitleFr__c;
                        descrip= inputNews?.DescriptionFr__c;
                         break;
            case 'en_US': title= inputNews?.TitleEn__c ;
                          descrip= inputNews?.DescriptionEn__c;                       
                         break;
        }
        
        this.newsTranslate = [
            {
                label: this.label.SelectLang,
                name:'Translate',
                picklist: true,
                options: lang,
                value:inputNews?.lang,
                maxlength:100,
                ly_md:'6', 
                ly_lg:'6'
            },{
                label: this.label.Title,
                placeholder: this.label.TitlePlc,
                name:'Name',
                value: title,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label: this.label.Description,
                name:'Description__c',
                value: descrip,
                placeholder: this.label.DescriptionPlc,
                className:'textarea',
                maxlength:25000,
                type:'textarea',
                ly_md:'12', 
                ly_lg:'12'
            },
        ];
        
        
    }

    handleDetailsActions(event){
        const action= event.detail.action;
        switch (action){
            case 'Edit': this.editNews=true; 
                         this.isTranslate= false;
                         break;
            case 'Back': this.goToHome();
                         break;
             case 'Activated': this.updateVisibility(this.recordId,true);                              
                               break;
            case 'Deactivated': this.updateVisibility(this.recordId,false);                              
                                break;
                                
            case 'Cancel': /*this.editNews=false; 
                          this.hasNews= true;*/
                          this.goToRequestDetail(this.recordId);
                          break;
            case 'Save': this.handleUpdate();
                         break;
            case 'Delete': 
                        this.confirmDelete();
                         break;
            case 'Translate': 
                        this.isTranslate=true;
                        this.editNews=false; 
                        this.buildTranslate(this.newsRecord);
                        break;
                         
            

        }
    }

    handlePreview(event){
        const action= event.detail.action;
        switch (action){
            case 'goToLink': this.previewFile=true; 
                         break;
            case 'closeModal': this.previewFile=false;
                         break;

        }
    }

    handleEditchange(event){
        console.log('event ' +JSON.stringify(event));
        let fieldname = event.detail.name? event.detail.name:event.detail.info.name;
        switch(fieldname) {
            case 'uploadFile':
                this.newFileData = event.detail.info.file; 
                break;
            case 'Translate':
                let rec = this.newsRecord;
                rec.lang= event.detail.info.value;
                this.buildTranslate(rec);
               /* this.startSpinner(true);
                this.newFileData = event.detail.info.file; */
                break;
            default:
                break;
        }
    }
    
    
    handleActions(event){
        const action= event.detail.action;
        switch (action){
            case 'Save': this.closeModal();
                        this.saveConfig(); 
                         break;
            case 'Cancel': this.closeModal(); 
            break;
        }
    }


    action='';
    get showNew(){
        return this.action=='' || this.action==NEW_ACTION || this.action==SAVE_ACTION;
    }
    get hideView(){
        return this.action=='' || this.action!=NEW_ACTION;
    }


    getNews(){
        this.startSpinner(true);
        filterNews({name: null ,description: null , isactive: null })
        .then(result => {
              if(result){
                this.builAllNews(result);
              }     
                this.startSpinner(false);
        })
        .catch(error => {
            console.log('getNews errors: ' + error);
            this.startSpinner(false);
            this.showToast(ERROR_VARIANT,ERROR_VARIANT, error.message);
        });
/*
        getAllNews()
            .then(result => {
                const self=this;
                this.allNews = result.map(function (e){
                    let item={...e};
                    item.title=e.Name?.length>27? e.Name.slice(0, 27) +'...': e.Name ;
                    item.icon="standard:news";
                    item.class=e.IsActive__c?'banned card':'active card';
                    item.id= e.Id;
                    item.summaryTitle= e.Name?.length>27? e.Name.slice(0, 27) +'...': e.Name ;
                    item.summaryDescription= e.Description__c?.length>27? e.Description__c.slice(0, 27) +'...': e.Description__c ;
                    item.keysFields=self.keysFields;
                    item.keysLabels=self.keysLabels;
                    item.fieldsToShow=self.fieldsToShow;
                    
                    if(self.isBaseUser==false){
                        let Actions=[
                            {
                                name:e.IsActive__c?'Disabled':'Enabled',
                                label:e.IsActive__c? self.label.Disable : self.label.Activate,
                                iconName: e.IsActive__c? 'utility:preview':'action:preview'
                               // class
                            },
                            {
                                name:'Delete',
                                label: self.label.Delete,
                                iconName: self.icon.Delete
                               // class
                            }
    
                        ];

                        item.actions=Actions;
                    }
                   


                    //add status actions
                    //Actions=Actions.concat(self.buildUserStatusActions(e.Status));
                    
                    
                    console.log(`item`);
                    console.log(item);

                    return item;
                    
                })
                
                this.setviewsList(this.allNews);
                this.getConfig();
            })
            .catch(error => {
                this.startSpinner(false);
                this.showToast(ERROR_VARIANT,ERROR_VARIANT, error.message);
                console.log('@@@@@@@@@  getAllNews: ' + error );
            });*/
    }


    filterNews(event){
        this.startSpinner(true);

        const description= event.detail.Description__c;
        const isActive= event.detail.IsActive__c;
        const name= event.detail.Name;

        filterNews({name: name ,description: description , isactive: isActive })
        .then(result => {
              if(result){
                this.builAllNews(result);
              }
                
                this.startSpinner(false);
        })
        .catch(error => {
            console.log('filterNews errors: ' + error);
            this.startSpinner(false);
            this.showToast(ERROR_VARIANT,ERROR_VARIANT, error.message);
        });
    }



    builAllNews(result){
        const self=this;
        this.allNews = result.map(function (e){
            let item={...e};
            item.title=e.name?.length>27? e.name.slice(0, 27) +'...': e.name ;
            item.icon= self.icon.NewsStd;
            item.class=e.isActive?'banned card':'active card';
            item.id= e.id;
            item.summaryTitle= e.name?.length>27? e.name.slice(0, 27) +'...': e.name ;
            item.summaryDescription= e.description?.length>27? e.description.slice(0, 27) +'...': e.description ;
            item.keysFields=self.keysFields;
            item.keysLabels=self.keysLabels;
            item.fieldsToShow=self.fieldsToShow;
            
            if(self.isBaseUser==false){
                let Actions=[
                    {
                        name:e.isActive?'Disabled':'Enabled',
                        label:e.isActive? self.label.Disable : self.label.Activate,
                        iconName: e.isActive? 'utility:preview':'action:preview'
                    },
                    {
                        name:'Delete',
                        label: self.label.Delete,
                        iconName: self.icon.Delete
                    }

                ];

                item.actions=Actions;
            }
            
            console.log(`item`);
            console.log(item);

            return item;
            
        })
        this.setviewsList(this.allNews);
        this.getConfig();
    }


    handleActionNew(event){
        const data=event.detail;
        console.log('data >>',data,' \n action ',data?.action);
        this.action=data?.action;
        switch (data?.action) {
            case SAVE_ACTION:
                //refresh List
                this.getNews();
                break;
            default:
                break;
        }
            
        
    }

    setviewsList(items){
        let cardsView=this.template.querySelector('c-rh_cards_view');
        cardsView?.setDatas(items);
    }

    getConfig(){
        getOrgConfig()
        .then(result => {
            if(result===null){
                this.config={
                    interval: 5000
                } 
            }else{
                 this.config = result;
            } 
            this.startSpinner(false);
            
        })
        .catch(error => {
            this.startSpinner(false);
            
            console.log('@@@@@@@@@@ getConfig:  '+error)
        });
    }

    handleCardAction(event){
        console.log('event parent ' +JSON.stringify(event.detail));
        const info=event.detail;

        if(info.extra.item==DISABLED_ACTION || info.extra.item==ENABLED_ACTION){
            let isVisible= info.extra.item==DISABLED_ACTION?false:true;
            this.updateVisibility(info?.data?.id,isVisible);
        }else if(info.extra.item==DELETE_ACTION){
            this.confirmDelete();
            this.dataId= info?.data?.id;
        } else{
            this.goToRequestDetail(info?.data?.id);
        }
       
        
    }

    deleteNews(recordId){
            this.startSpinner(true);
            deleteNews({recordId: recordId})
            .then(result => {
                if(result){
                    this.goToHome();
                    this.startSpinner(false);
                    this.showToast(SUCCESS_VARIANT,SUCCESS_VARIANT, this.label.NewsDelete); 
                }
            })
            .catch(error => {
                
                this.startSpinner(false);
                this.showToast(ERROR_VARIANT,ERROR_VARIANT, error.message);
                console.log('@@@@@@@@@@ deleteNews:  '+error)
            });   
    }

    

    updateVisibility(recordId,visibility){
        this.startSpinner(true);
        updateNewsVisibility({recordId: recordId , enabled: visibility })
        .then(result => {
            if(result){
                if(this.recordId){
                    this.displayNewsInfo(this.recordId);
                }else{
                    this.getNews();
                }  
                this.showToast(SUCCESS_VARIANT,SUCCESS_VARIANT,  result.IsActive__c?  this.label.NewsActivated : this.label.NewsDeactivated); 
            }
        })
        .catch(error => {
            
            this.startSpinner(false);
            this.showToast(ERROR_VARIANT,ERROR_VARIANT, error.message);
            console.log('@@@@@@@@@@ updateVisibility  '+error)
        });
    }

      //navigation Page

      goToRequestDetail(recordid) {
        var pagenname ='rhbannerConfig'; //request page nam
        let states={'recordId': recordid}; //event.currentTarget.dataset.id , is the recordId of the request
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }

    goToHome() {
        var pagenname ='rhbannerConfig'; //request page nam
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            }
        });
    }


    saveConfig(){
        this.startSpinner(true);
        this.draftConfig.interval = this.template.querySelector('[data-id="interval"]').value;
        let input = JSON.stringify(this.draftConfig);
        setOrgConfig({ data: input })
        .then((result) => {
            this.startSpinner(false);
            this.config=this.draftConfig;
            this.showToast(SUCCESS_VARIANT,SUCCESS_VARIANT, this.label.SaveConfiguration);
        })
        .catch((error) => {
            this.startSpinner(false);
            this.showToast(ERROR_VARIANT,ERROR_VARIANT, error.body.message);
        });
    }

    handleBackConfig(){
        this.recordId=null;
        this.action='back';
    }

    handleEditNews(){
        this.showEdit=true;
    }
    displayDetail(){
        this.showEdit=false;
    }

    

    handleUpdateNews(input){
        let lang;
        if(input?.Translate){
            lang= input?.Translate;
        }
        updateNews({ recordId: this.recordId, newsJson: JSON.stringify(input), currentLang: lang })
          .then(result => {
            this.updateFile();
          })
          .catch(error => {
            this.startSpinner(false);
            this.showToast(ERROR_VARIANT,ERROR_VARIANT, this.label.UpdateNewsError);
            console.error('Error:', error);
        });
    }

    handleUpdate(evt){
        this.startSpinner(true);
        let record={};
        let result= this.save();
        if (result.isvalid) {
            record={...record,...result.obj};
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            this.handleUpdateNews(record);
        }else{
            this.startSpinner(false);
            this.showToast(ERROR_VARIANT,ERROR_VARIANT, this.label.InvalidField);
            console.log(`Is not valid `);
        }
        console.log(`record `, record);
    }

    save(){
        let form=this.template.querySelector('c-rh_dynamic_form');
        console.log(form);
        let isvalid=true;  
        let obj={};
        
        let saveResult=form.save();
        console.log(`>>>>>>>>>>>>saveResult `, saveResult );
        let outputs = saveResult.outputs;
        isvalid=isvalid && saveResult.isvalid;
        console.log(`>>>>>>>>>>>>outputs `, outputs );
        obj=saveResult.obj;
        console.log(`>>>>>>>>>>>>obj `, obj );
        return  {isvalid,obj};
    }


    updateFile(){
        if(this.newFileData?.size){
            this.getBase64(this.newFileData)
            .then(data => {
                    var base64= data.split(',')[1];
                   updateFile({ base64 : base64, filename : this.newFileData.name, recordId :this.recordId })
                    .then(result=>{
                        this.newFileData = null
                        this.startSpinner(false);
                        this.showToast(SUCCESS_VARIANT,SUCCESS_VARIANT, this.label.UpdateNews); 
                        this.goToRequestDetail(this.recordId);
                    }).catch(error => {
                        this.startSpinner(false);
                        this.showToast(ERROR_VARIANT,ERROR_VARIANT, this.label.FileUpdate);
                        console.error('Error:', error);
                    })
                });   
        }else{
            this.startSpinner(false);
            this.showToast(SUCCESS_VARIANT,SUCCESS_VARIANT, this.label.UpdateNews);
            this.goToRequestDetail(this.recordId);    
        }
        
    }

    //convert a file in Base64
    getBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      }

       
    openModal() {
        this.isModalOpen = true;
    }
    closeModal() {
        this.isModalOpen = false;
    }

    createAction(variant,label,name,title,iconName,className){ 
        return {
            variant, label, name, title, iconName,  class:className
        };
    }

    confirmDelete(){
        let text= this.label.DeleteNews_Confirm;
        let  extra={style:'width:20vw;'};
        let  Actions=[];
        extra.title=this.label.DeleteNews_Title;
        extra.style+='--lwc-colorBorder: var(--bannedColor);';
        Actions.push(this.createAction("brand-outline",DELETE_ACTION,DELETE_ACTION,DELETE_ACTION,"utility:close",'slds-m-left_x-small'));
        this.ShowModal(true,text,Actions,extra);
    }

    doModalAction(event){
        console.log('doModalAction in user view ', JSON.stringify(event.action));
        switch (event.action) {
            case DELETE_ACTION:
                this.deleteNews(this.dataId?this.dataId:this.recordId);
                break;
        }
        this.dataId=null;
        this.ShowModal(false,null,[]);//close modal any way
        //event.preventDefault();
    }
    
    staticBack(event){
        this.goToHome();
    }

    ShowModal(show,text,actions,extra={}){
        fireEvent(this.pageRef, 'Modal', {show,text,actions,extra});
    }

    
    showToast(variant, title, message){
        fireEvent(this.pageRef, 'Toast', {variant, title, message});
    }
    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
     }

}