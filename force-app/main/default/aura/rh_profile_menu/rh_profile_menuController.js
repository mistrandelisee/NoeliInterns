({
    handleMenuSelect : function(component, event, helper) {
        var selectedMenuItemValue = event.getParam("value");
        helper.handleSelect(component, event, selectedMenuItemValue);
    },
    onInit: function(component, event, helper) {
        // component.set("v.Username", 'Mistrand');
        const options=[
            { label:'Profile', value:'01',icon:''},
            { label:'Logout', value:'02',icon:''},
        ]
        component.set("v.options", options);
        var action = component.get("c.getUserInfo");
        action.setCallback(this,function(result){
            const state = result.getState();
            console.log(result);
            if (state === "SUCCESS"){
                var response = result.getReturnValue();
                console.log('result ',response);
                if (!response.error) {
                    component.set("v.Username", response.user.CommunityNickname);
                }else{
                    console.error(response.msg);
                }
            }
            else{

            }
            
        });
        $A.enqueueAction(action);
    }
})
