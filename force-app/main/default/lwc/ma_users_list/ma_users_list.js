import { LightningElement, api } from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import getUsersByRole from '@salesforce/apex/MA_UsersController.getUsersByRole';
export default class Ma_users_list extends NavigationMixin(LightningElement) {
    @api role;
    data=[]

    @api columns=[
        {
          label:'name', fieldName:'name',sortable:true,
          type:'button',typeAttributes:{label:{fieldName:'name'},variant:'base'},
          
        },
        {
          label:'gender', fieldName:'gender',
        },
        {
          label:'email', fieldName:'email',type:'email',sortable:true
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
            const {firstname, lastname, email, gender,status,id,createdDate} = e;
            const location= ((e.cityObj) ? e.cityObj.name +' '+e.cityObj.country?.name : '') || e.city
           return  {id,firstname, lastname, email, gender,status,location,
            name: firstname || lastname || email,
            createdDate : createdDate || null
        } 
        }) || [];
    }
    callApex(){
        this.isloading(true);
        getUsersByRole({ role: this.role })
          .then(result => {
            console.log('Result', result);
            if(! result.error){
                this.data=result.data
                console.log(this._data);
            }else{
                alert(result.message);
                if(result.resfreshToken){
                    this.doRefreshToken({action: 'refresh', callback: {method:'getUsersByRole', data: { role: this.role }}});
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
        let elt = JSON.parse(JSON.stringify(event.detail));
        console.log('elt >>>:', elt?.row);
        const id = event.detail?.row.id;
        console.log('id >>>:', id);
        this.navigateNext(id);
    }

    navigateNext(userId) {
        this[NavigationMixin.Navigate]({
            type: "standard__navItemPage",
            attributes: {
            apiName: 'Users',
            }
            ,
            state: {
            c__recordId: userId
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