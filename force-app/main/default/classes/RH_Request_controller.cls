public without sharing class RH_Request_controller {
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    private static RH_User_Query userQry = RH_User_Query.getInstance();
    private static RH_Request_Query requestQry = RH_Request_Query.getInstance();
    
    
     /* Kbrel Add */ 
     @AuraEnabled
     public static List<RH_Request__c> getLastrequest(Integer edLimit) {
         return requestQry.getLastrequest(edLimit);        
     }
 
     
     public static List<RH_Request__c> getAllMyRequestByYear(Integer year, String contactId) {
         return requestQry.getAllMyRequestByYear(year,contactId);        
     }
     /*end*/

    
    @AuraEnabled
    public static List<RH_Request__c> getrequest() {
        return requestQry.getRequest();
    }

    @AuraEnabled
    public static RH_Request__c getRequestByParent(String requestId){
        return requestQry.getRequestByParent(requestId);
    }

    @AuraEnabled
    public static List<RH_Request__c> getRequestToManage(){
        List<User> currentUser = userQry.getUserById(UserInfo.getUserId());
        List<RH_AdressedCC__c> adccs = requestQry.getAdressByContact(currentUser[0].RH_ContactId__c);
        List<String> requestIds = new List<String>();
        for(RH_AdressedCC__c add : adccs){
            requestIds.add(add.RH_Request__c);
        }
        return requestQry.getRequestToManage(currentUser[0].RH_ContactId__c, requestIds);
    }

    @AuraEnabled(cacheable=true)
    public static Map<String,Object> getContacts(){
        Map<String,Object> mapContacts = new Map<String,Object>();
        mapContacts.put('adressedTo',contactQry.getEligibleAddressedTo());
        mapContacts.put('complainOn',contactQry.getBaseUsers());
        return mapContacts;
    }

    @AuraEnabled
    public static Boolean checkAdressedTo(String requestId){
        RH_Request__c request = requestQry.retreiveRequest(requestId);
        List<User> currentUser = userQry.getUserById(UserInfo.getUserId());
        return currentUser[0].RH_ContactId__c == request.RH_Addressed_To__c ? true : false;
    }

    @AuraEnabled
    public static RH_Request__c retreiveRequest(String requestId){
        return requestQry.retreiveRequest(requestId);
    }
    
    @AuraEnabled
    public static Boolean isBaseUsers(){
       Boolean isBase = false;
       List<User> currentUser = userQry.getUserById(UserInfo.getUserId());
       List<Contact> baseContacts = contactQry.getBaseUsers();
       for(Contact bcon : baseContacts){
           if(currentUser[0].RH_ContactId__c == bcon.Id){
               isBase = true;
               break;
           }
       }
       return isBase;
    }

    @AuraEnabled
    public static List<RecordType> getRecordType(){
        return requestQry.getRecordType();
    }

    @AuraEnabled
    public static List<RecordType> getAllRecordType(){
        return requestQry.getAllRecordType();
    }

    @AuraEnabled
    public static RecordType getExplanationType(){
        return requestQry.getExplanationType();
    }
    @AuraEnabled
    public static Map<String,Object> getStatus(){
        Map<String,Object> mapReturn = RH_Utility.getPickListOptions(new List<String>{'Rh_Status__c'}, 'RH_Request__c');
        return mapReturn;
    }

    @AuraEnabled
    public static Map<String,Object> newRequest(String Requestjson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            mapReturn.put('input',Requestjson);  
            Requestdetailswrapper Requestinfo = (Requestdetailswrapper) JSON.deserialize(Requestjson, Requestdetailswrapper.class);
            RH_Request__c RequestUser =Requestinfo.getRequest();
            // RequestUser.RH_Status__c = RH_Constans.RH_OPEN;
            mapReturn.put('RequestUser',RequestUser);
            RequestUser.Name = Schema.SObjectType.RH_Request__c.getRecordTypeInfosById().get(RequestUser.RecordTypeId).getName().substring(0,3).toUpperCase() + Datetime.now().year() + Datetime.now().day() + Datetime.now().minute();
            System.debug('@@@@Name' + RequestUser);
            if (String.isNotBlank(RequestUser.Id)) {
                update RequestUser;   
                if(String.isNotBlank(Requestinfo.ACC)){
                    List<RH_AdressedCC__c> addCcs = requestQry.getAdressByRequest(RequestUser.Id);
                    List<String> contactIds = Requestinfo.ACC.split(',');
                    if(addCcs.size() > 0){
                        List<RH_AdressedCC__c> addccInsert = new List<RH_AdressedCC__c>();
                        for(String conId : contactIds){  
                            Boolean bool = false;
                            for(RH_AdressedCC__c add : addCcs){
                                if(add.RH_Contact__c == conId){
                                    bool = true;
                                }
                            }
                            if(!bool){
                                addccInsert.add(new RH_AdressedCC__c(
                                    RH_Contact__c = conId,
                                    RH_Request__c = RequestUser.Id
                                ));
                            }
                        }
                        insert addccInsert;
                        List<RH_AdressedCC__c> addccDelete = new List<RH_AdressedCC__c>();
                        for(RH_AdressedCC__c add : addCcs){
                            Boolean bool = false;
                            for(String conId : contactIds){
                               if(add.RH_Contact__c == conId){
                                    bool = true;
                                }
                            }
                            if(!bool){
                                addccDelete.add(add);
                            }
                        }
                        delete addccDelete;
                    }else{
                        List<RH_AdressedCC__c> addCcsInsert = new List<RH_AdressedCC__c>();
                        for(String conId : contactIds){
                            addCcsInsert.add(new RH_AdressedCC__c(
                                RH_Contact__c = conId,
                                RH_Request__c = RequestUser.Id
                            ));
                        }
                        insert addCcsInsert;
                    }
                }else{
                    List<RH_AdressedCC__c> addCcs = requestQry.getAdressByRequest(RequestUser.Id);
                    if(addCcs.size() > 0){
                        delete addCcs;
                    }
                }
            }else {
                insert RequestUser;
                if(String.isNotBlank(Requestinfo.ACC)){
                    List<RH_AdressedCC__c> addCcs = new List<RH_AdressedCC__c>();
                    List<String> contactIds = Requestinfo.ACC.split(',');
                    for(String conId : contactIds){
                        addCcs.add(new RH_AdressedCC__c(
                            RH_Contact__c = conId,
                            RH_Request__c = RequestUser.Id
                        ));
                    }
                    insert addCcs;
                }
            }
            if (RequestUser.RH_Status__c == 'Submited') {
                String dateSub = System.today().format();
                RequestUser.RH_Date_Submit__c = Date.parse(dateSub);
                update RequestUser;
                List<Id> addCc = new List<Id>();
                if(String.isNotBlank(Requestinfo.ACC)){
                    addCc = Requestinfo.ACC.split(',');
                }
                Map<Id,User> mapUser = new map<Id,User>(userQry.getUserByContactId(addCc));
                List<Id> valuep = new List<Id>();
                valuep.addAll(new List<Id>(mapUser.keySet()));
                List<User> req = userQry.getUserByContactId(RequestUser.RH_Addressed_To__c);
                valuep.add(req[0].Id);
                mapReturn.put('valuep',valuep);
                mapReturn.put('addCc',addCc);
                mapReturn.put('mapUser',mapUser);
                sendNotifications(RequestUser.RH_Description__c,UserInfo.getUserId(),RequestUser.id,'request-management',Schema.SObjectType.RH_Request__c.getRecordTypeInfosById().get(RequestUser.RecordTypeId).getName(),valuep);
            }
            
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('msgx',e.getStackTraceString());
            mapReturn.put('e',e);
        }
       
        return mapReturn;
    }

    @AuraEnabled
    public static string updateRequest(String requestId){
        String dateSub = System.today().format();
        List<RH_Request__c> request = new List<RH_Request__c> {requestQry.retreiveRequest(requestId)};
        List<RH_AdressedCC__c> addccs = requestQry.getAdressByRequest(requestId);
        List<Id> addIds = new List<Id>();
        if(addccs.size() > 0){
            for(RH_AdressedCC__c add : addccs){
                addIds.add(add.RH_Contact__c);
            }
        }
        Map<Id,User> mapUser = new map<Id,User>(userQry.getUserByContactId(addIds));
        List<Id> valuep = new List<Id>();
        valuep.addAll(new List<Id>(mapUser.keySet()));
        List<User> users = userQry.getUserByContactId(request[0].RH_Addressed_To__c);
        valuep.add(users[0].Id);
        request[0].RH_Date_Submit__c = Date.parse(dateSub);
        request[0].Rh_Status__c = 'Submited';
        Database.SaveResult[] results = Database.update(request, false);
        String pop = '';
        for (Database.SaveResult drList : results) {
            if (!drList.isSuccess()) {
               
                for(Database.Error err : drList.getErrors()) {
                    pop = pop + err.getMessage() + err.getFields();
                }

            }else {
                pop = 'OK';
            }
        }
        if(pop=='OK'){
            sendNotifications(request[0].RH_Description__c,UserInfo.getUserId(),request[0].id,'request-management',request[0].RecordType.Name, valuep);
        }
        return pop;
    }
  
    @AuraEnabled
    public static Map<String,Object> updateAnswerExp(String requestId, String answer){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        String dateRep = System.today().format();
        try{
            RH_Request__c request = requestQry.retreiveRequest(requestId);
            request.RH_Date_Response__c = Date.parse(dateRep);
            request.Rh_Status__c = 'Responded';
            request.RH_Answer__c = answer;
            update request;
            sendNotifications(answer,UserInfo.getUserId(),request.RH_Parent_Request_Id__c,'request-management',request.RecordType.Name,new List<Id> {request.CreatedById});
        }catch(Exception e){
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }
        return mapReturn;
    }

    @AuraEnabled
    public static string deleteRequest(String requestId){
        RH_Request__c req = requestQry.retreiveRequest(requestId);
        Database.DeleteResult drList = Database.delete(req, false);

        if (drList.isSuccess()) {
            return 'OK';
        }else {
            String pop = '';
            for(Database.Error err : drList.getErrors()) {
                pop = pop + err.getMessage() + err.getFields();
            }
            return pop;
        }
    }

    @AuraEnabled
    public static Map<String,Object> updateRequestForResponse(String RecordT,String Reason,String Status){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        String dateRep = System.today().format();
        try {
            RH_Request__c updRejet = requestQry.retreiveRequest(RecordT);
            updRejet.RH_Status__c = Status;
            updRejet.RH_Date_Response__c = Date.parse(dateRep);
            if (string.isNotBlank(Reason)) {
                updRejet.RH_Reason__c = Reason;
                updRejet.RH_Note__c = Reason;
            }
            String notifTitle = updRejet.RecordType.Name + ' Response';
            update updRejet;
            sendNotifications(updRejet.RH_Description__c,UserInfo.getUserId(),RecordT,'my-request',notifTitle,new List<Id> {updRejet.CreatedById});
        } catch (Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }
        return mapReturn;
    }

    @AuraEnabled
    public static List<RH_Request__c> filterRequest(String requestType, String status, Datetime dateFrom, Datetime dateTo){
        return requestQry.filterRequest(requestType, status, dateFrom, dateTo, 0, null, null);   
    }

    @AuraEnabled
    public static List<RH_Request__c> filterRequestToManage(String requestType, String status, Datetime dateFrom, Datetime dateTo){
        List<User> currentUser = userQry.getUserById(UserInfo.getUserId());
        List<RH_AdressedCC__c> adccs = requestQry.getAdressByContact(currentUser[0].RH_ContactId__c);
        List<String> requestIds = new List<String>();
        for(RH_AdressedCC__c add : adccs){
            requestIds.add(add.RH_Request__c);
        }
        return requestQry.filterRequest(requestType, status, dateFrom, dateTo, 1, currentUser[0].RH_ContactId__c, requestIds);   
    }

    @AuraEnabled(cacheable=true)
    public static void sendNotifications(String strBody, String strSenderId, String pgRefId, String strTargetId, String strTitle,List<Id> setUserIds) {
        set<String> setUserId = new set<String>();
        for(String s : setUserIds){
            setUserId.add(s);
        }
        system.debug('@@@@pgRefIdId--->  ' + pgRefId);
        
        // String pgRef = '{ type : "standard__recordPage",attributs :{recordId : 0017Q00000Dck8lQAB ,objectApiName : "Account",actionName : "view"} }' ;
        String pgRef = '{type : \'comm__namedPage\',attributes : {pageName : \''+strTargetId+ '\'},state: {\'recordId\': '+pgRefId+'}}' ;
        system.debug('@@@@pgRef--->  ' + pgRef);

        // Get the Id for our custom notification type
        CustomNotificationType notificationType = [SELECT Id, DeveloperName FROM CustomNotificationType WHERE DeveloperName='Request_notification'];

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
    
    public class Requestdetailswrapper  {
        @AuraEnabled public String ComplainOn;
        @AuraEnabled public String StatusRequest;
        @AuraEnabled public String RecordT;
        @AuraEnabled public String ACC;
        @AuraEnabled public String IdRequest;
        @AuraEnabled public Datetime RH_StartDate;
        @AuraEnabled public Datetime RH_EndDate;
        @AuraEnabled public String RH_AddressedTo;
        @AuraEnabled public string RH_AddressedCc;
        @AuraEnabled public string RH_Description;
        @AuraEnabled public string ParentRequestId;
        @AuraEnabled public string RH_Reason;
        public RH_Request__c getRequest() {
            return new RH_Request__c(
                RH_Complain_On__c=this.ComplainOn, 
                RecordTypeId=this.RecordT,
                id = IdRequest != '' ? IdRequest : '',
                RH_Parent_request_Id__c = ParentRequestId != '' ? ParentRequestId : '',
                RH_Status__c = this.StatusRequest, 
                RH_Start_date__c=this.RH_StartDate, 
                RH_End_date__c=this.RH_EndDate,
                RH_Addressed_To__c=this.RH_AddressedTo,
                RH_Description__c=this.RH_Description,
                RH_Reason__c = this.RH_Reason
            );
        }
    }

}