package myhome.common.dto;

import java.io.Serializable; 

public class CustomerDTO implements Serializable {

	private static final long serialVersionUID = 1L;
	private String customer_id;
	private String customer_group_id;
	private String language_id;
	private String customer_name;
	private String firstname;
	private String lastname;
	private String email;
	private String telephone;
	private String fax;
	private String password;
	private String salt;
	private String address_id;
	private String shipping_address_id;
	private String requisition_id;
	private String join_path_id;
	private String join_path_etc;
	private String myhomedoc;
	
	public String getId() {
		return customer_id;
	}
	public void setId(String id) {
		this.customer_id = id;
	}
	public String getCustomerId() {
		return customer_id;
	}
	public void setCustomerId(String customer_id) {
		this.customer_id = customer_id;
	}
	public String getCustomerGroupId() {
		return customer_group_id;
	}
	public void setCustomerGroupId(String customer_group_id) {
		this.customer_group_id = customer_group_id;
	}
	public String getLanguageId() {
		return language_id;
	}
	public void setLanguageId(String language_id) {
		this.language_id = language_id;
	}
	public String getCustomerName() {
		return customer_name;
	}
	public void setCustomerName(String customer_name) {
		this.customer_name = customer_name;
	}
	public String getFirstname() {
		return firstname;
	}
	public void setFirstname(String firstname) {
		this.firstname = firstname;
	}
	public String getLastname() {
		return lastname;
	}
	public void setLastname(String lastname) {
		this.lastname = lastname;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getTelephone() {
		return telephone;
	}
	public void setTelephone(String telephone) {
		this.telephone = telephone;
	}
	public String getFax() {
		return fax;
	}
	public void setFax(String fax) {
		this.fax = fax;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getSalt() {
		return salt;
	}
	public void setSalt(String salt) {
		this.salt = salt;
	}
	public String getAddressId() {
		return address_id;
	}
	public void setAddressId(String address_id) {
		this.address_id = address_id;
	}
	public String getShippingAddressId() {
		return shipping_address_id;
	}
	public void setShippingAddressId(String shipping_address_id) {
		this.shipping_address_id = shipping_address_id;
	}
	public String getRequisitionId() {
		return requisition_id;
	}
	public void setRequisitionId(String requisition_id) {
		this.requisition_id = requisition_id;
	}
	public String getJoinPathId() {
		return join_path_id;
	}
	public void setJoinPathId(String join_path_id) {
		this.join_path_id = join_path_id;
	}
	public String getJoinPathEtc() {
		return join_path_etc;
	}
	public void setJoinPathEtc(String join_path_etc) {
		this.join_path_etc = join_path_etc;
	}
	public String getMyhomedoc() {
		return myhomedoc;
	}
	public void setMyhomedoc(String myhomedoc) {
		this.myhomedoc = myhomedoc;
	}

}
