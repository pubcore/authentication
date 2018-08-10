import checkPw from './lib/checkWithSecondaryPassword'
import factsMap from './lib/factsMap'

//brute force protection => see express-rate-limit
export default arg => {
	var {username, password, gofer, carrier} = arg,
		{noCredentials, notFound, isDeactivated, toDeactivate, loginExpired,
			invalidPassword, authenticated, passwordExpired} = gofer,
		{getUser, getOptions} = carrier,
		isDeactivatedCallback = isDeactivated

	return new Promise(resolve => {
		!username || !password ?
			resolve(noCredentials())
			: resolve( getUser({username}).then(usr => usr || null) )
	}).then( user => getOptions().then(options => {
		if(user === null){
			return notFound({username})
		}else if (!user){
			return user
		}

		var {isToDeactivate, isLoginExpired, isPasswordExpired,
			isDeactivated, isTimeToUpdate} = factsMap({user, options})

		if(isDeactivated){
			return isDeactivatedCallback(user)
		}else if(isToDeactivate){
			return toDeactivate(user)
		}else if(loginExpired && isLoginExpired){
			return loginExpired(user)
		}else {
			return checkPw({user, ...arg}).then( checkOk => checkOk ?
				isPasswordExpired ?
					passwordExpired(user) : authenticated(user, isTimeToUpdate)
				: invalidPassword(user)
			)
		}
	}))
}
