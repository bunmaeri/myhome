package myhome.product.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringEscapeUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import myhome.account.service.LoginService;
import myhome.account.service.AccountService;
import myhome.common.common.CommandMap;
import myhome.common.constant.Session;
import myhome.common.controller.BaseController;
import myhome.common.dto.CustomerDTO;
import myhome.common.util.ObjectUtils;
import myhome.common.util.ScriptUtils;
import myhome.common.util.StoreUtil;
import myhome.language.CartLanguage;
import myhome.product.service.ProductService;

@Controller
public class ProductController extends BaseController {
	Logger log = Logger.getLogger(this.getClass());

	@Resource(name="productService")
	private ProductService productService;
	
	@Resource(name="accountService")
	private AccountService accountService;
	
	@Resource(name="loginService")
	private LoginService loginService;
	
	/**
	 * 제품 정보 조회
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/product/{product_id}.dr")
    public ModelAndView productInfo(HttpServletRequest request, HttpServletResponse response, @PathVariable String product_id, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/product/product");

    	// view count PLUS
    	productService.updateProductViews(product_id);
    	
    	// Recently Viewed
    	// 로그인 했는지 체크한다.
    	CustomerDTO customer = (CustomerDTO) BaseController.getUserInfo(request);
//    	String customer_id = BaseController.getId(request);
    	if(null!=customer) {
    		// Recently 목록에 있으면 업데이트
    		commandMap.put("product_id", product_id);
	    	commandMap.put("customer_id", customer.getId());
	    	
    		// Recently 목록 조회
    		List<Map<String,Object>> recently = productService.listRecentlyView(commandMap.getMap());
    		mv.addObject("recently", recently);
    		
    		if(productService.isRecentlyView(commandMap.getMap())>0) {
	    		productService.updateRecentlyView(commandMap.getMap());
	    	} else {
	    		productService.createRecentlyView(commandMap.getMap());
	    	}
	   
	    	mv.addObject("isWishlist", accountService.isWishlist(commandMap.getMap()));
    	} else {
//    		CookieUtils cookie = new CookieUtils();
//    		// Recently 목록 조회
//    		List<String> products = cookie.getValueList(Session.COOKIE_RECENTLY_VIEWED, request);
//    		log.debug("list.size===>"+products.size());
//    		commandMap.put("products", products);
//    		List<Map<String,Object>> recently = productService.listCookieRecentlyView(commandMap.getMap());
//    		mv.addObject("recently", recently);
//    		
//    		// 쿠키가 존재하면 ADD
//    		if(cookie.isExist(Session.COOKIE_RECENTLY_VIEWED, request)) {
//    			cookie.setCookie(Session.COOKIE_RECENTLY_VIEWED, product_id, 10, request, response);
//    		} else {
//    			// 쿠키가 없으면 CREATE
//    			cookie.createNewCookie(Session.COOKIE_RECENTLY_VIEWED, product_id, 10, request, response);
//    		}
    	}
    	if(null!=customer && null!=customer.getCustomerGroupId()) {
    		commandMap.put("customer_group_id", customer.getCustomerGroupId());
    	} else {
    		commandMap.put("customer_group_id", "0");
    	}
    	Map<String,Object> map = productService.productInfo(product_id);
    	mv.addObject("info", map.get("map"));
    	
    	if(null!=BaseController.getCustomSession(request, Session.ERROR_MSG)) {
    		mv.addObject("errorMsg", BaseController.getCustomSession(request, Session.ERROR_MSG));
    		BaseController.setCustomSession(request, null, Session.ERROR_MSG);
    	}
    	
    	ScriptUtils.productScript(mv);
    	
    	return mv;
    }
	
	/**
	 * 장바구니에 추가
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/account/product/add_to_cart/{product_id}/{quantity}.dr")
    public ModelAndView addToCart(HttpSession session, @PathVariable String product_id, @PathVariable String quantity, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("redirect:/product/{product_id}.dr");
    	
    	@SuppressWarnings("unchecked")
		Map<String,Object> product = (Map<String, Object>) productService.productInfo(product_id).get("map");
    	
    	// Stock 체크
    	String stock_status_id = ObjectUtils.null2void(product.get("stock_status_id"));
//    	System.out.println("================================================="+stock_status_id);
    	if(!stock_status_id.equals("7")) { // 재고 있음이 아니면..
    		BaseController.setCustomSession(session, CartLanguage.Error.getStockStatus(ObjectUtils.null2void(product.get("stock_status_name"))), Session.ERROR_MSG);
    		mv.addObject("errorMsg", CartLanguage.Error.getStockStatus(ObjectUtils.null2void(product.get("stock_status_name"))));
			return mv;
    	}
    	
    	// 최대 주문 가능수량 체크
    	String minimum = ObjectUtils.null2void(product.get("minimum"));
    	if(!minimum.equals("")) {
    		if(quantity.compareTo(minimum)>0) {
    			BaseController.setCustomSession(session, CartLanguage.Error.getProductMaxmum(minimum), Session.ERROR_MSG);
//    			mv.addObject("errorMsg", CartLanguage.Error.getProductMaxmum(minimum));
    			return mv;
    		}
    	}
    	
    	String customer_id = BaseController.getId(session);
    	commandMap.put("customer_id", customer_id);
    	commandMap.put("product_id", product_id);
    	commandMap.put("quantity", quantity);
    	
    	// 장바구니에 없으면 add
    	if(accountService.isCart(commandMap.getMap())==0) {
    		accountService.addToCart(commandMap.getMap());
    	} else {
    		// 장바구니에 있으면 수량만큼 업데이트
    		accountService.updateCart(commandMap.getMap());
    	}
    	
    	session.setAttribute(Session.CART, accountService.cart(customer_id));
    	
    	return mv;
    }
	
	/**
	 * 장바구니에 추가 (다음 URL을 받음)
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/account/product/add_to_cart/{product_id}/{quantity}/{to}.dr")
    public ModelAndView addToCartFromAnywhere(HttpSession session, @PathVariable String product_id, @PathVariable String quantity, @PathVariable String to, CommandMap commandMap) throws Exception{
    	String[] nextUrls = to.split("_");
    	StringBuffer nextSb = new StringBuffer();
    	for(int i=0;i<nextUrls.length;i++) {
    		nextSb.append("/").append(nextUrls[i]);
    	}
//    	System.err.println(nextSb.toString());
		ModelAndView mv = new ModelAndView("redirect:"+nextSb.toString()+".dr");
    	
		@SuppressWarnings("unchecked")
		Map<String,Object> product = (Map<String, Object>) productService.productInfo(product_id).get("map");
    	
		// Stock 체크
    	String stock_status_id = ObjectUtils.null2void(product.get("stock_status_id"));
//    	System.out.println("================================================="+stock_status_id);
    	if(!stock_status_id.equals("7")) { // 재고 있음이 아니면..
    		BaseController.setCustomSession(session, CartLanguage.Error.getStockStatus(ObjectUtils.null2void(product.get("stock_status_name"))), Session.ERROR_MSG);
    		mv.addObject("errorMsg", CartLanguage.Error.getStockStatus(ObjectUtils.null2void(product.get("stock_status_name"))));
			return mv;
    	}
    	
    	// 최대 주문 가능수량 체크 위해 고객정보와 주소정보를 조회한다.
    	String customer_id = BaseController.getId(session);
    	CustomerDTO custDTO = loginService.customerAndAddress(customer_id);
    	String address_country_id = "223";
    	if(null!=custDTO && null!=custDTO.getAddressCountryId()) {
    		address_country_id = ObjectUtils.null2Value(custDTO.getAddressCountryId(), "223");
    	}
    	
    	// 한국 주문만
    	if(address_country_id.equals("113")) {
    		// 최대 주문 가능수량 체크
    		String minimum = ObjectUtils.null2void(product.get("minimum"));
    		if(!minimum.equals("")) {
    			if(quantity.compareTo(minimum)>0) {
    				BaseController.setCustomSession(session, CartLanguage.Error.getProductMaxmum(minimum), Session.ERROR_MSG);
    				//    			mv.addObject("errorMsg", CartLanguage.Error.getProductMaxmum(minimum));
    				return mv;
    			}
    		}
    	}
    	
//    	String customer_id = BaseController.getId(session);
    	commandMap.put("customer_id", customer_id);
    	commandMap.put("product_id", product_id);
    	commandMap.put("quantity", quantity);
    	
    	// 장바구니에 없으면 add
    	if(accountService.isCart(commandMap.getMap())==0) {
    		accountService.addToCart(commandMap.getMap());
    	} else {
    		// 장바구니에 있으면 수량만큼 업데이트
    		accountService.updateCart(commandMap.getMap());
    	}
    	
    	session.setAttribute(Session.CART, accountService.cart(customer_id));
    	
    	return mv;
    }
	
	/**
	 * 위시리스트 추가
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/account/wishlist/add/{product_id}/{quantity}.dr")
    public ModelAndView addWishlist(HttpSession session, @PathVariable String product_id, @PathVariable String quantity, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("redirect:/product/{product_id}.dr");
    	String customer_id = BaseController.getId(session);
    	commandMap.put("customer_id", customer_id);
    	commandMap.put("product_id", product_id);
    	commandMap.put("quantity", quantity);
    	
    	if(accountService.isWishlist(commandMap.getMap())==0) {
    		accountService.addWishlist(commandMap.getMap());
    		session.setAttribute(Session.WISHLIST_COUNT, accountService.wishlistCount(customer_id));
    	}
    	
    	return mv;
    }
	
	/**
	 * 제품비교 (세션에 저장)
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value="/products/compare/add/{product_id}.dr", produces="application/text; charset=utf8")
    public @ResponseBody String addCompare(HttpSession session, @PathVariable String product_id, CommandMap commandMap) throws Exception{
    	Queue<String> queue = (Queue<String>) BaseController.getCustomSession(session, Session.PRODUCTS_COMPARE);
    	boolean isExistProductId = false;
    	if(null!=queue && !queue.isEmpty()) {
    		isExistProductId = queue.contains(product_id);
    		// 큐에는 4개까지만 가능
    		if(!isExistProductId && queue.size()==4) {
    			queue.poll(); // 가장 오래된 것을 하나 삭제한다.
    		}
    	} else {
    		queue = new LinkedList<String>();
    	}
    	if(!isExistProductId) {
    		queue.offer(product_id); // 새로운 제품을 큐에 추가한다.
    	}
    	
    	List<String> paramList = new ArrayList<String>();
    	int size = queue.size();
    	String peek = null;
    	while(!queue.isEmpty()){
    		peek = queue.poll();
    		paramList.add(peek);
    	}
    	
    	StringBuffer sb = new StringBuffer();
    	sb.append("<ol>");
		List<Map<String,Object>> list = productService.listCompareProducts(paramList);
		if(list.size()>0) {
			for(Map<String,Object> map : list){
				sb.append("<li class=\"item odd\">");
				sb.append("    <a href=\"/product/").append(map.get("product_id")).append(".dr\" class=\"product-image\">");
				sb.append("        <img src=\"/image/").append(map.get("image")).append("\" style=\"height:100px;\" alt=\"").append(map.get("name")).append("\" title=\"").append(map.get("name")).append("\">");
				sb.append("    </a>");
				sb.append("    <p class=\"product-name\">");
				sb.append("        <a href=\"/product/").append(map.get("product_id")).append("\">").append(map.get("name")).append("</a>");
				sb.append("    </p>");
				sb.append("</li>");
			}
		}
		sb.append("</ol>");
		sb.append("<div class=\"actions buttons-set\">");
		sb.append("    <a title=\"Compare\" class=\"button-small button-plain button  button-white\" href=\"/products/compare.dr\"><span><span>비교하기</span></span></a>");
		sb.append("    <a class=\"link\" href=\"javascript:;\" onclick=\"goCompareDelete()\"><i class=\"fa fa-trash-o\"></i> 모두 삭제</a>");
		sb.append("</div>");
		
		size = paramList.size();
		for(int i=0;i<size;i++) {
			queue.offer(paramList.get(i));
		}
		BaseController.setCustomSession(session, queue, Session.PRODUCTS_COMPARE); // 다시 세션에 저장한다.
		
    	return sb.toString();
    }
	
	/**
	 * 제품비교 모두 삭제
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/products/compare/delete.dr", produces="application/text; charset=utf8")
    public @ResponseBody String removeCompareAll(HttpSession session, CommandMap commandMap) throws Exception{
    	StringBuffer sb = new StringBuffer();
    	sb.append("<p>비교를 시작하려면 제품 아래에 있는 제품비교하기를 클릭하십시오.</p>");
		BaseController.setCustomSession(session, null, Session.PRODUCTS_COMPARE); // 세션에서 삭제한다.
		
    	return sb.toString();
    }
	
	/**
	 * 제품비교하기 페이지
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value="/products/compare.dr")
    public ModelAndView compareList(HttpSession session, HttpServletRequest request, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/product/compare");
    	
    	CustomerDTO customer = (CustomerDTO) session.getAttribute(Session.CUSTOMER);
    	
    	Queue<String> queue = (Queue<String>) BaseController.getCustomSession(session, Session.PRODUCTS_COMPARE);
    	if(null==queue || queue.isEmpty()) {
    		if(null!=session.getAttribute(Session.CURRENT_CATEGORY_URL)) {
				ModelAndView mvnew = new ModelAndView("redirect:"+session.getAttribute(Session.CURRENT_CATEGORY_URL));
				if(null!=session.getAttribute(Session.SEARCH_Q)) {
					mvnew.addObject("q", session.getAttribute(Session.SEARCH_Q));
				}
    			return mvnew;
    		} else {
    			return new ModelAndView("redirect:/");
    		}
    	}
    	List<String> paramList = new ArrayList<String>();
    	int size = queue.size();
    	String peek = null;
    	while(!queue.isEmpty()){
    		peek = queue.poll();
    		paramList.add(peek);
    	}
    	
    	size = paramList.size();
		for(int i=0;i<size;i++) {
			queue.offer(paramList.get(i));
		}
		BaseController.setCustomSession(session, queue, Session.PRODUCTS_COMPARE); // 다시 세션에 저장한다.

		commandMap.put("language_id", StoreUtil.getLanguageId());
    	if(null!=customer && null!=customer.getCustomerGroupId()) {
    		commandMap.put("customer_group_id", customer.getCustomerGroupId());
    	} else {
    		commandMap.put("customer_group_id", "0");
    	}
		commandMap.put("list", paramList);
		List<Map<String,Object>> list = productService.viewCompareProducts(commandMap.getMap());
		size = list.size();
		List<String> ths = new ArrayList<String>(); // td 갯수 & 넓이 계산
		List<Map<String,Object>> products = new ArrayList<Map<String,Object>>(); // 제품명 & image
		List<Map<String,Object>> prices = new ArrayList<Map<String,Object>>(); // 가격 & 특별 가격
		List<String> models = new ArrayList<String>(); // 모델
		List<String> manufacturers = new ArrayList<String>(); // 제조사
		List<String> availabilitys = new ArrayList<String>(); // 재고현황
		List<String> descriptions = new ArrayList<String>(); // 설명
		List<String> weights = new ArrayList<String>(); // 무게
		
		Map<String,Object> map = null;
		Map<String,Object> product = null;
		Map<String,Object> price = null;
		for(int i=0;i<size;i++) {
			map = list.get(i);
			
			ths.add(String.valueOf(90/size));
			
//			products = new ArrayList<Map<String,Object>>(); // 제품명 & image
			product = new HashMap<String,Object>();
			product.put("th",String.valueOf(90/size));
			product.put("image",ObjectUtils.null2Value(map.get("image"),"/image/product-placeholder.png"));
			product.put("name",ObjectUtils.null2void(map.get("name")));
			product.put("product_id",ObjectUtils.null2void(map.get("product_id")));
			product.put("special",ObjectUtils.null2void(map.get("special")));
			products.add(product);
			
//			prices = new ArrayList<Map<String,Object>>(); // 가격 & 특별 가격
			price = new HashMap<String,Object>();
			price.put("price",ObjectUtils.null2Value(map.get("price"),"0"));
			price.put("special",ObjectUtils.null2void(map.get("special")));
			prices.add(price);
			
			models.add(ObjectUtils.null2void(map.get("model")));
			manufacturers.add(ObjectUtils.null2void(map.get("manufacturer_name")));
			availabilitys.add(ObjectUtils.null2void(map.get("availability")));
			descriptions.add(StringEscapeUtils.unescapeHtml(ObjectUtils.null2void(map.get("description"))));
			weights.add(ObjectUtils.null2void(map.get("weight")));
		}
	    mv.addObject("ths", ths);
	    mv.addObject("products", products);
	    mv.addObject("prices", prices);
	    mv.addObject("models", models);
	    mv.addObject("manufacturers", manufacturers);
	    mv.addObject("availabilitys", availabilitys);
	    mv.addObject("descriptions", descriptions);
	    mv.addObject("weights", weights);
	    
    	ScriptUtils.productCompareScript(mv);
    	return mv;
    }

	/**
	 * 제품비교 삭제
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value="/products/compare/delete/{product_id}.dr", produces="application/text; charset=utf8")
    public ModelAndView removeCompare(HttpSession session, @PathVariable String product_id, CommandMap commandMap) throws Exception{
		ModelAndView mv = new ModelAndView("redirect:/products/compare.dr");
		
		Queue<String> queue = (Queue<String>) BaseController.getCustomSession(session, Session.PRODUCTS_COMPARE);
		if(null==queue || queue.isEmpty()) {
			if(null!=session.getAttribute(Session.CURRENT_CATEGORY_URL)) {
				ModelAndView mvnew = new ModelAndView("redirect:"+session.getAttribute(Session.CURRENT_CATEGORY_URL));
				if(null!=session.getAttribute(Session.SEARCH_Q)) {
					mvnew.addObject("q", session.getAttribute(Session.SEARCH_Q));
				}
    			return mvnew;
    		} else {
    			return new ModelAndView("redirect:/");
    		}
    	}
		
    	List<String> paramList = new ArrayList<String>();
    	int size = queue.size();
    	String peek = null;
    	while(!queue.isEmpty()){
    		peek = queue.poll();
    		if(!peek.equals(product_id)) {
    			paramList.add(peek);
    		}
    	}
    	
    	size = paramList.size();
		for(int i=0;i<size;i++) {
			queue.offer(paramList.get(i));
		}
		BaseController.setCustomSession(session, queue, Session.PRODUCTS_COMPARE); // 다시 세션에 저장한다.
		
    	return mv;
    }
}
