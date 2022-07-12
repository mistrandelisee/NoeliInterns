import { LightningElement, wire ,track} from 'lwc';import { NavigationMixin } from 'lightning/navigation';
import getRecordPage from '@salesforce/apex/rh_mainController.getRecordPage';
import { CurrentPageReference } from 'lightning/navigation';

export default class Rh_orchestrator extends NavigationMixin(LightningElement){
    @wire(CurrentPageReference) pageRef;
    @track recordId;
    
    connectedCallback() {
        //code
        this.recordId = this.getUrI(window.location.href, '/detail/');

        console.log('recordID',this.recordId);
        this.gotoAPEX(this.recordId);
    }
    navigateTo(page){
        const url=new URL(window.location.href);
        let path= url.pathname.split('/s/')[0];//--- /NoeliInterns
        path=path+'/s'+page;//--- /NoeliInterns/s<<pagename>>
        url.pathname=path;
        url.searchParams.set('recordId',this.recordId);
        window.location.href = url.href;
    }
    gotoAPEX(){
        getRecordPage({ recordId: this.recordId })
          .then(data => {
            console.log('Rh_orchestrator Result', data);
            if(data.page && !data.error){
                this.navigateTo(data.page);
            }else this.navigateTo('/')
          })
          .catch(error => {
            console.error('Error:', error);
            //go to home
            this.navigateTo('/')
        });
    }

    getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
    }
    getUrI(url,pagenname) {
        try {
            return new URL(url).pathname?.split(pagenname)[1];
        } catch (error) {
            return null;
        }
        
    }
    goToPage(pagenname,statesx={}) {
        let states=statesx; 
        
        this[NavigationMixin.Navigate]({
            type : 'comm__namedPage',
            attributes : {
                pageName : pagenname
            },
            state: states
        });
    }
}