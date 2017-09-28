package myhome.common.service;

import java.util.List;
import java.util.Map;

public interface CommonService {

	Map<String, Object> selectFileInfo(Map<String, Object> map) throws Exception;

	/**
	 * 공지사항 목록
	 * @return map
	 * @throws Exception
	 */
	List<Map<String, Object>> noticeList(Map<String, Object> map) throws Exception;
	
	/**
	 * 검색 갯수
	 * @return map
	 * @throws Exception
	 */
	int searchTotal(Map<String, Object> map) throws Exception;
	
	/**
	 * 검색
	 * @return map
	 * @throws Exception
	 */
	List<Map<String, Object>> search(Map<String, Object> map) throws Exception;
}
