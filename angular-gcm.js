(function(angular) {
	'use strict';

	angular.module('angular-gcm', []).service('gcm', ['$http', '$rootScope', function($http, $rootScope) {
		var GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';
		var isPushEnabled = false;
		var subscriptionId = null;
		function sendSubscriptionToServer(subscription) {
			// TODO: Send the subscriptionId
			// to your server and save it to send a
			// push message at a later date
			// Get only the subscriptionId from the endpoint
			// https://developers.google.com/web/updates/2015/03/push-notifications-on-the-open-web#sending-a-push-message
			var endpoint = subscription.endpoint;
			subscriptionId = endpoint;
			if (endpoint.startsWith('GCM_ENDPOINT')){
				var endpointParts = endpoint.split('/');
				subscriptionId = endpointParts[endpointParts.length - 1];
			}
			$http.post($rootScope.subscribePostUrl, {"token" : subscriptionId})
		}

		function unsubscribe() {

			navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
				// To unsubscribe from push messaging, you need get the
				// subcription object, which you can call unsubscribe() on.
				serviceWorkerRegistration.pushManager.getSubscription().then(function(pushSubscription) {
					// Check we have a subscription to unsubscribe
					if (!pushSubscription) {
						// No subscription object, so set the state
						// to allow the user to subscribe to push
						isPushEnabled = false;
						return;
					}

					// TODO: Make a request to your server to remove
					// the users data from your data store so you
					// don't attempt to send them push messages anymore

					// We have a subcription, so call unsubscribe on it
					pushSubscription.unsubscribe().then(function(successful) {
						isPushEnabled = false;
					}).catch(function(e) {
						// We failed to unsubscribe, this can lead to
						// an unusual state, so may be best to remove
						// the subscription id from your data store and
						// inform the user that you disabled push

						console.log('Unsubscription error: ', e);
					});
				}).catch(function(e) {
					console.log('Error thrown while unsubscribing from ' +
					'push messaging.', e);
				});
			});
		}
		function subscribe() {
			// Disable the button so it can't be changed while
			// we process the permission request

			navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
				serviceWorkerRegistration.pushManager.subscribe({
					 userVisibleOnly: true
				})
				.then(function(subscription) {
					// The subscription was successful
					isPushEnabled = true;

					// TODO: Send the subscription subscription.endpoint
					// to your server and save it to send a push message
					// at a later date
					return sendSubscriptionToServer(subscription);
				})
				.catch(function(e) {
					if (Notification.permission === 'denied') {
						// The user denied the notification permission which
						// means we failed to subscribe and the user will need
						// to manually change the notification permission to
						// subscribe to push messages
						console.log('Permission for Notifications was denied');
						pushButton.disabled = true;
					} else {
						// A problem occurred with the subscription, this can
						// often be down to an issue or lack of the gcm_sender_id
						// and / or gcm_user_visible_only
						console.log('Unable to subscribe to push.', e);
						pushButton.disabled = false;
						pushButton.textContent = activate;
					}
				});
			});
		}

		// Once the service worker is registered set the initial state
		function initialiseState() {
			// Are Notifications supported in the service worker?
			if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
				console.log('Notifications aren\'t supported.');
				return;
			}

			// Check the current Notification permission.
			// If its denied, it's a permanent block until the
			// user changes the permission
			if (Notification.permission === 'denied') {
				console.log('The user has blocked notifications.');
				return;
			}

			// Check if push messaging is supported
			if (!('PushManager' in window)) {
				console.log('Push messaging isn\'t supported.');
				return;
			}

			// We need the service worker registration to check for a subscription
			navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
				// Do we already have a push message subscription?
				serviceWorkerRegistration.pushManager.getSubscription()
				.then(function(subscription) {
					// Enable any UI which subscribes / unsubscribes from
					// push messages.

					if (!subscription) {
						// We aren’t subscribed to push, so set UI
						// to allow the user to enable push
						// check if it's his first visit and force first subscribe
						if (!localStorage.getItem('visit')) {
							subscribe();
							localStorage.setItem('visit', true);
						} else {
							return;
						}
					}

					// Keep your server in sync with the latest subscription
					sendSubscriptionToServer(subscription);

					// Set your UI to show they have subscribed for
					// push message
					isPushEnabled = true;
				})
				.catch(function(err) {
					console.log('Error during getSubscription()', err);
				});
			});
		}
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register($rootScope.serviceWorkerUrl)
			.then(initialiseState);
		} else {
			console.log('Service workers aren\'t supported in this browser.');
		}
		return {
			changeState: function() {
				if (isPushEnabled) {
					unsubscribe();
				} else {
					subscribe();
				}
			},
			getState: function() {
				return isPushEnabled;
			},
			getSubscriptionId: function() {
				return subscriptionId;
			}
		};
	}]);
})(window.angular);
