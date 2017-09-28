package myhome.common.logger;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Enumeration;
import java.util.Hashtable;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import myhome.common.dto.CustomerDTO;
import myhome.common.logger.LoggerInterceptor;
import myhome.common.util.JdbcUtils;
import myhome.common.util.SessionUtil;

public class LoggerInterceptor extends HandlerInterceptorAdapter {
	protected Log log = LogFactory.getLog(LoggerInterceptor.class);
	
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		if (log.isDebugEnabled()) {
//			log.debug("======================================          START         ======================================");
//			log.debug(" Request URI \t:  " + request.getRequestURI());
		}
		this.logging(request);
		return super.preHandle(request, response, handler);
	}
	
	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
		if (log.isDebugEnabled()) {
//			log.debug("======================================           END          ======================================\n");
		}
//		this.logging(request);
	}
	
	public void logging(HttpServletRequest request) throws Exception {
		Hashtable<String,String> hash = new Hashtable<String,String>();
		String context_path = request.getContextPath();
		hash.put("context_path", defaultValue(context_path,""));
//		logger.debug("= context_path : " + context_path);
	    
		String request_uri = request.getRequestURI();
		hash.put("request_uri", defaultValue(request_uri,""));
//		logger.debug("= request_uri : " + request_uri);
	    
		String request_url = request.getRequestURL().toString();
		hash.put("request_url", defaultValue(request_url,""));
//		logger.debug("= request_url : " + request_url);
	    
		String query_string = request.getQueryString();
		hash.put("query_string", defaultValue(query_string,""));
//	    logger.debug("= query_string : " + query_string);
	    
		String method = request.getMethod();
		hash.put("method", defaultValue(method,""));
//	    logger.debug("= method : " + method);
	    
		String referer = request.getHeader("Referer");
		if (referer == null) {
		    referer = "";
		}
		hash.put("referer", defaultValue(referer,""));
//	    logger.debug("= referer : " + referer);
	    
		String accept = request.getHeader("Accept");
		hash.put("accept", defaultValue(accept,""));
//	    logger.debug("= accept : " + accept);
	    
		String accept_language = request.getHeader("Accept-Language");
		hash.put("accept_language", defaultValue(accept_language,""));
//	    logger.debug("= accept_language : " + accept_language);
	    
		String user_agent = request.getHeader("User-Agent");
		hash.put("user_agent", defaultValue(user_agent,""));
//	    logger.debug("= user_agent : " + user_agent);
	    
	    String remote_addr = request.getHeader("HTTP_X_FORWARDED_FOR");
	    if (remote_addr == null || remote_addr.length() == 0 || remote_addr.toLowerCase().equals("unknown")) {
	    	remote_addr = request.getHeader("REMOTE_ADDR");
	    }
	    if (remote_addr == null || remote_addr.length() == 0 || remote_addr.toLowerCase().equals("unknown")) {
	    	remote_addr = request.getRemoteAddr();
	    }
		hash.put("remote_addr", defaultValue(remote_addr,""));
//	    logger.debug("= remote_addr : " + remote_addr);

	    String remote_host = request.getRemoteHost();
		hash.put("remote_host", defaultValue(remote_host,""));
//		logger.debug("= remote_host : " + remote_host);
	    
		int remote_port = request.getRemotePort();
		hash.put("remote_port", defaultValue(remote_port,""));
//	    logger.debug("= remote_port : " + remote_port);
	    
//	    logger.debug("= locale ========================================");
	    String country = request.getLocale().getCountry();
		hash.put("country", defaultValue(country,""));
//	    logger.debug("1. country : " + country);

	    String language = request.getLocale().getLanguage();
		hash.put("language", defaultValue(language,""));
//	    logger.debug("2. language : " + language);
	    
//	    logger.debug("= session ========================================");
	    String access_member_no = "";
	    String access_member_nm = "";
	    HttpSession session=request.getSession();
	    if (session != null) {
	    	CustomerDTO customer = SessionUtil.getCustomer(session);
	    	if(null!=customer && null!= customer.getId()) {
		    	access_member_no = customer.getId();
//			    logger.debug("1. access_member_no : " + access_member_no);
			    
		    	access_member_nm = customer.getCustomerName();
//			    logger.debug("2. access_member_nm : " + access_member_nm);
	    	}
	    }
		hash.put("access_member_no", defaultValue(access_member_no,""));
		hash.put("access_member_nm", defaultValue(access_member_nm,""));
		
//	    logger.debug("= header ========================================");
	    StringBuffer buff = new StringBuffer();
	    int cnt = 0;
	    Enumeration eHeader = request.getHeaderNames();
	    while (eHeader.hasMoreElements()) {
	        String hName = (String)eHeader.nextElement();
	        String hValue = request.getHeader(hName);
	    	if(cnt>0) buff.append("|;|");
	    	buff.append(hName).append("=").append(hValue);
//	        logger.debug(hName + " : " + hValue);
		    cnt++;
	    }
		hash.put("header", defaultValue(buff.toString(),""));

//	    logger.debug("= cookies ========================================");
	    buff.setLength(0);
	    cnt = 0;
	    Cookie cookies[] = request.getCookies();
	    if(null!=cookies) {
		    for(int i=0 ; i<cookies.length ; i++) {
		        String name = cookies[i].getName();
		        String value = cookies[i].getValue();
		        if(cnt>0) buff.append("|;|");
		    	buff.append(name).append("=").append(value);
	//	        logger.debug(name + " : " + value);
		        cnt++;
		    }
	    }
		hash.put("cookies", defaultValue(buff.toString(),""));

//	    logger.debug("= parameter ========================================");
	    buff.setLength(0);
	    cnt = 0;
	    Enumeration eParam = request.getParameterNames();
	    while (eParam.hasMoreElements()) {
	        String pName = (String)eParam.nextElement();
	        String pValue = request.getParameter(pName);
	        if(cnt>0) buff.append("|;|");
	    	buff.append(pName).append("=").append(pValue);
//	        logger.debug(pName + " : " + pValue);
	        cnt++;
	    }
		hash.put("parameter", defaultValue(buff.toString(),""));

//	    logger.debug("= attribute ========================================");
	    buff.setLength(0);
	    cnt = 0;
	    Enumeration eAttr = request.getAttributeNames();
	    while (eAttr.hasMoreElements()) {
	        String aName = (String)eAttr.nextElement();
	        Object aValue = (Object)request.getAttribute(aName);
	        if(cnt>0) buff.append("|;|");
	    	buff.append(aName).append("=").append(aValue);
//	        logger.debug(aName + " : " + aValue);
	        cnt++;
	    }
		hash.put("attribute", defaultValue(buff.toString(),""));

		
		ServerLocation serverLocation = new GetLocation().getLocation(hash.get("remote_addr").toString());
		hash.put("geo_city", defaultValue(serverLocation.getCity(),""));
		String geo_state = "";
		if(null!=serverLocation.getRegion() && !serverLocation.getRegion().equals("")) {
			geo_state = defaultValue(serverLocation.getRegionName(),"")+"("+defaultValue(serverLocation.getRegion(),"")+")";
		}
		hash.put("geo_state", geo_state);
		String geo_country = "";
		if(null!=serverLocation.getCountryCode() && !serverLocation.getCountryCode().equals("")) {
			geo_country = defaultValue(serverLocation.getCountryName(),"")+"("+defaultValue(serverLocation.getCountryCode(),"")+")";
		}
		hash.put("geo_country", geo_country);
		buff.setLength(0);
		buff.append("postal_code=").append(defaultValue(serverLocation.getPostalCode(),""));buff.append("|;|");
		buff.append("latitude/longitude=").append(defaultValue(serverLocation.getLatitude(),"")).append(",").append(defaultValue(serverLocation.getLongitude(),""));
//		buff.append("longitude=").append(defaultValue(serverLocation.getLongitude(),""));
		hash.put("geo_etc", buff.toString());

		StringBuffer seql = new StringBuffer();
        seql.append("\n INSERT INTO log_my_customer ( ");
        seql.append("\n             context_path, ");
        seql.append("\n             request_uri, ");
        seql.append("\n             request_url, ");
        seql.append("\n             query_string, ");
        seql.append("\n             method, ");
        seql.append("\n             referer, ");
        seql.append("\n             geo_city, ");
        seql.append("\n             geo_state, ");
        seql.append("\n             geo_country, ");
        seql.append("\n             geo_etc, ");
        seql.append("\n             accept, ");
        seql.append("\n             accept_language, ");
        seql.append("\n             user_agent, ");
        seql.append("\n             remote_addr, "); // 10
        seql.append("\n             remote_host, ");
        seql.append("\n             remote_port, ");
        seql.append("\n             country, ");
        seql.append("\n             language, ");
        seql.append("\n             header, ");
        seql.append("\n             cookies, ");
        seql.append("\n             parameter, ");
        seql.append("\n             attribute, ");
        seql.append("\n             access_member_no, ");
        seql.append("\n             access_member_nm, "); // 20
        seql.append("\n             access_time ) ");
        seql.append("\n     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,now()) ");
        
		JdbcUtils.getInstance().update(
				  new PreparedStatementCreator() {
				    public PreparedStatement createPreparedStatement(Connection connection) throws SQLException {
				      PreparedStatement ps = connection.prepareStatement(seql.toString(), new String[] {"id"});
				      ps.setString(1, defaultValue(hash.get("context_path"),""));
				      ps.setString(2, defaultValue(hash.get("request_uri"),""));
				      ps.setString(3, defaultValue(hash.get("request_url"),""));
				      ps.setString(4, defaultValue(hash.get("query_string"),""));
				      ps.setString(5, defaultValue(hash.get("method"),""));
				      ps.setString(6, defaultValue(hash.get("referer"),""));
				      ps.setString(7, defaultValue(hash.get("geo_city"),""));
				      ps.setString(8, defaultValue(hash.get("geo_state"),""));
				      ps.setString(9, defaultValue(hash.get("geo_country"),""));
				      ps.setString(10, defaultValue(hash.get("geo_etc"),""));
				      ps.setString(11, defaultValue(hash.get("accept"),""));
				      ps.setString(12, defaultValue(hash.get("accept_language"),""));
				      ps.setString(13, defaultValue(hash.get("user_agent"),""));
				      ps.setString(14, defaultValue(hash.get("remote_addr"),""));
				      ps.setString(15, defaultValue(hash.get("remote_host"),""));
				      ps.setString(16, defaultValue(hash.get("remote_port"),""));
				      ps.setString(17, defaultValue(hash.get("country"),""));
				      ps.setString(18, defaultValue(hash.get("language"),""));
				      ps.setString(19, defaultValue(hash.get("header"),""));
				      ps.setString(20, defaultValue(hash.get("cookies"),""));
				      ps.setString(21, defaultValue(hash.get("parameter"),""));
				      ps.setString(22, defaultValue(hash.get("attribute"),""));
				      ps.setString(23, defaultValue(hash.get("access_member_no"),""));
				      ps.setString(24, defaultValue(hash.get("access_member_nm"),""));

				      return ps;
				    }
				  });
//		createLog(hash);

	}
	
	/**
     * obj가 null 이라면 defaultValue값을 반환, 아니면 obj를 그대로 반환
     *
     * @param obj
     * @param defaultValue
     * @return
     */
    public static Object defaultValue(Object obj, Object defaultValue) {
        if (obj == null) {
            return defaultValue;
        } else {
            return obj;
        }
    }

    /**
         * treatBlankSpaceAsNull 파라미터가 true라면, null 또는 공백문자일때는 defaultValue를 반환.<br>
     * treatBlankSpaceAsNull 파라미터가 false라면, null일때만 defaultValue를 반환.<br>
     * 아니면 obj.toString() 을 반환<br>
     * (예: CommUtil.defaultValue("  ", "a", true); 는 "a"를 반환<br>
     *      CommUtil.defaultValue("  ", "a", false); 는 "  "를 반환<br>
     *
     * @param obj
     * @param defaultValue
     * @param treatBlankSpaceAsNull
     * @return
     */
    public static String defaultValue(Object obj, String defaultValue,
                                      boolean treatBlankSpaceAsNull) {
        if (obj == null) {
            return defaultValue;
        } else if (treatBlankSpaceAsNull) {
            String tmp = obj.toString().trim();
            if (tmp.length() == 0) {
                return defaultValue;
            } else {
                return obj.toString();
            }
        } else {
            return obj.toString();
        }
    }

    /**
     * obj가 null 또는 공백문자라면 defaultValue값을 반환, 아니면 obj를 String으로 변환해서 반환<br>
     * 이 메소드는 defaultValue(obj, defaultValue, true)와 같다.
     *
     * @param obj
     * @param defaultValue
     * @return
     */
    public static String defaultValue(Object obj, String defaultValue) {
        return defaultValue(obj, defaultValue, true);
    }
}