package myhome.language;

public class RegisterLanguage {
	public static class Success{
    	public static String SUCCESS = "회원가입이 완료되었습니다.";
    }
    
    public static class Error{
    	public static String ERROR="회원가입에 오류가 있습니다. 오류내용을 확인하십시요.";
    	public static String CUSTOMER_NAME="이름은 최소 1글자 이상 3글자보다 작게 입력하셔야 합니다.";
    	public static String EMAIL="잘못된 이메일 주소입니다.";
    	public static String EMAIL_DUPLICATION="이미 등록된 이메일 주소입니다.";
    	public static String TELEPHONE="전화번호를 확인해 주십시요. 직접 통화가 가능한 번호로 입력해야 합니다.";
        
        public static String COMPANY="회사이름은 40자 이내로 입력해 주십시요.";
        public static String REQUISITION_ID="잘못된 개인통관고유번호 입니다. [통관고유부호 발급안내]를 참조해 주십시요!";
        public static String IS_DAUM_POST="정확한 주소 입력을 위해서 반드시 우편번호 찾기를 이용해주십시요!";
        public static String POSTCODE="잘못된 우편번호입니다. 정확한 주소 입력을 위해서 반드시 우편번호 찾기를 이용해주십시요!";
        public static String ADDRESS_1="올바른 주소를 입력해 주십시요!";
        public static String PASSWORD="비밀번호는 최소 6자리에서 32자리까지 영문과 숫자 조합으로 입력해야 합니다.";
        public static String CONFIRMATION="비밀번호확인이 비밀번호와 일치하지 않습니다.";
        public static String JOIN_PATH_ID="가입경로를 선택해 주세요.";
        public static String JOIN_PATH_ETC="기타 가입경로를 입력해 주세요.";
        
        public static String FIRSTNAME_223="This is a required field.";
        public static String LASTNAME_223="This is a required field.";
        public static String TELEPHONE_223="This is a required field.";
        public static String ADDRESS_1_223="This is a required field.";
        public static String CITY_223="This is a required field.";
        public static String ZONE_ID_223="This is a required field.";
        public static String POSTCODE_223="This is a required field.";
        public static String PASSWORD_223="The password must be at least 6 to 32 alphanumeric characters.";
        public static String CONFIRMATION_223="Password verification does not match password.";
        public static String JOIN_PATH_ID_223="Please select a join path.";
        public static String JOIN_PATH_ETC_223="Please enter your other join path.";
    }
}
