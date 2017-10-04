package myhome.checkout.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import myhome.account.service.LoginService;
import myhome.account.service.AccountService;
import myhome.checkout.service.CartService;
import myhome.common.common.CommandMap;
import myhome.common.constant.Message;
import myhome.common.constant.Session;
import myhome.common.controller.BaseController;
import myhome.common.controller.CodeController;
import myhome.common.dto.CustomerDTO;
import myhome.common.util.ObjectUtils;
import myhome.common.util.ScriptUtils;
import myhome.common.util.StoreUtil;
import myhome.information.service.InformationService;

@Controller
public class CartController extends BaseController {
	Logger log = Logger.getLogger(this.getClass());

	@Resource(name="cartService")
	private CartService cartService;
	
	@Resource(name="accountService")
	private AccountService accountService;
	
	@Resource(name="informationService")
	private InformationService informationService;
	
	@Resource(name="loginService")
	private LoginService loginService;
	
	private int language_id = StoreUtil.getLanguageId();
	
	/**
	 * 장바구니 조회
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/cart.dr")
    public ModelAndView productInfo(HttpSession session, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/checkout/cart");

    	// 공통코드 로드
    	CodeController code = new CodeController();
    	
    	List<String> errList = new ArrayList<String>();
    	
    	// 세션 클리어
    	BaseController.setCustomSession(session, null, Session.IS_CART_ERROR);
    	BaseController.setCustomSession(session, null, Session.CART_OVER_LIMIT);
    	BaseController.setCustomSession(session, null, Session.CART_OUT_OF_STOCK);
    	
    	CustomerDTO customer = (CustomerDTO) session.getAttribute(Session.CUSTOMER);
    	String customer_id = BaseController.getId(session);
   
    	// 고객정보와 주소 정보 조회한다.
//    	System.err.println("customer_id>>>>>>>>>>"+customer_id);
    	CustomerDTO custDTO = loginService.customerAndAddress(customer_id);
    	String address_country_id = "223";
//    	System.err.println("custDTO.getAddressCountryId()>>>>>>>>>>"+custDTO.getAddressCountryId());
    	if(null!=custDTO && null!=custDTO.getAddressCountryId()) {
    		address_country_id = ObjectUtils.null2Value(custDTO.getAddressCountryId(), "223");
    	}
    	
    	// 총합계
    	if(null!=customer && null!=customer.getCustomerGroupId() && !customer.getCustomerGroupId().equals("")) {
    		commandMap.put("customer_group_id", customer.getCustomerGroupId());
    	} else {
    		commandMap.put("customer_group_id", "0");
    	}
    	commandMap.put("customer_id", customer_id);
		Map<String,Object> totals = cartService.cartTotal(commandMap.getMap());
		BigDecimal totalPrice = (BigDecimal) totals.get("sum_price"); // 총금액(33: Cosmetic 제외)
		int totalQuantity = Integer.parseInt(ObjectUtils.null2void(totals.get("sum_quantity"))); // 총수량(33: Cosmetic 제외)
		// 주문한도액, 주문상품 수량을 초과했을 때.. (한국 주문만 해당)
		if(address_country_id.equals("113")) {
			if(totalPrice.compareTo(new BigDecimal(code.getValueInt("checkout_max_total"))) > 0 || totalQuantity > code.getValueInt("checkout_max_product_count")) {
				String CART_OVER_LIMIT = Message.Error.setCART_OVER_LIMIT(code.getValue("checkout_max_total"), code.getValue("checkout_max_product_count"));
				session.setAttribute(Session.CART_OVER_LIMIT, CART_OVER_LIMIT);
				errList.add(CART_OVER_LIMIT);
			}
		}
 
    	// 장바구니 목록 조회
    	commandMap.put("language_id", language_id);
    	
    	List<Map<String,Object>> rtnList = new ArrayList<Map<String,Object>>();
		List<Map<String,Object>> list = cartService.cart(commandMap.getMap());
		int size = list.size();
		Map<String,Object> tempMap = null;
		for(int i=0;i<size;i++) {
			tempMap = list.get(i);
//			System.err.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+tempMap.get("product_quantity"));
			int chk_product_quantity = Integer.parseInt(ObjectUtils.null2Value(tempMap.get("product_quantity"),"0"));
			int chk_quantity = Integer.parseInt(ObjectUtils.null2Value(tempMap.get("quantity"),"0"));
//			System.err.println(chk_quantity+":"+chk_product_quantity);
			if(chk_product_quantity==0
			   || chk_quantity > chk_product_quantity) {
				// Out of Stock 제품이 있는지 체크
//				session.setAttribute(Session.CART_OUT_OF_STOCK, Message.Error.CART_OUT_OF_STOCK);
				errList.add(Message.Error.CART_OUT_OF_STOCK);
				//break;
			}
			chk_quantity = 0;
			chk_quantity = Integer.parseInt(ObjectUtils.null2Value(tempMap.get("quantity"),"0"));
			int chk_minimum = Integer.parseInt(ObjectUtils.null2Value(tempMap.get("minimum"),"0"));
			// 제품별로 최대 구매수량 체크 (한국 주문만)
			if(address_country_id.equals("113")) {
				if(chk_quantity > chk_minimum) {
					// 제품별로 최대 구매수량 체크
					String CART_PRODUCT_OVER_LIMIT = Message.Error.setCART_PRODUCT_OVER_LIMIT(ObjectUtils.null2Value(tempMap.get("minimum"),"0"));
					//session.setAttribute(Session.CART_PRODUCT_OVER_LIMIT, CART_PRODUCT_OVER_LIMIT);
					errList.add(Message.Error.CART_PRODUCT_OVER_LIMIT_MSG);
					tempMap.put("error_limit", CART_PRODUCT_OVER_LIMIT);
					//break;
				}
			}
			rtnList.add(tempMap);
		}
		mv.addObject("list", rtnList);
		if(errList.size()>0) {
			session.setAttribute(Session.IS_CART_ERROR, true);
			mv.addObject("errMessage", errList);
		}

		String order_id = ObjectUtils.null2void(BaseController.getCustomSession(session, Session.ORDER_ID));
		List<Map<String,Object>> totalList = null;
		
		if(null==order_id || order_id.equals("")) {
			totalList = new ArrayList<Map<String,Object>>();
			// 소계
			Map<String,Object> subtotals = cartService.cartSubTotal(commandMap.getMap());
			totalList.add(subtotals);
		
			mv.addObject("total", totals);
			// 총합계
//			totals = checkoutService.cartTotal(customer_id);
		} else {
			commandMap.put("order_id", order_id);
			totalList = cartService.orderTotal(commandMap.getMap());
			int last = totalList.size()-1;
			
			mv.addObject("total", totalList.get(last));
//			totals = totalList.get(last);
			totalList.remove(last);
		}
		mv.addObject("subTotals", totalList);
		mv.addObject("total", totals);
    	
		// 장바구니 페이지 컨텐츠 조회
    	commandMap.put("contents_id", "5");
    	commandMap.put("language_id", StoreUtil.getLanguageId());
    	Map<String,Object> map = informationService.contentData(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
		
    	ScriptUtils.cartScript(mv);
    	
    	return mv;
    }
	
	/**
	 * 수량변경
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/cart/update/{product_id}/{quantity}.dr")
    public ModelAndView updateCart(HttpSession session, @PathVariable String product_id, @PathVariable String quantity, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("redirect:/cart.dr");
    	
    	String customer_id = BaseController.getId(session);
    	commandMap.put("customer_id", customer_id);
    	commandMap.put("product_id", product_id);
    	commandMap.put("quantity", quantity);
    	
    	accountService.editCart(commandMap.getMap());
    	
    	// 장바구니 갯수
    	BaseController.setCustomSession(session, accountService.cart(customer_id), Session.CART);
		
    	return mv;
    }
	
	/**
	 * 장바구니 삭제
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/cart/delete/{product_id}.dr")
    public ModelAndView deleteWishlist(HttpSession session, @PathVariable String product_id, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("redirect:/cart.dr");
    	
    	String customer_id = BaseController.getId(session);
    	commandMap.put("customer_id", customer_id);
    	commandMap.put("product_id", product_id);
    	
    	accountService.deleteCart(commandMap.getMap());
    	
    	// 장바구니 갯수
    	BaseController.setCustomSession(session, accountService.cart(customer_id), Session.CART);
		
    	return mv;
    }
	
	/**
	 * 장바구니 Edit
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/cart/update.dr")
    public ModelAndView updateWishlist(HttpSession session, CommandMap commandMap) throws Exception{
		ModelAndView mv = new ModelAndView("redirect:/cart.dr");
    	
    	String customer_id = BaseController.getId(session);
    	if(commandMap.get("product_id") instanceof String[]) {
	    	String[] product_id = (String[])commandMap.get("product_id");
	    	String[] quantity = (String[])commandMap.get("quantity");
	    	int size = product_id.length;
	    	Map<String, Object> map = null;
	    	for(int i=0;i<size;i++) {
	    		map = new HashMap<String,Object>();
	    		map.put("customer_id", customer_id);
	    		map.put("product_id", product_id[i]);
	    		map.put("quantity", quantity[i]);
	    		
	    		accountService.editCart(map);
	    	}
    	} else
		if(commandMap.get("product_id") instanceof String) {
			commandMap.put("customer_id", customer_id);
			commandMap.put("product_id", commandMap.get("product_id"));
			commandMap.put("quantity", commandMap.get("quantity"));
    		
    		accountService.editCart(commandMap.getMap());
		}
    	// 장바구니 갯수
    	BaseController.setCustomSession(session, accountService.cart(customer_id), Session.CART);
    	
    	return mv;
    }
}
