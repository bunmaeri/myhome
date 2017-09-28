package myhome.checkout.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.stereotype.Service;

import myhome.checkout.dao.CartDAO;
import myhome.checkout.dao.CheckoutDAO;
import myhome.checkout.utils.FedexWebService;
import myhome.common.util.ObjectUtils;

@Service("checkoutService")
public class CheckoutServiceImpl implements CheckoutService {
	@Resource(name="checkoutDAO")
	private CheckoutDAO checkoutDAO;
	
	@Resource(name="cartDAO")
	private CartDAO cartDAO;
	
	/**
	 * Geo Zone을 가져온다.
	 * @return
	 * @throws Exception
	 */
	@Override
	public List<Map<String, Object>> geoZone(Map<String, Object> param, Map<String, Object> totals, Map<String, Object> shippingAddressMap) throws Exception {
		List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
		Map<String,Object> map = checkoutDAO.geoZone(param);
//		System.out.println("map.get(geo_zone_id)========================>["+map.get("geo_zone_id")+"]");
		String geo_zone_id = ObjectUtils.null2void(map.get("geo_zone_id"));
		String weight = cartDAO.cartWeight(param);
		// GPS -> 한국
		if(geo_zone_id.equals("5")) {
		    String cost = checkoutDAO.weightShippingCost(weight);
		    map.put("code", "weight.weight_5");
		    map.put("cost", cost);
		    map.put("weight", weight);
//		    System.out.println("cost========================>"+cost);
		    list.add(map);
		} else
		// FedEX -> 미국
		if(geo_zone_id.equals("7")) {
			Map<String,Object> fedexMap = new HashMap<String,Object>();
			
			fedexMap.put("amount", totals.get("value"));
			fedexMap.put("weight", weight);
			param.put("country_id", map.get("country_id"));
			Map<String,Object> countryMap = checkoutDAO.countryInfo(param); // 국가 정보 조회
			fedexMap.put("country_iso_code_2", countryMap.get("iso_code_2"));
			
			param.put("zone_id", map.get("zone_id"));
			Map<String,Object> zoneMap = checkoutDAO.fedexZoneInfo(param); // Fedex Zone 정보 조회
			
			fedexMap.put("zone_code", zoneMap.get("code"));
			fedexMap.put("address_iso_code_2", shippingAddressMap.get("iso_code_2"));
			fedexMap.put("address_zone_code", shippingAddressMap.get("zone_code"));
			fedexMap.put("address_customer_name", shippingAddressMap.get("customer_name"));
			fedexMap.put("address_company", shippingAddressMap.get("company"));
			fedexMap.put("address_address_1", shippingAddressMap.get("address_1"));
			fedexMap.put("address_city", shippingAddressMap.get("city"));
			fedexMap.put("address_postcode", shippingAddressMap.get("postcode"));
			fedexMap.put("address_telephone", shippingAddressMap.get("telephone"));
			
			/**
			 * Fedex Rate 조회
			 */
			Map<String,Object> resultMap = FedexWebService.run(fedexMap);
			resultMap.put("geo_zone_id", geo_zone_id);
			resultMap.put("code", "fedex.fedex_ground");
			resultMap.put("title", "No signature required");
			resultMap.put("name", "No signature required");
			resultMap.put("cost", resultMap.get("cost"));
			resultMap.put("weight", weight);
			list.add(resultMap);
			
			Map<String,Object> resultMap2 = new HashMap<String,Object>();
			resultMap2.put("geo_zone_id", geo_zone_id);
			resultMap2.put("code", "fedex_sign.fedex_ground_sign");
			resultMap2.put("title", "Direct signature required");
			resultMap2.put("name", "Direct signature required");
			BigDecimal cost = new BigDecimal(ObjectUtils.null2Value(resultMap.get("cost"),"0.00"));
			cost = cost.add(new BigDecimal("4.5"));
			resultMap2.put("cost", cost);
			resultMap2.put("weight", weight);
			list.add(resultMap2);
		}
		return list;
	}
	
	/**
	 * 적립포인트 합계
	 * @return
	 * @throws Exception
	 */
	@Override
	public String rewardTotal(String customer_id) throws Exception {
		return checkoutDAO.rewardTotal(customer_id);
	}

	/**
	 * Sales Tax를 계산한다.
	 * @return
	 * @throws Exception
	 */
	@Override
	public Map<String, Object> caclSalesTax(Map<String, Object> map) throws Exception {
//		Map<String, Object> resultMap = new HashMap<String,Object>();
//		Map<String, Object> tempMap = checkoutDAO.caclSalesTax(map);
//		resultMap.put("map", tempMap);
//		
//		return resultMap;
		return checkoutDAO.caclSalesTax(map);
	}
	
	/**
	 * 주문요약 정렬 순서를 가져온다.
	 * @return
	 * @throws Exception
	 */
	@Override
	public List<Map<String, Object>> getSortOrder() throws Exception {
		return checkoutDAO.getSortOrder();
	}
	
	/**
	 * 장바구니 주문 요약에 추가한다.
	 */
	@Override
	public void addCartOrderTotal(Map<String, Object> map) throws Exception {
		checkoutDAO.addCartOrderTotal(map);
	}
	
	/**
	 * 장바구니 주문 요약에 총합계를 추가한다.
	 */
	@Override
	public void addCartOrderTotalTotal(Map<String, Object> map) throws Exception {
		checkoutDAO.addCartOrderTotalTotal(map);
	}
	
	/**
	 * 장바구니 주문 요약을 삭제한다.
	 */
	@Override
	public void deleteCartOrderTotal(String customer_id) throws Exception {
		checkoutDAO.deleteCartOrderTotal(customer_id);
	}
	
	/**
	 * 장바구니 주문 요약을 코드로 삭제한다.
	 */
	@Override
	public void deleteCartOrderTotalByCode(Map<String, Object> map) throws Exception {
		checkoutDAO.deleteCartOrderTotalByCode(map);
	}
	
	/**
	 * 장바구니 주문 요약을 가져온다.
	 * @param String
	 * @return
	 * @throws Exception
	 */
	@Override
	public List<Map<String, Object>> cartOrderTotalList(String customer_id) throws Exception {
		return checkoutDAO.cartOrderTotalList(customer_id);
	}
	
	/**
	 * 장바구니 주문 요약에서 총합계를 가져온다.
	 * @param String
	 * @return
	 * @throws Exception
	 */
	@Override
	public String cartOrderTotalAmount(String customer_id) throws Exception {
		return checkoutDAO.cartOrderTotalAmount(customer_id);
	}
	
	/**
	 * 주문번호 생성
	 */
	@Override
	public void createOrderId(Map<String, Object> map) throws Exception{
		checkoutDAO.createOrderId(map);
	}
	
	/**
	 * 주문 테이블 생성
	 */
	@Override
	public void addOrder(Map<String, Object> map) throws Exception{
		checkoutDAO.addOrder(map);
	}
	
	/**
	 * 주문 테이블에 주문상태 업데이트
	 */
	@Override
	public void updateOrderStatusId(Map<String, Object> map) throws Exception{
		checkoutDAO.updateOrderStatusId(map);
	}
	
	/**
	 * Order Total 생성
	 */
	@Override
	public void addOrderTotal(Map<String, Object> map) throws Exception{
		checkoutDAO.addOrderTotal(map);
	}
	
	/**
	 * 주문 History 추가
	 */
	@Override
	public void addOrderHistory(Map<String, Object> map) throws Exception{
		checkoutDAO.addOrderHistory(map);
	}
	
	/**
	 * 주문 Products 추가
	 */
	@Override
	public void addOrderProduct(Map<String, Object> map) throws Exception{
		checkoutDAO.addOrderProduct(map);
	}
	
	/**
	 * 고객 적립금 사용 이력 추가
	 */
	@Override
	public void addCustomerReward(Map<String, Object> map) throws Exception{
		checkoutDAO.addCustomerReward(map);
	}
	
	/**
	 * 장바구니 주문 삭제
	 */
	@Override
	public void deleteCart(String customer_id) throws Exception {
		checkoutDAO.deleteCart(customer_id);
	}
	
	/**
	 * 제품 수량 마이너스
	 * 제품 수량 조회해서 0이면 재고 상태코드를 5(재고 없음)으로 업데이트
	 * 제품 수량이 0보다 작으면 재고 상태코드를 5(재고 없음)으로 업데이트하고 제품 수량을 0으로 셋팅
	 */
	@Override
	public void updateProductQuantity(Map<String, Object> map) throws Exception{
		checkoutDAO.updateProductQuantity(map);
		
		int product_quantity = checkoutDAO.selectProductQuantity(map);
		if(product_quantity==0) {
			map.put("stock_status_id", 5); // 재고 없음
			checkoutDAO.updateProductStockStatus(map);
		} else
		if(product_quantity < 0) {
			map.put("stock_status_id", 5); // 재고 없음
			checkoutDAO.updateProductStockStatus(map);
			
			// 수량이 0보다 작으면 0으로 맞춘다.
			checkoutDAO.updateProductQuantityToZero(map);
		}
	}
}
