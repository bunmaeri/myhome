package myhome.common.constant;

public final class Constants {
	/** 폴더 구분자 */
    public static final String FILE_SEP = System.getProperty("file.separator");
    /** 세션에 저장해 놓은 에러메시지에 대한 키값 */
    public static final String ERR_KEY = "errMsg";
    /** 년월일의 디폴트 포맷 */
    public static final String DEFAULT_DATE_PATTERN = "yyyyMMdd";
    /** 년월일의 디폴트 바포맷 */
    public static final String BAR_DATE_PATTERN = "yyyy-MM-dd";
    /** Information 정보의 쿠키 MAX 갯수 */
    public static final int COOKIE_INFORMATION_RECENTLY_VIEWED_LIMIT=10;
    public static final int COOKIE_DAYS=10;
}