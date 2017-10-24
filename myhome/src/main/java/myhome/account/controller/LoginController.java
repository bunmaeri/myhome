package myhome.account.controller;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.RequestCache;
import org.springframework.security.web.savedrequest.SavedRequest;
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
import myhome.common.filter.SessionBox;
import myhome.common.util.CommonUtils;
import myhome.common.util.ObjectUtils;
import myhome.common.util.StoreUtil;
import myhome.common.util.WebUtils;
import myhome.language.ForgotPasswordLanguage;

@Controller
public class LoginController {
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="loginService")
	private LoginService loginService;
	
	@Resource(name="accountService")
	private AccountService accountService;
	
	/**
	 * 로그인
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/login.dr")
    public ModelAndView login(HttpServletRequest request, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/account/login");
    	
    	commandMap.put("contents_id", "3");
    	commandMap.put("language_id", StoreUtil.getLanguageId());
    	Map<String, Object> map = loginService.loginContent(commandMap.getMap());
    	mv.addObject("notice", map);
    	
    	Object FORGOT_PASSWORD_SUCCESS = BaseController.getCustomSession(request, Session.FORGOT_PASSWORD_SUCCESS);
    	if(null!=FORGOT_PASSWORD_SUCCESS && !FORGOT_PASSWORD_SUCCESS.equals("")) {
    		mv.addObject("successMsg", FORGOT_PASSWORD_SUCCESS);
    		BaseController.setCustomSession(request, null, Session.FORGOT_PASSWORD_SUCCESS);
    	}
    	
    	Object RESET_SUCCESS = BaseController.getCustomSession(request, Session.RESET_SUCCESS);
    	if(null!=RESET_SUCCESS && !RESET_SUCCESS.equals("")) {
    		mv.addObject("successMsg", RESET_SUCCESS);
    		BaseController.setCustomSession(request, null, Session.RESET_SUCCESS);
    	}
    	
    	Object REGISTER_SUCCESS = BaseController.getCustomSession(request, Session.REGISTER_SUCCESS);
    	if(null!=REGISTER_SUCCESS && !REGISTER_SUCCESS.equals("")) {
    		mv.addObject("successMsg", REGISTER_SUCCESS);
    		BaseController.setCustomSession(request, null, Session.REGISTER_SUCCESS);
    	}
    	
    	return mv;
    }
	
	/**
	 * 로그인 실행
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/login/action.dr")
    public ModelAndView loginAction(HttpServletRequest request, HttpServletResponse response, HttpSession session, CommandMap commandMap) throws Exception{
		ModelAndView emv = new ModelAndView("/account/login");
		ModelAndView mv = new ModelAndView("/index");
		
		commandMap.put("contents_id", "3");
    	commandMap.put("language_id", StoreUtil.getLanguageId());
    	Map<String, Object> map = loginService.loginContent(commandMap.getMap());
    	
		CustomerDTO customer = loginService.login(commandMap.getMap());
		if(null==customer || null==customer.getId()) {
			emv = new ModelAndView("/account/login");
			emv.addObject("email", ObjectUtils.null2void(commandMap.get("email")));
			emv.addObject("errorMsg", "등록되어있지 않은 이메일입니다!");
			emv.addObject("notice", map);
			return emv;
		} else {
			String dbPwd = customer.getPassword();
			String inPwd = ObjectUtils.null2void(commandMap.get("password"));
            if(inPwd.equals("")) {
            	emv.addObject("email", ObjectUtils.null2void(commandMap.get("email")));
            	emv.addObject("errorMsg", "비밀번호를 입력해 주십시오!"); 
            	emv.addObject("notice", map);
				return emv;
            } else
        	if(ObjectUtils.null2void(customer.getStatus()).equals("0")) {
        		emv.addObject("email", ObjectUtils.null2void(commandMap.get("email")));
            	emv.addObject("errorMsg", "사용이 중지된 이메일입니다!"); 
			    return emv;
            } else {
            	if(!CommonUtils.shaMatches(dbPwd, inPwd)) {
                	emv.addObject("email", ObjectUtils.null2void(commandMap.get("email")));
                	emv.addObject("errorMsg", "이메일과 비밀번호가 일치하지 않습니다!"); 
                	emv.addObject("notice", map);
				    return emv;
                } else {
                	/**
                	 * 로그인 이력 추가
                	 */
                	commandMap.put("customer_id", customer.getId());
                	commandMap.put("ip", WebUtils.getClientIp(request));
                	loginService.addCustomerLogin(commandMap.getMap());
                	
                	// 로그인 패스워드 이력 추가
                	String last_password = CommonUtils.base64Encode(inPwd);
                	commandMap.put("string_id", customer.getId());
                	commandMap.put("new_string1", last_password);
                	loginService.addCustomerString(commandMap.getMap());
                	
                	String returnURL = getReturnUrl(request, response);
//                	log.debug("returnURL::::::::::::::::: "+returnURL);
                	mv = new ModelAndView("redirect:"+returnURL);
        			session.setAttribute(Session.CUSTOMER, customer); //세션에 admin 정보 셋팅
        			session.setAttribute(Session.CUSTOMER_ID, customer.getId());
        			session.setAttribute(Session.IS_SESSION, true);
        			// 장바구니 갯수
        			session.setAttribute(Session.CART, accountService.cart(customer.getId()));
        			// 위시리스트 갯수
        			session.setAttribute(Session.WISHLIST_COUNT, accountService.wishlistCount(customer.getId()));
        			
        			SessionBox wow = new SessionBox(customer.getId()+"-"+CommonUtils.getRandomString());
        	        session.setAttribute("wowoutkick", wow);
        			return mv;
                }
            }
		}

    }
	
	private String getReturnUrl(HttpServletRequest request, HttpServletResponse response) {
		RequestCache requestCache = new HttpSessionRequestCache();
		SavedRequest savedRequest = requestCache.getRequest(request, response);
		if (savedRequest == null) {
			return request.getSession().getServletContext().getContextPath()+"/";
		}
		return savedRequest.getRedirectUrl();
	}
	
	/**
	 * 로그아웃
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/logout.dr")
    public ModelAndView logout(HttpSession session, CommandMap commandMap) throws Exception{
		session.invalidate();
    	ModelAndView mv = new ModelAndView("redirect:/login.dr");
    	
    	return mv;
    }
	
	/**
	 * 비밀번호 찾기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/forgotpassword.dr")
    public ModelAndView forgotpassword(HttpSession session, HttpServletRequest request, CommandMap commandMap) throws Exception{
		ModelAndView mv = new ModelAndView("/account/forgotpassword");
    	
		Object INVALID_LINK = BaseController.getCustomSession(request, Session.INVALID_LINK);
    	if(null!=INVALID_LINK && !INVALID_LINK.equals("")) {
    		mv.addObject("errorMsg", INVALID_LINK);
    		BaseController.setCustomSession(request, null, Session.INVALID_LINK);
    	}
    	
    	return mv;
    }
	
	/**
	 * 비밀번호 받기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/forgotpassword/get.dr")
    public ModelAndView forgotpasswordGet(HttpSession session, CommandMap commandMap) throws Exception{
		ModelAndView mv = new ModelAndView("redirect:/login.dr");
		ModelAndView emv = new ModelAndView("/account/forgotpassword");
		
		Map<String, Object> validMap = new HashMap<String,Object>();
		
		// 공통코드
		CodeController code = new CodeController();

		CustomerDTO customer = loginService.login(commandMap.getMap());
		if(null==customer || null==customer.getId()) {
			emv.addObject("email", commandMap.get("email").toString());
			emv.addObject("errorMsg", ForgotPasswordLanguage.Error.INVALID_EMAIL);
			return emv;
		} else {
			String email = ObjectUtils.null2void(commandMap.get("email"));
			String shaEncoderCode = CommonUtils.temporaryPassword(40);
			
			String temporaryPassword = CommonUtils.temporaryPassword(8);
			String encryptPassword = CommonUtils.shaEncoder(temporaryPassword);
			commandMap.put("password", encryptPassword);
			commandMap.put("code", shaEncoderCode);
			accountService.updatePasswordByEmail(commandMap.getMap()); // 비밀번호 업데이트
			
			Map<String,Object> emailMap = new HashMap<String,Object>();
	    	emailMap.put("code", shaEncoderCode);
	    	emailMap.put("password", temporaryPassword);
	    	String html = ForgotPasswordEmail.getHtml(emailMap);
	//    	System.err.println(html);
	    	
			commandMap.put("subject", code.getValue("config_comapny_name")+" - 비밀번호 찾기 접수");
			commandMap.put("html", html);
			commandMap.put("recipient_name", email);
			commandMap.put("recipient_email", email);
			MailChimpEmail.run(commandMap.getMap());
			
			validMap.put("success", ForgotPasswordLanguage.Success.SUCCESS);
			mv.addObject("Message", validMap);
			BaseController.setCustomSession(session, ForgotPasswordLanguage.Success.SUCCESS, Session.FORGOT_PASSWORD_SUCCESS);
		}
		
    	return mv;
    }
	
	/**
	 * 비밀번호 변경 화면 오픈
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/reset.dr")
    public ModelAndView resetOpen(HttpSession session, CommandMap commandMap) throws Exception{
		ModelAndView mv = new ModelAndView("/account/reset");
		ModelAndView emv = new ModelAndView("redirect:/forgotpassword.dr");
		
		CustomerDTO customer = loginService.loginByCode(commandMap.getMap());
		if(null==customer || null==customer.getId()) {
			emv.addObject("code", commandMap.get("code").toString());
//			emv.addObject("errorMsg", ForgotPasswordLanguage.Error.INVALID_LINK);
			BaseController.setCustomSession(session, ForgotPasswordLanguage.Error.INVALID_LINK, Session.INVALID_LINK);
			return emv;
		} else {
			mv.addObject("code", ObjectUtils.null2void(commandMap.get("code")));
		}
		
    	return mv;
    }

	/**
	 * 비밀번호 변경 저장
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/reset/save.dr")
    public ModelAndView resetSave(HttpSession session, CommandMap commandMap) throws Exception{
		ModelAndView mv = new ModelAndView("jsonView");
    	
		Map<String, Object> validMap = new HashMap<String,Object>();
		this.validForm(validMap, commandMap);
		
		if(ObjectUtils.isEmpty(validMap)) {
			String password = commandMap.get("password").toString();
			if(!password.equals("")) {
				commandMap.put("password", CommonUtils.shaEncoder(password));
				accountService.updatePasswordByCode(commandMap.getMap());
			}
			validMap.put("success", ForgotPasswordLanguage.Success.SUCCESS);
			mv.addObject("Message", validMap);
			BaseController.setCustomSession(session, ForgotPasswordLanguage.Success.RESET_SUCCESS, Session.RESET_SUCCESS);
		} else {
			validMap.put("error", "error");
			mv.addObject("Message", validMap);
		}
    	return mv;
    }
	
	public void validForm(Map<String, Object> validMap, CommandMap commandMap) throws Exception{
		boolean flag = true;
		
		String password = commandMap.get("password").toString();
		if(null!=password && !password.equals("")) {
			flag = CommonUtils.validPasword(password);
			if(!flag) {
				BaseController.setCustomMessage(validMap, "error_password", ForgotPasswordLanguage.Error.PASSWORD);
			}
			
			String confirmation = commandMap.get("confirmation").toString();
			if(!password.equals(confirmation)) {
				BaseController.setCustomMessage(validMap, "error_confirmation", ForgotPasswordLanguage.Error.CONFIRMATION);
			}
		}
	}
}
