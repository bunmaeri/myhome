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
                            <li class="current"><strong>주소록</strong></li>
                            <li><a href="/account/order_history.dr">주문내역</a></li>
                            <li><a href="/account/wishlist.dr">위시리스트</a></li>
                            <li><a href="/account/reward.dr">적립포인트</a></li>
                            <li class="last"><a href="/logout.dr">로그아웃</a></li>
                        </ul>
                        <div class="m-accordion visible-md ">
                            <div class="m-header">
                                주소록
                            </div>
                            <div class="m-content">
                                <!-- <div class="item"><a href="/account/dashboard.dr">회원정보 현황</a></div> -->
                                <div class="item"><a href="/account/edit.dr">회원정보 수정</a></div>
                                <div class="item"><a href="/account/order_history.dr">주문내역</a></div>
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
                    <div class="col2-set addresses-list">
					    <div class="page-title">
					        <h2>주소록</h2>
					    </div>
					    <c:if test="${successMsg ne null && successMsg!=''}">
	                    <ul class="messages">
	                        <li class="success-msg">
	                            <ul>
	                                <li>
	                                    <span>${successMsg}</span>
	                                </li>
	                           </ul>
	                       </li>
	                    </ul>
	                    </c:if>
					    <div class="col-1 addresses-primary">
					        <div class="row">
					        <c:if test="${payment ne null}">
                                <div class="col-md-6 info-box info-box-1">
                                    <div class="box-border">
	                                    <h3 class="box-title">결제자 기본 주소</h3>
						                <address class="box-content">
						                   <c:out value="${payment.address}" escapeXml="false" />
						                </address>
						                <p class="links">
						                    <a  class="link" href="/account/address/edit/${payment.address_id}/${payment.country_id}.dr">주소 변경</a>
						                </p>
						            </div>
					            </div>
                            </c:if>
                            <c:if test="${shipping ne null}">
                                <div class="col-md-6 info-box info-box-1">
	                                <div class="box-border">
						                <h3 class="box-title">배송 기본 주소</h3>
						                <address class="box-content">
						                   <c:out value="${shipping.address}" escapeXml="false" />
						                </address>
						                <p class="links">
						                    <a class="link" href="/account/address/edit/${shipping.address_id}/${shipping.country_id}.dr">주소 변경</a>
						                </p>
						            </div>
					            </div>
					        </c:if>
                            </div>
                        </div>
                        
					    <div class="col-2 addresses-additional">
					        <h4 class="sub-title">주소 추가</h4>
					        <div class="row">
					        <c:forEach items="${list}" var="item">
                                <div class="item info-box col-md-6">
                                    <div class="box-border">
						                <address class="box-content">
						                    <c:out value="${item.address}" escapeXml="false" />
						                </address>
						                <p class="links">
						                    <a class="link" href="/account/address/edit/${item.address_id}/${item.country_id}.dr">주소 변경</a>
						                    <span class="separator">|</span>
						                    <a class="link" href="javascript:;" onclick="return deleteAddress('${item.address_id}');">주소 삭제</a>
						                </p>
						                <p class="links">
	                                        <a class="link" href="/account/address/payment/${item.address_id}.dr">결제 기본 주소로</a>
	                                        <span class="separator">|</span>
	                                        <a class="link" href="/account/address/shipping/${item.address_id}.dr">배송 기본 주소로</a>
	                                    </p>
	                                </div>
					            </div>
					        </c:forEach>
                            </div>
                            <button type="button" title="한국 주소 추가" class="button button-default" onclick="window.location='/account/address/new/113.dr';"><span><img src="/image/flag-kr.png" title="한국어" style="width:20px;height:auto;"> 한국 주소 추가</span></button>
                            <button type="button" title="미국 주소 추가" class="button button-white button-default" onclick="window.location='/account/address/new/223.dr';"><span><img src="/image/flag-us.png" title="English" style="width:20px;height:auto;"> 미국 주소 추가</span></button>
                        </div>
                        
                    </div>
	                <div class="buttons-set"></div>
					<script type="text/javascript">
					//<![CDATA[
					    function deleteAddress(addressId) {
					        if(confirm('주소를 삭제하시겠습니까?')) {
					            window.location='/account/address/delete/'+addressId+'.dr';
					        }
					        return false;
					    }
					//]]>
					</script>
			    </div>
			</div>
        </div>
    </div>
</div>
<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>