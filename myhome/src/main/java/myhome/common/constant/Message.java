package myhome.common.constant;

import myhome.common.controller.CodeController;

public class Message {
	public static String SUCCESS_KEY = "Message-Success-Key";
	public CodeController code = new CodeController();
	
    public static class Success{
    	public static String ACCOUNT_EDIT = "회원정보가 수정되었습니다.";
    	public static String NEW_ADDRESS = "주소가 추가되었습니다.";
    	public static String EDIT_ADDRESS = "주소가 변경되었습니다.";
    }
    
    public static class Error{
    	public static String KEY = "error-key";
    	public static String DIV_CSS = "validation-error";
    	public static String INPUT_CSS = "validation-failed";
    	
    	public static String CUSTOMER_NAME="이름은 최소 1글자 이상 3글자보다 작게 입력하셔야 합니다.";
    	public static String EMAIL="잘못된 이메일 주소입니다.";
    	public static String EMAIL_DUPLICATION="이미 등록된 이메일 주소입니다.";
    	public static String TELEPHONE="전화번호를 확인해 주십시요. 한국내에서 직접 통화가 가능한 번호로 입력해야 합니다.";
        public static String PASSWORD="비밀번호는 최소 6자리에서 32자리까지 영문과 숫자 조합으로 입력해야 합니다.";
        public static String CONFIRMATION="비밀번호확인이 비밀번호와 일치하지 않습니다.";
        
        public static String COMPANY="회사이름은 40자 이내로 입력해 주십시요.";
        public static String REQUISITION_ID="잘못된 개인통관고유번호 입니다. [통관고유부호 발급안내]를 참조해 주십시요!";
        public static String IS_DAUM_POST="정확한 주소 입력을 위해서 반드시 우편번호 찾기를 이용해주십시요!";
        public static String POSTCODE="잘못된 우편번호입니다. 정확한 주소 입력을 위해서 반드시 우편번호 찾기를 이용해주십시요!";
        public static String ADDRESS_1="올바른 주소를 입력해 주십시요!";
        
        public static String FIRSTNAME_223="This is a required field.";
        public static String LASTNAME_223="This is a required field.";
        public static String TELEPHONE_223="This is a required field.";
        public static String ADDRESS_1_223="This is a required field.";
        public static String CITY_223="This is a required field.";
        public static String ZONE_ID_223="This is a required field.";
        public static String POSTCODE_223="This is a required field.";
        
        public static String CART_OVER_LIMIT="주문한도액(${price}) 또는 주문상품 갯수({count}개)를 초과하였습니다. 장바구니 수량을 조절하십시요.";
        public static String CART_OUT_OF_STOCK="재고가 부족하거나 품절된 상품이 있습니다. 수량을 변경하시거나, 삭제하신 후에 주문하기를 진행해 주십시요.";
        public static String CART_PRODUCT_OVER_LIMIT="* 최대 {count}개";
        public static String CART_PRODUCT_OVER_LIMIT_MSG="최대 주문 수량을 초과한 제품이 있습니다. 수량을 확인하십시요.";
        
        public static String setCART_OVER_LIMIT(String price, String count) {
        	CART_OVER_LIMIT = CART_OVER_LIMIT.replace("{price}", price);
        	CART_OVER_LIMIT = CART_OVER_LIMIT.replace("{count}", count);
        	return CART_OVER_LIMIT;
        }
        
        public static String setCART_PRODUCT_OVER_LIMIT(String count) {
        	CART_PRODUCT_OVER_LIMIT = CART_PRODUCT_OVER_LIMIT.replace("{count}", count);
        	return CART_PRODUCT_OVER_LIMIT;
        }
    }
}
