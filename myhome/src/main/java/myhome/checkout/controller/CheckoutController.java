package myhome.checkout.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import myhome.account.service.AccountService;
import myhome.checkout.service.CartService;
import myhome.checkout.service.CheckoutService;
import myhome.checkout.utils.AuthorizeCreditCard;
import myhome.common.common.CommandMap;
import myhome.common.constant.Message;
import myhome.common.constant.Session;
import myhome.common.controller.BaseController;
import myhome.common.controller.CodeController;
import myhome.common.dto.CustomerDTO;
import myhome.common.email.MailChimpEmail;
import myhome.common.email.OrderEmail;
import myhome.common.util.CustomTag;
import myhome.common.util.DateUtils;
import myhome.common.util.ObjectUtils;
import myhome.common.util.OrderUtils;
import myhome.common.util.ScriptUtils;
import myhome.common.util.StoreUtil;
import myhome.common.util.WebUtils;
import myhome.information.service.InformationService;
import myhome.language.CheckoutLanguage;

@Controller
public class CheckoutController extends BaseController {
	Logger log = Logger.getLogger(this.getClass());

	@Resource(name="checkoutService")
	private CheckoutService checkoutService;
	
	@Resource(name="cartService")
	private CartService cartService;
	
	@Resource(name="accountService")
	private AccountService accountService;
	
	@Resource(name="informationService")
	private InformationService informationService;
	
	private int language_id = StoreUtil.getLanguageId();
	/**
	 * Checkout
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value="/checkout/checkout.dr")
    public ModelAndView checkout(HttpSession session, CommandMap commandMap) throws Exception {
    	ModelAndView mv = new ModelAndView("/checkout/checkout");

//    	if(!BaseController.isExsit(session, Session.CART)) {
//    		return new ModelAndView("redirect:/");
//    	}
    	
    	// 에러 리스트
    	List<String> errList = new ArrayList<String>();
    	
    	// 세션 클리어
    	BaseController.setCustomSession(session, null, Session.IS_CART_ERROR);
    	BaseController.setCustomSession(session, null, Session.CART_OVER_LIMIT);
    	BaseController.setCustomSession(session, null, Session.CART_OUT_OF_STOCK);
    	
    	// 공통코드 로드
    	CodeController code = new CodeController();
    	
    	// 세션 고객 정보
    	CustomerDTO customer = BaseController.getUserInfo(session);
    	String customer_id = customer.getId();
    	
    	/**
    	 * 장바구니 주문 요약을 삭제한다.
    	 */
    	checkoutService.deleteCartOrderTotal(customer_id);
    	
    	
    	Map<String, Object> sortMap = new HashMap<String, Object>();
    	/**
    	 * 결제자 주소 & 배송지 주소
    	 */
    	OrderUtils outil = new OrderUtils();
    	Map<String,Object> payment = accountService.addressInfo(customer.getAddressId());
    	Map<String,Object> paymentAddressMap = (Map<String, Object>) payment.get("map");
    	paymentAddressMap.put("address", outil.addressView(paymentAddressMap));
    	mv.addObject("payment_address", paymentAddressMap);
    	
    	String shipping_address = ObjectUtils.null2void(BaseController.getCustomSession(session, Session.CHECKOUT_SHIPPING_ADDRESS));
    	Map<String,Object> shipping = accountService.addressInfo(shipping_address);
    	Map<String,Object> shippingAddressMap = (Map<String, Object>) shipping.get("map");
    	shippingAddressMap.put("address", outil.addressView(shippingAddressMap));
    	mv.addObject("shipping_address", shippingAddressMap);
    	
    	/**
    	 * 장바구니 총합계
    	 */
    	if(null!=customer && null!=customer.getCustomerGroupId() && !customer.getCustomerGroupId().equals("")) {
    		commandMap.put("customer_group_id", customer.getCustomerGroupId());
    	} else {
    		commandMap.put("customer_group_id", "0");
    	}
    	commandMap.put("customer_id", customer_id);
		Map<String,Object> totals = cartService.cartTotal(commandMap.getMap());
		BigDecimal totalPrice = (BigDecimal) totals.get("value");
		int totalQuantity = Integer.parseInt(ObjectUtils.null2void(totals.get("sum_quantity")));
		// 주문한도액, 주문상품 수량을 초과했을 때..
		if(totalPrice.compareTo(new BigDecimal(code.getValueInt("checkout_max_total"))) > 0 || totalQuantity > code.getValueInt("checkout_max_product_count")) {
			String CART_OVER_LIMIT = Message.Error.setCART_OVER_LIMIT(code.getValue("checkout_max_total"), code.getValue("checkout_max_product_count"));
			BaseController.setCustomSession(session, CART_OVER_LIMIT, Session.CART_OVER_LIMIT);
//			session.setAttribute(Session.CART_OVER_LIMIT, CART_OVER_LIMIT);
			errList.add(CART_OVER_LIMIT);
		}
    			
    	/**
    	 *  장바구니 목록 조회
    	 */
		commandMap.put("customer_id", customer_id);
    	commandMap.put("language_id", language_id);
		List<Map<String,Object>> list = cartService.cart(commandMap.getMap());
		int size = list.size();
		Map<String,Object> tempMap = null;
		for(int i=0;i<size;i++) {
			tempMap = list.get(i);
			int chk_product_quantity = Integer.parseInt(ObjectUtils.null2Value(tempMap.get("product_quantity"),"0"));
			int chk_quantity = Integer.parseInt(ObjectUtils.null2Value(tempMap.get("quantity"),"0"));
//			System.err.println(chk_quantity+":"+chk_product_quantity);
			if(chk_product_quantity==0
			   || chk_quantity > chk_product_quantity) {
//			if(ObjectUtils.null2Value(tempMap.get("product_quantity"),"0").equals("0")
//					   || ObjectUtils.null2Value(tempMap.get("quantity"),"0").compareTo(ObjectUtils.null2Value(tempMap.get("product_quantity"),"0"))>0) {
				// Out of Stock 제품이 있는지 체크
				BaseController.setCustomSession(session, Message.Error.CART_OUT_OF_STOCK, Session.CART_OUT_OF_STOCK);
//				session.setAttribute(Session.CART_OUT_OF_STOCK, Message.Error.CART_OUT_OF_STOCK);
				errList.add(Message.Error.CART_OUT_OF_STOCK);
				break;
			}
		}
		mv.addObject("list", list);
		if(errList.size()>0) {
			BaseController.setCustomSession(session, true, Session.IS_CART_ERROR);
//			session.setAttribute(Session.IS_CART_ERROR, true);
			mv.addObject("errMessage", errList);
		}
		
    	/**
    	 * 배송방법
    	 */
    	commandMap.put("address_id", shipping_address);
//    	commandMap.put("telephone", customer.getTelephone());
    	List<Map<String,Object>> shipping_methods = checkoutService.geoZone(commandMap.getMap(), totals, shippingAddressMap);
    	mv.addObject("shipping_methods", shipping_methods);
    	
    	// 첫번째 배송방법을 선택하도록 한다.
    	Map<String,Object> shipping_method = null;
    	if(shipping_methods.size()>0) {
    		shipping_method = shipping_methods.get(0);
    	}
    	mv.addObject("shipping_method", shipping_method);
    	
    	BaseController.setCustomSession(session, shipping_method, Session.CHECKOUT_SHIPPING_METHOD);
    	
    	// 주문요약 순서 - Tax
//    	sortMap.put("tax", shipping_method);
    	
    	// 주문요약 순서 - 배송비
    	sortMap.put("shipping", shipping_method);
    	
    	// 사용가능 포인트
    	mv.addObject("rewardTotal", ObjectUtils.null2Value(checkoutService.rewardTotal(customer_id),"0"));
    	
		
//		List<Map<String,Object>> totalList = null;
//		totalList = new ArrayList<Map<String,Object>>();
		// 소계
		Map<String,Object> subtotals = cartService.cartSubTotal(commandMap.getMap());
		// 주문요약 순서 - 소계
    	sortMap.put("sub_total", subtotals);
    	// 주문요약 순서 - 총합
//    	sortMap.put("total", totals);
//		totalList.add(subtotals);
//		mv.addObject("subTotals", totalList);
//		mv.addObject("total", totals);
		
//		log.debug("subtotals.get(value)====================>"+subtotals.get("value"));
		// 90불이 넘으면 Shipping Fee 보여준다.
    	String shipping_country_id = ObjectUtils.null2void(shippingAddressMap.get("country_id"));
    	if(shipping_country_id.equals("113")) {
    		mv.addObject("show_shipping_fee", "Y");
			
			// 주문요약 순서 - 배송비 반액(90불이 넘을 때)
			if(totalPrice.compareTo(new BigDecimal("90")) >= 0 && !shipping_method.get("cost").equals("") && !shipping_method.get("cost").equals("0")) {
				sortMap.put("shipping_half", new BigDecimal(ObjectUtils.null2Value(shipping_method.get("cost"),"0")).divide(new BigDecimal(2)));
			}
			
			/**
			 * 배송비에 대하여 알려드립니다.
			 */
	    	commandMap.put("contents_id", "6");
	    	commandMap.put("language_id", StoreUtil.getLanguageId());
	    	Map<String,Object> map = informationService.contentData(commandMap.getMap());
	    	mv.addObject("shipping_fee", map.get("map"));
	    	
//			commandMap.put("information_id", 19);
//	    	commandMap.put("language_id", language_id);
//	    	Map<String,Object> map = informationService.information(commandMap.getMap());
//	    	mv.addObject("shipping_fee", map.get("map"));
	    	
			if(new Double(ObjectUtils.null2Value(subtotals.get("value"), "0"))>=code.getValueInt("checkout_show_shipping_fee_total")) {
				mv.addObject("show_shipping_donation", "Y");
		    	/**
		    	 * 배송비 성금에 대하여
		    	 */
				commandMap.put("contents_id", "7");
		    	Map<String,Object> map2 = informationService.contentData(commandMap.getMap());
		    	mv.addObject("shipping_donation", map2.get("map"));
		    	
//		    	commandMap.put("information_id", 20);
//		    	Map<String,Object> map2 = informationService.information(commandMap.getMap());
//		    	mv.addObject("shipping_donation", map2.get("map"));
			}
    	}
		
		this.sortOrder(session, sortMap, customer_id);
		mv.addObject("totals", checkoutService.cartOrderTotalList(customer_id));
		
		int thisYear = DateUtils.getYear();
		mv.addObject("cardStartYear", thisYear);
		mv.addObject("cardEndYear", thisYear+10);
		
    	ScriptUtils.checkoutScript(mv);
    	
    	return mv;
    }
	
	/**
	 * 배송비 셋팅
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/checkout/checkout/shipping.dr", produces="application/text; charset=utf8")
	public @ResponseBody String shipping(HttpSession session, CommandMap commandMap) throws Exception{
		String customer_id = BaseController.getId(session);
		List<Map<String,Object>> list0 = checkoutService.getSortOrder();
		if(list0.size()>0) {
			for(Map<String,Object> map : list0){
				// 
				if(map.get("code").equals("shipping")) {
					map.put("customer_id", customer_id);
					map.put("title", ObjectUtils.null2void(commandMap.get("carrier_name")));
					map.put("value", ObjectUtils.null2void(commandMap.get("carrier_cost")));
					checkoutService.addCartOrderTotal(map);
					
				} else
				// 총합계
				if(map.get("code").equals("total")) {
					map.put("customer_id", customer_id);
					checkoutService.addCartOrderTotalTotal(map);
				}
			}
		}
		
//		StringBuffer sb = new StringBuffer();
//		List<Map<String,Object>> list = checkoutService.cartOrderTotalList(customer_id);
//		if(list.size()>0) {
//			for(Map<String,Object> map : list){
//				sb.append("<tr>");
//				sb.append("<td class=\"a-left\" colspan=\"1\">").append(map.get("title")).append("</td>");
//				sb.append("<td class=\"a-right\"><span class=\"price\">").append(CustomTag.getCurrency(ObjectUtils.null2Value(map.get("value"),"0"))).append("</span>");
//				sb.append("</td>");
//				sb.append("</tr>");
//			}
//		}
    	
		return this.summaryHTML(customer_id);
    }
	
	/**
	 * 배송비 Donation
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/checkout/checkout/donate.dr", produces="application/text; charset=utf8")
	public @ResponseBody String donate(HttpSession session, CommandMap commandMap) throws Exception{
		String customer_id = BaseController.getId(session);
		List<Map<String,Object>> list0 = checkoutService.getSortOrder();
		String donate = ObjectUtils.null2Value(commandMap.getMap().get("donate"),"0");
		String shipping_fee = ObjectUtils.null2Value(commandMap.getMap().get("shipping_fee"),"0");
		if(list0.size()>0) {
			for(Map<String,Object> map : list0){
				// 
				// 배송비 반액
				if(map.get("code").equals("shipping_half")) {
					map.put("customer_id", customer_id);
					// 전액 기부일 때.
					if(donate.equals("1")) {
						checkoutService.deleteCartOrderTotalByCode(map);
					} else {
						BigDecimal shipping = new BigDecimal(shipping_fee).divide(new BigDecimal(2), BigDecimal.ROUND_UP);
						map.put("value", "-"+shipping);
						checkoutService.addCartOrderTotal(map);
					}
				} else
				// 총합계
				if(map.get("code").equals("total")) {
					map.put("customer_id", customer_id);
					checkoutService.addCartOrderTotalTotal(map);
				}
			}
		}
		
//		StringBuffer sb = new StringBuffer();
//		List<Map<String,Object>> list = checkoutService.cartOrderTotalList(customer_id);
//		if(list.size()>0) {
//			for(Map<String,Object> map : list){
//				sb.append("<tr>");
//				sb.append("<td class=\"a-left\" colspan=\"1\">").append(map.get("title")).append("</td>");
//				sb.append("<td class=\"a-right\"><span class=\"price\">").append(CustomTag.getCurrency(ObjectUtils.null2Value(map.get("value"),"0"))).append("</span>");
//				sb.append("<input type=\"hidden\" name=\"total_").append(ObjectUtils.null2void(map.get("code"))).append("\" id=\"total_").append(ObjectUtils.null2void(map.get("code"))).append("\" value=\"").append(ObjectUtils.null2void(map.get("value"))).append("\"/>");
//				sb.append("</td>");
//				sb.append("</tr>");
//			}
//		}
    	
		return this.summaryHTML(customer_id);
    }
	
	/**
	 * 적립금 사용
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/checkout/checkout/reward/{reward}.dr", produces="application/text; charset=utf8")
	public @ResponseBody String reward(HttpSession session, @PathVariable String reward, CommandMap commandMap) throws Exception{
		String customer_id = BaseController.getId(session);
		List<Map<String,Object>> list0 = checkoutService.getSortOrder();
		if(list0.size()>0) {
			for(Map<String,Object> map : list0){
				// 적립포인트 사용(%{reward})
				if(map.get("code").equals("reward")) {
					map.put("customer_id", customer_id);
					if(reward.equals("") || reward.equals("0")) {
						checkoutService.deleteCartOrderTotalByCode(map);
					} else {
						map.put("title", ObjectUtils.null2void(map.get("title")).replace("%{reward}", reward));
						map.put("value", "-"+new BigDecimal(reward).divide(new BigDecimal(100)));
						checkoutService.addCartOrderTotal(map);
					}
				} else
				// 총합계
				if(map.get("code").equals("total")) {
					map.put("customer_id", customer_id);
					checkoutService.addCartOrderTotalTotal(map);
				}
			}
		}
		
//		StringBuffer sb = new StringBuffer();
//		List<Map<String,Object>> list = checkoutService.cartOrderTotalList(customer_id);
//		if(list.size()>0) {
//			for(Map<String,Object> map : list){
//				sb.append("<tr>");
//				sb.append("<td class=\"a-left\" colspan=\"1\">").append(map.get("title")).append("</td>");
//				sb.append("<td class=\"a-right\"><span class=\"price\">").append(CustomTag.getCurrency(ObjectUtils.null2Value(map.get("value"),"0"))).append("</span>");
//				sb.append("</td>");
//				sb.append("</tr>");
//			}
//		}
    	
    	return this.summaryHTML(customer_id);
    }
	
	/**
	 * 주문 요약을 HTML로 리턴한다.
	 * @param customer_id
	 * @return
	 * @throws Exception
	 */
	private String summaryHTML(String customer_id) throws Exception {
		StringBuffer sb = new StringBuffer();
		List<Map<String,Object>> list = checkoutService.cartOrderTotalList(customer_id);
		if(list.size()>0) {
			for(Map<String,Object> map : list){
				sb.append("<tr>");
				sb.append("<td class=\"a-left\" colspan=\"1\">").append(map.get("title")).append("</td>");
				sb.append("<td class=\"a-right\"><span class=\"price\">").append(CustomTag.getCurrency(ObjectUtils.null2Value(map.get("value"),"0"))).append("</span>");
				sb.append("<input type=\"hidden\" name=\"total_").append(ObjectUtils.null2void(map.get("code"))).append("\" id=\"total_").append(ObjectUtils.null2void(map.get("code"))).append("\" value=\"").append(ObjectUtils.null2void(map.get("value"))).append("\"/>");
				sb.append("</td>");
				sb.append("</tr>");
			}
		}
    	
    	return sb.toString();
	}
	
	@SuppressWarnings("unchecked")
	public void sortOrder(HttpSession session, Map<String,Object> sortMap, String customer_id) throws Exception {
		List<Map<String,Object>> list = checkoutService.getSortOrder();
		Map<String,Object> tmp = null;
		if(list.size()>0) {
			for(Map<String,Object> map : list){
				// 소계
				if(map.get("code").equals("sub_total")) {
					if(sortMap.containsKey("sub_total")) {
						map.put("customer_id", customer_id);
						tmp = (Map<String, Object>) sortMap.get(map.get("code"));
						map.put("value", tmp.get("value"));
						checkoutService.addCartOrderTotal(map);
					}
				} else
				// tax
				if(map.get("code").equals("tax")) {
					if(sortMap.containsKey("shipping") && sortMap.containsKey("sub_total")) {
						map.put("customer_id", customer_id);
						tmp = (Map<String, Object>) sortMap.get("shipping");
						// 주소가 미국일 때 CA Sales Tax 적용
	//					if(tmp.get("country_id").equals("223")) {
						Map<String,Object> subMap = (Map<String, Object>) sortMap.get("sub_total");
//						log.debug("subMap===================================>"+subMap.get("value"));
						tmp.put("sub_total", subMap.get("value"));
						Map<String, Object> shippingMap = checkoutService.caclSalesTax(tmp);
	//					}
						if(null!=shippingMap) {
							String shipping = ObjectUtils.null2void(shippingMap.get("sales_tax"));
//							log.debug("shipping===================================>"+shipping);
							if(null!=shippingMap && !shipping.equals("0")) {
								map.put("value", shipping);
								checkoutService.addCartOrderTotal(map);
								// Tax 여부를 세션에 저장한다.
								BaseController.setCustomSession(session, true, Session.CHECKOUT_IS_TAX);
								// Tax Rate을 세션에 저장한다.
								BaseController.setCustomSession(session, ObjectUtils.null2void(shippingMap.get("rate")), Session.CHECKOUT_TAX_RATE);
							}
						}
					}
				} else
				// 배송비
				if(map.get("code").equals("shipping")) {
					if(sortMap.containsKey("shipping")) {
						map.put("customer_id", customer_id);
						tmp = (Map<String, Object>) sortMap.get(map.get("code"));
						map.put("title", tmp.get("name"));
						map.put("value", tmp.get("cost"));
						checkoutService.addCartOrderTotal(map);
					}
				} else
				// 배송비 반액
				if(map.get("code").equals("shipping_half")) {
					if(sortMap.containsKey("shipping_half")) {
						map.put("customer_id", customer_id);
						map.put("value", "-"+sortMap.get("shipping_half"));
						checkoutService.addCartOrderTotal(map);
					}
				} else
				// 적립포인트 사용(%{reward})
				if(map.get("code").equals("reward")) {
					if(sortMap.containsKey("reward")) {
						map.put("customer_id", customer_id);
						map.put("value", sortMap.get("reward"));
						checkoutService.addCartOrderTotal(map);
					}
				} else
				// 총합계
				if(map.get("code").equals("total")) {
					map.put("customer_id", customer_id);
					checkoutService.addCartOrderTotalTotal(map);
				}
			}
		}
	}
	
	/**
	 * 주문 처리 (중요)
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value="/checkout/process.dr")
    public ModelAndView process(HttpSession session, HttpServletRequest request, CommandMap commandMap) throws Exception{
		ModelAndView mv = new ModelAndView("jsonView");
    	
		// 세션 고객 정보
    	CustomerDTO customer = BaseController.getUserInfo(session);
    	String customer_id = customer.getId();
    	
    	// 폼 체크 결과 Map
    	Map<String, Object> validMap = new HashMap<String,Object>();
    	
    	List<Map<String,Object>> list = cartService.cart(commandMap.getMap());
		int size = list.size();
		Map<String,Object> tempMap = null;
		for(int i=0;i<size;i++) {
			tempMap = list.get(i);
			int chk_product_quantity = Integer.parseInt(ObjectUtils.null2Value(tempMap.get("product_quantity"),"0"));
			int chk_quantity = Integer.parseInt(ObjectUtils.null2Value(tempMap.get("quantity"),"0"));
//			System.err.println(chk_quantity+":"+chk_product_quantity);
			if(chk_product_quantity==0
			   || chk_quantity > chk_product_quantity) {
//			if(ObjectUtils.null2Value(tempMap.get("product_quantity"),"0").equals("0")
//					   || ObjectUtils.null2Value(tempMap.get("quantity"),"0").compareTo(ObjectUtils.null2Value(tempMap.get("product_quantity"),"0"))>0) {
				// Out of Stock 제품이 있는지 체크
				session.setAttribute(Session.CART_OUT_OF_STOCK, Message.Error.CART_OUT_OF_STOCK);
				BaseController.setCustomMessage(validMap, "error_out_of_stock", "(재고부족/품절)");
				BaseController.setCustomMessage(validMap, "error_out_of_stock_product_id", tempMap.get("product_id"));
				validMap.put("error", "error");
				validMap.put("errorMessage", CheckoutLanguage.Error.errorMessage);
				mv.addObject("Message", validMap);
				break;
			}
		}
		
		// 총합계 조회
    	String amount = checkoutService.cartOrderTotalAmount(customer_id);
    	boolean isExceptPayment = false;
    	if(amount.equals("0.0000")) {
    		isExceptPayment = true;
		}
    	
    	// 은행입금일 때에는 카드 결재 안함.
    	boolean isBankTransfer = false;
    	if(commandMap.get("payment_code").equals("bank_transfer")) {
    		isExceptPayment = true;
    		isBankTransfer = true;
    	}
    	
		
		// 카드 결재가 필요할 때만.. Form 정보 체크
		if(!isExceptPayment) {
			this.validForm(validMap, commandMap);
		}
		
		// Form 정보 체크에 통과했을 때..
		if(ObjectUtils.isEmpty(validMap)) {
			CodeController code = new CodeController();
			
	    	String apiLoginId = code.getValue("authorizenet_aim_login");
	    	String transactionKey = code.getValue("authorizenet_aim_key");
	    	
	    	// 총합계 조회
//	    	String amount = checkoutService.cartOrderTotalAmount(customer_id);
	    	
	    	// 카드 정보
	    	String cc_number = "";
	    	String cc_expire_date_month = "";
	    	String cc_expire_date_year = "";
	    	String cc_cvv2 = "";
	    	if(!isBankTransfer) {
	    		cc_number = ObjectUtils.null2void(commandMap.get("cc_number"));
		    	cc_expire_date_month = ObjectUtils.null2void(commandMap.get("cc_expire_date_month"));
		    	cc_expire_date_year = ObjectUtils.null2void(commandMap.get("cc_expire_date_year")).substring(2);
		    	cc_cvv2 = ObjectUtils.null2void(commandMap.get("cc_cvv2"));
	    	}
	    	
	    	// 결재자 정보 조회
	    	Map<String,Object> payment = accountService.addressInfo(ObjectUtils.null2void(commandMap.get("payment_address_id")));
	    	Map<String,Object> paymentMap = (Map<String, Object>) payment.get("map");
	    	
	    	// 배송자 정보 조회
	    	String shipping_address = ObjectUtils.null2void(ObjectUtils.null2void(commandMap.get("shipping_address_id")));
	    	Map<String,Object> shipping = accountService.addressInfo(shipping_address);
	    	Map<String,Object> shippingMap = (Map<String, Object>) shipping.get("map");
	    	
//	    	String invoiceNumber = ObjectUtils.null2void(map.get("invoiceNumber"));
	    	String description = ObjectUtils.null2void(code.getValue("config_comapny_name")); // Order Description - 회사 이름
	    	
	    	String email = ObjectUtils.null2void(customer.getEmail());
	    	String customerIp = ObjectUtils.null2void(WebUtils.getClientIp(request));
	    	
	    	// 결재자 정보
	    	String paymentFirstName = ObjectUtils.null2void(paymentMap.get("firstname"));
	    	String paymentLastName = ObjectUtils.null2void(paymentMap.get("lastname"));
	    	String payment_customer_name = paymentFirstName;
            if(!paymentLastName.equals("")) {
            	payment_customer_name = payment_customer_name + " " + paymentLastName;
            }
	    	String paymentCompany = ObjectUtils.null2void(paymentMap.get("company"));
	    	String paymentAddress1 = ObjectUtils.null2void(paymentMap.get("address_1"));
	    	String paymentAddress2 = ObjectUtils.null2void(paymentMap.get("address_2"));
	    	String paymentAddress = paymentAddress1;
	    	if(!paymentAddress2.equals("")) {
	    		paymentAddress = paymentAddress + " " + paymentAddress2;
	    	}
	    	String paymentCity = ObjectUtils.null2void(paymentMap.get("city"));
	    	String paymentState = ObjectUtils.null2void(paymentMap.get("zone_name"));
	    	String paymentZoneId = ObjectUtils.null2void(paymentMap.get("zone_id"));
	    	String paymentZip = ObjectUtils.null2void(paymentMap.get("postcode"));
	    	String paymentCountry = ObjectUtils.null2void(paymentMap.get("country_name"));
	    	String paymentCountryId = ObjectUtils.null2void(paymentMap.get("country_id"));
	    	String paymentPhoneNumber = ObjectUtils.null2void(paymentMap.get("telephone"));
	    	String payment_method = ObjectUtils.null2void(commandMap.get("payment_method"));
	    	String payment_code = ObjectUtils.null2void(commandMap.get("payment_code"));
	    	String payment_telephone = ObjectUtils.null2void(paymentMap.get("telephone"));
	    	String payment_requisition_id = ObjectUtils.null2void(paymentMap.get("requisition_id"));
	    	String payment_address_id = ObjectUtils.null2void(paymentMap.get("address_id"));
	    	
	    	// 배송자 정보
	    	String shippingFirstName = ObjectUtils.null2void(shippingMap.get("firstname"));
	    	String shippingLastName = ObjectUtils.null2void(shippingMap.get("lastname"));
	    	String shipping_customer_name = shippingFirstName;
            if(!shippingLastName.equals("")) {
            	shipping_customer_name = shipping_customer_name + " " + shippingLastName;
            }
	    	String shippingCompany = ObjectUtils.null2void(shippingMap.get("company"));
	    	String shippingAddress1 = ObjectUtils.null2void(shippingMap.get("address_1"));
	    	String shippingAddress2 = ObjectUtils.null2void(shippingMap.get("address_2"));
	    	String shippingAddress = shippingAddress1;
	    	if(!shippingAddress2.equals("")) {
	    		shippingAddress = shippingAddress + " " + shippingAddress2;
	    	}
	    	String shippingCity = ObjectUtils.null2void(shippingMap.get("city"));
	    	String shippingState = ObjectUtils.null2void(shippingMap.get("zone_name"));
	    	String shippingZoneId = ObjectUtils.null2void(shippingMap.get("zone_id"));
	    	String shippingZip = ObjectUtils.null2void(shippingMap.get("postcode"));
	    	String shippingCountry = ObjectUtils.null2void(shippingMap.get("country_name"));
	    	String shippingCountryId = ObjectUtils.null2void(shippingMap.get("country_id"));
	    	String shippingPhoneNumber = ObjectUtils.null2void(shippingMap.get("telephone"));
	    	String requisition_id = ObjectUtils.null2void(shippingMap.get("requisition_id"));
	    	String shipping_address_id = ObjectUtils.null2void(shippingMap.get("address_id"));
	    	
	    	String shippingfee_type = ObjectUtils.null2Value(commandMap.get("shippingfee_type"),"0");
	    	
	    	Map<String,Object> shipping_method = (Map<String, Object>) BaseController.getCustomSession(session, Session.CHECKOUT_SHIPPING_METHOD);
	    	
	    	String comment = ObjectUtils.null2void(commandMap.get("comment"));
	    	
	    	/**
	    	 * Order 테이블에 저장용 맵에 담는다.
	    	 */
	    	Map<String,Object> order = new HashMap<String,Object>();
	    	order.put("invoice_no", "0");
	    	order.put("invoice_prefix", "INV");
	    	order.put("store_id", StoreUtil.getStoreId());
            order.put("store_name", StoreUtil.getStoreName());
            order.put("store_url", StoreUtil.getStoreUrl());
            order.put("customer_id", customer_id);
            order.put("customer_group_id", customer.getCustomerGroupId());
            order.put("customer_name", customer.getCustomerName());
            order.put("firstname", customer.getFirstname());
            order.put("lastname", customer.getLastname());
            order.put("email", customer.getEmail());
            order.put("telephone", customer.getTelephone());
            order.put("fax", "");
            
            order.put("payment_customer_name", payment_customer_name);
            order.put("payment_firstname", paymentFirstName);
            order.put("payment_lastname", paymentLastName);
            order.put("payment_company", paymentCompany);
            order.put("payment_address_1", paymentAddress1);
            order.put("payment_address_2", paymentAddress2);
            order.put("payment_city", paymentCity);
            order.put("payment_postcode", paymentZip);
            order.put("payment_country", paymentCountry);
            order.put("payment_country_id", paymentCountryId);
            order.put("payment_zone", paymentState);
            order.put("payment_zone_id", paymentZoneId);
            order.put("payment_method", payment_method);
            order.put("payment_code", payment_code);
            order.put("payment_telephone", payment_telephone);
            order.put("payment_requisition_id", payment_requisition_id);
            order.put("payment_address_id", payment_address_id);
            
            order.put("shipping_customer_name", shipping_customer_name);
            order.put("shipping_firstname", shippingFirstName);
            order.put("shipping_lastname", shippingLastName);
            order.put("shipping_company", shippingCompany);
            order.put("shipping_address_1", shippingAddress1);
            order.put("shipping_address_2", shippingAddress2);
            order.put("shipping_city", shippingCity);
            order.put("shipping_postcode", shippingZip);
            order.put("shipping_country", shippingCountry);
            order.put("shipping_country_id", shippingCountryId);
            order.put("shipping_zone", shippingState);
            order.put("shipping_zone_id", shippingZoneId);
            order.put("shipping_method", shipping_method.get("name"));
            order.put("shipping_code", shipping_method.get("code"));
            order.put("shipping_telephone", shippingPhoneNumber);
            order.put("requisition_id", requisition_id);
            order.put("shipping_address_id", shipping_address_id);
            
            order.put("comment", comment);
            order.put("total", amount);
            if(!isExceptPayment) {
            	order.put("order_status_id", "0"); // 카드 결제 후에는 '2' (Processing)으로 변경
            } else {
            	if(isBankTransfer) {
            		order.put("order_status_id", code.getValue("bank_transfer_default_order_status_id")); // 은행입금: (Pending)으로
            	} else {
            		order.put("order_status_id", "2"); // 총합계가 0: (Processing)으로
            	}
            }
            order.put("affiliate_id", "0");
            order.put("commission", "0.0000");
            order.put("marketing_id", "0");
//            order.put("tracking",);
            order.put("language_id", StoreUtil.getLanguageId());
            order.put("currency_id", StoreUtil.getCurrencyId());
            order.put("currency_code", StoreUtil.getCurrencyCode());
            order.put("currency_value", StoreUtil.getCurrencyValue());
            order.put("carrier_id", shipping_method.get("name"));
            order.put("shippingfee_type", shippingfee_type);
            order.put("ip", customerIp);
            order.put("user_agent", "");
            order.put("accept_language", "");
            checkoutService.createOrderId(order); // 주문번호 생성
            checkoutService.addOrder(order); // Order 테이블에 저장
            
            String order_id = ObjectUtils.null2void(order.get("order_id"));
	    	
            Map<String,Object> historyMap = new HashMap<String,Object>();
            historyMap.put("order_id", order_id);
            historyMap.put("order_status_id", order.get("order_status_id"));
            historyMap.put("notify", "0");
            
            // Order Id를 세션에 담아 둔다.
            BaseController.setCustomSession(session, order_id, Session.ORDER_ID);
            
            if(!isExceptPayment) {
		    	/**
		    	 * 카드 결재를 위해 맵에 담는다.
		    	 */
		    	Map<String,Object> map = new HashMap<String,Object>();
		    	
		    	map.put("apiLoginId", apiLoginId); // Authorize.Net Merchant Name
		    	map.put("transactionKey", transactionKey); // Authorize.Net Merchant TransactionKey
		    	map.put("amount", amount); // total
		    	
		    	map.put("cc_number", cc_number); // 카드 소유주
		    	map.put("cc_expire_date_month", cc_expire_date_month); // cc_expire_date_month
		    	map.put("cc_expire_date_year", cc_expire_date_year); // cc_expire_date_year
		    	map.put("cc_cvv2", cc_cvv2); // cc_cvv2
		    	
		    	map.put("invoiceNumber", order_id); // invoiceNumber
		    	map.put("description", description); // description
		    	
		    	map.put("email", email); // email
		    	map.put("customerIp", customerIp); // customerIp
		    	
		    	map.put("paymentFirstName", paymentFirstName); // paymentFirstName
		    	map.put("paymentLastName", paymentLastName); // paymentLastName
		    	map.put("paymentCompany", paymentCompany); // paymentCompany
		    	map.put("paymentAddress", paymentAddress); // paymentAddress
		    	map.put("paymentCity", paymentCity); // paymentCity
		    	map.put("paymentState", paymentState); // paymentState
		    	map.put("paymentZip", paymentZip); // paymentZip
		    	map.put("paymentCountry", paymentCountry); // paymentCountry
		    	map.put("paymentPhoneNumber", paymentPhoneNumber); // paymentPhoneNumber
		    	
		    	map.put("shippingFirstName", shippingFirstName); // shippingFirstName
		    	map.put("shippingLastName", shippingLastName); // shippingLastName
		    	map.put("shippingCompany", shippingCompany); // shippingCompany
		    	map.put("shippingAddress", shippingAddress); // shippingAddress
		    	map.put("shippingCity", shippingCity); // shippingCity
		    	map.put("shippingState", shippingState); // shippingState
		    	map.put("shippingZip", shippingZip); // shippingZip
		    	map.put("shippingCountry", shippingCountry); // shippingCountry
		    	
		    	/**
		    	 * Authrize.Net 카드 결재 실행
		    	 */
		    	Map<String,Object> rtnMap = null;
		    	if(code.getValue("authorizenet_aim_server").equals("live")) {
		    		rtnMap = AuthorizeCreditCard.run(map);
		    	} else {
		    		rtnMap = AuthorizeCreditCard.runTest();
		    	}
		    	if(rtnMap.get("result").equals("success")) {
		    		/**
		    		 * 결재 후 주문상태코드 : 2(Processing)으로 변경
		    		 */
		    		String config_order_status_id = code.getValue("config_default_order_status_id");
		    		order.put("order_status_id", config_order_status_id); // 
		    		checkoutService.updateOrderStatusId(order);
		    		
		    		validMap.put("success", CheckoutLanguage.Success.SUCCESS);
					mv.addObject("Message", validMap);
					
					StringBuffer sb = new StringBuffer();
		    		sb.append("Authorization Code: ").append(ObjectUtils.null2void(rtnMap.get("authCode"))).append("<br>");
		    		sb.append("AVS Response: ").append(ObjectUtils.null2void(rtnMap.get("avsResultCode"))).append("<br>");
		    		sb.append("Transaction ID: ").append(ObjectUtils.null2void(rtnMap.get("transId")));
		    		historyMap.put("comment", sb.toString());
		    	} else {
		    		validMap.put("error", "error");
		    		validMap.put("errorMessage", rtnMap.get("errorMessage"));
					mv.addObject("Message", validMap);
		    	}
		    } else {
		    	/**
		    	 * 은행입금 or 결재금액 0 원
		    	 */
            	validMap.put("success", CheckoutLanguage.Success.SUCCESS);
				mv.addObject("Message", validMap);
				historyMap.put("comment", "은행입금 안내<br>우리은행 예금주: 이경원 1002-049-773901<br>구매 당일 은행의 [송금 보내실 때 환율] 로 입금하세요.<br>결제여부 확인 후 발송될 예정입니다.");
            }
            // 주문 History 생성을 위해 세션에 저장한다. -> confirm에서 처리
    		BaseController.setCustomSession(session, historyMap, Session.ORDER_HISTORY_DATA);
		} else {
			validMap.put("error", "error");
			validMap.put("errorMessage", CheckoutLanguage.Error.errorMessage);
			mv.addObject("Message", validMap);
		}
    	return mv;
	}
	
	/**
	 * Form 값을 확인한다.
	 * @param validMap
	 * @param commandMap
	 * @throws Exception
	 */
	public void validForm(Map<String, Object> validMap, CommandMap commandMap) throws Exception{
		// 카드 소유주
		String cc_owner = ObjectUtils.null2void(commandMap.get("cc_owner"));
		if(ObjectUtils.isEmpty(cc_owner) || cc_owner.length()<1) {
			BaseController.setCustomMessage(validMap, "error_cc_owner", CheckoutLanguage.Error.cc_owner);
		}
		
		// 카드 번호
		String cc_number = ObjectUtils.null2void(commandMap.get("cc_number"));
		if(ObjectUtils.isEmpty(cc_number) || cc_number.length()<1) {
			BaseController.setCustomMessage(validMap, "error_cc_number", CheckoutLanguage.Error.cc_number);
		}
		
		// 카드유효기간 월
		String cc_expire_date_month = ObjectUtils.null2void(commandMap.get("cc_expire_date_month"));
		if(ObjectUtils.isEmpty(cc_expire_date_month) || cc_expire_date_month.length()<1) {
			BaseController.setCustomMessage(validMap, "error_cc_expire_date_month", CheckoutLanguage.Error.cc_expire_date_month);
		}
		
		// 카드유효기간 년도
		String cc_expire_date_year = ObjectUtils.null2void(commandMap.get("cc_expire_date_year"));
		if(ObjectUtils.isEmpty(cc_expire_date_year) || cc_expire_date_year.length()<1) {
			BaseController.setCustomMessage(validMap, "error_cc_expire_date_year", CheckoutLanguage.Error.cc_expire_date_year);
		}
		
		// 카드 보안코드 (CVV2)
		String cc_cvv2 = ObjectUtils.null2void(commandMap.get("cc_cvv2"));
		if(ObjectUtils.isEmpty(cc_cvv2) || cc_cvv2.length()<1) {
			BaseController.setCustomMessage(validMap, "error_cc_cvv2", CheckoutLanguage.Error.cc_cvv2);
		}
	}
	
	/**
	 * 결제 완료 후 처리 (중요)
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value="/checkout/confirm.dr")
    public ModelAndView confrim(HttpSession session, CommandMap commandMap) throws Exception{
		ModelAndView mv = new ModelAndView("/checkout/confirm");
		
		// 공통코드
		CodeController code = new CodeController();
		
		// 세션 고객 정보
    	CustomerDTO customer = BaseController.getUserInfo(session);
    	String customer_id = customer.getId();
    	
    	// 주문번호
		String order_id = ObjectUtils.null2void(BaseController.getCustomSession(session, Session.ORDER_ID));
		
		/**
		 * 1. Order Total 테이블 생성
		 */
		commandMap.put("customer_id", customer_id);
		commandMap.put("order_id", order_id);
	    checkoutService.addOrderTotal(commandMap.getMap());
	    
		/**
		 * 2. 주문 History 생성
		 */
		Map<String,Object> historyMap = (Map<String, Object>) BaseController.getCustomSession(session, Session.ORDER_HISTORY_DATA);
		checkoutService.addOrderHistory(historyMap);
		
		/**
		 * 3. 주문 제품 테이블 생성
		 */
		Map<String,Object> map = new HashMap<String,Object>();
		map.put("customer_id", customer_id);
		map.put("order_id", order_id);
		String rate = "0";
		if(BaseController.isExsit(session, Session.CHECKOUT_TAX_RATE)) {
			rate = ObjectUtils.null2Value(BaseController.getCustomSession(session, Session.CHECKOUT_TAX_RATE),"0");
		}
		map.put("rate", rate);
		map.put("config_default_reward", code.getValue("config_default_reward"));
		// 총합계
    	if(null!=customer && null!=customer.getCustomerGroupId() && !customer.getCustomerGroupId().equals("")) {
    		commandMap.put("customer_group_id", customer.getCustomerGroupId());
    	} else {
    		commandMap.put("customer_group_id", "0");
    	}
		checkoutService.addOrderProduct(map);
	
		/**
		 * 4. 제품 수량 마이너스
		 */
		List<Map<String,Object>> orderProductList = accountService.orderProductList(commandMap.getMap());
		Map<String,Object> orderProductMap = null;
		int size = orderProductList.size();
		for(int i=0;i<size;i++) {
			orderProductMap = orderProductList.get(i);
			/**
			 * 제품 수량 마이너스
			 * 제품 수량 조회해서 0이면 재고 상태코드를 5(재고 없음)으로 업데이트
			 * 제품 수량이 0보다 작으면 재고 상태코드를 5(재고 없음)으로 업데이트하고 제품 수량을 0으로 셋팅
			 */
			checkoutService.updateProductQuantity(orderProductMap);
		}
	
		/**
		 * 5. 고객 적립금 사용 이력 추가
		 */
		map.put("description", "Order ID: #"+order_id);
		checkoutService.addCustomerReward(map);
		
		/**
		 * 6. 장바구니 클리어
		 */
		checkoutService.deleteCart(customer_id);
		
		/**
		 * 7. 장바구니 주문 합계 테이블 클리어
		 */
		checkoutService.deleteCartOrderTotal(customer_id);
	
		/**
		 * 8. 화면에 보여줄 정보
		 */
    	Map<String,Object> orderViewMap = accountService.orderInfo(commandMap.getMap());
    	
    	Map<String,Object> info = (Map<String,Object>) orderViewMap.get("info");
    	OrderUtils outil = new OrderUtils();
    	info.put("order_status_name", outil.orderStatusName(info.get("order_status_id").toString()));
    	info.put("payment_address", outil.orderHistoryAddress("payment_", info));
    	info.put("shipping_address", outil.orderHistoryAddress("shipping_", info));
    	
    	mv.addObject("info", info);
    	mv.addObject("products", orderViewMap.get("products"));
    	mv.addObject("totals", orderViewMap.get("totals"));
//    	mv.addObject("histories", orderViewMap.get("histories"));
		
    	ScriptUtils.accountScript(mv);
	
    	/**
		 * 9. 고객에게 주문완료 이메일 보내기
		 */
    	Map<String,Object> emailMap = new HashMap<String,Object>();
    	emailMap.put("info", info);
    	emailMap.put("products", orderViewMap.get("products"));
    	emailMap.put("totals", orderViewMap.get("totals"));
    	emailMap.put("histories", orderViewMap.get("histories"));
    	String html = OrderEmail.getHtml(emailMap);
//    	System.err.println(html);
    	
		commandMap.put("subject", code.getValue("config_comapny_name")+" 주문번호: "+order_id);
		commandMap.put("html", html);
		commandMap.put("recipient_name", customer.getCustomerName());
		commandMap.put("recipient_email", customer.getEmail());
		MailChimpEmail.run(commandMap.getMap());
		
		/**
		 * 10. 네이버로 주문완료 이메일 보내기
		 */
    	commandMap.put("subject", code.getValue("config_comapny_name")+" - 주문번호: "+order_id);
		commandMap.put("html", html);
		commandMap.put("recipient_name", code.getValue("config_comapny_name"));
		commandMap.put("recipient_email", code.getValue("config_company_email"));
		MailChimpEmail.run(commandMap.getMap());
		
		
		/**
		 * 11. 세션 클리어
		 */
		BaseController.removeCustomSession(session, Session.IS_CART_ERROR);
    	BaseController.removeCustomSession(session, Session.CART_OVER_LIMIT);
    	BaseController.removeCustomSession(session, Session.CART_OUT_OF_STOCK);
    	BaseController.removeCustomSession(session, Session.CHECKOUT_SHIPPING_ADDRESS);
    	BaseController.removeCustomSession(session, Session.CHECKOUT_SHIPPING_METHOD);
    	BaseController.removeCustomSession(session, Session.CHECKOUT_IS_TAX);
    	BaseController.removeCustomSession(session, Session.CHECKOUT_TAX_RATE);
		BaseController.removeCustomSession(session, Session.ORDER_ID);
		BaseController.removeCustomSession(session, Session.ORDER_HISTORY_DATA);
		BaseController.setCustomSession(session, null, Session.CART);
		
    	return mv;
	}
}
