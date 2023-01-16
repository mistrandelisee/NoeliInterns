public without sharing class RH_EventController implements RH_SummarizeInterface{

    private static RH_Event_Query eventQuery = RH_Event_Query.getInstance();
    private static RH_User_Query userQuery = RH_User_Query.getInstance();
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    
    static String EVENT_SUBMITTED_ACTION= 'TG_EVENT_SUBMITTED';
    static String EVENT_REJECTED_ACTION= 'TG_EVENT_REJECTED';
    static String EVENT_PUBLISHED_ACTION= 'TG_EVENT_PUBLISHED';
    
    private static final String APPROVE_STATUS='Approved';
    private static final String REJECT_STATUS='Rejected';
    private static final String SUBMITTED_STATUS='Submitted';
    public static Map<String,Object> StatusMapping = new Map<String, String>();
    public static Map<String,Object> LabelMapping = new Map<String, String>();
    private static String STATUSKEY='Status__c';
    static{
        RH_Constans cons= RH_Constans.getAllConstants();
        StatusMapping= new Map<String, Object>{
                            STATUSKEY.toLowerCase()=> new Map<String, String>{
                                APPROVE_STATUS.toLowerCase()=> ' slds-theme_success ',
                                RH_Constans.DRAFT_STATUS.toLowerCase()=> ' slds-theme_info ',
                                SUBMITTED_STATUS.toLowerCase()=> ' slds-theme_warning ',
                                // RH_Constans.DRAFT_STATUS.toLowerCase()=> ' slds-theme_alt-inverse  ',
                                REJECT_STATUS.toLowerCase()=> ' slds-theme_error '
                            }
        };
        // String valueKey='Value'+fieldName;
        Map<String, Object> picklists=RH_Utility.getPickListOptions(new List<String> {STATUSKEY},'Event__c');
        LabelMapping= new Map<String, Object>{
            STATUSKEY.toLowerCase()=> (Map<String, String>)picklists.get('ValueStatus__c')
        };
        // System.debug(picklists);
    }
    // EM 9-12-2022 ----- Start
    @AuraEnabled 
    public static Map<String,Object>  getEventDetails(String eventId){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            String myUserId=UserInfo.getUserId();
            Event__c evt = eventQuery.getEvent(eventId);

            String userId=evt.CreatedById;
            mapReturn.put('Event',evt); 
            mapReturn.put('isMine',myUserId.equalsIgnoreCase(userId));
            mapReturn.put('classMapping',StatusMapping.get(STATUSKEY.toLowerCase())); 
            mapReturn.putAll(RH_Utility.checkRole()); 
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
    public static Map<String,Object>  getOtherEvents(String filterTxt){
        Map<String, Object> mapReturn = new Map<String, Object>();
        List<Map<String, Object>> listcon = new List<Map<String, Object>>();
        mapReturn.put('error',false);
        try {
            
            mapReturn.put('filterTxt',filterTxt); 
            FilterWrapper filter= (FilterWrapper) JSON.deserialize(filterTxt, FilterWrapper.class); 

            Contact currentContact = RH_Utility.getCurentContact(); 
            String AccountId=currentContact.AccountId; 

            if(filter.status == null || filter.status?.isEmpty()){
                String Role=currentContact.RH_Role__c;
                Boolean isAdmin=(RH_Constans.CONTACT_ROLE_CEO.equalsIgnoreCase(Role) || RH_Constans.CONTACT_ROLE_RH.equalsIgnoreCase(Role));
                List<String> Status= isAdmin ? new List<String>{SUBMITTED_STATUS,APPROVE_STATUS} : new List<String>{APPROVE_STATUS};
                filter.status = status;
            }
            // filter.ownerId=Userinfo.getUserId();
            List<Event__c> events=eventQuery.getFilteredEvents(filter,AccountId);
            
           
            mapReturn.put('Events',events); 
            mapReturn.put('in',filter); 
            mapReturn.put('classMapping',StatusMapping.get(STATUSKEY.toLowerCase())); 
            // mapReturn.put('users',users); 
            mapReturn.put('Constants',RH_Constans.getAllConstants()); 

            mapReturn.putAll(RH_Utility.checkRole()); 
            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('msgLine',e.getStackTraceString());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }
    String conditionMyEvents(String field){
        String conditionStr = '';
        conditionStr =' CreatedById= \''+String.escapeSingleQuotes(Userinfo.getUserId()) +'\' AND '+field+'!=Null';
        return conditionStr;
    }
    String conditionOthersEvents(Contact currentContact,String field){
        String Role=currentContact.RH_Role__c;
        String AccountId=currentContact.AccountId; 
        Boolean isAdmin=(RH_Constans.CONTACT_ROLE_CEO.equalsIgnoreCase(Role) || RH_Constans.CONTACT_ROLE_RH.equalsIgnoreCase(Role));
        List<String> Status= isAdmin ? new List<String>{SUBMITTED_STATUS,APPROVE_STATUS} : new List<String>{APPROVE_STATUS};

        // \''+String.escapeSingleQuotes(Userinfo.getUserId()) +'\' AND '+field+'!=Null';1
        // conds.add('(Status__c IN: status)');conds.add('(Contact_Id__r.AccountId=:AccountId)');
        String conditionStr = '';
        conditionStr =' Contact_Id__r.AccountId= \''+ String.escapeSingleQuotes(AccountId) +'\' AND Status__c IN (\''+ String.join(status, '\',\'') +'\') AND '+field+'!=Null';
        return conditionStr;
    }
    @AuraEnabled 
    public static Map<String,Object>  getMyEvents(String filterTxt){
        Map<String, Object> mapReturn = new Map<String, Object>();
        List<Map<String, Object>> listcon = new List<Map<String, Object>>();
        mapReturn.put('error',false);
        try {
            
            mapReturn.put('filterTxt',filterTxt); 
            FilterWrapper filter= (FilterWrapper) JSON.deserialize(filterTxt, FilterWrapper.class); 
            filter.ownerId=Userinfo.getUserId();
            List<Event__c> events=eventQuery.getFilteredEvents(filter,null);
            
           
            mapReturn.put('Events',events); 
            mapReturn.put('in',filter); 
            mapReturn.put('classMapping',StatusMapping.get(STATUSKEY.toLowerCase())); 
            mapReturn.put('Constants',RH_Constans.getAllConstants()); 

            mapReturn.putAll(RH_Utility.checkRole()); 
            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('msgLine',e.getStackTraceString());
            mapReturn.put('e',e);
        }  
        return mapReturn;
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
            conditionStr=conditionMyEvents(groupByStr);
        }else{
            conditionStr=conditionOthersEvents(currentContact,groupByStr);
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
    public static Event__c saveEventApex(String objEven) {
        system.debug('@@@@EventDatas' + objEven);
        try{
            eventWrapper evt = (eventWrapper)JSON.deserialize(objEven, eventWrapper.class);
            User u = userQuery.getUserInfoId();
            String conId = u.RH_ContactId__c;
            return saveEvent(evt,conId);
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage()+' '+ex.getStackTraceString());
        }
    }

    @AuraEnabled
    public static Event__c sendEventApex(String objEven) {
        system.debug('@@@@EventDatas' + objEven);
        try{
            eventWrapper evt = (eventWrapper)JSON.deserialize(objEven, eventWrapper.class);
            User u = userQuery.getUserInfoId();
            String conId = u.RH_ContactId__c;
            Event__c event= saveEvent(evt,conId);
            sendEvent(event);

            return event;
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    @AuraEnabled 
    public static void  cancelEvent(String eventId){
        Event__c ev = new Event__c(Id=eventId);
        delete ev;
    }
    
    private static Event__c saveEvent(eventWrapper evt,String ownerConId) {
        system.debug('@@@@ evt -->' + evt);
        // User u = userQuery.getUserInfoId();
        // String conId = u.RH_ContactId__c;	
        Event__c even = evt.buildEvt(ownerConId);
        system.debug('@@@@ even -->' + even);
        upsert even;

        if (evt.hasFile) {
            uploadFile(evt.fileObj.base64, evt.fileObj.filename, even.Id);
        }
        
        return even;
    }
    private static void sendEvent(Event__c event) {
        Event__c evt = eventQuery.getEvent(event.Id);
        String strBody = String.isBlank(evt.Description__c)? evt.Name : evt.Description__c;
        String recordId = evt.Id;
        String strTitle = evt.Name;
        List<String> receivers = new List<String>();
        for (Contact rcv : contactQry.getEligibleAdministrator()) {
            if(String.isNotBlank(rcv.RH_User__c)){
                receivers.add(rcv.RH_User__c);
            }
        }
        notify(EVENT_SUBMITTED_ACTION,strBody,recordId,strTitle,receivers);
    }
    
    private static void notify(String action,String strBody, String recordId,  String strTitle,List<String> setUserIds) {
        system.debug('@@@@pgRefIdId--->  ' + recordId);
        String pgRef = '{type : \'comm__namedPage\',attributes : {pageName : \'Event\'},state: {\'recordId\': '+recordId+'}}' ;
        system.debug('@@@@pgRef--->  ' + pgRef);
        RH_Notification_Utility.notify(strBody, pgRef,  strTitle, setUserIds);
        // RH_telegramMessageConfigImpl.notifyTelegramAsync(action, recordId, setUserIds);
    }
    @AuraEnabled 
    public static Event__c approvalEvent(String eventJson){
        system.debug('@@@@EventDatas' + eventJson);
        try{
            Contact con=RH_Utility.getCurentContact();
            eventWrapper evt = (eventWrapper)JSON.deserialize(eventJson, eventWrapper.class);
            evt.ApproverId=con.Id;
            Event__c event= saveEvent(evt,null);
            if (REJECT_STATUS.equalsIgnoreCase(event.Status__c)) {
                notifySender(event);
            }else{
                if (APPROVE_STATUS.equalsIgnoreCase(event.Status__c)) {
                    notifyAll(event);
                } 
            }

            return event;
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        } 
    }
    private static void notifySender(Event__c event) {
        Event__c evt = eventQuery.getEvent(event.Id);
        String strBody = label.rh_reason+': '+ (String.isBlank(evt.Message__c)? evt.Description__c : evt.Message__c)+'\n'+label.rh_moreInfo;
        String recordId = evt.Id;
        String strTitle = label.rh_Event+ ': ' + evt.Name +'('+label.rh_Reject+')';
        List<String> receivers = new List<String>();
        for (User rcv : userQuery.getUserByContactId(evt.Contact_Id__c)) {
            receivers.add(rcv.Id);
        }
        notify(EVENT_REJECTED_ACTION,strBody,recordId,strTitle,receivers);
    }
    private static void notifyAll(Event__c event) {
        Event__c evt = eventQuery.getEvent(event.Id);
        String strBody = (String.isBlank(evt.Description__c) ? (String.isBlank(evt.Message__c)? evt.Name : evt.Message__c) : evt.Description__c)+'\n'+label.rh_moreInfo;
        String recordId = evt.Id;
        String strTitle = label.rh_New+ ' ' +label.rh_Event+ ': ' + evt.Name ;
        List<String> receivers = new List<String>();
        for (Contact rcv : contactQry.getAllActiveContacts()) {
            if(String.isNotBlank(rcv.RH_User__c)){
                receivers.add(rcv.RH_User__c);
            }
        }
        notify(EVENT_PUBLISHED_ACTION,strBody,recordId,strTitle,receivers);
    }



    public class FilterWrapper {
        @AuraEnabled public String searchText{get;set;}
        @AuraEnabled public String ownerId{get;set;}
        @AuraEnabled public List<String> status{get;set;}
        @AuraEnabled public Datetime startDate{get;set;}
        @AuraEnabled public Datetime endDate{get;set;}
        @AuraEnabled public String orderBy{get;set;}
        @AuraEnabled public String orderOn{get;set;}
    } 
    
    public class eventWrapper{
        public String Name { get; set; }
        public String Id { get; set; }
        public String Description { get; set; }
        public datetime StartDate { get; set; }
        public datetime EndDate { get; set; }
        public String Status { get; set; }
        public String Message { get; set; }
        public String ApproverId { get; set; }
        public Boolean hasFile { get; set; }
        public fileWrapper fileObj { get; set; }
        public Event__c buildEvt(string conId){
            Event__c even = new Event__c( );
            if (String.isNotBlank(this.Name)) {
                even.Name = this.Name;
            }
            if (String.isNotBlank(this.status)) {
                even.Status__c = this.status;
            }
            if (String.isNotBlank(this.Description)) {
                even.Description__c = this.Description;
            }
            if (String.isNotBlank(conId)) {
                even.Contact_Id__c = conId;
            }
            if (this.StartDate!= null) {
                even.Start_Dates__c =this.StartDate;
            }
            if (this.EndDate!= null) {
                even.End_Dates__c =this.EndDate;
            }
            if (String.isNotBlank(Message)) {
                even.Message__c =this.Message;
            }
            if (String.isNotBlank(ApproverId)) {
                even.RH_Approver__c =this.ApproverId;
            }
            even.Id = this.Id;
            system.debug('@@@@ even IN -->' + even);
            return even;
        }
    }
    
    public class fileWrapper{
        public String base64 { get; set; }
        public String filename { get; set; }
    }


    /*
        @@@@kb Add 
        27/05/2022
    */
    @AuraEnabled
    public static List<Event__c>  getMyLastEvent(Integer endLimit){
        return eventQuery.getMyLastEvent(endLimit);
    }

    @AuraEnabled
    public static List<Event__c>  getEventList(){
        try{
            System.debug('UserInfo-->' + UserInfo.getUserId());
            User u = userQuery.getUserInfoId();
                String conId = u.RH_ContactId__c;
                String userRole = u.UserRole.Name;
                if(userRole == 'CEO' || userRole =='Human Resource Managment' || userRole =='RH Manager' || userRole =='Team Leader' || userRole =='Group Leader' || userRole =='Base User'){
                    System.debug('event-->' + eventQuery.getEventListByUserRole(userRole,conId));
                    return eventQuery.getEventListByUserRole(userRole,conId);
                }else{
                    return null;
                }
            }
            catch(Exception ex) {
                throw new AuraHandledException(ex.getMessage());
            }
        // return [SELECT Id, Name,Phone,Industry FROM Account order by createddate desc LIMIT 5];
    }
    
    @AuraEnabled 
    public static Event__c  getEvent(String evId){
        Event__c ev = eventQuery.getEvent(evId);
        return ev;
    }
    
    @AuraEnabled
    public static List<Event__c> getEventEdite(String evenId) {
        try{
            System.debug('UserInfo-->' + UserInfo.getUserId());
            User u = userQuery.getUserInfoId();
            String conId = u.RH_ContactId__c;
            String userRole = u.UserRole.Name;
            if(userRole == 'CEO' || userRole =='Human Resource Managment' || userRole =='RH Manager' || userRole =='Team Leader' || userRole =='Group Leader' || userRole =='Base User'){
                return eventQuery.getEventList(evenId);
            }else{
                return null;
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
                if(userRole == 'CEO' || userRole =='Human Resource Managment' || userRole =='RH Manager' || userRole =='Team Leader' || userRole =='Group Leader'){
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
             system.debug('@@@@EventDatasReturn'+ ex.getMessage());
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
            if(userRole =='CEO' || userRole =='Human Resource Managment' || userRole =='RH Manager' || userRole =='Team Leader' || userRole =='CEO'){
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
        List<User> u = userQuery.getInfOfTeam();
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
    public static String getUserInfoId() {
        User u = userQuery.getUserInfoId();
            String conId = u.RH_ContactId__c;
            system.debug('@@@@ conId---> '+ conId );
        return conId;
    }

    @AuraEnabled
    public static List<User> getInfOfAllUsers() {
        List<User> us = userQuery.getInfOfAllUsers();
        return us;
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
    
    @AuraEnabled 
    public static String getInfoUsers() {
        String userinf = UserInfo.getUserId();
        return userinf;
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
            // this.isDefault = isDefault;
        }
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
    public static void deleteFile(String recId, String docId){
        RH_FileUploader.deleteFile(recId, docId);
    }
    
    // @AuraEnabled
    // public static List<String> checkcontentDocumentByRcrdId(String recId) {
    //     List<ContentDocumentLink> files = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recId];
    //     List<String> strList = new List<String>();
    //     for (ContentDocumentLink docLink : files) {
    //         String str = docLink.ContentDocumentId;
    //         strList.add(str);
    //     }
    //     return strList;
    // }
    // @AuraEnabled
    // public static Boolean checkcontentDocumentId(String recId, String docId) {
    //     List<ContentDocumentLink> files = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recId];
    //     Boolean bool = true;
    //     Boolean str;
    //     for (ContentDocumentLink docLink : files) {
    //         if(docLink.ContentDocumentId == docId){
    //             str = bool;
    //         }else{
    //             str = !bool;
    //         }
    //     }
    //     return str;
    // }

    // @AuraEnabled
    // public static List<ContentDocument> checkcontentDocumentByRcrdIdTest() {
    //     String recId = 'a087Q000000OkKAQA0';
    //     List<ContentDocumentLink> files = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recId];
    //     List<Id> listId = new List<Id>();
    //     for(ContentDocumentLink file : files){
    //         listId.add(file.ContentDocumentId);
    //     }
    //     system.debug('@@@ listId --->'+ listId);
    //     List<ContentDocument> ContntDocmnt = [SELECT Id, Title, FileType FROM ContentDocument WHERE Id IN : listId];
    //     system.debug('@@@ ContntDocmnt --->'+ ContntDocmnt);
    //     return ContntDocmnt;
    // }
    @AuraEnabled
    public Static List<Event__c> filterRequest(String searchText, String name, String status, Datetime startDate, Datetime endDate){


        searchText = String.isNotBlank(searchText) ? searchText : '';
        String l_name = String.isNotBlank(name) ? '%'+name+'%' : '';
        String query= 'SELECT Id,Name,Contact_Id__c,Description__c,Start_Dates__c,End_Dates__c,toLabel(Status__c)StatusLabel ,Status__c,Message__c,CreatedBy.UserRole.Name FROM Event__c';
        Boolean check = false;
        String currentUser = UserInfo.getUserId();
        system.debug('query ---> ' + query);
        system.debug('currentUser--> '+ currentUser);

        if(searchText != null){

            String text = '%'+searchText+'%';

            if(check){
                query+= ' AND Name LIKE: text';
            }else{
                System.debug('### CASE 2 ###');
                query+= ' WHERE Name LIKE: text' + ' AND CreatedById=:currentUser';
                check = true;
            } 
            
        }

        if(l_name != null && l_name != ''){
            if(check){
                query+= ' AND Name LIKE: l_name';
            }else{
                query+= ' WHERE '+' Name LIKE: l_name' + ' AND CreatedById=:currentUser';
                check = true;
            }
        }
        if(String.isNotBlank(status)){
            if(check){
                query+= ' AND Status__c =:status';
            }else{
                query+= ' WHERE '+' Status__c =:status' + ' AND CreatedById=:currentUser';
                check = true;
            }
        }
        if(startDate != null){
            if(check){
                query+= ' AND CreatedDate >= :startDate ';
            }else{
                query+= ' WHERE '+' CreatedDate >= :startDate ' + ' AND CreatedById=:currentUser';
                check = true;
            }
        }
        if(endDate != null){
            Datetime myEndDate = endDate.addDays(1);
            if(check){
                query+= ' AND CreatedDate < :myEndDate ';
            }else{
                query+= ' WHERE '+' CreatedDate < :myEndDate ' + ' AND CreatedById=:currentUser';
                check = true;
            }
        }
        if(check){
            query+= ' ORDER BY CreatedDate DESC';
            system.debug('### result #####'+query);
            return Database.query(query);
        }
        return null;
    }
}