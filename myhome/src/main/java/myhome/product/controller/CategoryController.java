package myhome.product.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Queue;

import javax.annotation.Resource;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import myhome.common.common.CommandMap;
import myhome.common.constant.Session;
import myhome.common.controller.BaseController;
import myhome.common.dto.CustomerDTO;
import myhome.common.util.Pagemaker;
import myhome.common.util.ScriptUtils;
import myhome.product.service.CategoryService;
import myhome.product.service.ProductService;

@Controller
public class CategoryController extends BaseController {
	Logger log = Logger.getLogger(this.getClass());

	@Resource(name="categoryService")
	private CategoryService categoryService;
	
	@Resource(name="productService")
	private ProductService productService;
	
	/**
	 * 카테고리 제품 목록 조회
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/products/category/{category_id}.dr")
    public ModelAndView productCategory(HttpSession session, Pagemaker pagemaker, @PathVariable String category_id, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/product/category");
    	
    	session.setAttribute(Session.SEARCH_Q, null); // 세션에서 검색한 것은 삭제한다.
    	
    	session.setAttribute(Session.PRODUCTS_CATEGORY_PAGER, (null==commandMap.get("page") || commandMap.get("page").equals(""))?"1":commandMap.get("page"));
    	session.setAttribute(Session.CURRENT_CATEGORY, category_id);
    	session.setAttribute(Session.CURRENT_CATEGORY_URL, "/products/category/"+category_id+".dr");

    	commandMap.put("category_id", category_id);
    	Map<String,Object> map = categoryService.categoryInfo(commandMap.getMap());
    	mv.addObject("info", map.get("map"));
    	
    	List<Map<String,Object>> filter = categoryService.subCategory(commandMap.getMap());
    	mv.addObject("filter_size", filter.size());
    	mv.addObject("filter", filter);
    	
    	CustomerDTO customer = (CustomerDTO) session.getAttribute(Session.CUSTOMER);
    	
    	int count = 0;
    	pagemaker.setPage(pagemaker.getPage());
    	count = categoryService.categoryProductTotal(commandMap.getMap()); // 레코드 총 갯수 구함
    	pagemaker.setCount(count); // 페이지 계산

//    	commandMap.put("customer_id", BaseController.getId(session));
    	if(null!=customer && null!=customer.getCustomerGroupId()) {
    		commandMap.put("customer_group_id", customer.getCustomerGroupId());
    	} else {
    		commandMap.put("customer_group_id", "0");
    	}
    	commandMap.put("page", (pagemaker.getPage()-1)*pagemaker.getPER());
    	commandMap.put("per_page", pagemaker.getPER());
    	List<Map<String,Object>> list = categoryService.categoryProduct(commandMap.getMap());
    	mv.addObject("list", list);
    	if(list.size() > 0){
    		mv.addObject("result", list);
    		mv.addObject("pageMaker", pagemaker); 
    	}
    	
    	/**
    	 * 상품 비교 목록 가져오기
    	 */
    	mv.addObject("compareList", compareList(session));
    	
    	String customer_id = BaseController.getId(session);
    	// Recently 목록에 있으면 업데이트
		commandMap.put("product_id", "0");
    	commandMap.put("customer_id", customer_id);
    	
		// Recently 목록 조회
		List<Map<String,Object>> recently = productService.listRecentlyView(commandMap.getMap());
		mv.addObject("recently", recently);
    	
    	ScriptUtils.categoryScript(mv);
    	
    	return mv;
    }
	
	/**
	 * 제품비교 목록 가져오기(세션에서)
	 * @param session
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String,Object>> compareList(HttpSession session) throws Exception {
		List<Map<String,Object>> compareList = null;
    	
		Queue<String> queue = (Queue<String>) BaseController.getCustomSession(session, Session.PRODUCTS_COMPARE);
    	if(null!=queue && !queue.isEmpty()) {
			List<String> paramList = new ArrayList<String>();
	    	int size = queue.size();
	    	String peek = null;
	    	while(!queue.isEmpty()){
	    		peek = queue.poll();
	    		paramList.add(peek);
	    	}
	    	if(paramList.size()>0) {
	    		StringBuffer sb = new StringBuffer();
		    	sb.append("<ol>");
		    	compareList = productService.listCompareProducts(paramList);
				
				size = paramList.size();
				for(int i=0;i<size;i++) {
					queue.offer(paramList.get(i));
				}
				BaseController.setCustomSession(session, queue, Session.PRODUCTS_COMPARE); // 다시 세션에 저장한다.
	    	} else {
	    		BaseController.setCustomSession(session, null, Session.PRODUCTS_COMPARE); // 다시 세션에 저장한다.
	    	}
    	}
		return compareList;
	}
}
