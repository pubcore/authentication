import {expect} from 'chai'
import mapFacts from '../src/lib/factsMap'

describe('map user with options to facts', () => {
	it('supports call without options', () => {
		expect(mapFacts({user:{}})).to.be.a('object')
	})
	it('determine minTimeBetweenUpdates', () => {
		expect(mapFacts({
			user:{last_login:new Date()},
			options:{minTimeBetweenUpdates:0}
		})).to.contain({isTimeToUpdate:true})
		expect(mapFacts({
			user:{last_login:new Date()},
			options:{minTimeBetweenUpdates:1}
		})).to.contain({isTimeToUpdate:false})
	})
})
