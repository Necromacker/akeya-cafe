/**
 * firebase-config.js — Aeka's Coffee
 * Uses Firebase Compat SDK (loaded via CDN script tags in auth.html).
 * Exposes `auth` and `googleProvider` as globals for auth.js.
 */

const firebaseConfig = {
    apiKey:            "AIzaSyCH2k8qiIlQUO7hcFY1LB8I7CvSbTa-8l8",
    authDomain:        "cottage-candles0.firebaseapp.com",
    projectId:         "cottage-candles0",
    storageBucket:     "cottage-candles0.firebasestorage.app",
    messagingSenderId: "974337305310",
    appId:             "1:974337305310:web:5df42fface9f455bea704f",
    measurementId:     "G-F1JT9124ZF"
};

// Initialise only once
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Global references used by auth.js
var auth           = firebase.auth();
var googleProvider = new firebase.auth.GoogleAuthProvider();
