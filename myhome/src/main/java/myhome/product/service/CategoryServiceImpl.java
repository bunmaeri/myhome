package myhome.product.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.commons.lang.StringEscapeUtils;
import org.springframework.stereotype.Service;

import myhome.common.util.ObjectUtils;
import myhome.product.dao.CategoryDAO;


@Service("categoryService")
public class CategoryServiceImpl implements CategoryService{

	@Resource(name="categoryDAO")
	private CategoryDAO categoryDAO;
	
	/**
	 * 카테고리 정보 조회
	 */
	@Override
	public Map<String, Object> categoryInfo(Map<String, Object> map) throws Exception {
		Map<String, Object> resultMap = new HashMap<String,Object>();
		Map<String, Object> tempMap = categoryDAO.categoryInfo(map);
		if(null!=tempMap) {
			tempMap.put("description", StringEscapeUtils.unescapeHtml(ObjectUtils.null2void(tempMap.get("description"))));
		}
		resultMap.put("map", tempMap);
		
		return resultMap;
	}
	
	/**
	 * Sub category 목록 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@Override
	public List<Map<String, Object>> subCategory(Map<String, Object> map) throws Exception {
		return categoryDAO.subCategory(map);
	}
	
	/**
	 * 카테고리 제품 목록 총 갯수
	 */
	@Override
	public int categoryProductTotal(Map<String, Object> map) throws Exception {
		return categoryDAO.categoryProductTotal(map);
	}
	
	/**
	 * 카테고리 제품 목록
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@Override
	public List<Map<String, Object>> categoryProduct(Map<String, Object> map) throws Exception {
		return categoryDAO.categoryProduct(map);
	}
}
