import React from 'react';
import {SafeAreaView, View, Button, Platform} from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';

PushNotification.configure({
  onRegister: function (token) {
    console.log("TOKEN:", token);
  },
  onNotification: function (notification) {
    console.log("NOTIFICATION:", notification);
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },
  onAction: function (notification) {
    console.log("ACTION:", notification.action);
    console.log("NOTIFICATION:", notification);
  },
  onRegistrationError: function(err) {
    console.error(err.message, err);
  },
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },
  popInitialNotification: true,
  requestPermissions: true,
});

const localNotification = (remoteMessage) => {
  const {notification, data, messageId} = remoteMessage;
  const options =
    Platform.OS === 'ios'
      ? {
          title: notification.title,
          message: notification.body || '',
          userInfo: data,
        }
      : {
          channelId: '@string/default_notification_channel_id',
          largeIcon: '@drawable/ic_notification_large',
          smallIcon: '@drawable/ic_notification',
          bigPictureUrl: notification.android.imageUrl,
          bigText: notification.android.body || '',
          subText: notification.android.title,
          title: notification.android.title,
          message: notification.android.body || '',
          userInfo: data,
          messageId,
          priority: 'high',
          importance: 'high',
        };
  PushNotification.localNotification(options);
};

const initFirebase = () => {
  messaging().onMessage(localNotification);
  messaging().onNotificationOpenedApp((notificationOpen) => {
    console.log(notificationOpen);
  });
  messaging()
    .getInitialNotification()
    .then((notificationOpen) => {
      if (notificationOpen) {
        console.log(notificationOpen);
      }
    });
};

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  messaging()
    .getToken()
    .then(token => {
      console.log({token});
    });
  initFirebase();
  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

// const IMAGE_URL = 'https://i.ytimg.com/vi/CG5OLXxlkUo/maxresdefault.jpg';
const IMAGE_URL = 'https://images-na.ssl-images-amazon.com/images/I/51rwBMmnPYL._SX384_BO1,204,203,200_.jpg';
// const IMAGE_URL = 'https://ih1.redbubble.net/image.1045074544.0774/flat,750x1000,075,f.jpg';
const App = () => {
  const onPressNotification = () => {
    try {
      const options = {
        channelId: '@string/default_notification_channel_id',
        bigPictureUrl: IMAGE_URL,
        title: 'Notification Title',
        message: 'Notification Body',
        userInfo: {
          image: IMAGE_URL,
        },
        priority: 'high',
        importance: 'high',
      };

      PushNotification.localNotification(options);
      console.log('call me')
    } catch (err) {
      console.log(err);
    }
  };

  React.useEffect(() => {
    requestUserPermission();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View>
        <Button title="Send Push Notifiation" onPress={onPressNotification} />
      </View>
    </SafeAreaView>
  );
};

export default App;
