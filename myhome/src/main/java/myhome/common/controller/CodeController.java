package myhome.common.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import myhome.common.service.CodeService;
import myhome.common.util.ObjectUtils;

@Controller
public class CodeController {
	public static HashMap<String, Object> CODE_MAP;
	public static String codeResult;
	
	@Autowired
	private CodeService codeService;

	public CodeController() {}

	@PostConstruct
	public HashMap<String, Object> setCodeList() throws Exception {  
		CODE_MAP = new HashMap<>();
		List<Map<String, Object>> CODE_LIST = codeService.getCodes();
		if(CODE_LIST != null && CODE_LIST.size() > 0){
			for(Map<String,Object> map : CODE_LIST){
				CODE_MAP.put(ObjectUtils.null2void(map.get("key")), map.get("value"));
			}
		}

		return CODE_MAP;
	}
	
	/**
	* Key 의한 Value 가져오기
	* @param key
	* @return
	*/
	public String getValue(String key) throws Exception {
		codeResult = "";

		if(CODE_MAP!= null){
			
			if(CODE_MAP.containsKey(key)){
				codeResult = ObjectUtils.null2Value(CODE_MAP.get(key), "");
			}
		} else {
			this.setCodeList();
			if(CODE_MAP.containsKey(key)){
				codeResult = ObjectUtils.null2Value(CODE_MAP.get(key), "");
			}
		}

		return codeResult;
	}
	
	/**
	* Key 의한 Value 가져오기
	* @param key
	* @return
	*/
	public int getValueInt(String key) throws Exception {
		codeResult = "";

		if(CODE_MAP!= null){
			
			if(CODE_MAP.containsKey(key)){
				codeResult = ObjectUtils.null2Value(CODE_MAP.get(key), "");
			}
		} else {
			this.setCodeList();
			if(CODE_MAP.containsKey(key)){
				codeResult = ObjectUtils.null2Value(CODE_MAP.get(key), "");
			}
		}

		return Integer.parseInt(codeResult);
	}
	
	/**
	* 새로고침
	* @return
	*/
	public void reload() throws Exception {
		CODE_MAP.clear();
		this.setCodeList();
	}
}
