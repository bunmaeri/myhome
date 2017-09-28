package myhome.checkout.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import myhome.common.dao.AbstractDAO;

@Repository("cartDAO")
public class CartDAO extends AbstractDAO {
	/**
	 * 장바구니
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> cart(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectList("cart.cart", map);
	}
	
	/**
	 * 장바구니 소계
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> cartSubTotal(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("cart.cartSubTotal", map);
	}
	
	/**
	 * 장바구니 총 합계
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> cartTotal(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("cart.cartTotal", map);
	}
	
	/**
	 * 주문 합계 목록
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> orderTotal(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectList("cart.orderTotal", map);
	}
	
	/**
	 * 장바구니 제품 무게
	 * @param map
	 * @return
	 * @throws Exception
	 */
	public String cartWeight(Map<String, Object> map) throws Exception{
		return (String) selectOne("cart.cartWeight", map);
	}
}
