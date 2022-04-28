
public class RH_Participation_Query {
    /** The class instance */
    private static RH_Participation_Query instance = null;

     /**
     * @description @return the class instance
     */
    public static RH_Participation_Query getInstance() {

        if(instance == null) {

            instance = new RH_Participation_Query();
        }
        return instance;
    }
    
    
}
