const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");

// Inițializare client Google OAuth
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generare token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Înregistrare cu email și parolă
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificăm dacă utilizatorul există deja
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        message: "❌ Un utilizator cu acest email există deja." 
      });
    }

    // Generăm token de verificare email
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ore

    // Creăm utilizatorul
    const user = await User.create({
      name,
      email,
      password,
      role: role || "staff",
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      authProvider: "local"
    });

    // Generăm token JWT
    const token = generateToken(user);

    res.status(201).json({
      message: "✅ Cont creat cu succes! Vă rugăm să verificați emailul pentru activare.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("❌ Eroare la înregistrare:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la înregistrare." 
    });
  }
};

// Autentificare cu email și parolă
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Găsim utilizatorul
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        message: "❌ Email sau parolă incorectă." 
      });
    }

    // Verificăm parola
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: "❌ Email sau parolă incorectă." 
      });
    }

    // Verificăm dacă emailul este verificat
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        message: "❌ Vă rugăm să verificați emailul înainte de a vă autentifica." 
      });
    }

    // Generăm token JWT
    const token = generateToken(user);

    res.json({
      message: "✅ Autentificare reușită!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("❌ Eroare la autentificare:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la autentificare." 
    });
  }
};

// Autentificare cu Gmail
const gmailLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // Verificăm token-ul Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub: gmailId } = payload;

    // Căutăm sau creăm utilizatorul
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      user = await User.create({
        name,
        email,
        gmailId,
        authProvider: "gmail",
        isEmailVerified: true // Emailul este deja verificat de Google
      });
    } else if (!user.gmailId) {
      // Actualizăm utilizatorul existent cu ID-ul Gmail
      await user.update({
        gmailId,
        authProvider: "gmail",
        isEmailVerified: true
      });
    }

    // Generăm token JWT
    const jwtToken = generateToken(user);

    res.json({
      message: "✅ Autentificare Gmail reușită!",
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("❌ Eroare la autentificarea Gmail:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la autentificarea Gmail." 
    });
  }
};

// Înregistrare și autentificare cu Passkey
const registerPasskey = async (req, res) => {
  try {
    const { name, email, passkeyId, passkeyPublicKey } = req.body;

    // Verificăm dacă utilizatorul există deja
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        message: "❌ Un utilizator cu acest email există deja." 
      });
    }

    // Creăm utilizatorul cu Passkey
    const user = await User.create({
      name,
      email,
      passkeyId,
      passkeyPublicKey,
      authProvider: "passkey",
      isEmailVerified: true // Presupunem că emailul este verificat pentru Passkey
    });

    // Generăm token JWT
    const token = generateToken(user);

    res.status(201).json({
      message: "✅ Cont creat cu succes folosind Passkey!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("❌ Eroare la înregistrarea Passkey:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la înregistrarea Passkey." 
    });
  }
};

// Autentificare cu Passkey
const loginPasskey = async (req, res) => {
  try {
    const { email, passkeyId } = req.body;

    // Găsim utilizatorul
    const user = await User.findOne({ where: { email } });
    if (!user || user.authProvider !== "passkey") {
      return res.status(401).json({ 
        message: "❌ Email sau Passkey incorect." 
      });
    }

    // Verificăm Passkey ID
    if (user.passkeyId !== passkeyId) {
      return res.status(401).json({ 
        message: "❌ Email sau Passkey incorect." 
      });
    }

    // Generăm token JWT
    const token = generateToken(user);

    res.json({
      message: "✅ Autentificare Passkey reușită!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("❌ Eroare la autentificarea Passkey:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la autentificarea Passkey." 
    });
  }
};

// Verificare email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          [Op.gt]: Date.now()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "❌ Token de verificare invalid sau expirat." 
      });
    }

    // Actualizăm utilizatorul
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    });

    res.json({ 
      message: "✅ Email verificat cu succes!" 
    });
  } catch (error) {
    console.error("❌ Eroare la verificarea emailului:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la verificarea emailului." 
    });
  }
};

// Resetare parolă
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        message: "❌ Nu există niciun cont asociat cu acest email." 
      });
    }

    // Generăm token de resetare
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 oră

    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });

    res.json({ 
      message: "✅ Instrucțiuni de resetare parolă trimise pe email." 
    });
  } catch (error) {
    console.error("❌ Eroare la cererea de resetare parolă:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la cererea de resetare parolă." 
    });
  }
};

// Resetare parolă cu token
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: Date.now()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "❌ Token de resetare invalid sau expirat." 
      });
    }

    // Actualizăm parola
    await user.update({
      password,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.json({ 
      message: "✅ Parola a fost resetată cu succes!" 
    });
  } catch (error) {
    console.error("❌ Eroare la resetarea parolei:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la resetarea parolei." 
    });
  }
};

module.exports = {
  register,
  login,
  gmailLogin,
  registerPasskey,
  loginPasskey,
  verifyEmail,
  requestPasswordReset,
  resetPassword
}; 