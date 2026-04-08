export const ROLES = {
    devotee: {
        id: 'devotee',
        icon: 'HandsPraying', // String name for Phosphor component lookup
        redirect: 'dashboard.html',
        en: { label: 'Devotee', helper: "Login with phone or email to book darshan slot.", placeholder: "Phone number or Email" },
        hi: { label: 'भक्त', helper: "सेवा बुक के लिए फोन या ईमेल से लॉगिन करें।", placeholder: "फ़ोन नंबर या ईमेल" },
        gu: { label: 'ભક્ત', helper: "દર્શન સ્લોટ બુક કરવા માટે ફોન અથવા ઇમેઇલથી લોગિન કરો.", placeholder: "ફોન નંબર અથવા ઇમેઇલ" }
    },
    mandir_admin: {
        id: 'mandir_admin',
        icon: 'Crown',
        redirect: 'admindashboard.html',
        en: { label: 'Admin', helper: "Admin login for temple operations and reports.", placeholder: "Admin Username" },
        hi: { label: 'प्रशासक', helper: "मंदिर संचालन और रिपोर्ट के लिए एडमिन लॉगिन।", placeholder: "एडमिन यूज़रनेम" },
        gu: { label: 'વ્યવસ્થાપક', helper: "મંદિર સંચાલન અને અહેવાલો માટે એડમિન લોગિન.", placeholder: "એડમિન યુઝરનેમ" }
    },

    security_guard: {
        id: 'security_guard',
        icon: 'ShieldStar',
        redirect: '/guard/dashboard',
        en: { label: 'Security', helper: "Badge ID login for entry/exit logs and gate controls.", placeholder: "Badge ID (e.g. SEC-001)" },
        hi: { label: 'सुरक्षा', helper: "प्रवेश/निकास लॉग और गेट नियंत्रण के लिए बैज आईडी लॉगिन।", placeholder: "बैज आईडी (जैसे SEC-001)" },
        gu: { label: 'સુરક્ષા', helper: "પ્રવેશ/નિકાસ લોગ અને ગેટ નિયંત્રણ માટે બેજ આઈડી લોગિન.", placeholder: "બેજ આઈડી (દા.ત. SEC-001)" }
    },

    counter: {
        id: 'counter',
        icon: 'Ticket',
        redirect: '/counter/dashboard',
        en: { label: 'Counter', helper: "Counter staff login for verification & registration.", placeholder: "Staff ID" },
        hi: { label: 'काउंसिल', helper: "सत्यापन और पंजीकरण के लिए काउंटर स्टाफ लॉगिन।", placeholder: "स्टाफ आईडी" },
        gu: { label: 'કાઉન્ટર', helper: "ચકાસણી અને નોંધણી માટે કાઉન્ટર સ્ટાફ લોગિન.", placeholder: "સ્ટાફ આઈડી" }
    },
    parking: {
        id: 'parking',
        icon: 'Car',
        redirect: '/parking/dashboard',
        en: { label: 'Parking', helper: "Parking zone management & live status.", placeholder: "Zone ID" },
        hi: { label: 'पार्किंग', helper: "पार्किंग क्षेत्र प्रबंधन और लाइव स्थिति।", placeholder: "जोन आईडी" },
        gu: { label: 'પાર્કિંગ', helper: "પાર્કિંગ ઝોન મેનેજમેન્ટ અને લાઇવ સ્ટેટસ.", placeholder: "ઝોન આઈડી" }
    }
};
