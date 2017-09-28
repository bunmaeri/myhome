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
                        <div class="fieldset row">
					        <ul class="form-list col-md-11">
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
					                <div class="field">
					                    <label for="telephone" class="required"><em>*</em> 전화번호: <span style="color:red">국가번호를 입력하지 마십시요!</span></label>
					                    <div class="input-box">
					                        <input type="text" id="telephone" name="telephone" placeholder="예) 010-1234-5678" value="" title="Telephone" class="input-text required-entry" />
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
	var customer_name = $('#customer_name').val();
	if(customer_name=="") {
        alert('이름을 입력해주십시요!');
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
    if(telephone.length==0) {
        alert('전화번호를 입력해주십시요!');
        $('#telephone').focus();
        return;
    }
    
    if($('input[name=join_path_id]:checked').size()==0) {
        alert("가입경로를 선택해 주세요!");
        $("#join_path_id10").focus();
        return;
    }
    
    var password = $('#password').val();
    if(password=="") {
        alert('비밀번호를 입력해주십시요!');
        $('#password').focus();
        return;
    }
    var confirmation = $('#confirmation').val();
    if(confirmation=="") {
        alert('비밀번호 확인을 입력해주십시요!');
        $('#confirmation').focus();
        return;
    }
    if(password!=confirmation) {
        alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        $('#confirmation').val('');
        $('#confirmation').focus();
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
            	$('.form-buttons').after('<ul class="messages"><li class="error-msg"><ul><li><span>'+ json.Message.error +'</span></li></ul></li></ul>');
            	
                if (json.Message.error_customer_name) {
                    $('#customer_name').addClass('validation-failed');
                    $('input[name=\'customer_name\']').after('<div class="validation-advice"> ' + json.Message.error_customer_name + '</div>');
                }
                if (json.Message.error_email) {
                    $('#email').addClass('validation-failed');
                    $('input[name="email"]').after('<div class="validation-advice"> ' + json.Message.error_email + '</div>');
                }
                if (json.Message.error_telephone) {
                    $('#telephone').addClass('validation-failed');
                    $('input[name="telephone"]').after('<div class="validation-advice"> ' + json.Message.error_telephone + '</div>');
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

//--></script>
<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>