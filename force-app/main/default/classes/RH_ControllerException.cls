public  class RH_ControllerException extends Exception {
    public RH_ControllerException(String code,String message) {
        this.code=code;
        this.message=message;
    }
    public String code {get; set;}
    public String message {get; set;}

    public String getCode() {return this.code;}
    override public String getMessage() {return this.message;}

}
