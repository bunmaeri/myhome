package myhome.checkout.service;

import java.util.List;
import java.util.Map;

public interface CartService {
	/**
	 * 장바구니
	 * @param map
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> cart(Map<String, Object> map) throws Exception;
	
	/**
	 * 장바구니 소계
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	Map<String, Object> cartSubTotal(Map<String, Object> map) throws Exception;
	
	/**
	 * 장바구니 총합계
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	Map<String, Object> cartTotal(Map<String, Object> map) throws Exception;
	
	/**
	 * 주문 합계 목록
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> orderTotal(Map<String, Object> map) throws Exception;
}
