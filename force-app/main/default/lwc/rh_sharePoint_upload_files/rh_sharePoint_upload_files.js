import { LightningElement, track,api ,wire} from 'lwc';
import getCreateFolder from '@salesforce/apex/RH_Sharepoint_Integration.PostFolder';
import getCreateFolderRoot from '@salesforce/apex/RH_Sharepoint_Integration.VerifyFolderRoot';
import getCreateFile from '@salesforce/apex/RH_Sharepoint_Integration.PostFile';
import DeleteFolder from '@salesforce/apex/RH_Sharepoint_Integration.DeleteFolder';
import { getRecord , getFieldValue} from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const TITLE_SUCCESS= 'UPLOAD';
const MESSAGE_SUCCESS= 'All the File Upload Successfully';
const VARIANT_SUCCESS= 'success';
const TITLE_ERROR= 'UPLOAD';
const MESSAGE_ERROR= 'You Have to choose at least 1 file before upload';
const VARIANT_ERROR= 'error';

const actions = [
    { label: 'Delete', name: 'delete',iconName: 'utility:delete',iconClass: 'slds-icon-text-error' },
];

const COLUMNS = [

    {label:'Name File', fieldName:'Name_File'},
    {label:'size File', fieldName:'Size_File'},
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    },

];



export default class Rh_sharePoint_upload_files extends LightningElement {
    fileName;
    fileData;
    size;
    fileList=[]
    data=[]
    datacpy=[];
    columns=COLUMNS;
    i=0;
    record
    @api
    recordId;
    @api objectApiName


    handleFileChange(event){
        //var tab =[]
        this.datacpy=[...this.data];
        console.log("@@@ event",event.target.files);

        if (event.target.files.length > 0) {
            const file = event.target.files[0]
            var reader = new FileReader()
                reader.onload = () =>{
                    var base64 = reader.result.split(',')[1]
                    this.fileName = file.name;
                    // this.size = file.size;
                    this.fileData = {
                        'id':'row'+(++this.i),
                        'Name_File': file.name,
                        'base64': base64,
                        'Size_File':file.size
                    }
                    console.log(this.fileData)
                    // console.log('@@@@@',tab)
                    // tab.push(this.fileData)
                    // this.data = tab
                    this.data=[];
                    this.datacpy.push(this.fileData)
                    this.data=[...this.datacpy];
                    console.log('@@@@@data',this.data);
                }
                 reader.readAsDataURL(file)
        }
    }

    handleActionRow(event){
        this.datacpy = [... this.data]
        debugger
        const actionName = event.detail.action.name;
        console.log('@@@actionName',actionName);
        const row  = event.detail.row;
        console.log('@@@row',row);
        switch (actionName) {
            case 'delete':
                this.deleteRow(row);
                break;
        }
    }

    deleteRow(row){
        const { id } = row;
        console.log('@@Id',id);
        const index = this.findRowIndexById(id);
        if (index !== -1) {
          this.data = this.datacpy.slice(0, index).concat(this.datacpy.slice(index + 1));
        }
    }

    findRowIndexById(id) {
        let val = -1;
        this.datacpy.some((row, index) => {
            if (row.id === id) {
                val = index;
                return true;
            }
            return false;
        });
        return val;
    }

    // @wire (getRecord, { recordId: '$recordId', fields: [FILE_PATH_FIELD] })
    // wiredGetRecord(value) {
    //     const { data, error } = value;
    //     if (data) {
           
    //         console.log('recordId==> data ' + data );
    //         this.record=data;
    //     } else if (error) { }
    // }


    get folderPath(){
        return this.objectApiName+'/'+this.recordId
    }
    CreateFolderPathRoot(){
        debugger
        console.log("@@@"+this.recordId);
        getCreateFolderRoot({NameObject:this.objectApiName})
        .then(result=>{
             console.log("result Created Root Folder",result);
             result ? '':this.CreateFolderAndFile(this.folderPath)
        }).catch(error=>{
             console.log('@@@@error Created Root Folder',error);
        })
    }

    CreateFolderAndFile(nameObject){
        getCreateFolder({folderPath :nameObject})
        .then(result=>{
            console.log('result',result);
            if (this.data.length >0 ) {
                var temp =[]
                for (let i = 0; i < this.data.length; i++) {
                    temp.push(this.createFile(i,this.folderPath));
                   // this.createFile(i,this.folderPath);
                    }
                    Promise.all(temp).then(value =>{
                    const evt = new ShowToastEvent({
                        title: TITLE_SUCCESS,
                        message: MESSAGE_SUCCESS,
                        variant: VARIANT_SUCCESS,
                    });
                    this.dispatchEvent(evt);
                }).catch(error =>{
                    console.log('@@@@Error',error);
                })
            }else{
                const evt = new ShowToastEvent({
                    title: TITLE_ERROR,
                    message: MESSAGE_ERROR,
                    variant: VARIANT_ERROR,
                });
                this.dispatchEvent(evt);
            }
            
        }).catch(error=>{
            console.log('error',error);
        })
    }

    createFile(i,nameObject){
            getCreateFile({folderPath:nameObject,base64:this.data[i].base64,folderName:this.data[i].Name_File})
        .then(result=>{
            console.log('result',result);
        }).catch(error=>{
            console.log('error',error);
        })
    }

    deleteFolderRecord(){
        DeleteFolder({folderPath:this.folderPath})
        .then(result =>{
              console.log('@@@@result',result);
              this.CreateFolderPathRoot();
        }).catch(error =>{
                console.log('@@@@@Error',error);
        })
    }
}