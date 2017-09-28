package myhome.common.filter;

import java.util.Hashtable;

import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionBindingEvent;
import javax.servlet.http.HttpSessionBindingListener;

import org.apache.log4j.Logger;

public class SessionBox implements HttpSessionBindingListener {
	private Logger log = Logger.getLogger(this.getClass());

    private String rmsg = "";

    //  thread safe! do not change to HashMap
    private static Hashtable<String, Object> sessionBox = new Hashtable<String, Object>();

    public SessionBox(String p) {
        rmsg = p;
    }
    
    /**
     * 세션 체크
     * @param arg0
     */
    public String chkSession(String rmsg) {
        HttpSession session = null;

        // 세션이 사용중이면 "Y"
        if ( sessionBox.containsKey(rmsg)) {
            session = (HttpSession) sessionBox.get(rmsg);

            log.debug("session is useing [" + session + "]");
            return "Y";
        }
        log.debug(sessionBox.toString());
        return "N";

    }

    /**
     * 세션이 만들어질때,
     * @param arg0
     */
    public void valueBound(HttpSessionBindingEvent arg0) {
        log.debug("wow created [" + rmsg + "]");
        HttpSession session = null;

        if ( sessionBox.containsKey(rmsg)) {
            session = (HttpSession) sessionBox.get(rmsg);

            log.debug("session is invalidate [" + session + "]");
            session.invalidate();
        }
        sessionBox.put(rmsg,arg0.getSession());
        log.debug("new session is bound [" + arg0.getSession() + "]");
        log.debug(sessionBox.toString());
    }

    /* 세션이 삭제될때
     * @see javax.servlet.http.HttpSessionBindingListener#valueUnbound(javax.servlet.http.HttpSessionBindingEvent)
     */
    public void valueUnbound(HttpSessionBindingEvent arg0) {

        log.debug("wow destroyed  [" + rmsg + "]");
        sessionBox.remove(rmsg);
        log.debug(sessionBox.toString());

    }

    /**
     * @return
     */
    public static Hashtable<String, Object> getSessionBox() {
        return sessionBox;
    }

    /**
     * @param hashtable
     */
    public static void setSessionBox(Hashtable<String, Object> hashtable) {
        sessionBox = hashtable;
    }

}
