package myhome.common.interceptor;

import javax.servlet.http.HttpServletRequest;  
import javax.servlet.http.HttpServletResponse;  
import javax.servlet.http.HttpSession;  
  
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import myhome.common.constant.Session;
import myhome.common.dto.CustomerDTO;  

public class LoginCheckInterceptor extends HandlerInterceptorAdapter {
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {  
        HttpSession session  = request.getSession(false);
        if(session == null) {
        	if(isAjaxRequest(request)) {
                response.sendError(300);
                return false;
            } else {
	            response.sendRedirect(request.getContextPath()+"/login.dr");
	            return false;
            }
        }
  
        CustomerDTO customer = (CustomerDTO)session.getAttribute(Session.CUSTOMER);
        if (customer == null) {
        	if(isAjaxRequest(request)) {
                response.sendError(300);
                return false;
            } else {
	            response.sendRedirect(request.getContextPath()+"/login.dr");
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
