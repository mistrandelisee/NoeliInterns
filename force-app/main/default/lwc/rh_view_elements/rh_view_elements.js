import { LightningElement ,track,api } from 'lwc';
export default class Rh_view_elements extends LightningElement {
    @api headers=[];
    @api records;
    @api columns;
    @track pageIndex=1;
    @api tableType;
    @api defaultPageSize=5;
    delimiterStart=0;
    delimiterEnd=1;
    @api indexesLength=4;
    prev_index=1;
    pageIndexes=[];
    disableAction=false;
    dataSize=0;
    get totalPages(){
        return this.pageIndexes?.length
    }
    get isFirstIndex(){
        return this.pageIndex == 1;
    }
    get isLastIndex(){
        return this.pageIndex == this.delimiterEnd;
    } 
    get indexesToShow(){
        return  this.pageIndexes.slice(this.delimiterStart, this.delimiterEnd); 
    }
    get recordsToShow(){
        let begin = 0;
        let end =Math.min(this.records.length,this.defaultPageSize)  ;
        return  this.records.slice(begin, end); 
    }
    get op(){
        return this.defaultPageSize +'';
    }
    get options() {
        return [
            { label: '5 righe per pagina', value: '5' },
            { label: '8 righe per pagina', value: '8' },
            { label: '10 righe per pagina', value: '10' },
        ];
    }
     calculateDataSize(N){
        let prevN=(this.pageIndex-1) *  this.defaultPageSize;
        this.dataSize =N+ prevN;
    }
    connectedCallback() {
        let N= this.records?.length || 0;
        this.refreshPageIndexes('CALLBACK',N);
    }
    @api refreshPageIndexes(from,N,filter=false){
        /**
         * from: for debug purpose
         * N : size of record received
         * filter: to reset back for the starting index or not
         */
        /**
         * current index := pageIndex
         */
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>FROM ',from);
        if (filter) {
            /**
             * set the current back to 1
             */
            this.pageIndex=1;
            this.defaultPageSize=5;
        }
        this.pageIndexes=[];
        for (let i = 1; i < this.pageIndex; i++) {
            /**
             * build the indexes before the current index
             */
            this.pageIndexes.push(
                {
                    label:i,
                    key:i,
                    class:'page'
                }
            )
            
        }
        let i=this.pageIndex;
        let J=N;
        while (J>0) {
            /**
             * build the next indexes according to the record size received
             */
            let classValue= (i==this.pageIndex) ? 'activePage': 'page';
            this.pageIndexes.push(
                {
                    label:i,
                    key:i,
                    class:classValue
                }
            )
            i++;
            J-=this.defaultPageSize;
        }
        /**
         * calculate the delimiters(start & end) to split the indexes to show
         */
        let Y=this.pageIndexes.length;
        if (Y <= this.indexesLength) {
            this.delimiterStart=0;
            this.delimiterEnd=Math.min(Y,this.delimiterStart+this.indexesLength);
        }else{
            // this.delimiterStart= (this.prev_index>=this.pageIndex)? this.delimiterStart-1 :  this.delimiterStart +1;
            //find direction
            this.delimiterStart= (this.prev_index==this.pageIndex)? this.delimiterStart :( (this.prev_index>this.pageIndex)? this.delimiterStart-1 :  this.delimiterStart +1 )  ;
            this.delimiterStart= this.delimiterStart >=0 ? this.delimiterStart : 0;
            this.delimiterEnd=Math.min(Y,this.delimiterStart+this.indexesLength);
            if (this.delimiterEnd == Y) {//
                this.delimiterStart=Y-this.indexesLength;
            }
        }
        this.endLoading();
        this.calculateDataSize(N);
    }
    calculateOffset(index,size){
        return (index-1)*size; 
    }
    refreshDataFromParent(size,offset){
        const eventRT = new CustomEvent('refreshtable', {
            detail: { 
                type:this.tableType,
                size,
                offset
             }
        });
        this.dispatchEvent(eventRT);
        this.startLoading();
    }
    goToDetail(event){
        const row = event.detail.row;
        const eventToFire = new CustomEvent(
            'requestselected', 
            {
                'detail' : {
                            'sLogId' : row.Id
                            }
                
            }
        ); 
        this.dispatchEvent(eventToFire);
        console.log('SELECTED ROW',row);
    }
    startLoading(){
        this.disableAction=true;
        let formTable=this.template.querySelector(`lightning-datatable`);
        if (formTable) {
            formTable.isLoading = true;
        }
    }
    endLoading(){
        this.disableAction=false;
        let formTable=this.template.querySelector(`lightning-datatable`);
        if (formTable) {
            formTable.isLoading = false;
        }
    }
    handlePreviousStart(){
        this.prev_index=this.pageIndex;
        this.pageIndex=1;
        const size=this.defaultPageSize*this.indexesLength;
        this.refreshDataFromParent(size,this.calculateOffset(this.pageIndex,this.defaultPageSize));
    }
    handlePrevious(){
        
        this.prev_index=this.pageIndex;
        this.pageIndex-=1;
        const size=this.defaultPageSize*this.indexesLength;
        this.refreshDataFromParent(size,this.calculateOffset(this.pageIndex,this.defaultPageSize));
    }
    handleIndexChange(button){
        this.prev_index=this.pageIndex;
        this.pageIndex=+button.target.label;
        const size=this.defaultPageSize*this.indexesLength;
        this.refreshDataFromParent(size,this.calculateOffset(this.pageIndex,this.defaultPageSize));
    }
    handleNext(){
        this.prev_index=this.pageIndex;
        this.pageIndex+=1;
        const size=this.defaultPageSize*this.indexesLength;
        this.refreshDataFromParent(size,this.calculateOffset(this.pageIndex,this.defaultPageSize));
    }
    handleNextEnd(){
        this.prev_index=this.pageIndex;
        this.pageIndex=this.pageIndexes[this.pageIndexes?.length - 1].key;
        const size=this.defaultPageSize*this.indexesLength;
        this.refreshDataFromParent(size,this.calculateOffset(this.pageIndex,this.defaultPageSize));
    }
    handleChangeSize(event){
        this.prev_index=this.pageIndex;
        this.defaultPageSize = +event.detail.value;
        this.pageIndex=1;
        const size=this.defaultPageSize*this.indexesLength;
        this.refreshDataFromParent(size,this.calculateOffset(this.pageIndex,this.defaultPageSize));
    }
    
    
}