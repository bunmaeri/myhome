package myhome.account.controller;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import myhome.account.service.AccountService;
import myhome.common.common.CommandMap;
import myhome.common.controller.BaseController;
import myhome.common.util.Pagemaker;
import myhome.common.util.ScriptUtils;

@Controller
public class RewardController extends BaseController {
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="accountService")
	private AccountService accountService;
	
	/**
	 * 적립포인트 목록 조회
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/account/reward.dr")
    public ModelAndView reward(HttpSession session, Pagemaker pagemaker, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/account/reward");
    	
    	int count = 0;
    	pagemaker.setPage(pagemaker.getPage());
    	Map<String,Object> map = accountService.rewardTotal(BaseController.getId(session));
    	
    	@SuppressWarnings("unchecked")
		Map<String,Object> total = (Map<String,Object>) map.get("total");
    	count = Integer.parseInt(total.get("total_count").toString()); // 레코드 총 갯수 구함
    	pagemaker.setCount(count); // 페이지 계산

    	commandMap.put("customer_id", BaseController.getId(session));
    	commandMap.put("page", (pagemaker.getPage()-1)*pagemaker.getPER());
    	commandMap.put("per_page", pagemaker.getPER());
    	List<Map<String,Object>> list = accountService.reward(commandMap.getMap());
    	mv.addObject("list", list);
    	if(list.size() > 0){
    		mv.addObject("total_points", total.get("total_points"));
    		mv.addObject("result", list);
    		mv.addObject("pageMaker", pagemaker); 
    	}
    	else{
    		mv.addObject("total_points", 0);
    	}
    	
    	ScriptUtils.accountScript(mv);
    	
    	return mv;
    }
	
}
