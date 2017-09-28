package myhome.checkout.utils;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

import myhome.common.controller.CodeController;
import myhome.common.util.DateUtils;

public class FedexWebServiceXml {
	public static Map<String,Object> runTest(Map<String,Object> map) {
		Map<String,Object> returnMap = new HashMap<String,Object>();
		
		String fedex_url = "https://gateway.fedex.com/web-services/";
		StringBuffer xml = new StringBuffer();
		
		try {
			// 공통코드 로드
	    	CodeController code = new CodeController();
			URL url = new URL(fedex_url);
			
			Calendar cal = Calendar.getInstance(); 
		    int num = cal.get(Calendar.DAY_OF_WEEK);
		    
		    String date = "";
			// 일요일
		    if(num==1) {
		    	date = DateUtils.addDays(DateUtils.getToday(), 1, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
			} else
			// 토요일
			if(num==7) {
				date = DateUtils.addDays(DateUtils.getToday(), 2, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
			} else {
				date = DateUtils.getToday("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
			}
			
			// Whoever introduced xml to shipping companies should be flogged
			xml.append("<?xml version=\"1.0\"?>");
			xml.append("<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ns1=\"http://fedex.com/ws/rate/v10\">");
			xml.append("	<SOAP-ENV:Body>");
			xml.append("		<ns1:RateRequest>");
			xml.append("			<ns1:WebAuthenticationDetail>");
			xml.append("				<ns1:UserCredential>");
			xml.append("					<ns1:Key>").append(code.getValue("fedex_key")).append("</ns1:Key>"); // 2GLuNdEdAZwfqGXh
			xml.append("					<ns1:Password>").append(code.getValue("fedex_password")).append("</ns1:Password>"); // Dl4kmKTtXcWUBYIgHOVJl0ZCj
			xml.append("				</ns1:UserCredential>");
			xml.append("			</ns1:WebAuthenticationDetail>");
			xml.append("			<ns1:ClientDetail>");
			xml.append("				<ns1:AccountNumber>").append(code.getValue("fedex_account")).append("</ns1:AccountNumber>"); // 579952245
			xml.append("				<ns1:MeterNumber>").append(code.getValue("fedex_meter")).append("</ns1:MeterNumber>");
			xml.append("			</ns1:ClientDetail>");
			xml.append("			<ns1:Version>");
			xml.append("				<ns1:ServiceId>crs</ns1:ServiceId>");
			xml.append("				<ns1:Major>10</ns1:Major>");
			xml.append("				<ns1:Intermediate>0</ns1:Intermediate>");
			xml.append("				<ns1:Minor>0</ns1:Minor>");
			xml.append("			</ns1:Version>");
			xml.append("			<ns1:ReturnTransitAndCommit>true</ns1:ReturnTransitAndCommit>");
			xml.append("			<ns1:RequestedShipment>");
			xml.append("				<ns1:ShipTimestamp>").append(date).append("</ns1:ShipTimestamp>");
			xml.append("				<ns1:DropoffType>").append(code.getValue("fedex_dropoff_type")).append("</ns1:DropoffType>");
			xml.append("				<ns1:PackagingType>").append(code.getValue("fedex_packaging_type")).append("</ns1:PackagingType>");
			xml.append("				<ns1:TotalInsuredValue>");
			xml.append("					<ns1:Currency>USD</ns1:Currency>");
			xml.append("					<ns1:Amount>").append(map.get("amount")).append("</ns1:Amount>");
			xml.append("				</ns1:TotalInsuredValue>");
			xml.append("				<ns1:Shipper>");
			xml.append("					<ns1:Contact>");
			xml.append("						<ns1:PersonName>").append(code.getValue("config_owner")).append("</ns1:PersonName>");
			xml.append("						<ns1:CompanyName>").append(code.getValue("config_comapny_name")).append("</ns1:CompanyName>");
			xml.append("						<ns1:PhoneNumber>").append(code.getValue("config_telephone")).append("</ns1:PhoneNumber>");
			xml.append("					</ns1:Contact>");
			xml.append("					<ns1:Address>");
			if(map.get("country_iso_code_2").equals("US")) {
				xml.append("						<ns1:StateOrProvinceCode>").append((null!=map.get("zone_code") ? map.get("zone_code") : "")).append("</ns1:StateOrProvinceCode>");
			} else {
				xml.append("						<ns1:StateOrProvinceCode></ns1:StateOrProvinceCode>");
			}
			xml.append("						<ns1:PostalCode>").append(code.getValue("fedex_postcode")).append("</ns1:PostalCode>");
			xml.append("						<ns1:CountryCode>").append(map.get("country_iso_code_2")).append("</ns1:CountryCode>");
			xml.append("					</ns1:Address>");
			xml.append("				</ns1:Shipper>");
			xml.append("				<ns1:Recipient>");
			xml.append("					<ns1:Contact>");
			xml.append("						<ns1:PersonName>").append(map.get("address_customer_name")).append("</ns1:PersonName>");
			xml.append("						<ns1:CompanyName>").append(map.get("address_company")).append("</ns1:CompanyName>");
			xml.append("						<ns1:PhoneNumber>").append(map.get("address_telephone")).append("</ns1:PhoneNumber>");
			xml.append("					</ns1:Contact>");
			xml.append("					<ns1:Address>");
			xml.append("						<ns1:StreetLines>").append(map.get("address_address_1")).append("</ns1:StreetLines>");
			xml.append("						<ns1:City>").append(map.get("address_city")).append("</ns1:City>");
	
			if(map.get("address_iso_code_2").equals("US")) {
				xml.append("						<ns1:StateOrProvinceCode>").append(map.get("address_zone_code")).append("</ns1:StateOrProvinceCode>");
			} else {
				xml.append("						<ns1:StateOrProvinceCode></ns1:StateOrProvinceCode>");
			}
			xml.append("						<ns1:PostalCode>").append(map.get("address_postcode")).append("</ns1:PostalCode>");
			xml.append("						<ns1:CountryCode>").append(map.get("address_iso_code_2")).append("</ns1:CountryCode>");
			xml.append("						<ns1:Residential>").append((null!=map.get("address_company") ? "true" : "false")).append("</ns1:Residential>");
	//	 			xml.append("						<ns1:Residential>false</ns1:Residential>';
			xml.append("					</ns1:Address>");
			xml.append("				</ns1:Recipient>");
			xml.append("				<ns1:ShippingChargesPayment>");
			xml.append("					<ns1:PaymentType>SENDER</ns1:PaymentType>");
			xml.append("					<ns1:Payor>");
			xml.append("						<ns1:AccountNumber>").append(code.getValue("fedex_account")).append("</ns1:AccountNumber>");
			xml.append("						<ns1:CountryCode>").append(map.get("country_iso_code_2")).append("</ns1:CountryCode>");
			xml.append("					</ns1:Payor>");
			xml.append("				</ns1:ShippingChargesPayment>");
			xml.append("				<ns1:RateRequestTypes>").append(code.getValue("fedex_rate_type")).append("</ns1:RateRequestTypes>");
			xml.append("				<ns1:PackageCount>1</ns1:PackageCount>");
			xml.append("				<ns1:RequestedPackageLineItems>");
			xml.append("					<ns1:SequenceNumber>1</ns1:SequenceNumber>");
			xml.append("					<ns1:GroupPackageCount>1</ns1:GroupPackageCount>");
			xml.append("					<ns1:Weight>");
			xml.append("						<ns1:Units>LB</ns1:Units>");
			xml.append("						<ns1:Value>").append(map.get("weight")).append("</ns1:Value>");
			xml.append("					</ns1:Weight>");
			xml.append("					<ns1:Dimensions>");
			xml.append("						<ns1:Length>").append(code.getValue("fedex_length")).append("</ns1:Length>");
			xml.append("						<ns1:Width>").append(code.getValue("fedex_width")).append("</ns1:Width>");
			xml.append("						<ns1:Height>").append(code.getValue("fedex_height")).append("</ns1:Height>");
			xml.append("						<ns1:Units>IN</ns1:Units>");
			xml.append("					</ns1:Dimensions>");
			xml.append("				</ns1:RequestedPackageLineItems>");
			xml.append("			</ns1:RequestedShipment>");
			xml.append("		</ns1:RateRequest>");
			xml.append("	</SOAP-ENV:Body>");
			xml.append("</SOAP-ENV:Envelope>");
			
			System.err.println(xml.toString());
			/*
	         * SSL 인증을 무조건 true로 만드는 소스 코드
	         */
//	        TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() { 
//	            public java.security.cert.X509Certificate[] getAcceptedIssuers() { 
//	                return null;
//	            } 
//
//				@Override
//				public void checkClientTrusted(java.security.cert.X509Certificate[] arg0, String arg1)
//						throws CertificateException {
//					// TODO Auto-generated method stub
//				}
//
//				@Override
//				public void checkServerTrusted(java.security.cert.X509Certificate[] arg0, String arg1)
//						throws CertificateException {
//					// TODO Auto-generated method stub
//				} 
//	        } };
//	
//	        SSLContext sc = SSLContext.getInstance("SSL"); 
//	        sc.init(null, trustAllCerts, new java.security.SecureRandom()); 
//	        HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
//	
//	        HttpsURLConnection.setDefaultHostnameVerifier(new HostnameVerifier(){
//	        	@Override 
//	        	public boolean verify(String string,SSLSession ssls) {
//	                    return true;
//	             }
//	         }); 
	
	        HttpURLConnection conn = (HttpURLConnection)url.openConnection();
	        
	        /*
	         * 연결 시간과 header 설정
	         */
	        conn.setConnectTimeout(3000);
	        conn.setDoOutput(true);
	        conn.setRequestMethod("POST");
	        conn.addRequestProperty("Content-Type", "text/xml");
	        OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream());
	        wr.write(xml.toString());
	        wr.flush();
	
	        InputStreamReader in = new InputStreamReader(conn.getInputStream(),"utf-8");
	        BufferedReader br = new BufferedReader(in);
	        String strLine;
	        String returnString = "";
	        
	        /*
	         * 보낸 XML에 대한 응답을 받아옴
	         */
	        while ((strLine = br.readLine()) != null){
	            returnString = returnString.concat(strLine);
	        }
	
	        in.close();
	        wr.close();
	        
	        /*
	         * 보낸 XML에 대한 응답을 출력.
	         */
	        System.err.println("returnString======================>"+returnString);
	
	    } catch (Exception e) {
	        e.printStackTrace();
	    }
		return returnMap;
	}
}
