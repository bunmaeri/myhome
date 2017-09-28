package myhome.common.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

@Repository("commonDAO")
public class CommonDAO extends AbstractDAO{

	@SuppressWarnings("unchecked")
	public Map<String, Object> selectFileInfo(Map<String, Object> map) throws Exception{
		return (Map<String, Object>)selectOne("common.selectFileInfo", map);
	}

	public String orderStatusName(String orderStatusId) throws Exception{
		return (String) selectOne("common.orderStatusName", orderStatusId);
	}
	
	/**
	 * 공지사항 목록
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String,Object>> noticeList(Map<String, Object> map) throws Exception{
		return (List<Map<String,Object>>) selectList("common.noticeList", map);
	}
	
	/**
	 * 검색 갯수
	 * @param map
	 * @return
	 * @throws Exception
	 */
	public int searchTotal(Map<String, Object> map) throws Exception{
		return (int) selectOne("common.searchTotal", map);
	}
	
	/**
	 * 검색
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> search(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>)selectPagingList("common.search", map);
	}
}
