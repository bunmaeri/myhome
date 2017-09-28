package myhome.checkout.controller;

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

import myhome.account.service.AccountService;
import myhome.account.service.LoginService;
import myhome.common.common.CommandMap;
import myhome.common.constant.Message;
import myhome.common.constant.Session;
import myhome.common.controller.BaseController;
import myhome.common.dto.CustomerDTO;
import myhome.common.util.CommonUtils;
import myhome.common.util.ObjectUtils;
import myhome.common.util.OrderUtils;
import myhome.common.util.ScriptUtils;
import myhome.language.CheckoutLanguage;

@Controller
public class ShippingAddressController extends BaseController {
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="accountService")
	private AccountService accountService;
	
	@Resource(name="loginService")
	private LoginService loginService;
	
	/**
	 * 배송 주소록 조회
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value="/checkout/shipping/address.dr")
    public ModelAndView address(HttpSession session, CommandMap commandMap) throws Exception{
		if(BaseController.getBooleanCustomSession(session, Session.IS_CART_ERROR)) {
			return new ModelAndView("redirect:/cart.dr");
		}
    	ModelAndView mv = new ModelAndView("/checkout/shipping_address");
    	OrderUtils outil = new OrderUtils();
    	
    	commandMap.put("customer_id", BaseController.getId(session));
    	
		Map<String,Object> map = (Map<String,Object>) accountService.accountInfo(commandMap.getMap()).get("map");
    	
    	List<Map<String,Object>> rtnList = new ArrayList<Map<String,Object>>();
    	List<Map<String,Object>> list = accountService.address(commandMap.getMap());
    	int size = list.size();
    	Map<String,Object> tmp = null;
    	boolean isSkip = true;
    	for(int i=0;i<size;i++) {
    		isSkip = true;
    		 tmp = (HashMap<String,Object>) list.get(i);
    		 if(map.get("shipping_address_id").equals(tmp.get("address_id"))) {
				 tmp.put("address", outil.addressView(tmp));
    			 mv.addObject("shipping", tmp);
    			 isSkip = false;
    		 }
			 
			 if(isSkip) {
    			 tmp.put("address", outil.addressView(tmp));
    			 rtnList.add(tmp);
    		 }
    	}
    	
    	mv.addObject("list", rtnList);
    	
    	Object CHECKOUT_SHIPPING_ADDRESS_ERROR = BaseController.getCustomSession(session, Session.CHECKOUT_SHIPPING_ADDRESS_ERROR);
    	if(null!=CHECKOUT_SHIPPING_ADDRESS_ERROR && !CHECKOUT_SHIPPING_ADDRESS_ERROR.equals("")) {
    		mv.addObject("errorMsg", CHECKOUT_SHIPPING_ADDRESS_ERROR);
    		BaseController.setCustomSession(session, null, Session.CHECKOUT_SHIPPING_ADDRESS_ERROR);
    	}
    	
    	ScriptUtils.accountScript(mv);
    	
    	return mv;
    }
	
	/**
	 * 새 주소 입력 화면 오픈
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/checkout/shipping/address/new/{country_id}.dr")
    public ModelAndView newAddress(HttpSession session, @PathVariable String country_id, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/checkout/shipping_address_"+country_id);

    	mv.addObject("page_title", "주소 추가");
    	mv.addObject("country_id", country_id);
    	mv.addObject("is_daum_post", "0");
    	if(country_id.equals("113")) {
    		mv.addObject("zone_id", "0");
    	} else {
    		List<Map<String,Object>> list = accountService.zone(country_id);
    		mv.addObject("list", list);
    	}
    	
    	ScriptUtils.accountScript(mv);
    	
    	return mv;
    }
	
	/**
	 * 주소 변경 화면 오픈
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/checkout/shipping/address/edit/{address_id}/{country_id}.dr")
    public ModelAndView editAddress(HttpSession session, @PathVariable String address_id, @PathVariable String country_id, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/checkout/shipping_address_"+country_id);

    	mv.addObject("page_title", "주소 변경");
    	mv.addObject("country_id", country_id);
    	mv.addObject("is_daum_post", "1");
    	if(country_id.equals("113")) {
    		mv.addObject("zone_id", "0");
    	} else {
    		List<Map<String,Object>> list = accountService.zone(country_id);
    		mv.addObject("list", list);
    	}
    	
    	Map<String,Object> map = accountService.addressInfo(address_id);
    	mv.addObject("map", map.get("map"));
    	
    	ScriptUtils.accountScript(mv);
    	
    	return mv;
    }
	
	/**
	 * 주소 추가 / 변경 저장
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/checkout/shipping/address/add.dr")
    public ModelAndView addAddress(HttpSession session, CommandMap commandMap) throws Exception{
		ModelAndView mv = new ModelAndView("jsonView");
    	
		Map<String, Object> validMap = new HashMap<String,Object>();
		this.validForm(validMap, commandMap);
		
		if(ObjectUtils.isEmpty(validMap)) {
			String country_id = ObjectUtils.null2void(commandMap.get("country_id"));
			// 한국 주소
			if(country_id.equals("113")) {
				String customer_name = ObjectUtils.null2void(commandMap.get("customer_name"));
				String firstname = "";
				String lastname = "";
				String[] names = customer_name.split(" ");
				if(names.length==1) {
					firstname = customer_name;
				}
				if(names.length==2) {
					firstname = names[0];
					lastname = names[1];
				}
				if(names.length>2) {
					lastname = names[names.length-1];
					firstname = customer_name.replace(" "+lastname, "");
				}
				commandMap.put("firstname", firstname);
				commandMap.put("lastname", lastname);
			} else {
				commandMap.put("customer_name", commandMap.get("firstname")+" "+commandMap.get("lastname"));
			}
			String customer_id = BaseController.getId(session);
			commandMap.put("customer_id", customer_id);

			String address_id = ObjectUtils.null2void(commandMap.get("address_id"));
			// 주소 추가
			if(address_id.equals("")) {
				accountService.addAddress(commandMap.getMap());
			} else {
				accountService.editAddress(commandMap.getMap());
			}
			
			// 처음 입력되는 주소일 때..
			boolean isFirst = false;
			CustomerDTO customer = (CustomerDTO) loginService.customer(customer_id);
			if(null==customer.getAddressId() || customer.getAddressId().equals("") || customer.getAddressId().equals("0")) {
				commandMap.put("customer_id", customer_id);
		    	commandMap.put("address_type", "payment");
		    	if(country_id.equals("113")) {
		    		commandMap.put("type_label", "1");
		    	} else
		    	if(country_id.equals("223")) {
		    		commandMap.put("type_label", "2");
		    	}
//		    	commandMap.put("address_id", address_id);
		    	accountService.defaultAddress(commandMap.getMap());
		    	isFirst = true;
		    }
			if(null==customer.getShippingAddressId() || customer.getShippingAddressId().equals("") || customer.getShippingAddressId().equals("0")) {
				commandMap.put("customer_id", customer_id);
		    	commandMap.put("address_type", "shipping");
//		    	commandMap.put("address_id", address_id);
		    	accountService.defaultAddress(commandMap.getMap());
		    	isFirst = true;
			}
			
			// 처음 입력되는 주소가 아닐 때에만.. 이미 위에서 셋팅이 끝났음.
			if(!isFirst) {
				String default_shipping = ObjectUtils.null2void(commandMap.get("default_shipping"));
				if(default_shipping.equals("1")) {
					commandMap.put("customer_id", customer_id);
			    	commandMap.put("address_type", "shipping");
	//		    	commandMap.put("address_id", address_id);
			    	accountService.defaultAddress(commandMap.getMap());
				}
			}
			validMap.put("success", Message.Success.NEW_ADDRESS);
			mv.addObject("Message", validMap);
			if(address_id.equals("")) {
				BaseController.setCustomSession(session, Message.Success.NEW_ADDRESS, Session.NEW_ADDRESS_SUCCESS);
			} else {
				BaseController.setCustomSession(session, Message.Success.EDIT_ADDRESS, Session.NEW_ADDRESS_SUCCESS);
			}
			BaseController.setCustomSession(session, loginService.customer(customer_id), Session.CUSTOMER);
		} else {
			validMap.put("error", "error");
			mv.addObject("Message", validMap);
//			log.error("!-->"+validMap.get("error_email"));
		}
//		log.error("!-->"+validMap.get("error_email"));

    	mv.addObject("page_title", "주소 추가");
    	
    	ScriptUtils.accountScript(mv);
    	
    	return mv;
    }
	
	/**
	 * 주소 삭제
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/checkout/shipping/address/delete/{address_id}.dr")
    public ModelAndView deleteAddress(HttpSession session, @PathVariable String address_id, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("redirect:/checkout/shipping/address.dr");

    	accountService.deleteAddress(address_id);
    	
    	String customer_id = BaseController.getId(session);
    	CustomerDTO customer = (CustomerDTO) loginService.customer(customer_id);
    	Map<String,Object> map = new HashMap<String,Object>();
    	map.put("type_label", "0");
		map.put("customer_id", customer_id);
    	if(customer.getAddressId().equals(address_id)) {
    		map.put("address_id", "0");
    		map.put("address_type", "payment");
    		accountService.defaultAddress(map);
    	} else {
    		map.put("address_id", "0");
    		map.put("address_type", "shipping");
    		accountService.defaultAddress(map);
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
		boolean flag = true;
		
		String country_id = commandMap.get("country_id").toString();
		
		// 한국 주소일 때
		if(country_id.equals("113")) {
			// 이름
			String customer_name = ObjectUtils.null2void(commandMap.get("customer_name"));
			if(ObjectUtils.isEmpty(customer_name) || (customer_name.length()<6 && customer_name.length()>32)) {
				BaseController.setCustomMessage(validMap, "error_customer_name", Message.Error.CUSTOMER_NAME);
			}
			
			// 회사
			String company = ObjectUtils.null2void(commandMap.get("company"));
			if(company.length()>40) {
				BaseController.setCustomMessage(validMap, "error_company", Message.Error.COMPANY);
			}
			
			// 전화번호
			String telephone = ObjectUtils.null2void(commandMap.get("telephone"));
			flag = CommonUtils.validTelephone(telephone, ObjectUtils.null2void(commandMap.get("country_id")));
			if(!flag) {
				BaseController.setCustomMessage(validMap, "error_telephone", Message.Error.TELEPHONE);
			}
			
			// 개인통관고유번호
			String requisition_id = ObjectUtils.null2void(commandMap.get("requisition_id"));
			flag = CommonUtils.validRequisitionId(requisition_id);
			if(!flag) {
				BaseController.setCustomMessage(validMap, "error_requisition_id", Message.Error.REQUISITION_ID);
			}
			
			// 우편주소 찾기 팝업 사용 여부
			String is_daum_post = ObjectUtils.null2void(commandMap.get("is_daum_post"));
			if(is_daum_post.equals("0")) {
				BaseController.setCustomMessage(validMap, "error_is_daum_post", Message.Error.IS_DAUM_POST);
			} else {
				// 우편번호
				String postcode = ObjectUtils.null2void(commandMap.get("postcode"));
				flag = CommonUtils.validPostcode(postcode);
				if(!flag) {
					BaseController.setCustomMessage(validMap, "error_postcode", Message.Error.POSTCODE);
				}
			}
			
			// 주소
			String address_1 = ObjectUtils.null2void(commandMap.get("address_1"));
			if(address_1.trim().equals("")) {
				BaseController.setCustomMessage(validMap, "error_address_1", Message.Error.ADDRESS_1);
			}
		} else {
			// First Name
			String firstname = ObjectUtils.null2void(commandMap.get("firstname"));
			if(ObjectUtils.isEmpty(firstname) || (firstname.length()<6 && firstname.length()>32)) {
				BaseController.setCustomMessage(validMap, "error_firstname", Message.Error.FIRSTNAME_223);
			}
			
			// Last Name
			String lastname = ObjectUtils.null2void(commandMap.get("lastname"));
			if(ObjectUtils.isEmpty(lastname) || (lastname.length()<6 && lastname.length()>32)) {
				BaseController.setCustomMessage(validMap, "error_lastname", Message.Error.LASTNAME_223);
			}
			
			// 전화번호
			String telephone = ObjectUtils.null2void(commandMap.get("telephone"));
			flag = CommonUtils.validTelephone(telephone, ObjectUtils.null2void(commandMap.get("country_id")));
			if(!flag) {
				BaseController.setCustomMessage(validMap, "error_telephone", Message.Error.TELEPHONE_223);
			}
			
			// 주소
			String address_1 = ObjectUtils.null2void(commandMap.get("address_1"));
			if(address_1.trim().equals("")) {
				BaseController.setCustomMessage(validMap, "error_address_1", Message.Error.ADDRESS_1_223);
			}
			
			// City
			String city = ObjectUtils.null2void(commandMap.get("city")).trim();
			if(city.length()<1 || city.length()>128) {
				BaseController.setCustomMessage(validMap, "error_city", Message.Error.CITY_223);
			}
			
			// State
			String zone_id = ObjectUtils.null2void(commandMap.get("zone_id")).trim();
			if(zone_id.length()<1) {
				BaseController.setCustomMessage(validMap, "error_zone_id", Message.Error.ZONE_ID_223);
			}
			
			// 우편번호
			String postcode = ObjectUtils.null2void(commandMap.get("postcode"));
			flag = CommonUtils.validPostcode(postcode);
			if(!flag) {
				BaseController.setCustomMessage(validMap, "error_postcode", Message.Error.POSTCODE_223);
			}
		}
		
	}
	
	/**
	 * Shipping Address 선택 후에 Checkout 페이지로 이동한다.
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value="/checkout/shipping/address/{address_id}.dr")
    public ModelAndView goCheckout(HttpSession session, @PathVariable String address_id, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("redirect:/checkout/checkout.dr");
    	ModelAndView emv = new ModelAndView("redirect:/checkout/shipping/address.dr");

    	// 배송 주소 정보 체크
    	Map<String,Object> map = (Map<String,Object>) accountService.addressInfo(address_id).get("map");
    	if(null==map.get("customer_name") || ObjectUtils.null2void(map.get("customer_name")).equals("")) {
    		BaseController.setCustomSession(session, CheckoutLanguage.Error.SHIPPING_ADDRESS_CUSTOMER_NAME_ERROR, Session.CHECKOUT_SHIPPING_ADDRESS_ERROR);
    		return emv;
    	}
    	if(null==map.get("address_1") || ObjectUtils.null2void(map.get("address_1")).equals("")) {
    		BaseController.setCustomSession(session, CheckoutLanguage.Error.SHIPPING_ADDRESS_ADDRESS_ERROR, Session.CHECKOUT_SHIPPING_ADDRESS_ERROR);
    		return emv;
    	}
    	if(null==map.get("telephone") || ObjectUtils.null2void(map.get("telephone")).equals("")) {
    		BaseController.setCustomSession(session, CheckoutLanguage.Error.SHIPPING_ADDRESS_TELEPHONE_ERROR, Session.CHECKOUT_SHIPPING_ADDRESS_ERROR);
    		return emv;
    	}
    	
    	if(ObjectUtils.null2void(map.get("country_id")).equals("113")) {
    		System.err.println(map.get("country_id"));
        	System.err.println(ObjectUtils.null2void(map.get("requisition_id")).length());
    		if(null==map.get("requisition_id") || ObjectUtils.null2void(map.get("requisition_id")).length()==0) {
	    		BaseController.setCustomSession(session, CheckoutLanguage.Error.SHIPPING_ADDRESS_REQUISITION_ERROR, Session.CHECKOUT_SHIPPING_ADDRESS_ERROR);
	    		return emv;
    		}
    	}
    	
    	BaseController.setCustomSession(session, address_id, Session.CHECKOUT_SHIPPING_ADDRESS);
    	
    	return mv;
    }
}
