import { LightningElement } from 'lwc';
import firebaseRS from '@salesforce/resourceUrl/firebase';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
export default class Ma_register extends LightningElement {
    _scriptLoaded;
    firebase={}
    app={}
    get notReady(){
        return !this._scriptLoaded
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

}