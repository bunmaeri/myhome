package myhome.common.email;

import java.util.Map;

import myhome.common.controller.CodeController;
import myhome.common.util.ObjectUtils;
import myhome.common.util.StoreUtil;

/**
 * 비밀번호 찾기 이메일
 * @author jo
 *
 */
public class ForgotPasswordEmail {

	public static String getHtml(Map<String,Object> map) throws Exception {
		// 공통코드
		CodeController code = new CodeController();
		
		StringBuffer sb = new StringBuffer();
		sb.append("<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/1999/REC-html401-19991224/strict.dtd\">");
		sb.append("<html>");
		sb.append("<head>");
		sb.append("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />");
		sb.append("<title>비밀번호 찾기 이메일</title>");
		sb.append("</head>");
		sb.append("<body style=\"font-family: Verdana, Helvetica, sans-serif; font-size: 14px; color: #000000;\">");
		sb.append("<div style=\"width: 720px;\">");
		sb.append("<a href=\"").append(StoreUtil.getStoreUrl()).append("\" title=\"").append(code.getValue("config_comapny_name")).append("\"><img src=\"").append(StoreUtil.getStoreUrl()).append("image/logo_myhome.png\" alt=\"").append(code.getValue("config_comapny_name")).append("\" style=\"margin-bottom: 20px; border: none;\" /></a>");
		sb.append("<div style=\"font-family:verdana, arial,','Malgun Gothic','맑은 고딕',sans-serif;\">");
		sb.append("    Dr. Pure Natural 고객님의 비밀번호 찾기가 접수되었습니다.<br/>");
		sb.append("    임시비밀번호로 로그인을 하시거나 비밀번호 재설정 링크를 클릭하셔서 비밀번호를 다시 설정하십시요.<br/><br/>");
		sb.append("    임시비밀번호: ").append(map.get("password")).append("<br/><br/>");
		sb.append("    비밀번호를 재설정하시려면 아래 링크를 누르시고 원하시는 비밀번호를 입력하십시오:<br>");
		sb.append("    <a href=\"").append(StoreUtil.getStoreUrl()).append("reset.dr?code=").append(ObjectUtils.null2void(map.get("code"))).append("\" each=\"_blank\" target=\"_blank\" rel=\"noopener noreferrer\">").append(StoreUtil.getStoreUrl()).append("reset.dr?code=").append(ObjectUtils.null2void(map.get("code"))).append("</a><br><br>");
		sb.append("</div>");
		sb.append("</div>");
		sb.append("</body>");
		sb.append("</html>");
		
		return sb.toString();
	}
}
