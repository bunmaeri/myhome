package myhome.common.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

@Repository("codeDAO")
public class CodeDAO extends AbstractDAO{

	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> getCodes() throws Exception{
		return (List<Map<String, Object>>)selectList("code.getCodes");
	}
}
