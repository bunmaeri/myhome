<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>

<div class="banner banner__category">
    <div class="container-fluid">
        <div class="vertical-align">
            <header class="page-title">
                <h1>주소 추가</h1>
            </header>
        </div>
    </div>
</div>

<div id="global-messages" class="container-fluid"></div>
<div class="main padding-top50" role="main">
    <div class="container-fluid padding-left40">
        <div class="row">
            <div class="col-md-9" style="padding-left:0px;padding-right:0px;">
                <div class="my-account">
                    <form action="/account/address/add.dr" method="post" id="form-validate">
                        <%-- <c:if test="${map.address_id eq null || map.address_id==''}">
					    <h5><a class="button button-white button-small" href="/checkout/shipping/address/new/223.dr"><img src="/image/flag-us.png" title="English" style="width:20px;height:auto;"> 미국 주소 추가</a></h5>
					    </c:if> --%>
					    <div class="fieldset row">
					        <ul class="form-list col-md-8" style="padding-left: 0;padding-right:0;">
					           <li>
                                    <label for="address_alias" class="required">주소 별명(옵션)</label>
                                    <div class="input-box">
                                        <input type="text" id="address_alias" name="address_alias" placeholder="주소의 별명을 지어주세요!" value="${map.address_alias}" maxlength="40" class="input-text required-entry"   />
                                    </div>
                                </li>
					            <li>
					               <label for="customer_name" class="required"><em>*</em> 이름</label>
								    <div class="input-box">
								        <input type="text" id="customer_name" name="customer_name" placeholder="예) 홍길동" value="${map.customer_name}" maxlength="32" class="input-text required-entry"   />
								    </div>
								</li>
							    <li>
							        <label for="company" class="required">회사 이름(옵션)</label>
							        <div class="input-box">
							            <input type="text" id="company" name="company" placeholder="회사이름을 입력하세요." value="${map.company}" maxlength="40" class="input-text required-entry"   />
							        </div>
							    </li>
					            <li>
					                <div class="field">
					                    <label for="telephone" class="required"><em>*</em> 전화번호: <span style="color:red">국가번호를 입력하지 마십시요!</span></label>
					                    <div class="input-box">
					                        <input placeholder="예) 010-1234-5678" type="text" name="telephone" value="${map.telephone}" title="Telephone" class="input-text required-entry" id="telephone" />
					                    </div>
					                </div>
					            </li>
					            <li>
					                <div class="field">
					                    <label for="fax" class="required"><em>*</em> 개인통관고유부호: <span style="color:red">관세청에서 발급받은 번호를 입력하십시요!</span>&nbsp;<a href="/information/requisition.dr" target="_blank">통관고유부호 발급안내</a></label>
					                    <div class="input-box">
					                        <input type="text" placeholder="예) P123456789012 이름과 일치해야 합니다." name="requisition_id" id="requisition_id" value="${map.requisition_id}" class="input-text required-entry" />
					                    </div>
					                </div>
					            </li>
                                <li>
                                    <label for="postcode" class="required"><em>*</em> 우편번호: <span style="color:red">정확한 주소 입력을 위해서 반드시 우편번호 찾기를 이용해주십시요!</span></label>
                                    <div class="row">
	                                    <div class="col-md-4" style="padding-left:10px;padding-right:0;">
	                                       <input type="button" class="button button-middle" onclick="sample6_execDaumPostcode()" value="우편번호 찾기">
	                                    </div>
										<div class="col-md-7 col-md-push-1 input-box" style="padding-left:0;padding-right:10px;">
										    <input type="text" id="postcode" name="postcode" value="${map.postcode}" placeholder="예) 04515" class="input-text required-entry" readonly/>
									    </div>
								    </div>
								</li>
				                <li>
                                    <div class="field">
                                        <label for="address_1" class="required"><em>*</em> 주소: <span style="color:red">반드시 한글로, 한국식으로 입력하여 주십시요!</span></label>
                                        <div class="input-box">
                                            <input type="text" placeholder="한글 주소를 입력하세요. (예: 경기 부천시 가로공원로 100-1)" name="address_1" value="${map.address_1}"  id="address_1" class="input-text required-entry" />
                                            <input type="text" placeholder="상세주소를 입력하세요. (예: 101동 202호)" name="address_2" value="${map.address_2}"  id="address_2" class="input-text required-entry" style="margin-top: 5px;"/>
                                        </div>
                                    </div>
                                </li>
                                <li class="control">
                                    <div class="default-shipping-container">
	                                    <p><strong>기본 배송 주소</strong></p>
				                        <div class="custom-checkbox">
				                            <input type="checkbox" id="default_shipping" name="default_shipping" value="1" class="checkbox" checked/>
				                            <label for="default_shipping">기본 배송 주소로 설정합니다.</label>
				                        </div>
				                    </div>
	                            </li>
                            </ul>
                        </div>
					    <div class="buttons-set form-buttons">
					        <button type="button" id="button_submit" form="form-validate" class="button button-default" title="Save Address"><span><span>저장</span></span></button>
					        <a class="button button-white button-default" href="/checkout/shipping/address.dr">주소록으로 이동</a>
					    </div>
					    <input type="hidden" name="address_id" id="address_id" value="${map.address_id}">
					    <input type="hidden" name="country_id" id="country_id" value="${country_id}">
					    <input type="hidden" name="zone_id" id="zone_id" value="${zone_id}">
					    <input type="hidden" name="is_daum_post" id="is_daum_post" value="${is_daum_post}">
					</form>
			     </div>
			 </div>
        </div>
    </div>
</div>
<script src="https://ssl.daumcdn.net/dmaps/map_js_init/postcode.v2.js"></script>
<script src="/js/daum_postcode.js"></script>

<script type="text/javascript"><!--
$('#button_submit').on('click', function() {
	if($('#default_shipping').is(":checked")) {
		$('#default_shipping').val('1');
	} else {
		$('#default_shipping').val('0');
	}
	
    $.ajax({
        url: '/checkout/shipping/address/add.dr',
        type: 'post',
        data: $('#form-validate input'),
        dataType: 'json',
        beforeSend: function() {
            $('#button_submit').prop('disabled', true);
        },
        complete: function() {
            $('#button_submit').prop('disabled', false).button('reset');
        },
        success: function(json) {
            $('input').removeClass('validation-failed');
            $('.validation-advice').remove();
        
            if (json.Message.success) {
            	$('#page-title').after('<ul class="messages"><li class="success-msg"><ul><li><span>'+ json.Message.success +'</span></li></ul></li></ul>');
                location = "/checkout/shipping/address.dr";
            }
            if(json.Message.error) {
                if (json.Message.error_customer_name) {
                    $('#customer_name').addClass('validation-failed');
                    $('input[name=\'customer_name\']').after('<div class="validation-advice"> ' + json.Message.error_customer_name + '</div>');
                }
                if (json.Message.error_telephone) {
                    $('#telephone').addClass('validation-failed');
                    $('input[name="telephone"]').after('<div class="validation-advice"> ' + json.Message.error_telephone + '</div>');
                }
                if (json.Message.error_requisition_id) {
                    $('#requisition_id').addClass('validation-failed');
                    $('input[name=\'requisition_id\']').after('<div class="validation-advice"> ' + json.Message.error_requisition_id + '</div>');
                }
                if (json.Message.error_is_daum_post) {
                    $('#postcode').addClass('validation-failed');
                    $('input[name=\'postcode\']').after('<div class="validation-advice"> ' + json.Message.error_is_daum_post + '</div>');
                }
                if (json.Message.error_postcode) {
                    $('#postcode').addClass('validation-failed');
                    $('input[name=\'postcode\']').after('<div class="validation-advice"> ' + json.Message.error_postcode + '</div>');
                }
                if (json.Message.error_address_1) {
                    $('#address_1').addClass('validation-failed');
                    $('input[name=\'address_1\']').after('<div class="validation-advice"> ' + json.Message.error_address_1 + '</div>');
                }
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
        }
    });
});
//--></script>
<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>