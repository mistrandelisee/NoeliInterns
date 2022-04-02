import { api, LightningElement } from 'lwc';

export default class Rh_display_fields extends LightningElement {
    @api
    title;
    @api
    iconsrc;
    @api
    outputFields;
    @api
    column;
    @api
    hasAction;

    @api
    actionAvailable;
    @api
    footerText
    get hasFieldsRows(){
       return this.outputFields?.length >1;
    }
    get hasFooterText(){
        return this.footerText?.text;
    }

    get getFieldsRows(){
        let outfields=[];
        let outrows=[];
        let i=1;
        for (let index = 0; index < this.outputFields.length; index++) {
            const field = this.outputFields[index];
            outrows.push(field);
            
            if (i==(+this.column) || index == this.outputFields.length-1) {//if second pair or last elt
                outfields.push({index,fields:outrows});
                outrows=[];
                i=0;
            }
            i=i+1;
        }
        console.log(`outfields  `, outfields );
        return outfields;
    }
    initDefaultAction(){
        this.actionAvailable= this.actionAvailable || [
            {
                variant:"base",
                label:"Edit",
                name:"Edit",
                title:"Looks like a link",
                iconName:"utility:edit",
                class:"slds-m-left_x-small"
            },
        ];
        this.actionAvailable=  this.actionAvailable.map(function(elt){
            return {...elt, class: 'slds-m-left_x-small '+elt.class};
        })
    }
    initDefault(){
        this.title=this.title || 'User Informations';
        this.iconsrc= this.iconsrc || 'utility:people';
        this.column= this.column || 2;
        this.outputFields=this.outputFields || [
            {
                label:'Last Name',
                placeholder:'Enter your Last Name',
                name:'LastName',
                value: 'Miatrsn',
                required:true,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'First Name',
                placeholder:'Enter your First Name',
                name:'FirstName',
                value: '',
                required:false,
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Email',
                name:'Email',
                required:true,
                value: '',
                placeholder:'Email',
                maxlength:100,
                type:'email',
                ly_md:'12', 
                ly_lg:'12'
            },
            {
                label:'Phone',
                placeholder:'Enter your First Name',
                name:'FirstName',
                value: '',
                required:false,
                ly_md:'12', 
                ly_lg:'12'
            }
        ];
    }
    connectedCallback(){
       // this.initDefault();
       this.initDefaultAction();
    }
    handleClick(event){
        let actionName=event.currentTarget.dataset.actionName;
        var actionEvt =new CustomEvent('action',
         {detail: { action : actionName }}
      );
      console.log("Watch: actionName ->"+actionName); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }



}