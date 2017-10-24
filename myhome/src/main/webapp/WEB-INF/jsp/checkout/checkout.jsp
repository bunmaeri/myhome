<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>

<div id="global-messages" class="container-fluid"></div>
<div class="main" role="main">
<form action="/checkout/checkout.dr" method="post" id="form" class="form-horizontal">
    <div class="banner banner__category">
        <div class="container-fluid">
            <div class="vertical-align">
                <header class="page-title">
                    <h1>주문완료</h1>
                </header>
            </div>
        </div>
    </div>
    <div class="opc-wrapper container-fluid padding-left40">
        ${ctag:getError(errMessage)}
        <div class="row">
            <div class="item info-box col-md-6">
                <div class="step-title">
                    <h2>결제자 정보</h2>
                </div>
                <div class="box-border">
                    <address class="box-content">
                       <c:out value="${payment_address.address}" escapeXml="false" />
                    </address>
                    <!-- <p class="links" style="padding:10px 0 0 30px;">
                        <a class="link" href="/checkout/shipping/address/edit/${payment_address.address_id}/${payment_address.country_id}.dr">주소 변경</a>
                    </p>-->
                </div>
            </div>
            <div class="item info-box col-md-6 padding-left40">
                <div class="step-title">
                    <h2>배송지 정보&nbsp;&nbsp;<a href="/checkout/shipping/address.dr" class="button button-small button-shipping">배송지 변경</a></h2>
                </div>
                <div class="box-border">
                    <address class="box-content">
                        <c:out value="${shipping_address.address}" escapeXml="false" />
                    </address>
                    <!-- <p class="links" style="padding:10px 0 0 30px;">
                        <a href="/checkout/shipping/address.dr" class="button button-small">배송지 변경</a>
                    </p> -->
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <ol class="opc" id="checkoutSteps" >
                    <li id="opc-shipping_method" class="section allow">
                        <div class="step-title">
                            <h2>배송방법</h2>
                        </div>
                        <div id="checkout-step-shipping_method" class="step a-item">
                            <div id="checkout-shipping-method-load">
                                <dl class="sp-methods">
                                    <dt>
                                        <ul>
                                        <c:forEach items="${shipping_methods}" var="item" varStatus="loop">
                                            <li>
                                                <div class="custom-radio">
                                                    <input name="shipping_method_carrier" type="radio" id="shipping_method_carrier${loop.index}" <c:if test="${item.code==shipping_method.code}">checked="checked"</c:if> class="radio shipping_method_carrier" value="${loop.index}">
                                                    <label for="shipping_method_carrier${loop.index}">${item.name}</label>
                                                    <input name="shipping_method_code" type="hidden" id="shipping_method_code${loop.index}" value="${item.code}">
                                                    <input name="shipping_method_cost" type="hidden" id="shipping_method_cost${loop.index}" value="${item.cost}">
                                                    <input name="shipping_method_name" type="hidden" id="shipping_method_name${loop.index}" value="${item.name}">
                                                </div>
                                                <span class="price">${ctag:getCurrency(item.cost)}</span>                        
                                            </li>
                                        </c:forEach>
                                        </ul>
                                    </dt>
                                </dl>
                            </div>
                        </div>
                    </li>
                </ol>
                <c:if test="${show_shipping_fee=='Y'}">
                <div id="shipping_fee" class="">
	                <div id="donate-heading" class="comm-content" style="user-select: text;">
	                    <div class="TitleDiv" style="user-select: text;">
	                        <table class="no-border" style="user-select: text;">
	                            <tbody style="user-select: text;">
	                                <tr style="user-select: text;">
	                                    <td>
	                                        <div class="TitleImageDiv">
	                                            <img alt="" src="/image/redpen.jpg">
	                                        </div>
	                                    </td>
	                                    <td class="TitleMainTD" style="user-select: text;"><span class="TitleMain" style="user-select: text;">== 배송비에 대하여 알려드립니다 ==</span></td>
	                                </tr>
	                            </tbody>
	                        </table>
	                    </div>
	                    <div class="donate_partial2">
                            <aside class="onlykr" style="font-size: 16px;">
                                ${shipping_fee.description}
                            </aside>
                        </div>
	                </div>
	            </div>
	            </c:if>
	            <c:if test="${show_shipping_donation=='Y'}">
	            <div>
					<div id="donate-content" style="display: block;">
					
					    <div class="donate_partial2">
					        <h3 class="onlykr ptitle about-shipping">배송비 성금에 대하여</h3>
					    </div>
					
					    <div class="donate_partial2">
					        <aside align="justify">
					            ${shipping_donation.description}
					        </aside>
					    </div>
					
					    <div class="input-group">
					        <span>
					            <input type="checkbox" id="donate" name="donate" value="1"><span class="blue"> 배송비 전액을 다 내겠습니 다</span>
					            <label for="donate" class="label">(이 박스에 첵크하시면 배송비가 전액으로 바뀝니다)</label>
					        </span>
					    </div>
					</div>
				</div>
				</c:if>
	        </div>
	        <div class="opc-progress-container sidebar col-md-6 padding-left40" id="col-right-opcheckout">
	            <div class="block block-progress opc-block-progress">
				    <ol class="opc" id="checkoutSteps">
	                    <li id="opc-payment" class="section allow">
	                        <div class="step-title">
	                            <h2 class="display_payment">결제정보</h2>
	                        </div>
	                        <div id="checkout-step-payment" class="step a-item">
                                <input type="hidden" name="customer_id" value="${customer_id}" />
                                <input type="hidden" name="address_id" value="${address_id}" />
                                <fieldset>
                                    <div id="checkout-payment-method-load">
                                        <dl class="sp-methods" id="">
                                            <dt>
                                                <div class="custom-radio">
                                                    <input id="payment_method_credit" value="credit" type="radio" name="payment_method_credit" checked="checked" class="radio" />
                                                    <label for="payment_method_credit">신용카드 </label>
                                                </div>
                                            </dt>
                                            <dd>
                                                <ul id="payment_form_authorizenetcim" class="payment-method">
                                                    <li id="authorizenetcim_cc_new_card_form">
                                                        <div class="row">
                                                            <ul class="form-list col-md-12">
                                                                <li>
                                                                    <label for="cc_owner" class=""><em class="required red">*</em>카드 소유주</label>
                                                                    <div class="input-box">
                                                                        <input type="text" placeholder="카드 소유주" id="cc_owner" name="cc_owner" title="카드 소유주" class="input-text validate-cc-duplicate validate-cc-number validate-cc-type" value="" />
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <label for="cc_number" class=""><em class="required red">*</em>카드번호</label>
                                                                    <div class="input-box">
                                                                        <input type="text" placeholder="카드번호" id="cc_number" name="cc_number" title="카드번호" class="input-text validate-cc-duplicate validate-cc-number validate-cc-type" value="" />
                                                                    </div>
                                                                </li>
                                                                <li id="authorizenetcim_cc_type_exp_div">
                                                                    <label class="" for="authorizenetcim_expiration"><em class="required red">*</em> 카드 유효기간</label>
                                                                    <div class="input-box row">
                                                                        <div class="v-fix validate-cc-exp-container col-md-6">
                                                                            <select id="cc_expire_date_month" name="cc_expire_date_month" class="month validate-cc-exp required-entry">
                                                                                <option value="">Month</option>
                                                                                <option value="01">01 - January</option>
                                                                                <option value="02">02 - February</option>
                                                                                <option value="03">03 - March</option>
                                                                                <option value="04">04 - April</option>
                                                                                <option value="05">05 - May</option>
                                                                                <option value="06">06 - June</option>
                                                                                <option value="07">07 - July</option>
                                                                                <option value="08">08 - August</option>
                                                                                <option value="09">09 - September</option>
                                                                                <option value="10">10 - October</option>
                                                                                <option value="11">11 - November</option>
                                                                                <option value="12">12 - December</option>
                                                                            </select>
                                                                        </div>
                                                                        <div class="v-fix col-md-6">
                                                                            <select id="cc_expire_date_year" name="cc_expire_date_year" class="year required-entry">
                                                                                <option value="" selected="selected">Year</option>
                                                                                <c:forEach var="year" begin="${cardStartYear}" end="${cardEndYear}">
                                                                                <option value="${year}">${year}</option>
                                                                                </c:forEach>
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                                <li id="cvv_div">
                                                                    <label class="" for="cc_cvv2"><em class="required red">*</em>카드 보안코드 (CVV2)</label>
                                                                    <div class="input-box">
                                                                        <input id="cc_cvv2" name="cc_cvv2" placeholder="카드 보안코드 (CVV2)" type="text" title="Card Verification Number" class="input-text cvv required-entry validate-cc-cvn" value="" />
                                                                    </div>
                                                                    <br/>
                                                                </li>
                                                                <li id="cvv_div_help">
                                                                    <div id="collapse-reward" class="panel-collapse collapse in" aria-expanded="true" style="user-select: text;">
                                                                        <div class="panel-body">
                                                                          <div class="input-group">
                                                                            <img src="/image/cvv.gif" title="cvv" alt="cvv" class="img-responsive">
                                                                          </div>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </dd>
                                            <dt id="dt_payment_method_bank" style="display:none;">
                                                <div class="custom-radio">
                                                    <input id="payment_method_bank" value="bank" type="radio" name="payment_method_bank" class="radio" />
                                                    <label for="payment_method_bank">은행입금 </label>
                                                </div>
                                            </dt>
                                            <dd id="dd_payment_method_bank" style="display:none;">
                                                <ul id="payment_form_bank" class="payment-method">
                                                    <li id="authorizenetcim_cc_new_card_form">
                                                        <div class="row">
                                                            <ul class="form-list col-md-12">
                                                                <li>
                                                                    <label>우리은행 예금주:</label>
                                                                </li>
                                                                <li>
                                                                    <label>이경원 1002-049-773901 </label>
                                                                </li>
                                                                <li>
                                                                    <label>구매 당일 은행의 송금 보내실 때 환율로 입금하세요.</label>
                                                                </li>
                                                                <li>
                                                                    <label>은행 환율을 보시려면 <span style="color: #ff0000;"><a href="https://spot.wooribank.com/pot/Dream?withyou=FXXRT0011" target="_blank"><span style="color: #ff0000;">여기</span></a></span>를 누르세요.</label>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </dd>
                                        </dl>
                                    </div>
                                </fieldset>
                            </div>
	                    </li>
	                </ol>
	            </div>
	        </div>
	    </div>
	    
	    <div class="row border-active" style="padding: 20px 0px;">
	        <div class="col-md-5 comment">
	            <label for="comment" class="">주문 메모 남기기</label>
	            <textarea class="" name="comment" id="comment" title="Comment">${comment}</textarea>
	        </div>
	        <div class="col-md-7 reward">
	            <c:if test="${rewardTotal!='0'}">
	            <div class="input-box">
	                <label> 구매에 사용할 포인트를 입력하여 주세요. 100포인트가 1불입니다. (사용가능 포인트 : ${ctag:getNumber(rewardTotal)})</label>
                    <input type="text" placeholder="" id="reward" name="reward" title="적립포인트" class="input-text" value="${reward}"  onkeydown='return onlyNumber(event)' onkeyup='removeChar(event)'/>
                    <button type="button" class="button button-small" id="button_reward">적립포인트 사용</button>
                    <label id="reward_error" style="display:none;"></label>
                </div>
                </c:if>
	        </div>
	    </div>
	    
	    <div class="row border-active" id="shopping-cart-div">
            <div class="col-md-8">
                <fieldset>
                    <table id="shopping-cart-table" class="data-table table table-stacked product-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th style="width:45%">제품명</th>
                                <th>모델명</th>
                                <th><span class="nobr">단가</span></th>
                                <th>수량</th>
                                <th>합계</th>
                            </tr>
                        </thead>
                        <tbody>
                            <c:forEach items="${list}" var="item">
                            <tr>
                                <td data-header="이미지" class="image-td">
                                    <div class="product-image-wrapper product-image">
                                        <a href="/product/${item.product_id}.dr" title="${item.name}" class="product-image">
                                           <img src="/image/${item.image}" alt="${item.name}" />
                                        </a>
                                    </div>
                                </td>
                                <td class="product" data-header="제품명">
                                    <input name="product_id" id="product_id" type="hidden" value="${item.product_id }" />
                                    <div class="product-info-container">
                                        <h2 class="product-name" id="div_product_id${item.product_id}">
                                            <a href="/product/${item.product_id}.dr">${item.name}</a>
                                            <c:if test="${item.product_quantity=='0'}">
                                                <p><span class="out-of-stock">재고부족/품절</span></p>
                                            </c:if>
                                        </h2>
                                    </div>
                                </td>
                                <td data-header="모델명" class="a-left match price-td">
                                    ${item.model}
                                </td>
                                <td data-header="단가" class="a-left match price-td">
                                    ${ctag:getProductPrice(item.price,item.special,'cart')}
                                </td>
                                <td data-header="수량" class="a-left quantity">
                                    ${item.quantity}
                                </td>
                                <td data-header="합계" class="a-left match final-price-td">
                                    ${ctag:getCurrency(item.sub_totals)}
                                </td>
                            </tr>
                            </c:forEach>
                            <tr>
                                <td colspan="6" style="text-align:center;padding: 5px;">
                                    <font style="color:#2B5FD8; font-size: 18px;">* 주문완료 버튼을 누른 후에는 </font><font style="color:red;font-size: 20px;">주문 취소가 불가능</font><font style="color:#2B5FD8;font-size: 16px;">합니다.</font>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="6" style="text-align:center;padding: 5px;">
                                    <font style="color:#2B5FD8; font-size: 18px;"> * 반드시 주문 내역을 확인하신 후에 주문을 완료해주십시요!</font>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </fieldset>
            </div>
            <div class="col-md-3 col-md-push-1">
                <div class="cart-collaterals">
                    <h3 class="cart-subtitle">주문 요약</h3>
                    <div class="totals">
                        <table id="shopping-cart-totals-table">
                            <tbody id="shopping-cart-summary">
                                <c:forEach items="${totals}" var="item">
                                    <tr>
                                        <td class="a-left" colspan="1">${item.title}</td>
                                        <td class="a-right">
                                            <span class="price">${ctag:getCurrency(item.value)}</span>
                                            <input type="hidden" name="total_${item.code}" id="total_${item.code}" value="${item.value}"/>
                                        </td>
                                    </tr>
                                </c:forEach>
                            </tbody>

                        </table>
                    </div>
                    <div class="checkout-types-container">
                        <label>
                            <input type="checkbox" name="agree" id="agree" value="1">&nbsp;
                            <a class="agree" href="/information/terms-of-use.dr" target="_blank"><b>이용약관</b></a> 및 
                            <a class="agree" href="/information/return-policy.dr" target="_blank"><b>반품정책</b></a>을 읽고 동의합니다.
                        </label>
                        <ul class="checkout-types">
                            <li>
                            <c:choose>
                            <c:when test="${sessionScope.IS_CART_ERROR}">
                                <button type="button" title="주문완료" class="button btn-proceed-checkout btn-checkout button-white" style="color:#14328c;background-color:#ddd;" disabled>
                                    <span>메세지 확인!</span>
                                </button>
                            </c:when>
                            <c:otherwise>
                                <button type="button" id="button_submit" title="주문완료" class="button btn-proceed-checkout btn-checkout">
                                    <span>주문완료</span>
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
<input type="hidden" id="payment_address_id" name="payment_address_id" value="${payment_address.address_id}"/>
<input type="hidden" id="shipping_address_id" name="shipping_address_id" value="${shipping_address.address_id}"/>
<input type="hidden" id="rewardTotal" name="rewardTotal" value="${rewardTotal}"/>
<input type="hidden" id="payment_method" name="payment_method" value="신용카드"/>
<input type="hidden" id="payment_code" name="payment_code" value="authorizenet_aim"/>
<input type="hidden" id="shippingfee_type" name="shippingfee_type" value="0"/>
</form>
</div>
<%@ include file="/WEB-INF/include/footer.jspf" %>
<script><!--
$('#payment_method_credit').on('click', function() {
	$('#payment_method').val('신용카드');
	$('#payment_code').val('authorizenet_aim');
});

$('#payment_method_bank').on('click', function() {
    $('#payment_method').val('은행입금');
    $('#payment_code').val('bank_transfer');
});

$(".img-responsive").click(function(){
    if ($(this).data('count')) { // already been clicked
        $(this).data('count', $(this).data('count') + 1); // add one
        if ($(this).data('count') == 7) {          
            $("#dt_payment_method_bank").css("display", "");
            $("#dd_payment_method_bank").css("display", "");
            $(this).data('count', 0); 
        } else {
        	$("#dt_payment_method_bank").css("display", "none");
            $("#dd_payment_method_bank").css("display", "none");
        }
    } else { // first click
        $(this).data('count', 1); // initialize the count
    }
});
//--></script>

<script><!--
// 배송방법 선택
$('.shipping_method_carrier').on('click', function() {
	var carrier_index = $('input:radio[name="shipping_method_carrier"]:checked').val();
	var carrier_code = $("#shipping_method_code"+carrier_index).val();
    var carrier_name = $("#shipping_method_name"+carrier_index).val();
	var carrier_cost = $("#shipping_method_cost"+carrier_index).val();
	var params="carrier_code="+carrier_code+"&carrier_name="+carrier_name+"&carrier_cost="+carrier_cost;
	//alert(params);
    $.ajax({
        url:"/checkout/checkout/shipping.dr",
        dataType:"html",
        data:params,
        method: 'post',
        beforeSend: function(xmlHttpRequest) {
            xmlHttpRequest.setRequestHeader("AJAX","true");
            $('#button_reward').prop('disabled', true);
        },
        complete: function() {
            $('#button_reward').prop('disabled', false).button('reset');
        },
        success:function(html){
            //page 자체를 받아서 div에 넣는식
            $("#shopping-cart-summary").html(html);
        },error:function(request,status,error){
        	if(xhr.status==300) {
                alert("자동으로 로그아웃이 되었습니다.\n로그인하신 후에 주문을 다시 진행해 주십시요!");
                location = "/";
            } else
        	if(request.status==400) {
        		alert("장바구니가 비었습니다.\n주문을 다시 진행해 주십시요!");
                location = "/";
            } else {
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        }
    });
});
//--></script>

<script><!--
// Donation
$('#donate').on('click', function() {
	var donate_checked = "0";
    $('#shippingfee_type').val('0');
    if($('#donate').is(':checked')) {
        donate_checked = "1";
        $('#shippingfee_type').val('1');
    }
    var params="donate="+donate_checked+"&shipping_fee="+$('#total_shipping').val();
    //alert(params);
    $.ajax({
        url:"/checkout/checkout/donate.dr",
        dataType:"html",
        data:params,
        method: 'post',
        beforeSend: function(xmlHttpRequest) {
            xmlHttpRequest.setRequestHeader("AJAX","true");
        },
        complete: function() {
        },
        success:function(html){
            //page 자체를 받아서 div에 넣는식
            $("#shopping-cart-summary").html(html);
        },error:function(request,status,error){
            if(xhr.status==300) {
                alert("자동으로 로그아웃이 되었습니다.\n로그인하신 후에 주문을 다시 진행해 주십시요!");
                location = "/";
            } else
            if(request.status==400) {
                alert("장바구니가 비었습니다.\n주문을 다시 진행해 주십시요!");
                location = "/";
            } else {
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        }
    });
});
//--></script>

<script><!--
// 적립금 사용
$('#button_reward').on('click', function() {
	$("#reward_error").hide();
	var reward = $("#reward").val();
	var rewardTotal = $("#rewardTotal").val();
	if(parseInt(reward)>parseInt(rewardTotal)) {
		$("#reward_error").html("<ul class='messages'><li class='error-msg'><ul><li><span><i class='fa fa-exclamation-triangle'></i> 사용가능한 포인트를 확인하십시요.</span></li></ul></li></ul>");
		$("#reward_error").show();
		return false;
	}

    $.ajax({
        url:"/checkout/checkout/reward/"+$("#reward").val()+".dr",
        dataType:"html",
        method: 'post',
        beforeSend: function(xmlHttpRequest) {
            xmlHttpRequest.setRequestHeader("AJAX","true");
            $('#button_reward').prop('disabled', true);
        },
        complete: function() {
            $('#button_reward').prop('disabled', false).button('reset');
        },
        success:function(html){
            //page 자체를 받아서 div에 넣는식
            $("#shopping-cart-summary").html(html);
        },error:function(request,status,error){
        	if(xhr.status==300) {
                alert("자동으로 로그아웃이 되었습니다.\n로그인하신 후에 주문을 다시 진행해 주십시요!");
                location = "/";
            } else
        	if(request.status==400) {
        		alert("장바구니가 비었습니다.\n주문을 다시 진행해 주십시요!");
                location = "/";
            } else {
            	alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        }
    });
});
//--></script>

<script><!--
// 주문처리
$('#button_submit').on('click', function() {
	if(!($("#agree").is(":checked"))){
        alert('이용약관 및 반품정책에 동의하지 않으셨습니다.');
        $("#agree").focus();
        return false;
    }
	if(!confirm("주문하시겠습니까?")) {
        return false;
    }
    $.ajax({
        url: '/checkout/process.dr',
        type: 'post',
        data: $('#form input, #form textarea, #form select'),
        dataType: 'json',
        beforeSend: function(xmlHttpRequest) {
        	$('.wrap-loading').removeClass('display-none');
        	xmlHttpRequest.setRequestHeader("AJAX","true");
            $('#button_submit').prop('disabled', true);
        },
        complete: function() {
        	//$('.wrap-loading').addClass('display-none');
            $('#button_submit').prop('disabled', false).button('reset');
        },
        success: function(json) {
            $('input').removeClass('validation-failed');
            $('select').removeClass('validation-failed');
            $('.validation-advice').remove();
            $('.messages').remove();
        
            if (json.Message.success) {
            	location = "/checkout/confirm.dr";
            } else
            if(json.Message.error) {
            	$('.wrap-loading').addClass('display-none');
            	if (json.Message.error) {
            		$("#shopping-cart-div").after("<ul class='messages'><li class='error-msg'><ul><li><span><i class='fa fa-exclamation-triangle'></i> " + json.Message.errorMessage + "</span></li></ul></li></ul>");
            	}
            	if (json.Message.error_out_of_stock) {
                    $('#div_product_id'+json.Message.error_out_of_stock_product_id).append(json.Message.error_out_of_stock);
                }
                if (json.Message.error_cc_owner) {
                    $('#cc_owner').addClass('validation-failed');
                    $('input[name=\'cc_owner\']').after('<div class="validation-advice"> ' + json.Message.error_cc_owner + '</div>');
                }
                if (json.Message.error_cc_number) {
                    $('#cc_number').addClass('validation-failed');
                    $('input[name="cc_number"]').after('<div class="validation-advice"> ' + json.Message.error_cc_number + '</div>');
                }
                if (json.Message.error_cc_expire_date_month) {
                    $('#cc_expire_date_month').addClass('validation-failed');
                    $('select[name=\'cc_expire_date_month\']').after('<div class="validation-advice"> ' + json.Message.error_cc_expire_date_month + '</div>');
                }
                if (json.Message.error_cc_expire_date_year) {
                    $('#cc_expire_date_year').addClass('validation-failed');
                    $('select[name=\'cc_expire_date_year\']').after('<div class="validation-advice"> ' + json.Message.error_cc_expire_date_year + '</div>');
                }
                if (json.Message.error_cc_cvv2) {
                    $('#cc_cvv2').addClass('validation-failed');
                    $('input[name=\'cc_cvv2\']').after('<div class="validation-advice"> ' + json.Message.error_cc_cvv2 + '</div>');
                }
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
        	$('.wrap-loading').addClass('display-none');
        	if(xhr.status==300) {
                alert("자동으로 로그아웃이 되었습니다.\n로그인하신 후에 주문을 다시 진행해 주십시요!");
                location = "/";
            } else
        	if(xhr.status==400) {
        		alert("장바구니가 비었습니다.\n주문을 다시 진행해 주십시요!");
        		location = "/";
        	} else {
        		alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
        	}
        }
    });
});
//--></script>
<%@ include file="/WEB-INF/include/end.jspf" %>