public with sharing class RH_Project_controller {

    private static RH_Project_Query projectQry = RH_Project_Query.getInstance();
    private static RH_Project_Query projectQry1 = RH_Project_Query.getInstance();
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();

    public class ReturnClass {
        @AuraEnabled
        public Project__c project{get;set;}
         @AuraEnabled
        public List<RH_Participation__c> projectMembers{get;set;}
         @AuraEnabled
         public List<Contact> projectNotMembers{get;set;}
         @AuraEnabled
         public List<Contact> allContact{get;set;}
         @AuraEnabled
         public List<Contact> allInitContact{get;set;}
    }

    public class ReturnClass11 {
        @AuraEnabled
        public Project__c project{get;set;}
         @AuraEnabled
        public List<RH_Participation__c> projectMembers{get;set;}
    }

    public class ReturnClass12 {
        @AuraEnabled
        public List<Contact> projectNotMembers{get;set;}
         @AuraEnabled
        public List<RH_Participation__c> projectMembers{get;set;}
    }

    @AuraEnabled
    public static List<Project__c> getProjectList() {

        List<ReturnClass> returnList = new List<ReturnClass>();
        
        List<Project__c> projects=projectQry.getProject();
        return projects;
    }

    @AuraEnabled
    public static List<Contact> getTeamMemberList() {

        
        List<Contact> cont=contactQry.getEligibleTeamMembers();
        return cont;
    }

    @AuraEnabled
    public static List<Contact> getInitialMembersList() {

        
        List<Contact> initcont=contactQry.getAllContactInitial();
        return initcont;
    }
    
    @AuraEnabled
    public static ReturnClass11 getProject(String ProjectId) {

        ReturnClass11 returnList = new ReturnClass11();
        List<Project__c> proj=projectQry.getProjectById(ProjectId);
        List<RH_Participation__c> proMem=projectQry.getMembers(ProjectId);
        returnList.project = proj[0];
        returnList.projectMembers = proMem;
        return returnList;
    }

    @AuraEnabled
    public static ReturnClass12 getEditMemberList(String ProjectId) {

        ReturnClass12 returnList = new ReturnClass12();
        List<Project__c> proj=projectQry.getProjectById(ProjectId);
        List<RH_Participation__c> proMem=projectQry.getMembers(ProjectId);
        List<Contact> proNotMem=projectQry1.getNotMembers(ProjectId,proj[0].Project_Manager__c);
        returnList.projectNotMembers = proNotMem;
        returnList.projectMembers = proMem;
        return returnList;
    }

    // @AuraEnabled(cacheable=true)
    // public static List<ReturnClass> getProjectMembers() {

    //     List<ReturnClass> returnList = new List<ReturnClass>();
        
    //     List<Project__c> projects=projectQry.getProject();
    //     List<Contact> cont=contactQry.getAllContact();
    //     List<Contact> initcont=contactQry.getAllContactInitial();
    //     for (Project__c pro : projects) {
    //         ReturnClass retCls = new ReturnClass();
    //         List<RH_Participation__c> proMem=projectQry.getMembers(pro.Id);
    //         List<Contact> proNotMem=projectQry1.getNotMembers(pro.Id,pro.Project_Manager__c);
    //         retCls.project = pro;
    //         retCls.projectMembers = proMem;
    //         retCls.projectNotMembers = proNotMem;
    //         retCls.allContact = cont;
    //         retCls.allInitContact = initcont;
    //         returnList.add(retCls);
    //     }
    //     system.debug('returnList'+returnList); 
    //     return returnList;
    // }

    @AuraEnabled
    public static Project__c insertProjectMethod(Project__c ProjectObj,List<RH_Participation__c> participation){
        try {
            List<Account> acc=contactQry.getAccountId();
            ProjectObj.RH_Account_ID__c = acc[0].id;
            insert ProjectObj;
            for (RH_Participation__c part : participation) {
                part.RH_Project__c = ProjectObj.id;
            }
            insert participation;
            return ProjectObj;
        } catch (Exception exp) {
            system.debug('exception'+exp.getMessage());
            throw new AuraHandledException(exp.getMessage());
        }
    }

    @AuraEnabled
    public static Project__c insertProjectupdated(Project__c ProjectObj,String IDProject){
        try {
            List<Project__c> proj=projectQry.getProjectById(IDProject);
            for(Project__c pro :proj){
                pro.Status__c = ProjectObj.Status__c;
                pro.Start_Date__c = ProjectObj.Start_Date__c;
                pro.Name = ProjectObj.Name;
                pro.Project_Manager__c = ProjectObj.Project_Manager__c;
                pro.Link__c = ProjectObj.Link__c;
                pro.End_Date__c = ProjectObj.End_Date__c;
                pro.Description__c = ProjectObj.Description__c;
            }
            update proj;
            system.debug('proj  '+proj); 
            return proj[0];
        } catch (Exception exp) {
            system.debug('exception'+exp.getMessage());
            throw new AuraHandledException(exp.getMessage());
        }
    }

    @AuraEnabled
    public static Boolean insertUpdateMembers(List<RH_Participation__c> AddMembers,List<RH_Participation__c> MoveMembers){
        try {
            if(AddMembers.size()>0){
                insert AddMembers;
            }
            
            List<String> lstr = new List<String>();
            for (RH_Participation__c part : MoveMembers) {
                lstr.add(part.RH_Contact__c);
            }
            List<RH_Participation__c> proMem=projectQry.getParticipate(lstr);
            delete proMem;
            return true;
        } catch (Exception exp) {
            system.debug('exception'+exp.getMessage());
            throw new AuraHandledException(exp.getMessage());
           
        }
    }

    @AuraEnabled
    public static String uploadFile(String base64, String filename, String recordId) {
          ContentVersion cv = createContentVersion(base64, filename);
          ContentDocumentLink cdl = createContentLink(cv.Id, recordId);
          if (cv == null || cdl == null) { return null; }
          return cdl.Id;
    }

    private static ContentVersion createContentVersion(String base64, String filename) {
        ContentVersion cv = new ContentVersion();
        cv.VersionData = EncodingUtil.base64Decode(base64);
        cv.Title = filename;
        cv.PathOnClient = filename;
        try {
          insert cv;
          return cv;
        } catch(DMLException e) {
          System.debug(e);
          return null;
        }
    }

    private static ContentDocumentLink createContentLink(String contentVersionId, String recordId) {
                    if (contentVersionId == null || recordId == null) { return null; }
                        ContentDocumentLink cdl = new ContentDocumentLink();
                        cdl.ContentDocumentId = [
                        SELECT ContentDocumentId 
                        FROM ContentVersion 
                        WHERE Id =: contentVersionId
                        ].ContentDocumentId;
                        cdl.LinkedEntityId = recordId;
                        // ShareType is either 'V', 'C', or 'I'
                        // V = Viewer, C = Collaborator, I = Inferred
                        cdl.ShareType = 'V';
                        try {
                        insert cdl;
                        return cdl;
                        } catch(DMLException e) {
                        System.debug(e);
                        return null;
                        }
    }

    @AuraEnabled
    public static Map<ID, Object> getRelatedFilesByRecordId(String recordId) {
        // Get record file IDs        
        List<ContentDocumentLink> files = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recordId];
        List<ID> fileIDs = new List<ID>();
        for (ContentDocumentLink docLink : files) {
            fileIDs.add(docLink.ContentDocumentId);
        }
 
        List<ContentVersion> docs = [SELECT ContentDocumentId,VersionData, FileExtension, Title 
            FROM ContentVersion WHERE ContentDocumentId IN : fileIDs];
        Map<ID, Object> mapIdTitle = new Map<ID, Object>();
        for (ContentVersion docLink : docs) {
            Map<string, Object> mapobj = new Map<string, Object>();
            mapobj.put('obj', docLink);
            mapobj.put('link', EncodingUtil.base64Encode(docLink.VersionData));
            mapIdTitle.put(docLink.ContentDocumentId, mapobj);
        }
        return mapIdTitle;
    }
}