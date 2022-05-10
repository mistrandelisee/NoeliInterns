public class RH_ContactTriggerHandler {
    public RH_ContactTriggerHandler() {

    }
    public static void UpadeRelatedUsers(List<Contact> RHContacts,Id ProfileId) {
        List<User> RHUsers = new List<User>();
        if (!RHContacts.isEmpty()) {
            for (Contact con : RHContacts){
                if (con.RH_Create_User__c) {
                    RHUsers.add(addEmployee(con,ProfileId));
                }
                
            }
            insert RHUsers;
        }
        setDefaultPassWord(RHUsers);
    }
    public static void BeforeUpdateContacts(List<Contact> RHContacts) {
        for (Contact con : RHContacts){
            Contact oldCon=(Contact) Trigger.oldMap.get(con.Id);
            if ( oldCon?.RH_Create_User__c && !con.RH_Create_User__c) {//Trying disable this field
                con.addError('You can disable this field...Contact your Administrator');
            }
        }
    }
    public static void AfterUpdateContacts(List<Contact> RHContacts) {
        List<Contact> RHContactsValid = new List<Contact>();
        for (Contact con : RHContacts){
            Contact oldCon=(Contact) Trigger.oldMap.get(con.Id);
            if ( ! oldCon?.RH_Create_User__c && con.RH_Create_User__c) {//switch create user
                RHContactsValid.add(con);
            }
        }
        if (!RHContactsValid.isEmpty()) {
            Id ProfileId = [SELECT ID FROM Profile WHERE Name =:RH_Constans.RH_PROFILE_NAME].Id;
            ID manageJobID = System.enqueueJob(new UserManager(RHContactsValid,ProfileId));
        }
    }
    public static void createIdentyUser(List<Contact> RHContacts) {
        // List<User> RHUsers = new List<User>();
        // for (Contact con : RHContacts){
        //     RHUsers.add(addEmployee(con));
        // }
        // try {
        //     insert RHUsers;
        // } catch (Exception e) {
        //     System.debug('eee' + e);
        //     throw e;
        // }
        Id ProfileId = [SELECT ID FROM Profile WHERE Name =:RH_Constans.RH_PROFILE_NAME].Id;
       // ExecuteLogic(RHContacts,ProfileId);
        ID manageJobID = System.enqueueJob(new UserManager(RHContacts,ProfileId));
    }
    public static void ExecuteLogic(List<Contact> RHContacts,Id ProfileId) {
        List<User> RHUsers = new List<User>();
        List<List<Database.Error>> listError = new List<List<Database.Error>>();
        List<User> listSucces = new List<User>();
        List<String> listeError = new List<String>();
        //Map<String ,String> MapError = new Map<String, String>();
        Map<String ,List<String>> MapError = new Map<String, List<String>>();
        List<String> listIdErrorRecord = new List<String>();
        Map<String, UserRole> RH_Map_Role= new Map<String, UserRole>(); 
        List<UserRole> ListRole = [select Id, Name from UserRole];
        String stringMap;
        for(UserRole role : ListRole){
             RH_Map_Role.put(role.Name, role);
        }
        if (!RHContacts.isEmpty()) {
            for (Contact con : RHContacts){ 
                if (con.RH_Create_User__c) {
                //    RHUsers.add(addEmployee(con,ProfileId));
                    User u = addEmployee(con,ProfileId);
                    u.UserRoleId = (RH_Map_Role.get(RH_Constans.RH_Map_RoleName.get(con.RH_Role__c))).Id;
                    RHUsers.add(u);
                }
                
            }
           // insert RHUsers;

            Database.SaveResult[] srList = Database.insert(RHUsers, false);
            system.debug('dans le ExecuteLogic apres insertion du User');
            integer i = 0;
            for(Database.SaveResult sr : srList){
                String chaineError ='';
                if(!sr.isSuccess()){
  //                  listError.add(sr.getErrors());
                    
                    listIdErrorRecord.add(RHUsers[i].RH_ContactId__c);
                    for(Database.Error err : sr.getErrors()){
                        chaineError = chaineError + err.getStatusCode() + ': ' + err.getMessage();
                        listeError.add(err.getStatusCode() + ',' +err.getMessage());
                    }
  //                  MapError.put(RHUsers[i].RH_ContactId__c, chaineError);
                      MapError.put(RHUsers[i].RH_ContactId__c, listeError);
                }else{
                    listSucces.add(RHUsers[i]);
                }
                i++;
            }
            stringMap = JSON.serialize(MapError);
        }
        if (! listSucces.isEmpty()) {
            setDefaultPassWord(listSucces);
        }
        if (! listIdErrorRecord.isEmpty()) {
            handleError(listIdErrorRecord, stringMap);
        }else{
            //TO SEND OK MAIL
        }
    }
    
    @future
    public static void handleError(List<String> ContactId, String stringMap){
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage(); 
        String[] toAddresses = new String[] {'landryfotsing94@gmail.com'};
        String chaine ='';
        String chaineError ='';
  
        String csvFile;
        String columnHeader = 'Contact Name, Email, Statut Error, Message Error \n';
        List<String> stringListe = new List<string>();

        List<RH_Config__mdt> mcs = RH_Config__mdt.getAll().values();
        for(RH_Config__mdt val_mcs : mcs){
            if(val_mcs.Logic_To_Implement__c == 'Logique 1'){
                toAddresses.add(val_mcs.Mail_Adresse__c);
            }
        }

        Map<String , Object> MapError = (Map<String , Object>)JSON.deserializeUntyped(stringMap);

        Contact[] contact_to_delete = [SELECT Id, Name, Email, RH_Role__c FROM Contact WHERE Id IN :ContactId];
        for(Contact con : contact_to_delete){
            stringListe.add(con.Name + ',' + con.Email+ ',' +string.valueOf(MapError.get(con.Id)));
        /*  chaine = chaine + 'Contact Name: '+con.Name+ ' Email: '+con.Email+' And with Id:'+con.Id+'\n with these error '+
            string.valueOf(MapError.get(con.Id))+'\n'; */
        }

        csvFile = columnHeader + String.join(stringListe, '\n');
        Messaging.EmailFileAttachment attach = new Messaging.EmailFileAttachment();
        attach.setContentType('text/csv');
        attach.setFileName('error report');
        attach.setInline(true);
        attach.Body = Blob.valueOf(csvFile);

        mail.setToAddresses(toAddresses);
        mail.setPlainTextBody('Failed to insert user for these contact : ' + chaine +' The associate error are link.');
        mail.setHtmlBody('find here the releated csv file ');
        if(attach != NULL){
              mail.setFileAttachments(new Messaging.EmailFileAttachment[] {attach});
            }
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] {mail}); 

        delete contact_to_delete;
    }

    public  class UserManager implements Queueable {
        public List<Contact> contactList;
        public List<Contact> AllcontactList;
        public Integer scope=150;
        public String ProfileId;
        public String orgname='';
        public UserManager(List<Contact> contacts,Id ProfId){
            AllcontactList=contacts;
            ProfileId =ProfId;
        } 
        public void execute(QueueableContext context) { 
            System.debug('### UserManager  =>execute  AllcontactList size  : '+AllcontactList.size());
            System.Savepoint savepoint =null;
            try {
                
                savepoint = Database.setSavepoint();
                /*List<User> RHUsers = new List<User>();
                if (!AllcontactList.isEmpty()) {
                    for (Contact con : AllcontactList){
                        if (con.RH_Create_User__c) {
                            RHUsers.add(addEmployee(con,ProfileId));
                        }
                    }
                    insert RHUsers;
                }
                setDefaultPassWord(RHUsers);*/
                ExecuteLogic(AllcontactList,ProfileId);
            }
            catch(Exception e) {
                if (savepoint!=null) {
                    Database.rollback(savepoint);
                }
                System.debug('e  error ' + e);
                System.debug(e.getMessage());
            }
        
        }
    }
    public static void setDefaultPassWord(List<User> users) {
        for (User user : users) {
            System.setPassword(user.Id, user.RH_Password__c);
        }
    }
    public static User addEmployee(Contact con,Id ProfileId){
        Map<String, Object> mapReturn = new Map<String, Object>();
        //Id ProfileId = [SELECT ID FROM Profile WHERE Name ='Custom Identity User'].Id;
      
       
            string alias=(String.isNotBlank(con.FirstName )? con.FirstName.left(3) : 'x' ) +''+(String.isNotBlank(con.LastName )? con.LastName.left(3) : 'x') ;
            string nickname=(String.isNotBlank(con.FirstName )? con.FirstName.left(19) : 'x' ) +' '+(String.isNotBlank(con.LastName )? con.LastName.left(20) : 'x') ;
            //String password =alias+System.now().getTime();                
            User u=new User(Alias = alias,
                                CommunityNickname=nickname,
                                Email =con.Email,
                                Title =con.Title,
                                RH_ContactId__c = con.Id,
                                RH_Password__c = con.Id,
                                FirstName =con.FirstName,
                                LastName =con.LastName,
                                Phone =con.Phone,
                                Department =con.Department,
                                UserName =String.isNotBlank(con.Email) ? formatUsername(con.Email) : formatUsername(con.LastName),
                                ProfileId = ProfileId,
                                EmailEncodingKey ='UTF-8',
                                LanguageLocaleKey ='fr',// 'it' ,
                                LocaleSidKey ='fr_FR',//it_IT' ,
                                TimeZoneSidKey ='Africa/Douala',// 'Europe/Rome' ,
                                IsActive=true
                            );
        return u;

    }
    public static String formatUsername(String inUsername){
        String username='';
        String orgname=RH_Constans.ORG_NAME;
        System.debug('orgname >>>> ' + orgname);
        if (checkValidUsername(inUsername)) {
            username= inUsername+'.'+orgname;
        }else{
        //  username=inUsername.toLowerCase() + system.now().getTime() +'@aro.it' ;
         username=inUsername.toLowerCase() +'@'+orgname+'.it' ;
        }
        username=customTrim(username);
        System.debug('@@@@ USERNAME ' + username +' >>>VALID USERNAME ' + checkValidUsername(username));
        return username;
    }
    public static String customTrim(String st){
        System.debug('STRING BEFORE TRIM:::  ' + st);
        String regExp = '\\s+';
        String replacement = '_';
        st = st.replaceAll(regExp, replacement);
        System.debug('STRING AFTER TRIM:::  ' + st);
        return st;
    }
    public static Boolean checkValidUsername(String emailAddress){
        String emailRegex = '([a-zA-Z0-9_\\-\\.]+)@((\\[a-z]{1,3}\\.[a-z]{1,3}\\.[a-z]{1,3}\\.)|(([a-zA-Z0-9\\-]+\\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})';
        Pattern MyPattern = Pattern.compile(emailRegex);
    
        Matcher MyMatcher = MyPattern.matcher(emailAddress);
    
        if(MyMatcher.matches()){
            return true;
        }else{
            return false;
        }
    }
}