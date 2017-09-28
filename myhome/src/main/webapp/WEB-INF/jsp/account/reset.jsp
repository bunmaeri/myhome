<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>
<div class="main" role="main">
    <section class="atr-registration atr-login">
        <div class="banner banner__category">
            <div class="container-fluid">
                <div class="vertical-align">
                    <header class="page-title">
                        <h1>비밀번호 설정</h1>
                    </header>
                    <div class="category-description std white">
                        사용하실 새 비밀번호를 입력해 주십시오.
                    </div>
                </div>
            </div>
        </div>
    
        <div class="container-fluid padding-left40 padding-top50">
            <div class="row">
                <div class="col-md-6">
                    ${ctag:getErrorString(errorMsg)}
                    <form action="/forgotpassword/get.dr" method="post" id="form-validate">
                        <div class="fieldset">
                            <ul class="form-list">
                                <li>
                                    <label for="password" class="sr-only">비밀번호</label>
                                    <div class="input-box">
                                        <input placeholder="비밀번호" type="password" class="input-text validate-password" name="password" id="password" />
                                    </div>
                                </li>
                                <li>
                                    <label class="sr-only" for="confirmation">비밀번호 확인</label>
                                    <div class="input-box">
                                        <input placeholder="비밀번호 확인" type="password" class="input-text validate-cpassword" name="confirmation" id="confirmation" />
                                    </div>
                                </li>
                            </ul>
                            <div class="buttons-set form-buttons">
                                <button type="button" id="button_submit" class="button button-default">저장</button>
                            </div>
                        </div>
                        <input type="hidden" name="code" value="${code}"/>
                    </form>
                </div>
            </div>
        </div>
    </section>
</div>
<script type="text/javascript"><!--
$('#button_submit').on('click', function() {
    $.ajax({
        url: '/reset/save.dr',
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
                location = "/login.dr";
            }
            if(json.Message.error) {
                if (json.Message.error_password) {
                    $('#password').addClass('validation-failed');
                    $('input[name=\'password\']').after('<div class="validation-advice"> ' + json.Message.error_password + '</div>');
                    $('#password').val('');
                }
                if (json.Message.error_confirmation) {
                    $('#confirmation').addClass('validation-failed');
                    $('input[name=\'confirmation\']').after('<div class="validation-advice"> ' + json.Message.error_confirmation + '</div>');
                    $('#confirmation').val('');
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