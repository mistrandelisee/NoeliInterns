import { LightningElement, api, wire} from 'lwc';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';


export default class Rh_back_buttom extends LightningElement {
    @api title;
    @wire(CurrentPageReference) pageRef;

    handleClick(event){      
        const x=2;
        event.preventDefault();
        fireEvent(this.pageRef, 'backbuttom', {x});
    }
}