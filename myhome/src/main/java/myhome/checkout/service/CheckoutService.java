package myhome.checkout.service;

import java.util.List;
import java.util.Map;

public interface CheckoutService {
	/**
	 * Geo Zone을 가져온다.
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> geoZone(Map<String, Object> param, Map<String, Object> totals, Map<String, Object> shippingAddressMap) throws Exception;

	/**
	 * 주문요약 정렬 순서를 가져온다.
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> getSortOrder() throws Exception;
	
	/**
	 * 적립포인트 합계
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	String rewardTotal(String customer_id) throws Exception;
	
	/**
	 * Sales Tax를 계산한다.
	 * @param map
	 * @return
	 * @throws Exception
	 */
	Map<String, Object> caclSalesTax(Map<String, Object> map) throws Exception;
	
	/**
	 * 장바구니 주문 요약에 추가한다.
	 * @param map
	 * @throws Exception
	 */
	void addCartOrderTotal(Map<String, Object> map) throws Exception;
	
	/**
	 * 장바구니 주문 요약에 총합계를 추가한다.
	 * @param map
	 * @throws Exception
	 */
	void addCartOrderTotalTotal(Map<String, Object> map) throws Exception;
	
	/**
	 * 장바구니 주문 요약을 삭제한다.
	 * @param String
	 * @throws Exception
	 */
	void deleteCartOrderTotal(String customer_id) throws Exception;
	
	/**
	 * 장바구니 주문 요약을 코드로 삭제한다.
	 * @param map
	 * @throws Exception
	 */
	void deleteCartOrderTotalByCode(Map<String, Object> map) throws Exception;
	
	/**
	 * 장바구니 주문 요약을 가져온다.
	 * @param String
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> cartOrderTotalList(String customer_id) throws Exception;
	
	/**
	 * 장바구니 주문 요약에서 총합계를 가져온다.
	 * @param String
	 * @return
	 * @throws Exception
	 */
	String cartOrderTotalAmount(String customer_id) throws Exception;
	
	/**
	 * 주문번호 생성
	 * @param map
	 * @throws Exception
	 */
	void createOrderId(Map<String, Object> map) throws Exception;
	
	/**
	 * 주문 테이블 생성
	 * @param map
	 * @throws Exception
	 */
	void addOrder(Map<String, Object> map) throws Exception;
	
	/**
	 * 주문 테이블에 주문상태 업데이트
	 * @param map
	 * @throws Exception
	 */
	void updateOrderStatusId(Map<String, Object> map) throws Exception;
	
	/**
	 * Order Total 생성
	 * @param map
	 * @throws Exception
	 */
	void addOrderTotal(Map<String, Object> map) throws Exception;
	
	/**
	 * 주문 History 추가
	 * @param map
	 * @throws Exception
	 */
	void addOrderHistory(Map<String, Object> map) throws Exception;
	
	/**
	 * 주문 Products 추가
	 * @param map
	 * @throws Exception
	 */
	void addOrderProduct(Map<String, Object> map) throws Exception;
	
	/**
	 * 고객 적립금 사용 이력 추가
	 * @param map
	 * @throws Exception
	 */
	void addCustomerReward(Map<String, Object> map) throws Exception;
	
	/**
	 * 장바구니 삭제
	 * @param String
	 * @throws Exception
	 */
	void deleteCart(String customer_id) throws Exception;
	
	/**
	 * 제품 수량 마이너스
	 * @param map
	 * @throws Exception
	 */
	void updateProductQuantity(Map<String, Object> map) throws Exception;
}
