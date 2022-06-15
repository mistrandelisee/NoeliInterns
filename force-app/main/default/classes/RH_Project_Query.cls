public class RH_Project_Query {
    /** The class instance */
    private static RH_Project_Query instance = null;

     /**
     * @description @return the class instance
     */
    public static RH_Project_Query getInstance() {

        if(instance == null) {

            instance = new RH_Project_Query();
        }
        return instance;
    }

    public List<Project__c> getProject(){
        return [SELECT id, Name, Description__c,End_Date__c,Link__c,Status__c,Start_Date__c,Project_Manager__r.Name,Project_Manager__c FROM Project__c WHERE recordTypeId=:RH_Constans.RH_PROJECT_RT];
    }

    public List<Project__c> getProjectById(String IdProject){
        return [SELECT id, Name, Description__c,End_Date__c,Link__c,Status__c,Start_Date__c,Project_Manager__r.Name,Project_Manager__c,Project_Manager__r.RH_User__c  FROM Project__c WHERE Id =:IdProject and recordTypeId=:RH_Constans.RH_PROJECT_RT];
    }

    public List<RH_Participation__c> getMembers(String IdProject){//NON NON le type de retour doit essentiellement etre Project__c puisque c'est la classe query de project
    //creer une RH_Participation__c query classe svp
        return [SELECT id,RH_Contact__c, RH_Contact__r.Name,RH_Contact__r.Email,RH_Contact__r.RH_User__c FROM RH_Participation__c WHERE RH_Project__c = :IdProject];
    }

    public List<RH_Participation__c> getParticipate(List<String> contactId){//NON NON le type de retour doit essentiellement etre Project__c puisque c'est la classe query de project
    //creer une RH_Participation__c query classe svp
        return [SELECT id, RH_Contact__c,RH_Project__c FROM RH_Participation__c WHERE RH_Contact__c IN :contactId];
    }

    public List<Contact> getNotMembers(String IdProject,String Idmanager){//NON NON le type de retour doit essentiellement etre Project__c puisque c'est la classe query de project
    // mettez directement cette methode dans la classe query de contact 
        List<RH_Participation__c> ldt= [SELECT id, RH_Contact__c FROM RH_Participation__c WHERE RH_Project__c = :IdProject or RH_Contact__c = :Idmanager];
        // List<RH_Participation__c> ldt= getMembers(IdProject);
        List<String> lstr = new List<String>();
        for (RH_Participation__c vare : ldt) {
            lstr.add(vare.RH_Contact__c);
        }
        return [SELECT id, Name,Email FROM Contact WHERE Id NOT IN :lstr AND recordTypeId=:RH_Constans.RH_CONTACT_RT AND RH_Status__c=:RH_Constans.ACTIVATED_CONTACT_STATUS];
    }
    //EM 27-04-2022 19:24
    public List<Project__c> getActiveProjects(){
        return [SELECT Id, Name, Description__c,End_Date__c,Link__c,Status__c,Start_Date__c,Project_Manager__r.Name,Project_Manager__c FROM Project__c WHERE Status__c=:RH_Constans.ACTIVATED_PROJECT_STATUS ];
    }
}