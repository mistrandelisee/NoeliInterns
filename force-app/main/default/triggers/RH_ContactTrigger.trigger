trigger RH_ContactTrigger on Contact (After insert,After Update) {
    List<Contact> RHContacts=new List<Contact>();
    for (Contact con : Trigger.new) {
        if (con.recordTypeId==RH_Constans.RH_CONTACT_RT) {
            RHContacts.add(con);
        }
    }
    if (Trigger.isAfter && Trigger.isInsert) {
        RH_ContactTriggerHandler.createIdentyUser(RHContacts);
    }
}