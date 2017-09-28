package myhome.common.controller;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import myhome.common.common.CommandMap;
import myhome.common.service.CommonService;
import myhome.common.util.StoreUtil;

@Controller
public class IndexController {
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="commonService")
	private CommonService commonService;
	
	/**
	 * 메인페이지
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/index.dr")
    public ModelAndView login(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/index");
    	
    	commandMap.put("language_id", StoreUtil.getLanguageId());
    	commandMap.put("code", "main_notice");
    	List<Map<String,Object>> list = commonService.noticeList(commandMap.getMap());
    	int size = list.size();
    	for(int i=0;i<size;i++) {
    		mv.addObject("notice"+(i+1), list.get(i));
    	}
    	
    	return mv;
    }
}
