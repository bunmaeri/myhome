package myhome.common.session;

import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import org.apache.log4j.Logger;

public class SessionCounterListener implements HttpSessionListener {
	Logger log = Logger.getLogger(this.getClass());
	static private int activeSessions;

   public static int getActiveSessions() {
        return activeSessions;
    }

   @Override
    public void sessionCreated(HttpSessionEvent arg0) {
        activeSessions++;
        log.debug("Created!! activeSessions : " + activeSessions);
        System.err.println("Created!! activeSessions : " + activeSessions);
    }

   @Override
    public void sessionDestroyed(HttpSessionEvent arg0) {
        activeSessions--;
        log.debug("Destoryed!! activeSessions : " + activeSessions);
        System.err.println("Destoryed!! activeSessions : " + activeSessions);
    }
}