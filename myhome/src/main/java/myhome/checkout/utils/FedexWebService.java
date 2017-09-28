package myhome.checkout.utils;

import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;

import java.math.BigDecimal;
import org.apache.axis.types.NonNegativeInteger;
import com.fedex.rate.stub.*;

import myhome.common.controller.CodeController;
import myhome.common.util.ObjectUtils;

public class FedexWebService {
	Logger log = Logger.getLogger(this.getClass());
	// 공통코드 로드
	public static CodeController code = new CodeController();
	//
	public static Map<String,Object> run(Map<String,Object> map) throws Exception {
		Map<String,Object> returnMap = new HashMap<String,Object>();
		
		// Build a RateRequest request object
		boolean getAllRatesFlag = false; // set to true to get the rates for different service types
	    RateRequest request = new RateRequest();
	    request.setClientDetail(createClientDetail());
        request.setWebAuthenticationDetail(createWebAuthenticationDetail());
        request.setReturnTransitAndCommit(true);
        
	    //
	    TransactionDetail transactionDetail = new TransactionDetail();
	    transactionDetail.setCustomerTransactionId("java sample - Rate Request"); // The client will get the same value back in the response
	    request.setTransactionDetail(transactionDetail);

        //
        VersionId versionId = new VersionId("crs", 20, 0, 0);
        request.setVersion(versionId);
        
        boolean isResidential = (null!=map.get("address_company") && !map.get("address_company").equals(""));
        //
        RequestedShipment requestedShipment = new RequestedShipment();
        
        requestedShipment.setShipTimestamp(Calendar.getInstance());
        requestedShipment.setDropoffType(DropoffType.REGULAR_PICKUP);
        if (! getAllRatesFlag) {
        	if(isResidential) {
        		requestedShipment.setServiceType(ServiceType.GROUND_HOME_DELIVERY);
        	} else {
        		requestedShipment.setServiceType(ServiceType.FEDEX_GROUND);
        	}
        	requestedShipment.setPackagingType(PackagingType.YOUR_PACKAGING);
        }
        
        
        Party shipper = new Party();
	    Address shipperAddress = new Address(); // Origin information
	    shipperAddress.setStreetLines(new String[] {"14780 Beach BL"});
	    shipperAddress.setCity("LA MIRADA");
	    shipperAddress.setStateOrProvinceCode("CA");
	    shipperAddress.setPostalCode(code.getValue("fedex_postcode"));
	    shipperAddress.setCountryCode("US");
        shipper.setAddress(shipperAddress);
        requestedShipment.setShipper(shipper);

	    //
        Party recipient = new Party();
	    Address recipientAddress = new Address(); // Destination information
	    recipientAddress.setStreetLines(new String[] {ObjectUtils.null2void(map.get("address_address_1"))});
	    recipientAddress.setCity(ObjectUtils.null2void(map.get("address_city")));
	    recipientAddress.setStateOrProvinceCode(ObjectUtils.null2void(map.get("address_zone_code")));
	    recipientAddress.setPostalCode(ObjectUtils.null2void(map.get("address_postcode")));
	    recipientAddress.setCountryCode(ObjectUtils.null2void(map.get("address_iso_code_2")));
	    recipientAddress.setResidential(isResidential);
	    recipient.setAddress(recipientAddress);
	    requestedShipment.setRecipient(recipient);

	    //
	    Payment shippingChargesPayment = new Payment();
	    shippingChargesPayment.setPaymentType(PaymentType.SENDER);
	    requestedShipment.setShippingChargesPayment(shippingChargesPayment);

	    RequestedPackageLineItem rp = new RequestedPackageLineItem();
	    rp.setGroupPackageCount(new NonNegativeInteger("1"));
	    rp.setWeight(new Weight(WeightUnits.LB, new BigDecimal(ObjectUtils.null2Value(map.get("weight"),"0"))));
	    //
	    rp.setInsuredValue(new Money("USD", new BigDecimal(ObjectUtils.null2Value(map.get("amount"),"0"))));
	    //
	    rp.setDimensions(new Dimensions(new NonNegativeInteger(code.getValue("fedex_length")), new NonNegativeInteger(code.getValue("fedex_width")), new NonNegativeInteger(code.getValue("fedex_height")), LinearUnits.IN));
	    PackageSpecialServicesRequested pssr = new PackageSpecialServicesRequested();
	    rp.setSpecialServicesRequested(pssr);
	    requestedShipment.setRequestedPackageLineItems(new RequestedPackageLineItem[] {rp});

//	    RateRequestType rateRequestType = new RateRequestType(code.getValue("fedex_rate_type"));
	    
	    requestedShipment.setPackageCount(new NonNegativeInteger("1"));
	    request.setRequestedShipment(requestedShipment);
	    
	    //
		try {
			// Initialize the service
			RateServiceLocator service;
			RatePortType port;
			//
			service = new RateServiceLocator();
			updateEndPoint(service);
			port = service.getRateServicePort();
			// This is the call to the web service passing in a RateRequest and returning a RateReply
			RateReply reply = port.getRates(request); // Service call
			if (isResponseOk(reply.getHighestSeverity())) {
//				writeServiceOutput(reply);
				returnMap.put("cost", writeServiceOutput(reply));
			} 
			printNotifications(reply.getNotifications());

		} catch (Exception e) {
		    e.printStackTrace();
		}
		return returnMap;
	}
	
	public static String writeServiceOutput(RateReply reply) {
		String returnCost = "0";
		RateReplyDetail[] rrds = reply.getRateReplyDetails();
		for (int i = 0; i < rrds.length; i++) {
			RateReplyDetail rrd = rrds[i];
			//print("\nService type", rrd.getServiceType());
			print("Packaging type", rrd.getPackagingType());
			//print("Delivery DOW", rrd.getDeliveryDayOfWeek());
			if(rrd.getDeliveryDayOfWeek() != null){
				int month = rrd.getDeliveryTimestamp().get(Calendar.MONTH)+1;
				int date = rrd.getDeliveryTimestamp().get(Calendar.DAY_OF_MONTH);
				int year = rrd.getDeliveryTimestamp().get(Calendar.YEAR);
				String delDate = new String(month + "/" + date + "/" + year);
				print("Delivery date", delDate);
				print("Calendar DOW", rrd.getDeliveryTimestamp().get(Calendar.DAY_OF_WEEK));
			}

			RatedShipmentDetail[] rsds = rrd.getRatedShipmentDetails();
			for (int j = 0; j < rsds.length; j++) {
				print("RatedShipmentDetail " + j, "");
				RatedShipmentDetail rsd = rsds[j];
				ShipmentRateDetail srd = rsd.getShipmentRateDetail();
				print("  Rate type", srd.getRateType());
				printWeight("  Total Billing weight", srd.getTotalBillingWeight());
				printMoney("  Total surcharges", srd.getTotalSurcharges());
				printMoney("  Total net charge", srd.getTotalNetCharge());
				Money money = srd.getTotalNetCharge();
				returnCost = String.valueOf(money.getAmount());
				
				RatedPackageDetail[] rpds = rsd.getRatedPackages();
				if (rpds != null && rpds.length > 0) {
					print("  RatedPackageDetails", "");
					for (int k = 0; k < rpds.length; k++) {
						print("  RatedPackageDetail " + i, "");
						RatedPackageDetail rpd = rpds[k];
						PackageRateDetail prd = rpd.getPackageRateDetail();
						if (prd != null) {
							printWeight("    Billing weight", prd.getBillingWeight());
							printMoney("    Base charge", prd.getBaseCharge());
							Surcharge[] surcharges = prd.getSurcharges();
							if (surcharges != null && surcharges.length > 0) {
								for (int m = 0; m < surcharges.length; m++) {
									Surcharge surcharge = surcharges[m];
									printMoney("    " + surcharge.getDescription() + " surcharge", surcharge.getAmount());
								}
							}
						}
					}
				}
			}
			System.out.println("");
		}
		return returnCost;
	}
	 
	private static ClientDetail createClientDetail() throws Exception {
        ClientDetail clientDetail = new ClientDetail();
        String accountNumber = code.getValue("fedex_account");
        String meterNumber = code.getValue("fedex_meter");
        
        //
        // See if the accountNumber and meterNumber properties are set,
        // if set use those values, otherwise default them to "XXX"
        //
        if (accountNumber == null) {
        	accountNumber = "579952245"; // Replace "XXX" with clients account number
        }
        if (meterNumber == null) {
        	meterNumber = "110435572"; // Replace "XXX" with clients meter number
        }
        clientDetail.setAccountNumber(accountNumber);
        clientDetail.setMeterNumber(meterNumber);
        return clientDetail;
	} 
	
	private static WebAuthenticationDetail createWebAuthenticationDetail() throws Exception {
        WebAuthenticationCredential userCredential = new WebAuthenticationCredential();
        String key = code.getValue("fedex_key");
        String password = code.getValue("fedex_password");       
        //
        // See if the key and password properties are set,
        // if set use those values, otherwise default them to "XXX"
        //
        if (key == null) {
        	key = "2GLuNdEdAZwfqGXh"; // Replace "XXX" with clients key
        }
        if (password == null) {
        	password = "Dl4kmKTtXcWUBYIgHOVJl0ZCj"; // Replace "XXX" with clients password
        }
        userCredential.setKey(key);
        userCredential.setPassword(password);
        
        WebAuthenticationCredential parentCredential = null;
        Boolean useParentCredential=false; //Set this value to true is using a parent credential
        if(useParentCredential){
        
        	String parentKey = System.getProperty("parentkey");
        	String parentPassword = System.getProperty("parentpassword");
        	//
            // See if the parentkey and parentpassword properties are set,
            // if set use those values, otherwise default them to "XXX"
        	//
        	if (parentKey == null) {
        		parentKey = "XXX"; // Replace "XXX" with clients parent key
        	}
        	if (parentPassword == null) {
        		parentPassword = "XXX"; // Replace "XXX" with clients parent password
        	}
        	parentCredential = new WebAuthenticationCredential();
        	parentCredential.setKey(parentKey);
        	parentCredential.setPassword(parentPassword);
        }
		return new WebAuthenticationDetail(parentCredential, userCredential);
	}
	
	private static void printNotifications(Notification[] notifications) {
		System.out.println("Notifications:");
		if (notifications == null || notifications.length == 0) {
			System.out.println("  No notifications returned");
		}
		for (int i=0; i < notifications.length; i++){
			Notification n = notifications[i];
			System.out.print("  Notification no. " + i + ": ");
			if (n == null) {
				System.out.println("null");
				continue;
			} else {
				System.out.println("");
			}
			NotificationSeverityType nst = n.getSeverity();

			System.out.println("    Severity: " + (nst == null ? "null" : nst.getValue()));
			System.out.println("    Code: " + n.getCode());
			System.out.println("    Message: " + n.getMessage());
			System.out.println("    Source: " + n.getSource());
		}
	}
	
	private static boolean isResponseOk(NotificationSeverityType notificationSeverityType) {
		if (notificationSeverityType == null) {
			return false;
		}
		if (notificationSeverityType.equals(NotificationSeverityType.WARNING) ||
			notificationSeverityType.equals(NotificationSeverityType.NOTE)    ||
			notificationSeverityType.equals(NotificationSeverityType.SUCCESS)) {
			return true;
		}
 		return false;
	}
	
	private static void print(String msg, Object obj) {
		if (msg == null || obj == null) {
			return;
		}
		System.out.println(msg + ": " + obj.toString());
	}
	
	private static void printMoney(String msg, Money money) {
		if (msg == null || money == null) {
			return;
		}
		System.out.println(msg + ": " + money.getAmount() + " " + money.getCurrency());
	}
	
	private static void printWeight(String msg, Weight weight) {
		if (msg == null || weight == null) {
			return;
		}
		System.out.println(msg + ": " + weight.getValue() + " " + weight.getUnits());
	}

	private static void updateEndPoint(RateServiceLocator serviceLocator) throws Exception {
		String endPoint = code.getValue("fedex_end_point");
		if (endPoint != null) {
			serviceLocator.setRateServicePortEndpointAddress(endPoint);
		}
	}
	
}
