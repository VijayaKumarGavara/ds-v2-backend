const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dicmdo152',
  api_key: '821919426746372',
  api_secret: 'sO_sDCUxqrC9XpgTRYb74FZbWxE'
});

module.exports = cloudinary;
