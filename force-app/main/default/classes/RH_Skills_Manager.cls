public with sharing class RH_Skills_Manager {
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    public RH_Skills_Manager() {

    }
    private static  List<String> skill_ids = new List<String>();
    public static boolean READ_ONLY=true;
    public static Map<String, Object> getSkills(String recordId){
        
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        Schema.SObjectType USER_OBJECT = Schema.User.getSObjectType();
        mapReturn.put('isUser',false);
        try {
            if (String.isBlank(recordId)){
                throw new RH_ControllerException('001','no record id');
            }
            mapReturn.put('input',recordId);
            String query = 'SELECT RH_Skill_Infos__c FROM Contact  WHERE RH_User__c =:recordId OR ID =:recordId ';
            List<Contact> conlist = Database.query(query);
            if (conlist.isEmpty()){
                throw new RH_ControllerException('004','User Not Found');
            }
            // mapReturn.put('Employee',conlist[0]); 
            mapReturn.put('data',getdata(conlist[0].RH_Skill_Infos__c).values()); 


            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }
        return mapReturn;
    }

    public static Map<String, Object>  getdata (String skill_json){
        if (String.isBlank(skill_json)) {
            skill_json='[]';
        }
        Map<String, skillTypeClass> mapReturn = new Map<String, skillTypeClass>();
        skill_ids = (List<String>) JSON.deserialize(skill_json, List<String>.class);
        System.debug('skill_ids >>'+skill_ids);
        for (RH_Skill_Config__mdt skill : RH_Skill_Config__mdt.getAll().values()) {
            String skill_type=skill.rh_type__c?.toLowerCase();
            skillClass current_skill= new skillClass(skill.RH_Full_Label__c, skill.developerName);
            if (!mapReturn.containsKey(skill_type)) {
                    mapReturn.put(skill_type, new skillTypeClass(skill_type));
            }
            skillTypeClass skt= mapReturn.get(skill_type);
            skt.skills.add(current_skill);
        }


        return mapReturn;
        
    }
    
   public class skillTypeClass {
    @AuraEnabled public String type_label;
    @AuraEnabled public String type_name;
    @AuraEnabled public List<skillclass> skills;
    public skillTypeClass(String type_name){
        type_label='';
        this.type_name=type_name;
        skills=new List<skillclass>();
        this.setLabel();
    }
    public void setLabel() {
        this.type_label=this.type_name;//by def
    }
       
   }
   public class skillClass {
        @AuraEnabled public String label;
        @AuraEnabled public String name;
        @AuraEnabled public String type='toggle';
        @AuraEnabled public String ly_lg='2';
        @AuraEnabled public String className='slds-float_right';
        @AuraEnabled public boolean checked;
        @AuraEnabled public boolean disabled=READ_ONLY;

        public skillClass(String label,String name){
            this.label= label;
            this.name= name;
            System.debug('name >>> ' + name);
            checked= skill_ids.contains(name);
        }
       
   }
    
}