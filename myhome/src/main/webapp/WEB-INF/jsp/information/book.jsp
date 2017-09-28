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
            <div class="container-fluid" style="margin-top:30px;">
                <div class="row">
                    <div class="col-md-8 text-justify" id="DIV_tab_group">
                        <div id="description">${book.description}</div>
                    </div>
                    <div class="col-md-3 col-md-push-1">
                        <div class="product-sidebar">
                        <div class="block block-list block-viewed">
                               <div class="block-title">
                                <strong><span>Dr. Pure Natural 책</span></strong>
                            </div>
                            <div class="block-content">
                                <ol id="recently-viewed-items">
                                <c:forEach items="${list}" var="item">
                                <c:if test="${item.book_id!=book.book_id}">
                                    <li class="item">
                                        <a href="/books/${item.book_id}.dr" class="product-image">
                                            <img class="gor-lazy" src="/image/${item.image}" data-src="${item.image}" width="200" alt="${item.title}" title="${item.title}" />
                                        </a>
                                    </li>
                                    <li class="item">
                                        <p class="product-name"><a href="/books/${item.book_id}.dr">${item.title}</a></p>
                                    </li>
                                </c:if>
                                </c:forEach>
                                </ol>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>