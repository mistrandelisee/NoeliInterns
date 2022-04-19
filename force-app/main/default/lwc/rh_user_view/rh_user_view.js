import { LightningElement, api } from 'lwc';
import { labels } from 'c/rh_label';

export default class Rh_user_view extends LightningElement {
    @api ofNews;
    name;
    l={...labels};

    connectedCallback(){
        console.log('ofNews @@ ' +JSON.stringify(this.ofNews));
        this.name = this.ofNews.LastName + ' ' +this.ofNews.FirstName;
    }

    handleUser(event){
        console.log('event ' +JSON.stringify(event.target.dataset.id))
        var conid = event.target.dataset.id;
        let sendId = new CustomEvent('userid',
        {
            detail: conid
        });
        this.dispatchEvent(sendId);
    }

}