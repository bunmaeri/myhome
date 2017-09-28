package myhome.common.service;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

import myhome.common.dao.CodeDAO;

@Service("codeService")
public class CodeServiceImpl implements CodeService{
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="codeDAO")
	private CodeDAO codeDAO;

	@Override
	public List<Map<String, Object>> getCodes() throws Exception {
		return codeDAO.getCodes();
	}
}
