package myhome.language;

public class ForgotPasswordLanguage {
	public static class Success{
    	public static String SUCCESS = "비밀번호 재설정 이메일이 발송되었습니다.";
    	public static String RESET_SUCCESS = "비밀번호 설정이 완료되었습니다.";
    }
    
    public static class Error{
    	public static String INVALID_EMAIL="등록되어있지 않은 이메일입니다!";
    	public static String INVALID_LINK="비밀번호 재설정 링크가 유효하지 않거나 이미 사용한 링크입니다. 비밀번호 찾기를 다시 시작해 주십시오!";
    	public static String PASSWORD="비밀번호는 최소 6자리에서 32자리까지 영문과 숫자 조합으로 입력해야 합니다.";
        public static String CONFIRMATION="비밀번호확인이 비밀번호와 일치하지 않습니다.";
    }
}
