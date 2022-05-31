import { LightningElement ,api, wire, track} from 'lwc';
import checkcontentDocumentByRcrdIdTest from '@salesforce/apex/RH_EventController.checkcontentDocumentByRcrdIdTest';
// import getAccountList from '@salesforce/apex/RH_EventController.getAccountList';
export default class LightningDatatableLWCExample extends LightningElement {
    @track columns = [
        { label: 'File Name', fieldName: 'FileName', type: 'text', sortable: true },
        {
            label: 'Download',
            type: 'button-icon',
            typeAttributes: {
                name: 'Download',
                iconName: 'action:download',
                title: 'Download',
                variant: 'border-filled',
                alternativeText: 'Download'
            }
        },
        {
            label: 'Delete File',
            type: 'button-icon',
            typeAttributes: {
                name: 'DeleteFile',
                iconName: 'action:delete',
                title: 'DeleteFile',
                variant: 'border-filled',
                alternativeText: 'DeleteFile'
            }
        },
    ];
 
    @track error;
    @track accList = [];
    @track accLists = [] ;

    // @wire(getAccountList)
    // wiredAccounts({
    //     error,
    //     data
    // }) {
    //     if (data) {
    //         this.accList = data;
    //     } else if (error) {
    //         this.error = error;
    //     }
    // }
    connectedCallback(){
        this.getAccountList();
    }
    getAccountList(){
        checkcontentDocumentByRcrdIdTest()
        .then(result =>{
            console.log('@@result--> ' , result);
            // this.accList = result;
            let _data=[];
            for(let key in result) {
                _data.push({FileName: result[key].Title, Id:result[key].Id});
            }
            this.accList = _data;
            // console.log('@@ _data--> ' , _data);
        });
    }
    handleRowAction( event ) {
        const actionName = event.detail.action.name;
        const row = event.detail.row.Id;
        console.log('row--> ' , row);
        console.log('actionName--> ' , actionName);
        switch (actionName) {
            case 'DeleteFile':
                // checkcontentDocumentByRcrdId({recId:this.recordId})
                // .then(result =>{
                //     let rowId = result;
                //     console.log('----> result' , rowId);
                // })
                break;
            case 'Download':
                // this.template.querySelector('[data-id="1"]').click();
                break;
            default:
        }
    }
}