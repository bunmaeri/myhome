package myhome.product.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import myhome.common.dao.AbstractDAO;

@Repository("productDAO")
public class ProductDAO extends AbstractDAO {
	/**
	 * 제품 정보 조회
	 * @param product_id
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> productInfo(String product_id) throws Exception{
		return (Map<String, Object>) selectOne("product.productInfo", product_id);
	}
	
	/**
	 * 제품 Views 수 증가
	 * @param product_id
	 * @throws Exception
	 */
	public void updateProductViews(String product_id) throws Exception{
		update("product.updateProductViews", product_id);
	}
	
	/**
	 * 최근 조회 제품 목록에 있는지 체크
	 * @param map
	 * @return
	 * @throws Exception
	 */
	public int isRecentlyView(Map<String, Object> map) throws Exception{
		return (int) selectOne("product.isRecentlyView", map);
	}
	
	/**
	 * 최근 조회 제품 추가
	 * @param map
	 * @throws Exception
	 */
	public void createRecentlyView(Map<String, Object> map) throws Exception{
		insert("product.createRecentlyView", map);
	}
	
	/**
	 * 최근 조회 제품 시간 업데이트
	 * @param map
	 * @throws Exception
	 */
	public void updateRecentlyView(Map<String, Object> map) throws Exception{
		update("product.updateRecentlyView", map);
	}
	
	/**
	 * 최근 조회 제품 목록 조회(5개까지)
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> listRecentlyView(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectList("product.listRecentlyView", map);
	}
	
	/**
	 * 쿠키 - 최근 조회 제품 목록 조회(5개까지)
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> listCookieRecentlyView(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectList("product.listCookieRecentlyView", map);
	}
	
	/**
	 * 원산지 이름 조회
	 * @param location
	 * @return
	 * @throws Exception
	 */
	public String location(String location) throws Exception{
		return (String) selectOne("product.location", location);
	}
	
	/**
	 * 재고현황 코드명 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	public String stockStatus(Map<String, Object> map) throws Exception{
		return (String) selectOne("product.stockStatus", map);
	}
	
	/**
	 * 제품비교하기
	 * @param list
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> listCompareProducts(List<String> list) throws Exception{
		return (List<Map<String, Object>>) selectList("product.listCompareProducts", list);
	}
	
	/**
	 * 제품비교하기 보기
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> viewCompareProducts(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectList("product.viewCompareProducts", map);
	}
}
