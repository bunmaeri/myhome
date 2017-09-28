package myhome.information.service;

import java.util.List;
import java.util.Map;

public interface BookService {
	List<Map<String, Object>> listBook(Map<String, Object> map) throws Exception;
	
	Map<String, Object> book(Map<String, Object> map) throws Exception;	
}
