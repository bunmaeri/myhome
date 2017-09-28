package myhome.information.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import myhome.common.dao.AbstractDAO;

@Repository("bookDAO")
public class BookDAO  extends AbstractDAO {

	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> listBook(Map<String, Object> map) throws Exception{
		return (List<Map<String, Object>>) selectList("book.listBook", map);
	}
	
	@SuppressWarnings("unchecked")
	public Map<String, Object> book(Map<String, Object> map) throws Exception{
		return (Map<String, Object>) selectOne("book.book", map);
	}
}
