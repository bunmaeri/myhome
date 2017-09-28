<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>  
<!-- < taglib prefix="ui" uri=" http://egovframework.gov/ctl/ui " > -->
<%@ taglib prefix="fmt" uri="http://java.sun.com/jstl/fmt_rt" %>
<%@ taglib prefix="ctag" uri="/WEB-INF/tlds/CustomTag.tld"%>

<jsp:useBean id="toDay" class="java.util.Date" />

<!doctype html>
<!--[if IE 8]><html lang="en" class="ie8"><![endif]-->
<!--[if gt IE 8]><!--><html lang="en"><!--<![endif]-->
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>My Home Doc</title>
<meta name="description" content="" />
<meta name="keywords" content="" />
<meta name="robots" content="NOINDEX,NOFOLLOW" />
<link rel="icon" href="/image/favicon.png" type="image/x-icon" />
<link rel="shortcut icon" href="/image/favicon.png" type="image/x-icon" />

<!-- <link rel="stylesheet" type="text/css" href="<c:url value='/css/information.css'/>?<fmt:formatDate value="${toDay}" pattern="yyyy-MM-dd HH:mm:ss" />" media="all" /> -->
<link rel="stylesheet" type="text/css" href="<c:url value='/css/main.css'/>?<fmt:formatDate value="${toDay}" pattern="yyyy-MM-dd HH:mm:ss" />" media="all" />
<c:forEach items="${css}" var="css">
<link rel="stylesheet" type="text/css" href="<c:url value='${css}'/>?<fmt:formatDate value="${toDay}" pattern="yyyy-MM-dd HH:mm:ss" />" media="all" />
</c:forEach>

<!-- <script type="text/javascript" src="<c:url value='/js/jquery-3.2.1.min.js'/>"></script> -->
<script type="text/javascript" src="<c:url value='/js/prototypejs.js'/>?<fmt:formatDate value="${toDay}" pattern="yyyy-MM-dd HH:mm:ss" />"></script>
<!--[if lt IE 7]>
<script type="text/javascript" src="<c:url value='/js/sleight.js'/>?<fmt:formatDate value="${toDay}" pattern="yyyy-MM-dd HH:mm:ss" />"></script>
<![endif]-->
<!--[if lt IE 10]>
<script type="text/javascript" src="<c:url value='/js/match_media.js'/>?<fmt:formatDate value="${toDay}" pattern="yyyy-MM-dd HH:mm:ss" />"></script>
<![endif]-->
<!--[if lt IE 9]>
<script type="text/javascript" src="<c:url value='/js/jdom.js'/>?<fmt:formatDate value="${toDay}" pattern="yyyy-MM-dd HH:mm:ss" />"></script>
<![endif]-->

<script type="text/javascript" src="https://code.jquery.com/jquery.min.js"></script>
<script src="<c:url value='/js/common.js'/>?<fmt:formatDate value="${toDay}" pattern="yyyy-MM-dd HH:mm:ss" />" charset="utf-8"></script>
<c:forEach items="${js}" var="js">
<script src="<c:url value='${js}'/>" charset="utf-8"></script>
</c:forEach>
<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" rel="stylesheet">
<link href="/js/font-awesome/css/font-awesome.min.css?20170405" rel="stylesheet" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
</head>
<body class="<c:out value="${body_class}" default="cms-index-index cms-home cms-page"/>">

<noscript>
  <div class="global-site-notice noscript">
    <div class="notice-inner">
      <p>
        <strong>브라우저에서 JavaScript가 비활성화 된 것 같습니다.</strong><br />이 웹 사이트의 기능을 사용하려면 브라우저에서 JavaScript를 활성화해야합니다.
      </p>
    </div>
  </div>
</noscript>
<header id="masthead" class="masthead" role="banner">
    <div class="container-fluid">
        <div class="col-md-5">
            <button id="hamburger" type="button" class="hamburger visible-md" data-tray="toggle" data-target="#masthead"><span class="sr-only">Mobile Navigation Menu</span><span class="hamburger__inner"></span></button>
            <h1 class="logo">
                <a href="${ctag:getBaseUrl()}">
                    <img src="/image/logo_myhome.png" alt="My Home Doc" />
                </a>
            </h1>
        </div>
        <div class="col-md-7 mobile-hide">
            
        </div>
        
    </div>
</header>
<div class="main" role="main" style="margin-top: 50px;">
    <section class="atr-registration atr-login">
    
        <div class="container-fluid padding-left40">
            <div class="row">
                <div class="col-md-2"></div>
                <div class="col-md-8 atr_form" style="border:1px solid #ccc;">
                    <div class="row">
                        <div class="col-md-12">
		                    ${notice.description}
		                    ${ctag:getErrorString(errorMsg)}
		                    ${ctag:getSuccess(successMsg)}
		                    <form action="/login/action.dr" method="post" id="login-form">
		                        <div class="progress-form">
		                            <div class="progress-form__section">
		                                <ul class="form-list">
		                                    <li style="display: flex;">
		                                        <label class="col-sm-3" style="text-align: right;" for="email">이메일</label>
		                                        <div class="col-sm-6 input-box validation-passed">
		                                            <input type="text"  name="email" value="${email}" id="email"class="input-text required-entry validate-email validation-passed" placeholder="이메일">
		                                        </div>
		                                        <div class="col-sm-3">&nbsp;</div>
		                                    </li>
		                                    <li style="display: flex;">
		                                        <label class="col-sm-3" style="text-align: right;" for="pass">비밀번호</label>
		                                        <div class="col-sm-6 input-box validation-passed">
		                                            <input type="password" name="password" id="pass" class="input-text required-entry validate-password validation-passed" placeholder="비밀번호">
		                                        </div>
		                                        <div class="col-sm-3">
		                                            <a class="button button-small" style="text-align:center;width:180px;" href="/forgotpassword.dr">비밀번호 찾기</a>
		                                        </div>
		                                    </li>
		                                </ul>
		                                <script type="text/javascript">
		                                    //<![CDATA[
		                                    var dataForm = new VarienForm('login-form', true);
		                                    //]]>
		                                </script>
		                            </div>
		                        </div>
		                    </form>
	                    </div>
                    </div>
                    <div class="row" style="margin-bottom:50px;">
                        <div class="col-md-3"></div>
                        <div class="col-md-6">
                            <div style="padding:25px 0;border: 1px solid #bbb;">
                                <input type="image" onclick="goLogin()" src="/image/first.png" style="padding:10px;max-width:90%;min-width:88%;height:auto;display: block; margin-left: auto; margin-right: auto;text-decoration: none;border: 1px solid #bbb;cursor:pointer;">
		                    </div>
		                </div>
		                <div class="col-md-3"></div>
		            </div>
                </div>
                <div class="col-md-2"></div>
            </div>
        </div>
    </section>
</div>

<%@ include file="/WEB-INF/include/footer.jspf" %>
<script type="text/javascript"><!--
//페이지이동
function goLogin() {
    var action = '/login/action.dr';
    $("#login-form").attr("action", action);
    $('#login-form').submit();
}
//--></script> 
<%@ include file="/WEB-INF/include/end.jspf" %>