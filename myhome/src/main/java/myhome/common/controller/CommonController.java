package myhome.common.controller;

import java.io.File;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Queue;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import myhome.common.common.CommandMap;
import myhome.common.constant.Session;
import myhome.common.dto.CustomerDTO;
import myhome.common.service.CommonService;
import myhome.common.util.Pagemaker;
import myhome.common.util.ScriptUtils;
import myhome.common.util.StoreUtil;
import myhome.product.service.ProductService;

@Controller
public class CommonController {
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="commonService")
	private CommonService commonService;
	
	@Resource(name="productService")
	private ProductService productService;
	
	@RequestMapping(value="/common/downloadFile.do")
	public void downloadFile(CommandMap commandMap, HttpServletResponse response) throws Exception{
		Map<String,Object> map = commonService.selectFileInfo(commandMap.getMap());
		String storedFileName = (String)map.get("STORED_FILE_NAME");
		String originalFileName = (String)map.get("ORIGINAL_FILE_NAME");
		
		byte fileByte[] = FileUtils.readFileToByteArray(new File("C:\\dev\\file\\"+storedFileName));
		
		response.setContentType("application/octet-stream");
		response.setContentLength(fileByte.length);
		response.setHeader("Content-Disposition", "attachment; fileName=\"" + URLEncoder.encode(originalFileName,"UTF-8")+"\";");
		response.setHeader("Content-Transfer-Encoding", "binary");
		response.getOutputStream().write(fileByte);
		
		response.getOutputStream().flush();
		response.getOutputStream().close();
	}
	
	/**
	 * 검색
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/search.dr", produces="application/text; charset=utf8")
    public ModelAndView search(HttpSession session, Pagemaker pagemaker, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/common/search");
    	session.setAttribute(Session.SEARCH_Q, (null==commandMap.get("q") || commandMap.get("q").equals(""))?"":commandMap.get("q"));
    	session.setAttribute(Session.SEARCH_PAGER, (null==commandMap.get("page") || commandMap.get("page").equals(""))?"1":commandMap.get("page"));
    	session.setAttribute(Session.CURRENT_CATEGORY_URL, "/search.dr");
    	
    	CustomerDTO customer = (CustomerDTO) session.getAttribute(Session.CUSTOMER);
    	
    	int count = 0;
    	pagemaker.setPage(pagemaker.getPage());
    	commandMap.put("language_id", StoreUtil.getLanguageId());
    	if(null!=customer && null!=customer.getCustomerGroupId()) {
    		commandMap.put("customer_group_id", customer.getCustomerGroupId());
    	} else {
    		commandMap.put("customer_group_id", "0");
    	}
    	count = commonService.searchTotal(commandMap.getMap()); // 레코드 총 갯수 구함
    	pagemaker.setCount(count); // 페이지 계산

    	commandMap.put("page", (pagemaker.getPage()-1)*pagemaker.getPER());
    	commandMap.put("per_page", pagemaker.getPER());
    	List<Map<String,Object>> list = commonService.search(commandMap.getMap());
    	mv.addObject("list", list);
    	if(list.size() > 0){
    		mv.addObject("result", list);
    		mv.addObject("pageMaker", pagemaker); 
    	}
    	
    	/**
    	 * 상품 비교 목록 가져오기
    	 */
    	mv.addObject("compareList", this.compareList(session));
    	
    	ScriptUtils.categoryScript(mv);
    	return mv;
    }
	
	/**
	 * 제품비교 목록 가져오기(세션에서)
	 * @param session
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String,Object>> compareList(HttpSession session) throws Exception {
		List<Map<String,Object>> compareList = null;
    	
		Queue<String> queue = (Queue<String>) BaseController.getCustomSession(session, Session.PRODUCTS_COMPARE);
    	if(null!=queue && !queue.isEmpty()) {
			List<String> paramList = new ArrayList<String>();
	    	int size = queue.size();
	    	String peek = null;
	    	while(!queue.isEmpty()){
	    		peek = queue.poll();
	    		paramList.add(peek);
	    	}
	    	if(paramList.size()>0) {
	    		StringBuffer sb = new StringBuffer();
		    	sb.append("<ol>");
		    	compareList = productService.listCompareProducts(paramList);
				
				size = paramList.size();
				for(int i=0;i<size;i++) {
					queue.offer(paramList.get(i));
				}
				BaseController.setCustomSession(session, queue, Session.PRODUCTS_COMPARE); // 다시 세션에 저장한다.
	    	} else {
	    		BaseController.setCustomSession(session, null, Session.PRODUCTS_COMPARE); // 다시 세션에 저장한다.
	    	}
    	}
		return compareList;
	}
	/**
	 * 톰캣서버 활성화 여부 체크
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/check.dr")
    public ModelAndView check(CommandMap commandMap) throws Exception {
    	ModelAndView mv = new ModelAndView("/check");
    	
    	return mv;
    }
}
