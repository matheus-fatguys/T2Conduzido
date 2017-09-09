interface IFCMPlugin {
    onNotification(onNotificationCallback, successCallback?, errorCallback?);
    getToken(successCallback, errorCallback?);
    onTokenRefresh(onTokenRefreshCallback);
    subscribeToTopic(topic: string, successCallback?, errorCallback?);
    unsubscribeFromTopic(topic: string, successCallback?, errorCallback?);
  }
  declare var FCMPlugin:IFCMPlugin;