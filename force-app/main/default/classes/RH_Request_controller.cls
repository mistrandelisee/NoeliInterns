public without sharing class RH_Request_controller {
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    private static RH_User_Query userQry = RH_User_Query.getInstance();
    private static RH_Request_Query requestQry = RH_Request_Query.getInstance();
    
    
    @AuraEnabled
    public static List<RH_Request__c> getLastrequest(Integer edLimit) {
		return requestQry.getLastrequest(edLimit);        
    }
    
    @AuraEnabled
    public static List<RH_Request__c> getrequest() {
        return [SELECT id,Name,RH_Description__c,Rh_Status__c,RH_Addressed_To__r.Name,RecordType.Name ,CreatedDate,RH_RequestTypeName__c FROM RH_Request__c WHERE ownerId =: UserInfo.getUserId() ORDER BY CreatedDate desc];
    }
    @AuraEnabled
    public static List<RH_Request__c> getRequestToManage() {
        String userName = UserInfo.getName();
        return [SELECT id,Name,RH_Description__c,Rh_Status__c,CreatedBy.Name,RH_Addressed_Cc__c, RH_Addressed_To__r.Name,RecordType.Name ,CreatedDate,RH_RequestTypeName__c 
                        FROM RH_Request__c 
                        WHERE (RH_Addressed_To__r.Name =: userName or RH_Addressed_Cc__c =: userName) and Rh_Status__c != 'Draft'];
    }
    // @AuraEnabled(cacheable=true)
    // public static List<Contact> getAdressedTo() {
    //     return [SELECT id, Name FROM Contact];
    // }

    @AuraEnabled
    public static List<Contact> getAdressedTo(){
        List<Contact> seCon = new List<Contact>();
        List<Contact> Tleader = new List<Contact>();

        List<string> TL_roles = new List<string>{
            'CEO','Ressource Manager'
        };

        List<Contact> allCon =contactQry.getEligibleAddressedTo();
        List<User> currentU = userQry.getUserById(UserInfo.getUserId());
        if (currentU.size() > 0) {
            seCon = contactQry.getContactById(currentU[0].RH_ContactId__c);
            if (! seCon.isEmpty()) {
                if (seCon[0].RH_WorkGroup__r?.RH_Team_Leader__c != null) {
                    Tleader.add(seCon[0].RH_WorkGroup__r?.RH_Team_Leader__r);
                }
            }
        }else {
            throw new RH_ControllerException('002','No RH Contact Founded');
        }
        allCon.addAll(Tleader);
        return allCon;
    }

    @AuraEnabled
    public static RH_Request__c retreiveRequest(String requestId){
        return [SELECT id, Name, RH_Description__c , CreatedBy.Name,RH_Addressed_To__r.Name, Rh_Status__c, RH_Start_date__c, 
        RH_End_date__c, RH_Parent_request_id__c, RH_Addressed_Cc__c, RH_Complain_On__c,RecordTypeId,RecordType.Name  FROM RH_Request__c WHERE id =: requestId ];
    }

    @AuraEnabled
    public static List<RecordType> getRecordType(){
        // Map<String,String> RecordT = new Map<String,String>();
        // for (RecordType var : [select Id,Name from RecordType where sObjectType='RH_Request__c']) {
        //     RecordT.put(var.Name, var.Id);
        // }
        return [select Id,Name from RecordType where sObjectType='RH_Request__c' AND Name != 'Explanation'];
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
            if (String.isNotBlank(RequestUser.id)) {
                update RequestUser;
                
            }else {
                insert RequestUser;
            }
            if (RequestUser.RH_Status__c == 'Open') {
                List<RH_Request__c> req = [SELECT id, RH_Addressed_To__r.RH_User__c, RH_Addressed_To__c    FROM RH_Request__c WHERE RH_Addressed_To__c  =: RequestUser.RH_Addressed_To__c limit 1];
                sendNotifications(RequestUser.RH_Description__c,UserInfo.getUserId(),RequestUser.id,'request-management',RequestUser.Rh_Status__c,new List<String> {req[0]. RH_Addressed_To__r.RH_User__c});
            }
            
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }
       
        return mapReturn;
    }

    @AuraEnabled
    public static string updateRequest(String requestId){
        List<RH_Request__c> req = [SELECT Id, Rh_Status__c from RH_Request__c WHERE Id =: requestId limit 1];
        req[0].Rh_Status__c = 'Open';
        Database.SaveResult[] results = Database.update(req, false);
        String pop = '';
        for (Database.SaveResult drList : results) {
            if (!drList.isSuccess()) {
               
                for(Database.Error err : drList.getErrors()) {
                    pop = pop + err.getMessage() + err.getFields();
                }
                // return pop;
                
            }else {
                pop = 'OK';
            }
        }
        return pop;
    }

    @AuraEnabled
    public static string deleteRequest(String requestId){
        RH_Request__c req = [SELECT Id from RH_Request__c WHERE Id =: requestId];
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
    public static Map<String,Object> updateRequestForRejet(String RecordT,String Reason,String StatusRejeted){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            List<RH_Request__c> updRejet = [SELECT Id,RH_Description__c, Rh_Status__c,RH_Reason__c,CreatedById   FROM RH_Request__c WHERE Id =: RecordT limit 1];
            updRejet[0].RH_Status__c = StatusRejeted;
            if (string.isNotBlank(Reason)) {
                updRejet[0].RH_Reason__c = Reason;
            }
            update updRejet;

            sendNotifications(updRejet[0].RH_Description__c,UserInfo.getUserId(),RecordT,'my-request',StatusRejeted,new List<String> {updRejet[0].CreatedById});
            
        } catch (Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }
        return mapReturn;
    }

    @AuraEnabled
    public static Map<String,Object> updateRequestForApprove(String RecordT,String Reason,String StatusApprove){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            List<RH_Request__c> updApprove = [SELECT Id,RH_Description__c, Rh_Status__c,RH_Reason__c,CreatedById   FROM RH_Request__c WHERE Id =: RecordT limit 1];
            updApprove[0].RH_Status__c = StatusApprove;
            if (string.isNotBlank(Reason)) {
                updApprove[0].RH_Reason__c = Reason;
            }
            update updApprove;

            sendNotifications(updApprove[0].RH_Description__c,UserInfo.getUserId(),RecordT,'my-request',StatusApprove,new List<String> {updApprove[0].CreatedById});
            
        } catch (Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }
        return mapReturn;
    }

    @AuraEnabled(cacheable=true)
    public static void sendNotifications(String strBody, String strSenderId, String pgRefId, String strTargetId, String strTitle,List<String> setUserIds) {
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
        @AuraEnabled public String IdRequest;
        @AuraEnabled public Datetime RH_StartDate;
        @AuraEnabled public Datetime RH_EndDate;
        @AuraEnabled public String RH_AddressedTo;
        @AuraEnabled public string RH_AddressedCc;
        @AuraEnabled public string RH_Description;
        public RH_Request__c getRequest() {
            return new RH_Request__c(
                RH_Complain_On__c=this.ComplainOn, 
                RecordTypeId=this.RecordT,
                id = IdRequest != '' ? IdRequest : '',
                RH_Status__c = this.StatusRequest, 
                RH_Start_date__c=this.RH_StartDate, 
                RH_End_date__c=this.RH_EndDate,
                RH_Addressed_To__c=this.RH_AddressedTo,
                RH_Addressed_Cc__c=this.RH_AddressedCc,
                RH_Description__c=this.RH_Description);
        }
    }

}