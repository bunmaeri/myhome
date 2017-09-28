package myhome.information.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import myhome.common.common.CommandMap;
import myhome.common.constant.Constants;
import myhome.common.util.CookieUtils;
import myhome.common.util.StoreUtil;
import myhome.information.service.InformationService;

@Controller
public class InformationController {
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="informationService")
	private InformationService informationService;
	
	private int language_id = StoreUtil.getLanguageId();
	
	/**
	 * 임상사례 목록
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/clinic.dr")
    public ModelAndView clinic(HttpServletRequest request, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/clinic");
    	
    	commandMap.put("code", "clinic");
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.info(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	List<Map<String,Object>> list = informationService.listInfo(commandMap.getMap());
    	mv.addObject("list", list);
    	
    	// 쿠키에서 최근에 본 정보를 가져온다.
    	List<Map<String,Object>> recentViewedList = getCookieInformation(request, "clinic");
    	mv.addObject("recentViewedList", recentViewedList);
    	
    	return mv;
    }

	/**
	 * 임상사례 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/clinic/case/{contents_id}.dr")
    public ModelAndView listClinic(HttpServletRequest request, HttpServletResponse response, @PathVariable String contents_id, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/clinic_case");
    	
    	commandMap.put("code", "clinic");
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.info(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	commandMap.put("contents_id", contents_id);
//    	commandMap.put("language_id", language_id);
    	Map<String,Object> dto = informationService.infoContents(commandMap.getMap());
    	mv.addObject("dto", dto.get("map"));
    	
    	commandMap.put("language_id", language_id);
    	List<Map<String,Object>> list = informationService.listInfo(commandMap.getMap());
    	mv.addObject("list", list);
    	
    	// 최근 본 정보에 저장
    	setCookieInformation(request, response, "clinic", contents_id);
    	
    	return mv;
    }
	
	/**
	 * 질병과 추천생약제 목록
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/disease.dr")
    public ModelAndView disease(HttpServletRequest request, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/disease");
    	
    	commandMap.put("code", "disease");
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.info(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
//    	commandMap.put("tableName", "dr_info_disease_contents");
//    	commandMap.put("language_id", language_id);
    	List<Map<String,Object>> list = informationService.listInfo(commandMap.getMap());
    	mv.addObject("list", list);
    	
    	// 쿠키에서 최근에 본 정보를 가져온다.
    	List<Map<String,Object>> recentViewedList = getCookieInformation(request, "disease");
    	mv.addObject("recentViewedList", recentViewedList);
    	
    	return mv;
    }
	
	/**
	 * 질병과 추천생약제
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/disease/medicine/{contents_id}.dr")
    public ModelAndView listDisease(HttpServletRequest request, HttpServletResponse response, @PathVariable String contents_id, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/disease_medicine");
    	
    	commandMap.put("code", "disease");
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.info(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
//    	commandMap.put("tableName", "dr_info_disease_contents");
    	commandMap.put("contents_id", contents_id);
//    	commandMap.put("language_id", language_id);
    	Map<String,Object> dto = informationService.infoContents(commandMap.getMap());
    	mv.addObject("dto", dto.get("map"));
    	
//    	commandMap.put("tableName", "dr_info_disease_contents");
//    	commandMap.put("language_id", language_id);
    	List<Map<String,Object>> list = informationService.listInfo(commandMap.getMap());
    	mv.addObject("list", list);
    	
//    	commandMap.put("contents_id", contents_id);
    	commandMap.put("medicine_id", "2");
    	List<Map<String,Object>> list1 = informationService.listDiseaseContentsMedicine(commandMap.getMap());
    	mv.addObject("list1", list1);
    	
    	commandMap.put("medicine_id", "3");
    	List<Map<String,Object>> list2 = informationService.listDiseaseContentsMedicine(commandMap.getMap());
    	mv.addObject("list2", list2);
    	
    	// 최근 본 정보에 저장
    	setCookieInformation(request, response, "disease", contents_id);
    	
    	return mv;
    }
	
	/**
	 * 건강정보 목록
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/health.dr")
    public ModelAndView health(HttpServletRequest request, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/health");
    	
    	commandMap.put("code", "health");
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.info(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
//    	commandMap.put("tableName", "dr_info_health_contents");
//    	commandMap.put("language_id", language_id);
    	List<Map<String,Object>> list = informationService.listInfo(commandMap.getMap());
    	mv.addObject("list", list);
    	
    	// 쿠키에서 최근에 본 정보를 가져온다.
    	List<Map<String,Object>> recentViewedList = getCookieInformation(request, "health");
    	mv.addObject("recentViewedList", recentViewedList);
    	
    	return mv;
    }
	
	/**
	 * 건강정보 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/health/info/{contents_id}.dr")
    public ModelAndView listHealth(HttpServletRequest request, HttpServletResponse response, @PathVariable String contents_id, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/health_info");
    	
    	commandMap.put("code", "health");
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.info(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
//    	commandMap.put("tableName", "dr_info_health_contents");
    	commandMap.put("contents_id", contents_id);
//    	commandMap.put("language_id", language_id);
    	Map<String,Object> dto = informationService.infoContents(commandMap.getMap());
    	mv.addObject("dto", dto.get("map"));
    	
//    	commandMap.put("tableName", "dr_info_health_contents");
//    	commandMap.put("language_id", language_id);
    	List<Map<String,Object>> list = informationService.listInfo(commandMap.getMap());
    	mv.addObject("list", list);
    	
    	// 최근 본 정보에 저장
    	setCookieInformation(request, response, "health", contents_id);
    	
    	return mv;
    }
	
	/**
	 * 건강정보, 질병과 추천생약제, 임상사례의 최근 본 정보를 쿠키에 담는다.
	 * @param request
	 * @param response
	 * @param information_type
	 * @param information_id
	 */
	public void setCookieInformation(HttpServletRequest request, HttpServletResponse response, String code, String contents_id) {
		try {
			CookieUtils cookie = new CookieUtils();
			// Recently 목록 조회
			String cookieString = cookie.getValue(code, request);
			// 최근에 본 것을 맨 위로
			cookieString = contents_id+","+cookieString;
			String[] cookieList = cookieString.split(",");
			
			// 다시 쿠키에 담을 변수
			StringBuffer cookieSB = new StringBuffer();
			int size = cookieList.length;
			int max = Constants.COOKIE_INFORMATION_RECENTLY_VIEWED_LIMIT;
			for(int i=0;i<size;i++) {
				if(i<=max) {
					if(i>0) cookieSB.append(",");
					cookieSB.append(cookieList[i]);
				}
			}
	
			// 쿠키 생성
			cookie.createNewCookie(code, cookieSB.toString(), Constants.COOKIE_DAYS, response); // 10 days
		} catch(Exception e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * 최근에 본 정보를 DB에서 조회한다.
	 * @param request
	 * @param response
	 * @param information_type
	 * @return
	 */
	public List<Map<String,Object>> getCookieInformation(HttpServletRequest request, String code) {
		try {
			CookieUtils cookie = new CookieUtils();
			String cookieString = cookie.getValue(code, request);
			if(cookieString.length()>1) {
				String[] cookieList = cookieString.split(",");
				if(cookieList.length>0) {
					Map<String,Object> map = new HashMap<String,Object>();
					map.put("language_id", StoreUtil.getLanguageId());
					map.put("code", code);
					map.put("array", cookieList);
					
					List<Map<String,Object>> list = informationService.listInfoForRecentViewed(map);
					return list;
				} else {
					List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
					return list;
				}
			} else {
				List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
				return list;
			}
			
		} catch(Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	/**
	 * 운영철학 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/our_phylosophy.dr")
    public ModelAndView ourPhylosophy(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information");
    	
    	commandMap.put("information_id", 7);
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
//    	commandMap.put("language_id", language_id);
//    	List<Map<String,Object>> list = informationService.listInformation(commandMap.getMap());
//    	mv.addObject("list", list);
    	
    	return mv;
    }
	
	/**
	 * 순수품질 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/purity.dr")
    public ModelAndView purity(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information");
    	
    	commandMap.put("information_id", 8);
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * 세관규정 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/customs_policy.dr")
    public ModelAndView customsPolicy(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information");
    	
    	commandMap.put("information_id", 9);
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * 배송조회 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/tracking.dr")
    public ModelAndView tracking(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information");
    	
    	commandMap.put("information_id", 10);
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * 효과보는 복용법 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/how_to_gets_results.dr")
    public ModelAndView howToGetsResults(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information");
    	
    	commandMap.put("information_id", 12);
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * 저질제품이란 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/low_quality.dr")
    public ModelAndView lowQuality(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information");
    	
    	commandMap.put("information_id", 13);
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * 동아일보연재 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/my_column.dr")
    public ModelAndView myColumn(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information");
    	
    	commandMap.put("information_id", 14);
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * 진료를 원하시는 분들께 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/diagnosis.dr")
    public ModelAndView diagnosis(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information");
    	
    	commandMap.put("information_id", 15);
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * 통관고유부호 발급안내 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/requisition.dr")
    public ModelAndView requisition(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information");
    	
    	commandMap.put("information_id", 16);
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * Dr. Pure Natural 소개 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/aboutus.dr")
    public ModelAndView aboutus(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information_single");
    	
    	commandMap.put("information_id", 4);
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * 자주하는 질문들 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/faq.dr")
    public ModelAndView faq(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information_single");
    	
    	commandMap.put("information_id", 11);
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * 연락처 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/contact.dr")
    public ModelAndView contact(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information_single");
    	
    	commandMap.put("information_id", 17);
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * 개인정보 보호정책 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/privacy-policy.dr")
    public ModelAndView privacyPolicy(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information_footer");
    	
    	commandMap.put("information_id", 3);
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	
	/**
	 * 개인정보 보호정책 상세보기(English)
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/privacy-policy/en.dr")
    public ModelAndView privacyPolicyEn(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information_footer_en");
    	
    	commandMap.put("information_id", 3);
    	commandMap.put("language_id", 2);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * 이용약관 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/terms-of-use.dr")
    public ModelAndView termsofUse(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information_footer");
    	
    	commandMap.put("information_id", 5);
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * 이용약관 상세보기(English)
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/terms-of-use/en.dr")
    public ModelAndView termsofUseEn(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information_footer_en");
    	
    	commandMap.put("information_id", 5);
    	commandMap.put("language_id", 2);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * 반품정책 상세보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/return-policy.dr")
    public ModelAndView returnPolicy(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information_footer");
    	
    	commandMap.put("information_id", 6);
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * 반품정책 상세보기(English)
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/return-policy/en.dr")
    public ModelAndView returnPolicyEn(CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information_footer_en");
    	
    	commandMap.put("information_id", 6);
    	commandMap.put("language_id", 2);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
	
	/**
	 * 기타 Information 보기
	 * @param commandMap
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/information/{information_id}.dr")
    public ModelAndView otherInformation(@PathVariable String information_id, CommandMap commandMap) throws Exception{
    	ModelAndView mv = new ModelAndView("/information/information_single");
    	
    	commandMap.put("information_id", information_id);
    	commandMap.put("language_id", language_id);
    	Map<String,Object> map = informationService.information(commandMap.getMap());
    	mv.addObject("map", map.get("map"));
    	
    	return mv;
    }
}
