const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = require('../middleware/uploadMiddleware');
const {
  getMedia,
  uploadMedia,
  deleteMedia,
  updateMedia
} = require('../controllers/mediaController');

router.route('/')
  .get(getMedia)
  .post(
    (req, res, next) => {
      upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, error: 'फ़ाइल बहुत बड़ी है। अधिकतम 20MB की फोटो अपलोड करें।' });
        }
        if (err) return res.status(400).json({ success: false, error: err });
        next();
      });
    },
    uploadMedia
  );

router.route('/:id')
  .put(
    (req, res, next) => {
      upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, error: 'फ़ाइल बहुत बड़ी है। अधिकतम 20MB की फोटो अपलोड करें।' });
        }
        if (err) return res.status(400).json({ success: false, error: err });
        next();
      });
    },
    updateMedia
  )
  .delete(deleteMedia);

module.exports = router;
