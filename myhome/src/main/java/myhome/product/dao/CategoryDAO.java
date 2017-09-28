package myhome.product.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import myhome.common.dao.AbstractDAO;

@Repository("categoryDAO")
public class CategoryDAO extends AbstractDAO {

	/**
	 * 카테고리 정보 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> categoryInfo(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("category.categoryInfo", map);
	}
	
	/**
	 * Sub category 목록 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> subCategory(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectList("category.subCategory", map);
	}
	
	/**
	 * 카테고리 제품 목록 총 갯수
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	public int categoryProductTotal(Map<String, Object> map) throws Exception{
		return (int) selectOne("category.categoryProductTotal", map);
	}
	
	/**
	 * 카테고리 제품 목록
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> categoryProduct(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectPagingList("category.categoryProduct", map);
	}
}
