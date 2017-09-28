package myhome.common.util;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.web.servlet.ModelAndView;

public class ScriptUtils {
//	private static final Logger log = Logger.getLogger(ScriptUtils.class);
	
	public static void accountScript(ModelAndView mv) {
		List<String> css = new ArrayList<String>();
    	css.add("/css/account.css");
    	mv.addObject("css", css);
	}
	
	public static void categoryScript(ModelAndView mv) {
		List<String> css = new ArrayList<String>();
    	css.add("/css/category.css");
    	mv.addObject("css", css);
	}
	
	public static void productScript(ModelAndView mv) {
		List<String> css = new ArrayList<String>();
    	css.add("/css/product.css");
    	mv.addObject("css", css);
	}
	
	public static void productCompareScript(ModelAndView mv) {
		List<String> css = new ArrayList<String>();
    	css.add("/css/product_compare.css");
    	mv.addObject("css", css);
    	mv.addObject("body_class", "catalog-product-compare-index");
	}
	
	public static void cartScript(ModelAndView mv) {
		List<String> css = new ArrayList<String>();
    	css.add("/css/cart.css");
    	mv.addObject("css", css);
    	mv.addObject("body_class", "checkout-cart-index");
	}
	
	public static void checkoutScript(ModelAndView mv) {
		List<String> css = new ArrayList<String>();
    	css.add("/css/checkout.css");
    	mv.addObject("css", css);
    	mv.addObject("body_class", "checkout-onepage-index");
	}
}
