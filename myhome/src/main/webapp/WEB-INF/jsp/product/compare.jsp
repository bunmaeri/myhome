<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>

<div class="banner banner__category">
    <div class="container-fluid">
        <div class="vertical-align">
            <header class="page-title">
                <h1>상품비교</h1>
            </header>
        </div>
    </div>
</div>

<div class="main" role="main">
    <div class="container-fluid padding-left40">
		<div class="compare-container">
		    <table class="data-table" style="width:100%" id="product_comparison">
		            <tr class="action">
                        <td class="label" style="width:10%"></td>
                        <c:forEach items="${products}" var="product">
                        <td style="width:${product.th}%">
                            <button type="button" title="Add to Cart" class="button button-plain button-small" onclick="addItemToCart(${product.product_id});">
                                <span>장바구니에 추가</span>
                            </button><br/>
                            <a href="/products/compare/delete/${product.product_id}.dr" class="button button-small button-white" style="margin-top:10px;">
                                <i class="fa fa-trash-o"></i> 삭제
                            </a>
                        </td>
                        </c:forEach>
                    </tr>
		            <tr>
		                <th class="label">&nbsp;</th>
		                <c:forEach items="${products}" var="product">
		                <td>
							<p class="product-image">
							    <a href="/product/${product.product_id}.dr" class="image" title="${product.name}">
							        <img src="/image/${product.image}" style="height:200px;width:auto;" alt="${product.name}" />
							        ${ctag:getSaleImage(product.special)}
							    </a>
							</p>
		                    <h3 class="product-name"><a href="/product/${product.product_id}.dr" title="${product.name}">${product.name}</a></h3>
		                </td>
		                </c:forEach>
		            </tr>
		            <tr class="price">
		                <td class="label">판매가격</td>
		                <c:forEach items="${prices}" var="price">
		                <td>
		                    <div class="std">${ctag:getPrice(price.price,price.special)}</div>
		                </td>
		                </c:forEach>
		            </tr>
		            <tr class="model">
		                <td class="label">모델</td>
		                <c:forEach items="${models}" var="model">
		                <td>
		                    <div class="std">${model}</div>
		                </td>
		                </c:forEach>
		            </tr>
		            <tr class="manufacturer">
		                <td class="label">제조사</td>
		                <c:forEach items="${manufacturers}" var="manufacturer">
                        <td>
                            <div class="std">${manufacturer}</div>
                        </td>
                        </c:forEach>
		            </tr>
		            <tr class="availability">
                        <td class="label">재고현황</td>
                        <c:forEach items="${availabilitys}" var="availability">
                        <td>
                            <div class="std">${availability}</div>
                        </td>
                        </c:forEach>
                    </tr>
                    <tr class="weight" id="ID_product_top">
                        <td class="label">무게</td>
                        <c:forEach items="${weights}" var="weight">
                        <td>
                            <div class="std">${ctag:getDouble(weight)} LB</div>
                        </td>
                        </c:forEach>
                    </tr>
                    <tr class="description"  id="DIV_tab_group">
                        <td class="label">제품설명</td>
                        <c:forEach items="${descriptions}" var="description">
                        <td>
                            <div class="overlay"></div>
                            <div class="std" id="DIV_description"><c:out value="${description}" escapeXml="false"/></div>
                        </td>
                        </c:forEach>
                    </tr>
                    <tr class="action">
                        <td class="label"></td>
                        <c:forEach items="${products}" var="product">
                        <td>
                            <button type="button" title="Add to Cart" class="button button-plain button-small" onclick="addItemToCart(${product.product_id});">
                                <span>장바구니에 추가</span>
                            </button><br/>
                            <a href="/products/compare/delete/${product.product_id}.dr" class="button button-small button-white" style="margin-top:10px;">
                                <i class="fa fa-trash-o"></i> 삭제
                            </a>
                        </td>
                        </c:forEach>
                    </tr>
		    </table>
		</div>
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
	var top = $('#DIV_tab_group').offset();
    var height = $('#DIV_tab_group').height();
    $(".overlay").css("top",top.top);
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
    var top = $(window).scrollTop();
    var speed          = 100;
    var easing         = 'linear';
    var $layer         = $('#floatR');
    var layerTopOffset = 185;
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
<script type="text/javascript">
//<![CDATA[
    function addItemToCart(product_id) {
        var url = '/account/product/add_to_cart/'+product_id+'/1/products_compare.dr';
        setLocation(url);
    }
//]]>
</script>
<%@ include file="/WEB-INF/include/footer.jspf" %>
<%@ include file="/WEB-INF/include/end.jspf" %>