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
            <aside class="col-md-2 sidebar padding-left40">
                <div class="block block-account">
                    <div class="block-title hidden-md">
                        <strong><span>회원 정보</span></strong>
                    </div>
                    <div class="block-content">
                        <ul class="hidden-md">
                            <!-- <li><a href="/account/dashboard.dr">회원정보 현황</a></li> -->
                            <li class="current"><strong>회원정보 수정</strong></li>
                            <li><a href="/account/address.dr">주소록</a></li>
                            <li><a href="/account/order_history.dr">주문내역</a></li>
                            <li><a href="/account/wishlist.dr">위시리스트</a></li>
                            <li><a href="/account/reward.dr">적립포인트</a></li>
                            <li class="last"><a href="/logout.dr">로그아웃</a></li>
                        </ul>
                        <div class="m-accordion visible-md ">
                            <div class="m-header">
                                회원 정보 메뉴
                            </div>
                            <div class="m-content">
                                <!-- <div class="item"><a href="/account/dashboard.dr">회원정보 현황</a></div> -->
                                <div class="item"><a href="/account/address.dr">주소록</a></div>
                                <div class="item"><a href="/account/order_history.dr">주문내역</a></div>
                                <div class="item"><a href="/account/wishlist.dr">위시리스트</a></div>
                                <div class="item"><a href="/account/reward.dr">적립포인트</a></div>
                                <div class="item"><a href="/logout.dr">로그아웃</a></div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            <div class="col-md-9 col-md-push-1">
                <div class="my-account">
                    <div class="page-title" id="page-title">
                        <h2>회원정보 수정</h2>
                    </div>
                    <form class="my-account-form" action="/account/edit/save.dr" method="post" id="form-validate">
                    <div class="fieldset">
                        <div class="fieldset-inner row">
                            <input name="form_key" type="hidden" value="pw9r3p0WpRMX5AKF" />
                            <ul class="form-list col-md-8">
                                <li>
                                    <label for="customer_name" class="required sr-only"><em>*</em>이름</label>
                                    <div class="input-box">
                                        <input type="text" id="customer_name" name="customer_name" value="${map.customer_name}" placeholder="이름" maxlength="64" class="input-text validate-length maximum-length-20 required-entryvalidate-length required-entry"/>
                                    </div>
                                </li>
                                <li>
                                    <label for="email" class="sr-only required"><em>*</em>이메일</label>
                                    <div class="input-box">
                                        <input type="text" name="email" id="email" value="${map.email}" title="이메일" maxlength="96" class="input-text required-entry validate-email" placeholder="이메일" />
                                    </div>
                                </li>
                                <li>
                                    <label for="firstname" class="sr-only">전화번호</label>
                                    <div class="input-box">
                                        <input type="text" id="telephone" placeholder="전화번호" name="telephone" value="${map.telephone}" maxlength="32" class="input-text required-entry"/>
                                    </div>
                                </li>
                                <li class="control">
                                    <div class="input-box custom-checkbox">
                                        <input type="checkbox" name="change_password" id="change_password" value="1" onclick="setPasswordForm(this.checked)" title="Change Password" class="checkbox" />
                                        <label for="change_password">비밀번호 변경</label>
                                    </div>
                                </li>
                            </ul>
                        </div>
    
                        <div class="fieldset-inner change-password-container" style="display:none;">
                            <div class="row">
                                <ul class="form-list col-md-8">
                                    <li>
                                        <label class="sr-only" for="password">비밀번호</label>
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
                            </div>
                        </div>
                        <div class="buttons-set form-buttons">
                            <button type=button id="button_submit" form="form-validate" class="button button-default" title="Save Account Information"><span><span>저장</span></span></button>
                        </div>
                    </div>
                    <input type="hidden" name="last_email" id="last_email" value="${map.email}">
                    </form>
<script type="text/javascript">
//<![CDATA[
    var dataForm = new VarienForm('form-validate', true);
    function setPasswordForm(arg){
        if(arg){
            jQuery('.change-password-container').show();
            //$('current_password').addClassName('required-entry');
            $('password').addClassName('required-entry');
            $('confirmation').addClassName('required-entry');

        }else{
            jQuery('.change-password-container').hide();
            //$('current_password').removeClassName('required-entry');
            $('password').removeClassName('required-entry');
            $('confirmation').removeClassName('required-entry');
        }
    }
    //]]>
</script>
                </div>
            </div>
        </div>
    </div>
</div>

<%@ include file="/WEB-INF/include/footer.jspf" %>

<script type="text/javascript"><!--
$('#button_submit').on('click', function() {
    $.ajax({
        url: '/account/edit/save.dr',
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
                $('#password').val('');
                $('#confirmation').val('');
            }
            if(json.Message.error) {
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
                    $('input[name=\'telephone\']').after('<div class="validation-advice"> ' + json.Message.error_telephone + '</div>');
                }
                if (json.Message.error_password) {
                    $('#password').addClass('validation-failed');
                    $('input[name=\'password\']').after('<div class="validation-advice"> ' + json.Message.error_password + '</div>');
                }
                if (json.Message.error_confirmation) {
                    $('#confirmation').addClass('validation-failed');
                    $('input[name=\'confirmation\']').after('<div class="validation-advice"> ' + json.Message.error_confirmation + '</div>');
                }
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
        }
    });
});
//--></script>
<%@ include file="/WEB-INF/include/end.jspf" %>