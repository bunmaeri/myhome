<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>

<div id="global-messages" class="container-fluid"></div>
<div class="main" role="main">
<c:choose>
<c:when test="${sessionScope.CART ne null and sessionScope.CART > 0}">
	<div class="cart">
		<div class="page-title title-buttons clearfix">
			<div class="container-fluid">
				<h1>장바구니</h1>
				<div class="row">
					<div class="col-md-7">
						<div class="assistance-container">
							<strong class="blue">한국배송: </strong>주문액이 150불을 넘거나 수량이 6개를 초과하면 세금 내십니다.
							<div style="margin-top: 10px;">
							 <strong class="blue">미국배송: </strong>주문액과 수량에 제한이 없습니다.
							</div>
							<div class="widget widget-static-block"></div>
						</div>
					</div>
					<div class="col-md-5 continue-container">
						<button type="button" title="계속 쇼핑하기" class="button button-default button-small btn-continue" onclick="setLocation('/')">계속 쇼핑하기</button>
					</div>
				</div>
			</div>
		</div>
		<div class="container-fluid">
		    ${ctag:getError(errMessage)}
		    <div style="margin-top: 20px; font-size: 16px; color: #00a1de; line-height: 1.25em; padding: 6px; background-color: #eeeeee; border-style: dashed; border-color: #00a1de; border-width: 1px;">
				제품수량을 변경하시려면 <i class="fa fa-minus-square-o"></i> 또는 <i class="fa fa-plus-square-o"></i> 버튼으로 수량을 변경하신 후에 <strong style="color: #00a1de !important;">수량변경</strong>을 클릭하세요.
			</div>
			<div class="row">
				<div class="col-md-8">
					<form id="cart-form" action="/cart/update.dr" method="post">
						<fieldset>
							<table id="shopping-cart-table"
								class="data-table table table-stacked product-table">
								<thead>
									<tr>
										<th>제품명</th>
										<th style="width:40%"></th>
										<!-- <th>모델</th> -->
										<th><span class="nobr">단가</span></th>
										<th>수량</th>
										<th>합계</th>
										<!-- <th></th> -->
									</tr>
								</thead>
								<tbody>
									<c:forEach items="${list}" var="item">
										<tr>
											<td data-header="Items" class="image-td">
												<div class="product-image-wrapper product-image">
													<a href="/product/${item.product_id}.dr" title="${item.name}" class="product-image">
													   <img src="/image/${item.image}" alt="${item.name}" />
													</a>
												</div>
											</td>
											<td class="product" data-header="">
											    <input name="product_id" id="product_id" type="hidden" value="${item.product_id }" />
												<div class="product-info-container">
													<h2 class="product-name" style="margin-bottom: 20px;">
														<a href="/product/${item.product_id}.dr">${item.name}</a>
														<c:choose>
														<c:when test="${item.product_quantity=='0'}">
														    <p><span class="out-of-stock">재고부족/품절</span></p>
														</c:when>
														<c:when test="${item.quantity>item.product_quantity}">
                                                            <p><span class="out-of-stock">재고부족(재고수량:${item.product_quantity}개)</span></p>
                                                        </c:when>
                                                        <c:otherwise></c:otherwise>
														</c:choose>
													</h2>
													<a href="cart/delete/${item.product_id}.dr" title="삭제" class="btn-remove link btn-remove2"><i class="fa fa-trash"></i> 삭제</a>
												</div>
											</td>
											<%-- <td data-header="Your Price" class="a-left match price-td">
												${item.model}
											</td> --%>
											<td data-header="Your Price" class="a-left match price-td">
												<span class="cart-price"> <span class="price">${ctag:getProductPrice(item.price,item.special,'cart')}</span></span>
											</td>
											<td data-header="Quantity" class="a-left quantity">
												<div class="cart-qty-container">
													<div class="cart-qty">
														<button class="cart-qty__minus"> <i class="fa fa-minus" aria-hidden="true"></i></button>
														<input type="text" class="input-text qty validate-not-negative-number" name="quantity" id="quantity_${item.product_id}" value="${item.quantity}" readonly/>
														<button class="cart-qty__plus"><i class="fa fa-plus" aria-hidden="true"></i></button>
													</div>
													<a href="#" title="수량변경" onclick="updateItemToCart(${item.product_id});" class="btn-link btn-cart link">수량변경</a>
												</div>
												<c:if test="${item.error_limit!=null}">
		                                          <span style="font-size:14px;color:red">${item.error_limit}</span>
		                                        </c:if>
											</td>
											<td data-header="Subtotal" class="a-left match final-price-td">
											    <span class="cart-price"><span class="price">${ctag:getCurrency(item.sub_totals)}</span></span>
											</td>
											<%-- <td class="remove-td">
											    <a href="cart/delete/${item.product_id}.dr" title="삭제" class="btn-remove link btn-remove2"><i class="fa fa-trash"></i> 삭제</a>
											</td> --%>
										</tr>
										
									</c:forEach>
								</tbody>
							</table>
							<div class="buttons-set">
								<button type="submit" class="button button-plain button-white button-small">장바구니 업데이트</button>
							</div>
						</fieldset>
<script type="text/javascript">
//<![CDATA[
    function updateItemToCart(product_id) {
        var quantity = $('#quantity_' + product_id).val();
        var url = '/cart/update/'+product_id+'/'+quantity+'.dr';
        setLocation(url);
    }
//]]>
</script>
					</form>
				</div>
				<div class="col-md-3 col-md-push-1">
					<div class="cart-collaterals">
						<h3 class="cart-subtitle">주문 요약</h3>
						<div class="totals">
							<table id="shopping-cart-totals-table">
								<tbody>
									<c:forEach items="${subTotals}" var="item">
										<tr>
											<td class="a-left" colspan="1">${item.title}</td>
											<td class="a-right"><span class="price">${ctag:getCurrency(item.value)}</span>
											</td>
										</tr>
									</c:forEach>
								</tbody>
								<tfoot>
									<tr class="grand-total">
										<td class="a-left" colspan="1"><strong>${total.title}:</strong></td>
										<td class="a-right"><strong><span class="price">${ctag:getCurrency(total.value)}</span></strong></td>
									</tr>
								</tfoot>
							</table>
						</div>
						<div class="checkout-types-container">
							<ul class="checkout-types">
								<li>
								<c:choose>
                                <c:when test="${sessionScope.IS_CART_ERROR}">
                                    <button type="button" title="주문하기" class="button btn-proceed-checkout btn-checkout button-white" style="color:#14328c;background-color:#ddd;" disabled>
                                        <span>장바구니 메세지 확인!</span>
                                    </button>
								</c:when>
                                <c:otherwise>
	                                <button type="button" title="주문하기" class="button btn-proceed-checkout btn-checkout" onclick="window.location='/checkout/shipping/address.dr';">
                                        <span>주문하기</span>
                                    </button>
                                </c:otherwise>
                                </c:choose>
								</li>
								<li></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="container-fluid" style="margin-top: 30px;">
        <div class="row">
            <div class="col-md-12 border-blue" style="padding: 40px 70px;">
                ${map.description}
            </div>
        </div>
    </div>
</c:when>
<c:otherwise>
	<div class="cart">
		<div class="page-title">
			<div class="container-fluid padding-left40">
				<h1>장바구니</h1>
                <div class="row">
                    <div class="col-md-7">&nbsp;</div>
                    <div class="col-md-5 continue-container">
                        <button type="button" title="계속 쇼핑하기" class="button button-default button-small btn-continue" onclick="setLocation('/')">계속 쇼핑하기</button>
                    </div>
                </div>
			</div>
		</div>
		<div class="container-fluid padding-left40">
		  <h3>장바구니가 비었습니다.</h3>
		</div>
	</div>
</c:otherwise>
</c:choose>
    
</div>
<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>