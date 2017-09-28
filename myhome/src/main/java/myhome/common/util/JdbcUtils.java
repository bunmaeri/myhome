package myhome.common.util;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SimpleDriverDataSource;

public class JdbcUtils {
	public JdbcUtils() {
	}
	
	public static JdbcTemplate getInstance() {
		try {
			SimpleDriverDataSource dataSource = new SimpleDriverDataSource();
	        dataSource.setDriver(new com.mysql.jdbc.Driver());
	        dataSource.setUrl("jdbc:mysql://208.72.223.11/drpure_database");
	        dataSource.setUsername("drpure_user");
	        dataSource.setPassword("Notafan12?");
	         
	        return new JdbcTemplate(dataSource);
		} catch(Exception e) {
			e.printStackTrace();
		}
		return null;
	}
}
