import { LightningElement, api } from 'lwc';
import firebaseRS from '@salesforce/resourceUrl/firebase';
import { updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import Id from '@salesforce/user/Id';
export default class Ma_register extends LightningElement {
    userId = Id;
    @api emp={
        email:'mistrandelisee@gmail.com',
        password:'trefdgfggh'
    };
    _scriptLoaded;
    firebase={}
    app={}
    isLoggedIn;
    get notReady(){
        return !this._scriptLoaded
    }
    isModal=true;
    closeModal(){
        this.isModal=false;
    }
    handleCancel(){
        this.closeModal();
        this.callParent('close',{create:false})
    }
    callParent(action,detail){
        var actionEvt =new CustomEvent(action, {detail} );
        this.dispatchEvent(actionEvt); 
    }
    renderedCallback(){
        if(!this._scriptLoaded) {
            this.loadFirebase();
        }
    }
    
    loadFirebase(){

        Promise.all([
            loadScript(this, firebaseRS + '/firebase-app-compat.min.js'),
            loadScript(this, firebaseRS + '/firebase-auth-compat.min.js'),
            // loadScript(this, firebaseRS + '/lib3.js')
        ]).then(() => { 
            console.log('1111111111111 firebase JS loaded successfully');
            this._scriptLoaded=true
            this.firebase=window.firebase;
            this.initFireApp()
         });
    }
    initFireApp(){
        const firebaseConfig = {
            apiKey: "AIzaSyBdXT47g8fYnMPT9wCNL5h7sEHniN5yTd4",
            authDomain: "plexiform-being-384211.firebaseapp.com",
            projectId: "plexiform-being-384211",
            storageBucket: "plexiform-being-384211.appspot.com",
            messagingSenderId: "824833644826",
            appId: "1:824833644826:web:0335d1e70ccfcbf11974a3"
          };
          
        // Initialize Firebase
        this.app=this.firebase.initializeApp(firebaseConfig);
        
        
        // Initialize Firebase Authentication and get a reference to the service
        this.firebase.auth(this.app);
    } 
    register(){
        console.log('................register');
        const auth = this.firebase.app().auth();
        this.firebase.app().auth().createUserWithEmailAndPassword('mistrand@test.lwc', 'test!01')
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log('registered user :');
            console.log(user);
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            console.error(error);
            // ..
        });

    }
    
    updatToken(token,uid){
        console.log('------------------------ updatToken userId :' + this.userId, 'updatToken user' + token);
        const recordInput = { fields:{
            "Id": this.userId,
            "MA_Token__c": token,
            "MA_Username__c": this.emp.email,
            "MA_UserId__c": uid,
            "MA_Password__c": this.emp.password

        } };

        updateRecord(recordInput)
          .then(() => {
            this.dispatchEvent(
              new ShowToastEvent({
                title: "Success",
                message: "Contact updated",
                variant: "success",
              }),
            );
            this.closeModal();
            this.callParent('close',{create:true})
            // Display fresh data in the form
            return true;
          })
          .catch((error) => {
            this.dispatchEvent(
              new ShowToastEvent({
                title: "Error updating token ",
                message: error.body.message,
                variant: "error",
              }),
            );
          });
    
    }
    signUser(){
        const username=this.emp.email   
        const pass=this.emp.password  
        const self=this; 
        this.firebase.app().auth().signInWithEmailAndPassword(username,pass)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            user.getIdToken(true)
                .then((token)=>{
                    console.log(token);

                   
                    return  self.updatToken(token, user.uid);
                })
                .catch((e)=>{
                    console.log('getIdToken error');
                    console.error(e); 
                })
            console.log('registered user :');
            console.log(user);
            return true;
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            console.error(error);
            // ..
        });
    }
    login(evt){
        let result= this.save();
        if (result.isvalid) {
            this.emp={...this.emp,...result.obj};
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            this.signUser();
        }else{
            console.log(`Is not valid `);
        }
        console.log(`emp`, this.emp);
    }
    save(){
        let form=this.template.querySelector('c-rh_dynamic_form');
        console.log(form);
        let isvalid=true;  
        let obj={};
        
        let saveResult=form.save();
        console.log(`>>>>>>>>>>>>saveResult `, saveResult );
        let outputs = saveResult.outputs;
        isvalid=isvalid && saveResult.isvalid;
        console.log(`>>>>>>>>>>>>outputs `, outputs );
        obj=saveResult.obj;
        console.log(`>>>>>>>>>>>>obj `, obj );
        return  {isvalid,obj};
    }

    loginForm=[
        
        {
            label:'Email',
            name:'email',
            required:true,
            value: this.emp?.email,
            placeholder:'Email',
            maxlength:100,
            type:'email',
            ly_md:'6', 
            ly_lg:'6'
        },
        {
            label:'Password',
            placeholder:' ',
            name:'password',
            type:'password',
            value: this.emp?.password,
            required:true,
            ly_md:'6', 
            ly_lg:'6'
        },
        

    ]

}