package com.delivermanapp;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;

import com.baidu.location.BDLocation;
import com.baidu.location.BDLocationListener;
import com.baidu.location.LocationClient;
import com.baidu.location.LocationClientOption;
import com.baidu.mapapi.SDKInitializer;
import com.bee.baidumapview.BaiduMapReactPackage;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;


public class MainActivity extends ReactActivity {

    public BDLocation currentLocation = null;
    public LocationClient mLocationClient = new LocationClient(this);
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "delivermanApp";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        SDKInitializer.initialize(getApplicationContext());


        LocationClientOption option = new LocationClientOption();
        mLocationClient.registerLocationListener(new MyLocationListener());
        option.setOpenGps(true);
        option.setCoorType("bd09ll");// 返回的定位结果是百度经纬度,默认值gcj02
        option.setProdName("自我定位");
        mLocationClient.setLocOption(option);
        mLocationClient.start();
    }

    public class MyLocationListener implements BDLocationListener {
        @Override
        public void onReceiveLocation(BDLocation bdLocation) {
            Log.i("RCTBaiduMap","got current location");
            SharedPreferences sp = getApplicationContext().getSharedPreferences("SP", MODE_PRIVATE);
            SharedPreferences.Editor editor = sp.edit();
            editor.putString("LNG", bdLocation.getLongitude() + "");
            editor.putString("LAT", bdLocation.getLatitude() + "");
            editor.commit();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        mLocationClient.stop();
    }

    /**
     * Returns whether dev mode should be enabled.
     * This enables e.g. the dev menu.
     */
    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

   /**
   * A list of packages used by the app. If the app uses additional views
   * or modules besides the default ones, add more packages here.
   */
    @Override
    protected List<ReactPackage> getPackages() {
      BaiduMapReactPackage baiduMapReactPackage = new BaiduMapReactPackage(this);
      baiduMapReactPackage.setLocationClient(mLocationClient);
      return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        baiduMapReactPackage
        //,new ImagePickerPackage()
      );
    }
}
