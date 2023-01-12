global Interface RH_telegramMessageConfigInterface {
    //  void buildMessage(RH_Message_Configuration__mdt config);
    //  sObject retrieveRecord(RH_Message_Configuration__mdt config);
    Map<String,String> buildMapping(Map<String,String> mappings);
    object buildMessage(object msg);
}