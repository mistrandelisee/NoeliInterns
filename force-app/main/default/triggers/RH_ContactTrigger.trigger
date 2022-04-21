trigger RH_ContactTrigger on Contact (After insert,After update, Before update) {
    List<Contact> RHContacts=new List<Contact>();
    for (Contact con : Trigger.new) {
        if (con.recordTypeId==RH_Constans.RH_CONTACT_RT) {
            RHContacts.add(con);
        }
    }
    if (Trigger.isAfter && Trigger.isInsert) {
        RH_ContactTriggerHandler.createIdentyUser(RHContacts);
    }
    if (Trigger.isBefore && Trigger.isUpdate) {
        RH_ContactTriggerHandler.BeforeUpdateContacts(RHContacts);
    }
    if (Trigger.isAfter && Trigger.isUpdate) {
        RH_ContactTriggerHandler.AfterUpdateContacts(RHContacts);
    }
    

}