<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>

<div class="banner banner__category">
    <div class="container-fluid">
        <div class="vertical-align">
            <header class="page-title">
                <h1>회원 가입</h1>
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
                        <h5><a class="button button-white button-small" href="/register.dr?country_id=223"><img src="/image/flag-us.png" title="English" style="width:20px;height:auto;"> 미국 주소로 가입하기</a></h5>
					    <div class="fieldset row">
					        <ul class="form-list col-md-11">
					           <li>
                                    <label for="address_alias" class="required">주소 별명(옵션)</label>
                                    <div class="input-box">
                                        <input type="text" id="address_alias" name="address_alias" placeholder="주소의 별명을 지어주세요!" value="" maxlength="40" class="input-text required-entry"   />
                                    </div>
                                </li>
					            <li>
					               <label for="customer_name" class="required"><em>*</em> 이름</label>
								    <div class="input-box">
								        <input type="text" id="customer_name" name="customer_name" placeholder="예) 홍길동" value="" maxlength="32" class="input-text required-entry"   />
								    </div>
								</li>
								<li>
                                    <label for="email" class="required"><em>*</em> 이메일</label>
                                    <div class="input-box">
                                        <input type="text" name="email" id="email" value="" title="이메일" maxlength="96" class="input-text required-entry validate-email" placeholder="이메일" />
                                    </div>
                                </li>
							    <li>
							        <label for="company" class="required">회사 이름(옵션)</label>
							        <div class="input-box">
							            <input type="text" id="company" name="company" placeholder="회사이름을 입력하세요." value="" maxlength="40" class="input-text required-entry"   />
							        </div>
							    </li>
					            <li>
					                <div class="field">
					                    <label for="telephone" class="required"><em>*</em> 전화번호: <span style="color:red">국가번호를 입력하지 마십시요!</span></label>
					                    <div class="input-box">
					                        <input type="text" id="telephone" name="telephone" placeholder="예) 010-1234-5678" value="" title="Telephone" class="input-text required-entry" />
					                    </div>
					                </div>
					            </li>
					            <li>
					                <div class="field">
					                    <label for="fax" class="required"><em>*</em> 개인통관고유부호: <span style="color:red">관세청에서 발급받은 번호를 입력하십시요!</span>&nbsp;<a href="/information/requisition.dr" target="_blank">통관고유부호 발급안내</a></label>
					                    <div class="input-box">
					                        <input type="text" placeholder="예) P123456789012 이름과 일치해야 합니다." name="requisition_id" id="requisition_id" value="" class="input-text required-entry" />
					                    </div>
					                </div>
					            </li>
                                <li>
                                    <label for="postcode" class="required"><em>*</em> 우편번호: <span style="color:red">정확한 주소 입력을 위해서 반드시 우편번호 찾기를 이용해주십시요!</span></label>
                                    <div class="row">
										<div class="col-md-12 input-box" style="padding-left:10px;padding-right:10px;">
										    <input type="button" class="button button-small" onclick="sample6_execDaumPostcode()" value="우편번호 찾기">
										    <input type="text" id="postcode" name="postcode" value="" placeholder="예) 04515" class="input-text required-entry" style="display:inline;max-width:40%;" readonly/>
									    </div>
								    </div>
								</li>
				                <li>
                                    <div class="field">
                                        <label for="address_1" class="required"><em>*</em> 주소: <span style="color:red">반드시 한글로, 한국식으로 입력하여 주십시요!</span></label>
                                        <div class="input-box">
                                            <input type="text" placeholder="한글 주소를 입력하세요. (예: 경기 부천시 가로공원로 100-1)" name="address_1" value=""  id="address_1" class="input-text required-entry" />
                                            <input type="text" placeholder="상세주소를 입력하세요. (예: 101동 202호)" name="address_2" value=""  id="address_2" class="input-text required-entry" style="margin-top: 5px;"/>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <label class="" for="password"><em>*</em> 비밀번호</label>
                                    <div class="input-box">
                                        <input placeholder="비밀번호" type="password" class="input-text validate-password" name="password" id="password" />
                                    </div>
                                </li>
                                <li>
                                    <label class="" for="confirmation"><em>*</em> 비밀번호 확인</label>
                                    <div class="input-box">
                                        <input placeholder="비밀번호 확인" type="password" class="input-text validate-cpassword" name="confirmation" id="confirmation" />
                                    </div>
                                </li>
                                <li>
                                    <label class="" for="confirmation"><em>*</em> 가입경로</label>
                                    <c:forEach items="${customer_join_path}" var="item">
                                    <div class="custom-radio" style="margin-bottom:10px;width: 100%;">
			                            <input type="radio" id="join_path_id${item.join_path_id}" class="radio validation-passed" name="join_path_id" value="${item.join_path_id}">
			                            <label for="join_path_id${item.join_path_id}"><span class="">${item.join_path_name}</span></label>
			                            <c:if test="${item.join_path_id=='90'}">
			                            <input type="text" id="join_path_etc" name="join_path_etc" value="" placeholder="" class="input-text required-entry" style="display:inline;max-width:50%;"/>
			                            </c:if>
                                    </div><br/>
                                    </c:forEach>
                                </li>
                                <li>
                                    <label>
			                            <input type="checkbox" name="agree" id="agree" value="1">&nbsp;
			                            <a class="agree" href="/information/terms-of-use.dr" target="_blank"><b>이용약관</b></a> 및 
			                            <a class="agree" href="/information/return-policy.dr" target="_blank"><b>반품정책</b></a>을 읽고 동의합니다.
			                        </label>
                                </li>
                            </ul>
                        </div>
					    <div class="buttons-set form-buttons">
					        <button type="button" id="button_submit" form="form-validate" class="button button-default" title="Register"><span>회원가입</span></button>
					    </div>
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
	var customer_name = $('#customer_name').val();
	if(customer_name=="") {
        alert('이름을 입력해주십시요!');
        $('#customer_name').focus();
        return;
    }
	if(!chkFirstName(customer_name)) {
        $('#customer_name').focus();
        return;
    }
    
    var email = $('#email').val();
    if(email=="") {
        alert('이메일을 입력해주십시요!');
        $('#email').focus();
        return;
    }
    
    var telephone = onlyNumber($('#telephone').val());
    if(telephone.substr(0,1)!='0') {
        alert('한국내에서 사용하는 전화번호로 입력하십시요.\n잘못된 전화번호는 통관이 되지 않습니다.\n전화번호를 확인해주십시요!');
        $('#telephone').focus();
        return;
    }
    
    var requisition = $('#requisition_id').val();
    if(requisition=="") {
        alert('개인통관고유부호를 입력해주십시요!');
        $('#requisition_id').focus();
        return;
    }
    if(requisition.substr(0,1)!='P' || onlyNumber(requisition).length!=12) {
        alert('개인통관고유부호가 잘못되었습니다.\n잘못된 개인통관고유부호는 통관이 되지 않습니다.\n관세청에서 발급받은 개인통관고유부호를 확인해주십시요!');
        $('#requisition_id').focus();
        return;
    }
    
    var postcodeStr = $('#postcode').val();
    if(postcodeStr=="") {
        alert('우편번호를 입력해주십시요!');
        $('#postcode').focus();
        return;
    }
    var postcodeNum = onlyNumber(postcodeStr);
    if(postcodeStr.length!=postcodeNum.length) {
        alert("우편번호에는 숫자만 입력할 수 있습니다.");
        $('#postcode').focus();
        return;
    }
    if(postcodeNum.length!=5 && postcodeNum.length!=6) {
        alert("올바른 우편번호를 입력하셨습니까?\n우편번호찾기를 누르시면 더 정확한 주소를 입력할 수 있습니다.");
        $('#postcode').focus();
        return;
    }
    
    var address_1 = $('#address_1').val();
    if(address_1=="") {
        alert("정확한 주소를 입력해주세요!");
        $('#address_1').select();
        return;
    }
    
    if($('input[name=join_path_id]:checked').size()==0) {
        alert("가입경로를 선택해 주세요!");
        $("#join_path_id10").focus();
        return;
    }
    
    var v_join_path = $("input[name='join_path_id']:checked").val();
    if(v_join_path=="90") {
        var v_join_path_etc = $('#join_path_etc').val();
        if(v_join_path_etc.length==0) {
            alert("기타 가입경로를 입력해 주세요!");
            $("#join_path_etc").focus();
            return;
        }
    }
	
    if(!($("#agree").is(":checked"))){
        alert('이용약관 및 반품정책에 동의하지 않으셨습니다.');
        $("#agree").focus();
        return false;
    }
    if(!confirm("회원가입을 하시겠습니까?")) {
        return false;
    }
    $.ajax({
        url: '/register/save.dr',
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
                location = "/login.dr";
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
                if (json.Message.error_password) {
                    $('#password').addClass('validation-failed');
                    $('input[name=\'password\']').after('<div class="validation-advice"> ' + json.Message.error_password + '</div>');
                }
                if (json.Message.error_confirmation) {
                    $('#confirmation').addClass('validation-failed');
                    $('input[name=\'confirmation\']').after('<div class="validation-advice"> ' + json.Message.error_confirmation + '</div>');
                }
                if (json.Message.error_customer_join_path) {
                    //$('#confirmation').addClass('validation-failed');
                    $('input[name=\'join_path_etc\']').after('<div class="validation-advice"> ' + json.Message.error_customer_join_path + '</div>');
                }
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
        }
    });
});

function onlyNumber(str){
    var res;
    res = str.replace(/[^0-9]/g,"");
    return res+"";
}

function chkFirstName(str) {
    var regexp = /^[가-힣]+$/;
    if(!regexp.test(str)){
        if(confirm("이름은 띄어쓰기 없이 한글로만 입력하십시요.\n한국 시민권자가 아닌 경우에는 한글이 아니어도 괜찮습니다.\n입력한 이름을 그대로 사용하시겠습니까?")) {
            return true;
        }
        return false;
    }
    return true;
}
//--></script>
<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>