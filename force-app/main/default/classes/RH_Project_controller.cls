public class RH_Project_controller {

    private static RH_Project_Query projectQry = RH_Project_Query.getInstance();
    private static RH_Project_Query projectQry1 = RH_Project_Query.getInstance();
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    private static RH_User_Query userQry = RH_User_Query.getInstance();

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

    public class ProjectTo {
        @AuraEnabled
        public String Name{get;set;}
        @AuraEnabled
        public String Description{get;set;}
        @AuraEnabled
        public String Manager{get;set;}
        @AuraEnabled
        public String Status{get;set;}
        @AuraEnabled
        public String Link{get;set;}
         @AuraEnabled
        public Date Startdate{get;set;}
        @AuraEnabled
        public String Enddate{get;set;}
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

   

    @AuraEnabled 
    public static Project__c insertProjectMethod(ProjectTo project,List<String> participation){
        // public static Project__c insertProjectMethod(String Name,String Description,Date Startdate,String Manager,Date Enddate,List<String> participation){
        try {
            system.debug('Startdate' +project.Startdate);
            List<User> acc11=userQry.getUserById(UserInfo.getUserId());
            List<Contact> acc=contactQry.getAccountId(acc11[0].RH_ContactId__c);
            List<RH_Participation__c> listParti = new List<RH_Participation__c>();
            Project__c ProjectObj = new Project__c();
            ProjectObj.RH_Account_ID__c = acc[0].AccountId;
            ProjectObj.Name = project.Name;
            if (String.isNotBlank(project.Description)) {
                ProjectObj.Description__c = project.Description;
            }
            if (String.isNotBlank(project.Description)) {
                ProjectObj.End_Date__c = date.valueOf(project.Enddate);
            }
            ProjectObj.Start_Date__c = project.Startdate;
            ProjectObj.Project_Manager__c = project.Manager;
            
            insert ProjectObj;
            for (String Idpartici : participation) {
                RH_Participation__c part = new RH_Participation__c();
                part.RH_Project__c = ProjectObj.id;
                part.RH_Contact__c = Idpartici;
                listParti.add(part);
            }
            insert listParti;
            return ProjectObj;
            // return null;
        } catch (Exception exp) {
            system.debug('exception'+exp.getMessage());
            throw new AuraHandledException(exp.getMessage());
        }
    }

    @AuraEnabled
    public static Project__c insertProjectupdated(ProjectTo project,String IDProject){
        try {
            system.debug('Startdate' +project.Startdate);
            system.debug('Name'+project.Name);
            system.debug('Manager'+project.Manager);
            system.debug('Description'+project.Description);
            List<Project__c> proj=projectQry.getProjectById(IDProject);
            for(Project__c pro :proj){
                if (String.isNotBlank(project.Status)) {
                pro.Status__c = project.Status;
                }
                pro.Start_Date__c = project.Startdate;
                pro.Name = project.Name;
                pro.Project_Manager__c = project.Manager;
                if (String.isNotBlank(project.Link)) {
                    pro.Link__c = project.Link;
                }
                if (String.isNotBlank(project.Enddate)) {
                    pro.End_Date__c = date.valueOf(project.Enddate);
                 }
                if (String.isNotBlank(project.Description)) {
                pro.Description__c = project.Description;
                }
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
    public static Boolean insertUpdateMembers(List<String> AddMembers,List<String> MoveMembers,String IDProject){
        try {
            List<RH_Participation__c> parti =new List<RH_Participation__c>();
            for (String contId : AddMembers) {
                RH_Participation__c par = new RH_Participation__c();
                par.RH_Contact__c = contId;
                par.RH_Project__c = IDProject;
                parti.add(par);
            }
            if(parti.size()>0){
                insert parti;
            }
            
            List<String> lstr = new List<String>();
            for (String part : MoveMembers) {
                lstr.add(part);
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
    @AuraEnabled
    public static List<String> getPickListValuesIntoList(){
        List<String> pickListValuesList= new List<String>();
         Schema.DescribeFieldResult fieldResult = Project__c.Status__c.getDescribe();
         List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
         for( Schema.PicklistEntry pickListVal : ple){
             pickListValuesList.add(pickListVal.getLabel());
         }     
         return pickListValuesList;
     }
}