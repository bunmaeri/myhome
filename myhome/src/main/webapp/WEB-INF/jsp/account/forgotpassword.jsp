<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>
<div class="main" role="main">
    <section class="atr-registration atr-login">
        <div class="banner banner__category">
            <div class="container-fluid">
                <div class="vertical-align">
                    <header class="page-title">
                        <h1>비밀번호 찾기</h1>
                    </header>
                    <div class="category-description std white">
                        이메일을 입력하신 다음에 '비밀번호 받기' 버튼을 누르세요.<br/>'임시비밀번호'와 '비밀번호 재설정 링크'를 이메일로 받으실 수 있습니다.
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
                                    <label for="email_address" class="sr-only">Email Address</label>
                                    <div class="input-box">
                                        <input type="text" name="email" alt="email" id="email_address" class="input-text required-entry validate-email" value="" placeholder="이메일" />
                                    </div>
                                </li>
                            </ul>
                            <div class="buttons-set form-buttons">
                                <button type="submit" class="button button-default">비밀번호 받기</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>
</div>

<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>