global Interface RH_telegramMessageConfigInterface {
    //  void buildMessage(RH_Message_Configuration__mdt config);
    //  sObject retrieveRecord(RH_Message_Configuration__mdt config);
    /**
     * input new Map<String,Object>{
                'action'=>this.action,
                'record'=>this.record,
                'receiver'=> receiver
            };
            @param action the action
            @param record the record
            @param receiver the contact to whom whe are sending the notification
         output a mapping :::  Map<String,String>() 
     */
    Map<String,String> buildMapping(object o);

    /**
     * input new Map<String,Object>{
                'message'=>tg_message,
                'action'=>this.action,
                'record'=>this.record,
                'receiver'=> receiver
            };
            @param message the tg message
            @param action the action
            @param record the record
            @param receiver the contact to whom whe are sending the notification
        output a message ::: RH_Telegram_Utility.Message 
     */
    object buildMessage(object msg);
}