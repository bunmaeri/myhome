<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>

<div class="banner banner__category">
    <div class="container-fluid">
        <div class="vertical-align">
            <header class="page-title">
                <h1>주문하기</h1>
            </header>
        </div>
    </div>
</div>

<div id="global-messages" class="container-fluid"></div>
<div class="main padding-top50" role="main">
    <div class="container-fluid padding-left40">
        <div class="row">
            <div class="col-md-12">
                ${ctag:getErrorString(errorMsg)}
                <div class="my-account">
                    <div class="col2-set addresses-list">
					    <div class="page-title">
					        <h2>배송받을 주소를 선택하십시오.</h2>
					    </div>
					    <div class="col-1 addresses-primary">
					        <div class="row">
					            <c:if test="${shipping ne null}">
                                <div class="item info-box col-md-6">
	                                <div class="box-border">
						                <address class="box-content">
						                   <c:out value="${shipping.address}" escapeXml="false" />
						                </address>
						                <a href="/checkout/shipping/address/${shipping.address_id}.dr" class="link-wishlist button button-small button-plain">
		                                    배송주소로 선택
		                                </a>
						                <p class="links" style="padding:10px 0 0 30px;">
                                            <a class="link" href="/checkout/shipping/address/edit/${shipping.address_id}/${shipping.country_id}.dr">주소 변경</a>
                                            <span class="separator">|</span>
                                            <a class="link" href="javascript:;" onclick="return deleteAddress('${shipping.address_id}');">주소 삭제</a>
                                        </p>
						            </div>
					            </div>
					            </c:if>

					        <c:forEach items="${list}" var="item">
                                <div class="item info-box col-md-6">
                                    <div class="box-border">
						                <address class="box-content">
						                    <c:out value="${item.address}" escapeXml="false" />
						                </address>
						                <a href="/checkout/shipping/address/${item.address_id}.dr" class="link-wishlist button button-small button-plain">
                                            배송주소로 선택
                                        </a>
						                <p class="links" style="padding:10px 0 0 30px;">
						                    <a class="link" href="/checkout/shipping/address/edit/${item.address_id}/${item.country_id}.dr">주소 변경</a>
						                    <span class="separator">|</span>
						                    <a class="link" href="javascript:;" onclick="return deleteAddress('${item.address_id}');">주소 삭제</a>
						                </p>
						            </div>
					            </div>
					        </c:forEach>
                            </div>
                            <button type="button" title="한국 주소 추가" class="button button-default" onclick="window.location='/checkout/shipping/address/new/113.dr';"><span><img src="/image/flag-kr.png" title="한국어" style="width:20px;height:auto;"> 한국 주소 추가</span></button>
                            <button type="button" title="미국 주소 추가" class="button button-white button-default" onclick="window.location='/checkout/shipping/address/new/223.dr';"><span><img src="/image/flag-us.png" title="English" style="width:20px;height:auto;"> 미국 주소 추가</span></button>
                        </div>
                        
                    </div>
	                <div class="buttons-set"></div>
					<script type="text/javascript">
					//<![CDATA[
					    function deleteAddress(addressId) {
					        if(confirm('주소를 삭제하시겠습니까?')) {
					            window.location='/checkout/shipping/address/delete/'+addressId+'.dr';
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