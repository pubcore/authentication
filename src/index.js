import checkPw from './lib/checkWithSecondaryPassword'

//no brute force protection implemented => see express-rate-limit
export default arg => {
	var {username, password, gofer, carrier, options} = arg || {},
		{noCredentials, notFound, isDeactivated, toDeactivate, loginExpired,
			invalidPassword, authenticated, passwordExpired} = gofer,
		{getUser} = carrier,
		//all time values in [ms]
		{maxTimeWithoutActivity, maxTimeWithout401, maxLoginAttempts,
			maxLoginAttemptsTimeWindow} = options

	return new Promise(resolve => {
		if(!username || !password){
			noCredentials()
			resolve()
		}else{
			resolve(getUser({username}).then(usr => usr || null))
		}
	}).then( user => {
		var {deactivate, type, last_login, created_time, login_failed_count,
			last_login_failed, password_expiry_date} = user || {}
		if(!user){
			user === null && notFound({username})
		}else if(deactivate == 'yes'){
			isDeactivated(user)
		}else{
			var now = new Date().getTime()
			if(
				type !== 'SYSTEM'
				&& (last_login && last_login.getTime() || 0) + maxTimeWithoutActivity < now
				&& (created_time && created_time.getTime()) + maxTimeWithoutActivity < now
			){
				toDeactivate(user)
			}else if(
				loginExpired
				&& type !== 'SYSTEM'
				&& last_login && last_login.getTime() + maxTimeWithout401 < now
			){
				loginExpired(user)
			}else {
				return checkPw({user, ...arg}).then(
					checkOk => {
						if(checkOk){
							if(
								type !== 'SYSTEM'
								&& password_expiry_date && password_expiry_date.getTime() < now
							){
								passwordExpired(user)
							}else{
								authenticated(user)
							}
						}else if(
							type !== 'SYSTEM'
							&& login_failed_count >= maxLoginAttempts
							&& (last_login_failed && last_login_failed.getTime() || 0) > now - maxLoginAttemptsTimeWindow
						){
							toDeactivate(user)
						}else{
							invalidPassword(user)
						}
					}
				)
			}
		}
	})
}
