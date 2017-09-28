package myhome.common.interceptor;

import javax.servlet.http.HttpServletRequest;  
import javax.servlet.http.HttpServletResponse;  
import javax.servlet.http.HttpSession;  
  
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import myhome.common.constant.Session;  

public class CartCheckInterceptor extends HandlerInterceptorAdapter {
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {  
        HttpSession session  = request.getSession(false);  
        // 세션이 없으면..
        if(session == null) {
        	if(isAjaxRequest(request)) {
                response.sendError(300);
                return false;
            } else {
	            response.sendRedirect(request.getContextPath()+"/login.dr");
	            return false;
            }
        }
        // 카트가 비었으면..
        if (session.getAttribute(Session.CART) == null) {
        	if(isAjaxRequest(request)) {
                response.sendError(400);
                return false;
            } else {
	            response.sendRedirect(request.getContextPath()+"/");
	            return false;
            }
        }
        
        return true;
    }
    
    private boolean isAjaxRequest(HttpServletRequest req) {
    	String header = req.getHeader("AJAX");
//    	System.err.println("header============>"+header);
    	if ("true".equals(header)) {
    		return true;
    	} else {
    		return false;
    	}
    }
}
