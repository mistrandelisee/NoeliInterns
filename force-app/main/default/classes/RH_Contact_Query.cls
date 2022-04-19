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
        return [SELECT LastName,AccountId,RH_Role__c, FirstName,RH_User__c,Email,MailingCity,Languages__c,RH_Extra_Infos__c ,RH_Number_Groups_Leaded__c,OtherAddress,Birthdate,Phone,Description,
                    Account.Name,Account.NumberOfEmployees,Account.Website,Account.Phone,Account.Description,Account.YearStarted,Account.Industry,
                    RH_WorkGroup__r.Name,RH_WorkGroup__r.CreatedDate,RH_WorkGroup__r.RH_Team_Leader__r.Phone,RH_WorkGroup__r.RH_Team_Leader__r.name,
                    (SELECT Name,CreatedDate,CreatedBy.Name FROM WorkGroups_Leader__r WHERE RH_Status__c =:RH_Constans.ACTIVATED_WORKGROUP_STATUS )
                    FROM Contact WHERE Id=:contactId];
    }

    public  List<Contact> getContact(List<String> listcontactId){
        return [SELECT Id, LastName,AccountId,RH_Role__c, FirstName,RH_User__c,Email,MailingCity,Languages__c,RH_Extra_Infos__c ,RH_Number_Groups_Leaded__c,OtherAddress,Birthdate,Phone,Description,
                Account.Name,Account.NumberOfEmployees,Account.Website,Account.Phone,Account.Description,Account.YearStarted,Account.Industry,
                RH_WorkGroup__r.Name,RH_WorkGroup__r.CreatedDate,RH_WorkGroup__r.RH_Team_Leader__r.Phone,RH_WorkGroup__r.RH_Team_Leader__r.name,
                (SELECT Name,CreatedDate,CreatedBy.Name FROM WorkGroups_Leader__r WHERE RH_Status__c =:RH_Constans.ACTIVATED_WORKGROUP_STATUS )
                FROM Contact WHERE Id IN :listcontactId];

    }

    public  List<Contact> getExtrafied(String recordId){
        return [SELECT Id,RH_Extra_Infos__c FROM Contact WHERE id=:recordId];
    }

    public  List<Contact> getAllContact(){
        return [SELECT Id,Name FROM Contact  WHERE RH_Role__c=:RH_Constans.RH_Map_RoleName.get('CEO') or RH_Role__c=:RH_Constans.RH_Map_RoleName.get('Team Leader')];
    }
    public  List<Contact> getEligibleTeamLeaders(){
        List<string> TL_roles = new List<string>{
            'Team Leader','CEO'
        };
        return [ SELECT Id, Name FROM Contact WHERE RH_Role__c IN :TL_roles AND recordTypeId=:RH_Constans.RH_CONTACT_RT];
    }
    public  List<Contact> getAllContactInitial(){
        return [SELECT Id,Name FROM Contact];
    }

    public List<Account> getAccountId(){
        return [Select Id,Name from Account where OwnerId = : UserInfo.getUserId()];
    }
}