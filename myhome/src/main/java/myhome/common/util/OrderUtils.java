package myhome.common.util;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;

public class OrderUtils {
	public String orderStatusName(String orderStatusId) throws Exception{
		String sql = "SELECT name FROM dr_order_status WHERE order_status_id=" + orderStatusId;
		JdbcTemplate jdbcTemplate = JdbcUtils.getInstance();
		return (String) jdbcTemplate.query(sql, new ResultSetExtractor<Object>() {
			@Override
	        public String extractData(ResultSet rs) throws SQLException, DataAccessException {
	            if (rs.next()) {
	            	return rs.getString("name");
	            }
	            return null;
	        }
	    });
	}
	
	public String orderHistoryAddress(String addressType, Map<String,Object> map) {
		StringBuffer address = new StringBuffer();
		int language_id = StoreUtil.getLanguageId();
		// 한국어
		if(language_id==1) {
			address.append(map.get(addressType+"firstname"));
			if(null!=map.get(addressType+"lastname") && !map.get(addressType+"lastname").equals("")) {
				address.append(" ").append(map.get(addressType+"lastname"));
			}
			address.append("<br/>").append(map.get(addressType+"address_1"));
			if(null!=map.get("address_2") && !map.get("address_2").equals("")) {
				address.append(" ").append(map.get("address_2"));
			}
			if(null!=map.get(addressType+"postcode")) {
				address.append("<br/>").append(map.get(addressType+"postcode"));
			}
			if(null!=map.get(addressType+"country")) {
				address.append("<br/>").append(map.get(addressType+"country"));
			}
			
			return address.toString();
		}
		// 영어
		if(language_id==2) {
			
		}
		// 중국어
		if(language_id==3) {
			
		}
		// 일본어
		if(language_id==4) {
			
		}
		return "";
	}
	
	public String addressView(Map<String,Object> map) {
		StringBuffer address = new StringBuffer();
		int language_id = StoreUtil.getLanguageId();
		String country_id = map.get("country_id").toString();
		// 한국어
		if(language_id==1) {
			if(null!=map.get("address_alias") && !map.get("address_alias").equals("")) {
				address.append("<span style='color: #14328c;'>").append(map.get("address_alias")).append("</span><br/>");
			}
			address.append("<span style='font-size:16px'>").append(map.get("customer_name")).append("</span><br/>");
			if(null!=map.get("company") && !map.get("company").equals("")) {
				address.append(map.get("company")).append("<br/>");
			}
			// 한국 주소
			if(country_id.equals("113")) {
				address.append(map.get("address_1"));
				if(null!=map.get("address_2") && !map.get("address_2").equals("")) {
					address.append(" ").append(map.get("address_2"));
				}
				address.append("<br/>");
				address.append("우편번호: ");
				if(null!=map.get("postcode")) {
					address.append(map.get("postcode"));
				}
				address.append("<br/>");
				address.append("전화번호: ");
				if(null!=map.get("telephone")) {
					address.append(map.get("telephone"));
				}
				address.append("<br/>");
				address.append("통관부호: ");
				if(null!=map.get("requisition_id")) {
					address.append(map.get("requisition_id")).append("<br/>");
				}
			} else {
				// 미국 주소
				if(null!=map.get("address_2") && !map.get("address_2").equals("")) {
					address.append(map.get("address_1")).append(" ").append(map.get("address_2")).append("<br/>");
				} else {
					address.append(map.get("address_1")).append("<br/>");
				}
				address.append(map.get("city")).append(", ").append(map.get("zone_name")).append(" ").append(map.get("postcode")).append("<br/>");
				address.append(map.get("country_name")).append("<br/>");
				address.append("Tel: ");
				if(null!=map.get("telephone")) {
					address.append(map.get("telephone"));
				}
			}
			
			return address.toString();
		}
		// 영어
		if(language_id==2) {
			
		}
		// 중국어
		if(language_id==3) {
			
		}
		// 일본어
		if(language_id==4) {
			
		}
		return "";
	}
}
