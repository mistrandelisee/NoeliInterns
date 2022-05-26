({
    handleSelect : function (component, event, selectedMenuItemValue) {
        console.log('<<<<<<<<<<<<<<<<<<<<<<<< ',selectedMenuItemValue);
        let attribs={};
        switch (selectedMenuItemValue) {
            case '01'://profile
                attribs='/rhprofile'
                this.gotoURL(component,attribs);

                break;
            case '02'://logout
                window.location.replace('/NoeliInterns/secur/logout.jsp?startURL=%2FNoeliInterns%2Fs%2F');
                break;
            default:
                break;
        }
    },
    gotoURL : function (component, url) {
        // component.find("navService").navigate(attribs);
        var urlEvent = $A.get("e.force:navigateToURL");
            urlEvent.setParams({
                url
            });
            urlEvent.fire();
    }
})
