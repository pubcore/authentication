const defaultOptions = { //all time values in [ms]
	maxTimeWithoutActivity: 1000 * 60 * 60 * 24 * 180,
	maxTimeWithout401: 1000 * 60 * 60 * 6,
	maxLoginAttempts:5,
	maxLoginAttemptsTimeWindow:1000 * 60 * 60 * 24,
	minTimeBetweenUpdates:1000 * 60 * 60
}

export default ({user, options}) => {
	//we expect runtime and database in same timezone
	var now = new Date().getTime(),
		{last_login, created_time, type, password_expiry_date,
			login_failed_count, last_login_failed, deactivate} = user,
		{maxTimeWithoutActivity, maxTimeWithout401, maxLoginAttempts,
			maxLoginAttemptsTimeWindow, minTimeBetweenUpdates
		} = {...defaultOptions, ...(options||{})}

	return {
		isToDeactivate:
			type !== 'SYSTEM'
			&& (
				(last_login && last_login.getTime() || 0) + maxTimeWithoutActivity < now
					&& (created_time && created_time.getTime()) + maxTimeWithoutActivity < now
				|| login_failed_count >= maxLoginAttempts
					&& last_login_failed && last_login_failed.getTime() > now - maxLoginAttemptsTimeWindow
			),
		isLoginExpired: type !== 'SYSTEM'
			&& last_login && last_login.getTime() + maxTimeWithout401 < now,
		isTimeToUpdate: !last_login || last_login.getTime() + minTimeBetweenUpdates <= now,
		isPasswordExpired: type !== 'SYSTEM'
			&& password_expiry_date && password_expiry_date.getTime() < now,
		isDeactivated: deactivate == 'yes'
	}
}
