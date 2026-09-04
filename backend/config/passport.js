const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const { readDB, writeDB } = require("../utils/db");

function findOrCreateSocialUser({ provider, providerId, email, nombre }) {
  const db = readDB();
  let user = db.users.find(
    (u) => u.provider === provider && u.providerId === providerId
  );

  if (user) return user;

  // Si ya existe una cuenta local con el mismo email, la vinculamos
  user = db.users.find((u) => u.email && u.email === email);

  if (user) {
    user.provider = provider;
    user.providerId = providerId;
    writeDB(db);
    return user;
  }

  const nextId = db.users.length ? Math.max(...db.users.map((u) => u.id)) + 1 : 1;
  const nuevoUsuario = {
    id: nextId,
    username: email || `${provider}_${providerId}`,
    email: email || null,
    nombre: nombre || null,
    role: "user",
    provider,
    providerId,
    password: null,
  };

  db.users.push(nuevoUsuario);
  writeDB(db);
  return nuevoUsuario;
}

// Las estrategias solo se registran si hay credenciales configuradas,
// así el servidor no se cae en desarrollo si todavía no las cargaste.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        const user = findOrCreateSocialUser({
          provider: "google",
          providerId: profile.id,
          email: profile.emails?.[0]?.value,
          nombre: profile.displayName,
        });
        done(null, user);
      }
    )
  );
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/api/auth/facebook/callback",
        profileFields: ["id", "displayName", "emails"],
      },
      (accessToken, refreshToken, profile, done) => {
        const user = findOrCreateSocialUser({
          provider: "facebook",
          providerId: profile.id,
          email: profile.emails?.[0]?.value,
          nombre: profile.displayName,
        });
        done(null, user);
      }
    )
  );
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const db = readDB();
  const user = db.users.find((u) => u.id === id);
  done(null, user || null);
});

module.exports = passport;
