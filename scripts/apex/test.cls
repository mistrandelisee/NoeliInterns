String rt=RH_Constans.RH_CONTACT_RT;
String queryCon='SELECT Id,Name ,toLabel(RH_Role__c) RH_Role__c FROM Contact WHERE recordTypeId=:rt';
// List<contact> cons=[SELECT Id,Name ,RH_Role__c, toLabel(RH_Role__c) rol FROM Contact WHERE recordTypeId=:RH_Constans.RH_CONTACT_RT];
List<contact> cons2=Database.query(queryCon);

for ( contact con : cons2){
    System.debug(con);
}