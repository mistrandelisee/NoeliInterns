import { LightningElement,wire,api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
import { labels } from 'c/rh_label';
import { icons } from 'c/rh_icons';
import initConfig from '@salesforce/apex/RH_Users_controller.InitUserCreation';
import newsCreation from '@salesforce/apex/RH_News_controller.newsCreation';
import uploadFile from '@salesforce/apex/RH_News_controller.uploadFile';
import getUserLanguage from '@salesforce/apex/RH_Users_controller.getUserLanguage';




//Constants
const EDIT_ACTION='Edit';
const NEW_ACTION='New';
const VIEW_ACTION='View';
const SAVE_ACTION='Save';


const RESET_ACTION='Reset';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';

export default class Rh_news_creation extends LightningElement {
    label={...labels}
    icon={...icons};
    action;
    roles=[];
    formInputs=[];
    record;
    listgroup=[];
    userfield ={};
    fileData={};
    userLang;

    @wire(CurrentPageReference) pageRef;

    startSpinner(b){
        fireEvent(this.pageRef, 'Spinner', {start:b});
     }

     showToast(variant, title, message){
         fireEvent(this.pageRef, 'Toast', {variant, title, message});
     }
    buildForm(){
        this.formInputs=[
            {
                label: this.label.Title,
                placeholder: this.label.TitlePlc,
                name:'Name',
                value: '',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label: this.label.Description,
                placeholder: this.label.DescriptionPlc,
                name:'Description__c',
                value: '',
                required:true,
                className:'textarea',
                maxlength:255,
                type:'textarea',
                ly_md:'12', 
                ly_lg:'12'          
            },
            {
                label:this.label.Activate,
                name:'IsActive__c',
                checked:false,
                type:'toggle',
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:this.label.UploadFile,
                name:'uploadFile',
                type:'file',
                accept:['.png','.jpg','.jpeg'] ,
                ly_md:'12', 
                ly_lg:'12'       
            }
        ]
    }
    
    connectedCallback(){
        console.log('teste');
        this.initialize()
        // this.buildForm();
        //this.getActiveWorkgroupse();
    }


    initialize(){
        getUserLanguage()
        .then(result => {
            console.log(' Rh_news_creation getUserLanguage  : '+ result);
            this.userLang = result?.userInfo?.LanguageLocaleKey;
        })
        .catch(error => {
            this.error = error;
        });
    }  


    callApexSave(input){
        let params={};
         params.isActive = input.IsActive__c
         params.description = input.Description__c
         params.name = input.Name
         params.image = input.Image__c

        newsCreation({ newsJson: JSON.stringify(params) })
          .then(result => {

            console.log('Result callApexSave:: ');
            console.log(result);
            if(result.Id){
                this.saveFile(result.Id);
            }else{
                this.startSpinner(false);
            }
            
           
            /*this.action='';
            this.callParent(SAVE_ACTION,{result})*/
          })
          .catch(error => {
            this.startSpinner(false);
            console.error('Error:', error);
        });
    }


    saveFile(recordId){
        if(this.fileData?.name?.length > 0){
            this.getBase64(this.fileData)
            .then(data => {
                    var base64= data.split(',')[1];
                    uploadFile({ base64 : base64, filename : this.fileData.name, recordId : recordId })
                    .then(result=>{
                        this.fileData = null;
                        this.action='';
                        this.showToast(SUCCESS_VARIANT, this.label.Save,'The news has been successfully saved' )
                        this.callParent(SAVE_ACTION,{result})
                    }).catch(error => {
                        this.startSpinner(false);
                        this.showToast(ERROR_VARIANT, this.label.Error,error.message )
                        console.error('Error:', error);
                    })
                }); 
        }else{
            this.startSpinner(false);
            this.fileData = null;
            this.action='';
            this.callParent(SAVE_ACTION,{})
            this.showToast(SUCCESS_VARIANT, this.label.Save,'The news has been successfully saved' )  
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


    handlechange(event){
        console.log('event ' +JSON.stringify(event));
        let fieldname = event.detail.name? event.detail.name:event.detail.info.name;
        switch(fieldname) {
            case 'uploadFile':
                this.fileData = event.detail.info.file; 
                break;
        
            default:
                break;
        }
    }

    get newMode(){
        return this.action==NEW_ACTION;
    }
    
    handleNew(){
        this.startSpinner(true);
        initConfig()
          .then(result => {
            console.log('Result INIT CONF');
            console.log(result);
            if (!result.error && result.Ok) {
                this.buildForm();
                this.action=NEW_ACTION;
                this.callParent(this.action,{});
            }else{
                this.showToast(WARNING_VARIANT,'ERROR', result.msg);
            }
            this.startSpinner(false);

          })
          .catch(error => {
            this.startSpinner(false);
            console.error('Error:', error);
        });
    }
    handleCancel(){
        this.action='';
        this.fileData={};
        this.callParent(this.action,{});
    }
    handleSave(evt){
        this.startSpinner(true);
        let record={};
        let result= this.save();
        if (result.isvalid) {
            record={...record,...result.obj};
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            this.callApexSave(record);
        }else{
            console.log(`Is not valid `);
            this.startSpinner(false);
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
    callParent(actionName,data){
        var actionEvt =new CustomEvent('action',
         {detail: { action : actionName,data }}
      );
      console.log("Watch: actionName ->"+actionName); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }

}