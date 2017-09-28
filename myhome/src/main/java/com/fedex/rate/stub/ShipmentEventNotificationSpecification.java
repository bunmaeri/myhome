/**
 * ShipmentEventNotificationSpecification.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package com.fedex.rate.stub;

public class ShipmentEventNotificationSpecification  implements java.io.Serializable {
    private com.fedex.rate.stub.ShipmentNotificationRoleType role;

    private com.fedex.rate.stub.NotificationEventType[] events;

    private com.fedex.rate.stub.NotificationDetail notificationDetail;

    private com.fedex.rate.stub.ShipmentNotificationFormatSpecification formatSpecification;

    public ShipmentEventNotificationSpecification() {
    }

    public ShipmentEventNotificationSpecification(
           com.fedex.rate.stub.ShipmentNotificationRoleType role,
           com.fedex.rate.stub.NotificationEventType[] events,
           com.fedex.rate.stub.NotificationDetail notificationDetail,
           com.fedex.rate.stub.ShipmentNotificationFormatSpecification formatSpecification) {
           this.role = role;
           this.events = events;
           this.notificationDetail = notificationDetail;
           this.formatSpecification = formatSpecification;
    }


    /**
     * Gets the role value for this ShipmentEventNotificationSpecification.
     * 
     * @return role
     */
    public com.fedex.rate.stub.ShipmentNotificationRoleType getRole() {
        return role;
    }


    /**
     * Sets the role value for this ShipmentEventNotificationSpecification.
     * 
     * @param role
     */
    public void setRole(com.fedex.rate.stub.ShipmentNotificationRoleType role) {
        this.role = role;
    }


    /**
     * Gets the events value for this ShipmentEventNotificationSpecification.
     * 
     * @return events
     */
    public com.fedex.rate.stub.NotificationEventType[] getEvents() {
        return events;
    }


    /**
     * Sets the events value for this ShipmentEventNotificationSpecification.
     * 
     * @param events
     */
    public void setEvents(com.fedex.rate.stub.NotificationEventType[] events) {
        this.events = events;
    }

    public com.fedex.rate.stub.NotificationEventType getEvents(int i) {
        return this.events[i];
    }

    public void setEvents(int i, com.fedex.rate.stub.NotificationEventType _value) {
        this.events[i] = _value;
    }


    /**
     * Gets the notificationDetail value for this ShipmentEventNotificationSpecification.
     * 
     * @return notificationDetail
     */
    public com.fedex.rate.stub.NotificationDetail getNotificationDetail() {
        return notificationDetail;
    }


    /**
     * Sets the notificationDetail value for this ShipmentEventNotificationSpecification.
     * 
     * @param notificationDetail
     */
    public void setNotificationDetail(com.fedex.rate.stub.NotificationDetail notificationDetail) {
        this.notificationDetail = notificationDetail;
    }


    /**
     * Gets the formatSpecification value for this ShipmentEventNotificationSpecification.
     * 
     * @return formatSpecification
     */
    public com.fedex.rate.stub.ShipmentNotificationFormatSpecification getFormatSpecification() {
        return formatSpecification;
    }


    /**
     * Sets the formatSpecification value for this ShipmentEventNotificationSpecification.
     * 
     * @param formatSpecification
     */
    public void setFormatSpecification(com.fedex.rate.stub.ShipmentNotificationFormatSpecification formatSpecification) {
        this.formatSpecification = formatSpecification;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof ShipmentEventNotificationSpecification)) return false;
        ShipmentEventNotificationSpecification other = (ShipmentEventNotificationSpecification) obj;
        if (obj == null) return false;
        if (this == obj) return true;
        if (__equalsCalc != null) {
            return (__equalsCalc == obj);
        }
        __equalsCalc = obj;
        boolean _equals;
        _equals = true && 
            ((this.role==null && other.getRole()==null) || 
             (this.role!=null &&
              this.role.equals(other.getRole()))) &&
            ((this.events==null && other.getEvents()==null) || 
             (this.events!=null &&
              java.util.Arrays.equals(this.events, other.getEvents()))) &&
            ((this.notificationDetail==null && other.getNotificationDetail()==null) || 
             (this.notificationDetail!=null &&
              this.notificationDetail.equals(other.getNotificationDetail()))) &&
            ((this.formatSpecification==null && other.getFormatSpecification()==null) || 
             (this.formatSpecification!=null &&
              this.formatSpecification.equals(other.getFormatSpecification())));
        __equalsCalc = null;
        return _equals;
    }

    private boolean __hashCodeCalc = false;
    public synchronized int hashCode() {
        if (__hashCodeCalc) {
            return 0;
        }
        __hashCodeCalc = true;
        int _hashCode = 1;
        if (getRole() != null) {
            _hashCode += getRole().hashCode();
        }
        if (getEvents() != null) {
            for (int i=0;
                 i<java.lang.reflect.Array.getLength(getEvents());
                 i++) {
                java.lang.Object obj = java.lang.reflect.Array.get(getEvents(), i);
                if (obj != null &&
                    !obj.getClass().isArray()) {
                    _hashCode += obj.hashCode();
                }
            }
        }
        if (getNotificationDetail() != null) {
            _hashCode += getNotificationDetail().hashCode();
        }
        if (getFormatSpecification() != null) {
            _hashCode += getFormatSpecification().hashCode();
        }
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(ShipmentEventNotificationSpecification.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://fedex.com/ws/rate/v20", "ShipmentEventNotificationSpecification"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("role");
        elemField.setXmlName(new javax.xml.namespace.QName("http://fedex.com/ws/rate/v20", "Role"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://fedex.com/ws/rate/v20", "ShipmentNotificationRoleType"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("events");
        elemField.setXmlName(new javax.xml.namespace.QName("http://fedex.com/ws/rate/v20", "Events"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://fedex.com/ws/rate/v20", "NotificationEventType"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
        elemField.setMaxOccursUnbounded(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("notificationDetail");
        elemField.setXmlName(new javax.xml.namespace.QName("http://fedex.com/ws/rate/v20", "NotificationDetail"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://fedex.com/ws/rate/v20", "NotificationDetail"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("formatSpecification");
        elemField.setXmlName(new javax.xml.namespace.QName("http://fedex.com/ws/rate/v20", "FormatSpecification"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://fedex.com/ws/rate/v20", "ShipmentNotificationFormatSpecification"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
    }

    /**
     * Return type metadata object
     */
    public static org.apache.axis.description.TypeDesc getTypeDesc() {
        return typeDesc;
    }

    /**
     * Get Custom Serializer
     */
    public static org.apache.axis.encoding.Serializer getSerializer(
           java.lang.String mechType, 
           java.lang.Class _javaType,  
           javax.xml.namespace.QName _xmlType) {
        return 
          new  org.apache.axis.encoding.ser.BeanSerializer(
            _javaType, _xmlType, typeDesc);
    }

    /**
     * Get Custom Deserializer
     */
    public static org.apache.axis.encoding.Deserializer getDeserializer(
           java.lang.String mechType, 
           java.lang.Class _javaType,  
           javax.xml.namespace.QName _xmlType) {
        return 
          new  org.apache.axis.encoding.ser.BeanDeserializer(
            _javaType, _xmlType, typeDesc);
    }

}
