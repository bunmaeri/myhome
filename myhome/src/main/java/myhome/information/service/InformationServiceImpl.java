package myhome.information.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.commons.lang.StringEscapeUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

import myhome.information.dao.InformationDAO;

@Service("informationService")
public class InformationServiceImpl implements InformationService{
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="informationDAO")
	private InformationDAO informationDAO;
	
	@Override
	public Map<String, Object> info(Map<String, Object> map) throws Exception {
		Map<String, Object> resultMap = new HashMap<String,Object>();
		Map<String, Object> tempMap = informationDAO.info(map);
		resultMap.put("map", tempMap);
		
		return resultMap;
	}
	
	@Override
	public List<Map<String, Object>> listInfo(Map<String, Object> map) throws Exception {
		return informationDAO.listInfo(map);
	}
	
	/**
	 * 질병과 추천 생약제 목록
	 */
	@Override
	public List<Map<String, Object>> listDiseaseContentsMedicine(Map<String, Object> map) throws Exception {
		return informationDAO.listDiseaseContentsMedicine(map);
	}
	
	@Override
	public Map<String, Object> infoContents(Map<String, Object> map) throws Exception {
		Map<String, Object> resultMap = new HashMap<String,Object>();
		Map<String, Object> tempMap = informationDAO.infoContents(map);
		tempMap.put("description", StringEscapeUtils.unescapeHtml(tempMap.get("description").toString()));
		resultMap.put("map", tempMap);
		
		return resultMap;
	}
	
	/**
	 * 최근에 본 정보
	 */
	@Override
	public List<Map<String, Object>> listInfoForRecentViewed(Map<String, Object> map) throws Exception {
		return informationDAO.listInfoForRecentViewed(map);
	}
	
	/**
	 * Information 메뉴 상세
	 */
	@Override
	public Map<String, Object> information(Map<String, Object> map) throws Exception {
		Map<String, Object> resultMap = new HashMap<String,Object>();
		Map<String, Object> tempMap = informationDAO.information(map);
		tempMap.put("description", StringEscapeUtils.unescapeHtml(tempMap.get("description").toString()));
		resultMap.put("map", tempMap);
		
		return resultMap;
	}
	
	/**
	 * Information 메뉴 리스트
	 */
	@Override
	public List<Map<String, Object>> listInformation(Map<String, Object> map) throws Exception {
		return informationDAO.listInformation(map);
	}
	
	/**
	 * 컨텐츠 데이터 조회
	 */
	@Override
	public Map<String, Object> contentData(Map<String, Object> map) throws Exception {
		Map<String, Object> resultMap = new HashMap<String,Object>();
		Map<String, Object> tempMap = informationDAO.contentData(map);
		tempMap.put("description", StringEscapeUtils.unescapeHtml(tempMap.get("description").toString()));
		resultMap.put("map", tempMap);
		
		return resultMap;
	}
}
