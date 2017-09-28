package myhome.common.util;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.security.MessageDigest;
import java.util.StringTokenizer;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;

public final class StringUtils {
	private static Logger logger = Logger.getLogger(StringUtils.class);

    /**
     * 문자열내에서 지정된 char의 수를 조회한다.
     */
    public static int getCount(String str, char c) {
        int count = 0;
        if (str != null) {
            int strLength = str.length();
            for (int i = 0; i < strLength; i++) {
                if (str.charAt(i) == c) {
                    count++;
                }
            }
            if (str.charAt(strLength - 1) != c) {
                count++;
            }
        }
        return count;
    }

    /**
     * sep로 구분된 문자열을 String[]로 변환한다.
     */
    public static String[] toMultiString(String str, char sep) {
        String[] array = null;
        if (str != null) {
            str = str.trim();
            int strLength = str.length();
            int count = getCount(str, sep);
            int startIndex = 0;
            if (str.charAt(strLength - 1) == sep) {
                count++;
            }
            array = new String[count];

            for (int i = 0; i < count; i++) {
                int endIndex = str.indexOf(sep, startIndex);
                if (endIndex < startIndex) {
                    endIndex = strLength;
                }
                array[i] = str.substring(startIndex, endIndex).trim();
                startIndex = endIndex + 1;
            }
        }
        return array;
    }

    /**
     * 문자열 배열을 sep로 구분된 단일 문자열로 변환한다.
     */
    public static String toSingleString(String[] str, char sep) {
        if (str != null) {
            StringBuffer sb = new StringBuffer();
            for (int i = 0; i < str.length - 1; i++) {
                sb.append(str[i]);
                sb.append(sep);
            }
            sb.append(str[str.length - 1]);
            return sb.toString();
        }
        return null;
    }

    private static byte[] hexaMap = {0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36,
                                    0x37, 0x38, 0x39, 0x61, 0x62, 0x63, 0x64,
                                    0x65, 0x66};

    /**
     * @param src
     * @return
     */
    protected static byte[] getHexaEncodingBytes(byte[] src) {
        byte[] buffer = new byte[src.length * 2];
        int index = 0;
        for (int i = 0; i < src.length; i++) {
            buffer[index++] = hexaMap[((src[i] & 0xf0) >> 4)];
            buffer[index++] = hexaMap[(src[i] & 0x0f)];
        }
        return buffer;
    }

    /**
     * request의 name에 해당하는 value를 String으로 return.
     * value가 null이면 default값을 리턴
     * @param     req           HttpServletRequest request
     * @param     pName         String form의 field 명
     * @param     defaultValue  해당 field의 값이 null인경우 setting하려는 값
     * @return    String        해당 request의 name의 value. null인 경우
     *                          defaultValue를 return
     */
    public static String getParameter(HttpServletRequest req, String pName,
                                      String defaultValue) {

        String value = req.getParameter(pName.trim());
        String retr = (value == null ? defaultValue : value.trim());

        return retr;
    } //getParameter method

    /**
     * request의 pName의 값을 Ksc5601로 변환하여 리턴한다.
     * @param req
     * @param pName
     * @param defaultValue
     * @param encodingFlag
     * @return
     */
    public static String getParameter(HttpServletRequest req, String pName,
                                      String defaultValue, String encodingFlag) {

        String value = req.getParameter(pName.trim());
        String retr = (value == null ? defaultValue :
                       convertUni2Ksc2(value.trim()));
        return retr;
    } //getParameter method

    /**
     * request의 name에 해당하는 value를 boolean값으로 return.
     * value값이 "TRUE" or "ON" or "1" 인 경우 true 를
     * "FALSE" or "OFF" or "0" 인 경우 false를 return.
     *
     * @param     req           HttpServletRequest request
     * @param     sName         String form의 field 명
     * @param     defaultValue  해당 field의 값이 null인경우 setting하려는 값
     * @return    String        해당 request의 name의 value. null인 경우
     * defaultValue를 return
     * value값이 "TRUE" or "ON" or "1" 인 경우 true 를
     * "FALSE" or "OFF" or "0" 인 경우 false를 return.
     */
    public static boolean getParameterAsBoolean(HttpServletRequest req,
                                                String sName,
                                                boolean defaultValue) {
        String value = req.getParameter(sName);

        if (null == value) {
            return defaultValue;
        }

        value = value.trim().toUpperCase();
        boolean retr;
        if (value.equals("TRUE") || value.equals("ON") || value.equals("1")) {
            retr = true;
        } else if (value.equals("FALSE") || value.equals("OFF") ||
                   value.equals("0")) {
            retr = false;
        } else {
            retr = defaultValue;
        }

        return retr;
    } //getParameterAsBoolean method

    //////////////////////////////////////////////////////////////////////////
    // 문자열 관련
    //////////////////////////////////////////////////////////////////////////

    /**
     * from 파일을 to 파일로 복사한다.
     * @param from
     * @param to
     * @throws IOException
     */
    public static void copyFile(File from, File to) throws IOException {
        InputStream in = null;
        OutputStream out = null;

        try {
            in = new FileInputStream(from);
        } catch (IOException ex) {
            throw new IOException(
                "Utilities.copyFile: opening input stream '"
                + from.getPath()
                + "', "
                + ex.getMessage());
        }

        try {
            out = new FileOutputStream(to);
        } catch (Exception ex) {
            try {
                in.close();
            } catch (IOException ex1) {
            }
            throw new IOException(
                "Utilities.copyFile: opening output stream '"
                + to.getPath()
                + "', "
                + ex.getMessage());
        }

        copyInputToOutput(in, out, from.length());
    }

    /**
     * Utility method to copy an input stream to an output stream.
     * Wraps both streams in buffers. Ensures right numbers of bytes copied.
     */
    /**
     * input을 output으로 복사한다.
     * byteCount만큼만 복사 (최대 8192 byte)
     * @param input
     * @param output
     * @param byteCount
     * @throws IOException
     */
    public static void copyInputToOutput(
        InputStream input,
        OutputStream output,
        long byteCount) throws IOException {
        int bytes;
        long length;

        BufferedInputStream in = new BufferedInputStream(input);
        BufferedOutputStream out = new BufferedOutputStream(output);

        byte[] buffer;
        buffer = new byte[8192];

        for (length = byteCount; length > 0; ) {
            bytes = (int) (length > 8192 ? 8192 : length);

            try {
                bytes = in.read(buffer, 0, bytes);
            } catch (IOException ex) {
                try {
                    in.close();
                    out.close();
                } catch (IOException ex1) {
                }
                throw new IOException(
                    "Reading input stream, " + ex.getMessage());
            }

            if (bytes < 0)
                break;

            length -= bytes;

            try {
                out.write(buffer, 0, bytes);
            } catch (IOException ex) {
                try {
                    in.close();
                    out.close();
                } catch (IOException ex1) {
                }
                throw new IOException(
                    "Writing output stream, " + ex.getMessage());
            }
        }

        try {
            in.close();
            out.close();
        } catch (IOException ex) {
            throw new IOException("Closing file streams, " + ex.getMessage());
        }
    }

    /**
     * input을 output으로 복사한다. (전체)
     * @param input
     * @param output
     * @throws IOException
     */
    public static void copyInputToOutput(
        InputStream input,
        OutputStream output) throws IOException {
        BufferedInputStream in = new BufferedInputStream(input);
        BufferedOutputStream out = new BufferedOutputStream(output);
        byte buffer[] = new byte[8192];
        for (int count = 0; count != -1; ) {
            count = in.read(buffer, 0, 8192);
            if (count != -1)
                out.write(buffer, 0, count);
        }

        try {
            in.close();
            out.close();
        } catch (IOException ex) {
            throw new IOException("Closing file streams, " + ex.getMessage());
        }
    }

    /**
     * Encode a string using algorithm specified in web.xml and return the
     * resulting encrypted password. If exception, the plain credentials
     * string is returned
     *
     * @param password Password or other credentials to use in authenticating
     *        this username
     * @param algorithm Algorithm used to do the digest
     *
     * @return encypted password based on the algorithm.
     */
    /**
     * 패스워드를 특정 알고리즘을 사용하여 변환시킨다.
     * @param password
     * @param algorithm
     * @return
     */
    public static String encodePassword(String password, String algorithm) {
        byte[] unencodedPassword = password.getBytes();

        MessageDigest md = null;

        try {
            // first create an instance, given the provider
            md = MessageDigest.getInstance(algorithm);
        } catch (Exception e) {
            logger.error("Exception: " + e);

            return password;
        }

        md.reset();

        // call the update method one or more times
        // (useful when you don't know the size of your data, eg. stream)
        md.update(unencodedPassword);

        // now calculate the hash
        byte[] encodedPassword = md.digest();

        StringBuffer buf = new StringBuffer();

        for (int i = 0; i < encodedPassword.length; i++) {
            if ((encodedPassword[i] & 0xff) < 0x10) {
                buf.append("0");
            }

            buf.append(Long.toString(encodedPassword[i] & 0xff, 16));
        }

        return buf.toString();
    }

    /**
     * Escape, but do not replace HTML.
     * @param escapseAmpersand Optionally escape
     * ampersands (&amp;).
     */
    /**
     * 특수문자를 DATA에 변환하기 위한 코드로 변경한다.
     * "&", "&nbsp;", "\", "<", ">"
     * @param s
     * @param escapeAmpersand
     * @return
     */
    public static String escapeHTML(String s, boolean escapeAmpersand) {
        // got to do amp's first so we don't double escape
        if (escapeAmpersand) {
            s = replace(s, "&", "&amp;");
        }
        s = replace(s, "&nbsp;", " ");
        s = replace(s, "\"", "&quot;");
        s = replace(s, "<", "&lt;");
        s = replace(s, ">", "&gt;");
        return s;
    }

    /**
     * Escape, but do not replace HTML.
     * The default behaviour is to escape ampersands.
     */
    /**
     * 특수문자를 DATA에 변환하기 위한 코드로 변경한다.
     * escapeHTML(s, true)를 호출한다.
     * @param s
     * @return
     */
    public static String escapeHTML(String s) {
        return escapeHTML(s, true);
    }

    /** Run both removeHTML and escapeHTML on a string.
     * @param s String to be run through removeHTML and escapeHTML.
     * @return String with HTML removed and HTML special characters escaped.
     */
    /**
     * 특수문자를 DATA에 변환하기 위한 코드로 변경한다.
     * ">", "<" 문자를 제거한 나머지 HTML을 코드로 변경한다.
     * @param s
     * @return
     */
    public static String removeAndEscapeHTML(String s) {
        if (s == null)
            return "";
        else
            return escapeHTML(removeHTML(s));
    }

    /**
     * Remove occurences of html, defined as any text
     * between the characters "&lt;" and "&gt;".
     */
    /**
     * "<", ">" 기호 사이에 있는 문자를 가져온다.
     * @param str
     * @return
     */
    public static String removeHTML(String str) {
        if (str == null)
            return "";
        StringBuffer ret = new StringBuffer(str.length());
        int start = 0;
        int beginTag = str.indexOf("<");
        int endTag = 0;
        if (beginTag == -1)
            return str;

        while (beginTag >= start) {
            if (beginTag > 0) {
                ret.append(str.substring(start, beginTag));

                // replace each tag with a space (looks better)
                ret.append(" ");
            }
            endTag = str.indexOf(">", beginTag);

            // if endTag found move "cursor" forward
            if (endTag > -1) {
                start = endTag + 1;
                beginTag = str.indexOf("<", start);
            }
            // if no endTag found, get rest of str and break
            else {
                ret.append(str.substring(beginTag));
                break;
            }
        }
        // append everything after the last endTag
        if (endTag > -1 && endTag + 1 < str.length()) {
            ret.append(str.substring(endTag + 1));
        }
        return ret.toString().trim();
    }

    /**
     * Remove occurences of non-alphanumeric characters.
     */
    /**
     * 알파벳이 아닌 문자를 제거한다.
     * @param str
     * @return
     */
    public static String removeNonAlphanumeric(String str) {
        StringBuffer ret = new StringBuffer(str.length());
        char[] testChars = str.toCharArray();
        for (int i = 0; i < testChars.length; i++) {
            if (Character.isLetterOrDigit(testChars[i])) {
                ret.append(testChars[i]);
            }
        }
        return ret.toString();
    }

    /**
     * Replaces occurences of non-alphanumeric characters with a
     * supplied char.
     */
    /**
     * 알파벳이 아닌 문자에 character를 입력한다.
     * @param str
     * @param subst
     * @return
     */
    public static String replaceNonAlphanumeric(String str, char subst) {
        StringBuffer ret = new StringBuffer(str.length());
        char[] testChars = str.toCharArray();
        for (int i = 0; i < testChars.length; i++) {
            if (Character.isLetterOrDigit(testChars[i])) {
                ret.append(testChars[i]);
            } else {
                ret.append(subst);
            }
        }
        return ret.toString();
    }

    /**
     * Replaces occurences of non-alphanumeric characters with an underscore.
     */
    /**
     * 알파벳이 아닌 문자에 '_' characters를 입력한다.
     * @param str
     * @return
     */
    public static String replaceNonAlphanumeric(String str) {

        return replaceNonAlphanumeric(str, '_');

    }

    /**
     * URL정보에서 jsessionid 파라미터를 제거한다.
     * @param url
     * @return
     */
    public static String stripJsessionId(String url) {
        // Strip off jsessionid found in referer URL
        int startPos = url.indexOf(";jsessionid=");
        if (startPos != -1) {
            int endPos = url.indexOf("?", startPos);
            if (endPos == -1) {
                url = url.substring(0, startPos);
            } else {
                url = url.substring(0, startPos)
                      + url.substring(endPos, url.length());
            }
        }
        return url;
    }

    /**
     * 8859_1 ---> Ksc5601 문자열로 변환하여 return.
     * convertUni2Ksc와 동일
     * @param sUniCode
     * @return
     */
    private static String convertUni2Ksc2(String sUniCode) {
        String retr = "";
        if (sUniCode != null) {
            try {
                retr = new String(sUniCode.getBytes("8859_1"), "KSC5601");
            } catch (UnsupportedEncodingException e) {
                System.err.println("StringUtil.convertUni2Ksc() has error");
            }
        }

        return retr;
    } //end convertUni2Ksc method

    /**
     * 해당 문자열의 특정한 문자를 제거한 문자열을 리턴한다.
     * @param sStr
     * @param sChr
     * @return
     */
    public static String removeCharacter2(String sStr, String sChr) {
        StringBuffer retr = new StringBuffer();
        StringTokenizer st = new StringTokenizer(sStr, sChr);

        while (st.hasMoreTokens()) {
            retr.append(st.nextToken());
        }

        return retr.toString();
    } //end removeCharacter method

    /**
     * 해당 문자열의 특정 character를 제거한 문자열을 return.
     *
     * <blockquote><pre>
     * 예1) StringUtil.removeCharacter("33,111,000", ",") => 33111000
     * 예2) StringUtil.removeCharacter("2002/02/02", "/") => 20020202
     * </pre></blockquote>
     *
     * @param     sStr         원 문자열
     * @param     sChr         삭제할 문자 스트링인경우
     * @return    retr         charValue가 삭제된 문자열
     *
     */
    public static String removeCharacter(String sStr, String sChr) {

        if (sStr == null)
            return "";
        if (sChr == null)
            return "";

        if (sChr.length() == 1) {
            return removeCharacter(sStr, sChr.charAt(0));
        } else {
            return removeCharacter2(sStr, sChr);
        }
    } //end removeCharacter method

    /**
     * 해당 문자열의 특정 character를 제거한 문자열을 return.
     *
     * <blockquote><pre>
     * 예1) StringUtil.removeCharacter("33,111,000", ',') => 33111000
     * 예2) StringUtil.removeCharacter("2002/02/02", '/') => 20020202
     * </pre></blockquote>
     *
     * @param     sStr         원 문자열
     * @param     Chr         삭제할 문자 캐릭터인경우
     * @return    retr         charValue가 삭제된 문자열
     *
     */
    public static String removeCharacter(String sStr, char sChr) {

        if (sStr == null) {
            return "";
        }

        char[] fromchars = sStr.toCharArray();
        StringBuffer tochars = new StringBuffer(fromchars.length);
        for (int i = 0, p = fromchars.length; i < p; i++) {
            if (sChr != fromchars[i])
                tochars.append(fromchars[i]);
        }

        return tochars.toString();
    }

    /**
     * 제한 글자 이상의 글은 잘라서 return.
     *
     * <blockquote><pre>
     * Usage :    StringUtil.cutStringByLimit("한글사용가능한지", 3);
     * 예 )
     * StringUtil.cutStringByLimit("한글은 몇자까지 가능합니까?", 3) => 한글은
     * </pre></blockquote>
     *
     * @param     str           체크하려는 String
     * @param     length        글자 제한 length
     * @return    String        return String
     *
     */
    public static String cutStringByLimit(String str, int length) {

        int initLength = str.length();
        int cnt = 0;

        if (initLength <= length)
            return str;

        if (initLength > length) {
            for (int i = length; i >= 0; i--) {
                if (str.charAt(i) < 127)
                    break;
                else
                    cnt = cnt + 1;
            }

            if (cnt == 0) {
                cnt = 1;
            }

            cnt = cnt % 2;

            if (cnt == 0) {
                length = length - 1;
            }
        }

        return str.substring(0, length);
    }

    /**
     * 제한 글자 이상의 글은 자르고 '...' append후  return.
     *
     * <blockquote><pre>
     * Usage :    StringUtil.cutStringByLimit("한글사용가능한지", 3);
     * 예 )
     * StringUtil.cutStringByLimit("한글은 몇자까지 가능합니까?", 3) => 한글은...
     * </pre></blockquote>
     *
     * @param     str           체크하려는 String
     * @param     length        글자 제한 length
     * @return    String        return String
     *
     */
    public static String cutStringByLimitWithSign(String str, int length) {

        int initLength = str.length();
        int cnt = 0;

        if (initLength <= length)
            return str;

        if (initLength > length) {
            for (int i = length; i >= 0; i--) {
                if (str.charAt(i) < 127)
                    break;
                else
                    cnt = cnt + 1;
            }

            if (cnt == 0) {
                cnt = 1;
            }

            cnt = cnt % 2;

            if (cnt == 0) {
                length = length - 1;
            }
        }

        return str.substring(0, length) + "...";
    }

    /**
     * 제한 글자 이상의 글은 자르고 풍선도움말을 보여주는 문자열을 반환하는 함수이다.
     * '...' 와 같은 구분자를 넣는 것이 선택가능하다.
     *
     * <blockquote><pre>
     * Usage :    StringUtil.cutStringForBalloon("한글사용가능한지", 1, 3);
     * 예 )
     * StringUtil.cutStringForBalloon("한글사용가능한지", 1, 3); => 한글은...
     * </pre></blockquote>
     *
     * @param     orgStr        체크하려는 String
     * @param     gubun         '...' 를 추가할려면 1 아닐시 0등 다른 값
     * @param     cutlength     글자 제한 length, 짝수만 가능
     * @return    String        return String
     *
     */
    public static String cutStringForBalloon(String orgStr, int gubun,
                                             int cutlength) {
        int strLength = orgStr.length();
        if (strLength < cutlength)
            return orgStr;
        String retStr = "";
        String cutStr = "";
        String strTemp = removeCharacter(orgStr, "\"");
        if (gubun == 1)
            cutStr = cutStringByLimitWithSign(strTemp, cutlength);
        else
            cutStr = cutStringByLimit(strTemp, cutlength);
        return retStr = "<font title=\"" + strTemp + "\">" + cutStr + "</font>";
    }

    /**
     * html 표시시 "\n" 을 "<br>"로 변환하여 return한다.
     *
     * <blockquote><pre>
     * 예 )
     * StringUtil.n2Br("한글은 몇자까지 가능합니까?\n3자까지\n") =>
     * 한글은 몇자까지 가능합니까?<br> 3자까지<br>
     * </pre></blockquote>
     * @param     str           체크하려는 String
     * @return    String        return String
     *
     */
    public static String n2Br(String str) {
        int pos = str.indexOf('\n');
        while (pos >= 0) {
            str = str.substring(0, pos) + "<br>" + str.substring(pos + 1);
            pos = str.indexOf('\n');
        }

        return str;
    }

    //////////////////////////////////////////////////////////////////////////
    // HTML 관련
    //////////////////////////////////////////////////////////////////////////

    /**
     * table내에서 값을 표시할때 공백인 경우 &lt;TD&gt; tag 내의 boarder가
     * 보이지 않는 문제점을 해결하기 위한 method이다.
     * 즉, 공백의 필드값은 & nbsp;로 자동으로 바꾸어 준다.
     * 단, Object의 field가 public인 경우에만 적용됨.
     *
     * @param     o    Object
     *
     */
    public static void fixBlank(Object o) {
        if (o == null)
            return;

        Class c = o.getClass();
        if (c.isPrimitive())
            return;

        Field[] fields = c.getDeclaredFields();
        for (int i = 0; i < fields.length; i++) {

            try {

                Object f = fields[i].get(o);
                Class fc = fields[i].getType();

                if (fc.getName().equals("java.lang.String")) {
                    int mod = fields[i].getModifiers();
                    if (Modifier.isStatic(mod) && Modifier.isFinal(mod))
                        continue;

                    if (f == null || ((String) f).trim().equals("")) {
                        fields[i].set(o, "&nbsp;");
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                System.err.println(e.getMessage());
            }
        }
    }

    /**
     * 주민번호를 입력 받아서 '-'가 포함된 주민번호 형태로 변환한다.
     * <p>
     * <b>Category</b>
     * <ul>
     * <li>업무구분: 공통
     * <li>동작구분: 변환
     * <li>인덱스: 주민번호, 주민등록번호,포맷
     * </ul>
     * <pre>
     * 13자리의 주민번호를 입력 받아서 가운데에 -를 넣어서 반환한다.
     * null이 들어오면 ""을 반환하고, trim()을 해서 총 13자리가 아니라면
     * 입력받은 단어를 그대로 반환한다.
     * </pre>
     * <b>How to use</b>
     * <ul>
     * <li>String juminNo = com.lib.util.CommUtil.formatJuminNo(jumin);
     * </ul>
     * @param jumin 주민번호
     * @return String 포맷된 주민번호
     * @version
     */
    public static String formatJuminNo(String jumin) {
        if (jumin == null) {
            return "";
        }
        String tmp = StringUtils.replace(jumin.trim(), "-", "");

        if (tmp.length() == 13) {
            return tmp.substring(0, 6) + "-" + tmp.substring(6);
        } else {
            System.err.println("[참고] " + jumin + "은 13자리의 주민번호가 아닙니다.");
            return tmp;
        }
    }

    /**
     * 사업자를 입력 받아서 '-'가 포함된 사업자번호 형태로 변환한다.
     * <p>
     * <b>Category</b>
     * <ul>
     * <li>업무구분: 공통
     * <li>동작구분: 변환
     * <li>인덱스: 사업자번호, 포맷
     * </ul>
     * <pre>
     * 10자리의 사업자번호를 입력 받아서 가운데에 -를 넣어서 반환한다.
     * null이 들어오면 ""을 반환하고, trim()을 해서 총 10자리가 아니라면
     * 입력받은 단어를 그대로 반환한다.
     * </pre>
     * <b>How to use</b>
     * <ul>
     * <li>String No = com.framework.util.StringUtil.formatBizNo(bizNo);
     * </ul>
     * @param bizNo 사업자번호
     * @return String 포맷된 사업자번호
     * @version
     */
    public static String formatBizNo(String bizNo) {
        if (bizNo == null) {
            return "";
        }
        String tmp = StringUtils.replace(bizNo.trim(), "-", "");

        if (tmp.length() == 10) {
            return tmp.substring(0, 3) + "-" + tmp.substring(3,5) + "-" + tmp.substring(5);
        } else {
            System.err.println("[참고] " + bizNo + "은 10자리의 사업자번호가 아닙니다.");
            return tmp;
        }
    }

    /**
     * 주민번호를 입력 받아서 '-'가 포함된 주민번호 형태로 변환한다.
     * <p>
     * <b>Category</b>
     * <ul>
     * <li>업무구분: 공통
     * <li>동작구분: 변환
     * <li>인덱스: 주민번호, 주민등록번호,포맷
     * </ul>
     * <pre>
     * 13자리의 주민번호를 입력 받아서 가운데에 -를 넣어서 반환한다.
     * null이 들어오면 ""을 반환하고, trim()을 해서 총 13자리가 아니라면
     * 입력받은 단어를 그대로 반환한다.
     * </pre>
     * <b>How to use</b>
     * <ul>
     * <li>String juminNo = com.lib.util.CommUtil.formatJuminNo(jumin);
     * </ul>
     * @param jumin 주민번호
     * @return String 포맷된 주민번호
     * @version
     * <ol type="a">
     * <li> 2005-02-21 : 조경일 : 주석 재작성
     * </ol>
     */
    public static String formatJuminNoSSN(String jumin) {
        if (jumin == null) {
            return "";
        }
        String tmp = StringUtils.replace(jumin.trim(), "-", "");

        if (tmp.length() == 13) {
            return tmp.substring(0, 6) + "-*******";
        } else {
            System.err.println("[참고] " + jumin + "은 13자리의 주민번호가 아닙니다.");
            return tmp;
        }
    }

    //////////////////////////////////////////////////////////////////////////
    // Math 관련
    //////////////////////////////////////////////////////////////////////////


    /**
     * parameter i의 자릿수 round down.
     *
     * <blockquote><pre>
     * Usage :    StringUtil.round(20.20, 2);
     * 예 )
     * StringUtil.cut(44.44,-1) => 44.4
     * StringUtil.cut(55.55,-1) => 55.5
     * StringUtil.cut(44.44, 0) => 44.0
     * StringUtil.cut(55.55, 0) => 55.0
     * StringUtil.cut(44.44, 1) => 40.0
     * StringUtil.cut(55.55, 1) => 50.0
     * StringUtil.cut(44.44, 2) => 0.0
     * StringUtil.cut(55.55, 2) => 0.0
     * </pre></blockquote>
     *
     * @param     dAmount    적용하려는 double 형의 숫자
     * @param     i          자릿수
     * @return    double     return value
     *
     */
    public static double cut(double dAmount, int i) {
        long rest = 1;
        for (int x = 0; x < Math.abs(i); x++)
            rest *= 10;

        if (i > 0)
            return (double) ((long) (dAmount / rest)) * rest;
        else
            return (double) ((long) (dAmount * rest)) / rest;
    }

    /**
     * 문자를 자릿수만큼 잘라서 리턴한다.
     * @param value
     * @param position
     * @return
     */
    public static String getCutString(String value, int position) {
        String retValue = "";
        try {
            // System.out.println(value.length()-(position));
            retValue = value.substring(0, value.length() - (position));
        } catch (Exception ex) {
            retValue = "error";
        }

        return retValue;

    }

    /**
     * obj가 null 이라면 defaultValue값을 반환, 아니면 obj를 BigDecimal으로 변환해서 반환.<br>
     * 변환은 obj.toString()에서 코마(,)를 빼고 trim() 시켜서 한다.
     * 만일 obj를 BigDecimal로 변환에 실패하면 defaultValue를 반환.
     *
     * @param obj
     * @param defaultValue
     * @return
     */
    public static BigDecimal defaultValue(Object obj, BigDecimal defaultValue) {
        if (obj == null) {
            return defaultValue;
        } else {
            try {
                String tmpStr = replace(obj.toString(), ",", "").trim();
                BigDecimal bd = new BigDecimal(tmpStr);
                return bd;
            } catch (Exception e) {
                return defaultValue;
            }
        }
    }

    /**
     * obj가 null 이라면 defaultValue값을 반환, 아니면 obj를 java.util.Date로 변환해서 반환.<br>
     * 만일 obj를 java.util.Date로 변환에 실패하면 defaultValue를 반환.
     *
     * @param obj
     * @param defaultValue
     * @return
     */
    public static java.util.Date defaultValue(Object obj,
                                              java.util.Date defaultValue) {
        if (obj == null) {
            return defaultValue;
        } else {
            if (obj instanceof java.util.Date) {
                return (java.util.Date) obj;
            } else {
                return defaultValue;
            }
        }
    }

    /**
     * obj가 null 이라면 defaultValue값을 반환, 아니면 obj를 java.sql.Date로 변환해서 반환.<br>
     * 만일 obj를 java.sql.Date로 변환에 실패하면 defaultValue를 반환.
     *
     * @param obj
     * @param defaultValue
     * @return
     */
    public static java.sql.Date defaultValue(Object obj,
                                             java.sql.Date defaultValue) {
        if (obj == null) {
            return defaultValue;
        } else {
            if (obj instanceof java.sql.Date) {
                return (java.sql.Date) obj;
            } else {
                return defaultValue;
            }
        }
    }

    /**
     * obj가 null 이라면 defaultValue값을 반환, 아니면 obj를 double로 변환해서 반환.<br>
     * 변환은 obj.toString()에서 코마(,)를 빼고 trim() 시켜서 한다.
     * 만일 obj를 double로 변환에 실패하면 defaultValue를 반환.
     *
     * @param obj
     * @param defaultValue
     * @return
     */
    public static double defaultValue(Object obj, double defaultValue) {
        if (obj == null) {
            return defaultValue;
        } else {
            try {
                String tmpStr = replace(obj.toString(), ",", "").trim();

                double tmp = Double.parseDouble(tmpStr);
                return tmp;
            } catch (Exception e) {
                return defaultValue;
            }
        }
    }

    /**
     * obj가 null 이라면 defaultValue값을 반환, 아니면 obj를 int로 변환해서 반환.<br>
     * 변환은 obj.toString()에서 코마(,)를 빼고 trim() 시켜서 한다.
     * 만일 obj를 int로 변환에 실패하면 defaultValue를 반환.
     *
     * @param obj
     * @param defaultValue
     * @return
     */
    public static int defaultValue(Object obj, int defaultValue) {
        if (obj == null) {
            return defaultValue;
        } else {
            try {
                String tmpStr = replace(obj.toString(), ",", "").trim();
                int tmp = Integer.parseInt(tmpStr);
                return tmp;
            } catch (Exception e) {
                return defaultValue;
            }
        }
    }

    /**
     * obj가 null 이라면 defaultValue값을 반환, 아니면 obj를 long로 변환해서 반환.<br>
     * 변환은 obj.toString()에서 코마(,)를 빼고 trim() 시켜서 한다.
     * 만일 obj를 long로 변환에 실패하면 defaultValue를 반환.
     *
     * @param obj
     * @param defaultValue
     * @return
     */
    public static long defaultValue(Object obj, long defaultValue) {
        if (obj == null) {
            return defaultValue;
        } else {
            try {
                String tmpStr = replace(obj.toString(), ",", "").trim();
                long tmp = Long.parseLong(tmpStr);
                return tmp;
            } catch (Exception e) {
                return defaultValue;
            }
        }
    }

    /**
     * obj가 null 이라면 defaultValue값을 반환, 아니면 obj를 그대로 반환
     *
     * @param obj
     * @param defaultValue
     * @return
     */
    public static Object defaultValue(Object obj, Object defaultValue) {
        if (obj == null) {
            return defaultValue;
        } else {
            return obj;
        }
    }

    /**
         * treatBlankSpaceAsNull 파라미터가 true라면, null 또는 공백문자일때는 defaultValue를 반환.<br>
     * treatBlankSpaceAsNull 파라미터가 false라면, null일때만 defaultValue를 반환.<br>
     * 아니면 obj.toString() 을 반환<br>
     * (예: CommUtil.defaultValue("  ", "a", true); 는 "a"를 반환<br>
     *      CommUtil.defaultValue("  ", "a", false); 는 "  "를 반환<br>
     *
     * @param obj
     * @param defaultValue
     * @param treatBlankSpaceAsNull
     * @return
     */
    public static String defaultValue(Object obj, String defaultValue,
                                      boolean treatBlankSpaceAsNull) {
        if (obj == null) {
            return defaultValue;
        } else if (treatBlankSpaceAsNull) {
            String tmp = obj.toString().trim();
            if (tmp.length() == 0) {
                return defaultValue;
            } else {
                return obj.toString();
            }
        } else {
            return obj.toString();
        }
    }

    /**
     * obj가 null 또는 공백문자라면 defaultValue값을 반환, 아니면 obj를 String으로 변환해서 반환<br>
     * 이 메소드는 defaultValue(obj, defaultValue, true)와 같다.
     *
     * @param obj
     * @param defaultValue
     * @return
     */
    public static String defaultValue(Object obj, String defaultValue) {
        return defaultValue(obj, defaultValue, true);
    }

    /**
     * "\n"을 "<br />"으로 변환
     * @param s
     * @return
     */
    public static String autoformat(String s) {
        String ret = StringUtils.replace(s, "\n", "<br />");
        return ret;
    }

    /**
     * size만큼 "0"으로 채워서 String으로 변환한다.
     **/
    public static String cardString(int param, int size) {

        String ret = Integer.toString(param);
        int length = ret.length();

        for (int i = 0; i < size - length; i++) {
            ret = "0" + ret;
        }

        return ret;
    }

    /**
     * 문자열 내의 특정한 문자열을 모두 지정한 다른 문자열로 바꾼다.
     * 원본 String 이 null 일 경우에는 null 을 반환한다.
     * StringBuffer 를 이용하였으므로 이전의 String 을 이용한 것 보다
     * 월등히 속도가 빠르다. (약 50 ~ 60 배)
     *
     * 사용 예: <BR>
     *
     *   1. 게시판에서 HTML 태그가 안 먹히게 할려면
     *
     *      String str = "<TD>HTML Tag Free Test</TD>";
     *      str = replace(str, "&", "&amp;");
     *      str = replace(str, "<", "&lt;");
     *
     *   2. ' 가 포한된 글을 DB 에 넣을려면
     *
     *      String str2 = "I don't know.";
     *      str2 = replace(str2, "'", "''");
     *
     * @param   String src       원본 String
     * @param   String oldstr    원본 String 내의 바꾸기 전 문자열
     * @param   String newstr    바꾼 후 문자열
     * @return  String           치환이 끝난 문자열
     *
     */
    public static String replace(String src, String oldstr, String newstr) {
        if (src == null)
            return null;

        StringBuffer dest = new StringBuffer("");
        int len = oldstr.length();
        int srclen = src.length();
        int pos = 0;
        int oldpos = 0;

        while ((pos = src.indexOf(oldstr, oldpos)) >= 0) {
            dest.append(src.substring(oldpos, pos));
            dest.append(newstr);
            oldpos = pos + len;
        }

        if (oldpos < srclen)
            dest.append(src.substring(oldpos, srclen));

        return dest.toString();
    }

    /**
     * src문자열에서 from을 to로 바꾸기
     *
     * @param src
     * @param from
     * @param to
     * @return
     */
    /*
         public static String replace(String src, String from, String to){
        if(src==null){
            return "";
        }
        if(from==null || to==null){
            return src;
        }
        int fromStrSize = from.length();
        StringBuffer sb = new StringBuffer();
        int currPos = 0;
        int lastPos = 0;
        while( (currPos=src.indexOf(from, lastPos))!=-1 ){
            sb.append(src.substring(lastPos, currPos));
            sb.append(to);
            lastPos = currPos + fromStrSize;
        }
        sb.append(src.substring(lastPos));
        return sb.toString();
         }
     */

    /**
     * src문자열이 null일때는 replace를 반환하고
     * null이 아닐때는 src를 그대로 반환
     *
     * @param src 대상 String
     * @param replace 대상 String이 null일때 대치할 문자
     * @return
     */
    public static String replaceNull(String src, String replace) {
        if (src == null) {
            return replace;
        } else {
            return src;
        }
    }

    /**
     * src문자열이 null일때는 ""을 반환하고
     * null이 아닐때는 그대로 반환
     *
     * @param src 대상 String
     * @return
     */
    public static String replaceNull(String src) {
        return replaceNull(src, "");
    }

    /**
     * obj가 null일때는 replace라는 문자열을 반환하고,
     * null이 아닐때는 obj.toString()을 반환
     *
     * @param obj
     * @param replace
     * @return
     */
    public static String replaceNull(Object obj, String replace) {
        if (obj == null) {
            return replace;
        } else {
            return obj.toString();
        }
    }

    /**
     * obj가 null일때는 ""을 반환하고,
     * null이 아닐때는 obj.toString()을 반환
     *
     * @param obj
     * @return
     */
    public static String replaceNull(Object obj) {
        if (obj == null) {
            return "";
        } else {
            return obj.toString();
        }
    }

    /**
     * 숫자금액을 한글로 변환
     * @param won
     * @return 한글금액 + 원정
     */
    public static String eucWon(String won) {
        if (won == null || won.trim().equals("")) {
            won = "0";
        }

        java.util.Hashtable h = new java.util.Hashtable();
        h.put("0", "");
        h.put("1", "일");
        h.put("2", "이");
        h.put("3", "삼");
        h.put("4", "사");
        h.put("5", "오");
        h.put("6", "육");
        h.put("7", "칠");
        h.put("8", "팔");
        h.put("9", "구");

        java.util.Hashtable hh = new java.util.Hashtable();
        hh.put("0", "원정");
        hh.put("1", "십");
        hh.put("2", "백");
        hh.put("3", "천");
        hh.put("4", "만");
        hh.put("5", "십");
        hh.put("6", "백");
        hh.put("7", "천");
        hh.put("8", "억");
        hh.put("9", "십");
        hh.put("10", "백");
        hh.put("11", "천");
        hh.put("12", "조");
        hh.put("13", "십");
        hh.put("14", "백");
        hh.put("15", "경");

        String[] nb = new String[won.length()];

        int length = nb.length - 1;
        int length_sub = (int) Math.floor((nb.length - 1) / 4);

        String aa = null;
        String bb = null;
        String cc = null;

        for (int i = length, j = 0; i >= 0; i--, j++) {
            if (i != length && won.charAt(i) != '0') {
                if (j > 0 && j % 4 == 0 && won.charAt(j) == '0') {
                    if (length_sub == j / 4) {
                        aa = (String) h.get(won.charAt(i) + "");
                    } else {
                        aa = "";
                    }
                } else {
                    if (j % 4 == 0) {
                        aa = (String) h.get(won.charAt(i) + "");
                    } else if (won.charAt(i) != '1') {
                        aa = (String) h.get(won.charAt(i) + "");
                    } else {
                        aa = "";
                    }
                }

            } else if (i == length && won.charAt(i) == '1') {
                aa = "일";
            } else {
                aa = (String) h.get(won.charAt(i) + "");
            }

            if (i == length && won.charAt(length) == '0') {
                bb = "원정";
            } else if (won.charAt(i) == '0') {
                bb = "";
            } else {
                bb = (String) hh.get(j + "");
            }

            if (j > 0 && j % 4 == 0 && won.charAt(i) == '0') {
                if (length_sub == j / 4) {
                    cc = (String) hh.get(j + "");
                } else {
                    if (length_sub > j / 4) {
                        int zeroCount = 0;

                        int start = length - (j + 3);
                        int end = start + 3;
                        for (int m = start; m <= end; m++) {
                            if (won.charAt(m) != '0') {
                                zeroCount++;
                                break;
                            }
                        }

                        if (zeroCount > 0) {
                            cc = (String) hh.get(j + "");
                        }
                    } else {
                        cc = "";
                    }
                }
            } else {
                cc = "";
            }

            nb[i] = aa + bb + cc;
        }

        StringBuffer sb = new StringBuffer();

        for (int i = 0; i < nb.length; i++) {
            sb.append(nb[i]);
        }

        if (sb.toString().equals("원정")) {
            return "영원정";
        }

        return sb.toString();
    }

    /**
     * 입력받은 문자의 Byte 길이를 리턴한다.
     * @param src 문자
     * @return
     */
    public static int getByteLength(String src) {
        int srcLen = 0;
        // 한글인 경우 2byte로 계산.
        for (int y = 0; y < src.length(); y++) {
            if (src.charAt(y) > 127)
                srcLen += 2;
            else
                srcLen += 1;
        }
        return srcLen;
    }

    /**
     * 문자배열을 정렬한다.
     * @param str 문자배열
     * @return 새로운 문자배열
     */
    public static void stringSorg(String[] str) {
        int size = str.length;
        String temp = "";
        for (int i = 0; i < size; i++) {
            for (int j = i + 1; j < size; j++) {
                if (str[i].toLowerCase().compareTo(str[j].toLowerCase()) > 0) {
                    temp = str[i];
                    str[i] = str[j];
                    str[j] = temp;
                }
            }
        }
    }
    
    /**
     * 전화번호를 받아서 '-'를 넣어서 리턴한다.
     * @param telno 전화번호
     * @return String 포맷된 전화번호
     * @version
     */
    public static String formatTelno(String telno, String delim) {
        if (telno == null) {
            return "";
        }
        String tmp = getOnlyNum(telno);

        if (tmp.length() == 10) {
            return tmp.substring(0, 3) + delim + tmp.substring(3,6) + delim + tmp.substring(6);
        } else
        if (tmp.length() > 10) {
        	return tmp;
        } else {
            System.err.println("[참고] 전화번호를 확인하세요. =>" + telno);
            return tmp;
        }
    }
    
    /**
     * 숫자만 리턴한다.
     * @param str
     * @return
     */
    public static String getOnlyNum(String str) {
    	if ( str == null || str.equals("")) return "";
    	 
    	StringBuffer sb = new StringBuffer();
    	for(int i = 0; i < str.length(); i++){
    		if( Character.isDigit( str.charAt(i) ) ) {
    			sb.append( str.charAt(i) );
    		}
    	}
    	return sb.toString();
    }
    
    /**
     * Check whether the given {@code String} is empty.
     * <p>This method accepts any Object as an argument, comparing it to
     * {@code null} and the empty String. As a consequence, this method
     * will never return {@code true} for a non-null non-String object.
     * <p>The Object signature is useful for general attribute handling code
     * that commonly deals with Strings but generally has to iterate over
     * Objects since attributes may e.g. be primitive value objects as well.
     * Example) double preLat = Double.parseDouble(StringUtils.isEmpty(param.get("preLat")) ? "0" : param.get("preLat").toString());
     * @param str the candidate String
     * @since 3.2.1
     */
    public static boolean isEmpty(Object str) {
        return (str == null || "".equals(str));
    }
}