/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const TRANSLATIONS = {
        en: {
            // Header & Common
            welcomeMain: "Welcome —",
            welcomeSub: "Seva & Management",
            heroSubtitle: "Seva, Darshan & Management — one dashboard for the entire mandir ecosystem.",
            signIn: "Sign In",
            labelUserId: "User ID / Email",
            labelPassword: "Password",
            rememberMe: "Remember me",
            forgotPass: "Forgot password?",
            loginBtn: "Secure Login",
            newHere: "New here?",
            registerLink: "Register as Devotee",
            logout: "Logout",
            support: "Support",

            // Sidebar
            navDashboard: "Dashboard",
            navSlotBooking: "Slot Booking",
            navMyVisits: "My Visits",
            navLaneStatus: "Lane Status",
            navAdminNotices: "Admin Notices",
            navDevoteeQr: "Devotee QR ID",
            navEmergency: "Emergency Help (SOS)",

            // Dashboard
            namaste: "Namaste,",
            dashboardSubtitle: "Manage your darshan bookings and profile.",
            today: "Today",
            primaryDevotee: "Primary Devotee",

            // Cards
            card1Title: "Devotee Services",
            card1Desc: "Book poojas & donate instantly.",
            card2Title: "Secure Access",
            card2Desc: "Role-based gates for staff.",

            // Admin
            adminDashboard: "Dashboard",
            adminHeatmap: "Live Heatmap",
            adminGuard: "Guard Teams",
            adminLane: "Lane Control",
            adminSettings: "Settings",

            // Forgot Password
            forgotPasswordTitle: "Reset Password",
            forgotPasswordSubtitle: "Enter your User ID or Email to receive a reset link.",
            otpSent: "OTP sent to your registered mobile/email.",
            otpLabel: "Enter OTP",
            verifyOtp: "Verify OTP",
            resendOtp: "Resend OTP",
            newPassword: "New Password",
            confirmPassword: "Confirm Password",
            resetPassword: "Reset Password",
            passwordResetSuccess: "Password Reset Successful",
            passwordResetSuccessDesc: "You can now login with your new password.",
            sendResetLink: "Send Reset Link",
            backToLogin: "Back to Login",

            // Registration
            registerTitle: "Create Account",
            registerSubtitle: "Join the digital mandir ecosystem",
            fullName: "Full Name",
            phoneNumber: "Phone Number",
            email: "Email Address",

            acceptTerms: "I accept the Terms & Conditions",
            registerBtn: "Create Account",
            alreadyHaveAccount: "Already have an account?",
            loginLink: "Login here",
            registrationSuccess: "Registration Successful!",

            // Validation Messages
            nameRequired: "Full name is required",
            phoneRequired: "Phone number is required",
            phoneInvalid: "Invalid phone number (10 digits required)",
            emailRequired: "Email is required",
            invalidEmail: "Invalid email address",
            passwordMismatch: "Passwords do not match",
            termsRequired: "You must accept the terms",
        },
        hi: {
            // Header & Common
            welcomeMain: "स्वागत है —",
            welcomeSub: "सेवा और प्रबंधन",
            heroSubtitle: "सेवा, दर्शन और प्रबंधन — पूरे मंदिर पारिस्थितिकी तंत्र के लिए एक डैशबोर्ड।",
            signIn: "लॉग इन करें",
            labelUserId: "यूज़र आईडी / ईमेल",
            labelPassword: "पासवर्ड",
            rememberMe: "मुझे याद रखें",
            forgotPass: "पासवर्ड भूल गए?",
            loginBtn: "सुरक्षित लॉगिन",
            newHere: "नए हैं?",
            registerLink: "भक्त के रूप में पंजीकरण करें",
            logout: "लॉग आउट",
            support: "सहायता",

            // Sidebar
            navDashboard: "डैशबोर्ड",
            navSlotBooking: "स्लॉट बुकिंग",
            navMyVisits: "मेरी यात्राएँ",
            navLaneStatus: "लेन स्थिति",
            navAdminNotices: "प्रशासनिक सूचनाएं",
            navDevoteeQr: "भक्त क्यूआर आईडी",
            navEmergency: "आपातकालीन सहायता (SOS)",

            // Dashboard
            namaste: "नमस्ते,",
            dashboardSubtitle: "अपनी दर्शन बुकिंग और प्रोफ़ाइल प्रबंधित करें।",
            today: "आज",
            primaryDevotee: "मुख्य भक्त",

            // Cards
            card1Title: "भक्त सेवाएँ",
            card1Desc: "पूजा बुक करें और तुरंत दान करें।",
            card2Title: "सुरक्षित प्रवेश",
            card2Desc: "कर्मचारियों के लिए भूमिका-आधारित लॉगिन।",

            // Admin
            adminDashboard: "डैशबोर्ड",
            adminHeatmap: "लाइव हीटमैप",
            adminGuard: "गार्ड टीमें",
            adminLane: "लेन नियंत्रण",
            adminSettings: "सेटिंग्स",

            // Forgot Password
            forgotPasswordTitle: "पासवर्ड रीसेट करें",
            forgotPasswordSubtitle: "रीसेट लिंक प्राप्त करने के लिए अपना यूज़र आईडी या ईमेल दर्ज करें।",
            otpSent: "आपके पंजीकृत मोबाइल/ईमेल पर OTP भेजा गया।",
            otpLabel: "OTP दर्ज करें",
            verifyOtp: "OTP सत्यापित करें",
            resendOtp: "OTP पुनः भेजें",
            newPassword: "नया पासवर्ड",
            confirmPassword: "पासवर्ड की पुष्टि करें",
            resetPassword: "पासवर्ड रीसेट करें",
            passwordResetSuccess: "पासवर्ड रीसेट सफल",
            passwordResetSuccessDesc: "अब आप अपने नए पासवर्ड के साथ लॉगिन कर सकते हैं।",
            sendResetLink: "रीसेट लिंक भेजें",
            backToLogin: "लॉगिन पर वापस जाएं",

            // Registration
            registerTitle: "खाता बनाएं",
            registerSubtitle: "डिजिटल मंदिर पारिस्थितिकी तंत्र से जुड़ें",
            fullName: "पूरा नाम",
            phoneNumber: "फ़ोन नंबर",
            email: "ईमेल पता",

            acceptTerms: "मैं नियम और शर्तें स्वीकार करता हूँ",
            registerBtn: "खाता बनाएं",
            alreadyHaveAccount: "क्या आपके पास पहले से खाता है?",
            loginLink: "यहाँ लॉगिन करें",
            registrationSuccess: "पंजीकरण सफल!",

            // Validation Messages
            nameRequired: "पूरा नाम आवश्यक है",
            phoneRequired: "फ़ोन नंबर आवश्यक है",
            phoneInvalid: "अमान्य फ़ोन नंबर (10 अंक आवश्यक)",
            emailRequired: "ईमेल आवश्यक है",
            invalidEmail: "अमान्य ईमेल पता",
            passwordMismatch: "पासवर्ड मेल नहीं खाते",
            termsRequired: "आपको शर्तें स्वीकार करनी होंगी",
        },
        gu: {
            // Header & Common
            welcomeMain: "સ્વાગત —",
            welcomeSub: "સેવા અને વ્યવસ્થાપન",
            heroSubtitle: "સેવા, દર્શન અને વ્યવસ્થાપન — સમગ્ર મંદિર ઇકોસિસ્ટમ માટે એક ડેશબોર્ડ.",
            signIn: "સાઇન ઇન",
            labelUserId: "યુઝર આઈડી / ઇમેઇલ",
            labelPassword: "પાસવર્ડ",
            rememberMe: "મને યાદ રાખો",
            forgotPass: "પાસવર્ડ ભૂલી ગયા?",
            loginBtn: "સુરક્ષિત લોગિન",
            newHere: "અહીં નવા છો?",
            registerLink: "ભક્ત તરીકે નોંધણી કરો",
            logout: "લॉग આઉટ",
            support: "સહાય",

            // Sidebar
            navDashboard: "ડેશબોર્ડ",
            navSlotBooking: "સ્લોટ બુકિંગ",
            navMyVisits: "મારી મુલાકાતો",
            navLaneStatus: "લેન સ્થિતિ",
            navAdminNotices: "વહીવટી સૂચનાઓ",
            navDevoteeQr: "ભક્ત QR આઈડી",
            navEmergency: "આપત્કાલીન મદદ (SOS)",

            // Dashboard
            namaste: "નમસ્તે,",
            dashboardSubtitle: "તમારી દર્શન બુકિંગ અને પ્રોફાઇલ મેનેજ કરો.",
            today: "આજે",
            primaryDevotee: "મુખ્ય ભક્ત",

            // Cards
            card1Title: "ભક્ત સેવાઓ",
            card1Desc: "પૂજા બુક કરો અને તરત દાન કરો.",
            card2Title: "સુરક્ષિત પ્રવેશ",
            card2Desc: "કર્મચારીઓ માટે ભૂમિકા-આધારિત લોગિન.",

            // Admin
            adminDashboard: "ડેશબોર્ડ",
            adminHeatmap: "લાઇવ હીટમેપ",
            adminGuard: "ગાર્ડ ટીમો",
            adminLane: "લેન નિયંત્રણ",
            adminSettings: "સેટિંગ્સ",

            // Forgot Password
            forgotPasswordTitle: "પાસવર્ડ રીસેટ કરો",
            forgotPasswordSubtitle: "રીસેટ લિંક મેળવવા માટે તમારું યુઝર આઈડી અથવા ઇમેઇલ દાખલ કરો.",
            otpSent: "તમારા રજિસ્ટર્ડ મોબાઇલ/ઇમેઇલ પર OTP મોકલવામાં આવ્યો.",
            otpLabel: "OTP દાખલ કરો",
            verifyOtp: "OTP ચકાસો",
            resendOtp: "OTP ફરીથી મોકલો",
            newPassword: "નવો પાસવર્ડ",
            confirmPassword: "પાસવર્ડની પુષ્ટિ કરો",
            resetPassword: "પાસવર્ડ રીસેટ કરો",
            passwordResetSuccess: "પાસવર્ડ રીસેટ સફળ",
            passwordResetSuccessDesc: "હવે તમે તમારા નવા પાસવર્ડ સાથે લોગિન કરી શકો છો.",
            sendResetLink: "રીસેટ લિંક મોકલો",
            backToLogin: "લોગિન પર પાછા જાઓ",

            // Registration
            registerTitle: "ખાતું બનાવો",
            registerSubtitle: "ડિજિટલ મંદિર ઇકોસિસ્ટમમાં જોડાઓ",
            fullName: "પૂરું નામ",
            phoneNumber: "ફોન નંબર",
            email: "ઇમેઇલ સરનામું",

            acceptTerms: "હું નિયમો અને શરતો સ્વીકારું છું",
            registerBtn: "ખાતું બનાવો",
            alreadyHaveAccount: "શું તમારી પાસે પહેલાથી જ ખાતું છે?",
            loginLink: "અહીં લોગિન કરો",
            registrationSuccess: "નોંધણી સફળ!",

            // Validation Messages
            nameRequired: "પૂરું નામ જરૂરી છે",
            phoneRequired: "ફોન નંબર જરૂરી છે",
            phoneInvalid: "અમાન્ય ફોન નંબર (10 અંકો જરૂરી)",
            emailRequired: "ઇમેઇલ જરૂરી છે",
            invalidEmail: "અમાન્ય ઇમેઇલ સરનામું",
            passwordMismatch: "પાસવર્ડ મેચ થતા નથી",
            termsRequired: "તમારે શરતો સ્વીકારવી પડશે",
        }
    };

    const t = (key) => {
        return TRANSLATIONS[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => useContext(LanguageContext);
