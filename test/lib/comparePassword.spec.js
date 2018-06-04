import comparePassword from '../../src/lib/comparePassword'
import {expect} from 'chai'

describe('compare bcrypted password', () => {
	it('returns a promise, because bcrypt is slow', () => {
		expect(comparePassword('', '')).to.be.a('promise')
	})
	it('resolves to true, if match', () => {
		return comparePassword('test', '$2y$04$RG9G38B8UD2zoHnP9MD2eunCc6hJxvmVly5r/1CRg9el3kfptw8Ra').then(
			res => expect(res).to.be.true
		)
	})
	it('resolves to false, if not match', () => {
		return comparePassword('wrong', '$2y$04$RG9G38B8UD2zoHnP9MD2eunCc6hJxvmVly5r/1CRg9el3kfptw8Ra').then(
			res => expect(res).to.be.false
		)
	})
})
