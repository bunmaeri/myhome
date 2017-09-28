package myhome.checkout.utils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

import myhome.common.util.ObjectUtils;
import net.authorize.Environment;
import net.authorize.api.contract.v1.ANetApiResponse;
import net.authorize.api.contract.v1.CreateTransactionRequest;
import net.authorize.api.contract.v1.CreateTransactionResponse;
import net.authorize.api.contract.v1.CreditCardType;
import net.authorize.api.contract.v1.CustomerAddressType;
import net.authorize.api.contract.v1.CustomerDataType;
import net.authorize.api.contract.v1.MerchantAuthenticationType;
import net.authorize.api.contract.v1.MessageTypeEnum;
import net.authorize.api.contract.v1.NameAndAddressType;
import net.authorize.api.contract.v1.OrderType;
import net.authorize.api.contract.v1.PaymentType;
import net.authorize.api.contract.v1.SolutionType;
import net.authorize.api.contract.v1.TransactionRequestType;
import net.authorize.api.contract.v1.TransactionResponse;
import net.authorize.api.contract.v1.TransactionTypeEnum;
import net.authorize.api.contract.v1.TransRetailInfoType;
import net.authorize.api.controller.CreateTransactionController;
import net.authorize.api.controller.base.ApiOperationBase;

public class ChargeCreditCard {

    public static Map<String,String> run(Map<String,Object> map) {
    	String apiLoginId = ObjectUtils.null2void(map.get("apiLoginId"));
    	String transactionKey = ObjectUtils.null2void(map.get("transactionKey"));
    	String amount = ObjectUtils.null2void(map.get("amount"));
    	String cc_number = ObjectUtils.null2void(map.get("cc_number"));
    	String cc_expire_date_month = ObjectUtils.null2void(map.get("cc_expire_date_month"));
    	String cc_expire_date_year = ObjectUtils.null2void(map.get("cc_expire_date_year"));
    	String cc_cvv2 = ObjectUtils.null2void(map.get("cc_cvv2"));
    	
    	String invoiceNumber = ObjectUtils.null2void(map.get("invoiceNumber"));
    	String description = ObjectUtils.null2void(map.get("description"));
    	
    	String email = ObjectUtils.null2void(map.get("email"));
    	String customerIp = ObjectUtils.null2void(map.get("customerIp"));
    	
    	String paymentFirstName = ObjectUtils.null2void(map.get("paymentFirstName"));
    	String paymentLastName = ObjectUtils.null2void(map.get("paymentLastName"));
    	String paymentCompany = ObjectUtils.null2void(map.get("paymentCompany"));
    	String paymentAddress = ObjectUtils.null2void(map.get("paymentAddress"));
    	String paymentCity = ObjectUtils.null2void(map.get("paymentCity"));
    	String paymentState = ObjectUtils.null2void(map.get("paymentState"));
    	String paymentZip = ObjectUtils.null2void(map.get("paymentZip"));
    	String paymentCountry = ObjectUtils.null2void(map.get("paymentCountry"));
    	String paymentPhoneNumber = ObjectUtils.null2void(map.get("paymentPhoneNumber"));
    	
    	String shippingFirstName = ObjectUtils.null2void(map.get("shippingFirstName"));
    	String shippingLastName = ObjectUtils.null2void(map.get("shippingLastName"));
    	String shippingCompany = ObjectUtils.null2void(map.get("shippingCompany"));
    	String shippingAddress = ObjectUtils.null2void(map.get("shippingAddress"));
    	String shippingCity = ObjectUtils.null2void(map.get("shippingCity"));
    	String shippingState = ObjectUtils.null2void(map.get("shippingState"));
    	String shippingZip = ObjectUtils.null2void(map.get("shippingZip"));
    	String shippingCountry = ObjectUtils.null2void(map.get("shippingCountry"));
    	
        //Common code to set for all requests
        ApiOperationBase.setEnvironment(Environment.PRODUCTION);

        MerchantAuthenticationType merchantAuthenticationType  = new MerchantAuthenticationType() ;
        merchantAuthenticationType.setName(apiLoginId);
        merchantAuthenticationType.setTransactionKey(transactionKey);
        ApiOperationBase.setMerchantAuthentication(merchantAuthenticationType);

        // Populate the payment data
        PaymentType paymentType = new PaymentType();
        CreditCardType creditCard = new CreditCardType();
        creditCard.setCardNumber(cc_number);
        creditCard.setExpirationDate(cc_expire_date_month+cc_expire_date_year);
        creditCard.setCardCode(cc_cvv2);
        paymentType.setCreditCard(creditCard);
        
//        PaymentType paymentType = new PaymentType();
//        paymentType.set
        
        SolutionType solution = new SolutionType();
        solution.setId("A1000015");
        
        OrderType order = new OrderType();
        order.setInvoiceNumber(invoiceNumber);
        order.setDescription(description);
        
        CustomerDataType customer = new CustomerDataType();
        customer.setEmail(email);
        
        CustomerAddressType billTo = new CustomerAddressType();
        billTo.setFirstName(paymentFirstName);
        billTo.setLastName(paymentLastName);
        billTo.setCompany(paymentCompany);
        billTo.setAddress(paymentAddress);
        billTo.setCity(paymentCity);
        billTo.setState(paymentState);
        billTo.setZip(paymentZip);
        billTo.setCountry(paymentCountry);
        billTo.setPhoneNumber(paymentPhoneNumber);
        
        NameAndAddressType shipTo = new NameAndAddressType();
        shipTo.setFirstName(shippingFirstName);
        shipTo.setLastName(shippingLastName);
        shipTo.setCompany(shippingCompany);
        shipTo.setAddress(shippingAddress);
        shipTo.setCity(shippingCity);
        shipTo.setState(shippingState);
        shipTo.setZip(shippingZip);
        shipTo.setCountry(shippingCountry);
        
        TransRetailInfoType retail = new TransRetailInfoType();
        retail.setMarketType("0"); // ecommerce
        
        // Create the payment transaction request
        TransactionRequestType txnRequest = new TransactionRequestType();
        txnRequest.setTransactionType(TransactionTypeEnum.AUTH_CAPTURE_TRANSACTION.value());
        txnRequest.setPayment(paymentType);
        txnRequest.setAmount(new BigDecimal(amount).setScale(2, RoundingMode.CEILING));
        txnRequest.setSolution(solution);
        txnRequest.setOrder(order);
        txnRequest.setCustomer(customer);
        txnRequest.setCustomerIP(customerIp);
        txnRequest.setBillTo(billTo);
        txnRequest.setShipTo(shipTo);
        txnRequest.setRetail(retail);
        
        // Make the API Request
        CreateTransactionRequest apiRequest = new CreateTransactionRequest();
        apiRequest.setTransactionRequest(txnRequest);
        CreateTransactionController controller = new CreateTransactionController(apiRequest);
        controller.execute();


        Map<String,String> rtnMap = new HashMap<String,String>();
        CreateTransactionResponse response = controller.getApiResponse();

        if (response!=null) {
        	// If API Response is ok, go ahead and check the transaction response
        	if (response.getMessages().getResultCode() == MessageTypeEnum.OK) {
        		TransactionResponse result = response.getTransactionResponse();
        		if(result.getMessages() != null){
        			rtnMap.put("result", "success");
        			rtnMap.put("transId", result.getTransId());
        			rtnMap.put("authCode", result.getAuthCode());
        			rtnMap.put("responseCode", result.getResponseCode());
        			System.out.println("Successfully created transaction with Transaction ID: " + result.getTransId());
        			System.out.println("Response Code: " + result.getResponseCode());
        			System.out.println("Message Code: " + result.getMessages().getMessage().get(0).getCode());
        			System.out.println("Description: " + result.getMessages().getMessage().get(0).getDescription());
        			System.out.println("Auth Code: " + result.getAuthCode());
        		}
        		else {
        			System.out.println("OK-Failed Transaction.");
        			if(response.getTransactionResponse().getErrors() != null){
        				rtnMap.put("result", "faild");
            			rtnMap.put("errorCode", response.getTransactionResponse().getErrors().getError().get(0).getErrorCode());
            			rtnMap.put("errorMessage", response.getTransactionResponse().getErrors().getError().get(0).getErrorText());
        				System.out.println("Error Code: " + response.getTransactionResponse().getErrors().getError().get(0).getErrorCode());
        				System.out.println("Error message: " + response.getTransactionResponse().getErrors().getError().get(0).getErrorText());
        			}
        		}
        	}
        	else {
        		System.out.println("Failed Transaction.");
        		if(response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null){
        			rtnMap.put("result", "faild");
        			rtnMap.put("errorCode", response.getTransactionResponse().getErrors().getError().get(0).getErrorCode());
        			rtnMap.put("errorMessage", response.getTransactionResponse().getErrors().getError().get(0).getErrorText());
        			System.out.println("Error Code: " + response.getTransactionResponse().getErrors().getError().get(0).getErrorCode());
        			System.out.println("Error message: " + response.getTransactionResponse().getErrors().getError().get(0).getErrorText());
        		}
        		else {
        			rtnMap.put("result", "faild");
        			rtnMap.put("errorCode", response.getMessages().getMessage().get(0).getCode());
        			rtnMap.put("errorMessage", response.getMessages().getMessage().get(0).getText());
        			System.out.println("Error Code: " + response.getMessages().getMessage().get(0).getCode());
        			System.out.println("Error message: " + response.getMessages().getMessage().get(0).getText());
        		}
        	}
        }
        else {
        	rtnMap.put("result", "faild");
			rtnMap.put("errorCode", "-1");
			rtnMap.put("errorMessage", "Null Response");
        	System.out.println("Null Response.");
        }
        
		return rtnMap;
    }
}