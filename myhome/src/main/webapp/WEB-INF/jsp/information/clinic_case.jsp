<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>
<div class="banner banner__category">
    <div class="container-fluid">
        <div class="vertical-align">
            <header class="page-title">
                <h1>
                    <img src="/image/${map.image}" alt="${map.title}" title="${map.title}" style="vertical-align: middle;"> ${map.title}
                </h1>
            </header>
        </div>
    </div>
</div>
<div id="global-messages" class="container-fluid"></div>
<div class="main" role="main">
    <div class="container-fluid">
        <div class="std">
            <div class="container-fluid" style="margin-top:30px;">
                <div class="row">
                    <div class="col-md-8 text-justify" id="DIV_tab_group">
                        <h5 style="font-size:24px;color:#14328c;font-weight:600;">${dto.title}</h5>
                        <div class="overlay"></div>
                        <div id="description">${dto.description}</div>
                    </div>
                    <div class="col-md-3 col-md-push-1">
                        <ul class="product-list-subset">
                        <c:forEach items="${list}" var="item">
                            <li><h5 style="font-size:16px;"><a href='/information/clinic/case/${item.contents_id}.dr'>${item.title}</a></h5></li>
                        </c:forEach>
                        </ul>
                    </div>
                </div>
            </div>
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
    var top = 0;
    var height = $('#DIV_tab_group').height()+50;
    $(".overlay").css("top",top);
    $(".overlay").css("height",height);
    
    var size = $("#description").find('a').size();
    if(size>0) {
        $("#description").find('a').each(function(){
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
    $win.scrollTop(0);
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