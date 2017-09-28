package myhome.account.service;

import java.util.Map;

import myhome.common.dto.CustomerDTO;

public interface LoginService {

	/**
	 * 로그인 공지사항을 조회한다.
	 * @param map
	 * @return
	 * @throws Exception
	 */
	Map<String, Object> loginContent(Map<String, Object> map) throws Exception;
	
	/**
	 * 로그인
	 * @param map
	 * @return
	 * @throws Exception
	 */
    CustomerDTO login(Map<String, Object> map) throws Exception;
    
    /**
	 * 고객정보 조회
	 * @param map
	 * @return
	 * @throws Exception
	 */
    CustomerDTO customer(String customer_id) throws Exception;
    
    /**
	 * CODE로 로그인 (비밀번호 찾기 링크로 들어왔을 때)
	 * @param map
	 * @return
	 * @throws Exception
	 */
    CustomerDTO loginByCode(Map<String, Object> map) throws Exception;
    
    /**
	 * 고객의 그룹을 조회한다.
	 * @param map
	 * @return
	 * @throws Exception
	 */
	Map<String, Object> checkCustomerGroupReward(Map<String, Object> map) throws Exception;
	
	/**
	 * 고객 그룹명을 가져온다.
	 * @param map
	 * @return
	 * @throws Exception
	 */
	Map<String, Object> customerGroupName(Map<String, Object> map) throws Exception;
	
	/**
	 * 가입경로명을 가져온다.
	 * @param map
	 * @return
	 * @throws Exception
	 */
	Map<String, Object> joinPathName(Map<String, Object> map) throws Exception;
    
    /**
	 * 회원 등록
	 */
	void addCustomer(Map<String, Object> map) throws Exception;
	
	/**
	 * 회원 로그인 이력 추가
	 */
	void addCustomerLogin(Map<String, Object> map) throws Exception;
}
