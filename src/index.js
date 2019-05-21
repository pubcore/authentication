import checkPw from './lib/checkWithSecondaryPassword'
import factsMap from './lib/factsMap'
import {verify} from 'jsonwebtoken'

//brute force protection => see express-rate-limit
export default arg => {
	var {username, password, gofer, carrier, jwt} = arg,
		{noCredentials, notFound, isDeactivated, toDeactivate, loginExpired,
			invalidPassword, authenticated, passwordExpired, invalidWebToken} = gofer,
		{getUser, getOptions} = carrier,
		isDeactivatedCallback = isDeactivated
	return getOptions().then(options => new Promise(resolve =>
		jwt && verify(jwt, options.jwtKey, {algorithms: ['HS256']}, (err, decoded) => {
			resolve(err ? invalidWebToken(err)&&null : decoded )
		}) || resolve()
	).then( jwtDecoded =>
		jwt ? jwtDecoded && getUser(jwtDecoded).then( usr => usr || null)
			: (
				(!username || !password) ?
					noCredentials()
					: getUser({username}).then( usr => usr || null)
			)
	).then(user => {
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
			return (jwt ? Promise.resolve(true) : checkPw({user, ...arg})).then(
				checkOk => checkOk ?
					isPasswordExpired ?
						passwordExpired(user) : authenticated(user, isTimeToUpdate)
					: invalidPassword(user)
			)
		}
	})
	)
}
