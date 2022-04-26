public without sharing class RH_EventController {

    @AuraEnabled(cacheable=true)
    public static List<Event__c>  getEventList(){
        try{
            System.debug('UserInfo-->' + UserInfo.getUserId());
            User u = [Select Id, RH_ContactId__c,UserRole.Name From User where Id =: UserInfo.getUserId()];
                String conId = u.RH_ContactId__c;
                String userRole = u.UserRole.Name;
                if(userRole == 'CEOza'){
                    List<Event__c> evenList = [SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Date__c, End_Date__c, Status__c, CreatedBy.UserRole.Name FROM Event__c];
                    //System.debug('event-->' + evenList);
                    return evenList;
                }else{
                    List<Event__c> evenList = [SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Date__c, End_Date__c, Status__c, CreatedBy.UserRole.Name FROM Event__c 
                    Where Contact_Id__c =: conId And CreatedBy.UserRole.Name =: userRole];
                    System.debug('event-->' + evenList);
                    return evenList;
                }
            }
            catch(Exception ex) {
                throw new AuraHandledException(ex.getMessage());
            }
        // return [SELECT Id, Name,Phone,Industry FROM Account order by createddate desc LIMIT 5];
    }

    // @AuraEnabled
    // public static List<Event__c> getMyEvent() {
    //     try{
    //     User u = [Select Id, RH_ContactId__c,UserRole.Name From User where Id =: UserInfo.getUserId()];
    //         String conId = u.RH_ContactId__c;
    //         String userRole = u.UserRole.Name;
    //         if(userRole == 'CEOza'){
    //             List<Event__c> evenList = [SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Date__c, End_Date__c, Status__c, CreatedBy.UserRole.Name FROM Event__c];
    //             //System.debug('event-->' + evenList);
    //             return evenList;
    //         }else{
    //             List<Event__c> evenList = [SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Date__c, End_Date__c, Status__c, CreatedBy.UserRole.Name FROM Event__c 
    //             Where Contact_Id__c =: conId And CreatedBy.UserRole.Name =: userRole];
    //             //System.debug('event-->' + evenList);
    //             return evenList;
    //         }
    //     }
    //     catch(Exception ex) {
    //         throw new AuraHandledException(ex.getMessage());
    //     }
    // }
    @AuraEnabled
    public static List<Event__c> getEventEdite(String evenId) {
        try{
            System.debug('UserInfo-->' + UserInfo.getUserId());
            User u = [Select Id, RH_ContactId__c,UserRole.Name From User where Id =: UserInfo.getUserId()];
                String conId = u.RH_ContactId__c;
                String userRole = u.UserRole.Name;
                if(userRole == 'CEOza'){
                    List<Event__c> evenList = [SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Date__c, End_Date__c, Status__c, CreatedBy.UserRole.Name FROM Event__c Where Id =: evenId];
                    //System.debug('event-->' + evenList);
                    return evenList;
                }else{
                    List<Event__c> evenList = [SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Date__c, End_Date__c, Status__c, CreatedBy.UserRole.Name FROM Event__c 
                    Where  Id =: evenId];//Contact_Id__c =: conId And CreatedBy.UserRole.Name =: userRole And
                    //System.debug('event-->' + evenList);
                    return evenList;
                }
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    @AuraEnabled
    public static List<Event__c> getMyEventManager() {
        try{
            User u = [Select Id, RH_ContactId__c,UserRole.Name From User where Id =: UserInfo.getUserId()];
                String conId = u.RH_ContactId__c;
                String userRole = u.UserRole.Name;
                if(userRole == 'CEO'){
                    List<Event__c> evenList = [SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Date__c, End_Date__c, Status__c, CreatedBy.UserRole.Name FROM Event__c
                    // Where CreatedBy.UserRole.Name =: 'Base User'
                    ];
                    //System.debug('event-->' + evenList);
                    return evenList;
                }else{
                    List<Event__c> evenList = [SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Date__c, End_Date__c, Status__c, CreatedBy.UserRole.Name FROM Event__c 
                    Where Contact_Id__c =: conId 
                    // And CreatedBy.UserRole.Name =: userRole
                    And Status__c='Pending'];
                    //System.debug('event-->' + evenList);
                    return evenList;
                }
            }
            catch(Exception ex) {
                throw new AuraHandledException(ex.getMessage());
            }
    }

    @AuraEnabled
    public static void saveEvent(String objEven) {
        system.debug('@@@@EventDatas' + objEven);
        try{
            wrapperData datas = (wrapperData)JSON.deserialize(objEven, wrapperData.class);
            User u = [Select Id, RH_ContactId__c From User where Id =: UserInfo.getUserId()];
            String conId = u.RH_ContactId__c;	
                Event__c even = new Event__c(
                    Name = datas.Name,
                    Contact_Id__c = conId,
                    Description__c  = datas.Description,
                    Start_Date__c =dateToParse(datas.StartDate),
                    End_Date__c =dateToParse(datas.EndDate),
                    Status__c =datas.Status

                );
                insert even;
                system.debug('@@@@EventDatasReturn' + even);
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }

    public class wrapperData{
        public String Name { get; set; }
        public String Description { get; set; }
        public String StartDate { get; set; }
        public String EndDate { get; set; }
        public String Status { get; set; }
    }

    @AuraEnabled
    public static void updateEven(String updEven, String eId) {
        system.debug('@@@@updEven--->' + updEven);
        system.debug('@@@@ eId---> '+ eId);
        try{
            wrapperDataToUpdate datas = (wrapperDataToUpdate)JSON.deserialize(updEven, wrapperDataToUpdate.class);
            String evId = eId;
            User u = [Select Id, RH_ContactId__c From User where Id =: UserInfo.getUserId()];
            String conId = u.RH_ContactId__c; 
            Event__c even = new Event__c(
                    Id = string.isNotBlank(evId)?evId:null,
                    Name = datas.Name,
                    Contact_Id__c = conId,
                    Description__c  = datas.Description,
                    Start_Date__c =dateToParse(datas.StartDate),
                    End_Date__c =dateToParse(datas.EndDate),
                    Status__c =datas.Status
            );

            update even;
            system.debug('@@@@EventDatas--->' + even);
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    public class wrapperDataToUpdate{
        public String Name { get; set; }
        public String Description { get; set; }
        public String StartDate { get; set; }
        public String EndDate { get; set; }
        public String Status { get; set; }
    }

    @AuraEnabled
    public static String getInfoUsers() {
        String userinf = UserInfo.getUserId();
        return userinf;
    }
    @AuraEnabled
    public static List<User> getInfBaseUsers() {
        List<User> u = [Select Id,UserRole.Name From User Where UserRole.Name =: 'Base User'];
        return u;
    }
    @AuraEnabled
    public static List<Event__c> getEventInfos(String infoId) {
        List<Event__c> ev = [Select Id, Name, Description__c From Event__c Where Id =: infoId];
        return ev;
    }
    
    @AuraEnabled(cacheable=true)
    public static void sendNotifications(String strBody, String strSenderId, String pgRefId, String strTargetId, String strTitle,List<String> setUserIds) {
        set<String> setUserId = new set<String>();
        for(String s : setUserIds){
            setUserId.add(s);
        }
        system.debug('@@@@pgRefIdId--->  ' + pgRefId);
        
        // String pgRef = '{ type : "standard__recordPage",attributs :{recordId : 0017Q00000Dck8lQAB ,objectApiName : "Account",actionName : "view"} }' ;
        String pgRef = '{type : \'comm__namedPage\',attributes : {pageName : \'Event\'},state: {\'recordId\': '+pgRefId+'}}' ;
        system.debug('@@@@pgRef--->  ' + pgRef);

        // Get the Id for our custom notification type
        CustomNotificationType notificationType = [SELECT Id, DeveloperName FROM CustomNotificationType WHERE DeveloperName='Test_Notification'];

        Messaging.CustomNotification obj = new Messaging.CustomNotification();
        
        // Custom notification type Id
        obj.setNotificationTypeId(notificationType.Id);

        
        // when we click on the notification it will redirect to the specified targetId
        // obj.setTargetId(strTargetId);
        
        // when we click on the notification it will redirect to the setTargetPageRef targetId
        obj.setTargetPageRef( pgRef );

        // Notification Title
        obj.setTitle(strTitle);

        // Notification Body
        obj.setBody(strBody);
        
        // send used to send the notification, pass the set of user ids , Group or Queue member
        obj.send(setUserId);
    }

    @AuraEnabled
    public static List<SelectOptionObj> getPicklistStatus() {
        List<SelectOptionObj> picklistOptions = new List<SelectOptionObj>();
        try {
            Schema.DescribeFieldResult fieldResult = Event__c.Status__c.getDescribe();
            List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
            SelectOptionObj option = null;
            for (Schema.PicklistEntry pickListVal : ple) {
                option = new SelectOptionObj(pickListVal.getLabel(), pickListVal.getValue(), pickListVal.isDefaultValue());
                picklistOptions.add(option);
            }
            
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
        //system.debug('--->'+picklistOptions);
        return picklistOptions;
    }
    public class SelectOptionObj {
        @AuraEnabled
        public String label { get; set; }
        @AuraEnabled
        public String value { get; set; }
        @AuraEnabled
        public Boolean isDefault {get; set;}
        
        public SelectOptionObj(String label, String val,Boolean isDefault) {
            this.label = label;
            this.value = val;
            this.isDefault = isDefault;
        }
    }

    //convert string date to date 
    public static Date dateToParse(String dateOCS){
        System.debug('OCSRecuperaDatiPostvenditaController dateToParse input: '+dateOCS);
        Date res = null; 
        try{
            if(dateOCS != '0' && dateOCS != null)
            { 
                if(dateOCS.contains('/')){ 
                    res =  Date.parse(dateOCS);
                }
                else if(dateOCS.contains('-')){
                System.debug('anno' + Integer.valueOf(dateOCS.substring(0, 4)) + ' mese' + Integer.valueOf(dateOCS.substring(5,7)) + 'Giorno ' + Integer.valueOf(dateOCS.substring(8,10))); 
                    res = Date.newInstance(Integer.valueOf(dateOCS.substring(0, 4)), 
                            Integer.valueOf(dateOCS.substring(5,7)),
                            Integer.valueOf(dateOCS.substring(8,10)));
                }
                else{ 
                    res =  Date.newInstance(Integer.valueOf(dateOCS.substring(0, 4)), 
                            Integer.valueOf(dateOCS.substring(4,6)),
                            Integer.valueOf(dateOCS.substring(6)));
                }
            }   
            else
                res = null;
        }
        catch(Exception e){
            //System.debug('AccountUtils dateToParse Exception, message: '+e.getCause()+'\n'+e.getStackTraceString());
        }
        return res;
    }
}