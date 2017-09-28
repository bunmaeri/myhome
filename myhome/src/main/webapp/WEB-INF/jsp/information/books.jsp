<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>
<div class="banner banner__category">
    <div class="container-fluid">
        <div class="vertical-align">
            <header class="page-title">
                <h1><img src="/image/${info.image}" alt="${info.title}" title="${info.title}" style="vertical-align: middle;">
                ${info.title}</h1>
            </header>
        </div>
    </div>
</div>
<div id="global-messages" class="container-fluid"></div>
<div class="main" role="main">
    <div class="container-fluid">
        <div class="std">
            <div class="row">
                <c:forEach items="${list}" var="item">
                <div class="col-md-4" style="text-align: center;">
                    <a href="/books/${item.book_id}.dr"><img src="/image/${item.image}" alt="${item.title}" style="width:350px;height:auto;"/></a>
                    <h5><a href="/books/${item.book_id}.dr">${item.title}</a></h5>
                </div>
                </c:forEach>
            </div>
        </div>
    </div>
</div>

<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>