public  class RH_Constans {
    private static final  RH_Settings__c cs = RH_Settings__c.getOrgDefaults();
    public static final String RH_CONTACT_RT =Schema.SObjectType.Contact.getRecordTypeInfosByDeveloperName().get('RH_USER').getRecordTypeId();
    public static final String RH_CLIENT_ACCOUNT_RT =Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('RH_CLIENT').getRecordTypeId();
    public static final String RH_ACCOUNT_RT =Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('RH').getRecordTypeId();
    public static final String RH_PROJECT_RT =Schema.SObjectType.Project__c.getRecordTypeInfosByDeveloperName().get('Real_Project').getRecordTypeId();
    public static final String RH_PROJECT_FREE_RT =Schema.SObjectType.Project__c.getRecordTypeInfosByDeveloperName().get('RH_FREE').getRecordTypeId();
    public static final String RH_PROJECT_EXTRA_RT =Schema.SObjectType.Project__c.getRecordTypeInfosByDeveloperName().get('RH_EXTRA').getRecordTypeId();
    public static final String RH_PROFILE_NAME ='Custom Identity User';
    public static final String ORG_NAME =String.isNotBlank(cs.RH_Org_Name__c)?cs.RH_Org_Name__c: 'rh-dev';
    public static final String ACTIVATED_WORKGROUP_STATUS ='Activated';
    public static final String ACTIVATED_CONTACT_STATUS ='Active';
    public static final String ACTIVATED_PROJECT_STATUS ='Active';
    public static final String DRAFT_PROJECT_STATUS ='Draft';
    public static final String DRAFT_STATUS ='Draft';
    public static final String CLOSED_PROJECT_STATUS ='Closed';
    public static final String RH_OPEN ='Open';
    public static final String CONTACT_ROLE_CEO ='CEO';
    public static final String CONTACT_ROLE_TL ='Team Leader';
    public static final String CONTACT_ROLE_BU ='Base User';
    public static final String CONTACT_ROLE_RH ='Ressource Manager';
    public static final String ACTIVATED_ACCOMPLISHMENT_STATUS ='Active';
    public static final String RH_VACCATION_RT_NAME ='RH_FREE';
    public static final String test ='test Manager';
    public static final String DEFAULT_CURRENCY ='EUR';
    public  final String DEFAULT_CURRENCY2;
    public static final List<String> TIMESHEET_PUBLIC_STATUS = new List<String>{'Inviato','approvato'};
    public RH_Constans() {
        DEFAULT_CURRENCY2 ='EUR';
    }
    // new RH_Constans();
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
    @AuraEnabled
    public   String LWC_CONTACT_ROLE_BU ='Base User';
    @AuraEnabled
    public   String LWC_CONTACT_ROLE_TL ='Team Leader';
    @AuraEnabled
    public   String LWC_ACTIVE_CONTACT_STATUS ='Active';
    @AuraEnabled
    public   String LWC_DRAFT_CONTACT_STATUS ='Draft';
     @AuraEnabled
    public   String LWC_FREEZE_CONTACT_STATUS ='Frozen';
     @AuraEnabled
    public   String LWC_DISABLE_CONTACT_STATUS ='Banned';


    public static String EVENT_SUBMITTED_ACTION= 'TG_EVENT_SUBMITTED';
    public static String EVENT_REJECTED_ACTION= 'TG_EVENT_REJECTED';
    public static String EVENT_PUBLISHED_ACTION= 'TG_EVENT_PUBLISHED';
    public static String PERSONAL_BIRTHDAY_ACTION= 'TG_PERSONAL_BIRTHDAY';
    public static String WORK_BIRTHDAY_ACTION= 'TG_WORK_BIRTHDAY';
    public static String PROMOTION_ACTION= 'TG_PROMOTION';
    public static String REQUEST_APPROVED_ACTION= 'TG_REQUEST_APPROVED';
    public static String REQUEST_REJECTED_ACTION= 'TG_REQUEST_REJECTED';
    public static String REQUEST_SUBMITTED_ACTION= 'TG_REQUEST_SUBMITTED';
    public static String TIMESHEET_APPROVED_ACTION= 'TG_TIMESHEET_APPROVED';
    public static String TIMESHEET_REJECTED_ACTION= 'TG_TIMESHEET_REJECTED';
    public static String TIMESHEET_SUBMITTED_ACTION= 'TG_TIMESHEET_SUBMITTED';
}