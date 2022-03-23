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
        ExecuteLogic(RHContacts,ProfileId);
        //ID manageJobID = System.enqueueJob(new UserManager(RHContacts,ProfileId));
    }
    public static void ExecuteLogic(List<Contact> RHContacts,Id ProfileId) {
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
            System.setPassword(user.Id, user.password__c);
        }
    }
    public static User addEmployee(Contact con,Id ProfileId){
        Map<String, Object> mapReturn = new Map<String, Object>();
        string alias=(String.isNotBlank(con.FirstName )? con.FirstName.left(3) : 'x' ) +''+(String.isNotBlank(con.LastName )? con.LastName.left(3) : 'x') ;
        string nickname=(String.isNotBlank(con.FirstName )? con.FirstName.left(19) : 'x' ) +' '+(String.isNotBlank(con.LastName )? con.LastName.left(20) : 'x') ;
        //String password =alias+System.now().getTime();                
        User u=new User(Alias = alias,
                            CommunityNickname=nickname,
                            Email =con.Email,
                            Title =con.Title,
                            Contact__c = con.Id,
                            Password__c = con.Id,
                            FirstName =con.FirstName,
                            LastName =con.LastName,
                            Phone =con.Phone,
                            Department =con.Department,
                            UserName =String.isNotBlank(con.username__c) ? formatUsername(con.username__c) : formatUsername(con.LastName),
                            ProfileId = ProfileId,
                            EmailEncodingKey ='UTF-8',
                            LanguageLocaleKey = 'it' ,
                            LocaleSidKey ='it_IT' ,
                            TimeZoneSidKey = 'Europe/Rome' ,
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
