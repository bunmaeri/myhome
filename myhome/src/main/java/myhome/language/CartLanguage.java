package myhome.language;

public class CartLanguage {
	public static class Success{
    	public static String SUCCESS = "장바구니에 추가되었습니다.";
    }
    
    public static class Error{
   		public static String getProductMaxmum(String quantity) {
			return "최대 주문가능수량은 "+quantity+"개 입니다.";
		}
    	
   		public static String getStockStatus(String stock_status_name) {
			return "["+stock_status_name+"] 상태입니다.";
		}
    }
}
