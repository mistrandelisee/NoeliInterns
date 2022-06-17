public without sharing class RH_EventController {

    private static RH_Event_Query eventQuery = RH_Event_Query.getInstance();
    private static RH_User_Query userQuery = RH_User_Query.getInstance();

    /*
        @@@@kb Add 
        27/05/2022
    */
    @AuraEnabled
    public static List<Event__c>  getMyLastEvent(Integer endLimit){
        return eventQuery.getMyLastEvent(endLimit);
    }

    /** end Add */ 

    @AuraEnabled
    public static Event__c  getEventSolo(){
        List<Event__c> event = eventQuery.getEvent();
        Event__c even;
        for(Event__c ev : event){
            if(ev.Status__c==''){
                even = ev;
            }
        }
        System.debug('##### even-->' + even);
        return even;
    }

    @AuraEnabled
    public static List<Event__c>  getEventList(){
        try{
            System.debug('UserInfo-->' + UserInfo.getUserId());
            User u = userQuery.getUserInfoId();
                String conId = u.RH_ContactId__c;
                String userRole = u.UserRole.Name;
                if(userRole == 'CEOza'){
                     List<Event__c> evenList = eventQuery.get_EventList(); //[SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Dates__c, End_Dates__c, Status__c, CreatedBy.UserRole.Name FROM Event__c 
                     //order by createddate desc];
                    //System.debug('event-->' + evenList);
                    return evenList;
                }else{
                    System.debug('event-->' + eventQuery.getEventListByUserRole(userRole,conId));
                    return eventQuery.getEventListByUserRole(userRole,conId);
                }
            }
            catch(Exception ex) {
                throw new AuraHandledException(ex.getMessage());
            }
        // return [SELECT Id, Name,Phone,Industry FROM Account order by createddate desc LIMIT 5];
    }
    
    @AuraEnabled 
    public static Event__c  getEvent(String evId){
        Event__c ev = eventQuery.getEvent(evId); //[SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Dates__c, End_Dates__c, Status__c FROM Event__c Where Id =: evId];
        return ev;
    }
    @AuraEnabled
    public static List<Event__c> getEventEdite(String evenId) {
        try{
            System.debug('UserInfo-->' + UserInfo.getUserId());
            User u = userQuery.getUserInfoId();
                String conId = u.RH_ContactId__c;
                String userRole = u.UserRole.Name;
                if(userRole == 'CEOza'){
                    List<Event__c> evenList = eventQuery.getEventList(evenId);
                    System.debug('evenList -->' + evenList);
                    return evenList;
                }else{
                    return eventQuery.getEventList(evenId);
                }
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    @AuraEnabled
    public static List<Event__c> getMyEventManager() {
        try{
            User u = userQuery.getUserInfoId();
            System.debug('u-->' + u);
                String conId = u.RH_ContactId__c;
                String userRole = u.UserRole.Name;
                System.debug('conId-->' + conId);
                System.debug('userRole-->' + userRole);
                if(userRole == 'CEO' || userRole =='Human Resource Managment' || userRole =='RH Manager'){
                    List<Event__c> evenList = eventQuery.getMyEventManagerForCEO();
                    for(Event__c ev: evenList){
                        ev.Message__c = 'CEO';
                    }
                    System.debug('event ceo-->' + evenList);
                    return evenList;
                }else{
                    List<Event__c> evenList = eventQuery.getMyEventManagerForBaseUser();
                    for(Event__c ev: evenList){
                        ev.Message__c = 'Base User';
                    }
                    System.debug('event base user -->' + evenList);
                    return evenList;
                }
            }
            catch(Exception ex) {
                throw new AuraHandledException(ex.getMessage());
            }
    }
    @AuraEnabled
    public static List<Event__c> saveAndSendEvent(String objEven, String eId) {
        system.debug('@@@@objEven--->' + objEven);
        system.debug('@@@@ eId---> '+ eId);
        try{
            wrapperDataToUpdate datas = (wrapperDataToUpdate)JSON.deserialize(objEven, wrapperDataToUpdate.class);
            User u = userQuery.getUserInfoId();
            String conId = u.RH_ContactId__c;
            List<Event__c> event = eventQuery.getEventList(eId);
            for(Event__c even : event){
                even.Status__c ='Submitted';
            }

            update event;
            system.debug('@@@@EventDatas--->' + event);
            return event;
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    @AuraEnabled
    public static Event__c createEvent(String objEven) {
        system.debug('@@@@EventDatas' + objEven);
        try{
            wrapperData datas = (wrapperData)JSON.deserialize(objEven, wrapperData.class);
            User u = userQuery.getUserInfoId();
            String conId = u.RH_ContactId__c;	
                Event__c even = new Event__c(
                    Name = datas.Name,
                    Contact_Id__c = conId,
                    Description__c  = datas.Description,
                    Start_Dates__c =datas.StartDate,
                    End_Dates__c =datas.EndDate,
                    Status__c =datas.status

                );
                insert even;
                system.debug('@@@@EventDatasReturn' + even);
                return even;
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    @AuraEnabled
    public static Event__c saveEvenWithoutStatus(String objEven) {
        system.debug('@@@@EventDatas' + objEven);
        try{
            wrapperData datas = (wrapperData)JSON.deserialize(objEven, wrapperData.class);
            User u = userQuery.getUserInfoId();
            String conId = u.RH_ContactId__c;	
                Event__c even = new Event__c(
                    Name = datas.Name,
                    Contact_Id__c = conId,
                    Description__c  = datas.Description,
                    Start_Dates__c =datas.StartDate,
                    End_Dates__c =datas.EndDate,
                    Status__c =''

                );
                insert even;
                system.debug('@@@@EventDatasReturn' + even);
                return even;
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }

    @AuraEnabled 
    public static void  cancelEven(String eId){
        Event__c ev = eventQuery.getEvent(eId);
        delete ev;
    }

    @AuraEnabled 
    public static List<Event__c> saveEvent(String objEven, String eId) {
        system.debug('@@@@objEven--->' + objEven);
        system.debug('@@@@ eId---> '+ eId);
        try{
            wrapperDataToUpdate datas = (wrapperDataToUpdate)JSON.deserialize(objEven, wrapperDataToUpdate.class);
            User u = userQuery.getUserInfoId();
            String conId = u.RH_ContactId__c;
            List<Event__c> event = eventQuery.getEventList(eId);
            for(Event__c even : event){
                even.Status__c ='Draft';
            }

            update event;
            system.debug('@@@@EventDatas--->' + event);
            return event;
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }

    public class wrapperData{
        public String Name { get; set; }
        public String Description { get; set; }
        public datetime StartDate { get; set; }
        public datetime EndDate { get; set; }
        public String Status { get; set; }
        public String Message { get; set; }
    }

    @AuraEnabled 
    public static List<Event__c> sendEvent(String evId) {
        system.debug('@@@@ eId---> '+ evId);
        try{
            List<Event__c> event = eventQuery.getEventList(evId);
            for(Event__c even : event){
                    even.Status__c = 'Submitted';
            }

            update event;
            system.debug('@@@@EventDatas--->' + event);
            return event;
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    @AuraEnabled
    public static List<Event__c> updateEven(String updEven, String eId) {
        system.debug('@@@@updEven--->' + updEven);
        system.debug('@@@@ eId---> '+ eId);
        try{
            wrapperDataToUpdate datas = (wrapperDataToUpdate)JSON.deserialize(updEven, wrapperDataToUpdate.class);
            User u = userQuery.getUserInfoId();
            String conId = u.RH_ContactId__c;
            List<Event__c> event = eventQuery.getEventList(eId);
            for(Event__c even : event){
                if(even.Status__c=='Approved'){
                    even.Message__c='Event has been already sent';
                }else if(even.Status__c=='Rejected'){
                    even.Message__c='Event has been already rejected';
                }else{
                    even.Name = datas.Name;
                    even.Description__c  = datas.Description;
                    even.Start_Dates__c =datas.StartDate;
                    even.End_Dates__c =datas.EndDate;
                    even.Status__c = 'Draft';
                }
            }

            update event;
            system.debug('@@@@EventDatas--->' + event);
            return event;
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    @AuraEnabled
    public static List<Event__c> updateAndSendEven(String updEven, String eId){
        system.debug('@@@@updEven--->' + updEven);
        system.debug('@@@@ eId---> '+ eId);
        try{
            wrapperDataToUpdate datas = (wrapperDataToUpdate)JSON.deserialize(updEven, wrapperDataToUpdate.class);
            User u = userQuery.getUserInfoId();
            String conId = u.RH_ContactId__c;
            List<Event__c> event = eventQuery.getEventList(eId);
            for(Event__c even : event){
                even.Name = datas.Name;
                even.Description__c  = datas.Description;
                even.Start_Dates__c =datas.StartDate;
                even.End_Dates__c =datas.EndDate;
                even.Status__c ='Submitted';
            }

            update event;
            system.debug('@@@@EventDatas--->' + event);
            return event;
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    public class wrapperDataToUpdate{
        public String Name { get; set; }
        public String Description { get; set; }
        public datetime StartDate { get; set; }
        public datetime EndDate { get; set; }
        public String Status { get; set; }
        public String Message { get; set; }
    }
    
    @AuraEnabled
    public static List<Event__c> deleteEvent(String evid) {
        system.debug('@@@@ eId---> '+ evid );
        try{
            User u = userQuery.getUserInfoId();
            String conId = u.RH_ContactId__c;
            String userRole = u.UserRole.Name;
            system.debug('@@@@ userRole---> '+ userRole );
            List<Event__c> event = eventQuery.getEventList(evid);
            system.debug('&&&event ---> '+ event[0] );
            if(userRole=='CEO' || userRole =='Human Resource Managment'){
                for(Event__c ev : event){
                    system.debug('@@@@ ev ---> '+ ev );
                    if(ev.Status__c=='Submitted'){
                        ev.Message__c='Event do not send';
                    }else{
                        delete ev;
                    }
                }
            }else{
                for(Event__c ev : event){
                    if(ev.Status__c=='Draft' || ev.Status__c=='Rejected'){
                        delete ev;
                    }else{
                        ev.Message__c='Right no allowed';
                    }
                }
                
            }
            system.debug('@@@@ event---> '+ event );
            return event;
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    @AuraEnabled 
    public static Event__c checkStatus(String evid){
        Event__c even = eventQuery.getEvent(evid);
        if(even.Status__c=='Submitted' || even.Status__c=='Approved' || even.Status__c=='Rejected'){
            even.Message__c='No right to modify the event';
        }
        system.debug('@@@@ event---> '+ even );
        return even;
    }
    @AuraEnabled 
    public static List<User> getIdUserCEO(){
        List<Event__c> event = eventQuery.get_EventList();
        List<String> ids = new List<String>();
        for(Event__c ev : event){
            String id = ev.Contact_Id__c;
            ids.add(id);
        }
        system.debug('@@@@ USER---> '+ ids );
        List<User> u = userQuery.getIdUser(ids);
        system.debug('@@@@ USER---> '+ u );
        return u;
    }
    @AuraEnabled 
    public static List<User> getIdUser(String idU){
        List<String> idUs = new List<String>();
        idUs.add(idU);
        List<User> u = userQuery.getIdUser(idUs); //[Select Id,RH_ContactId__c,UserRole.Name From User Where RH_ContactId__c =: idU];
        system.debug('@@@@ USER---> '+ u );
        return u;
    }
    @AuraEnabled 
    public static String getInfoUsers() {
        String userinf = UserInfo.getUserId();
        return userinf;
    }
    @AuraEnabled
    public static List<User> getInfBaseUsers() {
        List<Id> conIds = new List<Id>();
        List<Event__c> even = eventQuery.get_EventList();
        for(Event__c e : even){
            conIds.add(e.Contact_Id__c);
        }
        List<User> u = userQuery.getInfoUser(conIds);
        return u;
    }
    @AuraEnabled
    public static List<Event__c> getEventInfos(String infoId) {
        List<Event__c> even = eventQuery.getEventList(infoId);
        for(Event__c ev : even){
            if(ev.Status__c=='Approved'){
                    ev.Message__c='Already approved';
            }else{
                    ev.Status__c='Approved';
            }
        }
        system.debug('@@---> ' + even);
        update even;
        return even;
    }
    @AuraEnabled 
    public static List<Event__c> changeEventStatus(String infoId) {
        List<Event__c> even = eventQuery.getEventList(infoId);
        for(Event__c ev : even){
            if(ev.Status__c=='Approved'){
                ev.Message__c='Already approved';
            }else{
                ev.Status__c='Rejected';
                ev.Description__c='We don\'t consider it very important';
            }
        }
        system.debug('@@---> ' + even);
        update even;
        return even;
    }   

    @AuraEnabled(cacheable=true)
    public static void sendNotifications(String strBody, String strSenderId, String pgRefId, String strTargetId, String strTitle,List<String> setUserIds) {
        set<String> setUserId = new set<String>();
        for(String s : setUserIds){
            setUserId.add(s);
        }
        system.debug('@@@@pgRefIdId--->  ' + pgRefId);
        
        // String pgRef = '{ type : "standard__recordPage",attributs :{recordId : 0017Q00000Dck8lQAB ,objectApiName : "Account",actionName : "view"} }' ;
        String pgRef = '{type : \'comm__namedPage\',attributes : {pageName : \'event-management\'},state: {\'recordId\': '+pgRefId+'}}' ;
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

    @AuraEnabled 
    public static Map<String,Object>  InitFilter(){

        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        
        try {
            List<RH_Utility.PickOption> OrderBys = new List<RH_Utility.PickOption>();
            OrderBys.add(new RH_Utility.PickOption('None', ''));
            OrderBys.add(new RH_Utility.PickOption('Created Date', 'CreatedDate'));
            OrderBys.add(new RH_Utility.PickOption('Name', 'Name'));
            // OrderBys.add(new RH_Utility.PickOption('Created Date', 'CreatedDate'));
            // List<RH_WorkGroup__c> grps=workGroupQry.getActiveWorkgroups();
            mapReturn.put('OrderBys',OrderBys); 
            mapReturn.put('Picklists',RH_Utility.getPickListOptions(new List<String> {'Status__c'},'Event__c')); 
            //mapReturn.putAll(RH_Utility.checkRole()); 
            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }

    @AuraEnabled
    public static String uploadFile(String base64, String filename, String recordId) {
        return RH_FileUploader.uploadFile(base64, filename, recordId);
    }

    @AuraEnabled
    public static Map<String, Object> getRelatedFilesByRecordId(String recordId){
        return RH_FileUploader.getFileInfos(recordId); 
    }
 
    @AuraEnabled
    public static List<String> checkcontentDocumentByRcrdId(String recId) {
        List<ContentDocumentLink> files = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recId];
        List<String> strList = new List<String>();
        for (ContentDocumentLink docLink : files) {
            String str = docLink.ContentDocumentId;
            strList.add(str);
        }
        return strList;
    }
    @AuraEnabled
    public static Boolean checkcontentDocumentId(String recId, String docId) {
        List<ContentDocumentLink> files = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recId];
        Boolean bool = true;
        Boolean str;
        for (ContentDocumentLink docLink : files) {
            if(docLink.ContentDocumentId == docId){
                str = bool;
            }else{
                str = !bool;
            }
        }
        return str;
    }

    @AuraEnabled
    public static void deleteFile(String recId, String docId){
        RH_FileUploader.deleteFile(recId, docId);
    }
    @AuraEnabled
    public static List<ContentDocument> checkcontentDocumentByRcrdIdTest() {
        String recId = 'a087Q000000OkKAQA0';
        List<ContentDocumentLink> files = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recId];
        List<Id> listId = new List<Id>();
        for(ContentDocumentLink file : files){
            listId.add(file.ContentDocumentId);
        }
        system.debug('@@@ listId --->'+ listId);
        List<ContentDocument> ContntDocmnt = [SELECT Id, Title, FileType FROM ContentDocument WHERE Id IN : listId];
        system.debug('@@@ ContntDocmnt --->'+ ContntDocmnt);
        return ContntDocmnt;
    }
}