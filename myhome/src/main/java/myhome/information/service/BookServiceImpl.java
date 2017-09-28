package myhome.information.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.commons.lang.StringEscapeUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

import myhome.information.dao.BookDAO;

@Service("bookService")
public class BookServiceImpl implements BookService{
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="bookDAO")
	private BookDAO bookDAO;
	
	@Override
	public List<Map<String, Object>> listBook(Map<String, Object> map) throws Exception {
		return bookDAO.listBook(map);
	}
	
	@Override
	public Map<String, Object> book(Map<String, Object> map) throws Exception {
		Map<String, Object> resultMap = new HashMap<String,Object>();
		Map<String, Object> tempMap = bookDAO.book(map);
		tempMap.put("description", StringEscapeUtils.unescapeHtml(tempMap.get("description").toString()));
		resultMap.put("map", tempMap);
		
		return resultMap;
	}
	
}
