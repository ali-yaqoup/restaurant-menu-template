/**
 * Maps Firebase Auth error codes to user-friendly messages.
 */

const AUTH_ERROR_MESSAGES = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled. Contact your administrator.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/too-many-requests": "Too many failed attempts. Please wait and try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/operation-not-allowed": "Email/password sign-in is not enabled in Firebase Console."
};

export function getAuthErrorMessage(error) {
    if (!error) return "An unknown error occurred.";
    if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
        return AUTH_ERROR_MESSAGES[error.code];
    }
    return error.message || "Authentication failed. Please try again.";
}

export function getFirestoreErrorMessage(error) {
    if (!error) return "A database error occurred.";
    if (error.code === "permission-denied") {
        return "Permission denied. Ensure your users/{uid} document has the correct role and restaurantId.";
    }
    return error.message || "Failed to sync with the database.";
}
