package myhome.common.email;

import java.util.Map;

import myhome.common.controller.CodeController;
import myhome.common.util.StoreUtil;

/**
 * 회원가입 이메일
 * @author jo
 *
 */
public class RegisterEmail {

	public static String getHtml(Map<String,Object> map) throws Exception {
		// 공통코드
		CodeController code = new CodeController();
		
		StringBuffer sb = new StringBuffer();
		sb.append("<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/1999/REC-html401-19991224/strict.dtd\">");
		sb.append("<html>");
		sb.append("<head>");
		sb.append("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />");
		sb.append("<title>회원가입 완료 이메일</title>");
		sb.append("</head>");
		sb.append("<body style=\"font-family: Verdana, Helvetica, sans-serif; font-size: 14px; color: #000000;\">");
		sb.append("<div style=\"width: 720px;\">");
		sb.append("<a href=\"").append(StoreUtil.getStoreUrl()).append("\" title=\"").append(code.getValue("config_comapny_name")).append("\"><img src=\"").append(StoreUtil.getStoreUrl()).append("image/logo_myhome.png\" alt=\"").append(code.getValue("config_comapny_name")).append("\" style=\"margin-bottom: 20px; border: none;\" /></a>");
		sb.append("<div style=\"border: 1px solid #bbb;padding:25px;\">");
		sb.append("    <p style=\"margin-top: 0px; margin-bottom: 20px;\"><h3>").append(code.getValue("config_comapny_name")).append("에 오신 것을 환영합니다.</h3></p>");
		sb.append("    <p style=\"margin-top: 0px; margin-bottom: 20px;\"><h3>아래의 링크에서 가입 시 입력하신 이메일과 비밀번호로 로그인 하실 수 있습니다:</h3></p>");
		sb.append("    <p style=\"margin-top: 0px; margin-bottom: 20px;\">");
		sb.append("        <a href=\"").append(StoreUtil.getStoreUrl()).append("login.dr\" title=\"Login\" style=\"-moz-user-select: none;background-image: none;border: 1px solid transparent;border-radius: 3px;cursor: pointer;display: inline-block;font-size: 14px;font-weight: normal; line-height: 1.88; margin-bottom: 0; padding: 4px 20px;text-align: center; vertical-align: middle;white-space: nowrap;text-decoration: none; background-color: #edf0f5;border-color: #edf0f5; color: #000;\">").append(code.getValue("config_comapny_name")).append(" 로그인 하기</a>");
		sb.append("    </p>");
		sb.append("    <p style=\"margin-top: 0px; margin-bottom: 20px;\"><h3>저희 사이트에는 자연의학 전문회사들의 최우수 자연생약제들만을 엄선하였습니다.</h3></p>");
		sb.append("    <p style=\"margin-top: 0px; margin-bottom: 20px;\"><h3>믿고 신뢰할 수 있는 제품으로 고객님의 건강을 돕는 ").append(code.getValue("config_comapny_name")).append("이 되겠습니다.</h3></p>");
		sb.append("    <p style=\"margin-top: 0px; margin-bottom: 20px;\"><h3>감사합니다,</h3></p>");
		sb.append("    <p style=\"margin-top: 0px; margin-bottom: 20px;\"><h3>").append(code.getValue("config_comapny_name")).append("</h3></p>");
		sb.append("</div>");
		sb.append("</div>");
		sb.append("</body>");
		sb.append("</html>");
		
		return sb.toString();
	}
}
