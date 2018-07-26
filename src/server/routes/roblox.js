const express = require('express');

const fetch = require('node-fetch');
const { catchAsync } = require('../util/discordHTTP');

const router = express.Router();

const cache = new Map();
// Consider removing description to save storage space on client
router.get(`/group/:id`, catchAsync(async function (req, res) {
	if (req.params.id) {
		if (cache.get(req.params.id)) {
			const group = cache.get(req.params.id);
			group.cached = true;
			res.send(group);
			return;
		}
		if (isNaN(req.params.id)) {
			res.status(400);
			return res.send({error: {status: 400, message: 'Group Id must be a valid number.'}});
		}
		let apiRes = await fetch(`https://api.roblox.com/groups/${req.params.id}`);
		if (apiRes.status === 404) {
			res.status(404);
			return res.send({error: {status: 404, message: 'Group does not exist'}});
		} else if (apiRes.status === 503) {
			res.status(503);
			return res.send({error: {status: 503, message: 'Get group info is disabled'}});
		} else if (!apiRes.ok) {
			res.status(apiRes.status);
			const apiResJson = await apiRes.json();
			const message = apiResJson.message ? apiResJson.message : apiResJson[0].message;
			return res.send({error: {status: apiRes.status, message: message}});
		}
		apiRes = await apiRes.json();
		cache.set(req.params.id, apiRes);
		return res.send(apiRes);

	} else {
		res.status(400);
		return res.send({error: {status: 400, message: 'Group Id is required.'}});
	}

}));

module.exports = router;