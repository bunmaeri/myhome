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
            <aside class="col-md-2 sidebar">
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
                    <div class="order-page">
					    <div class="page-title row">
					        <div class="col-md-12 padding-left0">
					            <h2>주문번호: ${info.order_id} - ${info.order_status_name}</h2>
					            <div class="order-leader">
					                <p class="order-date">주문일자: ${info.order_date}</p>
					            </div>
					        </div>
					        <!-- <div class="col-md-4 buttons-container"><a href="/sales/order/print/order_id/1943245/" onclick="this.target='_blank';">Print Order</a></div> -->
					    </div>

					    <div class="col2-set row">
					        <div class="col-1 col-md-6 left-address">
					            <div class="info-box">
					                <h3 class="box-title">결제자 정보</h3>
					                <address class="box-content">
					                    <c:out value="${info.payment_address}" escapeXml="false" />
					                </address>
					            </div>
					        </div>
					        <div class="col-2 col-md-6 right-address">
					            <div class="info-box">
					                <h3 class="box-title">배송 주소</h3>
					                <address class="box-content">
					                    <c:out value="${info.shipping_address}" escapeXml="false" />
					                </address>
					            </div>
					        </div>
					    </div>
                        <div class="col2-set row">
					        <div class="col-1 col-md-6 left-address">
					            <div class="info-box">
					                <h3 class="box-title">배송방법</h3>
					                <div class="box-content">${info.shipping_method}</div>
					            </div>
					        </div>
					        <div class="col-2 col-md-6 right-address">
					            <div class="info-box">
					                <h3 class="box-title">결제방법</h3>
					                <div class="box-content">${info.payment_method}</div>
					            </div>
					        </div>
					    </div>
                    </div>
                    <div class="order-items order-details">
                        <h4 class="table-caption">
                            주문 내역
                        </h4>

                        <div class="item-tables">
                            <table class="data-table table table-stacked product-table" id="my-orders-table" summary="Items Ordered">
							    <thead>
							        <tr>
							            <th>상품명</th>
							            <th style="width:15%">판매가격</th>
							            <th style="width:15%">수량</th>
							            <th style="width:15%">합계</th>
							        </tr>
							    </thead>
							    <tbody>
							    <c:forEach items="${products}" var="item">
                                    <tr class="border" id="order-item-row-${item.product_id}">
									    <td class="product" data-header="Item">
									        <div class="product-info-container">
									            <h3 class="product-name">${item.name}</h3>
									        </div>
									    </td>
                                        <td data-header="Unit Price">
                                            <span class="price-excl-tax">
                                                <span class="cart-price">
                                                    <span class="price">${ctag:getCurrency(item.price)}</span>
                                                </span>
                                            </span>
                                            <br />
                                        </td>
									    <td data-header="Quantity">
									        <div class="cart-qty-container">
									            <span class="nobr">${item.quantity}</span>
									        </div>
									    </td>
									    <td data-header="Subtotal">
									       <span class="price-excl-tax">
									           <span class="cart-price">
									               <span class="price">${ctag:getCurrency(item.total)}</span>
									           </span>
									       </span>
									       <br />
									    </td>
                                    </tr>
                                </c:forEach>
                                </tbody>
                            </table>
							<div class="totals-container">
							    <div class="totals">
							        <table class="data-table" id="my-orders-total-table">
							            <tbody>
							            <c:forEach items="${totals}" var="item">
							                 <tr class="${item.code}">
							                     <td colspan="4" class="a-right" width="200px">${item.title}</td>
							                     <td class="last a-right"><span class="price">${ctag:getCurrency(item.value)}</span></td>
							                 </tr>
							            </c:forEach>
							            </tbody>
							        </table>
							    </div>
							</div>
                            <script type="text/javascript">decorateTable('my-orders-table', {'tbody tr' : ['first', 'last']})</script>
                        </div>

					    <div class="buttons-set">
					        <p class="back-link"><a class="button button-default button-white" href="/account/order_history.dr?page=${sessionScope.ORDER_HISTORY_PAGER}">주문내역으로</a></p>
					    </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>