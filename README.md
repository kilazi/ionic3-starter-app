<h3 dir="ltr">
    Tech:
</h3>
<p dir="ltr">
    Ionic 3 + Ion2 FullApp Template + built with rxJS style
</p>
<h3 dir="ltr">
    Building instructions:
</h3>
<ol>
    <li dir="ltr">
        <p dir="ltr">
            git clone
        </p>
    </li>
    <li dir="ltr">
        <p dir="ltr">
            npm i
        </p>
    </li>
    <li dir="ltr">
        <p dir="ltr">
            dev mode:
        </p>
    </li>
    <ol>
        <li dir="ltr">
            <p dir="ltr">
                in browser:
            </p>
        </li>
        <ol>
            <li dir="ltr">
                <p dir="ltr">
                    ionic serve
                </p>
            </li>
        </ol>
        <li dir="ltr">
            <p dir="ltr">
                android:
            </p>
        </li>
        <ol>
            <li dir="ltr">
                <p dir="ltr">
                    connect device in data transfer mode
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    enable developer’s mode and USB debugging
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    ionic run android --device -l -c
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    open google chrome dev tools chrome://inspect, find the
                    device/app, enjoy
                </p>
            </li>
        </ol>
        <li dir="ltr">
            <p dir="ltr">
                ios
            </p>
        </li>
        <ol>
            <li dir="ltr">
                <p dir="ltr">
                    ionic run ios -l --device
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    connect device with data transfer cable
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    enable developers mode on device
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    open project in xCode
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    choose phone from dropdown, run project on your phone
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    you will see console logs in xCode (mention you might want
                    to JSON.stringify all the data you show in console, cant
                    stringify errors though)
                </p>
            </li>
        </ol>
    </ol>
    <li dir="ltr">
        <p dir="ltr">
            production
        </p>
    </li>
    <ol>
        <li dir="ltr">
            <p dir="ltr">
                ionic build ios --release
            </p>
        </li>
        <ol>
            <li dir="ltr">
                <p dir="ltr">
                    open in xcode
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    you might need to modify version in “General” tab and
                    Camera and Library usage on “Info” tab
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    connect your ios device
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    Go Product -&gt; Archive (if “Archive” is grey problem
                    might be in the device which is not connected or with
                    provisioning profiles and teams)
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    Open Window -&gt; Organizer, you can see versions there
                    (its important that every new version is higher then
                    previous one)
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    Choose version, click “Upload” button on the right
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    Click “OK” and “Continue” etc. there might be an error
                    while uploading, 2 things might help:
                </p>
            </li>
            <ol>
                <li dir="ltr">
                    <p dir="ltr">
                        unchecking and checking the team profile on “General”
                        tab
                    </p>
                </li>
                <li dir="ltr">
                    <p dir="ltr">
                        “restarting” the profile inside the popup window if
                        “continue” button is grey
                    </p>
                </li>
            </ol>
            <li dir="ltr">
                <p dir="ltr">
                    go to itunesconnect, testflight versions, it will ask you a
                    question about the encryption, just choose no - app is
                    published to testflight
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    to publish it into production go to production page, delete
                    old version and choose new one, save
                </p>
            </li>
        </ol>
        <li dir="ltr">
            <p dir="ltr">
                ionic android build --release (instructions can be also found
                here: http://ionicframework.com/docs/v1/guide/publishing.html)
            </p>
        </li>
        <ol>
            <li dir="ltr">
                <p dir="ltr">
                    sit in root of the application
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    keytool -genkey -v -keystore bt.keystore -alias bt -keyalg
                    RSA -keysize 2048 -validity 10000 ← you do this only once.
                    dont lose the password it will prompt you to create
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1
                    -keystore bt.keystore
                    platforms/android/build/outputs/apk/android-release-unsigned.apk
                    bt
                    ./platforms/android/build/outputs/apk/android-release-unsigned.apk
                    bt ← thats basically the address which ionic build
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    zipalign -v
                    ./platforms/android/build/outputs/apk/android-release-unsigned.apk
                    bt.apk
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    ~/Library/Android/sdk/build-tools/VERSION_OF_YOUR_SDK_HERE/zipalign
                    -v 4
                    ./platforms/android/build/outputs/apk/android-release-unsigned.apk
                    bt.apk
                </p>
            </li>
            <li dir="ltr">
                <p dir="ltr">
                    grab bt-release.apk, go to android developer’s console, go
                    into Versions and upload new one
                </p>
            </li>
        </ol>
    </ol>
</ol>
<p dir="ltr">
    Things to mention when building:
</p>
<ol>
    <li dir="ltr">
        <p dir="ltr">
            common/environment.ts holds connectivity info: API version and IP
            of a server
        </p>
    </li>
    <li dir="ltr">
        <p dir="ltr">
            you might need to use ionic proxy to develop on devices with live
            reload or CORS plugin to develop in browser mode
        </p>
    </li>
    <li dir="ltr">
        <p dir="ltr">
            if you want to develop on device with livereload, you will want to configure proxy. do so by adding this: 
            <code>
                "proxies": [
                    {
                        "path": "/API",
                        "proxyUrl": "YOUR_SERVER_ADDRESS"
                    }
                ],
            </code>
            into ionic-config.json. then you might want to configure the environment.ts file so that if "cordova" is detected 
            (means livereload while you develop) it would go through proxy, otherwise (in browser) - straight to the server.
            <br/>while developing in browser you probably want to use one of the CORS plugins to avoid issues
        </p>
    </li>
</ol>