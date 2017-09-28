package myhome.language;

public class CheckoutLanguage {
	public static class Success{
    	public static String SUCCESS = "결제가 완료되었습니다.";
    }
    
    public static class Error{
    	public static String KEY = "error-key";
    	public static String DIV_CSS = "validation-error";
    	public static String INPUT_CSS = "validation-failed";
    	
    	public static String SHIPPING_ADDRESS_CUSTOMER_NAME_ERROR="선택하신 배송주소에는 이름정보가 없습니다. 주소를 변경하시거나 다른 주소를 선택하십시요.";
    	public static String SHIPPING_ADDRESS_ADDRESS_ERROR="선택하신 배송주소에는 주소정보가 없습니다. 주소를 변경하시거나 다른 주소를 선택하십시요.";
    	public static String SHIPPING_ADDRESS_TELEPHONE_ERROR="선택하신 배송주소에는 전화번호가 없습니다. 주소를 변경하시거나 다른 주소를 선택하십시요.";
    	public static String SHIPPING_ADDRESS_REQUISITION_ERROR="선택하신 배송주소에는 개인통관고유부호가 없습니다. 주소를 변경하시거나 다른 주소를 선택하십시요.";
    	
    	public static String errorMessage="주문 오류 내용을 확인하십시요.";
    	
    	public static String cc_owner="카드 소유주를 입력해주십시요.";
    	public static String cc_number="카드번호를 입력해주십시요.";
    	public static String cc_expire_date_month="카드유효기간 월을 입력해주십시요.";
    	public static String cc_expire_date_year="카드유효기간 년도를 입력해주십시요.";
    	public static String cc_cvv2="카드 보안코드 (CVV2)를 입력해주십시요.";
    }
}
