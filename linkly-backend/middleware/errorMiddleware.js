// false endpoints

const notFound = (req, res, next) => {
    const error = new Error(`'Not Found' -  ${req.originalUrl}`)
    res.status(404).send(error)
    next(error)
}

// middleware err

const errorHandler = (err, req, res, next) => {
    if(res.headersSent) {
        return next(err)
    }

    res.status(err.code || 500).json({message: err.message || 'Unknown error'})
}

module.exports = {notFound, errorHandler}