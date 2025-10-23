const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// =================== Verify OTP & Login ===================
exports.verifyOtpAndLogin = async (req, res) => {
  try {
    const { phone } = req.body;

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, isPhoneVerified: true });
    }

    const token = jwt.sign(
      { _id: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Verify OTP & Login Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message,
    });
  }
};

// =================== Get User Profile ===================
exports.getProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let profile = await UserProfile.findOne({ userId: user._id }).populate("userId", "phone");


    if (!profile) {
      profile = new UserProfile({
        userId: user._id,
        phone: user.phone,
        name: '',
        email: '',
        addresses: [],
      });
      await profile.save();
    }

    return res.status(200).json({ profile, user });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



// =================== Create/Update User Profile ===================
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let profile = await UserProfile.findOne({ userId });
    if (profile) {
      profile.name = name;
      profile.email = email;
      profile.updatedAt = new Date();
      await profile.save();

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        profile,
      });
    } else {
      profile = new UserProfile({ userId, name, email });
      await profile.save();

      return res.status(201).json({
        success: true,
        message: 'Profile created successfully',
        profile,
      });
    }
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

// =================== Add Address ===================
exports.addAddress = async (req, res) => {
  try {
    const { type, addressLine1, addressLine2, city, state, pincode, landmark, isDefault } = req.body;
    const userId = req.user._id;

    if (!addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Address line 1, city, state, and pincode are required',
      });
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({ success: false, message: 'Valid 6-digit pincode required' });
    }

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please create your profile first.',
      });
    }

    if (isDefault) {
      profile.addresses.forEach(addr => addr.isDefault = false);
    }

    const makeDefault = profile.addresses.length === 0 || isDefault;

    const newAddress = {
      type: type || 'home',
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state,
      pincode,
      landmark: landmark || '',
      isDefault: makeDefault,
    };

    profile.addresses.push(newAddress);
    profile.updatedAt = new Date();
    await profile.save();

    return res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address: profile.addresses[profile.addresses.length - 1],
    });
  } catch (error) {
    console.error('Add Address Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to add address',
      error: error.message,
    });
  }
};

// =================== Get All Addresses ===================
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await UserProfile.findOne({ userId }).select('addresses');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Addresses fetched successfully',
      addresses: profile.addresses,
    });
  } catch (error) {
    console.error('Get Addresses Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses',
      error: error.message,
    });
  }
};

// =================== Update Address ===================
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { type, addressLine1, addressLine2, city, state, pincode, landmark, isDefault } = req.body;
    const userId = req.user._id;

    const profile = await UserProfile.findOne({ userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const address = profile.addresses.id(addressId);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    if (type) address.type = type;
    if (addressLine1) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) {
      if (!/^[0-9]{6}$/.test(pincode)) {
        return res.status(400).json({ success: false, message: 'Valid 6-digit pincode required' });
      }
      address.pincode = pincode;
    }
    if (landmark !== undefined) address.landmark = landmark;

    if (isDefault) {
      profile.addresses.forEach(addr => addr.isDefault = false);
      address.isDefault = true;
    }

    profile.updatedAt = new Date();
    await profile.save();

    return res.status(200).json({ success: true, message: 'Address updated successfully', address });
  } catch (error) {
    console.error('Update Address Error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to update address', error: error.message });
  }
};

// =================== Delete Address ===================
exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    const profile = await UserProfile.findOne({ userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const address = profile.addresses.id(addressId);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    const wasDefault = address.isDefault;
    address.deleteOne();

    if (wasDefault && profile.addresses.length > 0) {
      profile.addresses[0].isDefault = true;
    }

    profile.updatedAt = new Date();
    await profile.save();

    return res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete Address Error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to delete address', error: error.message });
  }
};

// =================== Set Default Address ===================
exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    const profile = await UserProfile.findOne({ userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const address = profile.addresses.id(addressId);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    profile.addresses.forEach(addr => addr.isDefault = false);
    address.isDefault = true;

    profile.updatedAt = new Date();
    await profile.save();

    return res.status(200).json({ success: true, message: 'Default address updated successfully', address });
  } catch (error) {
    console.error('Set Default Address Error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to set default address', error: error.message });
  }
};
