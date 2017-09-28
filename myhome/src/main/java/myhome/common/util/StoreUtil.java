package myhome.common.util;

import org.apache.log4j.Logger;

public class StoreUtil {
	private static final Logger log = Logger.getLogger(StoreUtil.class);
	private static final int language_id = 1;
	private static final String language_name = "한국어";
	private static final String store_id = "1";
	private static final String store_name = "My Home Doc";
	private static final String store_url = "https://myhomedocus.com/";
//	private static final String store_url = "http://208.72.223.10:7070/";
	private static final String currency_id = "2";
	private static final String currency_value = "1.00000000";
	private static final String currency_code = "USD";
	private static final String country_id = "113";
	private static final String geolite = "/home/www/drpurenatural/geolite/"; //server
//	private static final String geolite = "/Users/jo/Drpure/_new/geolite/"; // local
	
	public static int getLanguageId(){
		log.debug("-- Language id : " + language_id + "\n");
		return language_id;
	}
	
	public static String getLanguageName(){
		log.debug("-- Language name : " + language_name + "\n");
		return language_name;
	}
	
	public static String getStoreId() {
		return store_id;
	}

	public static String getStoreName() {
		return store_name;
	}

	public static String getStoreUrl() {
		return store_url;
	}

	public static String getCurrencyId() {
		return currency_id;
	}

	public static String getCurrencyCode() {
		return currency_code;
	}

	public static String getCurrencyValue() {
		return currency_value;
	}

	public static String getCurrency() {
		return "$";
	}

	public static String getCountryId() {
		return country_id;
	}

	public static String getGeolite() {
		return geolite;
	}
	
}
