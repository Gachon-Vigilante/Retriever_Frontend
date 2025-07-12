const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/channels',
        createProxyMiddleware({
            target: String(process.env.REACT_APP_API_BASE_URL),
            changeOrigin: true,
        })
    );
};
