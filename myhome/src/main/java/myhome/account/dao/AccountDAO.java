package myhome.account.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import myhome.common.dao.AbstractDAO;
import myhome.common.dto.CustomerDTO;

@Repository("accountDAO")
public class AccountDAO  extends AbstractDAO {

	/**
	 * 로그인 공지사항을 조회한다.
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> loginContent(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("login.loginContent", map);
	}
	
	/**
	 * 로그인
	 * @param map
	 * @return
	 * @throws Exception
	 */
	public CustomerDTO login(Map<String, Object> map) throws Exception{
		return (CustomerDTO) selectOne("login.login", map);
	}
	
	/**
	 * 고객정보 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	public CustomerDTO customer(String customer_id) throws Exception{
		return (CustomerDTO) selectOne("login.customer", customer_id);
	}
	
	/**
	 * CODE로 로그인 (비밀번호 찾기 링크로 들어왔을 때)
	 * @param map
	 * @return
	 * @throws Exception
	 */
	public CustomerDTO loginByCode(Map<String, Object> map) throws Exception{
		return (CustomerDTO) selectOne("login.loginByCode", map);
	}
	
	/**
	 * 고객의 그룹을 조회한다.
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> checkCustomerGroupReward(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("login.checkCustomerGroupReward", map);
	}
	
	/**
	 * 고객 그룹명을 가져온다.
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> customerGroupName(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("login.customerGroupName", map);
	}
	
	/**
	 * 가입경로명을 가져온다.
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> joinPathName(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("login.joinPathName", map);
	}
	
	/**
	 * 회원 등록
	 * @param map
	 * @throws Exception
	 */
	public void addCustomer(Map<String, Object> map) throws Exception{
		insert("login.addCustomer", map);
	}
	
	/**
	 * 회원 로그인 이력 추가
	 * @param map
	 * @throws Exception
	 */
	public void addCustomerLogin(Map<String, Object> map) throws Exception{
		insert("login.addCustomerLogin", map);
	}
	
	/**
	 * CART
	 * @param map
	 * @return
	 * @throws Exception
	 */
	public int cart(String customer_id) throws Exception{
		return (int) selectOne("account.cart", customer_id);
	}
	
	/**
	 * 회원정보 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> accountInfo(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("account.accountInfo", map);
	}
	
	/**
	 * 이메일 중복 체크
	 * @param map
	 * @return
	 * @throws Exception
	 */
	public int duplicateEmail(String email) throws Exception{
		return (int) selectOne("account.duplicateEmail", email);
	}
	
	/**
	 * 회원정보 저장
	 * @param map
	 * @throws Exception
	 */
	public void updateAccountInfo(Map<String, Object> map) throws Exception{
		update("account.updateAccountInfo", map);
	}
	
	/**
	 * 비밀번호 저장
	 * @param map
	 * @throws Exception
	 */
	public void updatePassword(Map<String, Object> map) throws Exception{
		update("account.updatePassword", map);
	}
	
	/**
	 * 비밀번호 변경 (비밀번호 찾기)
	 * @param map
	 * @throws Exception
	 */
	public void updatePasswordByEmail(Map<String, Object> map) throws Exception{
		update("account.updatePasswordByEmail", map);
	}
	
	/**
	 * 비밀번호 저장 (비밀번호 찾기 후 셋팅)
	 * @param map
	 * @throws Exception
	 */
	public void updatePasswordByCode(Map<String, Object> map) throws Exception{
		update("account.updatePasswordByCode", map);
	}
	
	/**
	 * 주문내역 총 갯수
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	public int orderHistoryTotal(String customer_id) throws Exception{
		return (int) selectOne("account.orderHistoryTotal", customer_id);
	}
	
	/**
	 * 주문내역 목록 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> orderHistory(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>)selectPagingList("account.orderHistory", map);
	}
	
	/**
	 * 주문정보 상세조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> orderInfo(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("account.orderInfo", map);
	}
	
	/**
	 * 주문 제품 테이블 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> orderProductList(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectList("account.orderProductList", map);
	}
	
	/**
	 * 주문 Total 목록
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> orderTotalList(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectList("account.orderTotalList", map);
	}
	
	/**
	 * 주문정보 History 목록
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> orderHistoryList(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectList("account.orderHistoryList", map);
	}
	
	/**
	 * 위시리스트 목록
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> wishlist(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectList("account.wishlist", map);
	}
	
	/**
	 * 위시리스트 갯수 조회
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	public int wishlistCount(String customer_id) throws Exception{
		return (int) selectOne("account.wishlistCount", customer_id);
	}
	
	/**
	 * 위시리스트 삭제
	 * @param map
	 * @throws Exception
	 */
	public void deleteWishlist(Map<String, Object> map) throws Exception{
		delete("account.deleteWishlist", map);
	}
	
	/**
	 * 위시리스트 존재여부 체크
	 * @param map
	 * @return
	 * @throws Exception
	 */
	public int isWishlist(Map<String, Object> map) throws Exception{
		return (int) selectOne("account.isWishlist", map);
	}
	
	/**
	 * 위시리스트 추가
	 * @param map
	 * @throws Exception
	 */
	public void addWishlist(Map<String, Object> map) throws Exception{
		insert("account.addWishlist", map);
	}
	
	/**
	 * 적립금 총 갯수 / 합계
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> rewardTotal(String customer_id) throws Exception{
		return (Map<String, Object>) selectOne("account.rewardTotal", customer_id);
	}
	
	/**
	 * 적립금 목록 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> reward(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectPagingList("account.reward", map);
	}
	
	/**
	 * CART 존재여부 체크
	 * @param map
	 * @return
	 * @throws Exception
	 */
	public int isCart(Map<String, Object> map) throws Exception{
		return (int) selectOne("account.isCart", map);
	}
	
	/**
	 * CART 추가
	 * @param map
	 * @throws Exception
	 */
	public void addToCart(Map<String, Object> map) throws Exception{
		insert("account.addToCart", map);
	}
	
	/**
	 * CART 업데이트(수량 합산 업데이트)
	 * @param map
	 * @throws Exception
	 */
	public void updateCart(Map<String, Object> map) throws Exception{
		update("account.updateCart", map);
	}
	
	/**
	 * CART Edit(수량으로 업데이트)
	 * @param map
	 * @throws Exception
	 */
	public void editCart(Map<String, Object> map) throws Exception{
		update("account.editCart", map);
	}
	
	/**
	 * CART 삭제
	 * @param map
	 * @throws Exception
	 */
	public void deleteCart(Map<String, Object> map) throws Exception{
		delete("account.deleteCart", map);
	}
	
	/**
	 * 적립금 목록 업데이트
	 * @param map
	 * @throws Exception
	 */
	public void updateWishlist(Map<String, Object> map) throws Exception{
		update("account.updateWishlist", map);
	}
	
	/**
	 * 주소 목록 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> address(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectList("account.address", map);
	}
	
	/**
	 * 주소정보 상세조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> addressInfo(String country_id) throws Exception{
		return (Map<String, Object>) selectOne("account.addressInfo", country_id);
	}
	
	/**
	 * 주소 추가
	 * @param map
	 * @throws Exception
	 */
	public void addAddress(Map<String, Object> map) throws Exception{
		insert("account.addAddress", map);
	}
	
	/**
	 * 주소 변경
	 * @param map
	 * @throws Exception
	 */
	public void editAddress(Map<String, Object> map) throws Exception{
		insert("account.editAddress", map);
	}
	
	/**
	 * 주소 삭제
	 * @param map
	 * @throws Exception
	 */
	public void deleteAddress(String address_id) throws Exception{
		delete("account.deleteAddress", address_id);
	}
	
	/**
	 * 결제 기본 주소 업데이트
	 * @param map
	 * @throws Exception
	 */
	public void defaultPaymentAddress(Map<String, Object> map) throws Exception{
		update("account.defaultPaymentAddress", map);
	}
	
	/**
	 * 배송 기본 주소 업데이트
	 * @param map
	 * @throws Exception
	 */
	public void defaultShippingAddress(Map<String, Object> map) throws Exception{
		update("account.defaultShippingAddress", map);
	}
	
	/**
	 * State 목록 조회
	 * @param country_id
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> zone(String country_id) throws Exception{
		return (List<Map<String, Object>>) selectList("account.zone", country_id);
	}
	
	/**
	 * 가입경로 목록 조회
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> listCustomerJoinPath() throws Exception{
		return (List<Map<String, Object>>) selectList("account.listCustomerJoinPath");
	}
}
