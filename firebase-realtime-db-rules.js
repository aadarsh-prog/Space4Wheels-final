// Realtime Database Rules
// Copy these rules to your Firebase console

{
  \
  "rules\": {
    "plotAvailability":
  ;(".read")
  : true,
      "$plotId":
  ;(".write")
  : "auth != null && (root.child('plots').child($plotId).child('ownerId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin')"
  ,
    "userPresence":
  ;("$userId")
  :
  ;(".read")
  : "auth != null",
        ".write": "auth != null && auth.uid === $userId"
  ,
    "notifications":
  ;("$userId")
  :
  ;(".read")
  : "auth != null && auth.uid === $userId",
        ".write": "auth != null && (auth.uid === $userId || root.child('users').child(auth.uid).child('role').val() === 'admin')"
}
}
