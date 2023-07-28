import { LightningElement, api } from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import getAlltransferts from '@salesforce/apex/MA_RequestController.getAlltransferts';
import { labels } from 'c/rh_label';
export default class Ma_requests_list extends NavigationMixin(LightningElement) {
    l={...labels,}
    @api role;
    data=[]

    @api columns=[
        {
          label:this.l.Name, fieldName:'name',sortable:true,
          type:'button',typeAttributes:{label:{fieldName:'name'},variant:'base',name:'Name'},
          
        },
        { label: this.l.amount, fieldName: 'amount',sortable:true, type: 'currency',
            typeAttributes: { currencyCode: { fieldName: 'inCurrency' }, step: '0.001' },
            cellAttributes: { alignment: 'left' }, }
        ,
        {
          label:this.l.Owner, fieldName:'owner',sortable:true,
          type:'button',typeAttributes:{label:{fieldName:'owner'},variant:'base',name:'Owner'},
        },
        {
          label:'codeReception', fieldName:'codeReception',sortable:true
        },
        {
          label:'status', fieldName:'status',
        },
    
        {
          label:'created Date', fieldName:'createdDate', type:'datetime',sortable:true
        },
      ]
    connectedCallback(){
        this.callApex();
    }
    get showTable() {
        return this._data.length > 0
    }
    get _data(){
        return this.data?.map((e)=>{
            const {LastTimeInPending, amount, codeReception, ownerId,status,id,createdDate} = e;
            const inLocation= ((e.inZone) ? e.inZone.name +' '+e.inZone.country?.name : '') || e.inZone?.currency
            const inCurrency= e.inZone?.country?.currency ||''
            const outLocation= ((e.outZone) ? e.outZone.name +' '+e.outZone.country?.name : '') || e.outZone?.currency
            const owner= ((e.owner) ? e.owner.firstname +' '+e.owner.lastname : '') || e.ownerId
           return  {LastTimeInPending, amount, codeReception, ownerId,status,id,inLocation,
                        inCurrency,
                        outLocation,
                        owner,
                        name: codeReception || (inLocation +' - >'+outLocation) || email,
                        createdDate : createdDate ? new Date(createdDate) : null
        } 
        }) || [];
    }
    callApex(){
        this.isloading(true);
        getAlltransferts()
          .then(result => {
            console.log('Result', result);
            if(! result.error){
                this.data=result.data
                console.log(this._data);
            }else{
                alert(result.message);
                if(result.resfreshToken){
                    this.doRefreshToken({action: 'refresh', callback: {method:'getAlltransferts', data: { }}});
                }
    
            }
          })
          .catch(error => {
            console.error('Error:', error);
        })
        .finally(() => {
            this.isloading(false);
        });
    }
    handleRowAction( event ) {
        console.log(event.detail.action);
        let elt = JSON.parse(JSON.stringify(event.detail.row));
        console.log('elt >>>:', elt);
        const id = event.detail?.row.id;
        console.log('id >>>:', id);
        if(event?.detail?.action?.name=='Owner') return this.navigateToUser(elt?.ownerId)
        return this.navigateNext(id)
        // this.navigateNext(id);
    }

    navigateToUser(userId) {
        this[NavigationMixin.Navigate]({
            type: "standard__navItemPage",
            attributes: {
                apiName: 'Users',
            }
            ,
            state: {
            c__recordId: userId,
            c__returnUrl: 'Requests',
            }
        });
    }
    navigateNext(requestId) {
        this[NavigationMixin.Navigate]({
            type: "standard__navItemPage",
            attributes: {
            apiName: 'Requests',
            }
            ,
            state: {
            c__recordId: requestId
            }
        });
    }
    isloading(b){
        var actionEvt =new CustomEvent('loading', {detail:b} );
        this.dispatchEvent(actionEvt);
    }
    doRefreshToken(detail){
        var actionEvt =new CustomEvent('refreshtoken', {detail} );
        this.dispatchEvent(actionEvt);
    }
}