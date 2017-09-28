package myhome.account.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import myhome.account.service.AccountService;
import myhome.account.service.LoginService;
import myhome.common.common.CommandMap;
import myhome.common.constant.Session;
import myhome.common.controller.BaseController;
import myhome.common.controller.CodeController;
import myhome.common.dto.CustomerDTO;
import myhome.common.email.ForgotPasswordEmail;
import myhome.common.email.MailChimpEmail;
import myhome.common.email.RegisterEmail;
import myhome.common.util.CommonUtils;
import myhome.common.util.ObjectUtils;
import myhome.common.util.ScriptUtils;
import myhome.common.util.StoreUtil;
import myhome.common.util.WebUtils;
import myhome.language.RegisterLanguage;

@Controller
public class RegisterController extends BaseController {
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="accountService")
	private AccountService accountService;
	
	@Resource(name="loginService")
	private LoginService loginService;
	
	private String country_id = StoreUtil.getCountryId();
	private int language_id = StoreUtil.getLanguageId();
	
	/**
	 * 회원가입 오픈
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/register.dr")
    public ModelAndView registerOpen(HttpSession session, CommandMap commandMap) throws Exception{
		ModelAndView mv = new ModelAndView("/account/register");

		mv.addObject("customer_join_path", accountService.listCustomerJoinPath());
    	
    	ScriptUtils.accountScript(mv);
    	
    	return mv;
    }
	
	/**
	 * 회원가입 저장
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value="/register/save.dr")
    public ModelAndView registerSave(HttpSession session, HttpServletRequest request, CommandMap commandMap) throws Exception{
		ModelAndView mv = new ModelAndView("jsonView");
    	
		// 공통코드
		CodeController code = new CodeController();
				
		Map<String, Object> validMap = new HashMap<String,Object>();
		this.validForm(validMap, commandMap);
		
		if(ObjectUtils.isEmpty(validMap)) {
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
			String email = ObjectUtils.null2void(commandMap.get("email"));
			String telephone = ObjectUtils.null2void(commandMap.get("telephone"));
			String password = CommonUtils.shaEncoder(ObjectUtils.null2void(commandMap.get("password")));
//			String requisition_id = ObjectUtils.null2void(commandMap.get("requisition_id"));
			String join_path_id = ObjectUtils.null2void(commandMap.get("join_path_id"));
			String join_path_etc = ObjectUtils.null2void(commandMap.get("join_path_etc"));
			
			Map<String,Object> customerMap = new HashMap<String,Object>();
			String customer_group_id = code.getValue("config_default_customer_group_id");
			
			customerMap.put("email", email); 
			Map<String,Object> map = loginService.checkCustomerGroupReward(customerMap);
			Map<String,Object> groupMap = (Map<String,Object>) map.get("map");
			if(null!=groupMap && null!=groupMap.get("customer_group_id")) {
				customer_group_id = ObjectUtils.null2Value(groupMap.get("customer_group_id"),"1");
			}
			customerMap.put("customer_group_id", customer_group_id); 
			customerMap.put("store_id", "0"); 
			customerMap.put("language_id", language_id); 
			customerMap.put("customer_name", customer_name); 
			customerMap.put("firstname", firstname); 
			customerMap.put("lastname", lastname); 
			
			customerMap.put("telephone", telephone);  
			customerMap.put("password", password); 
			customerMap.put("ip", WebUtils.getClientIp(request)); 
			customerMap.put("status", "1");  
			customerMap.put("approved", "1"); 
			customerMap.put("safe", "0"); 
//			customerMap.put("requisition_id", requisition_id); 
			customerMap.put("join_path_id", join_path_id); 
			customerMap.put("join_path_etc", join_path_etc); 
			customerMap.put("myhomedoc", "0"); 
			/**
			 * 고객 등록
			 */
			loginService.addCustomer(customerMap);
			
			/**
			 * 회원가입 템플릿으로 고객에게 이메일 보내기
			 */
			Map<String,Object> emailMap = new HashMap<String,Object>();
	    	String html = RegisterEmail.getHtml(emailMap);
	    	
			commandMap.put("subject", code.getValue("config_comapny_name")+" - 회원 가입을 환영합니다.");
			commandMap.put("html", html);
			commandMap.put("recipient_name", email);
			commandMap.put("recipient_email", email);
			MailChimpEmail.run(commandMap.getMap());
			
			/**
			 * 네이버로 회원가입 이메일 보내기
			 */
			// 고객그룹명을 조회한다.
			Map<String,Object> nameMap = (Map<String,Object>)(loginService.customerGroupName(customerMap)).get("map");
			StringBuffer html2 = new StringBuffer();
			html2.append("\n웹사이트: ").append(code.getValue("config_comapny_name"));
			html2.append("\n이름: ").append(customer_name);
			html2.append("\n고객그룹: ").append(nameMap.get("name"));
			html2.append("\n이메일: ").append(email);
			html2.append("\n전화: ").append(telephone);
//			html2.append("\n개인통관고유번호: ").append(requisition_id);
			
			// 가입경로명을 조회한다.
			Map<String,Object> joinMap = (Map<String,Object>)(loginService.joinPathName(customerMap)).get("map");
			html2.append("\n가입경로: "+joinMap.get("join_path_name"));
			if(joinMap.get("is_input").equals("1") && !join_path_etc.equals("")) {
				html2.append(" ("+join_path_etc+")");
			}
		
	    	commandMap.put("subject", "신규회원 - "+customer_name+"("+nameMap.get("name")+")");
			commandMap.put("html", html2);
			commandMap.put("recipient_name", code.getValue("config_comapny_name"));
			commandMap.put("recipient_email", code.getValue("config_company_email"));
			MailChimpEmail.run(commandMap.getMap());
			
			validMap.put("success", RegisterLanguage.Success.SUCCESS);
			mv.addObject("Message", validMap);
			BaseController.setCustomSession(session, RegisterLanguage.Success.SUCCESS, Session.REGISTER_SUCCESS);
		} else {
			validMap.put("error", RegisterLanguage.Error.ERROR);
			mv.addObject("Message", validMap);
		}

    	ScriptUtils.accountScript(mv);
    	
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
		
		// 이름
		String customer_name = ObjectUtils.null2void(commandMap.get("customer_name"));
		if(ObjectUtils.isEmpty(customer_name) || (customer_name.length()<6 && customer_name.length()>32)) {
			BaseController.setCustomMessage(validMap, "error_customer_name", RegisterLanguage.Error.CUSTOMER_NAME);
		}
		
		String email = commandMap.get("email").toString();
		flag = CommonUtils.validEmail(email);
		if(!flag) {
			int cnt = accountService.duplicateEmail(email);
			if(cnt>0) {
				BaseController.setCustomMessage(validMap, "error_email", RegisterLanguage.Error.EMAIL_DUPLICATION);
			}
		} else {
			BaseController.setCustomMessage(validMap, "error_email", RegisterLanguage.Error.EMAIL);
		}
		
		// 전화번호
		String telephone = ObjectUtils.null2void(commandMap.get("telephone"));
		flag = CommonUtils.validTelephone(telephone, ObjectUtils.null2void(commandMap.get("country_id")));
		if(!flag) {
			BaseController.setCustomMessage(validMap, "error_telephone", RegisterLanguage.Error.TELEPHONE);
		}
		
		// 비밀번호
		String password = commandMap.get("password").toString();
		if(null!=password && !password.equals("")) {
			flag = CommonUtils.validPasword(password);
			if(!flag) {
				BaseController.setCustomMessage(validMap, "error_password", RegisterLanguage.Error.PASSWORD);
			}
			
			String confirmation = commandMap.get("confirmation").toString();
			if(!password.equals(confirmation)) {
				BaseController.setCustomMessage(validMap, "error_confirmation", RegisterLanguage.Error.CONFIRMATION);
			}
		}
		
		// 가입경로
		String join_path_id = ObjectUtils.null2void(commandMap.get("join_path_id"));
		if(join_path_id.trim().equals("")) {
			BaseController.setCustomMessage(validMap, "error_join_path_id", RegisterLanguage.Error.JOIN_PATH_ID);
		} else {
			if(join_path_id.equals("90")) {
				String join_path_etc = ObjectUtils.null2void(commandMap.get("join_path_etc"));
				if(join_path_etc.trim().equals("")) {
					BaseController.setCustomMessage(validMap, "error_join_path_id", RegisterLanguage.Error.JOIN_PATH_ETC);
				}
			}
		}
		
	}
	
	/**
	 * 회원가입 오픈 (주소까지 입력할 때..)
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/register/country.dr")
    public ModelAndView registerCountryOpen(HttpSession session, CommandMap commandMap) throws Exception{
		if(null!=commandMap.get("country_id") && !commandMap.get("country_id").equals("")) {
			country_id = ObjectUtils.null2Value(commandMap.get("country_id"), country_id);
		}
		ModelAndView mv = new ModelAndView("/account/register_"+country_id);

    	mv.addObject("country_id", country_id);
    	mv.addObject("is_daum_post", "0");
    	if(country_id.equals("113")) {
    		mv.addObject("zone_id", "0");
    	} else {
    		List<Map<String,Object>> list = accountService.zone(country_id);
    		mv.addObject("list", list);
    	}
    	
    	mv.addObject("customer_join_path", accountService.listCustomerJoinPath());
    	
    	ScriptUtils.accountScript(mv);
    	
    	return mv;
    }
	
	/**
	 * 회원가입 저장 (주소까지 입력할 때..)
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/register/country/save.dr")
    public ModelAndView registerCountrySave(HttpSession session, CommandMap commandMap) throws Exception{
		ModelAndView mv = new ModelAndView("jsonView");
    	
		Map<String, Object> validMap = new HashMap<String,Object>();
		this.validForm2(validMap, commandMap);
		
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
			
			/**
			 * 고객 등록
			 */

			// 주소 추가
			accountService.addAddress(commandMap.getMap());
			
			// 처음 입력되는 주소일 때..
			boolean isFirst = false;
			CustomerDTO customer = (CustomerDTO) BaseController.getUserInfo(session);
			if(null==customer.getAddressId() || customer.getAddressId().equals("")) {
				commandMap.put("customer_id", customer_id);
		    	commandMap.put("address_type", "payment");
//		    	commandMap.put("address_id", address_id);
		    	accountService.defaultAddress(commandMap.getMap());
		    }
			if(null==customer.getShippingAddressId() || customer.getShippingAddressId().equals("")) {
				commandMap.put("customer_id", customer_id);
		    	commandMap.put("address_type", "shipping");
//		    	commandMap.put("address_id", address_id);
		    	accountService.defaultAddress(commandMap.getMap());
		    	isFirst = true;
			}
			
			validMap.put("success", RegisterLanguage.Success.SUCCESS);
			mv.addObject("Message", validMap);
			BaseController.setCustomSession(session, RegisterLanguage.Success.SUCCESS, Session.REGISTER_SUCCESS);
		} else {
			validMap.put("error", "error");
			mv.addObject("Message", validMap);
//			log.error("!-->"+validMap.get("error_email"));
		}
//		log.error("!-->"+validMap.get("error_email"));

    	ScriptUtils.accountScript(mv);
    	
    	return mv;
    }
	
	/**
	 * Form 값을 확인한다.
	 * @param validMap
	 * @param commandMap
	 * @throws Exception
	 */
	public void validForm2(Map<String, Object> validMap, CommandMap commandMap) throws Exception{
		boolean flag = true;
		
		String country_id = commandMap.get("country_id").toString();
		
		// 한국 주소일 때
		if(country_id.equals("113")) {
			// 이름
			String customer_name = ObjectUtils.null2void(commandMap.get("customer_name"));
			if(ObjectUtils.isEmpty(customer_name) || (customer_name.length()<6 && customer_name.length()>32)) {
				BaseController.setCustomMessage(validMap, "error_customer_name", RegisterLanguage.Error.CUSTOMER_NAME);
			}
			
			String email = commandMap.get("email").toString();
			flag = CommonUtils.validEmail(email);
			if(!flag) {
				int cnt = accountService.duplicateEmail(email);
				if(cnt>0) {
					BaseController.setCustomMessage(validMap, "error_email", RegisterLanguage.Error.EMAIL_DUPLICATION);
				}
			} else {
				BaseController.setCustomMessage(validMap, "error_email", RegisterLanguage.Error.EMAIL);
			}
			
			// 회사
			String company = ObjectUtils.null2void(commandMap.get("company"));
			if(company.length()>40) {
				BaseController.setCustomMessage(validMap, "error_company", RegisterLanguage.Error.COMPANY);
			}
			
			// 전화번호
			String telephone = ObjectUtils.null2void(commandMap.get("telephone"));
			flag = CommonUtils.validTelephone(telephone, ObjectUtils.null2void(commandMap.get("country_id")));
			if(!flag) {
				BaseController.setCustomMessage(validMap, "error_telephone", RegisterLanguage.Error.TELEPHONE);
			}
			
			// 개인통관고유번호
			String requisition_id = ObjectUtils.null2void(commandMap.get("requisition_id"));
			flag = CommonUtils.validRequisitionId(requisition_id);
			if(!flag) {
				BaseController.setCustomMessage(validMap, "error_requisition_id", RegisterLanguage.Error.REQUISITION_ID);
			}
			
			// 우편주소 찾기 팝업 사용 여부
			String is_daum_post = ObjectUtils.null2void(commandMap.get("is_daum_post"));
			if(is_daum_post.equals("0")) {
				BaseController.setCustomMessage(validMap, "error_is_daum_post", RegisterLanguage.Error.IS_DAUM_POST);
			} else {
				// 우편번호
				String postcode = ObjectUtils.null2void(commandMap.get("postcode"));
				flag = CommonUtils.validPostcode(postcode);
				if(!flag) {
					BaseController.setCustomMessage(validMap, "error_postcode", RegisterLanguage.Error.POSTCODE);
				}
			}
			
			// 주소
			String address_1 = ObjectUtils.null2void(commandMap.get("address_1"));
			if(address_1.trim().equals("")) {
				BaseController.setCustomMessage(validMap, "error_address_1", RegisterLanguage.Error.ADDRESS_1);
			}
			
			// 비밀번호
			String password = commandMap.get("password").toString();
			if(null!=password && !password.equals("")) {
				flag = CommonUtils.validPasword(password);
				if(!flag) {
					BaseController.setCustomMessage(validMap, "error_password", RegisterLanguage.Error.PASSWORD);
				}
				
				String confirmation = commandMap.get("confirmation").toString();
				if(!password.equals(confirmation)) {
					BaseController.setCustomMessage(validMap, "error_confirmation", RegisterLanguage.Error.CONFIRMATION);
				}
			}
			
			// 가입경로
			String join_path_id = ObjectUtils.null2void(commandMap.get("join_path_id"));
			if(join_path_id.trim().equals("")) {
				BaseController.setCustomMessage(validMap, "error_join_path_id", RegisterLanguage.Error.JOIN_PATH_ID);
			} else {
				if(join_path_id.equals("90")) {
					String join_path_etc = ObjectUtils.null2void(commandMap.get("join_path_etc"));
					if(join_path_etc.trim().equals("")) {
						BaseController.setCustomMessage(validMap, "error_join_path_id", RegisterLanguage.Error.JOIN_PATH_ETC);
					}
				}
			}
		} else {
			// First Name
			String firstname = ObjectUtils.null2void(commandMap.get("firstname"));
			if(ObjectUtils.isEmpty(firstname) || (firstname.length()<6 && firstname.length()>32)) {
				BaseController.setCustomMessage(validMap, "error_firstname", RegisterLanguage.Error.FIRSTNAME_223);
			}
			
			// Last Name
			String lastname = ObjectUtils.null2void(commandMap.get("lastname"));
			if(ObjectUtils.isEmpty(lastname) || (lastname.length()<6 && lastname.length()>32)) {
				BaseController.setCustomMessage(validMap, "error_lastname", RegisterLanguage.Error.LASTNAME_223);
			}
			
			// 전화번호
			String telephone = ObjectUtils.null2void(commandMap.get("telephone"));
			flag = CommonUtils.validTelephone(telephone, ObjectUtils.null2void(commandMap.get("country_id")));
			if(!flag) {
				BaseController.setCustomMessage(validMap, "error_telephone", RegisterLanguage.Error.TELEPHONE_223);
			}
			
			// 주소
			String address_1 = ObjectUtils.null2void(commandMap.get("address_1"));
			if(address_1.trim().equals("")) {
				BaseController.setCustomMessage(validMap, "error_address_1", RegisterLanguage.Error.ADDRESS_1_223);
			}
			
			// City
			String city = ObjectUtils.null2void(commandMap.get("city")).trim();
			if(city.length()<1 || city.length()>128) {
				BaseController.setCustomMessage(validMap, "error_city", RegisterLanguage.Error.CITY_223);
			}
			
			// State
			String zone_id = ObjectUtils.null2void(commandMap.get("zone_id")).trim();
			if(zone_id.length()<1) {
				BaseController.setCustomMessage(validMap, "error_zone_id", RegisterLanguage.Error.ZONE_ID_223);
			}
			
			// 우편번호
			String postcode = ObjectUtils.null2void(commandMap.get("postcode"));
			flag = CommonUtils.validPostcode(postcode);
			if(!flag) {
				BaseController.setCustomMessage(validMap, "error_postcode", RegisterLanguage.Error.POSTCODE_223);
			}
			
			// 비밀번호
			String password = commandMap.get("password").toString();
			if(null!=password && !password.equals("")) {
				flag = CommonUtils.validPasword(password);
				if(!flag) {
					BaseController.setCustomMessage(validMap, "error_password", RegisterLanguage.Error.PASSWORD_223);
				}
				
				String confirmation = commandMap.get("confirmation").toString();
				if(!password.equals(confirmation)) {
					BaseController.setCustomMessage(validMap, "error_confirmation", RegisterLanguage.Error.CONFIRMATION_223);
				}
			}
			
			// 가입경로
			String join_path_id = ObjectUtils.null2void(commandMap.get("join_path_id"));
			if(join_path_id.trim().equals("")) {
				BaseController.setCustomMessage(validMap, "error_join_path_id", RegisterLanguage.Error.JOIN_PATH_ID_223);
			} else {
				if(join_path_id.equals("90")) {
					String join_path_etc = ObjectUtils.null2void(commandMap.get("join_path_etc"));
					if(join_path_etc.trim().equals("")) {
						BaseController.setCustomMessage(validMap, "error_join_path_id", RegisterLanguage.Error.JOIN_PATH_ETC_223);
					}
				}
			}
		}
		
	}
}
