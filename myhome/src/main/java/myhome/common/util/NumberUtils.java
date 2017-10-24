package myhome.common.util;

import java.text.NumberFormat;

public class NumberUtils {
	/**
     * 3자리 마다 comma 로 구분지어 주는 문자열 생성
     * @param val
     * @return
     */
    public static String formatSeperatedByComma(long val) {
        NumberFormat format = NumberFormat.getNumberInstance();
        return format.format(val);
    }

    public static boolean isNumeric(String s) {
    	try {
    		Double.parseDouble(s.trim());
    		return true;
    	} catch(NumberFormatException e) {
    		return false;
    	}
    }
}
