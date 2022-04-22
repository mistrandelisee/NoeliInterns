global with sharing class RH_LoginFlowController {
    @InvocableMethod(label='Get User URL')
    public static List<VisitorUrlOutput> getUrlName() {
        // String startUrl = System.currentPageReference().getParameters().get('startURL');
        String startUrl = 'xxxx';
        string fullUrl=Apexpages.currentPage().getUrl();
        return new List<VisitorUrlOutput>{
            new VisitorUrlOutput(fullUrl,startUrl)
        };
    }
    /*public class UrlInput {
        @InvocableVariable(required=true)
        public ID userId;
    }*/
      
    public class VisitorUrlOutput {
    @InvocableVariable(required=true)
    public String fullUrl;
    @InvocableVariable(required=true)
    public String variants;
        public VisitorUrlOutput(String url,String startUrl) {
            fullUrl=url;
            variants=startUrl;
        }
    }
}
