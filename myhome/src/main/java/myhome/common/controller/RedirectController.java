package myhome.common.controller;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import myhome.common.common.CommandMap;
import myhome.common.constant.Session;
import myhome.common.dto.CustomerDTO;
import myhome.common.service.CommonService;
import myhome.common.util.ObjectUtils;
import myhome.common.util.Pagemaker;
import myhome.common.util.ScriptUtils;
import myhome.common.util.StoreUtil;
import myhome.product.controller.CategoryController;

/**
 * OpenCart URL
 * @author jo
 *
 */
@Controller
public class RedirectController {
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="commonService")
	private CommonService commonService;
	
	@RequestMapping(value="/index.php", method = RequestMethod.GET, produces="application/text; charset=utf8")
    public ModelAndView redirectUrl(HttpSession session, Pagemaker pagemaker, CommandMap commandMap) throws Exception{
		String route = ObjectUtils.null2void(commandMap.get("route"));
		
		// 제품
		if(route.equals("product/product")) {
			String product_id = ObjectUtils.null2void(commandMap.get("product_id"));
			return new ModelAndView("redirect:/product/"+product_id+".dr");
		} else
		// 질병정보(255), 건강정보(1063), 임상사례(1064)
		if(route.equals("product/category")) {
			String[] path = ObjectUtils.null2void(commandMap.get("path")).split("_");
			if(path.length==2) {
				// 질병정보
				if(path[0].equals("255")) {
					return new ModelAndView("redirect:/information/disease/medicine/"+path[1]+".dr");
				} else
				// 건강정보
				if(path[0].equals("1063")) {
					return new ModelAndView("redirect:/information/health/info/"+path[1]+".dr");
				} else
				// 임상사례
				if(path[0].equals("1064")) {
					return new ModelAndView("redirect:/information/clinic/case/"+path[1]+".dr");
				}
			} else
			if(path.length==1) {
				// 질병정보
				if(path[0].equals("255")) {
					return new ModelAndView("redirect:/information/disease.dr");
				} else
				// 건강정보
				if(path[0].equals("1063")) {
					return new ModelAndView("redirect:/information/health.dr");
				} else
				// 임상사례
				if(path[0].equals("1064")) {
					return new ModelAndView("redirect:/information/clinic.dr");
				}
			}
		} else
		// 검색
		if(route.equals("product/search")) {
			String search = ObjectUtils.null2void(commandMap.get("search"));
			commandMap.put("q", search);
			
			ModelAndView mv = new ModelAndView("/common/search");
	    	session.setAttribute(Session.SEARCH_Q, (null==commandMap.get("q") || commandMap.get("q").equals(""))?"":commandMap.get("q"));
	    	session.setAttribute(Session.SEARCH_PAGER, (null==commandMap.get("page") || commandMap.get("page").equals(""))?"1":commandMap.get("page"));
	    	session.setAttribute(Session.CURRENT_CATEGORY_URL, "/search.dr");
	    	
	    	CustomerDTO customer = (CustomerDTO) session.getAttribute(Session.CUSTOMER);
	    	
	    	int count = 0;
	    	pagemaker.setPage(pagemaker.getPage());
	    	commandMap.put("language_id", StoreUtil.getLanguageId());
	    	if(null!=customer && null!=customer.getCustomerGroupId()) {
	    		commandMap.put("customer_group_id", customer.getCustomerGroupId());
	    	} else {
	    		commandMap.put("customer_group_id", "0");
	    	}
	    	count = commonService.searchTotal(commandMap.getMap()); // 레코드 총 갯수 구함
	    	pagemaker.setCount(count); // 페이지 계산

	    	commandMap.put("page", (pagemaker.getPage()-1)*pagemaker.getPER());
	    	commandMap.put("per_page", pagemaker.getPER());
	    	List<Map<String,Object>> list = commonService.search(commandMap.getMap());
	    	mv.addObject("list", list);
	    	if(list.size() > 0){
	    		mv.addObject("result", list);
	    		mv.addObject("pageMaker", pagemaker); 
	    	}
	    	
	    	/**
	    	 * 상품 비교 목록 가져오기
	    	 */
	    	mv.addObject("compareList", new CategoryController().compareList(session));
	    	
	    	ScriptUtils.categoryScript(mv);
	    	return mv;
		} else
		// 책
		if(route.equals("pavblog/blog")) {
			String blog_id = ObjectUtils.null2void(commandMap.get("blog_id"));
			if(blog_id.equals("12")) {
				return new ModelAndView("redirect:/books/1.dr");
			} else
			if(blog_id.equals("13")) {
				return new ModelAndView("redirect:/books/2.dr");
			} else
			if(blog_id.equals("14")) {
				return new ModelAndView("redirect:/books/3.dr");
			}

		}
		
    	return null;
	}
}
