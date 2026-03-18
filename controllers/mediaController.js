const Media = require('../models/Media');
const fs = require('fs');
const path = require('path');

// @desc    Get all gallery items
// @route   GET /api/media
exports.getMedia = async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: media.length,
      data: media
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Upload new gallery item
// @route   POST /api/media
exports.uploadMedia = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ success: false, error: req.fileValidationError });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload an image' });
    }

    const { title, description, category } = req.body;

    const media = await Media.create({
      title,
      description,
      category,
      image: `/uploads/gallery/${req.file.filename}`
    });

    res.status(201).json({
      success: true,
      data: media
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update gallery item
// @route   PUT /api/media/:id
exports.updateMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ success: false, error: 'Media not found' });

    const { title, description } = req.body;
    if (title) media.title = title;
    if (description !== undefined) media.description = description;

    // If new image uploaded, delete old one
    if (req.file) {
      const oldPath = path.join(__dirname, '..', media.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      media.image = `/uploads/gallery/${req.file.filename}`;
    }

    await media.save();
    res.json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete gallery item
// @route   DELETE /api/media/:id
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    // Delete file from local storage
    const filePath = path.join(__dirname, '..', media.image);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await media.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
