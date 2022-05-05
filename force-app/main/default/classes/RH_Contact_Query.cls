public  class RH_Contact_Query {
    /** The class instance */
    private static RH_Contact_Query instance = null;

    /**
     * @description @return the class instance
     */
    public static RH_Contact_Query getInstance() {

        if(instance == null) {

            instance = new RH_Contact_Query();
        }
        return instance;
    }

    public List<Contact> getContactById(String contactId) {
        return [SELECT Name,LastName,AccountId,toLabel(RH_Role__c) RoleLabel,RH_Started_Date__c,RH_Role__c, FirstName,RH_User__c,Email,MailingCity,Languages__c,RH_Extra_Infos__c ,RH_Number_Groups_Leaded__c,OtherAddress,Birthdate,Phone,Description,RH_Status__c,
                    Account.Name,Account.NumberOfEmployees,Account.Website,Account.Phone,Account.Description,Account.YearStarted,Account.Industry,
                    RH_WorkGroup__r.Name,RH_WorkGroup__r.CreatedDate,RH_WorkGroup__r.RH_Team_Leader__r.Phone,RH_WorkGroup__r.RH_Team_Leader__c,RH_WorkGroup__r.RH_Team_Leader__r.name,
                    (SELECT Name,CreatedDate,CreatedBy.Name FROM WorkGroups_Leader__r WHERE RH_Status__c =:RH_Constans.ACTIVATED_WORKGROUP_STATUS ),
                    (SELECT RH_Project__r.Name,RH_Project__r.Link__c,RH_Project__r.Start_Date__c,RH_Project__r.Description__c,RH_Project__r.End_Date__c  FROM Projects__r WHERE RH_Project__r.Status__c =:RH_Constans.ACTIVATED_PROJECT_STATUS)
                    FROM Contact WHERE Id=:contactId];
    }

    public  List<Contact> getContact(List<String> listcontactId){
        return [SELECT Id, LastName,AccountId,toLabel(RH_Role__c) RoleLabel,RH_Started_Date__c,RH_Role__c, FirstName,RH_User__c,Email,MailingCity,Languages__c,RH_Extra_Infos__c ,RH_Number_Groups_Leaded__c,OtherAddress,Birthdate,Phone,Description,RH_Status__c,
                Account.Name,Account.NumberOfEmployees,Account.Website,Account.Phone,Account.Description,Account.YearStarted,Account.Industry,
                RH_WorkGroup__r.Name,RH_WorkGroup__r.CreatedDate,RH_WorkGroup__r.RH_Team_Leader__r.Phone,RH_WorkGroup__r.RH_Team_Leader__c,RH_WorkGroup__r.RH_Team_Leader__r.name,
                (SELECT Name,CreatedDate,CreatedBy.Name FROM WorkGroups_Leader__r WHERE RH_Status__c =:RH_Constans.ACTIVATED_WORKGROUP_STATUS ),
                (SELECT RH_Project__r.Name,RH_Project__r.Link__c,RH_Project__r.Start_Date__c,RH_Project__r.Description__c,RH_Project__r.End_Date__c  FROM Projects__r WHERE RH_Project__r.Status__c =:RH_Constans.ACTIVATED_PROJECT_STATUS)
                FROM Contact WHERE Id IN :listcontactId  Order by CreatedDate DESC];

    }
    public  Map<Id,Contact> getAllContacts(){
        Map<Id, Contact> mapContacts=new Map<Id, Contact>( [SELECT Id, LastName,AccountId,toLabel(RH_Role__c) RoleLabel,RH_Started_Date__c,RH_Role__c, FirstName,RH_User__c,Email,MailingCity,Languages__c,RH_Extra_Infos__c ,RH_Number_Groups_Leaded__c,OtherAddress,Birthdate,Phone,Description,RH_Status__c,
                Account.Name,Account.NumberOfEmployees,Account.Website,Account.Phone,Account.Description,Account.YearStarted,Account.Industry,
                RH_WorkGroup__r.Name,RH_WorkGroup__r.CreatedDate,RH_WorkGroup__r.RH_Team_Leader__r.Phone,RH_WorkGroup__r.RH_Team_Leader__r.name,
                (SELECT Name,CreatedDate,CreatedBy.Name FROM WorkGroups_Leader__r WHERE RH_Status__c =:RH_Constans.ACTIVATED_WORKGROUP_STATUS ),
                (SELECT RH_Project__r.Name,RH_Project__r.Link__c,RH_Project__r.Start_Date__c,RH_Project__r.Description__c,RH_Project__r.End_Date__c  FROM Projects__r WHERE RH_Project__r.Status__c =:RH_Constans.ACTIVATED_PROJECT_STATUS)
                FROM Contact 
                WHERE recordTypeId=:RH_Constans.RH_CONTACT_RT Order by CreatedDate DESC]);
        
        return mapContacts;

    }
    public  List<Contact> getExtrafied(String recordId){
        return [SELECT Id,RH_Extra_Infos__c FROM Contact WHERE id=:recordId];
    }

    public  List<Contact> getEligibleTeamMembers(){
        List<string> TL_roles = new List<string>{
            'Team Leader','CEO'
        };
        return [ SELECT Id, Name FROM Contact WHERE RH_Role__c IN :TL_roles AND recordTypeId=:RH_Constans.RH_CONTACT_RT AND RH_Status__c=:RH_Constans.ACTIVATED_CONTACT_STATUS];
    }
    public  List<Contact> getEligibleAddressedTo(){
        List<string> TL_roles = new List<string>{
            'Team Leader','CEO','Ressource Manager'
        };
        return [ SELECT Id, Name FROM Contact WHERE RH_Role__c IN :TL_roles AND recordTypeId=:RH_Constans.RH_CONTACT_RT AND RH_Status__c=:RH_Constans.ACTIVATED_CONTACT_STATUS];
    }
    public  List<Contact> getEligibleTeamLeaders(){
        List<string> TL_roles = new List<string>{
            'Team Leader','CEO'
        };
        return [ SELECT Id, Name FROM Contact WHERE RH_Role__c IN :TL_roles AND recordTypeId=:RH_Constans.RH_CONTACT_RT AND RH_Status__c=:RH_Constans.ACTIVATED_CONTACT_STATUS];
    }
    public  List<Contact> getAllContactInitial(){
        return [SELECT Id,Name FROM Contact WHERE recordTypeId=:RH_Constans.RH_CONTACT_RT AND RH_Status__c=:RH_Constans.ACTIVATED_CONTACT_STATUS];
    }

    public List<Contact> getAccountId(String rh_contactId){
        return [Select Id,Name,AccountId from Contact where Id = : rh_contactId];
    }
    
    public static List<Contact> getContactForGroup(){
        return [SELECT Id,Name,RH_WorkGroup__c FROM Contact  WHERE RH_Role__c=:RH_Constans.RH_Map_RoleName.get('Base User')];
    }

}