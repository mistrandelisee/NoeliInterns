public without sharing class RH_Project_controller {

    private static RH_Project_Query projectQry = RH_Project_Query.getInstance();
    private static RH_Project_Query projectQry1 = RH_Project_Query.getInstance();
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    private static RH_User_Query userQry = RH_User_Query.getInstance();
    private static RH_Task_Query taskQry = RH_Task_Query.getInstance();

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
        @AuraEnabled
        public List<Task> taskList{get;set;}
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
        @AuraEnabled
        public String AccountId{get;set;}
    }

    public class TaskTo {
        @AuraEnabled
        public String Priority{get;set;}
        @AuraEnabled
        public String Description{get;set;}
        @AuraEnabled
        public String AssignTo{get;set;}
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
        List<Task> lstTask = taskQry.getTaskByIdProject(ProjectId);
        List<RH_Participation__c> proMem=projectQry.getMembers(ProjectId);
        returnList.project = proj[0];
        returnList.projectMembers = proMem;
        returnList.taskList = lstTask;
        return returnList;
    }

    @AuraEnabled
    public static ReturnClass12 getEditMemberList(String ProjectId) {

        ReturnClass12 returnList = new ReturnClass12();
        List<Project__c> proj=projectQry.getProjectById(ProjectId);
        List<RH_Participation__c> proMem=projectQry.getMembers(ProjectId);
        List<Contact> initcont=contactQry.getAllContactInitial();
        // List<Contact> proNotMem=projectQry1.getNotMembers(ProjectId,proj[0].Project_Manager__c);
        returnList.projectNotMembers = initcont;
        returnList.projectMembers = proMem;
        return returnList;
    }

    @AuraEnabled
    public static Project__c ActiveProject(String ProjectId ,Boolean Isactivate) {
        List<Project__c> proj=projectQry.getProjectById(ProjectId);
        for(Project__c pro :proj){
            if(Isactivate){
                pro.Status__c = RH_Constans.ACTIVATED_PROJECT_STATUS;
            }
            else {
                pro.Status__c = RH_Constans.CLOSED_PROJECT_STATUS;
            }
        }
        update proj;
        if(Isactivate){
            List<RH_Participation__c> proMem=projectQry.getMembers(ProjectId);
            List<String> participation = new List<String>();
            for(RH_Participation__c part :proMem){
                participation.add(part.RH_Contact__c);
            }
            SendEmail(participation, ProjectId);
        }
        return proj[0];
    }

    @AuraEnabled 
    public static Project__c insertProjectMethod(ProjectTo project,List<String> participation, Boolean Isactivate ){
        try {
            system.debug('Startdate' +project.Startdate);
            List<User> acc11=userQry.getUserById(UserInfo.getUserId());
            system.debug('User' +acc11);
            List<Contact> acc=contactQry.getAccountId(acc11[0].RH_ContactId__c);
            system.debug('Contact' +acc);
            List<RH_Participation__c> listParti = new List<RH_Participation__c>();
            Project__c ProjectObj = new Project__c();
            ProjectObj.RH_Account_ID__c = project.AccountId;
            // ProjectObj.RH_Account_ID__c = acc[0].AccountId;
            ProjectObj.Name = project.Name;
            ProjectObj.recordTypeId = RH_Constans.RH_PROJECT_RT;
            if (String.isNotBlank(project.Description)) {
                ProjectObj.Description__c = project.Description;
            }
            if (String.isNotBlank(project.Enddate)) {
                ProjectObj.End_Date__c = date.valueOf(project.Enddate);
            }
            ProjectObj.Start_Date__c = project.Startdate;
            ProjectObj.Project_Manager__c = project.Manager;
            if(Isactivate){
                ProjectObj.Status__c = RH_Constans.ACTIVATED_PROJECT_STATUS;
            } 
            if(!Isactivate){
                ProjectObj.Status__c = RH_Constans.DRAFT_PROJECT_STATUS;
            }
            insert ProjectObj;
            //TO DO: use addParticipants
            for (String Idpartici : participation) {
                RH_Participation__c part = new RH_Participation__c();
                part.RH_Project__c = ProjectObj.id;
                part.RH_Contact__c = Idpartici;
                listParti.add(part);
            }
            insert listParti;
            //TO DO: use addParticipants

            if(Isactivate){
                SendEmail(participation, ProjectObj.ID);
            }

            return ProjectObj;
            
        } catch (Exception exp) {
            system.debug('exception'+exp.getMessage());
            throw new AuraHandledException(exp.getMessage());
        }
    }
    public static List<RH_Participation__c> addParticipants(List<String> participantIds, String ProjectId ){
        List<RH_Participation__c> Participations = new List<RH_Participation__c>();
        for(String contactId: participantIds){

            RH_Participation__c participant= new RH_Participation__c();
            participant.RH_Project__c = ProjectId;
            participant.RH_Contact__c = contactId;
            participant.RH_ExternalId__c = ProjectId+''+contactId;

            Participations.add(participant);
        }
        upsert Participations RH_ExternalId__c;
        return Participations;
    }

    @AuraEnabled
    public static Project__c insertProjectupdated(ProjectTo project,String IDProject){
        try {
            system.debug('Startdate' +project.Startdate);
            system.debug('Name'+project.Name);
            system.debug('Manager'+project.Manager);
            system.debug('Description'+project.Description);
            List<Project__c> proj=projectQry.getProjectById(IDProject);
            String stat = proj[0].Status__c ;
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
                pro.RH_Account_ID__c = project.AccountId;
            }
            update proj;

            if (project.Status == RH_Constans.ACTIVATED_PROJECT_STATUS && stat != RH_Constans.ACTIVATED_PROJECT_STATUS) {
                List<RH_Participation__c> proMem=projectQry.getMembers(IDProject);
                List<String> participation = new List<String>();
                for(RH_Participation__c part: proMem){
                    participation.add(part.RH_Contact__c);
                }
                SendEmail(participation,IDProject);
            }
            system.debug('proj  '+proj); 
            return proj[0];
        } catch (Exception exp) {
            system.debug('exception'+exp.getMessage());
            throw new AuraHandledException(exp.getMessage());
        }
    }

    @AuraEnabled
    public static Boolean insertUpdateMembers(List<String> AddMembers,String IDProject){
        try {
            List<RH_Participation__c> parti =new List<RH_Participation__c>();
            List<Project__c> proj=projectQry.getProjectById(IDProject);

            List<RH_Participation__c> proMem=projectQry.getMembers(IDProject);
            delete proMem;

            for (String contId : AddMembers) {
                RH_Participation__c par = new RH_Participation__c();
                par.RH_Contact__c = contId;
                par.RH_Project__c = IDProject;
                parti.add(par);
            }
            if(parti.size()>0){
                insert parti;
                if (proj[0].Status__c == RH_Constans.ACTIVATED_PROJECT_STATUS) {
                    SendEmail(AddMembers,IDProject);
                }
            }
            
            // List<String> lstr = new List<String>();
            // for (String part : MoveMembers) {
            //     lstr.add(part);
            // }
            // List<RH_Participation__c> proMem=projectQry.getParticipate(lstr);
            
            return true;
        } catch (Exception exp) {
            system.debug('exception'+exp.getMessage());
            throw new AuraHandledException(exp.getMessage());
           
        }
    }
    @AuraEnabled
    public static String uploadFile(String base64, String filename, String recordId){
        return RH_FileUploader.uploadFile( base64,  filename,  recordId);
    }

   

   


    // @AuraEnabled
    // public static Map<ID, Object> getRelatedFilesByRecordId(String recordId) {
    //     // Get record file IDs        
    //     List<ContentDocumentLink> files = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recordId];
    //     List<ID> fileIDs = new List<ID>();
    //     for (ContentDocumentLink docLink : files) {
    //         fileIDs.add(docLink.ContentDocumentId);
    //     }
 
    //     List<ContentVersion> docs = [SELECT ContentDocumentId,VersionData, FileExtension, Title 
    //         FROM ContentVersion WHERE ContentDocumentId IN : fileIDs];
    //     Map<ID, Object> mapIdTitle = new Map<ID, Object>();
    //     for (ContentVersion docLink : docs) {
    //         Map<string, Object> mapobj = new Map<string, Object>();
    //         mapobj.put('obj', docLink);
    //         mapobj.put('link', EncodingUtil.base64Encode(docLink.VersionData));
    //         mapIdTitle.put(docLink.ContentDocumentId, mapobj);
    //     }
    //     return mapIdTitle;
    // }


    @AuraEnabled
    public static Map<String, Object> getRelatedFilesByRecordId(String recordId) {
        return RH_FileUploader.getFileInfos(recordId);
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

    public static void SendEmail(List<String> lstids, String IDProject)
    {
        List<contact> lstcon=[Select id,Email from contact WHERE Id IN :lstids];
        List<String> address= new List<String>();
         for(Contact c:lstcon)
            {
                if(c.Email != null){
                    address.add(c.Email);
                }
                
            }
        system.debug('lstids' +lstids);
        system.debug('lstidsEmail' +address);
            EmailTemplate et=[Select id,Subject,Description,HtmlValue,DeveloperName,Body from EmailTemplate where name = 'RH-Notify New Member Project' limit 1];
            
            // system.debug('EmailTemplate' +et.Id);
            // Messaging.MassEmailMessage mail = new Messaging.MassEmailMessage();
            // mail.setTargetObjectIds(lstids);
            // // mail.setToAddresses(address);
            // mail.setSenderDisplayName('System Admin');
            // mail.setTemplateId(et.id);
            // Messaging.sendEmail(new Messaging.MassEmailMessage[] { mail });


            String sfdcBaseURL = URL.getSalesforceBaseUrl().toExternalForm() +'/NoeliInterns/s/rhproject?recordId='+IDProject;
            System.debug('Base URL: ' + sfdcBaseURL );
            
            // String currentRequestURL = URL.getCurrentRequestUrl().toExternalForm();
            // System.debug('Current request URL: ' + currentRequestURL);

            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            // mail.setToAddresses(address); 



            if(address.size() > 0){
            //     mail.toAddresses= address; 
            // mail.setSubject('Email Subject');
            // mail.setBccSender(false);
            // mail.setPlainTextBody('You are new Project Member');
            // mail.setHtmlBody('Hello <br/>'+ 
            //                 'You are new Project Member <br/>'+
            //                 'click the follow link to view project details <br/>'+
            //                 'Your Link <a href='+sfdcBaseURL+'>   click here.</a>');
            // Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });



            String emailSubject ='New Project Member';
            String body ='You are new Project Member';
            String useHTML ='Hello <br/>'+ 
            'You are new Project Member <br/>'+
            'click the follow link to view project details <br/>'+
            'Your Link <a href='+sfdcBaseURL+'>   click here.</a>';
            RH_Emails_Utility.sendMailMethod(address, emailSubject, body, useHTML, null);
            }
           
    }

    @AuraEnabled
    public static Task insertTask(TaskTo taskto,String IDProject){
        Task mytask = new Task();
        mytask.WhatId = IDProject;
        mytask.WhoId = taskto.AssignTo;
        mytask.Description = taskto.Description;
        mytask.Status = 'Not Started';
        mytask.Priority = taskto.Priority;

        insert mytask;
        return mytask;
    }

    @AuraEnabled
    public static List<String> getPriorityTaskPickListValues(){
        List<String> pickListValuesList= new List<String>();
        Schema.DescribeFieldResult fieldResult = Task.Priority.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        for( Schema.PicklistEntry pickListVal : ple){
            pickListValuesList.add(pickListVal.getLabel());
        }     
        return pickListValuesList;
    }
}