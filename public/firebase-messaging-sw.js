importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyCGLjB-VYTsjcCHAOZxg7a57caGK0nfUWE",
  authDomain: "sync360-78f4d.firebaseapp.com", // must be in Firebase console Authorized domains
  projectId: "sync360-78f4d",
  storageBucket: "sync360-78f4d.appspot.com", // ⚠️ corrected suffix
  messagingSenderId: "178915188057",
  appId: "1:178915188057:web:085abf45b7f630cf868048",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("🔔 Background message:", payload);
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
    icon: payload.notification?.icon || "/icons/notification-icon.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
