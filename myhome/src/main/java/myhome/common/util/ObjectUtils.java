package myhome.common.util;

import java.sql.Date;
import java.util.List;
import java.util.Map;

public class ObjectUtils {
	public static boolean isEmpty(Object s) {
		if (s == null) {
			return true;
		}
		
		if ((s instanceof String) && (((String)s).trim().length() == 0)) {
			return true;
		}
		
		if (s instanceof Map) {
			return ((Map<?, ?>)s).isEmpty();
		}
		
		if (s instanceof List) {
			return ((List<?>)s).isEmpty();
		}
		
		if (s instanceof Object[]) {
			return (((Object[])s).length == 0);
		}
		
		return false; 
	}
	
	/**
	 * null값을 "" 으로 치환
	 * @param param
	 * @return
	 */
	public static String null2void(Object param) {
		String str = new String();

		if (param == null) {
			return "";
		}

		if (param instanceof String) {
			str = (String) param;
		} else if (param instanceof String[]) {
			str = ((String[]) param)[0];
		} else if (param instanceof Date) {
			str = ((Date)param).toString();
		} else {
			str = String.valueOf(param);
		}

		if (str.equals("")) {
			return "";
		} else {
			return str.trim();
		}
	}
	
	/**
	 * null값을 value 로 치환
	 * @param param
	 * @param value
	 * @return
	 */
	public static String null2Value(Object param, String value) {
		String str = new String();

		if (param == null) {
			return value;
		}

		if (param instanceof String) {
			str = (String) param;
		} else if (param instanceof String[]) {
			str = ((String[]) param)[0];
		} else if (param instanceof Date) {
			str = ((Date)param).toString();
		} else {
			str = String.valueOf(param);
		}

		if (str.equals("")) {
			return value;
		} else {
			return str.trim();
		}
	}
}
