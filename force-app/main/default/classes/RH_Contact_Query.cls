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
}
