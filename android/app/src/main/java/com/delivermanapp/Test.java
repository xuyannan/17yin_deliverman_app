package com.delivermanapp;

/**
 * Created by xuyannan on 3/29/16.
 */
public class Test {
    public  int func() {
        int num = 0;
        try {
            try{
                num +=1;
            }catch (Exception e) {
                e.printStackTrace();
            }

        }catch (Exception e) {
            e.printStackTrace();
        }
        System.out.print(num);
        return num;
    }
    public static void  main(String args []) {
        Test test = new Test();
        test.func();
    }
}
