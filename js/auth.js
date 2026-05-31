/**
 * auth.js — Aeka's Coffee Authentication
 * Handles: Login, Signup, Google Auth (Firebase), Forgot/Reset Password
 * Backend: MongoDB via Express API
 */

const API_BASE = 'https://cottage-candles.onrender.com/api';

/* ============================================================
   Utilities
   ============================================================ */

function showToast(message, type = 'default') {
    const toast = document.getElementById('auth-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'auth-toast show ' + type;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.className = 'auth-toast';
    }, 3500);
}

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.classList.add('visible');
}

function clearError(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = '';
    el.classList.remove('visible');
}

function setLoading(btn, loading, originalText) {
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? 'Please wait…' : originalText;
}

/* ============================================================
   Tab Switching
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    const tabLogin  = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const panelLogin  = document.getElementById('login-panel');
    const panelSignup = document.getElementById('signup-panel');
    const wrapper     = document.querySelector('.auth-page-wrapper');

    function switchTab(activeTab, inactiveTab, showPanel, hidePanel, isSignup) {
        activeTab.classList.add('active');
        inactiveTab.classList.remove('active');
        showPanel.classList.add('active');
        hidePanel.classList.remove('active');
        
        if (isSignup) {
            wrapper.classList.add('signup-mode');
        } else {
            wrapper.classList.remove('signup-mode');
        }

        // Refresh bear animation coordinates after layout settles
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }

    tabLogin.addEventListener('click', () => {
        switchTab(tabLogin, tabSignup, panelLogin, panelSignup, false);
        clearError('login-error');
    });

    tabSignup.addEventListener('click', () => {
        switchTab(tabSignup, tabLogin, panelSignup, panelLogin, true);
        clearError('signup-error');
    });

    /* ============================================================
       LOGIN
       ============================================================ */

    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError('login-error');

        const email    = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const loginBtn = document.getElementById('login');

        if (!email || !password) {
            showError('login-error', 'Please enter your email and password.');
            return;
        }

        setLoading(loginBtn, true, 'Log in');

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await res.json();

            if (res.ok) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                showToast('Welcome back! Signing you in…', 'success');
                setTimeout(() => { window.location.href = 'profile.html'; }, 800);
            } else {
                showError('login-error', result.message || 'Login failed. Please try again.');
                setLoading(loginBtn, false, 'Log in');
            }
        } catch (err) {
            console.error('Login error:', err);
            showError('login-error', 'Connection error. Please check your internet.');
            setLoading(loginBtn, false, 'Log in');
        }
    });

    /* ============================================================
       SIGNUP
       ============================================================ */

    const signupForm = document.getElementById('signup-form');
    const signupBtn  = document.getElementById('signup-submit');

    // Toggle show/hide password
    const signupShowPwd  = document.getElementById('signup-show-pwd');
    const signupPassword = document.getElementById('signup-password');
    if (signupShowPwd && signupPassword) {
        signupShowPwd.addEventListener('click', () => {
            const isHidden = signupPassword.type === 'password';
            signupPassword.type = isHidden ? 'text' : 'password';
            signupShowPwd.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
        });
    }

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError('signup-error');

        const firstName       = document.getElementById('signup-firstName').value.trim();
        const lastName        = document.getElementById('signup-lastName').value.trim();
        const email           = document.getElementById('signup-email').value.trim();
        const contact         = document.getElementById('signup-contact').value.trim();
        const password        = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        // Validation
        if (!firstName || !lastName) {
            showError('signup-error', 'Please enter your first and last name.');
            return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('signup-error', 'Please enter a valid email address.');
            return;
        }
        if (password.length < 8) {
            showError('signup-error', 'Password must be at least 8 characters.');
            return;
        }
        if (password !== confirmPassword) {
            showError('signup-error', 'Passwords do not match.');
            return;
        }

        setLoading(signupBtn, true, 'Create Account');

        const payload = { firstName, lastName, email, password };
        if (contact) payload.contact = contact;

        try {
            const res = await fetch(`${API_BASE}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();

            if (res.ok) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                showToast('Account created! Welcome to Aeka\'s Coffee ☕', 'success');
                setTimeout(() => { window.location.href = 'profile.html'; }, 900);
            } else {
                showError('signup-error', result.message || 'Signup failed. Please try again.');
                setLoading(signupBtn, false, 'Create Account');
            }
        } catch (err) {
            console.error('Signup error:', err);
            showError('signup-error', 'Connection error. Please check your internet.');
            setLoading(signupBtn, false, 'Create Account');
        }
    });

    /* ============================================================
       GOOGLE AUTHENTICATION (Firebase)
       ============================================================ */

    async function handleGoogleAuth() {
        try {
            // auth and googleProvider are set globally in firebase-config.js
            const result = await auth.signInWithPopup(googleProvider);
            const user   = result.user;
            const names  = user.displayName ? user.displayName.split(' ') : ['User', ''];

            const res = await fetch(`${API_BASE}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email:     user.email,
                    firstName: names[0],
                    lastName:  names.slice(1).join(' ') || '',
                    googleId:  user.uid
                })
            });

            const backendResult = await res.json();

            if (res.ok) {
                localStorage.setItem('token', backendResult.token);
                localStorage.setItem('user', JSON.stringify(backendResult.user));
                showToast('Signed in with Google! 🎉', 'success');
                setTimeout(() => { window.location.href = 'profile.html'; }, 800);
            } else {
                showToast(backendResult.message || 'Google sign-in failed.', 'error');
            }
        } catch (error) {
            console.error('Google auth error:', error);
            if (error.code === 'auth/popup-closed-by-user') return;
            if (error.code === 'auth/unauthorized-domain') {
                showToast('This domain is not authorised in Firebase. Add it in the Firebase Console.', 'error');
            } else {
                showToast('Google sign-in failed: ' + error.message, 'error');
            }
        }
    }

    const googleLoginBtn  = document.getElementById('google-login');
    const googleSignupBtn = document.getElementById('google-signup');
    if (googleLoginBtn)  googleLoginBtn.addEventListener('click', handleGoogleAuth);
    if (googleSignupBtn) googleSignupBtn.addEventListener('click', handleGoogleAuth);

    /* ============================================================
       FORGOT PASSWORD FLOW
       ============================================================ */

    const showForgotLink      = document.getElementById('show-forgot-password');
    const forgotOverlay       = document.getElementById('forgot-password-form');
    const loginFormEl         = document.getElementById('login-form');
    const forgotEmailStep     = document.getElementById('forgot-email-step');
    const forgotOtpStep       = document.getElementById('forgot-otp-step');
    const sendOtpBtn          = document.getElementById('send-otp-btn');
    const resetPasswordBtn    = document.getElementById('reset-password-btn');

    const backToLoginBtns     = document.querySelectorAll('.back-to-login');

    function showForgotPanel() {
        loginFormEl.style.display   = 'none';
        forgotOverlay.classList.add('visible');
        forgotEmailStep.style.display = 'block';
        forgotOtpStep.style.display   = 'none';
        // Force refresh coordinates
        window.dispatchEvent(new Event('resize'));
    }

    function showLoginPanel() {
        forgotOverlay.classList.remove('visible');
        loginFormEl.style.display = 'block';
        // Force refresh coordinates
        window.dispatchEvent(new Event('resize'));
    }

    if (showForgotLink) {
        showForgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            showForgotPanel();
        });
    }

    if (backToLoginBtns) {
        backToLoginBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showLoginPanel();
            });
        });
    }

    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', async () => {
            const email = document.getElementById('forgot-email').value.trim();
            if (!email) { showToast('Please enter your email.', 'error'); return; }

            const origText = sendOtpBtn.textContent;
            setLoading(sendOtpBtn, true, origText);

            try {
                const res = await fetch(`${API_BASE}/auth/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const result = await res.json();

                if (res.ok) {
                    forgotEmailStep.style.display = 'none';
                    forgotOtpStep.style.display   = 'block';
                    showToast('OTP sent to your email 📧', 'success');
                } else {
                    showToast(result.message || 'Failed to send OTP.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Connection error.', 'error');
            } finally {
                setLoading(sendOtpBtn, false, origText);
            }
        });
    }

    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', async () => {
            const email       = document.getElementById('forgot-email').value.trim();
            const otp         = document.getElementById('reset-otp').value.trim();
            const newPassword = document.getElementById('new-password').value;

            if (!otp || !newPassword) { showToast('Please fill in all fields.', 'error'); return; }
            if (newPassword.length < 8) { showToast('Password must be at least 8 characters.', 'error'); return; }

            const origText = resetPasswordBtn.textContent;
            setLoading(resetPasswordBtn, true, origText);

            try {
                const res = await fetch(`${API_BASE}/auth/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp, newPassword })
                });
                const result = await res.json();

                if (res.ok) {
                    showToast('Password reset! You can now log in.', 'success');
                    setTimeout(showLoginPanel, 1500);
                } else {
                    showToast(result.message || 'Invalid or expired OTP.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Connection error.', 'error');
            } finally {
                setLoading(resetPasswordBtn, false, origText);
            }
        });
    }
});
