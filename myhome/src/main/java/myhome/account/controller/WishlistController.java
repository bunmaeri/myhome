package myhome.account.controller;

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
import myhome.common.common.CommandMap;
import myhome.common.constant.Session;
import myhome.common.controller.BaseController;
import myhome.common.util.ScriptUtils;
import myhome.common.util.StoreUtil;
import myhome.product.service.ProductService;

@Controller
public class WishlistController extends BaseController {
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="accountService")
	private AccountService accountService;
	
	@Resource(name="productService")
	private ProductService productService;
	
	/**
	 * 위시리스트 목록 조회
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/account/wishlist.dr")
    public ModelAndView wishlist(HttpSession session, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/account/wishlist");
    	
    	commandMap.put("customer_id", BaseController.getId(session));
    	commandMap.put("language_id", StoreUtil.getLanguageId());
    	List<Map<String,Object>> list = accountService.wishlist(commandMap.getMap());
    	mv.addObject("list", list);
    	mv.addObject("TOTAL", list.size());
    	
    	if(null!=BaseController.getCustomSession(session, Session.ERROR_MSG)) {
    		mv.addObject("errorMsg", BaseController.getCustomSession(session, Session.ERROR_MSG));
    		BaseController.setCustomSession(session, null, Session.ERROR_MSG);
    	}
    	
    	ScriptUtils.accountScript(mv);
    	
    	return mv;
    }
	
	/**
	 * 장바구니에 추가
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/account/wishlist/add_to_cart/{product_id}/{quantity}.dr")
    public ModelAndView addToCart(HttpSession session, @PathVariable String product_id, @PathVariable String quantity, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("redirect:/account/wishlist.dr");
    	
    	Map<String,Object> product = productService.productInfo(product_id);
    	    	
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
	 * 위시리스트 삭제
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/account/wishlist/delete/{product_id}.dr")
    public ModelAndView deleteWishlist(HttpSession session, @PathVariable String product_id, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("redirect:/account/wishlist.dr");
    	
    	String customer_id = BaseController.getId(session);
    	commandMap.put("customer_id", customer_id);
    	commandMap.put("product_id", product_id);
    	
    	accountService.deleteWishlist(commandMap.getMap());
    	
    	session.setAttribute(Session.WISHLIST_COUNT, accountService.wishlistCount(customer_id));
    	
    	return mv;
    }
	
	/**
	 * 위시리스트 업데이트
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/account/wishlist/update.dr")
    public ModelAndView updateWishlist(HttpSession session, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("redirect:/account/wishlist.dr");
    	
    	String customer_id = BaseController.getId(session);
    	
    	if(commandMap.get("product_id") instanceof String[]) {
//    		log.debug("commandMap.get(product_id):"+commandMap.get("product_id"));
    		String[] product_id = (String[])commandMap.get("product_id");
	    	String[] comment = (String[])commandMap.get("comment");
	    	String[] quantity = (String[])commandMap.get("quantity");
	    	int size = product_id.length;
	    	Map<String, Object> map = null;
	    	for(int i=0;i<size;i++) {
	    		map = new HashMap<String,Object>();
	    		map.put("customer_id", customer_id);
	    		map.put("product_id", product_id[i]);
	    		map.put("comment", comment[i]);
	    		map.put("quantity", quantity[i]);
	    		
	    		accountService.updateWishlist(map);
	    	}
    	} else
		if(commandMap.get("product_id") instanceof String) {
			commandMap.put("customer_id", customer_id);
			commandMap.put("product_id", commandMap.get("product_id"));
			commandMap.put("comment", commandMap.get("comment"));
			commandMap.put("quantity", commandMap.get("quantity"));
    		
    		accountService.updateWishlist(commandMap.getMap());
		}
    	
    	session.setAttribute(Session.WISHLIST_COUNT, accountService.wishlistCount(customer_id));
    	
    	return mv;
    }
}
