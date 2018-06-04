import bcrypt from 'bcryptjs'
import hashes from 'jshashes'

const sha1 = new hashes.SHA1()

export default (cleartext, hash) => {
	return bcrypt.compare(
		sha1.hex(cleartext),
		hash.replace(/^\$2y(.+)$/i, '$2a$1')
	)
}
