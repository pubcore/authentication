export default arg => new Promise(resolve => {
	var {password, user, gofer, lib} = arg,
		{oldPwUsed} = gofer,
		{comparePassword} = lib,
		{password_new, password_secondary} = user,
		pwHash = user.password

	if(password && password === password_new){
		resolve(true)
	}else{
		comparePassword(password, pwHash).then(
			equal => {
				if(equal){
					if(password_secondary && oldPwUsed){
						oldPwUsed(user)
					}
					resolve(true)
				}else if(password_secondary){
					comparePassword(password, password_secondary).then(
						equal => resolve(equal)
					)
				}else{
					resolve(false)
				}
			}
		)
	}
})
