import { LightningElement,wire } from 'lwc';
import { registerListener, unregisterAllListeners,fireEvent } from 'c/pubsub';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';

export default class Rh_notif extends NavigationMixin(LightningElement) {
    @wire(CurrentPageReference)
    pageRef;
    modalTitle='';
    showmodal=false;
    modalText='';
    modalClass='';
    modalStyle='';
    modalActions='';
    connectedCallback() {
		registerListener('Spinner', this.doSpinner, this);
		registerListener('Toast', this.doToast, this);
		registerListener('Modal', this.doModal, this);
		registerListener('ModalAction', this.doModalAction, this);
	}
    doSpinner(event){
		let start=event.start;
		this.startSpinner(start);
	}
    doToast(event){
		let start=event.start;

        let variant=event.variant, title=event.title, message=event.message;
		this.showToast(variant, title, message);
	}
    doModal(event){
        this.modalActions=event.actions;
        this.modalText=event.text;
        this.showmodal=event.show;
        this.modalClass=event.extra?.class;
        this.modalStyle=event.extra?.style;
        this.modalTitle=event.extra?.title;
	}
    doModalAction(event){
        if (event.action=="CANCEL") {
            this.showmodal=false;
        }
    }

    startSpinner(b){
        let spinner=this.template.querySelector('c-rh_spinner');
        if (b) {    spinner?.start(); }
            else{   spinner?.stop();}
    }
    showToast(variant, title, message){
        let toast=this.template.querySelector('c-rh_toast');
        toast?.showToast(variant, title, message);
    }
}