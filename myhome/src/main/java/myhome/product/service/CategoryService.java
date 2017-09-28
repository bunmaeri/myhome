package myhome.product.service;

import java.util.List;
import java.util.Map;

public interface CategoryService {

	/**
	 * 카테고리 정보 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	Map<String, Object> categoryInfo(Map<String, Object> map) throws Exception;
	
	/**
	 * Sub category 목록 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> subCategory(Map<String, Object> map) throws Exception;
	
	/**
	 * 카테고리 제품 목록 총 갯수
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	int categoryProductTotal(Map<String, Object> map) throws Exception;
	
	/**
	 * 카테고리 제품 목록
	 * @param map
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> categoryProduct(Map<String, Object> map) throws Exception;
}
