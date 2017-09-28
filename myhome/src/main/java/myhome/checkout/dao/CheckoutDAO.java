package myhome.checkout.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import myhome.common.dao.AbstractDAO;

@Repository("checkoutDAO")
public class CheckoutDAO extends AbstractDAO {
	/**
	 * Geo Zone을 가져온다.
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> geoZone(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("checkout.geoZone", map);
	}
	
	/**
	 * country 정보를 가져온다.
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> countryInfo(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("checkout.countryInfo", map);
	}
	
	/**
	 * fedex Zone 정보를 가져온다.
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> fedexZoneInfo(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("checkout.fedexZoneInfo", map);
	}
	
	/**
	 * 적립포인트 합계
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	public String rewardTotal(String customer_id) throws Exception{
		return (String) selectOne("checkout.rewardTotal", customer_id);
	}
	
	/**
	 * 무게에 따른 가격을 가져온다.
	 * @param weight
	 * @return
	 * @throws Exception
	 */
	public String weightShippingCost(String weight) throws Exception{
		return (String) selectOne("checkout.weightShippingCost", weight);
	}
	
	/**
	 * 주문요약 정렬 순서를 가져온다.
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> getSortOrder() throws Exception{
		return (List<Map<String, Object>>)selectList("checkout.getSortOrder");
	}
	
	/**
	 * Sales Tax를 계산한다.
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> caclSalesTax(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("checkout.caclSalesTax", map);
	}
	
	/**
	 * 장바구니 주문 요약에 추가한다.
	 * @param map
	 * @throws Exception
	 */
	public void addCartOrderTotal(Map<String, Object> map) throws Exception{
		insert("checkout.addCartOrderTotal", map);
	}
	
	/**
	 * 장바구니 주문 요약에 총합계를 추가한다.
	 * @param map
	 * @throws Exception
	 */
	public void addCartOrderTotalTotal(Map<String, Object> map) throws Exception{
		insert("checkout.addCartOrderTotalTotal", map);
	}
	
	/**
	 * 장바구니 주문 요약을 삭제한다.
	 * @param String
	 * @throws Exception
	 */
	public void deleteCartOrderTotal(String customer_id) throws Exception{
		delete("checkout.deleteCartOrderTotal", customer_id);
	}
	
	/**
	 * 장바구니 주문 요약을 코드로 삭제한다.
	 * @param String
	 * @throws Exception
	 */
	public void deleteCartOrderTotalByCode(Map<String, Object> map) throws Exception{
		delete("checkout.deleteCartOrderTotalByCode", map);
	}
	
	/**
	 * 장바구니 주문 요약을 가져온다.
	 * @param String
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> cartOrderTotalList(String customer_id) throws Exception{
		return (List<Map<String, Object>>)selectList("checkout.cartOrderTotalList", customer_id);
	}
	
	/**
	 * 장바구니 주문 요약에서 총합계를 가져온다.
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	public String cartOrderTotalAmount(String customer_id) throws Exception{
		return (String) selectOne("checkout.cartOrderTotalAmount", customer_id);
	}
	
	/**
	 * 주문번호 생성
	 * @param map
	 * @throws Exception
	 */
	public void createOrderId(Map<String, Object> map) throws Exception{
		insert("checkout.createOrderId", map);
	}
	
	/**
	 * 주문 테이블 생성
	 * @param map
	 * @throws Exception
	 */
	public void addOrder(Map<String, Object> map) throws Exception{
		insert("checkout.addOrder", map);
	}
	
	/**
	 * 주문 테이블에 주문상태 업데이트
	 * @param map
	 * @throws Exception
	 */
	public void updateOrderStatusId(Map<String, Object> map) throws Exception{
	    update("checkout.updateOrderStatusId", map);
	}
	
	/**
	 * Order Total 생성
	 * @param map
	 * @throws Exception
	 */
	public void addOrderTotal(Map<String, Object> map) throws Exception{
		insert("checkout.addOrderTotal", map);
	}
	
	/**
	 * 주문 History 추가
	 * @param map
	 * @throws Exception
	 */
	public void addOrderHistory(Map<String, Object> map) throws Exception{
		insert("checkout.addOrderHistory", map);
	}
	
	/**
	 * 주문 Products 추가
	 * @param map
	 * @throws Exception
	 */
	public void addOrderProduct(Map<String, Object> map) throws Exception{
		insert("checkout.addOrderProduct", map);
	}
	
	/**
	 * 고객 적립금 사용 이력 추가
	 * @param map
	 * @throws Exception
	 */
	public void addCustomerReward(Map<String, Object> map) throws Exception{
		insert("checkout.addCustomerReward", map);
	}
	
	/**
	 * 장바구니 삭제
	 * @param customer_id
	 * @throws Exception
	 */
	public void deleteCart(String customer_id) throws Exception{
		delete("checkout.deleteCart", customer_id);
	}
	
	/**
	 * 제품 수량 마이너스
	 * @param map
	 * @throws Exception
	 */
	public void updateProductQuantity(Map<String, Object> map) throws Exception{
	    update("checkout.updateProductQuantity", map);
	}
	
	/**
	 * 제품 수량을 다시 조회한다.
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	public int selectProductQuantity(Map<String, Object> map) throws Exception{
		return (int) selectOne("checkout.selectProductQuantity", map);
	}
	
	/**
	 * 재고 상태 코드를 업데이트한다.
	 * @param map
	 * @throws Exception
	 */
	public void updateProductStockStatus(Map<String, Object> map) throws Exception{
	    update("checkout.updateProductStockStatus", map);
	}
	
	/**
	 * 제품 수량 0으로 업데이트
	 * @param map
	 * @throws Exception
	 */
	public void updateProductQuantityToZero(Map<String, Object> map) throws Exception{
	    update("checkout.updateProductQuantityToZero", map);
	}
}
