package myhome.account.service;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

import myhome.account.dao.AccountDAO;
import myhome.common.dto.CustomerDTO;

@Service("loginService")
public class LoginServiceImpl implements LoginService{
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name="accountDAO")
	private AccountDAO accountDAO;
	
	/**
	 * 로그인 공지사항을 조회한다.
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@Override
	public Map<String, Object> loginContent(Map<String, Object> map) throws Exception {
		return accountDAO.loginContent(map);
	}
	
	/**
	 * 로그인
	 */
	@Override
	public CustomerDTO login(Map<String, Object> map) throws Exception {
		CustomerDTO customer = accountDAO.login(map);
		
		return customer;
	}
	
	/**
	 * 고객정보 & 주소 조회
	 * @param customer_id
	 */
	@Override
	public CustomerDTO customerAndAddress(String customer_id) throws Exception {
		return accountDAO.customerAndAddress(customer_id);
	}
	
	/**
	 * 고객정보 조회
	 */
	@Override
	public CustomerDTO customer(String customer_id) throws Exception {
		CustomerDTO customer = accountDAO.customer(customer_id);
		
		return customer;
	}

	/**
	 * CODE로 로그인 (비밀번호 찾기 링크로 들어왔을 때)
	 */
	@Override
	public CustomerDTO loginByCode(Map<String, Object> map) throws Exception {
		CustomerDTO customer = accountDAO.loginByCode(map);
		
		return customer;
	}
	
	/**
	 * 고객의 그룹을 조회한다.
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@Override
	public Map<String, Object> checkCustomerGroupReward(Map<String, Object> map) throws Exception {
		Map<String, Object> resultMap = new HashMap<String,Object>();
		Map<String, Object> tempMap = accountDAO.checkCustomerGroupReward(map);
		resultMap.put("map", tempMap);
		
		return resultMap;
	}
	
	/**
	 * 고객 그룹명을 가져온다.
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@Override
	public Map<String, Object> customerGroupName(Map<String, Object> map) throws Exception {
		Map<String, Object> resultMap = new HashMap<String,Object>();
		Map<String, Object> tempMap = accountDAO.customerGroupName(map);
		resultMap.put("map", tempMap);
		
		return resultMap;
	}
	
	/**
	 * 가입경로명을 가져온다.
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@Override
	public Map<String, Object> joinPathName(Map<String, Object> map) throws Exception {
		Map<String, Object> resultMap = new HashMap<String,Object>();
		Map<String, Object> tempMap = accountDAO.joinPathName(map);
		resultMap.put("map", tempMap);
		
		return resultMap;
	}
	
	/**
	 * 회원 등록
	 */
	@Override
	public void addCustomer(Map<String, Object> map) throws Exception {
		accountDAO.addCustomer(map);
	}
	
	/**
	 * 회원 로그인 이력 추가
	 */
	@Override
	public void addCustomerLogin(Map<String, Object> map) throws Exception {
		accountDAO.addCustomerLogin(map);
	}
	
	/**
	 * 회원 비밀번호 이력 추가
	 */
	@Override
	public void addCustomerString(Map<String, Object> map) throws Exception {
		accountDAO.addCustomerString(map);
	}
}
