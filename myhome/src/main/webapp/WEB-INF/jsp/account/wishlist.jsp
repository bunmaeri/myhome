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
                            <li><a href="/account/order_history.dr">주문내역</a></li>
                            <li class="current"><strong>위시리스트</strong></li>
                            <li><a href="/account/reward.dr">적립포인트</a></li>
                            <li class="last"><a href="/logout.dr">로그아웃</a></li>
                        </ul>
                        <div class="m-accordion visible-md ">
                            <div class="m-header">
                                위시리스트
                            </div>
                            <div class="m-content">
                                <!-- <div class="item"><a href="/account/dashboard.dr">회원정보 현황</a></div> -->
                                <div class="item"><a href="/account/edit.dr">회원정보 수정</a></div>
                                <div class="item"><a href="/account/address.dr">주소록</a></div>
                                <div class="item"><a href="/account/order_history.dr">주문내역</a></div>
                                <div class="item"><a href="/account/reward.dr">적립포인트</a></div>
                                <div class="item"><a href="/logout.dr">로그아웃</a></div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            
            <div class="col-md-9 col-md-push-1">
                <div class="my-account">
<SCRIPT TYPE="text/javascript">
/* function TestDataCheck() {
   var form = $('wishlist-view-form');
       $(form).select('textarea.favorite-comment').each(function(item) {
        if( item.value == '메모...' ) {
            item.value = '';
        }
   });
   return true;
} */
</SCRIPT>
				    <div class="my-wishlist">
				        <div class="page-title title-buttons">
				            <h2>위시리스트</h2>
				        </div>
				        ${ctag:getErrorString(errorMsg)}
				        <form id="wishlist-view-form" action="/account/wishlist/update.dr" method="post">
				            <div class="buttons-set top-set">
							    <!-- <button type="button" title="Add Selected to Cart" onclick="addAllWItemsToCart()" class="button  button-white button-small button-plain btn-add"><span><span>장바구니에 추가</span></span></button> -->
							    <button type="submit" name="do" title="변경된 내용 저장" class="button button-default btn-update button-small button-plain"><span><span>변경된 내용 저장</span></span></button>
				            </div>
				            <fieldset>
				                <table class="data-table table-stacked table product-table" id="wishlist-table">
				                    <thead>
								        <tr>
								            <th class="first" style="width:50%">제품명</th>
				                            <th>제조사</th>
				                            <th>모델번호</th>
				                            <th class="action"></th>
				                        </tr>
				                    </thead>
				                    <tbody>
				                    <c:forEach items="${list}" var="item">
				                        <tr id="item_${item.product_id}">
				                            <td>
				                                <input name="product_id" id="product_id" type="hidden" value="${item.product_id }" />
				                                <div class="product-container">
												    <a class="product-image" href="/product/${item.product_id}.dr" title="${item.name}">
												        <img src="/image/${item.image}" style="width:auto;height:100px;" alt="${item.name}" />
												    </a>
												    <div class="product-info">
												        <h3 class="product-name">
												            <a href="/product/${item.product_id}.dr" title="${item.name}">
												                ${item.name}
												            </a>
												        </h3><br/>
				                                        <a href="/account/wishlist/delete/${item.product_id}.dr" title="삭제" class="btn-remove link btn-remove2"><i class="fa fa-trash" aria-hidden="true"></i> 삭제</a>
				                                    </div>
				                                </div>
				                            </td>
				                            <td class="text-align-center">${item.manufacturer_name}</td>
				                            <td class="text-align-center">${item.model}</td>
				                            <!-- td>
				                                <div class="clearfix name-desc">
												    <div class="description std">
												        <div class="inner">
												            <textarea class="favorite-comment input-text" name="comment" id="comment_${item.product_id}" rows="2" cols="5" onfocus="focusComment(this)" onblur="focusComment(this)" title="Comment"><c:out value="${item.comment}" default="메모..."/></textarea>
												        </div>
												    </div>
												</div>
											    <div class="item-manage">
											    </div>
											</td-->
				                            <td class="text-align-center">
				                                <div class="cart-cell">
				                                    <div class="price-box">
							                            <p class="special-price">
							                                <!-- <span class="price-label">제품가격:</span> -->
                                                            <span class="price" id="product-price-933">${ctag:getCurrency(item.price)}</span>
							                            </p>
				                                                                               
				                                    </div>
												    <div class="add-to-cart-alt">
												    <c:choose>
												    <c:when test="${item.stock_status_id=='5'}">
												        <p class="availability out-of-stock"><span>${item.stock_status_name}</span></p>
												    </c:when>
												    <c:otherwise>
											            <div class="cart-qty-container">
												            <div class="cart-qty">
												                <button class="cart-qty__minus"><i class="fa fa-minus" aria-hidden="true"></i></button>
												                <input type="text" class="input-text qty validate-not-negative-number" name="quantity" id="quantity_${item.product_id}" value="${item.quantity}" readonly/>
												                <button class="cart-qty__plus"><i class="fa fa-plus" aria-hidden="true"></i></button>
												            </div>
												        </div>
					                                    <a href="#" title="Add to Cart" onclick="addWItemToCart(${item.product_id});" class="btn-link btn-cart link">장바구니에 추가</a>
					                                </c:otherwise>
					                                </c:choose>
				                                    </div>
				                                </div>
				                            </td>
				                        </tr>
				                    </c:forEach>
				                    </tbody>
				                </table>
					            <script type="text/javascript">
								//<![CDATA[
								    decorateTable('wishlist-table');
							        
							        /* function focusComment(obj) {
							            if( obj.value == '메모...' ) {
							                obj.value = '';
							            } else if( obj.value == '' ) {
							                obj.value = '메모...';
							            }
							        } */
								            
						            function addWItemToCart(product_id) {
						            	var quantity = $('#quantity_' + product_id).val();
                                        var url = '/account/product/add_to_cart/'+product_id+'/'+quantity+'/account_wishlist.dr';
						                setLocation(url);
						            }
					        
									$$('th a.add-me').each(function(anchor) {
										anchor.observe('click', function(e) {
									        e.preventDefault();
									        $$('input.selection').each(function(input) {
									            input.checked = anchor.readAttribute('href').replace('#', '');
									        });
									        return false;
									    });
									});
								//]]>
								</script>
					            <script type="text/javascript">decorateTable('wishlist-table')</script>
				                <div class="buttons-set buttons-set2">
								    <!-- <button type="button" title="Add Selected to Cart" onclick="addAllWItemsToCart()" class="button  button-white button-small button-plain btn-add"><span><span>장바구니에 추가</span></span></button> -->
								    <button type="submit" name="do" title="Update My Favorites" class="button button-default btn-update button-small button-plain"><span><span>변경된 내용 저장</span></span></button>
				                </div>
				            </fieldset>
				        </form>
				    </div>
				</div>
		    </div>
        </div>
    </div>
</div>
<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>