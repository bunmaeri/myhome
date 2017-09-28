package myhome.common.util;

import java.text.NumberFormat;
import java.util.List;

public class CustomTag {
	public static String getBaseUrl() {
        return "/";
    }
	
	/**
	 * Success 메세지 만들기
	 * @param message
	 * @return
	 */
	public static String getSuccess(String message) {
		if(null!=message && !message.equals("") && !message.equals("{}")) {
			String success = "<ul class='messages'><li class='success-msg'><ul><li><span>"+ message +"</span></li></ul></li></ul>";
			return success;
		}
		return "";
	}
	
	/**
	 * ERROR 메세지 만들기
	 * @param error
	 * @return
	 */
	public static String getErrorString(String error) {
		if(null!=error && !error.equals("") && !error.equals("{}")) {
			String msg = "<ul class='messages'><li class='error-msg'><ul><li><span>"+ error +"</span></li></ul></li></ul>";
			return msg;
		}
		return "";
	}

	/**
	 * ERROR 메세지 만들기
	 * @param list
	 * @return
	 */
	public static String getError(List<String> list) {
		if(null!=list && list.size()>0) {
			int size = list.size();
			StringBuffer sb = new StringBuffer();
			sb.append("<ul class='messages'><li class='error-msg'><ul>");
			for(int i=0;i<size;i++) {
				sb.append("<li><span><i class='fa fa-exclamation-triangle'></i> ").append(list.get(i)).append("</span></li>");
			}
			sb.append("</ul></li></ul>");
			return sb.toString();
		} else {
			return "";
		}
	}
	
	public static String getCurrency(String currency) {
		double value = Double.parseDouble(currency);
	    java.util.Currency usd = java.util.Currency.getInstance("USD");
	    java.text.NumberFormat format = java.text.NumberFormat.getCurrencyInstance(java.util.Locale.US);
	    format.setCurrency(usd);
	    return format.format(value);
	    
//		double per2 = Double.parseDouble(currency);
//		double per = Double.parseDouble(String.format("%,10d.2f",per2));
//		return LanguageUtil.getCurrency()+per;
	}
	
	/**
	 * 제품 가격 표시(할인)
	 * @param price
	 * @param special
	 * @return
	 */
	public static String getPrice(String price, String special) {
		return getProductPrice(price, special, "product");
	}
	
	/**
	 * 제품 가격 표시(할인)
	 * @param price
	 * @param special
	 * @return
	 */
	public static String getProductPrice(String price, String special, String type) {
		if(null!=special && !special.equals("") && !special.equals("0")) {
			String formated_special = getCurrency(special);
			String formated_price = getCurrency(price);
			if(type.equals("product")) {
				return "<span class='price-new'>"+formated_special+"</span><span class='price-old'>"+formated_price+"</span>";
			} else
			if(type.equals("cart")) {
				return "<span class='price-new'>"+formated_special+"</span><br/><span class='price-old'>"+formated_price+"</span>";
			} else {
				return "<span class='price-new'>"+formated_special+"</span><span class='price-old'>"+formated_price+"</span>";
			}
			
		} else {
			return getCurrency(price);
		}
	}
	
	/**
	 * 할인 이미지 표시
	 * @param special
	 * @return
	 */
	public static String getSaleImage(String special) {
		if(null!=special && !special.equals("") && !special.equals("0")) {
			return "<span class='ribbon ribbon__new'><span class='ribbon__text'>Sale</span></span>";
		}
		return "";
	}
	
	public static String getNumber(String number) {
		long val = Long.parseLong(number);
		NumberFormat format = NumberFormat.getNumberInstance();
        return format.format(val);
	}
	
	public static String getDouble(String number) {
		double value = Double.parseDouble(number);
		NumberFormat format = NumberFormat.getNumberInstance();
        return format.format(value);
	}
	
	public static String getNowYear() {
		return ObjectUtils.null2void(DateUtils.getYear());
	}
}
