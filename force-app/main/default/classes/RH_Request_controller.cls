public without sharing class RH_Request_controller implements RH_SummarizeInterface{
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    private static RH_User_Query userQry = RH_User_Query.getInstance();
    private static RH_Request_Query requestQry = RH_Request_Query.getInstance();
    public static Map<String,Object> StatusMapping = new Map<String, String>();
    public static Map<String,Object> LabelMapping = new Map<String, String>();
    private static String STATUSKEY='Rh_Status__c';
    
    private static final String APPROVE_STATUS='Approved';
    private static final String REJECT_STATUS='Rejected';
    private static final String SUBMITTED_STATUS='Submited';
    private static final String RESPONDED_STATUS='Responded';
    static{
        RH_Constans cons= RH_Constans.getAllConstants();
        /**
         * case 'Approved':
                return "slds-float_left slds-theme_success";
            case 'Draft':
                return "slds-float_left slds-theme_info";
            case 'Submited':
                return "slds-float_left slds-theme_warning";
            case 'Rejected':
                return "slds-float_left slds-theme_error";
            default:
                return "slds-float_left slds-theme_alt-inverse";
         */
        StatusMapping= new Map<String, Object>{
                            STATUSKEY.toLowerCase()=> new Map<String, String>{
                                APPROVE_STATUS.toLowerCase()=> ' slds-theme_success ',
                                RH_Constans.DRAFT_STATUS.toLowerCase()=> ' slds-theme_info ',
                                SUBMITTED_STATUS.toLowerCase()=> ' slds-theme_warning ',
                                RESPONDED_STATUS.toLowerCase()=> ' slds-theme_alt-inverse  ',
                                REJECT_STATUS.toLowerCase()=> ' slds-theme_error '
                            }
        };
        // String valueKey='Value'+fieldName;
        Map<String, Object> picklists=RH_Utility.getPickListOptions(new List<String> {STATUSKEY},'RH_Request__c');
        LabelMapping= new Map<String, Object>{
            STATUSKEY.toLowerCase()=> (Map<String, String>)picklists.get('ValueRh_Status__c')
        };
        // System.debug(picklists);
    }
    
     /* Kbrel Add */ 
     @AuraEnabled
     public static List<RH_Request__c> getLastrequest(Integer edLimit) {
         return requestQry.getLastrequest(edLimit);        
     }
 
     
     public static List<RH_Request__c> getAllMyRequestByYear(Integer year, String contactId) {
         return requestQry.getAllMyRequestByYear(year,contactId);        
     }
     /*end*/
    String conditionMyRequests(String field){
        String conditionStr = '';
        conditionStr =' ownerId= \''+String.escapeSingleQuotes(Userinfo.getUserId()) +'\' AND '+field+'!=Null';
        return conditionStr;
    }
    String conditionOthersRequests(Contact currentContact,String field){
        // String Role=currentContact.RH_Role__c;
        String AccountId=currentContact.AccountId; 
        String contactId=currentContact.Id; 
        
        // Boolean isAdmin=(RH_Constans.CONTACT_ROLE_CEO.equalsIgnoreCase(Role) || RH_Constans.CONTACT_ROLE_RH.equalsIgnoreCase(Role));
        // List<String> Status= isAdmin ? new List<String>{SUBMITTED_STATUS,APPROVE_STATUS,REJECT_STATUS} : new List<String>{APPROVE_STATUS};
        List<String> Status=new List<String>{SUBMITTED_STATUS,APPROVE_STATUS,REJECT_STATUS} ;

        // \''+String.escapeSingleQuotes(Userinfo.getUserId()) +'\' AND '+field+'!=Null';1
        // conds.add('(Rh_Status__c IN: status)');conds.add('(Contact_Id__r.AccountId=:AccountId)');
        String conditionStr = '';
        conditionStr =' RH_Addressed_To__c= \''+ String.escapeSingleQuotes(contactId) +'\' AND Rh_Status__c IN (\''+ String.join(status, '\',\'') +'\') AND '+field+'!=Null';
        return conditionStr;
    }
    public List<AggregateResult> getSummary(Map<String, Object> args) {
        Contact currentContact = RH_Utility.getCurentContact(); 
        System.debug('get sum '+args);
        String groupByStr = String.valueOf(args.get(RH_Summarizer.GROUPBY_KEY));
        String fieldsStr = String.valueOf(args.get(RH_Summarizer.FIELDS_KEY));
        String sobj = String.valueOf(args.get(RH_Summarizer.OBJECT_KEY));
        
        Boolean areMine = (Boolean) args.get('areMine');//
        String conditionStr =null;
        if (areMine) {
            conditionStr=conditionMyRequests(groupByStr);
        }else{
            conditionStr=conditionOthersRequests(currentContact,groupByStr);
        }
        return RH_Summarizer.defauftSummirise(groupByStr,fieldsStr,conditionStr,sobj);
    } 
    public List<RH_Summarizer.summaryWrapper> formatAggregate(List<AggregateResult> aggs,Map<String, Object> args){
        String groupByStr = String.valueOf(args.get(RH_Summarizer.GROUPBY_KEY));
        String fieldsStr = String.valueOf(args.get(RH_Summarizer.FIELDS_KEY));
        String conditionStr= String.valueOf(args.get(RH_Summarizer.CONDITIONS_KEY));
        String sobj = String.valueOf(args.get(RH_Summarizer.OBJECT_KEY));
        String alias=groupByStr;// by default
        List<RH_Summarizer.summaryWrapper> sumaries = new List<RH_Summarizer.summaryWrapper>();
        Integer i=0; 
        Integer total=0; 
        for (AggregateResult agg : aggs) {
            RH_Summarizer.summaryWrapper swrap= new RH_Summarizer.summaryWrapper();
            String name=(String) agg.get(alias);
            swrap.label= getLabelMapping(groupByStr,name);
            swrap.value = (Integer) agg.get('sum');
            swrap.Key = name;
            swrap.className= getClassMapping(groupByStr,name);
            total= total + ( swrap.value!=Null?  swrap.value : 0); 
            sumaries.add(swrap);
            i=i+1;
        }
        /*RH_Summarizer.summaryWrapper allSum= new RH_Summarizer.summaryWrapper();
        allSum.label='ALL';
        allSum.value = total;
        allSum.Key = 'ALL';
        sumaries.add(allSum);*/

        return sumaries;
    }
    // RH_Users_controller.getClassMapping('rh_status__c', 'Active');
    public static String getClassMapping(String field, String Value){
        field= field?.toLowerCase();
        value= value?.toLowerCase();
        string cx=' defaut ';
        Map<String,String> cxMapping=(Map<String,String>) StatusMapping.get(field);

        if (cxMapping != null) {
            cx= cxMapping.get(value); 
        }
        System.debug('@@@@@@field---> '+field+' Value---> '+Value+' cx---> '+cx);
        return cx;
    }
    public static String getLabelMapping(String field, String Value){
        field= field?.toLowerCase();
        value= value?.toLowerCase();
        string lb=Value;
        Map<String,String> lbMapping=(Map<String,String>) LabelMapping.get(field);

        if (lbMapping != null) {
            // System.debug('lbMapping ' + lbMapping);
            lb= lbMapping.get(value); 
        }
        System.debug('@@@@@@field---> '+field+' Value---> '+Value+' cx---> '+lb);
        return lb;
    }

    
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

   /* @AuraEnabled
    public static List<RecordType> getRecordType(){
        return requestQry.getRecordType();
    }*/

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
            RequestUser.Name = Schema.SObjectType.RH_Request__c.getRecordTypeInfosById().get(RequestUser.RecordTypeId).getDeveloperName().substring(0,3).toUpperCase() + Datetime.now().year() + Datetime.now().day() + Datetime.now().minute();
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
                List<User> currentU = userQry.getUserById(UserInfo.getUserId());
                String notifTitle;
                if(Schema.SObjectType.RH_Request__c.getRecordTypeInfosById().get(RequestUser.RecordTypeId).getDeveloperName() == 'Complain'){
                    notifTitle = Schema.SObjectType.RH_Request__c.getRecordTypeInfosById().get(RequestUser.RecordTypeId).getName()+' '+System.Label.rh_From+' '+currentU[0].Name;
                }else{
                    notifTitle = System.Label.rh_requestNotif+' '+Schema.SObjectType.RH_Request__c.getRecordTypeInfosById().get(RequestUser.RecordTypeId).getName()+' '+System.Label.rh_From+' '+currentU[0].Name;
                }
                sendNotifications(RequestUser.RH_Description__c,UserInfo.getUserId(),RequestUser.id,'request-management',notifTitle,valuep);
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
            String notifTitle;
            if(request[0].RecordType.DeveloperName == 'Complain'){
                notifTitle = request[0].RecordType.Name+' '+System.Label.rh_From+' '+request[0].CreatedBy.Name;
            }else{
                notifTitle = System.Label.rh_requestNotif+' '+request[0].RecordType.Name+' '+System.Label.rh_From+' '+request[0].CreatedBy.Name;
            }
            sendNotifications(request[0].RH_Description__c,UserInfo.getUserId(),request[0].id,'request-management',notifTitle, valuep);
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
            String notifTitle = System.Label.rh_RequestNotifRep+' '+System.Label.rh_requestNotif+' '+request.RecordType.Name;
            sendNotifications(answer,UserInfo.getUserId(),request.RH_Parent_Request_Id__c,'request-management',notifTitle,new List<Id> {request.CreatedById});
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
            update updRejet;
            String notifTitle;
            if(updRejet.RecordType.DeveloperName == 'Complain'){
                notifTitle = System.Label.rh_RequestNotifRep+' '+updRejet.RecordType.Name;
            }else{
                notifTitle = System.Label.rh_RequestNotifRep+' '+System.Label.rh_requestNotif+' '+updRejet.RecordType.Name;
            }
            updRejet = requestQry.retreiveRequest(RecordT);
            sendNotifications((String) updRejet.get('Rh_Status'),UserInfo.getUserId(),RecordT,'my-request',notifTitle,new List<Id> {updRejet.CreatedById});
        } catch (Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }
        return mapReturn;
    }

    @AuraEnabled
    public static List<RH_Request__c> filterRequest(String searchText, String requestType, String status, Datetime dateFrom, Datetime dateTo){
        return requestQry.filterRequest(searchText, requestType, status, dateFrom, dateTo, 0, null, null);   
    }

    @AuraEnabled
    public static List<RH_Request__c> filterRequestToManage(String searchText, String requestType, String status, Datetime dateFrom, Datetime dateTo){
        List<User> currentUser = userQry.getUserById(UserInfo.getUserId());
        List<RH_AdressedCC__c> adccs = requestQry.getAdressByContact(currentUser[0].RH_ContactId__c);
        List<String> requestIds = new List<String>();
        for(RH_AdressedCC__c add : adccs){
            requestIds.add(add.RH_Request__c);
        }
        return requestQry.filterRequest(searchText, requestType, status, dateFrom, dateTo, 1, currentUser[0].RH_ContactId__c, requestIds);   
    }

    @AuraEnabled(cacheable=true)
    public static void sendNotifications(String strBody, String strSenderId, String pgRefId, String strTargetId, String strTitle,List<Id> setUserIds) {
        /*set<String> setUserId = new set<String>();
        for(String s : setUserIds){
            setUserId.add(s);
        }*/
        system.debug('@@@@pgRefIdId--->  ' + pgRefId);
        
        // String pgRef = '{ type : "standard__recordPage",attributs :{recordId : 0017Q00000Dck8lQAB ,objectApiName : "Account",actionName : "view"} }' ;
        String pgRef = '{type : \'comm__namedPage\',attributes : {pageName : \''+strTargetId+ '\'},state: {\'recordId\': '+pgRefId+'}}' ;
        system.debug('@@@@pgRef--->  ' + pgRef);
        RH_Notification_Utility.notify(strBody, pgRef,  strTitle, setUserIds);
        // Get the Id for our custom notification type
       /* CustomNotificationType notificationType = [SELECT Id, DeveloperName FROM CustomNotificationType WHERE DeveloperName='Request_notification'];

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
        obj.send(setUserId);*/
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