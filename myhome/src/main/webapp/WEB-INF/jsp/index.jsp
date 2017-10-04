<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/include/header.jspf" %>
<div id="global-messages" class="container-fluid"></div>
    <div class="main" role="main" style="padding-top:0;padding-bottom:0;">
        <div class="std">
            <section class="hero banner" data-bg="/image/${notice1.image}" style="padding-bottom:25.3%;background-image: url('/image/${notice1.image}');">
            </section> 
            
            <section class="banner" data-bg="/image/${notice2.image}">
			    <div class="container-fluid">
			        <div class="vertical-align">
			            ${notice2.description}
			        </div>
			    </div>
			</section>

			<section class="banner banner__align-right" data-bg="/image/${notice3.image}">
			    <div class="container-fluid">
			        <div class="vertical-align vertical-align-second">
                        ${notice3.description}
			        </div>
			    </div>
			</section>
        </div>    
    </div>
        
<%@ include file="/WEB-INF/include/footer.jspf" %>
<%-- <%@ include file="/WEB-INF/include/script_index.jspf" %> --%>
<%@ include file="/WEB-INF/include/end.jspf" %>
