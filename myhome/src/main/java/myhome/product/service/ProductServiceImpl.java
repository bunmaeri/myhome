package myhome.product.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.commons.lang.StringEscapeUtils;
import org.springframework.stereotype.Service;

import myhome.common.util.ObjectUtils;
import myhome.common.util.StoreUtil;
import myhome.product.dao.ProductDAO;

@Service("productService")
public class ProductServiceImpl implements ProductService {
	@Resource(name="productDAO")
	private ProductDAO productDAO;
	
	/**
	 * 제품 정보 조회
	 */
	@Override
	public Map<String, Object> productInfo(Map<String, Object> map) throws Exception {
		Map<String, Object> resultMap = new HashMap<String,Object>();
		Map<String, Object> tempMap = productDAO.productInfo(map);
		if(null!=tempMap) {
			tempMap.put("description", StringEscapeUtils.unescapeHtml(ObjectUtils.null2void(tempMap.get("description"))));
			tempMap.put("location_name", productDAO.location(ObjectUtils.null2void(tempMap.get("location"))));
			tempMap.put("language_id", StoreUtil.getLanguageId());
			tempMap.put("stock_status_name", productDAO.stockStatus(tempMap));
			
//			// view count PLUS
//			productDAO.updateProductViews(product_id);
		}
		resultMap.put("map", tempMap);
		
		return resultMap;
	}
	
	/**
	 * 제품 Views 수 증가
	 */
	@Override
	public void updateProductViews(String product_id) throws Exception{
		productDAO.updateProductViews(product_id);
	}
	
	/**
	 * 최근 조회 제품 목록에 있는지 체크
	 */
	@Override
	public int isRecentlyView(Map<String, Object> map) throws Exception {
		return productDAO.isRecentlyView(map);
	}
	
	/**
	 * 최근 조회 제품 추가
	 */
	@Override
	public void createRecentlyView(Map<String, Object> map) throws Exception{
		productDAO.createRecentlyView(map);
	}
	
	/**
	 * 최근 조회 제품 시간 업데이트
	 */
	@Override
	public void updateRecentlyView(Map<String, Object> map) throws Exception{
		productDAO.updateRecentlyView(map);
	}
	
	/**
	 * 최근 조회 제품 목록 조회(5개까지)
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@Override
	public List<Map<String, Object>> listRecentlyView(Map<String, Object> map) throws Exception {
		return productDAO.listRecentlyView(map);
	}
	
	/**
	 * 최근 조회 제품 목록 조회(5개까지)
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@Override
	public List<Map<String, Object>> listCookieRecentlyView(Map<String, Object> map) throws Exception {
		return productDAO.listCookieRecentlyView(map);
	}
	
	/**
	 * 제품비교하기
	 * @param list
	 * @return
	 * @throws Exception
	 */
	@Override
	public List<Map<String, Object>> listCompareProducts(List<String> list) throws Exception {
		return productDAO.listCompareProducts(list);
	}
	
	/**
	 * 제품비교하기 보기
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@Override
	public List<Map<String, Object>> viewCompareProducts(Map<String, Object> map) throws Exception {
		return productDAO.viewCompareProducts(map);
	}
}
