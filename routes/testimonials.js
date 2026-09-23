/**
 * routes/testimonials.js
 * Bridges legacy /api/testimonials requests to the central /api/stories router
 * ensuring 100% backward compatibility.
 */

const storiesRouter = require('./stories');

module.exports = storiesRouter;
