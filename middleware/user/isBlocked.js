const { User } = require('../../model/userschema');
const path = require('path')
const checkBlocked = async (req, res, next) => {
    try {
        console.log(req.user.user._id)
        const user = await User.findById(req.user.user._id); // Assuming req.user is populated via auth
        if (user.isBlocked) {
            res.clearCookie('jwtToken');
            res.clearCookie("loggedIn");
              return res.status(403).sendFile(path.join(__dirname, '../../public/blocked.html'));

        }

        next();
    } catch (err) {
          console.error(err)
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = checkBlocked
