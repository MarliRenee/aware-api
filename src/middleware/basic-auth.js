function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || ''
    let basicToken
    if (!authToken.toLowerCase().startsWith('basic ')) {
        return res.status(401).json({ error: 'Missing basic token' })
    } else {
        basicToken = authToken.slice('basic '.length, authToken.length)
    }

    const [tokenUserName, tokenPassword] = Buffer
        .from(basicToken, 'base64')
        .toString()
        .split(':')

    if (!tokenUserName || !tokenPassword) {
        console.log(tokenUserName, tokenPassword)
        return res.status(401).json({ error: 'Unauthorized request' })
    }

    req.app.get('db')('aware_users')
        .where({ username: tokenUserName })
        .first()
        .then(user => {
            if (!user || user.password !== tokenPassword) {
                return res.status(401).json({ error: 'Unauthorized request, wrong username or password' })
            }
            req.user = user
            next()
        })
        .catch(next)

}
  
module.exports = {
    requireAuth,
}