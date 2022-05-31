import { LightningElement,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getOrgConfig from '@salesforce/apex/RH_News_controller.getOrgConfig';
import setOrgConfig from '@salesforce/apex/RH_News_controller.setOrgConfig';
import getAllNews from '@salesforce/apex/RH_News_controller.getAllNews';
import getNewsDetails from '@salesforce/apex/RH_News_controller.getNewsDetails';
import updateNewsVisibility from '@salesforce/apex/RH_News_controller.updateNewsVisibility';
import updateNews from '@salesforce/apex/RH_News_controller.updateNews';
import updateFile from '@salesforce/apex/RH_News_controller.updateFile';
import getFileInfos from '@salesforce/apex/RH_FileUploader.getFileInfos';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';

const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';


const SAVE_ACTION='Save';
const NEW_ACTION='New';

const ENABLED_ACTION='Enabled';
const DISABLED_ACTION='Disabled';

export default class Rh_display_news_config extends NavigationMixin(LightningElement) {

    config={};
    draftConfig={};
    r=0;
    allNews=[];
    hasadmin=true;
    editNews=false;
    previewFile=false;
    newFileData={};

    newsRecord={};
    detailsActions;
    detailsEditActions;
    @track newsInputDetails=[];
    @track newsEditDetails=[];
    @track newsFileDetails=[];
    recordId;

    keysFields={Name:'ok'};
    keysLabels={
        summaryTitle:'Title', summaryDescription:'Description',
    };
    fieldsToShow={
        summaryTitle:'ok', summaryDescription:'',
    };

    @wire(CurrentPageReference) pageRef;

    get hasNews(){
        return this.newsRecord && !this.editNews?true:false;
    }
    get hasrecordid(){
        return this.recordId?true:false;
    }

     connectedCallback(){
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        if (this.recordId) {
            //this.startSpinner(true);
            this.displayNewsInfo(this.recordId);
        }else{
            this.getConfig();
            this.getNews();

        }
    }

    displayNewsInfo(recordid){
       //this.startSpinner(true);
        getNewsDetails({
            recordId: recordid
        }).then(result =>{
            console.log('display news ' +JSON.stringify(result))
            if (result) {
                this.newsRecord = result;
                this.handleFileInfo(this.recordId);
               /* this.buildform(this.newsRecord);
                this.buildAction(this.newsRecord);*/
            }else{
               // this.showToast(WARNING_VARIANT,'ERROR', result.msg);
                this.title = 'Failled';
                this.information = result.msg;
                this.contactNotFounded = true;
            }
        }).catch(e =>{
            //this.showToast(ERROR_VARIANT,'ERROR', e.message);
            console.error(e)
        }).finally(() => {
            //this.startSpinner(false);
        })
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
             }else{
                // this.showToast(WARNING_VARIANT,'ERROR', result.msg);
                 this.title = 'Failled';
                 this.information = result.msg;
                 this.contactNotFounded=true;
             }
         }).catch(e =>{
             //this.showToast(ERROR_VARIANT,'ERROR', e.message);
             console.error(e)
         }).finally(() => {
             //this.startSpinner(false);
         })
       }

      getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
      }

      buildform(newsInfo){
        this.newsInputDetails=[
            {
                label:'Title',
                placeholder:'Enter Title',
                name:'Name',
                value:newsInfo?.Name,
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Activate ?',
                name:'IsActive__c',
                checked:newsInfo?.IsActive__c,
                value:newsInfo?.IsActive__c? "Yes": "No",
                type:'toggle',
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'Description',
                name:'Description__c',
                value:newsInfo?.Description__c,
                placeholder:'Enter Description',
                className:'textarea',
                maxlength:25000,
                type:'textarea',
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Upload File',
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
            label:'Upload File',
            name:'uploadFile',
            fileName: newsInfo?.fileName,
            type:'file',
            accept:['.png','.jpg','.jpeg'] ,
            ly_md:'12', 
            ly_lg:'12'
        });

        this.newsFileDetails=[
            {
                label:'Upload File',
                name:'image',
                fileName: newsInfo?.fileName,
                type:'image',
                source: newsInfo?.fileUrl, 
            }
        ];
    }

    buildAction(newsInfo){
        this.detailsActions= [
            {
                name: 'Back',
                title :  'Back',
                label: 'Back',
                class: 'slds-float_left'
            },
            {
                name: 'Edit',
                title :  'Edit',
                label: 'Edit',
                class: 'slds-float_right'
            },
            {
                name: newsInfo.IsActive__c? 'Deactivated':'Activated', 
                title : newsInfo.IsActive__c? 'Deactivated':'Activated',
                label:  newsInfo.IsActive__c? 'Deactivated':'Activated',
                variant: newsInfo.IsActive__c? "destructive" :"success",
                class: 'slds-float_right'
            }
        ];

        
        this.detailsEditActions= [ 
            {
                name: 'Save',
                title :  'Save',
                label: 'Save',
                class: 'slds-float_right'
            },{
                name: 'Cancel',
                title :  'Cancel',
                label: 'Cancel',
                class: 'slds-float_right'
            }
        ];

    }

    handleDetailsActions(event){
        const action= event.detail.action;
        switch (action){
            case 'Edit': this.editNews=true; 
                         this.hasNews= false;
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
            default:
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
        getAllNews()
            .then(result => {
                const self=this;
                this.allNews = result.map(function (e){
                    let item={...e};
                    item.title=e.Name?.length>27? e.Name.slice(0, 27) +'...': e.Name ;
                    item.icon="standard:news";
                    item.class=e.IsActive__c?'banned card':'active card';
                    item.id= e.Id;
                    item.summaryTitle= e.Name?.length>38? e.Name.slice(0, 38) +'...': e.Name ;
                    item.summaryDescription= e.Description__c?.length>80? e.Description__c.slice(0, 75) +'...': e.Description__c ;
                    item.keysFields=self.keysFields;
                    item.keysLabels=self.keysLabels;
                    item.fieldsToShow=self.fieldsToShow;
                    
                    let Actions=[
                        {
                            name:e.IsActive__c?'Disabled':'Enabled',
                            label:e.IsActive__c?'Disabled':'Enabled',
                            iconName: e.IsActive__c? 'utility:preview':'action:preview'
                           // class
                        }

                    ];


                    //add status actions
                    //Actions=Actions.concat(self.buildUserStatusActions(e.Status));
                    item.actions=Actions;
                    
                    console.log(`item`);
                    console.log(item);

                    return item;
                    
                })
                this.setviewsList(this.allNews);
            })
            .catch(error => {
                alert('KB ' + error);
                console.log(' error@@@@@@@@@@@@@@@@@@' + error );
            });
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
        })
        .catch(error => {
            this.error = error;
            console.log('@@@@@@@@@@ getConfig  '+error.body)
        });
    }

    handleCardAction(event){
        console.log('event parent ' +JSON.stringify(event.detail));
        const info=event.detail;
        if(info.extra.item==DISABLED_ACTION || info.extra.item==ENABLED_ACTION){
            let isVisible= info.extra.item==DISABLED_ACTION?false:true;
            this.updateVisibility(info?.data?.id,isVisible);
        }else{
            this.goToRequestDetail(info?.data?.id);
        }
       
        
    }

    updateVisibility(recordId,visibility){
        this.startSpinner(true);
        updateNewsVisibility({recordId: recordId , enabled: visibility })
        .then(result => {
            if(result){
                this.displayNewsInfo(this.recordId);
                this.getNews();
                this.showToast(SUCCESS_VARIANT,'Success', 'the news has been '+ ( result.IsActive__c? 'successfully activated': 'successfully deactivated')); 
            }
        })
        .catch(error => {
            this.error = error;
            this.startSpinner(false);
            this.showToast(ERROR_VARIANT,ERROR_VARIANT, error.body);
            console.log('@@@@@@@@@@ getConfig  '+error.body)
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
            this.showToast(SUCCESS_VARIANT,'Save configuration', 'Your configuration has been successfully saved');
        })
        .catch((error) => {
            this.startSpinner(false);
            this.showToast(ERROR_VARIANT,'Configuration ', error.body);
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
        updateNews({ recordId: this.recordId, newsJson: JSON.stringify(input) })
          .then(result => {
            this.updateFile();
          })
          .catch(error => {
            this.startSpinner(false);
            this.showToast(ERROR_VARIANT,ERROR_VARIANT, 'The record has not been updated ');
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
            this.showToast(ERROR_VARIANT,ERROR_VARIANT, 'The field Is not valid');
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
                   updateFile({ base64 : base64, filename : this.newFileData.name, ContentVersionId :this.newsRecord.ContentVersionId })
                    .then(result=>{
                        this.newFileData = null
                        this.startSpinner(false);
                        this.showToast(SUCCESS_VARIANT,'Success', 'the news has been successfully Update '); 
                        this.goToRequestDetail(this.recordId);
                    }).catch(error => {
                        this.startSpinner(false);
                        this.showToast(ERROR_VARIANT,ERROR_VARIANT, 'The file has not been updated ');
                        console.error('Error:', error);
                    })
                });   
        }else{
            this.startSpinner(false);
            this.showToast(SUCCESS_VARIANT,'Success', 'the news has been successfully Update ');
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

    showToast(variant, title, message){
        fireEvent(this.pageRef, 'Toast', {variant, title, message});
    }
    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
     }

}