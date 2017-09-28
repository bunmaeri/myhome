package myhome.account.controller;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import myhome.account.service.AccountService;
import myhome.common.common.CommandMap;
import myhome.common.constant.Message;
import myhome.common.controller.BaseController;
import myhome.common.util.CommonUtils;
import myhome.common.util.ObjectUtils;
import myhome.common.util.SessionUtil;

@Controller
public class AccountController extends BaseController {
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="accountService")
	private AccountService accountService;

	/**
	 * 회원정보
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/account/edit.dr")
    public ModelAndView accountEdit(HttpSession session, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/account/edit");
    	
    	commandMap.put("customer_id", SessionUtil.getId(session));
    	Map<String,Object> map = accountService.accountInfo(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * 회원정보 수정
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/account/edit/save.dr")
    public ModelAndView accountEditSave(HttpServletRequest request, CommandMap commandMap) throws Exception{
		ModelAndView mv = new ModelAndView("jsonView");
    	
		Map<String, Object> validMap = new HashMap<String,Object>();
		this.validForm(validMap, commandMap);
		
		if(ObjectUtils.isEmpty(validMap)) {
			String customer_name = commandMap.get("customer_name").toString();
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
			commandMap.put("customer_id", BaseController.getId(request));
			commandMap.put("firstname", firstname);
			commandMap.put("lastname", lastname);
			accountService.updateAccountInfo(commandMap.getMap());
			
			String password = commandMap.get("password").toString();
			if(!password.equals("")) {
				commandMap.put("password", CommonUtils.shaEncoder(password));
				accountService.updatePassword(commandMap.getMap());
			}
//			this.setCustomSession(session, Message.Success.ACCOUNT_EDIT, Message.SUCCESS_KEY);
			Map<String, Object> messageMap = new HashMap<String,Object>();
			BaseController.setCustomMessage(messageMap, "success", Message.Success.ACCOUNT_EDIT);
			mv.addObject("Message", messageMap);
		} else {
			validMap.put("error", "error");
			mv.addObject("Message", validMap);
//			log.error("!-->"+validMap.get("error_email"));
		}
//		log.error("!-->"+validMap.get("error_email"));
    	return mv;
    }
	
	public void validForm(Map<String, Object> validMap, CommandMap commandMap) throws Exception{
		boolean flag = true;
		
		String customer_name = commandMap.get("customer_name").toString();
		if(ObjectUtils.isEmpty(customer_name) || (customer_name.length()<6 && customer_name.length()>32)) {
			BaseController.setCustomMessage(validMap, "error_customer_name", Message.Error.CUSTOMER_NAME);
		}
		
		String email = commandMap.get("email").toString();
		String last_email = commandMap.get("last_email").toString();
		if(!email.equals(last_email)) {
			flag = CommonUtils.validEmail(email);
			if(!flag) {
				int cnt = accountService.duplicateEmail(email);
				if(cnt>0) {
					BaseController.setCustomMessage(validMap, "error_email", Message.Error.EMAIL_DUPLICATION);
				}
			} else {
				BaseController.setCustomMessage(validMap, "error_email", Message.Error.EMAIL);
			}
		}
		
		String telephone = commandMap.get("telephone").toString();
		flag = CommonUtils.validTelephone(telephone, "0");
		if(!flag) {
			BaseController.setCustomMessage(validMap, "error_telephone", Message.Error.TELEPHONE);
		}
		
		String password = commandMap.get("password").toString();
		if(null!=password && !password.equals("")) {
			flag = CommonUtils.validPasword(password);
			if(!flag) {
				BaseController.setCustomMessage(validMap, "error_password", Message.Error.PASSWORD);
			}
			
			String confirmation = commandMap.get("confirmation").toString();
			if(!password.equals(confirmation)) {
				BaseController.setCustomMessage(validMap, "error_confirmation", Message.Error.CONFIRMATION);
			}
		}
	}
}
