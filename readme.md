[![Build Status](https://travis-ci.com/pubcore/authentication.svg?branch=master)](https://travis-ci.com/pubcore/authentication)

### Username/password or JsonWebTOken based authentication process

#### Features
```
✓ returns a promise  
✓ invokes "noCredentials", if username or password is empty  
✓ invokes "notFound", if user not found by usesername
✓ invokes "isDeactivated", if user is deactivated
✓ invokes "toDeactivate" for HUMAN users, if last login and user's creation long time ago
✓ invokes "loginExpired" for HUMAN users, if last login is some hours ago
✓ invokes "invalidPassword" if active user exists, but passwort is wrong
✓ invokes "invalidWebToken", if JsonWebToken is there (not falsy) and invalid
✓ invokes "authenticated", if active user found and passwort is ok
✓ invokes "authenticated", if valid JsonWebToken is there
✓ invokes "notFound", if user not found by JsonWebToken
✓ invokes "oldPwUsed" (oldPasswordUsed), if secondary password is given, but old password is used (and does match) to authenticate
✓ supports login with secondary password, if configured
✓ invokes "toDeactivate", if active, non system user reach max attempts with wrong password, within some time-frame
✓ invokes "passwordExpired", if active, non system user login with old password
✓ supports login with temporary password
✓ must not invoke "toDeactivate", "loginExpired" and "passwordExpired" for SYSTEM user
```
#### Arguments
	The argument object consists of following artifacts:
	Gofers are callback functions which will be invoked with "user" argument.  
	Carriers are Promises to load/send data.
	Libs are functions or promises to map data.
	jwt is optional JsonWebToken string, encoded as it comes from request data.
	username/password is required, if jwt is falsy or invalid

	arg = {gofer, carrier, lib, jwt, username, password}

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
	carrier = {
		getUser: ({username}) => <Promise resolve to user or null>
		getOptions: () => Promise resolve to an options object>
	lib = { comparePassword: (x, y) => <Promise resolve to boolean> }

#### Options
```
{
	maxTimeWithoutActivity: (integer)[milli seconds],
	maxTimeWithout401: (integer)[milli seconds],
	maxLoginAttempts: (integer),
	maxLoginAttemptsTimeWindow: (integer)[milli seconds],
	jwtKey: (string), required if argument "jwt" is not falsy
}
```

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
