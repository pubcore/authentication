[![Build Status](https://travis-ci.com/pubcore/authentication.svg?branch=master)](https://travis-ci.com/pubcore/authentication)

### Username/password based authentication process
Authentication with trusted pears can be done username/password based.
Scenarios leverage HTTP Basic Auth via SSL/TLS (https) are a usecase for this package.

#### Features
* returns a promise
* invokes "noCredentials", if username or password is empty
* invokes "notFound", if user not found by usesername
* invokes "isDeactivated", if user is deactivated
* invokes "toDeactivate" for HUMAN users, if last login and user's creation long time ago
* invokes "loginExpired" for HUMAN users, if last login is some hours ago
* invokes "invalidPassword" if active user exists, but passwort is wrong
* invokes "authenticated", if active user found and passwort is ok
* invokes "oldPwUsed" (oldPasswordUsed), if secondary password is given, but old password is used (and does match) to authenticate
* supports login with secondary password, if configured
* invokes "toDeactivate", if active, non system user reach max attempts with wrong password, within some time-frame
* invokes "passwordExpired", if active, non system user login with old password
* supports login with temporary password
* must not invoke "toDeactivate", "loginExpired" and "passwordExpired" for SYSTEM user

#### Arguments
	The argument object consists of following artifacts:
	Gofers are callback functions which will be invoked with "user" argument.  
	Carriers are Promises to load/send data.
	Libs are functions or promises to map data.
	Options are plain objects for configuration purpose.

	arg = { gofer, carrier, lib, options}

	gofer = {
		noCredentials(){},
		notFound(){},
		isDeactivated(){},
		toDeactivate(){},
		loginExpired(){},
		invalidPassword(){},
		authenticated(){},
		oldPwUsed(){},
		passwordExpired(){}
	},
	options = {
		maxTimeWithoutActivity: (integer)[milli seconds],
		maxTimeWithout401: (integer)[milli seconds],
		maxLoginAttempts: (integer),
		maxLoginAttemptsTimeWindow: (integer)[milli seconds]
	},
	carrier = { getUser: ({username}) => <Promise resolve to user or null> },
	lib = { comparePassword: (x, y) => <Promise resolve to boolean> }

#### Required datastructure of user

	{
		username: <String>,
		created_time: <Date>,
		last_login: <Date>,
		type: <String>,
		password: <String>,
		password_secondary: <String>,
		password_new: <String>,
		last_login_failed: <Date>,
		login_failed_count: <Integer>,
		password_expiry_date: <Date>
		deactivate:<string>
	}
