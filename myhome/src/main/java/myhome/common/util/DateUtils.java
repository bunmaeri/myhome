package myhome.common.util;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Locale;
import java.util.SimpleTimeZone;

import myhome.common.constant.Constants;

/**
 * <p>Title: 날짜관련 유틸. </p>
 * <p>Description: 날짜관련 유틸을 관리하는 클래스이다. </p>
 */
public final class DateUtils {
    private static String[] kk = {
        "1212122322121", // 1881
        "1212121221220",
        "1121121222120",
        "2112132122122",
        "2112112121220",
        "2121211212120",
        "2212321121212",
        "2122121121210",
        "2122121212120",
        "1232122121212",
        "1212121221220", // 1891
        "1121123221222",
        "1121121212220",
        "1212112121220",
        "2121231212121",
        "2221211212120",
        "1221212121210",
        "2123221212121",
        "2121212212120",
        "1211212232212",
        "1211212122210", // 1901
        "2121121212220",
        "1212132112212",
        "2212112112210",
        "2212211212120",
        "1221412121212",
        "1212122121210",
        "2112212122120",
        "1231212122212",
        "1211212122210",
        "2121123122122", // 1911
        "2121121122120",
        "2212112112120",
        "2212231212112",
        "2122121212120",
        "1212122121210",
        "2132122122121",
        "2112121222120",
        "1211212322122",
        "1211211221220",
        "2121121121220", // 1921
        "2122132112122",
        "1221212121120",
        "2121221212110",
        "2122321221212",
        "1121212212210",
        "2112121221220",
        "1231211221222",
        "1211211212220",
        "1221123121221",
        "2221121121210", // 1931
        "2221212112120",
        "1221241212112",
        "1212212212120",
        "1121212212210",
        "2114121212221",
        "2112112122210",
        "2211211412212",
        "2211211212120",
        "2212121121210",
        "2212214112121", // 1941
        "2122122121120",
        "1212122122120",
        "1121412122122",
        "1121121222120",
        "2112112122120",
        "2231211212122",
        "2121211212120",
        "2212121321212",
        "2122121121210",
        "2122121212120", //1951
        "1212142121212",
        "1211221221220",
        "1121121221220",
        "2114112121222",
        "1212112121220",
        "2121211232122",
        "1221211212120",
        "1221212121210",
        "2121223212121",
        "2121212212120", // 1961
        "1211212212210",
        "2121321212221",
        "2121121212220",
        "1212112112210",
        "2223211211221",
        "2212211212120",
        "1221212321212",
        "1212122121210",
        "2112212122120",
        "1211232122212", // 1971
        "1211212122210",
        "2121121122210",
        "2212312112212",
        "2212112112120",
        "2212121232112",
        "2122121212110",
        "2212122121210",
        "2112124122121",
        "2112121221220",
        "1211211221220", // 1981
        "2121321122122",
        "2121121121220",
        "2122112112322",
        "1221212112120",
        "1221221212110",
        "2122123221212",
        "1121212212210",
        "2112121221220",
        "1211231212222",
        "1211211212220", // 1991
        "1221121121220",
        "1223212112121",
        "2221212112120",
        "1221221232112",
        "1212212122120",
        "1121212212210",
        "2112132212221",
        "2112112122210",
        "2211211212210",
        "2221321121212", //2001
        "2212121121210",
        "2212212112120",
        "1232212122112",
        "1212122122120",
        "1121212322122",
        "1121121222120",
        "2112112122120",
        "2211231212122",
        "2121211212120",
        "2122121121210", // 2011
        "2124212112121",
        "2122121212120",
        "1212121223212",
        "1211212221220",
        "1121121221220",
        "2112132121222",
        "1212112121220",
        "2121211212120",
        "2122321121212",
        "1221212121210", // 2021
        "2121221212120",
        "1232121221212",
        "1211212212210",
        "2121123212221",
        "2121121212220",
        "1212112112220",
        "1221231211221",
        "2212211211220",
        "1212212121210",
        "2123212212121", // 2031
        "2112122122120",
        "1211212322212",
        "1211212122210",
        "2121121122120",
        "2212114112122",
        "2212112112120",
        "2212121211210",
        "2212232121211",
        "2122122121210",
        "2112122122120", // 2041
        "1231212122212",
        "1211211221220"
    };

    /**
     * 2043년까지의 날짜계산을 위한 변수
     */
    private static int[] dt = {
        384, 355, 354, 384, 354, 354, 384, 354, 355, 384,
        355, 384, 354, 354, 383, 355, 354, 384, 355, 384,
        354, 355, 383, 354, 355, 384, 354, 355, 384, 354,
        384, 354, 354, 384, 355, 354, 384, 355, 384, 354,
        354, 384, 354, 354, 385, 354, 355, 384, 354, 383,
        354, 355, 384, 355, 354, 384, 354, 384, 354, 354,
        384, 355, 355, 384, 354, 354, 384, 354, 384, 354,
        355, 384, 355, 354, 384, 354, 384, 354, 354, 384,
        355, 354, 384, 355, 353, 384, 355, 384, 354, 355,
        384, 354, 354, 384, 354, 384, 354, 355, 384, 355,
        354, 384, 354, 384, 354, 354, 385, 354, 355, 384,
        354, 354, 383, 355, 384, 355, 354, 384, 354, 354,
        384, 354, 355, 384, 355, 384, 354, 354, 384, 354,
        354, 384, 355, 384, 355, 354, 384, 354, 354, 384,
        354, 355, 384, 354, 384, 355, 354, 383, 355, 354,
        384, 355, 384, 354, 354, 384, 354, 354, 384, 355,
        355, 384, 354
    };

    // 음력 데이터 (평달 - 작은달 :1,  큰달:2 )
    // (윤달이 있는 달 - 평달이 작고 윤달도 작으면 :3 , 평달이 작고 윤달이 크면 : 4)
    // (윤달이 있는 달 - 평달이 크고 윤달이 작으면 :5,  평달과 윤달이 모두 크면 : 6)
    private static int [][] lun =
      {{1, 2, 4, 1, 1, 2, 1, 2, 1, 2, 2, 1},   /* 1841 */
      {2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1},
      {2, 2, 2, 1, 2, 1, 4, 1, 2, 1, 2, 1},
      {2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2},
      {1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1},
      {2, 1, 2, 1, 5, 2, 1, 2, 2, 1, 2, 1},
      {2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2},
      {1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1},
      {2, 1, 2, 3, 2, 1, 2, 1, 2, 1, 2, 2},
      {2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2},
      {2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 5, 2},   /* 1851 */
      {2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 1, 2},
      {2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2},
      {1, 2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2},
      {1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1},
      {2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2},
      {1, 2, 1, 1, 5, 2, 1, 2, 1, 2, 2, 2},
      {1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2},
      {2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2},
      {2, 1, 6, 1, 1, 2, 1, 1, 2, 1, 2, 2},
      {1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2},   /* 1861 */
      {2, 1, 2, 1, 2, 2, 1, 2, 2, 3, 1, 2},
      {1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2},
      {1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1},
      {2, 1, 1, 2, 4, 1, 2, 2, 1, 2, 2, 1},
      {2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2},
      {1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2},
      {1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2, 1},
      {2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1},
      {2, 2, 2, 1, 2, 1, 2, 1, 1, 5, 2, 1},
      {2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2},   /* 1871 */
      {1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2},
      {1, 1, 2, 1, 2, 4, 2, 1, 2, 2, 1, 2},
      {1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1},
      {2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1},
      {2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1, 2},
      {2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2},
      {2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1},
      {2, 2, 4, 2, 1, 2, 1, 1, 2, 1, 2, 1},
      {2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2},
      {1, 2, 1, 2, 1, 2, 5, 2, 2, 1, 2, 1},   /* 1881 */
      {1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2},
      {1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2},
      {2, 1, 1, 2, 3, 2, 1, 2, 2, 1, 2, 2},
      {2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2},
      {2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2},
      {2, 2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2},
      {2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1},
      {2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2},
      {1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2},
      {1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2},   /* 1891 */
      {1, 1, 2, 1, 1, 5, 2, 2, 1, 2, 2, 2},
      {1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2},
      {1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2},
      {2, 1, 2, 1, 5, 1, 2, 1, 2, 1, 2, 1},
      {2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2},
      {1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1},
      {2, 1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1},
      {2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2},
      {1, 2, 1, 1, 2, 1, 2, 5, 2, 2, 1, 2},
      {1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1},   /* 1901 */
      {2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2},
      {1, 2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2},
      {2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1},
      {2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2},
      {1, 2, 2, 4, 1, 2, 1, 2, 1, 2, 1, 2},
      {1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1},
      {2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2},
      {1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2},
      {1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1},
      {2, 1, 2, 1, 1, 5, 1, 2, 2, 1, 2, 2},   /* 1911 */
      {2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2},
      {2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2},
      {2, 2, 1, 2, 5, 1, 2, 1, 2, 1, 1, 2},
      {2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2},
      {1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1},
      {2, 3, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1},
      {2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2},
      {1, 2, 1, 1, 2, 1, 5, 2, 2, 1, 2, 2},
      {1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2},
      {2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2},   /* 1921 */
      {2, 1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2},
      {1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2},
      {2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1},
      {2, 1, 2, 5, 2, 1, 2, 2, 1, 2, 1, 2},
      {1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1},
      {2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2},
      {1, 5, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2},
      {1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2},
      {1, 2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1},
      {2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1},   /* 1931 */
      {2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2},
      {1, 2, 2, 1, 6, 1, 2, 1, 2, 1, 1, 2},
      {1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2},
      {1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1},
      {2, 1, 4, 1, 2, 1, 2, 1, 2, 2, 2, 1},
      {2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1},
      {2, 2, 1, 1, 2, 1, 4, 1, 2, 2, 1, 2},
      {2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2},
      {2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1},
      {2, 2, 1, 2, 2, 4, 1, 1, 2, 1, 2, 1},   /* 1941 */
      {2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2},
      {1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2},
      {1, 1, 2, 4, 1, 2, 1, 2, 2, 1, 2, 2},
      {1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2},
      {2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2},
      {2, 5, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2},
      {2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2},
      {2, 2, 1, 2, 1, 2, 3, 2, 1, 2, 1, 2},
      {2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1},
      {2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2},   /* 1951 */
      {1, 2, 1, 2, 4, 2, 1, 2, 1, 2, 1, 2},
      {1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2, 2},
      {1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2},
      {2, 1, 4, 1, 1, 2, 1, 2, 1, 2, 2, 2},
      {1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2},
      {2, 1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2},
      {1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2},
      {1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1},
      {2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1},
      {2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2},   /* 1961 */
      {1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1},
      {2, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2, 1},
      {2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2},
      {1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1},
      {2, 2, 5, 2, 1, 1, 2, 1, 1, 2, 2, 1},
      {2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2},
      {1, 2, 2, 1, 2, 1, 5, 2, 1, 2, 1, 2},
      {1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1},
      {2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2},
      {1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1, 2},   /* 1971 */
      {1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1},
      {2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2, 1},
      {2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1, 2},
      {2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2},
      {2, 2, 1, 2, 1, 2, 1, 5, 2, 1, 1, 2},
      {2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1},
      {2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1},
      {2, 1, 1, 2, 1, 6, 1, 2, 2, 1, 2, 1},
      {2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2},
      {1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2},   /* 1981 */
      {2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2, 2},
      {2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2},
      {2, 1, 2, 2, 1, 1, 2, 1, 1, 5, 2, 2},
      {1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2},
      {1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1},
      {2, 1, 2, 2, 1, 5, 2, 2, 1, 2, 1, 2},
      {1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1},
      {2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2},
      {1, 2, 1, 1, 5, 1, 2, 1, 2, 2, 2, 2},
      {1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2},   /* 1991 */
      {1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2},
      {1, 2, 5, 2, 1, 2, 1, 1, 2, 1, 2, 1},
      {2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2},
      {1, 2, 2, 1, 2, 2, 1, 5, 2, 1, 1, 2},
      {1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2},
      {1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1},
      {2, 1, 1, 2, 3, 2, 2, 1, 2, 2, 2, 1},
      {2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1},
      {2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1},
      {2, 2, 2, 3, 2, 1, 1, 2, 1, 2, 1, 2},   /* 2001 */
      {2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1},
      {2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2},
      {1, 5, 2, 2, 1, 2, 1, 2, 2, 1, 1, 2},
      {1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2},
      {1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 2, 2},
      {1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2},
      {2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2},
      {2, 2, 1, 1, 5, 1, 2, 1, 2, 1, 2, 2},
      {2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2},
      {2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1},   /* 2011 */
      {2, 1, 6, 2, 1, 2, 1, 1, 2, 1, 2, 1},
      {2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2},
      {1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 1, 2},
      {1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 2},
      {1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2},
      {2, 1, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2},
      {1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2},
      {2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2},
      {2, 1, 2, 5, 2, 1, 1, 2, 1, 2, 1, 2},
      {1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1},   /* 2021 */
      {2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2},
      {1, 5, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2},
      {1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1},
      {2, 1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1},
      {2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2},
      {1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2},
      {1, 2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1},
      {2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2},
      {1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1},
      {2, 1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1},   /* 2031 */
      {2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2},
      {1, 2, 1, 1, 2, 1, 5, 2, 2, 2, 1, 2},
      {1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1},
      {2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2},
      {2, 2, 1, 2, 1, 4, 1, 1, 2, 1, 2, 2},
      {2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2},
      {2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1},
      {2, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 1},
      {2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1},
      {2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2},   /* 2041 */
      {1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2},
      {1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2}};

    private static String [] week = {"일","월","화","수","목","금","토"};

    private static int [] md = {31,0,31,30,31,30,31,31,30,31,30,31};
    
    private static int[] day_array = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    private static int total_day;
    private static int acc_day;
    private static int buff_day;
    private static int i;
    private static int j;
    private static int m0;
    private static int m1;
    private static int m2;
    private static int temp;
    private static boolean isLeap;

    private static int yy;
    private static int n2;
    private static int mm;
    private static int r;

    public static final long millisInDay = 86400000;

    /**
     * 날짜포멧이 "yyyyMMdd"인 문자열을 받아 java.util.Date형으로 반환
     *
     * @param s
     * @return
     * @throws java.text.ParseException
     */
    public static java.util.Date check(String s) throws java.text.ParseException {
        return check(s, "yyyyMMdd");
    }

    /**
     * 지정된 날짜포멧에 맞는 문자열을 받아 java.util.Date형을 반환
     *
     * @param s 스트링
     * @param format 포맷형식
     * @return
     * @throws java.text.ParseException
     */
    public static java.util.Date check(String s, String format) throws java.text.ParseException {
        if (s == null) {
            throw new java.text.ParseException("date string to check is null", 0);
        }
        if (format == null) {
            throw new java.text.ParseException("format string to check date is null", 0);
        }

        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat(format,
            java.util.Locale.US);
        java.util.Date date = null;
        try {
            date = formatter.parse(s);
        } catch (java.text.ParseException e) {
            throw new java.text.ParseException(" wrong date:\"" + s + "\" with format \"" + format +
                                               "\"", 0);
        }

        if (!formatter.format(date).equals(s)) {
            throw new java.text.ParseException(
                "Out of bound date:\"" + s + "\" with format \"" + format + "\"",
                0);
        }
        return date;
    }

    /**
     * 날짜형식이  "yyyyMMdd"인 경우의 유효성 판정.
     * 반환값이 true: 날짜 형식이 맞고, 존재하는 날짜일 때
     * false: 날짜 형식이 맞지 않거나, 존재하지 않는 날짜일 때
     */
    public static boolean isValid(String s) throws Exception {
        return isValid(s, "yyyyMMdd");
    }

    /**
     * 주어진 날짜 형식(format)에 맞는 유효성 판정.
     * 반환값이 true: 날짜 형식이 맞고, 존재하는 날짜일 때
     * false: 날짜 형식이 맞지 않거나, 존재하지 않는 날짜일 때
     */
    public static boolean isValid(String s, String format) {
        if ( (s == null) || (format == null))
            return false;
        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat(format,
            java.util.Locale.US);
        java.util.Date date = null;
        try {
            date = formatter.parse(s);
        } catch (java.text.ParseException e) {
            return false;
        }

        if (!formatter.format(date).equals(s)) {
            return false;
        }

        return true;
    }

    /**
     * 현재(한국기준) 시간정보를 입력받은 format pattern으로 return.
     *
     *
     * <blockquote><pre>
     * (예 1) format "yyyyMMddhh"      =>  1998121011
     * (예 2) format "yyyyMMddHHmmss"  =>  19990114232121 (0~23시간 타입)
     * </pre></blockquote>
     *
     * @param     format     얻고자하는 현재시간의 pattern(default yyyyMMdd)
     * @return    String	 format pattern으로 변환된 현재 한국 시간.
     */
    public static String getKST(String format) {
        int millisPerHour = 60 * 60 * 1000; // 1hour(ms) = 60s * 60m * 1000ms
        SimpleDateFormat fmt = new SimpleDateFormat(format);
        SimpleTimeZone timeZone = new SimpleTimeZone(9 * millisPerHour, "KST");
        fmt.setTimeZone(timeZone);

        long time = System.currentTimeMillis();
        String str = fmt.format(new java.util.Date(time));

        return str;

    } //end getKST method

    /**
     * 현재(한국기준) 시간정보를 "yyyy-MM-dd" pattern으로 return.
     *
     * <blockquote><pre>
     * 예1 ) 2002-02-02
     * </pre></blockquote>
     *
     * @return    String  yyyy-MM-dd형태의 현재 한국시간.
     */
    public static String getKSTDate() {
        SimpleTimeZone pdt = new SimpleTimeZone(9 * 60 * 60 * 1000, "KST");
        SimpleDateFormat formatter = new SimpleDateFormat(Constants.BAR_DATE_PATTERN);
        Date currentTime = new Date();
        return formatter.format(currentTime);
    } //end getKSTDate method

    /**
     * 주어진 Date에 대해서 "yyyy-MM-dd" pattern으로 return.
     *
     * <blockquote><pre>
     * 예1 ) 2002-02-02
     * </pre></blockquote>
     *
     * @return    String  yyyy-MM-dd형태의 .
     */
    public static String getKSTDate(java.util.Date date) {
        SimpleTimeZone pdt = new SimpleTimeZone(9 * 60 * 60 * 1000, "KST");
        SimpleDateFormat formatter = new SimpleDateFormat(Constants.BAR_DATE_PATTERN);
        return formatter.format(date);
    } //end getKSTDate method

    /**
     * 현재(한국기준) 시간정보를 "yyyy/MM/dd hh:mm:ss" pattern으로 return.
     *
     * <blockquote><pre>
     * 예) 2002/02/02 20:20:20
     * </pre></blockquote>
     *
     * @return   String yyyy/MM/dd hh:mm:ss형태의 현재 한국시간.
     */
    public static String getKSTDateTime() {
        SimpleTimeZone pdt = new SimpleTimeZone(9 * 60 * 60 * 1000, "KST");

        SimpleDateFormat formatter = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
        Date currentTime = new Date();
        return formatter.format(currentTime);
    } //end getKSTDateTime method

    /**
     * "yyyy-MM-dd" 형식의 오늘 날짜 반환
     */
    public static String getDateString() {
        java.text.SimpleDateFormat formatter =
            new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US);
        return formatter.format(new java.util.Date());
    }

    /**
     * 분단위로 리턴
     *
     * @param str
     * @return
     */
    public static int getMinute(String str){
        return (int)Long.parseLong(str);
    }

    /**
     * 일 반환
     */
    public static int getDay() {
        return getNumberByPattern("dd");
    }

    /**
     *  년도 반환
     */
    public static int getYear() {
        return getNumberByPattern("yyyy");
    }

    /**
     * 월 반환
     */
    public static int getMonth() {
        return getNumberByPattern("MM");
    }

    /**
     * 오늘 날짜를 얻는다. 반환 값은 기본 포맷을 따른다
     *
     * @return
     */
    public static String getToday() {
        return getToday(Constants.DEFAULT_DATE_PATTERN);
    }

    /**
     * 오늘 날짜를 얻는다. 반환 값은 주어진 포맷을 따른다. 포맷이 주어지지 않았을 경우에는 기본 포맷을 따른다
     *
     * @param pattern
     * @return
     */
    public static String getToday(String pattern) {
        String _pattern = (pattern == null || pattern.trim().length() == 0) ? Constants.DEFAULT_DATE_PATTERN :
                          pattern.trim();

        Calendar cal = Calendar.getInstance();

        SimpleDateFormat df = new SimpleDateFormat(_pattern);

        return df.format(cal.getTime());
    }

    /**
     * 일자를 패턴 형식에 맞춰 숫자로 변환하여 반환
     */
    public static int getNumberByPattern(String pattern) {
        java.text.SimpleDateFormat formatter =
            new java.text.SimpleDateFormat(pattern, java.util.Locale.US);
        String dateString = formatter.format(new java.util.Date());
        return Integer.parseInt(dateString);
    }

    /**
     * 현재일자를 패턴형식에 맞춰 포맷
     */
    public static String getFormatString(String pattern) {
        java.text.SimpleDateFormat formatter =
            new java.text.SimpleDateFormat(pattern, java.util.Locale.US);
        String dateString = formatter.format(new java.util.Date());
        return dateString;
    }

    /**
     * 포맷없는 현재일자(년월일) 반환
     */
    public static String getShortDateString() {
        java.text.SimpleDateFormat formatter =
            new java.text.SimpleDateFormat("yyyyMMdd", java.util.Locale.US);
        return formatter.format(new java.util.Date());
    }

    /**
     * 포맷없는 현재시간(시분초) 반환
     */
    public static String getShortTimeString() {
        java.text.SimpleDateFormat formatter =
            new java.text.SimpleDateFormat("HHmmss", java.util.Locale.US);
        return formatter.format(new java.util.Date());
    }

    /**
     * TimeStamp 문자열 반환
     */
    public static String getTimeStampString() {
        java.text.SimpleDateFormat formatter =
            new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss:SSS", java.util.Locale.US);
        return formatter.format(new java.util.Date());
    }

    /**
     * TimeStamp 문자열 반환2
     */
    public static String getTimeStampString2() {
        java.text.SimpleDateFormat formatter =
            new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.US);
        return formatter.format(new java.util.Date());
    }

    /**
     * 입력받은 일자를 "년월일시분초" 포맷으로 변환하여 리턴한다.
     * @param s
     * @return
     */
    public static String convertDateToFormat(String s) {
        if (s == null)
            return s;
        java.text.SimpleDateFormat formatter =
            new java.text.SimpleDateFormat("yyyyMMddHHmmss", java.util.Locale.US);
        java.util.Date date = null;
        try {
            date = formatter.parse(s);
        } catch (java.text.ParseException e) {
            return s;
        }

        return formatter.format(date);

    }

    /**
     * 입력받은 일자를 "년월일시분초" 포맷형태로 변환하여 리턴한다.
     *
     * 입력받은 일자가 14자리보다 작으면 "0"으로 채워서 변환한다.
     *
     * @param s
     * @return 포맷없는 일자
     *         입력받은 일자의 길이가 8보다 작으면 입력받은 일자 리턴
     */
    public static String convertDateToFormatYYYY_MM_DD(String s) {
        StringBuffer str = new StringBuffer();
        if (s == null)
            return s;

        if (s.trim().length() < 8)
            return s;
        if (s.trim().length() < 14) {
            int length = s.length();
            str.append(s);
            for (int i = 0; i < 14 - length; i++) {
                str.append("0");
//                s += "0";
            }
        }

        java.text.SimpleDateFormat formatter =
            new java.text.SimpleDateFormat("yyyyMMddHHmmss", java.util.Locale.US);
        java.util.Date date = null;
        try {
            date = formatter.parse(str.toString());
        } catch (java.text.ParseException e) {
            return s;

        }

        java.text.SimpleDateFormat formatter2 =
            new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US);

        return formatter2.format(date);

    }

    /**
     * 입력받은 일자를 "년월일시분초" 포맷형태로 변환하여 리턴한다.
     *
     * 입력받은 일자가 14자리보다 작으면 "0"으로 채워서 변환한다.
     *
     * @param s
     * @return 포맷없는 일자
     *         입력받은 일자의 길이가 8보다 작으면 입력받은 일자 리턴
     */
    public static String convertDateToFormatYYYY_MM_DD(String s, String pattern) {
        StringBuffer str = new StringBuffer();
        if (s == null)
            return s;

        if (s.trim().length() < 8)
            return s;
        if (s.trim().length() < 14) {
            int length = s.length();
            str.append(s);
            for (int i = 0; i < 14 - length; i++) {
                str.append("0");
//                s += "0";
            }
        }

        java.text.SimpleDateFormat formatter =
            new java.text.SimpleDateFormat("yyyyMMddHHmmss", java.util.Locale.US);
        java.util.Date date = null;
        try {
            date = formatter.parse(str.toString());
        } catch (java.text.ParseException e) {
            return s;

        }

        java.text.SimpleDateFormat formatter2 =
            new java.text.SimpleDateFormat(pattern, java.util.Locale.US);

        return formatter2.format(date);

    }
    
    /**
     * 입력받은 일자를 "년월일시분초" 포맷형태로 변환하여 리턴한다.
     * @param s
     * @return
     */
    public static String convertDateToFormatWithSeparator(String s) {
        if (s == null)
            return s;

        if (s.trim().length() < 8)
            return s;
        if (s.trim().length() < 14) {
            int length = s.length();
            for (int i = 0; i < 14 - length; i++) {
                s += "0";
            }
        }

        java.text.SimpleDateFormat formatter =
            new java.text.SimpleDateFormat("yyyyMMddHHmmss", java.util.Locale.US);
        java.util.Date date = null;
        try {
            date = formatter.parse(s);
        } catch (java.text.ParseException e) {
            return s;

        }

        java.text.SimpleDateFormat formatter2 =
            new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.US);

        return formatter2.format(date);
    }

    /**
     * 현재 날짜를 패턴에 맞게 출력
     * @param date Date 타입의 객체
     * @param pattern 표현식
     *
     * << Time Format Syntax: >>
     * To specify the time format use a time pattern string. In this pattern,
     * all ASCII letters are reserved as pattern letters,
     * which are defined as the following:
     *
     * Symbol   Meaning                 Presentation        Example
     * ------   -------                 ------------        -------
     * G        era designator          (Text)              AD
     * y        year                    (Number)            1996
     * M        month in year           (Text & Number)     July & 07
     * d        day in month            (Number)            10
     * h        hour in am/pm (1~12)    (Number)            12
     * H        hour in day (0~23)      (Number)            0
     * m        minute in hour          (Number)            30
     * s        second in minute        (Number)            55
     * S        millisecond             (Number)            978
     * E        day in week             (Text)              Tuesday
     * D        day in year             (Number)            189
     * F        day of week in month    (Number)            2 (2nd Wed in July)
     * w        week in year            (Number)            27
     * W        week in month           (Number)            2
     * a        am/pm marker            (Text)              PM
     * k        hour in day (1~24)      (Number)            24
     * K        hour in am/pm (0~11)    (Number)            0
     * z        time zone               (Text)              Pacific Standard Time
     * '        escape for text         (Delimiter)
     * ''       single quote            (Literal)           '
     * yyyyMMdd hh:mm:ss
     *@return 패턴이 적용된 날짜
     */
    public static String getFormatDate(java.util.Date date, String pattern) {
        java.text.SimpleDateFormat df = new java.text.SimpleDateFormat(pattern);
        return df.format(date);
    }

    /**
     * String 으로되어 있는 날짜를 특정 패턴으로 변환하기
     * @param date 날짜 형식으로 되어 있는 문자열
     * @param currentPattern 입력된 날짜의 Pattern
     * @param outputPattern 출력될 날짜의 Pattern
     * @return 패턴이 적용된 날짜. 수행중 에러발생시 입력된 날짜를 그대로 리턴
     */
    public static String getFormatDate(String date, String currentPattern, String outputPattern) {
        try {
            if (date == null)
                return date;
            return getFormatDate(new java.text.SimpleDateFormat(currentPattern).parse(date),
                                 outputPattern);
        } catch (java.text.ParseException e) {
            return date;
        }
    }

    /**
     * 현재시간 리턴(시:분:초)
     * @return
     */
    public static String getTimeString() {
        java.text.SimpleDateFormat formatter =
            new java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.US);
        return formatter.format(new java.util.Date());
    }

    /**
     * return days between two date strings with default defined format.(yyyyMMdd)
     * @param s date string you want to check.
     * @return int 날짜 형식이 맞고, 존재하는 날짜일 때 요일을 리턴
     *           형식이 잘못 되었거나 존재하지 않는 날짜: java.text.ParseException 발생
     *          0: 일요일 (java.util.Calendar.SUNDAY 와 비교)
     *          1: 월요일 (java.util.Calendar.MONDAY 와 비교)
     *          2: 화요일 (java.util.Calendar.TUESDAY 와 비교)
     *          3: 수요일 (java.util.Calendar.WENDESDAY 와 비교)
     *          4: 목요일 (java.util.Calendar.THURSDAY 와 비교)
     *          5: 금요일 (java.util.Calendar.FRIDAY 와 비교)
     *          6: 토요일 (java.util.Calendar.SATURDAY 와 비교)
     * 예) String s = "20000529";
     *  int dayOfWeek = whichDay(s, format);
     *  if (dayOfWeek == java.util.Calendar.MONDAY)
     *      System.out.println(" 월요일: " + dayOfWeek);
     *  if (dayOfWeek == java.util.Calendar.TUESDAY)
     *      System.out.println(" 화요일: " + dayOfWeek);
     */
    public static String whichDayString(String s) throws java.text.ParseException {
        int dayOfWeek = whichDay(s, "yyyyMMdd");
        if (dayOfWeek == java.util.Calendar.MONDAY) return "월요일";
        if (dayOfWeek == java.util.Calendar.TUESDAY) return "화요일";
        if (dayOfWeek == java.util.Calendar.WEDNESDAY) return "수요일";
        if (dayOfWeek == java.util.Calendar.THURSDAY) return "목요일";
        if (dayOfWeek == java.util.Calendar.FRIDAY) return "금요일";
        if (dayOfWeek == java.util.Calendar.SATURDAY) return "토요일";
        if (dayOfWeek == java.util.Calendar.SUNDAY) return "일요일";

        return "날짜오류";
    }

    /**
     * return days between two date strings with default defined format.(yyyyMMdd)
     * @param s date string you want to check.
     * @return int 날짜 형식이 맞고, 존재하는 날짜일 때 요일을 리턴
     *           형식이 잘못 되었거나 존재하지 않는 날짜: java.text.ParseException 발생
     *          0: 일요일 (java.util.Calendar.SUNDAY 와 비교)
     *          1: 월요일 (java.util.Calendar.MONDAY 와 비교)
     *          2: 화요일 (java.util.Calendar.TUESDAY 와 비교)
     *          3: 수요일 (java.util.Calendar.WENDESDAY 와 비교)
     *          4: 목요일 (java.util.Calendar.THURSDAY 와 비교)
     *          5: 금요일 (java.util.Calendar.FRIDAY 와 비교)
     *          6: 토요일 (java.util.Calendar.SATURDAY 와 비교)
     * 예) String s = "20000529";
     *  int dayOfWeek = whichDay(s, format);
     *  if (dayOfWeek == java.util.Calendar.MONDAY)
     *      System.out.println(" 월요일: " + dayOfWeek);
     *  if (dayOfWeek == java.util.Calendar.TUESDAY)
     *      System.out.println(" 화요일: " + dayOfWeek);
     */
    public static int whichDay(String s) throws java.text.ParseException {
        return whichDay(s, "yyyyMMdd");
    }

    /**
     * return days between two date strings with user defined format.
     * @param s date string you want to check.
     * @param format string representation of the date format. For example, "yyyy-MM-dd".
     * @return int 날짜 형식이 맞고, 존재하는 날짜일 때 요일을 리턴
     *           형식이 잘못 되었거나 존재하지 않는 날짜: java.text.ParseException 발생
     *          0: 일요일 (java.util.Calendar.SUNDAY 와 비교)
     *          1: 월요일 (java.util.Calendar.MONDAY 와 비교)
     *          2: 화요일 (java.util.Calendar.TUESDAY 와 비교)
     *          3: 수요일 (java.util.Calendar.WENDESDAY 와 비교)
     *          4: 목요일 (java.util.Calendar.THURSDAY 와 비교)
     *          5: 금요일 (java.util.Calendar.FRIDAY 와 비교)
     *          6: 토요일 (java.util.Calendar.SATURDAY 와 비교)
      {* 예) String s = "2000-05-29";
     *  int dayOfWeek = whichDay(s, "yyyy-MM-dd");
     *  if (dayOfWeek == java.util.Calendar.MONDAY)
     *      System.out.println(" 월요일: " + dayOfWeek);
     *  if (dayOfWeek == java.util.Calendar.TUESDAY)
     *      System.out.println(" 화요일: " + dayOfWeek);
     */

    public static int whichDay(String s, String format) throws java.text.ParseException {
        if (s == null) {
            throw new java.text.ParseException("date string to check is null", 0);
        }
        if (format == null) {
            throw new java.text.ParseException("format string to check date is null", 0);
        }
        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat(format,
            java.util.Locale.US);
        java.util.Date date = check(s, format);

        java.util.Calendar calendar = formatter.getCalendar();
        calendar.setTime(date);
        return calendar.get(java.util.Calendar.DAY_OF_WEEK);
    }

    /**
     * return days between two date strings with default defined format.("yyyyMMdd")
     * @param String from date string
     * @param String to date string
     * @return int 날짜 형식이 맞고, 존재하는 날짜일 때 2개 일자 사이의 일수 리턴
     *           형식이 잘못 되었거나 존재하지 않는 날짜: java.text.ParseException 발생
     */
    public static int daysBetween(String from, String to) throws java.text.ParseException {
        return daysBetween(from, to, "yyyyMMdd");
    }

    /**
     * return days between two date strings with user defined format.
     * @param String from date string
     * @param String to date string
     * @return int 날짜 형식이 맞고, 존재하는 날짜일 때 2개 일자 사이의 일자 리턴
     *           형식이 잘못 되었거나 존재하지 않는 날짜: java.text.ParseException 발생
     */
    public static int daysBetween(String from, String to, String format) throws java.text.
        ParseException {
        if ( (from == null) || (to == null)) {
            throw new java.text.ParseException("date string to check is null", 0);
        }
        if (format == null) {
            throw new java.text.ParseException("format string to check date is null", 0);
        }
        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat(format,
            java.util.Locale.US);
        java.util.Date d1 = check(from, format);
        java.util.Date d2 = check(to, format);

        long duration = d2.getTime() - d1.getTime();

        return (int) (duration / (1000 * 60 * 60 * 24));
        // seconds in 1 day
    }

    /**
     * return age between two date strings with default defined format.("yyyyMMdd")
     * @param String from date string
     * @param String to date string
     * @return int 날짜 형식이 맞고, 존재하는 날짜일 때 2개 일자 사이의 나이 리턴
     *           형식이 잘못 되었거나 존재하지 않는 날짜: java.text.ParseException 발생
     */
    public static int ageBetween(String from, String to) throws java.text.ParseException {
        return ageBetween(from, to, "yyyyMMdd");
    }

    /**
     * return age between two date strings with user defined format.
     * @param String from date string
     * @param String to date string
     * @param format string representation of the date format. For example, "yyyy-MM-dd".
     * @return int 날짜 형식이 맞고, 존재하는 날짜일 때 2개 일자 사이의 나이 리턴
     *           형식이 잘못 되었거나 존재하지 않는 날짜: java.text.ParseException 발생
     */
    public static int ageBetween(String from, String to, String format) throws java.text.
        ParseException {
        return daysBetween(from, to, format) / 365;
    }

    /**
     * return add day to date strings
     * @param String date string
     * @param int 더할 일수
     * @return int 날짜 형식이 맞고, 존재하는 날짜일 때 일수 더하기
     *           형식이 잘못 되었거나 존재하지 않는 날짜: java.text.ParseException 발생
     */
    public static String addDays(String s, int day) throws java.text.ParseException {
        return addDays(s, day, "yyyyMMdd");
    }

    /**
     * return add day to date strings with user defined format.
     * @param String date string
     * @param int 더할 일수
     * @param format string representation of the date format. For example, "yyyy-MM-dd".
     * @return int 날짜 형식이 맞고, 존재하는 날짜일 때 일수 더하기
     *           형식이 잘못 되었거나 존재하지 않는 날짜: java.text.ParseException 발생
     */
    public static String addDays(String s, int day, String format) throws java.text.ParseException {
        if (s == null) {
            throw new java.text.ParseException("date string to check is null", 0);
        }
        if (format == null) {
            throw new java.text.ParseException("format string to check date is null", 0);
        }
        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat(format, new Locale("PST"));
        java.util.Date date = check(s, format);

        date.setTime(date.getTime() + ( (long) day * 1000 * 60 * 60 * 24));
        return formatter.format(date);
    }

    /**
     * return add month to date strings
     * @param String date string
     * @param int 더할 월수
     * @return int 날짜 형식이 맞고, 존재하는 날짜일 때 월수 더하기
     *           형식이 잘못 되었거나 존재하지 않는 날짜: java.text.ParseException 발생
     */
    public static String addMonths(String s, int month) throws Exception {
        return addMonths(s, month, "yyyyMMdd");
    }

    /**
     * return add month to date strings with user defined format.
     * @param String date string
     * @param int 더할 월수
     * @param format string representation of the date format. For example, "yyyy-MM-dd".
     * @return int 날짜 형식이 맞고, 존재하는 날짜일 때 월수 더하기
     *           형식이 잘못 되었거나 존재하지 않는 날짜: java.text.ParseException 발생
     */
    public static String addMonths(String s, int addMonth, String format) throws Exception {
        if (s == null) {
            throw new java.text.ParseException("date string to check is null", 0);
        }
        if (format == null) {
            throw new java.text.ParseException("format string to check date is null", 0);
        }
        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat(format,
            java.util.Locale.US);
        java.util.Date date = check(s, format);

        java.text.SimpleDateFormat yearFormat =
            new java.text.SimpleDateFormat("yyyy", java.util.Locale.US);
        java.text.SimpleDateFormat monthFormat = new java.text.SimpleDateFormat("MM",
            java.util.Locale.US);
        java.text.SimpleDateFormat dayFormat = new java.text.SimpleDateFormat("dd",
            java.util.Locale.US);
        int year = Integer.parseInt(yearFormat.format(date));
        int month = Integer.parseInt(monthFormat.format(date));
        int day = Integer.parseInt(dayFormat.format(date));

        month += addMonth;
        if (addMonth > 0) {
            while (month > 12) {
                month -= 12;
                year += 1;
            }
        } else {
            while (month <= 0) {
                month += 12;
                year -= 1;
            }
        }
        java.text.DecimalFormat fourDf = new java.text.DecimalFormat("0000");
        java.text.DecimalFormat twoDf = new java.text.DecimalFormat("00");
        String tempDate =
            String.valueOf(fourDf.format(year))
            + String.valueOf(twoDf.format(month))
            + String.valueOf(twoDf.format(day));
        java.util.Date targetDate = null;

        try {
            targetDate = check(tempDate, "yyyyMMdd");
        } catch (java.text.ParseException pe) {
            day = lastDay(year, month);
            tempDate =
                String.valueOf(fourDf.format(year))
                + String.valueOf(twoDf.format(month))
                + String.valueOf(twoDf.format(day));
            targetDate = check(tempDate, "yyyyMMdd");
        }

        return formatter.format(targetDate);
    }

    /**
     * 입력받은 숫자만큼 년도를 더한다.
     * @param s
     * @param year
     * @return
     * @throws java.text.ParseException
     */
    public static String addYears(String s, int year) throws java.text.ParseException {
        return addYears(s, year, "yyyyMMdd");
    }

    /**
     * 입력받은 숫자만큼 년도를 더한다.
     * @param s
     * @param year
     * @param format
     * @return
     * @throws java.text.ParseException
     */
    public static String addYears(String s, int year, String format) throws java.text.
        ParseException {
        if (s == null) {
            throw new java.text.ParseException("date string to check is null", 0);
        }
        if (format == null) {
            throw new java.text.ParseException("format string to check date is null", 0);
        }
        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat(format,
            java.util.Locale.US);
        java.util.Date date = check(s, format);
        date.setTime(date.getTime() + ( (long) year * 1000 * 60 * 60 * 24 * (365 + 1)));
        return formatter.format(date);
    }

    /**
     * 해당일자사이의 개월수 리턴(나머지 일수 무조건 1개월로 계산)
     * @param from
     * @param to
     * @return
     * @throws java.text.ParseException
     */
    public static int monthsBetween(String from, String to) throws java.text.ParseException {
        return monthsBetween(from, to, "yyyyMMdd");
    }

    /**
     * 해당일자사이의 개월수 리턴(나머지 일수 무조건 1개월로 계산)
     * 예) 12개월 1일 ==> 13개월
     * @param from
     * @param to
     * @param format
     * @return
     * @throws java.text.ParseException
     */
    public static int monthsBetween(String from, String to, String format) throws java.text.
        ParseException {
        if ( (from == null) || (to == null)) {
            throw new java.text.ParseException("date string to check is null", 0);
        }
        if (format == null) {
            throw new java.text.ParseException("format string to check date is null", 0);
        }
        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat(format,
            java.util.Locale.US);
        java.util.Date fromDate = check(from, format);
        java.util.Date toDate = check(to, format);

        // if two date are same, return 0.
        if (fromDate.compareTo(toDate) == 0) {
            return 0;
        }

        java.text.SimpleDateFormat yearFormat =
            new java.text.SimpleDateFormat("yyyy", java.util.Locale.US);
        java.text.SimpleDateFormat monthFormat = new java.text.SimpleDateFormat("MM",
            java.util.Locale.US);
        java.text.SimpleDateFormat dayFormat = new java.text.SimpleDateFormat("dd",
            java.util.Locale.US);

        int fromYear = Integer.parseInt(yearFormat.format(fromDate));
        int toYear = Integer.parseInt(yearFormat.format(toDate));
        int fromMonth = Integer.parseInt(monthFormat.format(fromDate));
        int toMonth = Integer.parseInt(monthFormat.format(toDate));
        int fromDay = Integer.parseInt(dayFormat.format(fromDate));
        int toDay = Integer.parseInt(dayFormat.format(toDate));

        int result = 0;
        result += ( (toYear - fromYear) * 12);
        result += (toMonth - fromMonth);

        //        if (((toDay - fromDay) < 0) ) result += fromDate.compareTo(toDate);
        // ceil과 floor의 효과
        if ( ( (toDay - fromDay) > 0)) {
            result += toDate.compareTo(fromDate);

        }
        return result;
    }

    /**
     * yyyyMMdd형식의 년월일을 받은후에, 그 달의 마지막날을 역시 yyyyMMdd형식으로 반환한다.<br>
     * Exception이 발생하면 null을 리턴함.<br>
     * (예: 20040313 을 받으면 20040331을 반환 )
     * @param src
     * @return
     */
    public static String lastDayOfMonth(String src) {
        return lastDayOfMonth(src, "yyyyMMdd");
    }

    /**
     * 해당 월의 마지막일자를 구하여 입력된 포맷형식으로 변환하여 리턴한다.
     * format 파라미터에 맞는 src를 입력하면 그 달의 마지막날을, 역시
     * 그 format과 동일한 형식으로 반환 <br>
     * 이때 format에 null을 입력하면 yyyyMMdd형식으로 취급함.
     * (즉, lastDayOfMonth(src)와 동일) <br>
     * Exception이 발생하면 null을 리턴.
     * @param src 알고자하는 마지막날(예:20040314)
     * @param format 입력받는 날짜의 format타입(리턴도 요 타입으로 반환됨).
     *  <br>만일 null을 입력하면 yyyyMMdd(예:20040621)의 포맷으로 처리함.
     * @return
     */
    public static String lastDayOfMonth(String src, String format) {
        if (src == null) {
            return null;
        }
        if (format == null) {
            format = "yyyyMMdd";
        }

        try {
            java.text.SimpleDateFormat formatter =
                new java.text.SimpleDateFormat(format);
            java.util.Date date = formatter.parse(src);
            Calendar cal = Calendar.getInstance();
            cal.setTime(date);
            int last = cal.getActualMaximum(Calendar.DAY_OF_MONTH);
            date.setDate(last);
            return formatter.format(date);

        } catch (Exception e) {
            // Exception이 발생할땐 null을 리턴.
            return null;
        }
    }

    /**
     * 주어진 년도와 달에 대해서 그 달의 마지막 날을 리턴함.<br>
     * Exception이 발생하면 -1을 리턴.
     *
     * @param year
     * @param month
     * @return
     * @throws java.text.ParseException
     */
    public static int lastDay(int year, int month) {
        String y = null;
        String m = null;

        if (year < 10) {
            y = "000" + year;
        } else if (year < 100) {
            y = "00" + year;
        } else if (year < 1000) {
            y = "0" + year;
        } else {
            y = "" + year;
        }

        if (month < 10) {
            m = "0" + month;
        } else {
            m = "" + month;
        }

        try {
            String tmp = lastDayOfMonth("" + y + m + "01");
            return Integer.parseInt(tmp.substring(6));
        } catch (Exception e) {
            e.printStackTrace();
            return -1;
        }
    }


    /**
     * 현재 조회한 yyyyMMdd 가 윤달인지 여부를 검사한다
     *
     * @return
     */
    public boolean isLeap()
    {
        return DateUtils.isLeap;
    }

    /**
     * 디폴트 패턴을 적용하여 양력을 음력으로 변환한다
     * 변환 패턴은 기본 패턴을 따른다
     *
     * @param yyyyMMdd (예: 20040101)
     * @return
     */
    public String solToLun(String yyyyMMdd)
    {
        return solToLun(yyyyMMdd, Constants.DEFAULT_DATE_PATTERN);
    }

    /**
     * 패턴을 적용하여 양력을 음력으로 변환한다
     *
     * @param yyyyMMdd (예: 20040101)
     * @param pattern  반환 값 패턴
     * @return
     */
    public static String solToLun(String yyyyMMdd, String pattern)
    {
        if (yyyyMMdd == null) return null;

        String date = yyyyMMdd.trim();
        if (date.length() != 8)
        {
            if (date.length() == 4)
                date = date + "0101";
            else if (date.length() == 6)
                date = date + "01";
            else if (date.length() > 8)
                date = date.substring(0, 8);
            else
                return null;
        }

        int SolYear = Integer.parseInt(date.substring(0, 4));
        int SolMonth = Integer.parseInt(date.substring(4, 6));
        int SolDay = Integer.parseInt(date.substring(6));

        int LunYear = 0;
        int LunMonth = 0;
        int LunDay = 0;

        if ((SolYear < 1881) || (SolYear > 2043)) return null;
        if ((SolMonth < 1) || (SolMonth > 12)) return null;
        if ((SolDay < 1) || (SolDay > 31)) return null;

        //total days
        SolYear--;
        total_day = SolYear * 365 + SolYear / 4 - SolYear / 100 + SolYear / 400;
        SolYear++;

        if (((SolYear % 4) == 0) && ((SolYear % 100) != 0) || ((SolYear % 400) == 0))
            day_array[1] = 29;
        else
            day_array[1] = 28;

        for (i = 0; i < SolMonth - 1; i++) total_day = total_day + day_array[i];
        total_day = total_day + SolDay;

        //total days until 1880
        acc_day = total_day - 686686 + 1;

        //-------------------------------------------------------------------------
        //년도를 얻는다
        //-------------------------------------------------------------------------
        buff_day = dt[0];
        for (i = 0; i <= 162; i++)
        {
            if (acc_day <= buff_day) break;
            buff_day = buff_day + dt[i + 1];
        }
        LunYear = i + 1881;

        //Get Lunar Month
        buff_day = buff_day - dt[i];
        acc_day = acc_day - buff_day;

        if (!kk[i].substring(12, 13).equals("0"))
            temp = 13;
        else
            temp = 12;

        m2 = 0;
        for (j = 0; j < temp - 1; j++)
        {
            if (Integer.parseInt(kk[i].substring(j, j + 1)) <= 2)
            {
                m2++;
                m1 = Integer.parseInt(kk[i].substring(j, j + 1)) + 28;
            }
            else
            {
                m1 = Integer.parseInt(kk[i].substring(j, j + 1)) + 26;
            }
            if (acc_day <= m1) break;
            acc_day = acc_day - m1;
        }
        m0 = j;

        //-------------------------------------------------------------------------
        //달을 얻는다
        //-------------------------------------------------------------------------
        LunMonth = m2;
        if(SolMonth == 1){
            LunMonth = LunMonth + 1;
        }
        //-------------------------------------------------------------------------
        //-- 일을 얻는다
        //-------------------------------------------------------------------------
        LunDay = acc_day;

        //-------------------------------------------------------------------------
        //-- 윤달 여부를 얻는다
        //-------------------------------------------------------------------------
        if ((kk[LunYear - 1881].substring(12, 13) != "0") && (Integer.parseInt(kk[LunYear - 1881].substring(m0, m0 + 1)) > 2))
            isLeap = true;
        else
            isLeap = false;

        String _pattern = (pattern == null || pattern.trim().length() == 0) ? Constants.DEFAULT_DATE_PATTERN : pattern.trim();
        SimpleDateFormat df = new SimpleDateFormat(_pattern);
        return df.format(new Date(LunYear - 1900, LunMonth - 1, LunDay));
    }

    /**
     * 디폴트 패턴을 적용하여 음력을 양력으로 변환
     * lunToSol(yyyyMMdd, DEFAULT_DATE_PATTERN) 호출
     * @param yyyyMMdd
     * @return
     */
    public String lunToSol(String yyyyMMdd)
    {
        return lunToSol(yyyyMMdd, Constants.DEFAULT_DATE_PATTERN);
    }

    /**
     * 패턴을 입력받아서 음력을 양력으로 변환
     *
     * @param yyyyMMdd (예: 20040101)
     * @param pattern  반환할 문자열 패턴
     * @return
     */
    public static String lunToSol(String yyyyMMdd, String pattern)
    {
        if (yyyyMMdd == null) return null;

        String date = yyyyMMdd.trim();
        if (date.length() != 8)
        {
            if (date.length() == 4)
                date = date + "0101";
            else if (date.length() == 6)
                date = date + "01";
            else if (date.length() > 8)
                date = date.substring(0, 8);
            else
                return null;
        }

        int LunYear = Integer.parseInt(date.substring(0, 4));
        int LunMonth = Integer.parseInt(date.substring(4, 6));
        int LunDay = Integer.parseInt(date.substring(6));

        int SolYear = 0;
        int SolMonth = 0;
        int SolDay = 0;

        if ((LunYear < 1881) || (LunYear > 2043)) return null;
        if ((LunMonth < 1) || (LunMonth > 12)) return null;
        if ((LunDay < 1) || (LunDay > 30)) return null;

        //-------------------------------------------------------------------------
        //-- 윤년 여부를 얻는다
        //-------------------------------------------------------------------------
        GregorianCalendar gCal = new GregorianCalendar();
        isLeap = gCal.isLeapYear(LunYear);

        yy = -1;
        acc_day = 0;
        if (LunYear != 1881)
        {
            yy = LunYear - 1882;
            for (i = 0; i <= yy; i++)
            {
                for (j = 0; j <= 12; j++)
                    acc_day = acc_day + Integer.parseInt(kk[i].substring(j, j + 1));
                if (kk[i].substring(12, 13).equals("0"))
                    acc_day = acc_day + 336;
                else
                    acc_day = acc_day + 362;
            }
        }

        yy++;
        n2 = LunMonth - 1;
        mm = -1;

        r = 2;
        while (r != 1)
        {
            mm++;
            if (Integer.parseInt(kk[yy].substring(mm, mm + 1)) > 2)
            {
                acc_day = acc_day + 26 + Integer.parseInt(kk[yy].substring(mm, mm + 1));
                n2++;
            }
            else
            {
                if (mm == n2)
                    break;
                else
                    acc_day = acc_day + 28 + Integer.parseInt(kk[yy].substring(mm, mm + 1));
            }
        }

        // Leap Year
        if (isLeap == true) acc_day = acc_day + 28 + Integer.parseInt(kk[yy].substring(mm, mm + 1));
        acc_day = acc_day + LunDay + 29;
        yy = 1880;
        r = 2;
        while (r != 1)
        {
            yy++;
            mm = 365;
            if ((yy % 4) == 0 && ((yy % 100) != 0 || (yy % 400) == 0)) mm = 366;
            if (acc_day <= mm) break;
            acc_day = acc_day - mm;
        }

        SolYear = yy;
        day_array[1] = mm - 337;
        yy = 0;

        r = 2;
        while (r != 1)
        {
            yy++;
            if (acc_day <= day_array[yy - 1]) break;
            acc_day = acc_day - day_array[yy - 1];
        }

        SolMonth = yy;
        SolDay = acc_day;

        String _pattern = (pattern == null || pattern.trim().length() == 0) ? Constants.DEFAULT_DATE_PATTERN : pattern.trim();
        SimpleDateFormat df = new SimpleDateFormat(_pattern);
        return df.format(new Date(SolYear - 1900, SolMonth - 1, SolDay));
    }

    /**
     * @param year
     * @param month
     * @param date
     * @return
     */
    public static long getLong(int year, int month, int date) {
        Date d = getDate(year, month, date);
        return d.getTime();
    }

    /**
     * @param year
     * @param month
     * @param date
     * @return
     */
    public static Date getDate(int year, int month, int date) {
        Calendar cal = getCalendar(year, month, date);
        return cal.getTime();
    }

    /**
     * @param year
     * @param month
     * @param date
     * @return
     */
    public static Calendar getCalendar(int year, int month, int date) {
        Calendar cal = Calendar.getInstance();
        cal.clear();
        cal.set(Calendar.YEAR, year);
        cal.set(Calendar.MONTH, month);
        cal.set(Calendar.DATE, date);
        return cal;
    }

	/**
	 * 년월일시분초각을 구한다(총 17자리)
	 * ex) 20091231133030123
	 * @return YMDHMSSS(년월일시분초각)
	 */
	public static String getYMDHMSSS() {
		// 년(4)+월(2)+일(2)+시(2)+분(2)+초(2)+각(3)
		String YMDHMSSS = getTimeStampString();
		YMDHMSSS = StringUtils.replace(YMDHMSSS, "-", "");
		YMDHMSSS = StringUtils.replace(YMDHMSSS, ":", "");
		YMDHMSSS = StringUtils.replace(YMDHMSSS, " ", "");
		return YMDHMSSS;
	}

    /**
     * 년월일시분초각+랜던을 구한다(총 35자리)
     * ex) 200912311330301230.6763284678455519
     * @return YMDHMSSS(년월일시분초각+랜덤)
     */
    public static String getYMDHMSSS_Radom() {
        // 년(4)+월(2)+일(2)+시(2)+분(2)+초(2)+각(3)+랜덤(18)
        String YMDHMSSS = getTimeStampString();
        YMDHMSSS = StringUtils.replace(YMDHMSSS, "-", "");
        YMDHMSSS = StringUtils.replace(YMDHMSSS, ":", "");
        YMDHMSSS = StringUtils.replace(YMDHMSSS, " ", "");
        YMDHMSSS = YMDHMSSS+Math.random();
        return YMDHMSSS;
    }

    /**
     * 분초각+랜덤을 구한다(총 25자리)
     * ex) 32210620.6763284678455519
     * @return MSSS(분초각+랜덤)
     */
    public static String getMSSS_Radom() {
        // 분(2)+초(2)+각(3)+랜덤(18)
        String MSSS = getTimeStampString();
        MSSS = StringUtils.replace(MSSS, "-", "");
        MSSS = StringUtils.replace(MSSS, ":", "");
        MSSS = StringUtils.replace(MSSS, " ", "");
        MSSS = MSSS+Math.random();
        MSSS = MSSS.substring(10);
        return StringUtils.replace(MSSS, ".", "");
    }

    /**
     * 8자리 또는 6자리의 날짜를 나타내는 스트링에 구분자를 추가한다. <br>
     * (예: 20040506 을 2004-05-06 로 <br>
     *      200407 은 2004-07로) <br>
     *
     * @param dateStr
     * @param delim
     * @return
     */
    public static String formatStr2Date(String dateStr, String delim){
        String result = null;
        if(dateStr==null){
            return "";
        }
        // 2002-06-21
        if (dateStr.length() == 8) {
            result = dateStr.substring(0, 4) + delim +
                dateStr.substring(4, 6) + delim +
                dateStr.substring(6);
        // 2002-06
        }else if(dateStr.length() == 6){
            result = dateStr.substring(0, 4) + delim +
                dateStr.substring(4, 6);
        }else{
            result = dateStr;
        }
        return result;
    }

    /**
     * 8자리 또는 6자리의 날짜를 나타내는 스트링에 구분자를 추가한다. <br>
     * (예: 20040506 을 2004-05-06 로 <br>
     *      200407 은 2004-07로) <br>
     *
     * @param dateStr
     * @param delim
     * @return
     */
    public static String formatStr2DateKor(String dateStr){
        String result = null;
        if(dateStr==null){
            return "";
        }
        // 2002-06-21
        if (dateStr.length() == 8) {
            result = dateStr.substring(0, 4) + "년 " +
                dateStr.substring(4, 6) + "월 " +
                dateStr.substring(6)+"일";
        // 2002-06
        }else if(dateStr.length() == 6){
            result = dateStr.substring(0, 4) + "년 " +
                dateStr.substring(4, 6) +"월";
        }else{
            result = dateStr;
        }
        return result;
    }

    /**
     * 시작 년 구하기
     * @return
     */
    public static String calStartYear(String startRange, String startYear){
        int tmpInt = 0;
        String result = null;
        try{
            // startRange
            if(startRange!=null){
                result = add(thisYear(), "-" + startRange);
            }
            // startYear
            if(startYear!=null && startYear.length()==4){
                result = startYear;
            }
        }catch(Exception e){
            System.out.println("[에러] calStartYear() -> " + e);
        }
        return result;
    }

    /**
     * 끝나는 년도 구하기
     * @return
     */
    public static String calEndYear(String endRange, String endYear){
        int tmpInt = 0;
        String result = null;

        try{
            // endRange
            if(endRange!=null){
                result = add(thisYear(), endRange);
            }
            // endYear
            if(endYear!=null && endYear.length()==4){
                result = endYear;
            }
        }catch(Exception e){
            System.out.println("[에러] calEndYear() -> " + e);
        }
        return result;
    }

    /**
     * 현재년도 생성
     * @return
     */
    public static String thisYear(){
        Calendar cal = Calendar.getInstance();
        return formatYear(cal, "");
    }

    /**
     * 입력받은 패턴으로 현재년도 생성
     * @param cal
     * @param delim
     * @return
     */
    public static String formatYear(Calendar cal, String delim){
        String pattern = "yyyy" + delim;
        SimpleDateFormat formatter = new SimpleDateFormat(pattern);
        return formatter.format(cal.getTime());
    }

    /**
     * 파라미터의 데이터에 대해서 val만큼 더하거나 빼기
     * (예:  add("2003", "2") )
     * @param calStr
     * @param val
     * @return
     */
    public static String add(String calStr, String yearStr){
        String result = "";
        int year = Integer.parseInt(calStr.substring(0,4));

        if(yearStr!=null && yearStr.length()>0){
            result += year + Integer.parseInt(yearStr);
        }else{
            result = year + "";
        }
        return result;
    }

    /**
     * 시작 년월 구하기
     * @return
     */
    public static String calStartYearMonth(String startRange, String startYearMonth){
        int tmpInt = 0;
        String result = null;

        try{
            // startRange
            if(startRange!=null){
                result = add(thisYearMonth(), "-" + startRange, null);
            }
            // startYearMonth
            if(startYearMonth!=null && startYearMonth.length()==6){
                result = startYearMonth;
            }
        }catch(Exception e){
            System.out.println("[에러] calStartYearMonth() -> " + e);
        }
        return result;
    }

    /**
     * 끝나는 년월 구하기
     * @return
     */
    public static String calEndYearMonth(String endRange, String endYearMonth){
        int tmpInt = 0;
        String result = null;

        try{
            // endRange
            if(endRange!=null){
                result = add(thisYearMonth(), endRange, null);
            }
            // endYearMonth
            if(endYearMonth!=null && endYearMonth.length()==6){
                result = endYearMonth;
            }
        }catch(Exception e){
            System.out.println("[에러] calEndYearMonth() -> " + e);
        }
        return result;
    }

    /**
     * 200403 의 형식으로 넘어온 것에 대해서 val만큼 더하거나 빼기
     * (예:  add("200301", "2", "-3") )
     * @param calStr
     * @param val
     * @return
     */
    public static String add(String calStr, String yearStr, String monthStr){
        String result = "";
        int year = Integer.parseInt(calStr.substring(0,4));
        int month = Integer.parseInt(calStr.substring(4));

        if(yearStr!=null && yearStr.length()>0){
            result += year + Integer.parseInt(yearStr);
        }else{
            result = year + "";
        }

        if(monthStr!=null && monthStr.length()>0){
            int tmp = 0;
            tmp = month + Integer.parseInt(monthStr);
            if(tmp>12){
                result += 12;
            }else if(tmp<10){
                result += "0" + tmp;
            }else{
                result += tmp;
            }
        }else{
            if(month<10){
                result += "0" + month;
            }else{
                result += month;
            }
        }

        return result;
    }

    /**
     * 현재년월을 생성한다.
     * @return
     */
    public static String thisYearMonth(){
        Calendar cal = Calendar.getInstance();
        return formatYearMonth(cal, "");
    }
    
    /**
     * 현재년월을 생성한다.
     * @param delim
     * @return
     */
    public static String thisYearMonth(String delim){
        Calendar cal = Calendar.getInstance();
        return formatYearMonth(cal, delim);
    }

    /**
     * 입력받은 패턴으로 현재년월을 생성한다.
     * @param cal
     * @param delim
     * @return
     */
    public static String formatYearMonth(Calendar cal, String delim){
        String pattern = "yyyy" + delim + "MM";
        SimpleDateFormat formatter = new SimpleDateFormat(pattern);
        return formatter.format(cal.getTime());
    }
    
    /**
    *
    * 음력->양력 변환 메소드 (1841년 - 2043년 까지 검색 가능)
    * <br><br>
    *
    * strDate = 변환할 날자 (형식 MMDDYYYY - 반드시 이형식으로)  <br>
    * @param strDate 음양력 변환할 날자 (형식 MMDDYYYY - 반드시 이형식으로)
    * @return
    */
   public static String tranSolToLun(String strDate) {
       String resultDay = "" ; //결과값 리턴할 변수
       String year =strDate.substring(0,4);
       String month =strDate.substring(4,6);
       String day =strDate.substring(6,8);

       // 음력에서 양력으로 변환
       int lyear = 0, lmonth = 0, lday = 0, leapyes=0;
       int syear = 0, smonth = 0, sday=0;
       int mm = 0 , y1 = 0 , y2 = 0, m1=0;
       int i = 0, j = 0, k1 = 0, k2 = 0, leap = 0, w = 0;
       int td = 0, y = 0;

       lyear = Integer.parseInt(year);        // 년도 check
       lmonth = Integer.parseInt(month);     // 월 check
//           System.out.println("lyear = "+ lyear);
//           System.out.println("lmonth = "+ lmonth);
       y1 = lyear - 1841;
       m1 = lmonth - 1;
       leapyes = 0;

       switch (lun[y1][m1]) {
           case 1:
           case 3:
           case 4:
               mm = 29;
               break;
           case 2:
           case 5:
           case 6:
               mm = 30;
               break;
       }

       if ((Integer.parseInt(day) < 1) || (mm != 0 &&(Integer.parseInt(day) > mm ))) {
           resultDay = "00000000";  // 결과 조회 실패
       }else {
           lday = Integer.parseInt(day);
       }
//           System.out.println("mm = "+ mm);
       td = 0;
       for (i=0; i<y1; i++) {
           for (j=0; j<12; j++) {
               switch (lun[i][j]) {
               case 1:
                   td = td + 29;
                   break;
               case 2:
                   td = td + 30;
                   break;
               case 3:
                   td = td + 58;    // 29+29
                   break;
               case 4:
                   td = td + 59;    // 29+30
                   break;
               case 5:
                   td = td + 59;    // 30+29
                   break;
               case 6:
                   td = td + 60;    // 30+30
                   break;
               }
           }
       }
       for (j=0; j<m1; j++) {
           switch (lun[y1][j]) {
           case 1:
               td = td + 29;
               break;
           case 2:
               td = td + 30;
               break;
           case 3:
               td = td + 58;    // 29+29
               break;
           case 4:
               td = td + 59;    // 29+30
               break;
           case 5:
               td = td + 59;    // 30+29
               break;
           case 6:
               td = td + 60;    // 30+30
               break;
           }
       }
       if (leapyes == 1) {
           switch(lun[y1][m1]) {
           case 3:
           case 4:
               td = td + 29;
               break;
           case 5:
           case 6:
               td = td + 30;
               break;
           }
       }
       td =  td + lday + 22;
       // td : 1841 년 1 월 1 일 부터 원하는 날짜까지의 전체 날수의 합
       y1 = 1840;
       do {
           y1 = y1 +1;
           if  ((y1 % 400 == 0) || ((y1 % 100 != 0) && (y1 % 4 == 0))) {
               y2 = 366;
           }else {
               y2 = 365;
           }

           if (td <= y2) {
               break;
           }else {
               td = td- y2;
           }
       } while(true);

       syear = y1;
       md[1] = y2 -337;
       m1 = 0;

       do {
           m1= m1 + 1;
           if (td <= md[m1-1]) {
               break;
           }else {
               td = td - md[m1-1];
           }
       } while(true);

       smonth = m1;
       sday = td;
       y = syear -1;

       td = new Double(y * 365 + y/4 - y/100 +  y/400).intValue();

       for ( i=0; i<smonth-1; i++) {
           td = td + md[i];
       }

       td = td + sday;
       w = td % 7;
       i = (td + 4) % 10;
       j = (td + 2) % 12;
       k1 =(lyear + 6) % 10;
       k2 =(lyear + 8) % 12;

       String tmpsmonth = "";
       String tmpsday = "";

       if (smonth < 10) {
           tmpsmonth = "0" + Integer.toString(smonth);
       }else {
           tmpsmonth = Integer.toString(smonth);
       }

       if (sday < 10) {
           tmpsday = "0" + Integer.toString(sday);
       }else {
           tmpsday = Integer.toString(sday);
       }
       resultDay = Integer.toString(syear) + tmpsmonth + tmpsday;

//       System.out.println(" 양력 = " + resultDay[2]);
//       System.out.println(" 음력 = " + resultDay[3]);
       return resultDay;
   }
   
    /**
    *
    * 음양력 변환 메소드 (1841년 - 2043년 까지 검색 가능)
    * <br><br>
    *
    * strDate = 음양력 변환할 날자 (형식 YYYYMMDD - 반드시 이형식으로)  <br>
    * solLunFlag = 음양력 구분 (0 : 양력, 1:음력)  <br>
    * yunMonth = 윤달 구분 (0 : 평달 , 1 : 윤달)   <br><br>
    *
    * 리턴값은 String[] 으로서 아래의 값들을 리턴함.  <br>
    *         0번\uCA30 : 변환 성공여부 (0 : 성공 , 1 : 실패)  <br>
    *         1번\uCA30 : 오류 메세지  <br>
    *         2번\uCA30 : 양력 날자  <br>
    *         3번\uCA30 : 음력 날자  <br>
    *         4번재 : 변환된 날자 윤달 여부 (0 : 평달 , 1 : 윤달)  <br>
    *         5번\uCA30 : 요일 (양력)  <br>
    *
    * @param strDate 음양력 변환할 날자 (형식 YYYYMMDD - 반드시 이형식으로)
    * @param solLunFlag 음양력 구분 (0 : 양력, 1:음력)
    * @param yunMonth 윤달 구분 (0 : 평달 , 1 : 윤달)
    * @return
    */
   public static String [] tranSolLun2(String strDate, String solLunFlag, String yunMonth) {
       String [] resultDay = new String[6] ; //결과값 리턴할 변수
       for (int ll = 0 ; ll < resultDay.length; ll++ ) {
           resultDay [ll] = "";
       }

       String year =strDate.substring(4,8);
       String month =strDate.substring(0,2);
       String day =strDate.substring(2,4);

//       System.out.println("year = " + year);
//       System.out.println("month = " + month);
//       System.out.println("day = " + day);

       if (solLunFlag.equals("0")) {  // 양력이면

       // 양력을 음력으로 변환
           int ly, lm, ld;
           int sy, sm, sd = 0;
           int m1 = 0, m2 = 0, mm = 0, i, j, w;
           int [] dt = new int[203];
           int k1, k2, td ;
           String yoon = "";  // 윤달인지 평달인지 구분

           double td1, td2;

           // 기준일자 양력 1841 년 1 월 23 일 (음력 1840 년 1 월 1 일) 계산
           td1=(1840*365)+(1840/4)-(1840/100)+(1840/400)+23;
           sy = Integer.parseInt(year);           // 년도 check
           sm = Integer.parseInt(month);         // 월 check

           if ((sy % 4 !=0) || ((sy % 100 == 0) && (sy % 400 !=0))) {
               md[1] =  28;          // 윤년이 아님
           } else {
               md[1] = 29;           // 윤년임
           }

           if ((Integer.parseInt(day) < 1) || (Integer.parseInt(day) > md[sm-1])) {
               resultDay [0] = "1";
               resultDay [1] = "일 범위가 틀립니다.";
           }else {
                    sd = Integer.parseInt(day);
           }

           int sy1 = sy-1;
           td2 = sy1*365+sy1/4-sy1/100+sy1/400+sd;

           for (i=0; i<sm-1; i++) {
               td2 = td2 + md[i];
           }
           td =  new Double(td2 - td1 + 1).intValue();

           for (i=0; i <= (sy-1841); i++) {
               dt[i] =0;
               for(j=0; j<12; j++) {
                   switch(lun[i][j]) {
                   case 1 :
                       mm=29;
                       break;
                   case 2 :
                       mm=30;
                       break;
                   case 3 :
                       mm=58;     // 29+29
                       break;
                   case 4 :
                       mm=59;     // 29+30
                       break;
                   case 5 :
                       mm=59;     // 30+29
                       break;
                   case 6 :
                       mm=60;     // 30+30
                       break;
                   }
                   dt[i] = dt[i] + mm;
               }
           }

           ly =0 ;
           while(true) {
               if (td > dt[ly] ) {
                   td = td - dt[ly];
                   ly=ly+1;
               }else {
                    break;
               }
           }

           lm=0;
           yoon = "0";  // 평달이면 0 , 윤달이면 1

           while(true) {
               if (lun[ly][lm] <=2) {
                   mm = lun[ly][lm] +28;
                   if (td>mm) {
                       td = td - mm;
                       lm = lm +1;
                   }else {
                       break;
                   }
               }else {
                   switch (lun[ly][lm]) {
                   case 3:
                       m1 = 29;
                       m2 = 29;
                       break;
                   case 4:
                       m1 = 29;
                       m2 = 30;
                       break;
                   case 5:
                       m1 = 30;
                       m2 = 29;
                       break;
                   case 6:
                       m1 = 30;
                       m2 = 30;
                       break;
                   }
                   if (td > m1) {
                       td = td - m1;
                       if (td > m2) {
                           td = td - m2;
                           lm=lm+1;
                       }else {
                           yoon ="1";
                           break;
                       }
                   } else {
                       break;
                   }
               }
           }

           ly = ly + 1841;
           lm = lm + 1;
           ld = td;
           w = (new Double(td2).intValue()) % 7;
           i = (new Double(td2).intValue()+4) % 10;
           j = (new Double(td2).intValue()+2) % 12;
//           System.out.println("i = " + i);
//           System.out.println("j = " + j);
           k1 = (ly + 6) %10;
           k2 = (ly + 8) % 12;

           if (resultDay == null || resultDay[0].equals("") ) {
           //         0번\uCA30 : 변환 성공여부 (0 : 성공 , 1 : 실패)
           //         1번\uCA30 : 오류 메세지
           //         2번\uCA30 : 양력 날자
           //         3번\uCA30 : 음력 날자
           //         4번재 : 변환된 날자 윤달 여부 (0 : 평달 , 1 : 윤달)
           //         5번째 : 갑자 변환 (예 갑자 년) - 년도에 따른
           //         6번\uCA30 : 갑자 변환 (예 갑자 일) - 날자에 따른
           //         7번\uCA30 : 띠
           //         8번\uCA30 : 양력 요일

               resultDay[0] = "1";
               resultDay[1] = "변환 성공";
               if (Integer.parseInt(month) < 10 && month.length() <2 ) {
                   month = "0" + month;
               }
               if (Integer.parseInt(day) < 10 && day.length() <2) {
                   day = "0" + day;
               }

               resultDay[2] = year + month + day;

               String tmpStrlm = "";
               String tmpStrld = "";
              if (lm < 10) {
                  tmpStrlm = "0" + Integer.toString(lm);
              }else {
                  tmpStrlm = Integer.toString(lm);
              }
              if (ld < 10) {
                  tmpStrld = "0" + Integer.toString(ld);
              }else {
                  tmpStrld = Integer.toString(ld);
              }

               resultDay[3] = Integer.toString(ly) + tmpStrlm + tmpStrld;
               resultDay[4] = yoon;
               resultDay[5] = week[w];
           }

       } else if (solLunFlag.equals("1")) {  // 음력이면
           // 음력에서 양력으로 변환
           int lyear = 0, lmonth = 0, lday = 0, leapyes=0;
           int syear = 0, smonth = 0, sday=0;
           int mm = 0 , y1 = 0 , y2 = 0, m1=0;
           int i = 0, j = 0, k1 = 0, k2 = 0, leap = 0, w = 0;
           int td = 0, y = 0;

           lyear = Integer.parseInt(year);        // 년도 check
           lmonth = Integer.parseInt(month);     // 월 check
//           System.out.println("lyear = "+ lyear);
//           System.out.println("lmonth = "+ lmonth);
           y1 = lyear - 1841;
           m1 = lmonth - 1;
           leapyes = 0;

           if (lun[y1][m1] > 2)  {
               if (yunMonth.equals("1")) {
                   leapyes = 1;
                   switch (lun[y1][m1]) {
                       case 3:
                       case 5:
                           mm = 29;
                           break;
                       case 4:
                       case 6:
                           mm = 30;
                           break;
                }
           } else {
                   switch (lun[y1][m1]) {
                       case 1:
                       case 3:
                       case 4:
                           mm = 29;
                           break;
                       case 2:
                       case 5:
                       case 6:
                           mm = 30;
                           break;
                   }
               }
           }

           if ((Integer.parseInt(day) < 1) || (mm != 0 &&(Integer.parseInt(day) > mm ))) {
               resultDay[0] = "1";  // 결과 조회 실패
               resultDay[1] = "일 범위가 틀립니다.";
           }else {
               lday = Integer.parseInt(day);
           }
//           System.out.println("mm = "+ mm);
           td = 0;
           for (i=0; i<y1; i++) {
               for (j=0; j<12; j++) {
                   switch (lun[i][j]) {
                   case 1:
                       td = td + 29;
                       break;
                   case 2:
                       td = td + 30;
                       break;
                   case 3:
                       td = td + 58;    // 29+29
                       break;
                   case 4:
                       td = td + 59;    // 29+30
                       break;
                   case 5:
                       td = td + 59;    // 30+29
                       break;
                   case 6:
                       td = td + 60;    // 30+30
                       break;
                   }
               }
           }
           for (j=0; j<m1; j++) {
               switch (lun[y1][j]) {
               case 1:
                   td = td + 29;
                   break;
               case 2:
                   td = td + 30;
                   break;
               case 3:
                   td = td + 58;    // 29+29
                   break;
               case 4:
                   td = td + 59;    // 29+30
                   break;
               case 5:
                   td = td + 59;    // 30+29
                   break;
               case 6:
                   td = td + 60;    // 30+30
                   break;
               }
           }
           if (leapyes == 1) {
               switch(lun[y1][m1]) {
               case 3:
               case 4:
                   td = td + 29;
                   break;
               case 5:
               case 6:
                   td = td + 30;
                   break;
               }
           }
           td =  td + lday + 22;
           // td : 1841 년 1 월 1 일 부터 원하는 날짜까지의 전체 날수의 합
           y1 = 1840;
           do {
               y1 = y1 +1;
               if  ((y1 % 400 == 0) || ((y1 % 100 != 0) && (y1 % 4 == 0))) {
                   y2 = 366;
               }else {
                   y2 = 365;
               }

               if (td <= y2) {
                   break;
               }else {
                   td = td- y2;
               }
           } while(true);

           syear = y1;
           md[1] = y2 -337;
           m1 = 0;

           do {
               m1= m1 + 1;
               if (td <= md[m1-1]) {
                   break;
               }else {
                   td = td - md[m1-1];
               }
           } while(true);

           smonth = m1;
           sday = td;
           y = syear -1;

           td = new Double(y * 365 + y/4 - y/100 +  y/400).intValue();

           for ( i=0; i<smonth-1; i++) {
               td = td + md[i];
           }

           td = td + sday;
           w = td % 7;
           i = (td + 4) % 10;
           j = (td + 2) % 12;
           k1 =(lyear + 6) % 10;
           k2 =(lyear + 8) % 12;

//           System.out.println("resultDay[0] = " + resultDay[0]);
           if (resultDay == null || resultDay[0].equals("")) {
           //         0번\uCA30 : 변환 성공여부 (0 : 성공 , 1 : 실패)
           //         1번\uCA30 : 오류 메세지
           //         2번\uCA30 : 양력 날자
           //         3번\uCA30 : 음력 날자
           //         4번재 : 변환된 날자 윤달 여부 (0 : 평달 , 1 : 윤달)
           //         5번째 : 갑자 변환 (예 갑자 년) - 년도에 따른
           //         6번\uCA30 : 갑자 변환 (예 갑자 일) - 날자에 따른
           //         7번\uCA30 : 띠
           //         8번\uCA30 : 양력 요일

               resultDay[0] = "1";
               resultDay[1] = "변환 성공";
               String tmpsmonth = "";
               String tmpsday = "";

               if (smonth < 10) {
                   tmpsmonth = "0" + Integer.toString(smonth);
               }else {
                   tmpsmonth = Integer.toString(smonth);
               }

               if (sday < 10) {
                   tmpsday = "0" + Integer.toString(sday);
               }else {
                   tmpsday = Integer.toString(sday);
               }
               resultDay[2] = Integer.toString(syear) + tmpsmonth + tmpsday;

               String tmplmonth = "";
               String tmplday = "";

               if (lmonth < 10) {
                   tmplmonth = "0" + Integer.toString(lmonth);
               }else {
                   tmplmonth = Integer.toString(lmonth);
               }

               if (lday < 10) {
                   tmplday = "0" + Integer.toString(lday);
               }else {
                   tmplday = Integer.toString(lday);
               }

               resultDay[3] = Integer.toString(lyear) + tmplmonth + tmplday;
               resultDay[4] = yunMonth;
               resultDay[5] = week[w];
           }

       }
//       System.out.println(" 양력 = " + resultDay[2]);
//       System.out.println(" 음력 = " + resultDay[3]);
       return resultDay;
   }
    
    /**
     * 나이 계산
     * @param date 대상일자(대상일자)
     * @return int
     */
   public static int getAge(String date, String solLunFlag){
	   if(null==date || date.equals("")) return 0;
	   
	   String dob = StringUtils.replace(date, "/", "");
//System.out.println("dob==================================>"+dob);
	   // 음력일 때 -> 양력으로 변환
	   if(solLunFlag.equals("2")) {
		   dob = tranSolToLun(dob);
	   }
	   String year = dob.substring(0,4);
	   String mmdd = dob.substring(4,8);
//System.out.println("year==================================>"+year);
//System.out.println("mmdd==================================>"+mmdd);
       String today = getToday();
       int Age = Integer.parseInt(today.substring(0,4)) - Integer.parseInt(year);
       if(Integer.parseInt(today.substring(4,8)) < Integer.parseInt(mmdd))
           Age -= 1;
       return Age;
   }
   
   public static String db_format_date(String date) {
	   return db_format_date(date, Constants.BAR_DATE_PATTERN);
   }
   public static String db_format_date(String date, String pattern) {
	   if(null==date) return null;
	   if(date.equals("")) return null;
	   
	   date = StringUtils.replace(date, "-", "");
	   if(date.equals("00000000")) return null;
	   return convertDateToFormatYYYY_MM_DD(date, pattern);
   }
   
   // 현재 주의 일요일 구하기
   public static String sunday_date() {
	   return sunday_date(Constants.BAR_DATE_PATTERN);
   }
   // 현재 주의 일요일 구하기
   public static String sunday_date(String format) {
	   java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat(format);
	   Calendar cal = Calendar.getInstance(); 
	   cal.set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY);
	   return formatter.format(cal.getTime());
   }
}