package myhome.account.service;

import java.util.List;
import java.util.Map;

public interface AccountService {
	/**
	 * CART 조회
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	int cart(String customer_id) throws Exception;
	
	/**
	 * 회원정보 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	Map<String, Object> accountInfo(Map<String, Object> map) throws Exception;
	
	/**
	 * 주문 제품 테이블 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> orderProductList(Map<String, Object> map) throws Exception;
	
	/**
	 * 이메일 중복 체크
	 * @param email
	 * @return
	 * @throws Exception
	 */
	int duplicateEmail(String email) throws Exception;
	
	/**
	 * 회원정보 수정
	 * @param map
	 * @throws Exception
	 */
	void updateAccountInfo(Map<String, Object> map) throws Exception;
	
	/**
	 * 비밀번호 수정
	 * @param map
	 * @throws Exception
	 */
	void updatePassword(Map<String, Object> map) throws Exception;
	
	/**
	 * 비밀번호 변경 (비밀번호 찾기)
	 * @param map
	 * @throws Exception
	 */
	void updatePasswordByEmail(Map<String, Object> map) throws Exception;
	
	/**
	 * 비밀번호 저장 (비밀번호 찾기 후 셋팅)
	 * @param map
	 * @throws Exception
	 */
	void updatePasswordByCode(Map<String, Object> map) throws Exception;
	
	/**
	 * 주문내역 총 갯수
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	int orderHistoryTotal(String customer_id) throws Exception;
	
	/**
	 * 주문내역 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> orderHistory(Map<String, Object> map) throws Exception;
	
	/**
	 * 주문내역 상세조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	Map<String, Object> orderInfo(Map<String, Object> map) throws Exception;
	
	/**
	 * 위시리스트 목록 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> wishlist(Map<String, Object> map) throws Exception;
	
	/**
	 * 위시리스트 갯수 조회
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	int wishlistCount(String customer_id) throws Exception;
	
	/**
	 * 위시리스트 삭제
	 * @param map
	 * @throws Exception
	 */
	void deleteWishlist(Map<String, Object> map) throws Exception;
	
	/**
	 * 위시리스트 존재여부 체크
	 * @param map
	 * @return
	 * @throws Exception
	 */
	int isWishlist(Map<String, Object> map) throws Exception;
	
	/**
	 * 위시리스트 추가
	 * @param map
	 * @throws Exception
	 */
	void addWishlist(Map<String, Object> map) throws Exception;
	
	/**
	 * 적립금 총 갯수
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	Map<String, Object> rewardTotal(String customer_id) throws Exception;
	
	/**
	 * 적립금 목록 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> reward(Map<String, Object> map) throws Exception;
	
	/**
	 * CART 존재여부 체크
	 * @param map
	 * @return
	 * @throws Exception
	 */
	int isCart(Map<String, Object> map) throws Exception;
	
	/**
	 * CART 추가
	 * @param map
	 * @throws Exception
	 */
	void addToCart(Map<String, Object> map) throws Exception;
	
	/**
	 * CART 업데이트(수량 합산 업데이트)
	 * @param map
	 * @param request
	 * @throws Exception
	 */
	void updateCart(Map<String, Object> map) throws Exception;
	
	/**
	 * CART Edit(수량으로 업데이트)
	 * @param map
	 * @param request
	 * @throws Exception
	 */
	void editCart(Map<String, Object> map) throws Exception;
	
	/**
	 * CART 삭제
	 * @param map
	 * @throws Exception
	 */
	void deleteCart(Map<String, Object> map) throws Exception;
	
	/**
	 * 적립금 목록 업데이트
	 * @param map
	 * @param request
	 * @throws Exception
	 */
	void updateWishlist(Map<String, Object> map) throws Exception;

	/**
	 * 주소 목록 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> address(Map<String, Object> map) throws Exception;
	
	/**
	 * 주소정보 상세조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	Map<String, Object> addressInfo(String address_id) throws Exception;
	
	/**
	 * 주소 추가
	 * @param map
	 * @return
	 * @throws Exception
	 */
	void addAddress(Map<String, Object> map) throws Exception;
	
	/**
	 * 주소 변경
	 * @param map
	 * @return
	 * @throws Exception
	 */
	void editAddress(Map<String, Object> map) throws Exception;
	
	/**
	 * 주소 삭제
	 * @param map
	 * @throws Exception
	 */
	void deleteAddress(String address_id) throws Exception;
	
	/**
	 * 기본 주소 업데이트
	 * @param map
	 * @param request
	 * @throws Exception
	 */
	void defaultAddress(Map<String, Object> map) throws Exception;
	
	/**
	 * State 목록 조회
	 * @param country_id
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> zone(String country_id) throws Exception;
	
	/**
	 * 가입경로 목록 조회
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> listCustomerJoinPath() throws Exception;
}
