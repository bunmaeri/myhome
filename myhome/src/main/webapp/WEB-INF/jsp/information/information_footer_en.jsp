<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>
<div class="banner banner__category">
    <div class="container-fluid">
        <div class="vertical-align">
            <header class="page-title">
                <h1>
                    <c:if test="${map.image!=null}"><img src="/image/${map.image}" alt="${map.title}" title="${map.title}" style="vertical-align: middle;"> </c:if>${map.title}</h1>
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
     <div class="col-md-8">
        <p id="description">${map.description}</p>
     </div>
     <div class="col-md-4 col-md-push-0">
         <ul class="product-list-subset">
             <li><h5 style="font-size:16px;"><a href='/information/privacy-policy/en.dr'>Privacy Policy</a></h5></li>
             <li><h5 style="font-size:16px;"><a href='/information/return-policy/en.dr'>Return Policy</a></h5></li>
             <li><h5 style="font-size:16px;"><a href='/information/terms-of-use/en.dr'>Terms and Conditions</a></h5></li>
         </ul>
      </div>
    </div>
</div>
        </div>
    </div>
</div>

<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>