package myhome.information.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import myhome.common.dao.AbstractDAO;

@Repository("informationDAO")
public class InformationDAO  extends AbstractDAO {

	@SuppressWarnings("unchecked")
	public Map<String, Object> info(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("information.info", map);
	}
	
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> listInfo(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectList("information.listInfo", map);
	}
	
	/**
	 * 질병과 추천 생약제 목록
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> listDiseaseContentsMedicine(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectList("information.listDiseaseContentsMedicine", map);
	}
	
	@SuppressWarnings("unchecked")
	public Map<String, Object> infoContents(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("information.infoContents", map);
	}
	
	/**
	 * 최근에 본 정보
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> listInfoForRecentViewed(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectList("information.listInfoForRecentViewed", map);
	}
	
	/**
	 * Information 메뉴 상세
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> information(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("information.information", map);
	}
	
	/**
	 * Information 메뉴 리스트
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> listInformation(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectList("information.listInformation", map);
	}
	
	/**
	 * 컨텐츠 데이터 조회
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> contentData(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("information.contentData", map);
	}
}
