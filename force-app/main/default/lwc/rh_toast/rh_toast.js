import { api, LightningElement, track } from 'lwc';
import RH_Icons from '@salesforce/resourceUrl/RH_Icons';
const SUCCESS_VARIANT='success';
const WARNING_VARIANT='warning';
const ERROR_VARIANT='error';
export default class RH_toast extends LightningElement {
    @track title
    @track type = '';
    @track message;
    @track showToastBar = false;
    @api autoCloseTime = 5000;

    @api
    showToast(type, title, message) {
        this.type = type;
        this.message = message;
        this.showToastBar = true;
        this.title = title;
        setTimeout(() => {
            this.closeModel();
        }, this.autoCloseTime);
    }

    closeModel() {
        this.showToastBar = false;
        this.type = '';
        this.message = '';
    }

    get getIconName() {
        debugger
        console.log('@@@RH_Icons' + RH_Icons);
        var icon = '';
        if (this.type)
            if (this.type.toLowerCase() == ERROR_VARIANT.toLowerCase())
                icon = RH_Icons + '/Icons/' + 'conferma_check.svg';
            else if (this.type.toLowerCase() == SUCCESS_VARIANT.toLowerCase())
                icon = RH_Icons + '/Icons/' + 'conferma_check.svg';
            else if (this.type.toLowerCase() == WARNING_VARIANT.toLowerCase())
                icon = RH_Icons + '/Icons/' + 'conferma_check.svg';
        return icon;
    }

    get innerClass() {

        return 'slds-icon_container slds-icon-utility-' + this.type + ' slds-icon-utility-success slds-m-right_small slds-no-flex slds-align-middle ';
    }

    get outerClass() {
        var bacground = '';
        if (this.type)
            if (this.type.toLowerCase() == ERROR_VARIANT.toLowerCase())
                bacground = 'errorColor';
            else if (this.type.toLowerCase() ==SUCCESS_VARIANT.toLowerCase())
                bacground = 'succesColor'
            else if (this.type.toLowerCase() ==WARNING_VARIANT.toLowerCase())
                bacground = 'warningColor'
        return 'slds-notify slds-notify_toast float_right slds-theme_' + this.type + ' ' + bacground;
    }
}