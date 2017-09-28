package myhome.common.email;

import java.util.List;
import java.util.Map;

import myhome.common.controller.CodeController;
import myhome.common.util.CustomTag;
import myhome.common.util.ObjectUtils;
import myhome.common.util.StoreUtil;

public class OrderEmail {

	@SuppressWarnings("unchecked")
	public static String getHtml(Map<String,Object> map) throws Exception {
		// 공통코드
		CodeController code = new CodeController();
				
		Map<String,Object> info = (Map<String, Object>) map.get("info");
		List<Map<String,Object>> products = (List<Map<String,Object>>) map.get("products");
		List<Map<String,Object>> totals = (List<Map<String,Object>>) map.get("totals");
		
		StringBuffer sb = new StringBuffer();
		sb.append("<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/1999/REC-html401-19991224/strict.dtd\">");
		sb.append("<html>");
		sb.append("<head>");
		sb.append("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />");
		sb.append("<title>주문 완료 이메일</title>");
//		sb.append("<link rel=\"stylesheet\" type=\"text/css\" href=\"").append(StoreUtil.getStoreUrl()).append("css/main.css\" media=\"all\" />");
//		sb.append("<link rel=\"stylesheet\" type=\"text/css\" href=\"").append(StoreUtil.getStoreUrl()).append("css/account.css\" media=\"all\" />");
		sb.append("</head>");
		sb.append("<body style=\"font-family: Verdana, Helvetica, sans-serif; font-size: 14px; color: #000000;\">");
		sb.append("<div style=\"width: 720px;\">");
		sb.append("<a href=\"").append(StoreUtil.getStoreUrl()).append("\" title=\"").append(code.getValue("config_comapny_name")).append("\"><img src=\"").append(StoreUtil.getStoreUrl()).append("image/logo_myhome.png\" alt=\"").append(code.getValue("config_comapny_name")).append("\" style=\"margin-bottom: 20px; border: none;\" /></a>");
//		sb.append("<a href=\"\"><img src=\"").append(StoreUtil.getStoreUrl()).append("image/logo_myhome.png\" alt=\"").append(code.getValue("config_comapny_name")).append("\" style=\"margin-bottom:20px;border:none;max-width: 100%;height: auto;\"></a>");
		sb.append("	   <table style=\"width: 100%; margin-bottom: 20px;\">");
		sb.append("        <tr>");
		sb.append("            <td colspan=\"2\">");
		sb.append("			      <div class=\"page-title row\" style=\"margin-left:0;margin-right:0;margin-bottom:20px;\">");
		sb.append("			        <div class=\"col-md-12\">");
		sb.append("			            <h2 style=\"font-size:36px;margin:0 0 40px 0;font-weight:400;margin-bottom:10px;\">주문번호: ").append(info.get("order_id")).append("</h2>");
		sb.append("			            <div class=\"order-leader\">");
		sb.append("			                <p class=\"order-date\">주문일자: ").append(info.get("order_date")).append("</p>");
		sb.append("			            </div>");
		sb.append("			        </div>");
		sb.append("			      </div>");
		sb.append("            </td>");
		sb.append("        </tr>");
		sb.append("    </table>");
		sb.append("	   <table style=\"border-collapse: collapse; width: 100%; border-top: 1px solid #DDDDDD; border-left: 1px solid #DDDDDD; margin-bottom: 20px;\">");
		sb.append("        <tr>");
		sb.append("        	   <td style=\"font-size: 14px;border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; text-align: left; padding: 7px;vertical-align: top\">");
		sb.append("                <h3 class=\"box-title\" style=\"font-size: 14px;margin: 0 0 10px 0;font-weight: 700;\">결제자 정보</h3>");
		sb.append("                <address class=\"box-content\" style=\"font-style: normal;font-size: 14px;font-weight: 400;ine-height: 20px;\">");
		sb.append("                    ").append(info.get("payment_address")).append("");
		sb.append("                </address>");
		sb.append("            </td>");
		sb.append("            <td style=\"font-size: 14px;border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; text-align: left; padding: 7px;vertical-align: top\">");
		sb.append("                <h3 class=\"box-title\" style=\"font-size: 14px;margin: 0 0 10px 0;font-weight: 700;\">배송 주소</h3>");
		sb.append("                <address class=\"box-content\" style=\"font-style: normal;font-size: 14px;font-weight: 400;line-height: 20px;\">");
		sb.append("                        ").append(info.get("shipping_address")).append("");
		sb.append("                </address>");
		sb.append("            </td>");
		sb.append("        </tr>");
		sb.append("        <tr>");
		sb.append("            <td style=\"font-size: 14px;border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; text-align: left; padding: 7px;vertical-align: top\">");
		sb.append("                <h3 style=\"font-size: 14px;margin: 0 0 10px 0;font-weight: 700;\">배송방법</h3>");
		sb.append("                <div style=\"font-style: normal;font-size: 14px;font-weight: 400;line-height: 20px;\">").append(info.get("shipping_method")).append("</div>");
		sb.append("            </td>");
		sb.append("            <td style=\"font-size: 14px;border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; text-align: left; padding: 7px;vertical-align: top\">");
		sb.append("                <h3 style=\"font-size: 14px;margin: 0 0 10px 0;font-weight: 700;\">결제방법</h3>");
		sb.append("                <div style=\"font-style: normal;font-size: 14px;font-weight: 400;line-height: 20px;\">").append(info.get("payment_method")).append("</div>");
		sb.append("            </td>");
		sb.append("        </tr>");
		sb.append("	   </table>");
		if(null!=info.get("comment") && !info.get("comment").equals("")) {
			sb.append("	   <table style=\"border-collapse: collapse; width: 100%; border-top: 1px solid #DDDDDD; border-left: 1px solid #DDDDDD; margin-bottom: 20px;\">");
			sb.append("	   <thead>");
			sb.append("	     <tr>");
			sb.append("	       <td style=\"font-size: 14px; border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; background-color: #EFEFEF; font-weight: bold; text-align: left; padding: 7px; color: #222222;\">주문 메모 남기기</td>");
			sb.append("	     </tr>");
			sb.append("	   </thead>");
			sb.append("	   <tbody>");
			sb.append("	     <tr>");
			sb.append("	       <td style=\"font-size: 14px;	border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; text-align: left; padding: 7px;\">").append(info.get("comment")).append("</td>");
			sb.append("	     </tr>");
			sb.append("	   </tbody>");
			sb.append("	   </table>");
		}
		sb.append("	   <table style=\"border-collapse: collapse; width: 100%; border-top: 1px solid #DDDDDD; border-left: 1px solid #DDDDDD; margin-bottom: 20px;\">");
		sb.append("	       <thead>");
		sb.append("	         <tr>");
		sb.append("	           <td style=\"font-size: 14px; border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; background-color: #EFEFEF; font-weight: bold; text-align: center; padding: 7px; color: #222222;\">상품명</td>");
		sb.append("	           <td style=\"font-size: 14px; border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; background-color: #EFEFEF; font-weight: bold; text-align: center; padding: 7px; color: #222222;\">모델</td>");
		sb.append("	           <td style=\"font-size: 14px; border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; background-color: #EFEFEF; font-weight: bold; text-align: center; padding: 7px; color: #222222;\">판매가격</td>");
		sb.append("	           <td style=\"font-size: 14px; border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; background-color: #EFEFEF; font-weight: bold; text-align: center; padding: 7px; color: #222222;\">수량</td>");
		sb.append("	           <td style=\"font-size: 14px; border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; background-color: #EFEFEF; font-weight: bold; text-align: center; padding: 7px; color: #222222;\">합계</td>");
		sb.append("	         </tr>");
		sb.append("	       </thead>");
		sb.append("	       <tbody>");
		int size = products.size();
		Map<String,Object> tmp = null;
		for(int i=0;i<size;i++) {
			tmp = products.get(i);
			sb.append("	         <tr>");
			sb.append("	           <td style=\"font-size: 14px;	border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; text-align: left; padding: 7px;\">").append(tmp.get("name")).append("</td>");
			sb.append("	           <td style=\"font-size: 14px;	border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; text-align: center; padding: 7px;\">").append(tmp.get("model")).append("</td>");
			sb.append("	           <td style=\"font-size: 14px;	border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; text-align: right; padding: 7px;\">").append(CustomTag.getCurrency(ObjectUtils.null2void(tmp.get("price")))).append("</td>");
			sb.append("	           <td style=\"font-size: 14px;	border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; text-align: right; padding: 7px;\">").append(tmp.get("quantity")).append("</td>");
			sb.append("	           <td style=\"font-size: 14px;	border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; text-align: right; padding: 7px;\">").append(CustomTag.getCurrency(ObjectUtils.null2void(tmp.get("total")))).append("</td>");
			sb.append("	         </tr>");
		}
		sb.append("	       </tbody>");
		sb.append("	       <tfoot>");
		size = totals.size();
		tmp = null;
		for(int i=0;i<size;i++) {
			tmp = totals.get(i);
	        sb.append("	         <tr>");
	        sb.append("	           <td style=\"font-size: 12px;	border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; text-align: right; padding: 7px;\" colspan=\"4\"><b>").append(tmp.get("title")).append(":</b></td>");
	        sb.append("	           <td style=\"font-size: 12px;	border-right: 1px solid #DDDDDD; border-bottom: 1px solid #DDDDDD; text-align: right; padding: 7px;\">").append(CustomTag.getCurrency(ObjectUtils.null2void(tmp.get("value")))).append("</td>");
	        sb.append("	         </tr>");
		}
        sb.append("	       </tfoot>");
        sb.append("	   </table>");
        sb.append("	   </div>");
		sb.append("</body>");
		sb.append("</html>");
		
		return sb.toString();
	}
}
