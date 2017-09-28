package myhome.account.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

import myhome.account.dao.AccountDAO;

@Service("accountService")
public class AccountServiceImpl implements AccountService{
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="accountDAO")
	private AccountDAO accountDAO;
	
	/**
	 * CART 조회
	 */
	@Override
	public int cart(String customer_id) throws Exception {
		return accountDAO.cart(customer_id);
	}
	
	/**
	 * 회원정보 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@Override
	public Map<String, Object> accountInfo(Map<String, Object> map) throws Exception {
		Map<String, Object> resultMap = new HashMap<String,Object>();
		Map<String, Object> tempMap = accountDAO.accountInfo(map);
		resultMap.put("map", tempMap);
		
		return resultMap;
	}
	
	/**
	 * 이메일 중복 체크
	 * @param email
	 * @return
	 * @throws Exception
	 */
	@Override
	public int duplicateEmail(String email) throws Exception {
		return accountDAO.duplicateEmail(email);
	}
	
	/**
	 * 회원정보 수정
	 * @param map
	 * @throws Exception
	 */
	@Override
	public void updateAccountInfo(Map<String, Object> map) throws Exception{
		accountDAO.updateAccountInfo(map);
	}
	
	/**
	 * 비밀번호 수정
	 * @param map
	 * @throws Exception
	 */
	@Override
	public void updatePassword(Map<String, Object> map) throws Exception{
		accountDAO.updatePassword(map);
	}
	
	/**
	 * 비밀번호 변경 (비밀번호 찾기)
	 * @param map
	 * @throws Exception
	 */
	@Override
	public void updatePasswordByEmail(Map<String, Object> map) throws Exception{
		accountDAO.updatePasswordByEmail(map);
	}
	
	/**
	 * 비밀번호 저장 (비밀번호 찾기 후 셋팅)
	 * @param map
	 * @throws Exception
	 */
	@Override
	public void updatePasswordByCode(Map<String, Object> map) throws Exception{
		accountDAO.updatePasswordByCode(map);
	}
	
	/**
	 * 주문내역 총 갯수
	 */
	@Override
	public int orderHistoryTotal(String customer_id) throws Exception {
		return accountDAO.orderHistoryTotal(customer_id);
	}
	
	/**
	 * 주문내역 목록 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@Override
	public List<Map<String, Object>> orderHistory(Map<String, Object> map) throws Exception {
		return accountDAO.orderHistory(map);
	}
	
	/**
	 * 주문정보 상세조회
	 */
	@Override
	public Map<String, Object> orderInfo(Map<String, Object> map) throws Exception {
		Map<String, Object> resultMap = new HashMap<String,Object>();
		Map<String, Object> tempMap = accountDAO.orderInfo(map);
		resultMap.put("info", tempMap);
		resultMap.put("products", accountDAO.orderProductList(map));
		resultMap.put("totals", accountDAO.orderTotalList(map));
		resultMap.put("histories", accountDAO.orderHistoryList(map));
		
		return resultMap;
	}
	
	/**
	 * 주문 제품 테이블 조회
	 */
	@Override
	public List<Map<String, Object>> orderProductList(Map<String, Object> map) throws Exception {
		return accountDAO.orderProductList(map);
	}
	
	/**
	 * 위시리스트 목록 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@Override
	public List<Map<String, Object>> wishlist(Map<String, Object> map) throws Exception {
		return accountDAO.wishlist(map);
	}
	
	/**
	 * 위시리스트 갯수 조회
	 */
	@Override
	public int wishlistCount(String customer_id) throws Exception {
		return accountDAO.wishlistCount(customer_id);
	}
	
	/**
	 * 위시리스트 삭제
	 */
	@Override
	public void deleteWishlist(Map<String, Object> map) throws Exception {
		accountDAO.deleteWishlist(map);
	}
	
	/**
	 * 위시리스트 존재여부 체크
	 */
	@Override
	public int isWishlist(Map<String, Object> map) throws Exception {
		return accountDAO.isWishlist(map);
	}
	
	/**
	 * 위시리스트 추가
	 */
	@Override
	public void addWishlist(Map<String, Object> map) throws Exception {
		accountDAO.addWishlist(map);
	}
	
	/**
	 * 적립금 총 갯수 / 합계
	 */
	@Override
	public Map<String, Object> rewardTotal(String customer_id) throws Exception {
		Map<String, Object> resultMap = new HashMap<String,Object>();
		Map<String, Object> tempMap = accountDAO.rewardTotal(customer_id);
		resultMap.put("total", tempMap);
		
		return resultMap;
	}
	
	/**
	 * 적립금 목록 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@Override
	public List<Map<String, Object>> reward(Map<String, Object> map) throws Exception {
		return accountDAO.reward(map);
	}
	
	/**
	 * CART 존재여부 체크
	 */
	@Override
	public int isCart(Map<String, Object> map) throws Exception {
		return accountDAO.isCart(map);
	}
	
	/**
	 * CART 추가
	 */
	@Override
	public void addToCart(Map<String, Object> map) throws Exception{
		accountDAO.addToCart(map);
	}
	
	/**
	 * CART 업데이트(수량 합산 업데이트)
	 */
	@Override
	public void updateCart(Map<String, Object> map) throws Exception {
		accountDAO.updateCart(map);
	}
	
	/**
	 * CART Edit(수량으로 업데이트)
	 */
	@Override
	public void editCart(Map<String, Object> map) throws Exception {
		accountDAO.editCart(map);
	}
	
	/**
	 * CART 삭제
	 */
	@Override
	public void deleteCart(Map<String, Object> map) throws Exception {
		accountDAO.deleteCart(map);
	}
	
	/**
	 * 적립금 목록 업데이트
	 */
	@Override
	public void updateWishlist(Map<String, Object> map) throws Exception {
		accountDAO.updateWishlist(map);
	}
	
	/**
	 * 주소 목록 조회
	 */
	@Override
	public List<Map<String, Object>> address(Map<String, Object> map) throws Exception {
		return accountDAO.address(map);
	}
	
	/**
	 * 주소 정보 상세조회
	 */
	@Override
	public Map<String, Object> addressInfo(String address_id) throws Exception {
		Map<String, Object> resultMap = new HashMap<String,Object>();
		Map<String, Object> tempMap = accountDAO.addressInfo(address_id);
		resultMap.put("map", tempMap);
		
		return resultMap;
	}
	
	/**
	 * 주소 추가
	 */
	@Override
	public void addAddress(Map<String, Object> map) throws Exception {
		accountDAO.addAddress(map);
	}
	
	/**
	 * 주소 변경
	 */
	@Override
	public void editAddress(Map<String, Object> map) throws Exception {
		accountDAO.editAddress(map);
	}
	
	/**
	 * 주소 삭제
	 */
	@Override
	public void deleteAddress(String address_id) throws Exception {
		accountDAO.deleteAddress(address_id);
	}
	
	/**
	 * 기본 주소 업데이트
	 */
	@Override
	public void defaultAddress(Map<String, Object> map) throws Exception {
		if(map.get("address_type").equals("payment")) {
			accountDAO.defaultPaymentAddress(map);
		} else {
			accountDAO.defaultShippingAddress(map);
		}
		
	}
	
	/**
	 * State 목록 조회
	 */
	@Override
	public List<Map<String, Object>> zone(String country_id) throws Exception {
		return accountDAO.zone(country_id);
	}
	
	/**
	 * 가입경로 목록 조회
	 */
	@Override
	public List<Map<String, Object>> listCustomerJoinPath() throws Exception {
		return accountDAO.listCustomerJoinPath();
	}
}
