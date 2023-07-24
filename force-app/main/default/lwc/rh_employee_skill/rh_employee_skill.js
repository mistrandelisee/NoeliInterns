import { LightningElement,api, wire, track } from 'lwc';
import getSkills from '@salesforce/apex/RH_Users_controller.getEmployeeSkills';
import putSkills from '@salesforce/apex/RH_Users_controller.updateEmployeeSkills';
import { refreshApex } from '@salesforce/apex';
import { labels } from 'c/rh_label';
import {icons} from 'c/rh_icons';

const READ_ONLY = 'view';
const EDIT = 'edit';
const EDITABLE = 'editable';
export default class Rh_employee_skill extends LightningElement {
    @track l={...labels}; @track icon={...icons};
    @api mode;
    @api recordId;
    @api editable;
    @api config;
    @track
    skillCategories=[];
    get ly_xs(){ return this.config?.ly_xs ?  this.config?.ly_xs: '12'; }
    get ly_md(){ return this.config?.ly_md ?  this.config?.ly_md: '4'; }
    get ly_lg(){ return this.config?.ly_lg ?  this.config?.ly_lg: '3'; }
    get readOnly(){
        return  (this.mode===READ_ONLY || !this.mode) 
    }
    get editMode(){
        return this.mode===EDIT
    }
    get is_editable(){
        return this.editable && !this.editMode
    }
    get hasSkill(){return this.skillCategories?.length>0}

    @wire(getSkills, {recordId:'$recordId',readOnly: '$readOnly'})
    skills_callback ({error, data}) {
        console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!skills_callback`);
        if (error) {
            // TODO: Error handling
            console.error('OUTPUT: error');
            console.error(error);
        } else if (data) {
            const self=this;
            this.skillCategories=data.data?.map(function(data) {
                const skillCategory=data;
                let skills=[];
                skillCategory?.skills?.forEach(skill => {
                    if (self.editable || (skill.checked && !self.editable)) {
                        skills.push ({ ...skill, ly_xs: self.ly_xs, ly_md: self.ly_md, ly_lg: self.ly_lg,})
                    }
                });
                // skillCategory.skills=skills;
                return {...skillCategory,skills};
            });
            console.log(`data ` );
            console.log(data );
        }
    }
    handleEdit(){
        this.mode=EDIT;
    }
    // perfom()
    handleCancel(){
        this.mode='';
    }

    handleSave(evt){
        this.newMode = false;
        let record=[];
        let result= this.save();
        if (result.isvalid) {
            
            for (const key in result.obj) {
                if (result.obj[key]===true) {
                    record.push(key);
                }
            }
            // this.emp[TYPE_FIELD_NAME]=this.empType;
            this.callApexSave(JSON.stringify(record));
        }else{
            console.log(`Is not valid `);
        }
        console.log(`record `, record);
    }
    
    callApexSave(infoJson){
        putSkills({ recordId: this.recordId, infoJson: infoJson})
          .then(result => {
            console.log('Result', result);
            this.mode='';
            // refreshApex(this.skills_callback);
            
          })
          .catch(error => {
            console.error('Error:', error);
        });
    }
    save(){
        let isvalid=true;  
        let obj={};

        let forms=this.template.querySelectorAll('c-rh_dynamic_form');
        forms.forEach(function(form){
            
            console.log(form);
            let saveResult=form.save();
            console.log(`>>>>>>>>>>>>saveResult `, saveResult );
            // let outputs = saveResult.outputs;
            isvalid=isvalid && saveResult.isvalid;
            // console.log(`>>>>>>>>>>>>outputs `, outputs );
            obj={...obj,...saveResult.obj};
            // console.log(`>>>>>>>>>>>>obj `, obj );
        });
        
        
        console.log(`{isvalid,obj}` );
        console.log({isvalid,obj} );
        return  {isvalid,obj};
    }
    



    

}