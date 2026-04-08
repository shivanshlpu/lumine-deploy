export const resetPassword = async (email) => {
    // Mock password reset
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Password reset link sent to ${email}`);
            resolve(true);
        }, 1000);
    });
};


export const registerUser = async (email, password, fullName, phoneNumber, role) => {
    // Mock registration
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Registered user: ${email}, ${fullName}, ${role}`);
            resolve({
                user: {
                    email,
                    fullName,
                    phoneNumber,
                    role,
                    uid: 'mock-uid-' + Date.now()
                }
            });
        }, 1500);
    });
};
