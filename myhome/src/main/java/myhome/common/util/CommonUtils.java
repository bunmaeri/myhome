package myhome.common.util;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Map.Entry;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.codec.binary.Base64;

import org.apache.log4j.Logger;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import myhome.common.filter.PasswordEncoding;
import myhome.common.filter.SHAPasswordEncoder;

public class CommonUtils {
	private static final Logger log = Logger.getLogger(CommonUtils.class);

	public static String getRandomString() {
		return UUID.randomUUID().toString().replaceAll("-", "");
	}

	public static void printMap(Map<String, Object> map) {
		Iterator<Entry<String, Object>> iterator = map.entrySet().iterator();
		Entry<String, Object> entry = null;
		log.debug("--------------------printMap--------------------\n");
		while (iterator.hasNext()) {
			entry = iterator.next();
			log.debug("key : " + entry.getKey() + ",\tvalue : " + entry.getValue());
		}
		log.debug("");
		log.debug("------------------------------------------------\n");
	}

	public static void printList(List<Map<String, Object>> list) {
		Iterator<Entry<String, Object>> iterator = null;
		Entry<String, Object> entry = null;
		log.debug("--------------------printList--------------------\n");
		int listSize = list.size();
		for (int i = 0; i < listSize; i++) {
			log.debug("list index : " + i);
			iterator = list.get(i).entrySet().iterator();
			while (iterator.hasNext()) {
				entry = iterator.next();
				log.debug("key : " + entry.getKey() + ",\tvalue : " + entry.getValue());
			}
			log.debug("\n");
		}
		log.debug("------------------------------------------------\n");
	}

	/**
	 * 이메일 체크
	 * @param strInput
	 * @return
	 */
	public static boolean validEmail(String strInput) {
		return Pattern.matches("^[a-zA-Z0-9]+@[a-zA-Z0-9]+$", strInput);
	}

	/**
	 * 전화번호 체크
	 * @param strInput
	 * @return
	 */
	public static boolean validTelephone(String strInput, String country_id) {
		String telephone = strInput.trim().replaceAll("[^0-9]", "");
		if (telephone.length() < 9)
			return false;
		// 한국 전화번호일 때
		if(country_id.equals("113")) {
			if(!telephone.substring(0,1).equals("0")) {
				return false;
			}
		} else
		if(country_id.equals("223")) {
			
		}
		boolean flag = validNum(telephone);
		return flag;
	}
	
	/**
	 * 개인통관고유번호 체크
	 * @param strInput
	 * @return
	 */
	public static boolean validRequisitionId(String strInput) {
		if(strInput.trim().length()==0) return false;
		
		String first = strInput.substring(0, 1);
		if(!first.equals("P") && !first.equals("p")) return false;
		
		String requisition_id = strInput.substring(1);
//		log.debug("requisition_id:"+requisition_id);
		if (requisition_id.length() != 12) return false;
		
		boolean flag = validNum(requisition_id);
		return flag;
	}
	
	/**
	 * 우편번호 체크
	 * @param strInput
	 * @return
	 */
	public static boolean validPostcode(String strInput) {
		if (strInput.length() != 5) return false;
		
		boolean flag = validNum(strInput);
		return flag;
	}

	/**
	 * 비밀번호 체크
	 * @param strInput
	 * @return
	 */
	public static boolean validPasword(String strInput) {
		String password = strInput.replace("-", "");
		if (password.length() < 6 || password.length() > 32)
			return false;
		String Passwrod_PATTERN = "^(?=.*[a-zA-Z]+)(?=.*[0-9]+).{6,32}$";
		Pattern pattern = Pattern.compile(Passwrod_PATTERN);
		Matcher matcher = pattern.matcher(strInput);
		return matcher.matches();
		// return Pattern.matches("^[a-zA-Z0-9]*$", strInput);
	}

	/**
	 * 숫자 여부 체크
	 * @param strInput
	 * @return
	 */
	public static boolean validNum(String strInput) {
		return Pattern.matches("^[0-9]*$", strInput);
	}

	/**
	 * 영문 + 숫자 조합 여부 체크
	 * @param strInput
	 * @return
	 */
	public static boolean validAlphaNum(String strInput) {
		return Pattern.matches("^[a-zA-Z0-9]*$", strInput);
	}

	/**
	 * 암호화하기(BCrypt)
	 * @param str
	 * @return
	 */
	public static String encoder(String str) {
		PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
		PasswordEncoding passwordEncoding = new PasswordEncoding(passwordEncoder);
		
		return passwordEncoding.encode(str);
	}
	
	/**
	 * 암호화 비교하기(BCrypt)
	 * @param encryptStr
	 * @param normalStr
	 * @return
	 */
	public static boolean matches(String encryptStr, String normalStr) {
		return encryptStr.equals(encoder(normalStr));
	}

	/**
	 * 암호화하기(SHA)
	 * @param str
	 * @return
	 */
	public static String shaEncoder(String str) {
		SHAPasswordEncoder shaPasswordEncoder = new SHAPasswordEncoder(512);
		shaPasswordEncoder.setEncodeHashAsBase64(true);
		PasswordEncoding passwordEncoding = new PasswordEncoding(shaPasswordEncoder);
		
		return passwordEncoding.encode(str);
	}

	/**
	 * 암호화 비교하기(SHA)
	 * @param encryptStr
	 * @param normalStr
	 * @return
	 */
	public static boolean shaMatches(String encryptStr, String normalStr) {
		
		return encryptStr.equals(shaEncoder(normalStr));
	}
	
	/**
	 * Base64 암호화
	 * @param encodeStr
	 * @return
	 */
	public static String base64Encode(String str) {
		byte[] encoded = Base64.encodeBase64(str.getBytes());
		return new String(encoded);
	}
	
	/**
	 * Base64 복호화
	 * @param encodeStr
	 * @return
	 */
	public static String base64Decode(String encodeStr) {
		byte[] decoded = Base64.decodeBase64(encodeStr);
		return new String(decoded);
	}
	
	/**
	 * 비밀번호 만들기
	 * @param size
	 * @return
	 */
	public static String temporaryPassword(int size) {
		StringBuffer buffer = new StringBuffer();
		Random random = new Random();

		String chars[] = "A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,m,n,p,q,r,s,t,u,v,w,x,y,z,1,2,3,4,5,6,7,8,9".split(",");

		for (int i = 0; i < size; i++) {
			buffer.append(chars[random.nextInt(chars.length)]);
		}
		return buffer.toString();
	}

	/**
	 * 랜덤수 조합으로 자릿수 만큼
	 * @param type
	 * @param cnt
	 * @return
	 */
	public static String randomValue(String type, int cnt) {

		StringBuffer strPwd = new StringBuffer();
		char str[] = new char[1];
		// 특수기호 포함
		if (type.equals("P")) {
			for (int i = 0; i < cnt; i++) {
				str[0] = (char) ((Math.random() * 94) + 33);
				strPwd.append(str);
			}
			// 대문자로만
		} else if (type.equals("A")) {
			for (int i = 0; i < cnt; i++) {
				str[0] = (char) ((Math.random() * 26) + 65);
				strPwd.append(str);
			}
			// 소문자로만
		} else if (type.equals("S")) {
			for (int i = 0; i < cnt; i++) {
				str[0] = (char) ((Math.random() * 26) + 97);
				strPwd.append(str);
			}
			// 숫자형으로
		} else if (type.equals("I")) {
			int strs[] = new int[1];
			for (int i = 0; i < cnt; i++) {
				strs[0] = (int) (Math.random() * 9);
				strPwd.append(strs[0]);
			}
			// 소문자, 숫자형
		} else if (type.equals("C")) {
			Random rnd = new Random();
			for (int i = 0; i < cnt; i++) {
				if (rnd.nextBoolean()) {
					strPwd.append((char) ((int) (rnd.nextInt(26)) + 97));
				} else {
					strPwd.append((rnd.nextInt(10)));
				}
			}
		}
		return strPwd.toString();
	}

}
