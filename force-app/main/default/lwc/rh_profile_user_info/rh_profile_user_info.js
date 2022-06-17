import { api, LightningElement, track } from 'lwc';
import { labels } from 'c/rh_label';
import {icons} from 'c/rh_icons';
const EDIT_ACTION='Edit';
const SAVE_ACTION='Save';
const LINK_ACTION='GOTO';
const FROMINFO='USER-INFO';
export default class Rh_profile_user_info extends LightningElement {
    @track l={...labels};
    @track icon={...icons};
    @api
    title
    @api
    fieldInputs;
    @api
    fieldOutputs;
    @api
    action;
    actionAvailable=[];
    get helpText(){ return this.l?.userInfoHlp || 'View user details'}
    get editHelpText(){ return this.l?.userEditHlp || 'Edit user details'}
    handleAction(event){
        
        const data=event.detail;
        console.log(`data ?? `, JSON.stringify(data));
        if (data?.action=='goToLink') {
                const record={
                    eltName:data?.eltName,//is the link name
                    recordId:data?.info?.dataId// recordid bind to his link
                };
                this.callParent(LINK_ACTION,record)
        }else{
            this.action=event.detail.action;
        }
    }
    get editMode(){
        return this.action==EDIT_ACTION;
    }
    initDefault(){
        this.fieldInputs=this.fieldInputs || [
            /*{
                label:'Last Name',
                placeholder:'Enter your Last Name',
                name:'LastName',
                value: 'Miatrsn',
                required:true,
                ly_md:'6', 
                ly_lg:'6'
            },
            {
                label:'First Name',
                placeholder:'Enter your First Name',
                name:'FirstName',
                value: '',
                required:false,
                ly_md:'6', 
                ly_lg:'6'
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
            {
                label:'Phone',
                placeholder:'Enter your First Name',
                name:'FirstName',
                value: '',
                required:false,
                ly_md:'6', 
                ly_lg:'6'
            }*/
        ];
        this.fieldOutputs=this.fieldOutputs || [
           /* {
                label:'Last Name',
                name:'LastName',
                value: 'Miatrsn'
                
            },
            {
                label:'First Name',
                name:'FirstName',
                value: '',
            },
            {
                label:'Email',
                name:'Email',
                value: '',
            },
            {
                label:'Phone',
                name:'FirstName',
                value: '',
            }*/
        ];
    }
    connectedCallback(){
        console.log(`icon`, this.icon);
        //this.initDefault();
        this.actionAvailable =[
            {
                variant:"base",
                label:this.l.Edit,
                name:"Edit",
                title:this.l.Edit,
                iconName:this.icon.Edit,
                class:" icon-md slds-m-left_x-small"
            },
        ];
     }

    handleCancel(){
        this.action='';
    }
    handleSave(evt){
        let record={};
        let result= this.save();
        if (result.isvalid) {
            record={...record,...result.obj};
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            console.log(`record `, record);

            this.callParent(SAVE_ACTION,record)
        }else{
            // console.log(`Is not valid `);
        }
    }
    save(){
        let form=this.template.querySelector('c-rh_dynamic_form');
        console.log(form);
        let isvalid=true;  
        let obj={};
        
        let saveResult=form.save();
        isvalid=isvalid && saveResult.isvalid;
        obj=saveResult.obj;
        console.log(`>>>>>>>>>>>>obj `, obj );
        return  {isvalid,obj};
    }

    callParent(actionName,data){
        var actionEvt =new CustomEvent('action',
         {detail: { action : actionName,from:FROMINFO,data }}
      );
    //   console.log("Watch: actionName ->"+actionName); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }
    @api
     cancel(){
        this.action='';
     }
}