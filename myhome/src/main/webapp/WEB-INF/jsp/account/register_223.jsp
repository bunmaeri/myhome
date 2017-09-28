<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>

<div class="banner banner__category">
    <div class="container-fluid">
        <div class="vertical-align">
            <header class="page-title">
                <h1>회원 정보</h1>
            </header>
        </div>
    </div>
</div>

<div id="global-messages" class="container-fluid"></div>
<div class="main padding-top50" role="main">
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-9">
                <div class="my-account">
                    <form action="/register/save.dr" method="post" id="form-validate">
					    <h5><a class="button button-white button-small" href="/register.dr?country_id=113"><img src="/image/flag-kr.png" title="한국어" style="width:20px;height:auto;"> 한국 주소로 가입하기</a></h5>
					    <p class="grey-block">We Do Not Ship to PO Boxes</p>
					    <div class="fieldset row">
					        <ul class="form-list col-md-8">
					           <li>
                                    <label for="address_alias" class="required">Alias Address (Optional)</label>
                                    <div class="input-box">
                                        <input type="text" id="address_alias" name="address_alias" placeholder="Alias Address" value="${map.address_alias}" maxlength="40" class="input-text required-entry"   />
                                    </div>
                                </li>
					            <li>
					               <label for="firstname" class="required"><em>*</em> First Name</label>
								    <div class="input-box">
								        <input type="text" id="firstname" name="firstname" placeholder="First Name" value="${map.firstname}" maxlength="32" class="input-text required-entry"   />
								    </div>
								</li>
								<li>
                                   <label for="lastname" class="required"><em>*</em> Last Name</label>
                                    <div class="input-box">
                                        <input type="text" id="lastname" name="lastname" placeholder="Last Name" value="${map.lastname}" maxlength="32" class="input-text required-entry"   />
                                    </div>
                                </li>
							    <li>
							        <label for="company" class="required">Company (Optional)</label>
							        <div class="input-box">
							            <input type="text" id="company" name="company" placeholder="Company" value="${map.company}" maxlength="40" class="input-text required-entry"   />
							        </div>
							    </li>
					            <li>
					                <div class="field">
					                    <label for="telephone" class="required"><em>*</em> Telephone</label>
					                    <div class="input-box">
					                        <input placeholder="Telephone (555-555-5555)" type="text" name="telephone" value="${map.telephone}" title="Telephone" class="input-text required-entry" id="telephone" />
					                    </div>
					                </div>
					            </li>
				                <li>
                                    <div class="field">
                                        <label for="address_1" class="required"><em>*</em> Address</label>
                                        <div class="input-box">
                                            <input type="text" placeholder="Address" name="address_1" value="${map.address_1}"  id="address_1" class="input-text required-entry" />
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="field">
                                        <label for="address_2">Street Address 2</label>
                                        <div class="input-box">
                                            <input type="text" placeholder="Street Address 2" name="address_2" value="${map.address_2}"  id="address_2" class="input-text" />
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="field">
                                        <label for="city" class="required"><em>*</em> City</label>
                                        <div class="input-box">
                                            <input type="text" placeholder="City" name="city" value="${map.city}"  id="city" class="input-text required-entry" />
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="field">
                                        <label for="zone_id" class="required"><em>*</em> State / Province</label>
                                        <div class="input-box">
                                            <select name="zone_id" id="zone_id" class="validate-select styled-select validation-passed">
                                                <option value="">Select a State / Province</option>
                                            <c:forEach items="${list}" var="item">
                                                <option value="${item.zone_id}" <c:if test="${item.zone_id==map.zone_id}">selected</c:if>>${item.name}</option>
                                            </c:forEach>
                                            </select>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="field">
                                        <label for="postcode" class="required"><em>*</em> Zip/Postal Code</label>
                                        <div class="input-box">
                                            <input type="text" placeholder="Zip/Postal Code" name="postcode" value="${map.postcode}"  id="postcode" class="input-text required-entry" />
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
					    <div class="buttons-set form-buttons">
					        <button type="button" id="button_submit" form="form-validate" class="button button-default" title="Register"><span>REGISTER</span></button>
					    </div>
					    <input type="hidden" name="country_id" id="country_id" value="${country_id}">
					</form>
			     </div>
			 </div>
        </div>
    </div>
</div>
<script src="http://dmaps.daum.net/map_js_init/postcode.v2.js"></script>
<script src="/js/daum_postcode.js"></script>

<script type="text/javascript"><!--
$('#button_submit').on('click', function() {
	if($('#default_shipping').is(":checked")) {
		$('#default_shipping').val('1');
	} else {
		$('#default_shipping').val('0');
	}
	
    $.ajax({
        url: '/register/save.dr',
        type: 'post',
        data: $('#form-validate input, #form-validate select'),
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
                location = "/account/address.dr";
            }
            if(json.Message.error) {
                if (json.Message.error_firstname) {
                    $('#firstname').addClass('validation-failed');
                    $('input[name=\'firstname\']').after('<div class="validation-advice"> ' + json.Message.error_firstname + '</div>');
                }
                if (json.Message.error_lastname) {
                    $('#lastname').addClass('validation-failed');
                    $('input[name=\'lastname\']').after('<div class="validation-advice"> ' + json.Message.error_lastname + '</div>');
                }
                if (json.Message.error_telephone) {
                    $('#telephone').addClass('validation-failed');
                    $('input[name="telephone"]').after('<div class="validation-advice"> ' + json.Message.error_telephone + '</div>');
                }
                if (json.Message.error_address_1) {
                    $('#address_1').addClass('validation-failed');
                    $('input[name=\'address_1\']').after('<div class="validation-advice"> ' + json.Message.error_address_1 + '</div>');
                }
                if (json.Message.error_city) {
                    $('#city').addClass('validation-failed');
                    $('input[name=\'city\']').after('<div class="validation-advice"> ' + json.Message.error_city + '</div>');
                }
                if (json.Message.error_zone_id) {
                    $('#zone_id').addClass('validation-failed');
                    $('input[name=\'zone_id\']').after('<div class="validation-advice"> ' + json.Message.error_zone_id + '</div>');
                }
                if (json.Message.error_postcode) {
                    $('#postcode').addClass('validation-failed');
                    $('input[name=\'postcode\']').after('<div class="validation-advice"> ' + json.Message.error_postcode + '</div>');
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