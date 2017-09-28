<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>

<div class="banner banner__category">
    <div class="container-fluid">
        <div class="vertical-align">
            <header class="page-title">
                <h1><c:if test="${info.image!=null}"><img src="/image/${info.image}" alt="${info.name}" title="${info.name}">&nbsp;</c:if>${info.name}</h1>
            </header>
            <div class="category-description std">
                ${info.description}
            </div>
        </div>
    </div>
</div>
<div id="global-messages" class="container-fluid"></div>
<div class="main" role="main">
    <div class="container-fluid padding-top20">
        <div class="row">
            <aside class="col-md-3 sidebar">
                <div class="row">
                    <div class="col-md-10">
		                <div id="layered-navigation" class="layered-navigation">
		                    <c:if test="${filter_size>0}">
					        <div class="layered-navigation__inner">
					            <div class="gor-accordion no-filters">
		                            <div class="accordion-item" style="border-top:none;">
		                                <div class="accordion-header gor-active">카테고리</div>
		                                <div class="accordion-content gor-active" style="height:auto;">
		                                    <div class="accordion-content-inner">
												<ol>
												<c:forEach items="${filter}" var="item">
												    <li><a href="/products/category/${item.category_id}.dr">${item.name}</a></li>
												</c:forEach>
												</ol>
					                           </div>
					                       </div>
					                </div>
					             </div>
		                    </div>
		                    </c:if>
							<div class="block block-list block-compare">
							    <div class="block-title text-align-center">제품비교 목록</div>
							    <div class="block-content" id="compare-items">
							    <c:choose>
							    <c:when test="${compareList==null}">
						            <p>비교를 시작하려면 제품 아래에 있는 <font style="color:#14328c;font-weight:600;">제품비교하기</font>를 클릭하십시오.</p>
						        </c:when>
						        <c:otherwise>
		                            <ol>
		                            <c:forEach items="${compareList}" var="compare">
		                                <li class="item">
		                                    <a href="/product/${compare.product_id}.dr" class="product-image">
							                    <img src="/image/${compare.image}" style="height:100px;" alt="${compare.name}" title="${compare.name}">
							                </a>
							                <p class="product-name">
		                                        <a href="/product/${compare.product_id}.dr">${compare.name}</a>
		                                    </p>
							            </li>
							        </c:forEach>
		                            </ol>
		                            <div class="actions buttons-set">
							            <a title="Compare" class="button-small button-plain button  button-white" href="/products/compare.dr"><span><span>비교하기</span></span></a>
							            <a class="link" href="javascript:;" onclick="goCompareDelete()"><i class="fa fa-trash-o"></i> 모두 삭제</a>
							        </div>
							    </c:otherwise>
							    </c:choose>
							    </div>
							    
							</div>
						</div>
					</div>
					<div class="col-md-1 col-md-push-1">
					</div>
				</div>
            </aside>
            <div class="col-md-9">
                <div class="toolbar">
                    <div class="pager">
                        <p class="amount">${pageMaker.from} ~ ${pageMaker.to} 표시 중 - 총 ${pageMaker.count}개</p>
                        <c:if test="${pageMaker.end>1}">
                        <ol class="pagination">
                            <c:if test="${pageMaker.prev}">
                            <li class="pagination__button">
                                <a class="previous" href="/products/category/${sessionScope.CURRENT_CATEGORY}.dr?page=1" title="First">
                                    <span class="sr-only">처음</span>
                                    <i class="fa fa-angle-double-left"></i>
                                </a>
                            </li>
                            <li class="pagination__button">
                                <a class="previous" href="/products/category/${sessionScope.CURRENT_CATEGORY}.dr?page=${pageMaker.page-1}" title="Previous">
                                    <span class="sr-only">이전</span>
                                    <i class="fa fa-angle-left"></i>
                                </a>
                            </li>
                            </c:if>
                            <c:forEach begin="${pageMaker.start}" end="${pageMaker.end}" var="idx">
                                <c:choose>
                                <c:when test="${idx == pageMaker.page}">
                                    <li class="active"><span>${idx}</span></li>
                                </c:when>
                                <c:otherwise>
                                    <li><a href="/products/category/${sessionScope.CURRENT_CATEGORY}.dr?page=${idx}">${idx}</a></li>
                                </c:otherwise>
                                </c:choose>
                            </c:forEach>
                            <c:if test="${pageMaker.next }">
                            <li class="pagination__button">
                                <a class="next" href="/products/category/${sessionScope.CURRENT_CATEGORY}.dr?page=${pageMaker.page+1}" title="Next">
                                    <span class="sr-only">다음</span>
                                    <i class="fa fa-angle-right"></i>
                                </a>
                            </li>
                            <li class="pagination__button">
                                <a class="next" href="/products/category/${sessionScope.CURRENT_CATEGORY}.dr?page=${pageMaker.end}" title="Last">
                                    <span class="sr-only">마지막</span>
                                    <i class="fa fa-angle-double-right"></i>
                                </a>
                            </li>
                            </c:if>
                        </ol>
                        </c:if>
                    </div>
                </div>
                <div class="products-grid row" itemscope itemtype="http://schema.org/ItemList">
                <c:forEach items="${list}" var="item">
                    <article class="product col-md-3 col-sm-6" itemscope itemtype="http://schema.org/Product" itemprop="itemListElement">
                        <a href="/product/${item.product_id}.dr" class="image" itemprop="url">
                            <img class="gor-lazy" src="/image/${item.image}" data-src="/image/${item.image}" alt="${item.name}" itemprop="image" />
                            ${ctag:getSaleImage(item.special)}
                        </a>
                        <h1 class="name" itemprop="name"><a href="/product/${item.product_id}.dr" itemprop="url">${item.name}</a></h1>
                        <div class="description" itemprop="description">${ctag:getPrice(item.price,item.special)}</div>
                        <div class="buttons-set">
                            <a href="javascript:;" onclick="goCompare('${item.product_id}')" class="link link__compare">제품비교하기</a>
                        </div>
                    </article>
                </c:forEach>
                </div>
                <div class="toolbar-bottom">
                    <div class="toolbar">
                        <div class="pager">
	                        <c:if test="${pageMaker.end>1}">
	                        <ol class="pagination">
	                            <c:if test="${pageMaker.prev}">
	                            <li class="pagination__button">
	                                <a class="previous" href="/products/category/${sessionScope.CURRENT_CATEGORY}.dr?page=1" title="First">
	                                    <span class="sr-only">처음</span>
	                                    <i class="fa fa-angle-double-left"></i>
	                                </a>
	                            </li>
	                            <li class="pagination__button">
	                                <a class="previous" href="/products/category/${sessionScope.CURRENT_CATEGORY}.dr?page=${pageMaker.page-1}" title="Previous">
	                                    <span class="sr-only">이전</span>
	                                    <i class="fa fa-angle-left"></i>
	                                </a>
	                            </li>
	                            </c:if>
	                            <c:forEach begin="${pageMaker.start}" end="${pageMaker.end}" var="idx">
	                                <c:choose>
	                                <c:when test="${idx == pageMaker.page}">
	                                    <li class="active"><span>${idx}</span></li>
	                                </c:when>
	                                <c:otherwise>
	                                    <li><a href="/products/category/${sessionScope.CURRENT_CATEGORY}.dr?page=${idx}">${idx}</a></li>
	                                </c:otherwise>
	                                </c:choose>
	                            </c:forEach>
	                            <c:if test="${pageMaker.next }">
	                            <li class="pagination__button">
	                                <a class="next" href="/products/category/${sessionScope.CURRENT_CATEGORY}.dr?page=${pageMaker.page+1}" title="Next">
	                                    <span class="sr-only">다음</span>
	                                    <i class="fa fa-angle-right"></i>
	                                </a>
	                            </li>
	                            <li class="pagination__button">
	                                <a class="next" href="/products/category/${sessionScope.CURRENT_CATEGORY}.dr?page=${pageMaker.end}" title="Last">
	                                    <span class="sr-only">마지막</span>
	                                    <i class="fa fa-angle-double-right"></i>
	                                </a>
	                            </li>
	                            </c:if>
	                        </ol>
	                        </c:if>
	                    </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<script><!--
// 제품비교하기
function goCompare(product_id) {
    $.ajax({
        url:"/products/compare/add/"+product_id+".dr",
        dataType:"html",
        method: 'post',
        beforeSend: function(xmlHttpRequest) {
        },
        complete: function() {
        },
        success:function(html){
            //page 자체를 받아서 div에 넣는식
            $("#compare-items").html(html);
        },error:function(request,status,error){
            alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
        }
    });
}
//--></script>
<script><!--
// 제품비교 삭제하기
function goCompareDelete() {
	if(confirm('제품비교하기를 모두 삭제하시겠습니까?')) {
	    $.ajax({
	        url:"/products/compare/delete.dr",
	        dataType:"html",
	        method: 'post',
	        beforeSend: function(xmlHttpRequest) {
	        },
	        complete: function() {
	        },
	        success:function(html){
	            //page 자체를 받아서 div에 넣는식
	            $("#compare-items").html(html);
	        },error:function(request,status,error){
	            alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
	        }
	    });
	}
}
//--></script>
<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>