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
				     <div class="col-md-8 text-justify">
				        <p id="description">${map.description}</p>
				     </div>
				     <div class="col-md-3 col-md-push-1">
				         <ul class="product-list-subset">
				             <li><h5 style="font-size:16px;"><a href='/information/our_phylosophy.dr'>운영철학</a></h5></li>
				             <li><h5 style="font-size:16px;"><a href='/information/purity.dr'>순수품질</a></h5></li>
				             <li><h5 style="font-size:16px;"><a href='/information/customs_policy.dr'>세관규정</a></h5></li>
				             <li><h5 style="font-size:16px;"><a href='/information/tracking.dr'>배송조회</a></h5></li>
				             <li><h5 style="font-size:16px;"><a href='/information/how_to_gets_results.dr'>효과보는 복용법</a></h5></li>
				             <li><h5 style="font-size:16px;"><a href='/information/low_quality.dr'>저질제품이란</a></h5></li>
				             <li><h5 style="font-size:16px;"><a href='/information/my_column.dr'>동아일보연재</a></h5></li>
				             <li><h5 style="font-size:16px;"><a href='/information/diagnosis.dr'>진료를 원하시는 분들께</a></h5></li>
				             <li><h5 style="font-size:16px;"><a href='/information/requisition.dr'>통관고유부호 발급안내</a></h5></li>
				            </ul>
				        </div>
				    </div>
				</div>
           </div>
       </div>
   </div>

<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>