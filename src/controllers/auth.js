import bcrypt from 'bcryptjs';
import User from '../models/schemas/users.js';
import Role from '../models/schemas/roles.js';

const PASSWORD_MIN_LENGTH = 8;
const BCRYPT_ROUNDS = 12;

const normalizeString = (value) => (
    typeof value === 'string' ? value.trim() : ''
);

const normalizeUsername = (value) => normalizeString(value).toLowerCase();
const normalizeEmail = (value) => normalizeString(value).toLowerCase();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidUsername = (username) => /^[a-z0-9._-]{3,30}$/.test(username);

const publicUser = (user) => {
    const roleName = typeof user.role === 'string'
        ? user.role
        : user.role?.name;

    return {
        id: user._id.toString(),
        displayName: user.displayName,
        username: user.username,
        email: user.email,
        role: roleName
    };
};

const sessionUser = (user) => ({
    id: user._id.toString(),
    displayName: user.displayName,
    username: user.username,
    role: typeof user.role === 'string' ? user.role : user.role.name
});

const validateRegistration = ({ displayName, username, email, password }) => {
    const errors = {};

    if (displayName.length < 2 || displayName.length > 80) {
        errors.displayName = 'Enter a display name between 2 and 80 characters.';
    }

    if (!isValidUsername(username)) {
        errors.username = 'Use 3–30 letters, numbers, periods, underscores, or hyphens.';
    }

    if (!isValidEmail(email)) {
        errors.email = 'Enter a valid email address.';
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
        errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    }

    return errors;
};

const createAccount = async (input) => {
    const displayName = normalizeString(input.displayName);
    const username = normalizeUsername(input.username);
    const email = normalizeEmail(input.email);
    const password = typeof input.password === 'string' ? input.password : '';

    const errors = validateRegistration({ displayName, username, email, password });

    if (Object.keys(errors).length > 0) {
        return { errors };
    }

    const customerRole = await Role.findOne({ name: 'customer' });

    if (!customerRole) {
        throw new Error('The customer role is missing. Run the database import script.');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    try {
        const user = await User.create({
            displayName,
            username,
            email,
            passwordHash,
            role: customerRole._id
        });

        return { user };
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];

            return {
                conflict: field === 'email' ? 'That email is already registered.' : 'That username is already taken.'
            };
        }

        throw error;
    }
};

const safeReturnTo = (candidate) => {
    if (
        typeof candidate !== 'string'
        || !candidate.startsWith('/')
        || candidate.startsWith('//')
        || candidate.startsWith('/\\')
        || /[\u0000-\u001f]/.test(candidate)
    ) {
        return '/';
    }

    try {
        const parsed = new URL(candidate, 'http://kizuna.local');

        if (parsed.origin !== 'http://kizuna.local') {
            return '/';
        }

        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
        return '/';
    }
};

const regenerateSession = (req, user) => new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
        if (error) {
            reject(error);
            return;
        }

        req.session.user = sessionUser(user);

        req.session.save((saveError) => {
            if (saveError) {
                reject(saveError);
                return;
            }

            resolve();
        });
    });
});

const destroySession = (req) => new Promise((resolve, reject) => {
    if (!req.session) {
        resolve();
        return;
    }

    req.session.destroy((error) => {
        if (error) {
            reject(error);
            return;
        }

        resolve();
    });
});

const sendApiError = (res, status, code, message) => (
    res.status(status).json({ error: { code, message } })
);

const renderRegistration = (res, status, message, values = {}) => (
    res.status(status).render('auth/register', {
        title: 'Create Account',
        message,
        values
    })
);

const renderLogin = (res, status, message, returnTo = '/') => (
    res.status(status).render('auth/login', {
        title: 'Log In',
        message,
        returnTo: safeReturnTo(returnTo)
    })
);

export const registerPage = (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }

    return renderRegistration(res, 200, null);
};

export const registerPageSubmit = async (req, res, next) => {
    const values = {
        displayName: normalizeString(req.body.displayName),
        username: normalizeUsername(req.body.username),
        email: normalizeEmail(req.body.email)
    };

    try {
        const result = await createAccount({ ...req.body, ...values });

        if (result.errors) {
            return renderRegistration(res, 400, Object.values(result.errors)[0], values);
        }

        if (result.conflict) {
            return renderRegistration(res, 409, result.conflict, values);
        }

        return res.redirect('/login?registered=1');
    } catch (error) {
        return next(error);
    }
};

export const loginPage = (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }

    const registered = req.query.registered === '1';

    return res.render('auth/login', {
        title: 'Log In',
        message: registered ? 'Account created. You can now log in.' : null,
        returnTo: safeReturnTo(req.query.returnTo || '/')
    });
};

const findUserForLogin = async (identifier) => {
    const normalized = normalizeString(identifier).toLowerCase();

    return User.findOne({
        $or: [{ username: normalized }, { email: normalized }]
    })
        .select('+passwordHash')
        .populate('role');
};

const verifyCredentials = async (identifier, password) => {
    if (typeof password !== 'string' || password.length === 0) {
        return null;
    }

    const user = await findUserForLogin(identifier);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return null;
    }

    return user;
};

export const loginPageSubmit = async (req, res, next) => {
    const identifier = req.body.usernameOrEmail || req.body.identifier;
    const returnTo = safeReturnTo(req.body.returnTo);

    try {
        const user = await verifyCredentials(identifier, req.body.password);

        if (!user) {
            return renderLogin(res, 401, 'Invalid username/email or password.', returnTo);
        }

        await regenerateSession(req, user);
        return res.redirect(returnTo);
    } catch (error) {
        return next(error);
    }
};

export const logoutPage = async (req, res, next) => {
    try {
        await destroySession(req);
        res.clearCookie('kizuna.sid');
        return res.redirect('/');
    } catch (error) {
        return next(error);
    }
};

export const registerApi = async (req, res, next) => {
    try {
        const result = await createAccount(req.body || {});

        if (result.errors) {
            return sendApiError(res, 400, 'invalid_input', Object.values(result.errors)[0]);
        }

        if (result.conflict) {
            return sendApiError(res, 409, 'account_conflict', result.conflict);
        }

        return res.status(201).json({ user: publicUser(await result.user.populate('role')) });
    } catch (error) {
        return next(error);
    }
};

export const loginApi = async (req, res, next) => {
    const body = req.body || {};
    const identifier = body.usernameOrEmail || body.identifier;

    if (typeof identifier !== 'string' || typeof body.password !== 'string') {
        return sendApiError(res, 400, 'invalid_input', 'Username/email and password are required.');
    }

    try {
        const user = await verifyCredentials(identifier, body.password);

        if (!user) {
            return sendApiError(res, 401, 'invalid_credentials', 'Invalid username/email or password.');
        }

        await regenerateSession(req, user);

        const fullUser = await User.findById(user._id).populate('role');
        return res.status(200).json({ user: publicUser(fullUser) });
    } catch (error) {
        return next(error);
    }
};

export const logoutApi = async (req, res, next) => {
    try {
        await destroySession(req);
        res.clearCookie('kizuna.sid');
        return res.status(204).end();
    } catch (error) {
        return next(error);
    }
};

export const currentUserApi = async (req, res) => (
    res.status(200).json({ user: req.session.user })
);