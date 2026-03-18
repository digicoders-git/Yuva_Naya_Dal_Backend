const express = require('express');
const router = express.Router();
const {
  getMemberships,
  getMembership,
  createMembership,
  updateMembership,
  deleteMembership
} = require('../controllers/membershipController');

router.route('/')
  .get(getMemberships)
  .post(createMembership);

router.route('/:id')
  .get(getMembership)
  .put(updateMembership)
  .delete(deleteMembership);

module.exports = router;
