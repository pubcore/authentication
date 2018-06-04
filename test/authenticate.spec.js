import authenticate from '../src/index'
import chai, {expect} from 'chai'
import spies from 'chai-spies'
chai.use(spies)

afterEach( () => { chai.spy.restore() })

const typeByName = (name) => name[2]==='S' ? 'SYSTEM' : 'HUMAN'

var gofer = {
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
		maxTimeWithoutActivity: 1000 * 60 * 60 * 24 * 180,
		maxTimeWithout401: 1000 * 60 * 60 * 6,
		maxLoginAttempts:1,
		maxLoginAttemptsTimeWindow:0
	},
	carrier = { getUser: ({username}) => Promise.resolve(({
		//if username ends with S, type will be set to "SYSTEM"
		uA:{deactivate:'yes'},
		uB:{
			created_time:new Date('01.01.1990'),
			last_login:null,
			type:typeByName(username)
		},
		uC:{
			last_login:new Date(new Date().getTime() - options.maxTimeWithout401 - 1000),
			type:typeByName(username)
		},
		uD:{
			last_login:new Date(new Date().getTime() - 1000),
			password:'z'
		},
		uE:{
			last_login:new Date(new Date().getTime() - 1000),
			password:'z',
			password_secondary:'ps'
		},
		uF:{
			last_login:new Date(new Date().getTime() - 1000),
			password:'z',
			last_login_failed:new Date(new Date().getTime() + 1000),
			login_failed_count:1,
			type:typeByName(username)
		},
		uG:{
			last_login:new Date(new Date().getTime() - 1000),
			password:'z',
			password_expiry_date:new Date(new Date().getTime() - 1000),
			type:typeByName(username)
		},
		uH:{
			last_login:new Date(new Date().getTime() - 1000),
			password_new:'z',
		},
	})[username.substring(0, 2)]) },
	lib = { comparePassword: (x, y) => Promise.resolve(x==y) },
	arg = { gofer, carrier, lib, options}

function expectOnlyOneHasBeenCalled(only){
	Object.keys(gofer).forEach(n => {
		expect(gofer[n]).to.have.been.called.exactly(n==only ? 1 : 0)
	})
}
function spyGofer(){
	chai.spy.on(gofer, Object.keys(gofer))
}

describe('user authentication by username and password', () => {
	it('returns a promise', () => {
		expect(authenticate(arg)).to.be.a('promise')
	})
	it('invokes "noCredentials", if username or password is empty', () => {
		spyGofer()
		return authenticate(arg).then(() => {
			expectOnlyOneHasBeenCalled('noCredentials')
		})
	})
	it('invokes "notFound", if user not found by usesername', () => {
		spyGofer()
		return authenticate({...arg, username:'xy', password:'xy'}).then(() => {
			expectOnlyOneHasBeenCalled('notFound')
		})
	})
	it('invokes "isDeactivated", if user is deactivated', () => {
		spyGofer()
		return authenticate({...arg, username:'uA', password:'xy'}).then(() => {
			expectOnlyOneHasBeenCalled('isDeactivated')
		})
	})
	it('invokes "toDeactivate" for HUMAN users, if last login and user\'s creation long time ago', () => {
		spyGofer()
		return authenticate({...arg, username:'uB', password:'xy'}).then(() => {
			expectOnlyOneHasBeenCalled('toDeactivate')
		})
	})
	it('invokes "loginExpired" for HUMAN users, if last login is some hours ago', () => {
		spyGofer()
		return authenticate({...arg, username:'uC', password:'xy'}).then(() => {
			expectOnlyOneHasBeenCalled('loginExpired')
		})
	})
	it('invokes "invalidPassword" if active user exists, but passwort is wrong', () => {
		spyGofer()
		return authenticate({...arg, username:'uD', password:'xy'}).then(() => {
			expectOnlyOneHasBeenCalled('invalidPassword')
		})
	})
	it('invokes "authenticated", if active user found and passwort is ok', () => {
		spyGofer()
		return authenticate({...arg, username:'uD', password:'z'}).then(() => {
			expectOnlyOneHasBeenCalled('authenticated')
		})
	})
	it('invokes "oldPwUsed" (oldPasswordUsed), if secondary password is given, but old password is used (and does match) to authenticate', () => {
		spyGofer()
		return authenticate({...arg, username:'uE', password:'z'}).then(() => {
			expect(gofer.oldPwUsed).to.have.been.called.exactly(1)
			expect(gofer.authenticated).to.have.been.called.exactly(1)
		})
	})
	it('supports login with secondary password, if configured', () => {
		spyGofer()
		return authenticate({...arg, username:'uE', password:'ps'}).then(() => {
			expectOnlyOneHasBeenCalled('authenticated')
		})
	})
	it('invokes "toDeactivate", if active, non system user reach max attempts with wrong password, within some time-frame', () => {
		spyGofer()
		return authenticate({...arg, username:'uF', password:'xy'}).then(() => {
			expectOnlyOneHasBeenCalled('toDeactivate')
		})
	})
	it('invokes "passwordExpired", if active, non system user login with old password', () => {
		spyGofer()
		return authenticate({...arg, username:'uG', password:'z'}).then(() => {
			expectOnlyOneHasBeenCalled('passwordExpired')
		})
	})
	it('supports login with temporary password', () => {
		spyGofer()
		return authenticate({...arg, username:'uH', password:'z'}).then(() => {
			expectOnlyOneHasBeenCalled('authenticated')
		})
	})
	it('must not invoke "toDeactivate", "loginExpired" and "passwordExpired" for SYSTEM user', () => {
		spyGofer()
		Promise.all([
			authenticate({...arg, username:'uBS', password:'xy'}),
			authenticate({...arg, username:'uCS', password:'xy'}),
			authenticate({...arg, username:'uFS', password:'xy'}),
			authenticate({...arg, username:'uGS', password:'xy'})
		]).then(() => {
			expect(gofer.toDeactivate).to.not.have.been.called
			expect(gofer.loginExpired).to.not.have.been.called
			expect(gofer.passwordExpired).to.not.have.been.called
		})
	})
})
