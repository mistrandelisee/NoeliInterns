import { api, LightningElement, track, wire } from 'lwc';

export default class Rh_datatable_component extends LightningElement {
    isLoading;
    @api items = [];
    startIndex = 0;
    lastIndex = 0;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    @api hideExport;
    @api pageSize = 15;

    @api columns = [];

    get existElements(){
        return this.items && this.items.length > 0 ? true : false;
    }

    get ready(){
        return this.columns?.length>0;
    }
    get isFirstIndex() {
        return this.startIndex == 0;
    }

    get isLastIndex() {
        return this.items.length == this.lastIndex;
    }

    get itemsToShow() {
        let begin = this.startIndex;
        let end = Math.min(this.items.length, this.lastIndex);
        return this.items.slice(begin, end);
    }

    set itemsToShow(data) {
        let clonedData = [...this.items];

        let begin = this.startIndex;
        let end = Math.min(this.items.length, this.lastIndex);
        clonedData.splice(begin, end - begin, data);
        this.items = clonedData.flat();
    }
    connectedCallback(){
        this.lastIndex = Math.min(this.items?.length || 0, this.pageSize || 0);
    }
    @api 
    setCols(columns){
        this.columns=columns ;
    }
    @api 
    setDatas(datas){
        this.isLoading=true;
        console.log('------------------datatable-component', datas);
        this.lastIndex = 0;
        this.startIndex = 0;
        this.items = [];

        if (datas) {
            this.items=datas;
            this.lastIndex = Math.min(this.items.length, this.pageSize);
        }
        this.isLoading=false;
    }
    handleNext() {
        this.startIndex = this.lastIndex;
        this.lastIndex = Math.min(this.items.length, this.lastIndex + this.pageSize);
    }

    handlePrev() {
        this.lastIndex = this.startIndex;
        this.startIndex = Math.max(0, this.startIndex - this.pageSize);
    }
    
    @api
    goToDetail(event){
        const data = JSON.parse(JSON.stringify(event.detail));
        console.log('data ......', data);
        const row = event.detail.row; 
        console.log(row);
        this.dispatchEvent(new CustomEvent('rowselected', {
            detail:event.detail
        }));
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
        const cloneData = [...this.itemsToShow];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.itemsToShow = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
   
}