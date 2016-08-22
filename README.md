## Angular Google Cloud Messaging

Angular-gcm is a simple service allowing users to subscribe to Google Cloud Messaging API.

## Setup

### Obtaining GCM Keys

<img src="http://images.google.com/intl/en_ALL/images/srpr/logo6w.png" width="150">
- Select your project
- Then select *APIs & auth* from the sidebar and click on *Credentials* tab
- Click **CREATE NEW Key** button
 - **Server Key**

### Add GCM to your project

#### Installing via Bower

```
bower install angular-gcm
```

#### Edit/Place files

 - Place `manifest.json` on your root domain and change the `gcm_sender_id` by the number of your project:

```javascript
  "gcm_sender_id": "my_project_number",
```

 - Add `<link rel="manifest" href="manifest.json">` on the header of your index.html :

```html
<head>
	...
	<link rel="manifest" href="manifest.json">
	...
</head>
```

 - Place `service-worker.js` on your root domain and edit it to suite you needs.

 - Declare `angular-gcm.js` script.

### Use it
in your app :
```javascript
	.run(['$rootScope', 'Server', function ($rootScope, Server) {
		$rootScope.serviceWorkerUrl = Server.baseUrl + '/service-worker.js';
		$rootScope.subscribePostUrl = Server.baseUrl + '/register';
	}])
```

available function:
 - changeState ( subscribe/ unsubscribe )
 - getState
 - getSubscriptionId

***note : you need to have an https website to allow users to subscribe***

On the server side you must call the Google Cloud Messaging API using the POSTed subscriber token to send a notification :

```javascript
curl --header "Authorization: key=your_gcm_server_key"
--header Content-Type:"application/json"
https://android.googleapis.com/gcm/send
-d "{\"registration_ids\":[\"subscriber_token\"]}"
```

Google GCM Doc : https://developers.google.com/cloud-messaging/
