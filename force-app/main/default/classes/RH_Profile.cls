public  class RH_Profile {
    public RH_Profile() {

    }
    @AuraEnabled
    public static map<string,object> getMyProfile() {
        [SELECT id,Name FROM SobjectName WHERE clause];
    }
}
