import checkPw from './lib/checkWithSecondaryPassword'
import factsMap from './lib/factsMap'
import {verify} from 'jsonwebtoken'

//brute force protection => see express-rate-limit
export default arg => {
	var {username, password, gofer, carrier, jwt, jwtList} = arg,
		{noCredentials, notFound, isDeactivated, toDeactivate, loginExpired,
			invalidPassword, authenticated, passwordExpired, invalidWebToken} = gofer,
		{getUser, getOptions} = carrier,
		isDeactivatedCallback = isDeactivated,
		jwtExists = Array.isArray(jwtList) && jwtList.length || jwt,
		jwts = jwtList || [jwt],
		chain = (tokens, options, resolve) => {
			//use pop because sequence matters, last item has highest priority
			var token = tokens.pop()
			verify(token, options.jwtKey, {algorithms: ['HS256']}, (err, decoded) => {
				if(err && tokens.length){
					chain(tokens, options, resolve)
				}else if(err){
					invalidWebToken(err)
					resolve()
				}else{
					resolve(decoded)
				}
			})
		}

	return getOptions().then(options => new Promise(resolve =>
		jwtExists && chain(jwts, options, resolve) || resolve()
	).then( jwtDecoded =>
		jwtExists ? jwtDecoded && getUser(jwtDecoded).then( usr => usr || null)
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
			return (jwtExists ? Promise.resolve(true) : checkPw({user, ...arg})).then(
				checkOk => checkOk ?
					isPasswordExpired ?
						passwordExpired(user) : authenticated(user, isTimeToUpdate)
					: invalidPassword(user)
			)
		}
	})
	)
}
