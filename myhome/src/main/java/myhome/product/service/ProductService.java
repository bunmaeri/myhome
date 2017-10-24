package myhome.product.service;

import java.util.List;
import java.util.Map;

public interface ProductService {
	/**
	 * 제품 정보 조회
	 * @param product_id
	 * @return
	 * @throws Exception
	 */
	Map<String, Object> productInfo(Map<String, Object> map) throws Exception;
	
	/**
	 * 제품 Views 수 증가
	 * @param product_id
	 * @throws Exception
	 */
	void updateProductViews(String product_id) throws Exception;
	
	/**
	 * 최근 조회 제품 목록에 있는지 체크
	 * @param map
	 * @return
	 * @throws Exception
	 */
	int isRecentlyView(Map<String, Object> map) throws Exception;

	/**
	 * 최근 조회 제품 추가
	 * @param map
	 * @throws Exception
	 */
	void createRecentlyView(Map<String, Object> map) throws Exception;
	
	/**
	 * 최근 조회 제품 시간 업데이트
	 * @param map
	 * @throws Exception
	 */
	void updateRecentlyView(Map<String, Object> map) throws Exception;
	
	/**
	 * 최근 조회 제품 목록 조회(5개까지)
	 * @param map
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> listRecentlyView(Map<String, Object> map) throws Exception;
	
	/**
	 * 최근 조회 제품 목록 조회(5개까지)
	 * @param map
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> listCookieRecentlyView(Map<String, Object> map) throws Exception;
	
	/**
	 * 제품비교하기
	 * @param list
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> listCompareProducts(List<String> list) throws Exception;
	
	/**
	 * 제품비교하기 보기
	 * @param map
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> viewCompareProducts(Map<String, Object> map) throws Exception;
}
