package com.parkcheck;

import com.facebook.react.ReactActivity;
import com.rnfs.RNFSPackage; //added

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "parkcheck";
  }

  // @Override
  //   protected List<ReactPackage> getPackages() {
  //     return Arrays.<ReactPackage>asList(
  //       new MainReactPackage(), // <---- add comma
  //       new RNFSPackage() // <---------- add package
  //     );
  //   }
}
