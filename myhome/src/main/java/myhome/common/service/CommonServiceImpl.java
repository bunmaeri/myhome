package myhome.common.service;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

import myhome.common.dao.CommonDAO;

@Service("commonService")
public class CommonServiceImpl implements CommonService{
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="commonDAO")
	private CommonDAO commonDAO;

	@Override
	public Map<String, Object> selectFileInfo(Map<String, Object> map) throws Exception {
		return commonDAO.selectFileInfo(map);
	}
	
	/**
	 * 공지사항 목록
	 * @return map
	 * @throws Exception
	 */
	@Override
	public List<Map<String, Object>> noticeList(Map<String, Object> map) throws Exception {
		return commonDAO.noticeList(map);
	}
	
	/**
	 * 검색 갯수
	 * @return map
	 * @throws Exception
	 */
	@Override
	public int searchTotal(Map<String, Object> map) throws Exception {
		return commonDAO.searchTotal(map);
	}
	
	/**
	 * 검색
	 * @return map
	 * @throws Exception
	 */
	@Override
	public List<Map<String, Object>> search(Map<String, Object> map) throws Exception {
		return commonDAO.search(map);
	}
}
