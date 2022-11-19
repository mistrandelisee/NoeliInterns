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
        return [SELECT Name,LastName,AccountId,toLabel(RH_Role__c) RoleLabel,RH_Started_Date__c,RH_Role__c, FirstName,RH_User__c,Email,MailingCity,MailingCountry,MailingStreet,MailingState,MailingPostalCode,Languages__c,RH_Extra_Infos__c ,RH_Number_Groups_Leaded__c,OtherAddress,Birthdate,Phone,Description,RH_Status__c,toLabel(RH_Status__c) statusLabel,
                    Account.Name,Account.NumberOfEmployees,Account.Website,Account.Phone,Account.Description,Account.YearStarted,Account.Industry,
                    RH_WorkGroup__r.Name,RH_WorkGroup__r.CreatedDate,RH_WorkGroup__r.RH_Team_Leader__r.Phone,RH_WorkGroup__r.RH_Team_Leader__c,RH_WorkGroup__r.RH_Team_Leader__r.name,RH_WorkGroup__r.RH_Team_Leader__r.RH_User__c,
                    (SELECT Name,CreatedDate,CreatedBy.Name FROM WorkGroups_Leader__r WHERE RH_Status__c =:RH_Constans.ACTIVATED_WORKGROUP_STATUS ORDER BY CreatedDate DESC),
                    (SELECT RH_Project__r.Name,RH_Project__r.Link__c,RH_Project__r.Start_Date__c,RH_Project__r.Description__c,RH_Project__r.End_Date__c,RH_Project__r.recordType.developerName  FROM Projects__r WHERE RH_Project__r.Is_Effective__c =true  AND (RH_Project__r.recordTypeId=:RH_Constans.RH_PROJECT_RT OR RH_Project__r.recordTypeId=:RH_Constans.RH_PROJECT_EXTRA_RT) ORDER BY CreatedDate DESC),
                    (SELECT Name,Link__c,Start_Date__c,Description__c,End_Date__c  FROM Projects_Leaded__r WHERE Is_Effective__c =true AND recordTypeId=:RH_Constans.RH_PROJECT_RT ORDER BY CreatedDate DESC),
                    (SELECT Id ,TimeSheetNumber, RH_Name__c FROM RH_TimeSheets__r ORDER BY CreatedDate DESC),
                    (SELECT Id ,Name, RH_Title__c FROM Accomplishments__r WHERE RH_Status__c=:RH_Constans.ACTIVATED_ACCOMPLISHMENT_STATUS AND RH_Visibility__c=true ORDER BY CreatedDate DESC)
                FROM Contact WHERE Id=:contactId];
    }

    public  List<Contact> getContact(List<String> listcontactId){
        return [SELECT Id, Name, LastName,AccountId,toLabel(RH_Role__c) RoleLabel,RH_Started_Date__c,RH_Role__c, FirstName,RH_User__c,Email,MailingCity,Languages__c,RH_Extra_Infos__c ,RH_Number_Groups_Leaded__c,OtherAddress,Birthdate,Phone,Description,RH_Status__c,toLabel(RH_Status__c) statusLabel,
                Account.Name,Account.NumberOfEmployees,Account.Website,Account.Phone,Account.Description,Account.YearStarted,Account.Industry,
                RH_WorkGroup__r.Name,RH_WorkGroup__r.CreatedDate,RH_WorkGroup__r.RH_Team_Leader__r.Phone,RH_WorkGroup__r.RH_Team_Leader__c,RH_WorkGroup__r.RH_Team_Leader__r.name,RH_WorkGroup__r.RH_Team_Leader__r.RH_User__c,
                (SELECT Name,CreatedDate,CreatedBy.Name FROM WorkGroups_Leader__r WHERE RH_Status__c =:RH_Constans.ACTIVATED_WORKGROUP_STATUS ),
                (SELECT RH_Project__r.Name,RH_Project__r.Link__c,RH_Project__r.Start_Date__c,RH_Project__r.Description__c,RH_Project__r.End_Date__c  FROM Projects__r WHERE RH_Project__r.Is_Effective__c =true)
                FROM Contact WHERE Id IN :listcontactId  Order by CreatedDate DESC];

    }
    public  Map<Id,Contact> getAllContacts(){
        Contact currentContact = RH_Utility.getCurentContact();
        Map<Id, Contact> mapContacts=new Map<Id, Contact>( [SELECT Id, LastName,AccountId,toLabel(RH_Role__c) RoleLabel,RH_Started_Date__c,RH_Role__c, FirstName,RH_User__c,Email,MailingCity,Languages__c,RH_Extra_Infos__c ,RH_Number_Groups_Leaded__c,OtherAddress,Birthdate,Phone,Description,RH_Status__c,toLabel(RH_Status__c) statusLabel,
                Account.Name,Account.NumberOfEmployees,Account.Website,Account.Phone,Account.Description,Account.YearStarted,Account.Industry,
                RH_WorkGroup__r.Name,RH_WorkGroup__r.CreatedDate,RH_WorkGroup__r.RH_Team_Leader__r.Phone,RH_WorkGroup__r.RH_Team_Leader__r.name,RH_WorkGroup__r.RH_Team_Leader__r.RH_User__c,
                (SELECT Name,CreatedDate,CreatedBy.Name FROM WorkGroups_Leader__r WHERE RH_Status__c =:RH_Constans.ACTIVATED_WORKGROUP_STATUS ),
                (SELECT RH_Project__r.Name,RH_Project__r.Link__c,RH_Project__r.Start_Date__c,RH_Project__r.Description__c,RH_Project__r.End_Date__c  FROM Projects__r WHERE RH_Project__r.Is_Effective__c =true)
                FROM Contact 
                WHERE recordTypeId=:RH_Constans.RH_CONTACT_RT AND AccountId=:currentContact.AccountId Order by CreatedDate DESC]);
        
        return mapContacts;

    }
    /** The class instance
     RH_Users_controller.ContactFilterWrapper filter = new RH_Users_controller.ContactFilterWrapper ();
    filter.searchText='eli';
    filter.status='';
    filter.role='';
    // filter.startdate
    // filter.enddate
    // filter.orderBy
    // filter.orderOn
     RH_Contact_Query conQry = RH_Contact_Query.getInstance();
    conQry.getFilteredContacts(filter);




    */

    public  Map<Id,Contact> getFilteredContacts(RH_Users_controller.ContactFilterWrapper filter ){
        Contact currentContact = RH_Utility.getCurentContact(); 
        String statusActive=RH_Constans.ACTIVATED_WORKGROUP_STATUS;
        String statusProjectActive=RH_Constans.ACTIVATED_PROJECT_STATUS;
        String recordTypeId=RH_Constans.RH_CONTACT_RT;
        String AccountId=currentContact.AccountId; 
        String text=String.isNotBlank(filter.searchText) ? '%'+filter.searchText+'%' :'';
        String status=filter.status;
        String role=filter.role;
        DateTime startdate=filter.startdate;
        DateTime enddate=filter.enddate;
        String ordBy=String.isNotBlank(filter.orderBy)?filter.orderBy: ' CreatedDate ' ;
        String ordOn= String.isNotBlank(filter.orderOn)?filter.orderOn: ' DESC ';

        String query = 'SELECT Id, LastName,AccountId,toLabel(RH_Role__c) RoleLabel,RH_Started_Date__c,RH_Role__c, FirstName,RH_User__c,Email,MailingCity,Languages__c,RH_Extra_Infos__c ,RH_Number_Groups_Leaded__c,OtherAddress,Birthdate,Phone,Description,RH_Status__c,toLabel(RH_Status__c) statusLabel, '
							+ 'Account.Name,Account.NumberOfEmployees,Account.Website,Account.Phone,Account.Description,Account.YearStarted,Account.Industry,'
							+ 'RH_WorkGroup__r.Name,RH_WorkGroup__r.CreatedDate,RH_WorkGroup__r.RH_Team_Leader__r.Phone,RH_WorkGroup__r.RH_Team_Leader__r.name,RH_WorkGroup__r.RH_Team_Leader__r.RH_User__c,'
                            +'(SELECT Name,CreatedDate,CreatedBy.Name FROM WorkGroups_Leader__r WHERE RH_Status__c =: statusActive ),'
                            +'(SELECT RH_Project__r.Name,RH_Project__r.Link__c,RH_Project__r.Start_Date__c,RH_Project__r.Description__c,RH_Project__r.End_Date__c  FROM Projects__r WHERE RH_Project__r.Is_Effective__c =true)'
                            + ' FROM Contact  ';
        String queryWHERE ='WHERE recordTypeId=:recordTypeId AND AccountId=:AccountId ';
		if(String.isNotBlank(text)){
			queryWHERE = queryWHERE + 'AND (LastName LIKE: text OR FirstName LIKE: text OR Email LIKE: text ) ';
		}
		if(String.isNotBlank(status)){
			queryWHERE = queryWHERE + 'AND (RH_Status__c =: status) ';
		}
		if(String.isNotBlank(role)){
			queryWHERE = queryWHERE + 'AND (RH_Role__c =: role) ';
        }
		if(startdate != null){
			queryWHERE = queryWHERE + 'AND (CreatedDate >= : startdate) ';
		}
        if(enddate != null){
			queryWHERE = queryWHERE + 'AND (CreatedDate <= : enddate) ';
		}

        String queryORDER='';
        if(String.isNotBlank(ordBy)){

			queryORDER = queryORDER + ' Order by '+ordBy+' '+ordOn;
		}
        System.debug('########### query ' + query);
        System.debug('########### queryWHERE ' + queryWHERE);
        System.debug('########### queryORDER ' + queryORDER);
        query= query+queryWHERE+queryORDER;

        Map<Id, Contact> mapContacts=new Map<Id, Contact>((List<Contact>) Database.query(query));
        
        return mapContacts;

    }
    public  List<Contact> getExtrafied(String recordId){
        return [SELECT Id,RH_Extra_Infos__c FROM Contact WHERE id=:recordId];
    }

    public  List<Contact> getEligibleTeamMembers(){
        Contact currentContact = RH_Utility.getCurentContact();
        List<string> TL_roles = new List<string>{
            'Team Leader','CEO'
        };
        return [ SELECT Id, Name FROM Contact WHERE RH_Role__c IN :TL_roles AND recordTypeId=:RH_Constans.RH_CONTACT_RT 
                                                                                AND RH_Status__c=:RH_Constans.ACTIVATED_CONTACT_STATUS
                                                                                AND AccountId=:currentContact.AccountId];
    }
    public  List<Contact> getEligibleAddressedTo(){
        Contact currentContact = RH_Utility.getCurentContact();
        List<string> TL_roles = new List<string>{
            'Team Leader','CEO','Ressource Manager'
        };
        return [ SELECT Id, Name FROM Contact WHERE RH_Role__c IN :TL_roles AND recordTypeId=:RH_Constans.RH_CONTACT_RT AND RH_Status__c=:RH_Constans.ACTIVATED_CONTACT_STATUS AND AccountId=:currentContact.AccountId];
    }
    public  List<Contact> getEligibleTeamLeaders(){
        Contact currentContact = RH_Utility.getCurentContact();
        List<string> TL_roles = new List<string>{
            'Team Leader','CEO'
        };
        return [ SELECT Id, Name FROM Contact WHERE RH_Role__c IN :TL_roles AND recordTypeId=:RH_Constans.RH_CONTACT_RT AND RH_Status__c=:RH_Constans.ACTIVATED_CONTACT_STATUS AND AccountId=:currentContact.AccountId];
    }
    public  List<Contact> getAllContactInitial(){
        Contact currentContact = RH_Utility.getCurentContact();
        return [SELECT Id,Name FROM Contact WHERE recordTypeId=:RH_Constans.RH_CONTACT_RT AND RH_Status__c=:RH_Constans.ACTIVATED_CONTACT_STATUS AND AccountId=:currentContact.AccountId AND (RH_Role__c=:RH_Constans.CONTACT_ROLE_BU OR RH_Role__c=:RH_Constans.CONTACT_ROLE_TL OR RH_Role__c=:RH_Constans.CONTACT_ROLE_CEO)];
    }

    public List<Contact> getAccountId(String rh_contactId){
        return [Select Id,Name,AccountId from Contact where Id = : rh_contactId];
    }
    
    public static List<Contact> getContactForGroup(){
        Contact currentContact = RH_Utility.getCurentContact();
        return [SELECT Id,Name,RH_WorkGroup__c FROM Contact  WHERE RH_Role__c=:RH_Constans.CONTACT_ROLE_BU AND recordTypeId=:RH_Constans.RH_CONTACT_RT AND RH_Status__c=:RH_Constans.ACTIVATED_CONTACT_STATUS 
                            AND AccountId=:currentContact.AccountId AND RH_WorkGroup__r.RH_Status__c !=:RH_Constans.ACTIVATED_WORKGROUP_STATUS];
    }
    public  List<Contact> getBaseUsers(){
        Contact currentContact = RH_Utility.getCurentContact();
        return [SELECT Id,Name,Email,RH_Role__c,RH_Status__c FROM Contact  WHERE RH_Role__c=:RH_Constans.CONTACT_ROLE_BU AND recordTypeId=:RH_Constans.RH_CONTACT_RT AND RH_Status__c=:RH_Constans.ACTIVATED_CONTACT_STATUS AND AccountId=:currentContact.AccountId];
    }

}