public  class RH_Constans {
    public static final String RH_CONTACT_RT =Schema.SObjectType.Contact.getRecordTypeInfosByDeveloperName().get('RH_USER').getRecordTypeId();
    public static final String RH_PROFILE_NAME ='Custom Identity User';
    public static final String ORG_NAME ='rh-dev';
    public static final String ACTIVATED_WORKGROUP_STATUS ='Activated';
    public static final String ACTIVATED_CONTACT_STATUS ='Activate';
    public static final String RH_OPEN ='Open';
    public RH_Constans() {

    }
    @AuraEnabled(cacheable=true)
	public static RH_Constans getAllConstants(){
		return new RH_Constans();
	}
    
    public static final Map<String, String> RH_Map_RoleName = new Map<String, String>{
        'CEO' =>'CEO',
        'Team Leader' =>'Team Leader',
        'Base User' =>'Base User',
        'Ressource Manager' =>'RH Manager'
        };
    @AuraEnabled
    public   String LWC_ACTIVATED_CONTACT_STATUS ='Activate';

}