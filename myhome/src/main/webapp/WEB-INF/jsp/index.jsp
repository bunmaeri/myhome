<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>
<div id="global-messages" class="container-fluid"></div>
    <div class="main" role="main" style="padding-top:0;padding-bottom:0;">
        <div class="std">
            <section class="hero banner" data-bg="/image/banner/banner.jpg?20170823" style="padding-bottom:25.3%;background-image: url('/image/banner/banner.jpg?20170823');">
            </section> 
            
            <section class="banner" data-bg="/image/banner_apple.jpg?20170921">
			    <div class="container-fluid">
			        <div class="vertical-align">
			            ${notice1.description}
			        </div>
			    </div>
			</section>

			<section class="banner banner__align-right" data-bg="/image/banner_strawberry.jpg?20170921">
			    <div class="container-fluid">
			        <div class="vertical-align vertical-align-second">
                        ${notice2.description}
			        </div>
			    </div>
			</section>
        </div>    
    </div>
        
<%@ include file="/WEB-INF/include/footer.jspf" %>
<%-- <%@ include file="/WEB-INF/include/script_index.jspf" %> --%>
<%@ include file="/WEB-INF/include/end.jspf" %>
