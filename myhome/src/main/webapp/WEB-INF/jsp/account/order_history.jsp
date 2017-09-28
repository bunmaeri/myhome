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
                            <li><a href="/account/edit.dr">회원정보 수정</a></li>
                            <li><a href="/account/address.dr">주소록</a></li>
                            <li class="current"><strong>주문내역</strong></li>
                            <li><a href="/account/wishlist.dr">위시리스트</a></li>
                            <li><a href="/account/reward.dr">적립포인트</a></li>
                            <li class="last"><a href="/logout.dr">로그아웃</a></li>
                        </ul>
                        <div class="m-accordion visible-md ">
                            <div class="m-header">
                                주문내역
                            </div>
                            <div class="m-content">
                                <!-- <div class="item"><a href="/account/dashboard.dr">회원정보 현황</a></div> -->
                                <div class="item"><a href="/account/edit.dr">회원정보 수정</a></div>
                                <div class="item"><a href="/account/address.dr">주소록</a></div>
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
                    <div class="page-title">
                        <h2>주문내역</h2>
                    </div>

				    <table class="data-table table table-striped table-stacked" id="my-orders-table">
				        <thead>
				            <tr>
				                <th>주문번호</th>
				                <th>주문일</th>
				                <th>배송자 이름</th>
				                <th>결제금액</th>
				                <th>주문진행상황</th>
				                <th></th>
				            </tr>
				        </thead>
				        <tbody>
				        <c:forEach items="${list}" var="item">
                            <tr>
				                <td data-header="Order #">${item.order_id}</td>
				                <td data-header="Date"><span class="nobr">${item.order_date}</span></td>
				                <td data-header="Ship To">${item.shipping_customer_name}</td>
				                <td data-header="Total"><span class="price">${ctag:getCurrency(item.total)}</span></td>
				                <td data-header="Status">${item.order_status_name}</td>
				                <td data-header="Action" class="actions">
                                    <span class="nobr">
                                        <a href="/account/order/view/${item.order_id}.dr" class="link">주문내역보기</a>
                                    </span>
				                </td>
				            </tr>
				        </c:forEach>
                        </tbody>
                    </table>
                    <script type="text/javascript">decorateTable('my-orders-table');</script>
                    <div class="pager">
                        <p class="amount" style="float:right;">전체 (${pageMaker.count}개)</p>
                        <c:if test="${pageMaker.end>1}">
                        <ol class="pagination">
                            <c:if test="${pageMaker.prev}">
                            <li class="pagination__button" data-mobile-text="Previous">
                                <a class="previous" href="/account/order_history.dr?page=1" title="First">
                                    <span class="sr-only">처음</span>
                                    <i class="fa fa-angle-double-left"></i>
                                </a>
                            </li>
                            <li class="pagination__button" data-mobile-text="Previous">
                                <a class="previous" href="/account/order_history.dr?page=${pageMaker.page-1}" title="Previous">
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
                                    <li><a href="/account/order_history.dr?page=${idx}">${idx}</a></li>
                                </c:otherwise>
                                </c:choose>
	                        </c:forEach>
                            <c:if test="${pageMaker.next }">
                            <li class="pagination__button" data-mobile-text="Next">
                                <a class="next" href="/account/order_history.dr?page=${pageMaker.page+1}" title="Next">
                                    <span class="sr-only">다음</span>
                                    <i class="fa fa-angle-right"></i>
                                </a>
                            </li>
                            <li class="pagination__button" data-mobile-text="Last">
                                <a class="next" href="/account/order_history.dr?page=${pageMaker.end}" title="Last">
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
<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>