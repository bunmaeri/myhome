package myhome.information.service;

import java.util.List;
import java.util.Map;

public interface InformationService {
	Map<String, Object> info(Map<String, Object> map) throws Exception;
	
	List<Map<String, Object>> listInfo(Map<String, Object> map) throws Exception;
	
	List<Map<String, Object>> listDiseaseContentsMedicine(Map<String, Object> map) throws Exception;
	
	Map<String, Object> infoContents(Map<String, Object> map) throws Exception;
	
	/**
	 * 최근에 본 정보
	 * @param map
	 * @return
	 * @throws Exception
	 */
	List<Map<String, Object>> listInfoForRecentViewed(Map<String, Object> map) throws Exception;
	
	// Information 메뉴 상세
	Map<String, Object> information(Map<String, Object> map) throws Exception;
	
	// Information 메뉴 리스트
	List<Map<String, Object>> listInformation(Map<String, Object> map) throws Exception;
	
	/**
	 * 컨텐츠 데이터 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
	Map<String, Object> contentData(Map<String, Object> map) throws Exception;
}
