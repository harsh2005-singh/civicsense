const router = require('express').Router();
router.get('/ping', (req, res) => res.json({ route: 'bills' }));
module.exports = router;