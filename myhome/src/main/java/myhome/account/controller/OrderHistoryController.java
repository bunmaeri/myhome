package myhome.account.controller;

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
import myhome.common.common.CommandMap;
import myhome.common.constant.Session;
import myhome.common.controller.BaseController;
import myhome.common.util.OrderUtils;
import myhome.common.util.Pagemaker;
import myhome.common.util.ScriptUtils;

@Controller
public class OrderHistoryController extends BaseController {
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="accountService")
	private AccountService accountService;
	
	/**
	 * 주문내역 조회
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/account/order_history.dr")
    public ModelAndView orderHistory(HttpSession session, Pagemaker pagemaker, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/account/order_history");
    	session.setAttribute(Session.ORDER_HISTORY_PAGER, (null==commandMap.get("page") || commandMap.get("page").equals(""))?"1":commandMap.get("page"));

    	int count = 0;
    	pagemaker.setPage(pagemaker.getPage());
    	count = accountService.orderHistoryTotal(BaseController.getId(session)); // 레코드 총 갯수 구함
    	pagemaker.setCount(count); // 페이지 계산

    	commandMap.put("customer_id", BaseController.getId(session));
    	commandMap.put("page", (pagemaker.getPage()-1)*pagemaker.getPER());
    	commandMap.put("per_page", pagemaker.getPER());
    	List<Map<String,Object>> list = accountService.orderHistory(commandMap.getMap());
    	mv.addObject("list", list);
    	if(list.size() > 0){
    		mv.addObject("TOTAL", list.get(0).get("TOTAL_COUNT"));
    		mv.addObject("result", list);
    		mv.addObject("pageMaker", pagemaker); 
    	}
    	else{
    		mv.addObject("TOTAL", 0);
    	}
    	
    	ScriptUtils.accountScript(mv);
    	
    	return mv;
    }
	
	/**
	 * 주문내역 상세조회
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/account/order/view/{order_id}.dr")
    public ModelAndView orderInfo(@PathVariable String order_id, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/account/order_view");
    	
//    	log.debug("order_id:"+order_id);
    	commandMap.put("order_id", order_id);
    	Map<String,Object> map = accountService.orderInfo(commandMap.getMap());
    	
    	@SuppressWarnings("unchecked")
		Map<String,Object> info = (Map<String,Object>) map.get("info");
    	OrderUtils outil = new OrderUtils();
    	info.put("order_status_name", outil.orderStatusName(info.get("order_status_id").toString()));
    	info.put("payment_address", outil.orderHistoryAddress("payment_", info));
    	info.put("shipping_address", outil.orderHistoryAddress("shipping_", info));
    	
    	mv.addObject("info", info);
    	mv.addObject("products", map.get("products"));
    	mv.addObject("totals", map.get("totals"));
    	mv.addObject("histories", map.get("histories"));
		
    	ScriptUtils.accountScript(mv);
    	
    	return mv;
    }
}
