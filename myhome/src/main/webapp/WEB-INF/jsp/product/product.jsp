<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>

<div id="global-messages" class="container-fluid"></div>
<div class="main padding-top50" role="main">
    <script type="text/javascript">
        var optionsPrice = new Product.OptionsPrice([]);
    </script>
    <div class="container-fluid">
        <div id="messages_product_view"></div>
    </div>
    <div class="product-view simple">
        <div class="container-fluid product-essential">
        ${ctag:getErrorString(errorMsg)}
            <div class="row" id="ID_product_top">
                <div class="col-md-6">
                    <div class="product-img-box">
                        <div class="product-image row">
                            <div class="col-md-12">
                                <div id="product-carousel" class="gor-carousel">
                                    <div class="item">
                                        <img class="lazyOwl" src="/image/${info.image}" data-src="/image/${info.image}" data-thumb="/image/${info.image}" title="${info.name}" alt="${info.name}" />
                                        ${ctag:getSaleImage(info.special)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
			        <div class="product-shop">
			            <form action="" method="post" id="product_addtocart_form">
			                <div class="no-display">
			                    <input type="hidden" name="product_id" id="product_id" value="${info.product_id}" />
			                </div>
			                <div class="product-main-info">
			                    <div class="product-name">
			                        <h1>${info.name}</h1>
			                    </div>
			                    <p class="product-ids">상품코드: ${info.model}</p>
			                    <p class="product-ids">원 산 지: ${info.location_name}</p>
			                    <p class="product-ids">재고현황: ${info.stock_status_name}</p>
			                    <div class="price-box">
                                    <div class="price-size-label-container">
                                        <div id="price-label">${ctag:getPrice(info.price,info.special)}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="add-to-box">
                                <div class="add-to-cart">
                                    <div class="cart-qty">
                                        <button class="cart-qty__minus"><i class="fa fa-minus" aria-hidden="true"></i></button>
                                        <input type="text" name="qty" id="qty" maxlength="12" value="1" title="Qty" class="input-text qty" />
                                        <button class="cart-qty__plus"><i class="fa fa-plus" aria-hidden="true"></i></button>
                                    </div>
                                </div>
								<c:choose>
                                <c:when test="${info.stock_status_id=='7'}">
                                <button type="button" title="Add to Cart" class="button button-plain button-default btn-cart" onclick="addItemToCart(${info.product_id});">
                                    <span>장바구니에 추가</span>
                                </button>
                                </c:when>
                                <c:otherwise>
                                <button type="button" title="Add to Cart" class="button button-plain button-default btn-cart" disabled>
                                    <span>${info.stock_status_name}</span>
                                </button>
                                </c:otherwise>
                                </c:choose>
								<c:choose>
								<c:when test="${isWishlist==null || isWishlist==0}">
                                <a href="javascript:;" onclick="addItemToWishlist(${info.product_id});" class="link-wishlist button button-default button-plain button-white" style="border-color:#14328c;">
                                    위시리스트에 추가
                                </a>
                                </c:when>
                                <c:otherwise>
                                <button type="button" title="Add to Cart" class="link-wishlist button button-default button-plain button-white"  style="border-color:#14328c;" disabled>
                                    <span>위시리스트에 추가되었습니다</span>
                                </button>
                                </c:otherwise>
                                </c:choose>
                                <!-- <a href="/product/favorites/add/${info.product_id}.dr" onclick="productAddToCartForm.submit(this, this.href); return false;" class="link-wishlist button button-small button-plain button-white">
                                    친구에게 메일보내기
                                </a> -->
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <div class="pdp-seprator">
            <i class="icon-down-carrot" onclick="Gorilla.utilities.scrollTo(jQuery('.product-collateral'),'', 250)"></i>
	    </div>
        <div class="container-fluid  padding-left40">
	        <div class="row product-collateral-container">
	            <div class="col-md-8" id="DIV_tab_group">
	                <div class="product-collateral">
	                    <div id="collateral-tabs" class="collateral-tabs product-tabs">
	                        <div class="m-item">
	                            <div id="description" class="accordion-content tabs-content description">
	                                <div class="tab-content inner">
	                                    <div class="std">
	                                        <div class="overlay"></div>
	                                        <div class='gendesc' id="DIV_description">${info.description}</div>
	                                    </div>
	                                </div>
	                            </div>
	                        </div>
	                    </div>
	                </div>
	            </div>
                <div class="col-md-4">
                    <div class="product-sidebar">
                        <div class="block block-list block-viewed">
                            <div class="block-title">
				                <strong><span>최근 본 제품</span></strong>
				            </div>
				            <div class="block-content">
				                <ol id="recently-viewed-items">
				                <c:forEach items="${recently}" var="item">
				                    <li class="item">
                                        <a href="/product/${item.product_id}.dr" class="product-image">
                                            <img class="gor-lazy" src="/image/${item.image}" data-src="/image/${item.image}" width="70" alt="${item.name}" title="${item.name}" />
                                        </a>
                                        <p class="product-name"><a href="/product/${item.product_id}.dr">${item.name}</a></p>
                                    </li>
                                </c:forEach>
				                </ol>
				                <script type="text/javascript">decorateList('recently-viewed-items');</script>
				            </div>
				        </div>
	                </div>
	            </div>
	        </div>
        </div>
<script type="text/javascript">
//<![CDATA[
    function addItemToCart(product_id) {
        var quantity = $('#qty').val();
        //var url = '/account/product/add_to_cart/'+product_id+'/'+quantity+'/account_wishlist.dr';
        var url = '/account/product/add_to_cart/'+product_id+'/'+quantity+'/product_'+product_id+'.dr';
        setLocation(url);
    }
    function addItemToWishlist(product_id) {
    	var quantity = $('#qty').val();
        var url = '/account/wishlist/add/'+product_id+'/'+quantity+'.dr';
        setLocation(url);
    }
//]]>
</script>
    </div>
</div>
<div id="floatR">
    <div id="floatMenu">
      <div id="floatMenuTitle">
        <font style="font-size:14px;color:#FFF;">본문 링크</font>
        <div id="floatMenuTitleView" style="float:right;padding-right:3px;font-size:12px;color:#FFF;text-decoration:underline;">닫기 <i class="fa fa-chevron-up"></i></div>
      </div>
      <div id="DIV_href" style="padding: 5px;font-size: 13px;"></div>
    </div>
    <div id="floatMenuFold" style="display:none;">
      <div id="floatMenuTitle">
        <div id="floatMenuTitleFold" style="font-size:14px;color:#FFF;text-decoration:underline;">열기 <i class="fa fa-chevron-down"></i></div>
      </div>
    </div>
</div>
<script type="text/javascript"><!--
$(document).ready(function() {
    var top = 0;
    var height = $('#DIV_tab_group').height()+50;
    $(".overlay").css("top",top);
    $(".overlay").css("height",height);
    
    var size = $("#DIV_description").find('a').size();
    if(size>0) {
        $("#DIV_description").find('a').each(function(){
            var add_href = '<a href="'+$(this).attr('href')+'" rel="noopener noreferrer" target="_blank"><i class="fa fa-external-link" aria-hidden="true"></i> '+$(this).text()+'</a><br>';
            $('#DIV_href').append(add_href);
        });
        $('#floatR').show();
    } else {
        $('#floatR').hide();
    }
    
    var $win = $(window);
    var top = $(window).scrollTop(); // 현재 스크롤바의 위치값을 반환합니다.
    var speed          = 100;     // 따라다닐 속도 : "slow", "normal", or "fast" or numeric(단위:msec)
    var easing         = 'linear'; // 따라다니는 방법 기본 두가지 linear, swing
    var $layer         = $('#floatR'); // 레이어 셀렉팅
    var layerTopOffset = 185;   // 레이어 높이 상한선, 단위:px
    if (top > 0 ) {
        $win.scrollTop(layerTopOffset+top);
    } else {
        $win.scrollTop(layerTopOffset);
    }
    $(window).scroll(function(){
        yPosition = $win.scrollTop() + 185;
        if (yPosition < 0) {
            yPosition = 185;
        }
        $layer.animate({"top":yPosition }, {duration:speed, easing:easing, queue:false});
    });
});

$('#floatMenuTitleView').on('click', function() {
    $('#floatMenu').hide();
    $('#floatMenuFold').show();
    //$('#floatR').css('min-height:','30px').css('top:','95%');
});
$('#floatMenuTitleFold').on('click', function() {
    $('#floatMenu').show();
    $('#floatMenuFold').hide();
    //$('#floatR').css('min-height:','100px').css('top:','350px');
});
//--></script>
<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>