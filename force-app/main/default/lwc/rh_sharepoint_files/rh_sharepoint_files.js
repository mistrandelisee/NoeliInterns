import { LightningElement,wire,api, track } from 'lwc';
import getApexData from '@salesforce/apex/RH_Sharepoint_Integration.getData';
import { getRecord , getFieldValue} from 'lightning/uiRecordApi';
import StageName from '@salesforce/schema/Opportunity.StageName';
import NAME_FIELD from '@salesforce/schema/Opportunity.Name';
export default class Rh_sharepoint_files extends LightningElement {
    @api
     recordId;// get current reccord id 
    record;
    view_mode='List';
    @api baseUrl='https://noeliit.sharepoint.com';
    @track files;
    @api statutRowNumber=false;
    @api resizeColumn=false;
    startIndex = 0;
    lastIndex = 0;
    @api pageSize = 5;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    @track isLoading=true;
    @track columns = [
        { label: 'Name', fieldName: 'Name',sortable:true, type: 'button',typeAttributes:{label:{fieldName:'Name'},variant:'base'} },
       
       { label: 'Time Created', fieldName: 'TimeCreated',sortable:true, type: "date",wrapText:true, typeAttributes:{
            // weekday: "long",
            year:"2-digit", month:"short" ,day:"2-digit",
            hour: "2-digit", minute: "2-digit"
        } },
        { label: 'Time Last Modified', fieldName: 'TimeLastModified',sortable:true, type: "date",wrapText:true, typeAttributes:{
            // weekday: "long",
            //  year: "numeric",
            // month: "2-digit", day: "2-digit",
            year:"2-digit", month:"short" ,day:"2-digit",
             hour: "2-digit", minute: "2-digit"
        } },
    ];
    @wire (getRecord, { recordId: '$recordId', fields: [StageName,NAME_FIELD] })
    wiredGetRecord(value) {
        const { data, error } = value;
        if (data) {
           
            console.log('recordId==> data ' + data );
            this.record=data;
            this.getFiles();
        } else if (error) { }
    }
    get isTile(){return this.view_mode=='Tile';    }
    get isList(){return this.view_mode=='List';    }
    setView(event){
        console.log(event.currentTarget.dataset.name)
        this.view_mode=event.currentTarget.dataset.name;
    }
    get path() {
        console.log(`getFieldValue(this.record, NAME_FIELD)`, getFieldValue(this.record, NAME_FIELD));
        return getFieldValue(this.record, NAME_FIELD);
    }
    doRefresh(){
        this.getFiles();
    }
    getFiles(){
        this.isLoading=true;
        getApexData({ folderPath: this.path })
          .then(result => {
            console.log('Result', result);
            this.files=result.Files;
            this.reset()
          })
          .catch(error => {
            console.error('Error:', error);
        })
        .finally(() => {
            this.isLoading=false;
        });
    }
    // get files() {
    //     return this.results?.Files || [];
    // }
    get size() {
        return this.files?.length || 0;
    }
    get hasFiles() {
        return this.size > 0;
    }
    get showPagination(){
        return (this.hasFiles && this.size > this.pageSize ) ? true : false;
    }
    get title(){
        return `Files (${this.size})`
    }
    get isFirstIndex() {
        return this.startIndex == 0;
    }

    get isLastIndex() {
        return this.size <= this.lastIndex;
    }
    @api
    goToDetail(event){
        const data = JSON.parse(JSON.stringify(event.detail));
        console.log('data ......', data);
        const row = event.detail.row; 
        console.log(row);
        this.gotolink(row);
        // this.dispatchEvent(new CustomEvent('rowselected', {
        //     detail:event.detail
        // }));
    }
    get filesToShow() {
        let begin = this.startIndex;
        let end = Math.min(this.files.length, this.lastIndex);
        return this.files.slice(begin, end);
    }

    set filesToShow(data) {
        let clonedData = [...this.files];

        let begin = this.startIndex;
        let end = Math.min(this.files.length, this.lastIndex);
        clonedData.splice(begin, end - begin, data);
        this.files = clonedData.flat();
    }
    // Used to sort the 'Age' column
    sortBy(field, reverse, primer) {
        console.log('sortii');
        const key = primer
            ? function (x) {
                return primer(x[field]);
            }
            : function (x) {
                return x[field];
            };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        console.log('sort');
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.filesToShow];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.filesToShow = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
    handleNext() {
        this.startIndex = this.lastIndex;
        this.lastIndex = Math.min(this.files.length, this.lastIndex + this.pageSize);
    }

    handlePrev() {
        this.lastIndex = this.startIndex;
        this.startIndex = Math.max(0, this.startIndex - this.pageSize);
    }
    
    buildLinkingUri(item){
        let link = this.baseUrl+item?.ServerRelativeUrl;
        // console.log(`link ?? `, link );

        link= `${link}?d=w${item?.UniqueId?.replaceAll("-", "")}`;

        // console.log(`2 link ?? `, link );
        return encodeURI(link)
    }

    gotolink(item){
        const link =this.item?.LinkingUri || this.buildLinkingUri(item)
        window.open(link)
    }

    @track
    pageList = [
        {
            id: 'menu-item-1',
            label: '5 elements',
            value: '5',
        },
        {
            id: 'menu-item-2',
            label: '10 elements',
            value: '10',
        },
        {
            id: 'menu-item-3',
            label: '15 elements',
            value: '15',
        },
    ];

    handleMenuSelect(event) {
        // retrieve the selected item's value
        this.pageSize = event.detail.value;
        this.reset() 
        // INSERT YOUR CODE HERE
    }
    reset(){
        this.startIndex = 0;
        this.lastIndex = Math.min(this.files?.length || 0, this.pageSize || 0);
    }
    get pageSizeLabel(){
        return `View ${this.pageSize} elements per page`;
    }
}