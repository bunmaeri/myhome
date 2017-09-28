package myhome.checkout.service;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.stereotype.Service;

import myhome.checkout.dao.CartDAO;

@Service("cartService")
public class CartServiceImpl implements CartService {
	@Resource(name="cartDAO")
	private CartDAO cartDAO;
	
	/**
	 * 장바구니
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@Override
	public List<Map<String, Object>> cart(Map<String, Object> map) throws Exception {
		return cartDAO.cart(map);
	}
	
	/**
	 * 장바구니 소계
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> cartSubTotal(Map<String, Object> map) throws Exception {
		return cartDAO.cartSubTotal(map);
	}
	
	/**
	 * 장바구니 총합계
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> cartTotal(Map<String, Object> map) throws Exception {
		return cartDAO.cartTotal(map);
	}
	
	/**
	 * 주문 합계 목록
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	@Override
	public List<Map<String, Object>> orderTotal(Map<String, Object> map) throws Exception {
		return cartDAO.orderTotal(map);
	}
}
