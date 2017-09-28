<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>

<div id="global-messages" class="container-fluid"></div>
<div class="main" role="main">
    <div class="banner banner__category">
        <div class="container-fluid">
            <div class="vertical-align">
                <header class="page-title">
                    <h1>주문이 완료되었습니다.</h1>
                    <div class="row">
	                    <div class="col-md-12">
	                        <div class="assistance-container" style="font-size:18px;">
	                            <div>주문하신 내용은 <a href="/account/edit.dr" class="blue" style="font-size:20px;">회원정보</a> 페이지의 <a href="/account/order_history.dr" class="blue" style="font-size:20px;">주문내역</a>에서 확인하실 수 있습니다.</div>
	                            <div>궁금하신 점은 <a href="/account/question.dr" class="blue" style="font-size:20px;">문의하기</a>페이지를 이용해주십시오.</div>
	                            <div class="widget widget-static-block"></div>
	                        </div>
	                    </div>
	                </div>
                </header>
            </div>
        </div>
    </div>
    <div class="container-fluid padding-top50">
        <div class="row">
            <div class="col-md-12">
                <div class="my-account">
                    <div class="order-page">
					    <div class="page-title row">
					        <div class="col-md-12">
					            <h2>주문번호: ${info.order_id} - ${info.order_status_name}</h2>
					            <div class="order-leader">
					                <p class="order-date">주문일자: ${info.order_date}</p>
					            </div>
					        </div>
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
							            <th>판매가격</th>
							            <th>수량</th>
							            <th>합계</th>
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
                                        <td data-header="Unit Price" style="text-align:center;">
                                            <span class="price-excl-tax">
                                                <span class="cart-price">
                                                    <span class="price">${ctag:getCurrency(item.price)}</span>
                                                </span>
                                            </span>
                                            <br />
                                        </td>
									    <td data-header="Quantity" style="text-align:center;">
									        <div class="cart-qty-container">
									            <span class="nobr">${item.quantity}</span>
									        </div>
									    </td>
									    <td data-header="Subtotal" style="text-align:center;">
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
					        <p class="back-link"><a class="button button-default button-white" href="/account/order_history.dr">주문내역으로</a></p>
					    </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>