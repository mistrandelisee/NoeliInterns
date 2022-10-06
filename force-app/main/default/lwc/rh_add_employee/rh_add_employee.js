import { LightningElement } from 'lwc';
import addEmployee from '@salesforce/apex/CusLightningSelfRegisterController.addEmployee';
import getMyProfile from '@salesforce/apex/RH_Profile.getMyProfile';
import newUser from '@salesforce/apex/RH_Profile.newUser';
import changeMyPassword from '@salesforce/apex/RH_Profile.changeMyPassword';

export default class Rh_add_employee extends LightningElement {
    emp;
    newEmployeesForm=[
        {
            label:'Last Name',
            placeholder:'this.label.selectOption',
            name:'LastName',
            value: '',
            required:true,
        },
        {
            label:'First Name',
            placeholder:'this.label.selectOption',
            name:'FirstName',
            value: '',
            required:false,
        },
        {
            label:'Email',
            name:'Email',
            required:true,
            value: '',
            placeholder:'Email',
            maxlength:100,
            type:'email',
            ly_md:'6', 
            ly_lg:'6'
        },
        /*
        {
            label:this.label.sottotitoloempta,
            name:SOTTOTITOLO_FIELD_NAME,
            required:true,
            value: '',
            placeholder:this.label.sottotitoloPlaceholder,
            maxlength:40,
            type:'text',
        },
        {
            label:this.label.prezzo,
            name:PREZZO_FIELD_NAME,
            required:true,
            value: '',
            placeholder:this.label.prezzoPlaceholder,
            type:'text',
            maxlength:70,
            pattern:'[0-9]+([\.,][0-9]+)?'
        },
        {
            label:this.label.linkempta,
            name:LINK_FIELD_NAME,
            required:true,
            value: '',
            // maxlength:255,
            placeholder:this.label.linkPlaceholder,
            maxlength:130000,
            type:'url',
            ly_md:'9', 
            ly_lg:'9'
        },
        {
            label:this.label.noteempta,
            name:NOTE_FIELD_NAME,
            value: '',
            required: true,
            // className:'textarea',
            placeholder:this.label.notePlaceholder,
            maxlength:40,
            // type:'textarea',
            ly_md:'9', 
            ly_lg:'9'
        },
        {
            label:this.label.DataInizioValidita,
            name:DATAINIZIO_FIELD_NAME,
            value: '',
            required: true,
            min: new Date().toISOString().split('T')[0],//from check validation
            type:'date',
            placeholder:this.label.datePlaceholder
        },
        {
            label:this.label.desciptionempta,
            name:DESCRIPTION_FIELD_NAME,
            value:'',
            placeholder:this.label.descriptionPlaceholder,
            required: true,
            className:'textarea',
            maxlength:40,
            type:'textarea',
            ly_md:'12', 
            ly_lg:'12'
        }*/

    ]
    createUser(){
        console.log('this.emp ///> ', this.emp);
        //this.isLoading(true);
        newUser({ 
            contactjson: JSON.stringify(this.emp)})//{ con: this.emp }
          .then(result => {
            console.log('Result addEmployee', result);
            if (result.error) {
                // alert(result.message);
                this.showToast('error', 'Error', result.message);
            }else{
                //this.closeModal();
                this.showToast('success', 'success', 'ok');
                // this.sendRefresh();
            }
                
            
          })
          .catch(error => {
            console.error('Error:', error);
        }).finally(()=>{
           // this.isLoading(false);
            });
    }
    showToast(variant, title, message){
        //this.template.querySelector('c-aro_toast').showToast(variant, title, message);
        console.log('variant  ', variant,' title ', title,' message ', message);
    }
    handleSave(evt){
        let result= this.save();
        if (result.isvalid) {
            this.emp={...this.emp,...result.obj};
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            this.createUser();
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
    connectedCallback() {
        getMyProfile()
          .then(result => {
            console.log('getMyProfile >> Result', result);
          })
          .catch(error => {
            console.error('Error:', error);
        });
    }
    updatemyPassword(evt){
        console.log('this.emp ///> ', this.emp);
        //this.isLoading(true);
        changeMyPassword({ 
            contactjson: 'test'})//{ con: this.emp }
          .then(result => {
            console.log('Result updatemyPassword', result);
            if (result.error) {
                // alert(result.message);
                this.showToast('error', 'Error', result.message);
            }else{
                //this.closeModal();
                this.showToast('success', 'success', 'ok');
                // this.sendRefresh();
            }
                
            
          })
          .catch(error => {
            console.error('Error:', error);
        }).finally(()=>{
           // this.isLoading(false);
            });
    }
}