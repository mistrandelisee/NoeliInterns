import { LightningElement, track } from 'lwc';
import forgotP from '@salesforce/apex/RH_ForgotPassword.forgotPassword';
export default class rh_forgotPassword extends LightningElement {
    @track userName='';
    message = false;
    finalWay = false;
    text = '';
    // mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    handleClick(){
        this.userName = this.template.querySelector(".userName").value;
        console.log('eeeeeeeeeee',this.userName);
        if (this.userName=='') {
            this.text= 'Please enter your user name';
            this.message=true;
        }else{
            this.text= null;
            console.log('good username',this.userName);

            forgotP({ userName: this.userName})
            .then((result) => {
                this.message=false;
                this.text= 'We have send an Email to you, it content your new password, Please check your email to connect yourselft';
                this.finalWay = true;
                console.log('rrrrrrrrrrrrrrrrr',result);
            })
            .catch((error) => {
                this.text= 'your useName is not correct or your account do not exist!!!';
                this.message=true;
                
                console.log('the errrroorrr is',error);
            })
        }
    }
}