package myhome.common.filter;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * BCrypt 비밀번호 암호화, 비교 
 * @author jo
 *
 */
public class PasswordEncoding implements PasswordEncoder {
	private PasswordEncoder passwordEncoder;

	public PasswordEncoding() {
		this.passwordEncoder = new BCryptPasswordEncoder();
	}

	public PasswordEncoding(PasswordEncoder passwordEncoder) {
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public String encode(CharSequence rawPassword) {
		return passwordEncoder.encode(rawPassword);
	}

	@Override
	public boolean matches(CharSequence rawPassword, String encodedPassword) {
		return passwordEncoder.matches(rawPassword, encodedPassword);
	}
}
