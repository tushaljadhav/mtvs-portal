import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  mr: {
    // Brand & Header
    brandName: 'मुंबई विडी तंबाखू संघ',
    brandNameMr: 'मुंबई विडी तंबाखू संघ',
    brandSub: 'Mumbai Vidi Tambakhu Sangh',
    govtReg: 'शासकीय नोंदणीकृत कामगार संघटना',
    govtRegNotice: 'सदस्यांची अधिकृत संघटना • मुंबई, महाराष्ट्र (शा. नोंदणी २०२६)',
    tagline: 'मुंबईतील विडी कामगार व तंबाखू विक्रेत्यांची अधिकृत संघटना',

    // Nav
    joinUnion: 'सभासद व्हा',
    trackStatus: 'अर्ज स्थिती',
    home: 'मुख्यपृष्ठ',
    terms: 'नियम व अटी',

    // Common
    back: 'मागे',
    share: 'शेअर करा',
    downloadPdf: 'पास PDF डाऊनलोड करा',
    preparing: 'तयार करत आहे...',
    close: 'बंद करा',
    refresh: 'रिफ्रेश',
    search: 'शोधा',

    // Landing Page
    heroTitle: 'मुंबई विडी तंबाखू संघात आपले सहर्ष स्वागत आहे',
    heroSubtitle: 'मुंबई परिसरातील सर्व विडी कामगार, पान दुकानदार, घाऊक व किरकोळ तंबाखू विक्रेत्यांचे हक्क व कायदेशीर संरक्षणासाठी कार्यरत अधिकृत संस्था.',
    heroCta: 'अधिकृत सभासद नोंदणी करा',
    trackCta: 'अर्जाची स्थिती तपासा',

    // Landing Info Sections
    aboutTitle: 'संघाविषयी माहिती (About MTVS)',
    aboutDesc: 'मुंबई विडी तंबाखू संघ ही मुंबई महानगर व उपनगरातील हजारो विडी उत्पादक, कामगार, पानपट्टी चालक आणि तंबाखू व्यापारी यांचे प्रतिनिधित्व करणारी अग्रगण्य व अधिकृत कामगार संघटना आहे. सदस्यांच्या कल्याणासाठी, सरकारी परवाने व पोलीस सहकार्य, कायदेशीर मार्गदर्शन आणि सामाजिक सुरक्षेसाठी संघ निरंतर कार्यरत आहे.',

    benefit1Title: 'कायदेशीर संरक्षण व मार्गदर्शन',
    benefit1Desc: 'स्थानिक प्रशासन, महापालिका व पोलीस यंत्रणेकडून होणाऱ्या त्रासाविरुद्ध अधिकृत संघाचे कायदेशीर साहाय्य.',
    benefit2Title: 'अधिकृत डिजिटल सभासद ओळखपत्र',
    benefit2Desc: 'क्युआर कोडयुक्त अधिकृत डिजिटल पास जो आपल्या दुकानात अथवा कामाच्या ठिकाणी ओळख म्हणून वैध राहील.',
    benefit3Title: 'कल्याणकारी योजना व सहकार्य',
    benefit3Desc: 'विडी कामगार व विक्रेत्यांच्या कुटुंबांसाठी विविध कल्याणकारी योजना व संघटनात्मक पाठबळ.',

    // Registration Form
    regTitle: 'नवीन सभासद नोंदणी अर्ज',
    regSubtitle: 'सर्व माहिती अचूक भरा. अर्जाची क्षेत्रीय प्रतिनिधीद्वारे पडताळणी केली जाईल.',
    annualFeeNotice: 'वार्षिक सभासद शुल्क: ₹१०० (अर्जाची पडताळणी व मंजुरीनंतरच देय)',

    secPersonal: '१. वैयक्तिक माहिती',
    fullName: 'पूर्ण नाव',
    fullNamePh: 'उदा. सुरेश रामचंद्र पाटील',
    age: 'वय',
    gender: 'लिंग',
    male: 'पुरुष',
    female: 'महिला',
    other: 'इतर',
    mobile: 'मोबाईल नंबर',
    email: 'ईमेल (ऐच्छिक)',

    secWork: '२. दुकान व व्यवसायाची माहिती',
    shopName: 'दुकान / व्यवसायाचे नाव',
    shopNamePh: 'उदा. पाटील पान विडी भांडार',
    workType: 'कामाचे / व्यवसायाचे स्वरूप',
    workTypePh: 'कामाचे स्वरूप शोधा किंवा निवडा...',
    idType: 'ओळखपत्राचा प्रकार',
    idNumber: 'ओळखपत्र क्रमांक (ऐच्छिक)',

    secAddress: '३. पत्ता व क्षेत्र निवड',
    address: 'पूर्ण पत्ता',
    addressPh: 'दुकान क्र., गाळा, रस्ता, लँडमार्क...',
    area: 'परिसर / वार्ड (क्षेत्र)',
    areaPh: 'क्षेत्र शोधा (उदा. दादर, कुर्ला, मालाड)...',
    pincode: 'पिनकोड',

    secUploads: '४. आवश्यक फोटो व कागदपत्रे',
    photoLabel: 'सदस्याचा पासपोर्ट फोटो (ID Card साठी)',
    shopPhotoLabel: 'दुकान / कामाचा फोटो (Shop / Workplace Photo)',
    docPhotoLabel: 'ओळखपत्राचा फोटो (Aadhaar / Voter ID Proof)',
    uploadClick: 'फोटो निवडण्यासाठी येथे क्लिक करा',
    maxSize: 'जास्तीत जास्त आकार: ५ MB',

    certifyText: 'मी प्रमाणित करतो/करते की वरील सर्व माहिती सत्य असून, मी मुंबई विडी तंबाखू संघाच्या सर्व नियमांचे पालन करण्यास बांधील राहीन.',
    submitBtn: 'अर्ज सादर करा',
    submitting: 'अर्ज सादर होत आहे...',

    // Status Tracker
    trackTitle: 'सभासद अर्ज स्थिती तपासा',
    trackSubtitle: 'आपला अर्ज क्रमांक (REQ-2026-XXXXX) किंवा नोंदणीकृत १० अंकी मोबाईल नंबर प्रविष्ट करा.',
    searchBtn: 'स्थिती तपासा',
    searching: 'तपासत आहे...',
    appRef: 'अर्ज संदर्भ क्रमांक',
    underVerification: 'पडताळणी अंतर्गत',
    approvedWaitingPay: 'मंजूर — शुल्क भरणे बाकी',
    verifiedActiveMember: 'प्रमाणित सक्रिय सभासद',
    appRejected: 'अर्ज नाकारला',
    step1: '१. अर्ज सादर',
    step2: '२. मंजुरी',
    step3: '३. सभासद पास',
    stepSubmitted: 'अर्ज सादर',
    stepApproved: 'मंजूर',
    stepPassed: 'पास जारी',
    pendingHeading: 'तुमचा अर्ज पडताळणी अंतर्गत आहे',
    pendingDesc: 'आपल्या क्षेत्रातील प्रतिनिधीद्वारे कागदपत्रांची पडताळणी सुरू आहे. मंजुरीनंतर ₹१०० शुल्क भरण्याचा पर्याय येथे दिसेल.',
    approvedHeading: 'अर्ज मंजूर झाला आहे! 🎉',
    approvedDesc: 'वार्षिक ₹१०० शुल्क भरण्यासाठी खालील क्युआर कोड स्कॅन करा.',
    paidHeading: 'अभिनंदन! सभासदत्व सक्रिय झाले आहे!',
    viewPassBtn: 'सभासद पास पहा व डाऊनलोड करा',
    payUpiHeading: 'वार्षिक शुल्क ₹१०० युपीआय द्वारे भरा',
    scanQrPay: 'कोणत्याही UPI App ने स्कॅन करा',
    upiCopied: 'UPI ID कॉपी केली!',
    copyUpi: 'UPI ID कॉपी करा',
    upiNotice: 'पेमेंट केल्यानंतर २ तासांत तुमचा डिजिटल पास सक्रिय केला जाईल.',

    // Pass Page
    loadingPass: 'अधिकृत सभासद पास लोड होत आहे...',
    passNotFound: 'सभासद नोंद आढळली नाही',
    invalidPassNotice: 'अवैध सभासद आयडी किंवा शुल्क प्रलंबित आहे.',
    backToTrack: '← अर्ज स्थिती पृष्ठावर परत जा',
    passNotice: 'हा प्रमाणित पास बृहन्मुंबई महानगरपालिकेच्या सर्व वॉर्डांमध्ये अधिकृतपणे वैध आहे.',
    shareText: 'मुंबई विडी तंबाखू संघ – प्रमाणित सभासद पास',
    passLinkCopied: 'पास लिंक क्लिपबोर्डवर कॉपी केली!',

    // Pass Card Details
    passTitle: 'मुंबई विडी तंबाखू संघ',
    passSubtitle: 'अधिकृत सभासद ओळखपत्र',
    memberPassBadge: 'MEMBER PASS / सदस्य पास',
    validBadge: 'VALID / वैध',
    memberBadge: '✓ सदस्य / Member',
    designationLabel: 'Member / सदस्य',
    designationSub: '(सदस्य पद / Designation)',
    areaSub: '(क्षेत्र / Ward)',
    phoneSub: '(फोन नंबर)',
    shopSub: 'दुकान / व्यवसाय',
    memberSinceLabel: 'Member Since:',
    joinDateSub: '(सदस्यत्व तारीख)',
    validityHeader: '🛡️ Validity / वैधता',
    fromLabel: 'From / पासून',
    toLabel: 'To / पर्यंत',
    activeBadge: '✓ Active / सक्रिय',
    scanToVerify: 'Scan to Verify',
    scanToVerifySub: 'स्कॅन करा',
    joinedLabel: 'Joined / सामील:',
    expiresLabel: 'Expires / समाप्त:',
    annualSubLabel: 'Annual Union Subscription / वार्षिक वर्गणी',
    feePaidLabel: '₹१०० / वर्ष Paid',
    issuedBy: 'Issued by MTVS 2026-2027',
    issuedBySub: 'स्कॅन करून पडताळणी',
    receiptNoLabel: 'Receipt No. / पावती क्र.',
    paidOnLabel: 'Paid On / तारीख',
    payModeLabel: 'Mode / पद्धत',
    upiRefLabel: 'UPI Reference / संदर्भ',
    subPaidLabel: 'Subscription Paid',
    adHeader: 'Advertisement / जाहिरात (Click to Connect)',
    cardBottomNote: 'Official Member Pass issued by Mumbai Vidi Tambakhu Sangh. Keep this pass accessible at your workplace.',
  },

  hi: {
    // Brand & Header
    brandName: 'मुंबई बीड़ी तंबाकू संघ',
    brandNameMr: 'मुंबई बीड़ी तंबाकू संघ',
    brandSub: 'Mumbai Vidi Tambakhu Sangh',
    govtReg: 'शासन पंजीकृत कामगार संगठन',
    govtRegNotice: 'सदस्यों का अधिकृत संगठन • मुंबई, महाराष्ट्र (शासन पंजी. २०२६)',
    tagline: 'मुंबई के बीड़ी कामगार व तंबाकू विक्रेताओं का अधिकृत संगठन',

    // Nav
    joinUnion: 'सदस्य बनें',
    trackStatus: 'आवेदन स्थिति',
    home: 'मुख्य पृष्ठ',
    terms: 'नियम व शर्तें',

    // Common
    back: 'वापस',
    share: 'साझा करें',
    downloadPdf: 'पास PDF डाउनलोड करें',
    preparing: 'तैयार हो रहा है...',
    close: 'बंद करें',
    refresh: 'ताज़ा करें',
    search: 'खोजें',

    // Landing Page
    heroTitle: 'मुंबई बीड़ी तंबाकू संघ में आपका स्वागत है',
    heroSubtitle: 'मुंबई क्षेत्र के सभी बीड़ी कामगारों, पान दुकानदारों, थोक व खुदरा तंबाकू विक्रेताओं के अधिकारों और कानूनी संरक्षण हेतु कार्यरत अधिकृत संस्था।',
    heroCta: 'अधिकृत सदस्यता हेतु आवेदन करें',
    trackCta: 'आवेदन स्थिति जांचें',

    // Landing Info Sections
    aboutTitle: 'संघ के बारे में (About MTVS)',
    aboutDesc: 'मुंबई बीड़ी तंबाकू संघ मुंबई और उपनगरों के हजारों बीड़ी निर्माताओं, श्रमिकों, पान दुकानदारों और व्यापारियों का प्रतिनिधित्व करने वाला अग्रणी संगठन है। यह संघ सदस्यों के कल्याण, कानूनी सलाह, और व्यापार सुरक्षा हेतु निरंतर कार्यरत है।',

    benefit1Title: 'कानूनी संरक्षण व मार्गदर्शन',
    benefit1Desc: 'स्थानीय प्रशासन व अन्य समस्याओं में संगठन का अधिकृत कानूनी सहयोग।',
    benefit2Title: 'अधिकृत डिजिटल सदस्यता पहचान पत्र',
    benefit2Desc: 'क्यूआर कोड युक्त डिजिटल पास जो आपके कार्यस्थल पर पहचान पत्र के रूप में मान्य होगा।',
    benefit3Title: 'कल्याणकारी सहायता',
    benefit3Desc: 'कामगारों और व्यापारियों के परिवारों के लिए संगठनात्मक सहयोग और सामाजिक सुरक्षा।',

    // Registration Form
    regTitle: 'नई सदस्यता पंजीकरण फॉर्म',
    regSubtitle: 'सभी विवरण सही भरें। क्षेत्रीय प्रतिनिधि द्वारा आवेदन का सत्यापन किया जाएगा।',
    annualFeeNotice: 'वार्षिक सदस्यता शुल्क: ₹100 (सत्यापन और मंजूरी के बाद ही देय)',

    secPersonal: '१. व्यक्तिगत विवरण',
    fullName: 'पूरा नाम',
    fullNamePh: 'उदा. सुरेश रामचंद्र पाटिल',
    age: 'आयु (उम्र)',
    gender: 'लिंग',
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',
    mobile: 'मोबाइल नंबर',
    email: 'ईमेल (वैकल्पिक)',

    secWork: '२. दुकान व कार्य विवरण',
    shopName: 'दुकान / व्यापार का नाम',
    shopNamePh: 'उदा. पाटिल पान बीड़ी भंडार',
    workType: 'काम का प्रकार',
    workTypePh: 'काम का प्रकार चुनें या खोजें...',
    idType: 'पहचान पत्र का प्रकार',
    idNumber: 'पहचान पत्र संख्या (वैकल्पिक)',

    secAddress: '३. पता व क्षेत्र चयन',
    address: 'पूरा पता',
    addressPh: 'दुकान नं., गाला, सड़क, लैंडमार्क...',
    area: 'क्षेत्र / वार्ड',
    areaPh: 'क्षेत्र खोजें (उदा. दादर, कुर्ला, मलाड)...',
    pincode: 'पिनकोड',

    secUploads: '४. आवश्यक फोटो व दस्तावेज',
    photoLabel: 'सदस्य का पासपोर्ट फोटो (ID Card हेतु)',
    shopPhotoLabel: 'दुकान / कार्यस्थल का फोटो (Shop Photo)',
    docPhotoLabel: 'पहचान पत्र का फोटो (Aadhaar / Voter ID)',
    uploadClick: 'फोटो अपलोड करने के लिए यहां क्लिक करें',
    maxSize: 'अधिकतम आकार: 5 MB',

    certifyText: 'मैं प्रमाणित करता/करती हूँ कि दी गई सभी जानकारी सत्य है और मैं संघ के सभी नियमों का पालन करने के लिए बाध्य रहूँगा/रहूँगी।',
    submitBtn: 'आवेदन जमा करें',
    submitting: 'आवेदन जमा हो रहा है...',

    // Status Tracker
    trackTitle: 'सदस्यता आवेदन स्थिति जांचें',
    trackSubtitle: 'अपना आवेदन संदर्भ (REQ-2026-XXXXX) या पंजीकृत 10 अंकों का मोबाइल नंबर दर्ज करें।',
    searchBtn: 'स्थिति जांचें',
    searching: 'जांच जारी है...',
    appRef: 'आवेदन संदर्भ संख्या',
    underVerification: 'सत्यापन प्रक्रिया में',
    approvedWaitingPay: 'स्वीकृत — भुगतान शेष',
    verifiedActiveMember: 'प्रमाणित सक्रिय सदस्य',
    appRejected: 'आवेदन अस्वीकृत',
    step1: '१. आवेदन प्रस्तुत',
    step2: '२. स्वीकृति',
    step3: '३. सदस्यता पास',
    stepSubmitted: 'आवेदन प्रस्तुत',
    stepApproved: 'स्वीकृत',
    stepPassed: 'पास जारी',
    pendingHeading: 'आपका आवेदन सत्यापन प्रक्रिया में है',
    pendingDesc: 'आपके क्षेत्र के प्रतिनिधि द्वारा दस्तावेजों की जांच की जा रही है। स्वीकृति के बाद ₹100 शुल्क भुगतान का विकल्प खुलेगा।',
    approvedHeading: 'आवेदन स्वीकृत हो गया है! 🎉',
    approvedDesc: 'वार्षिक ₹100 शुल्क भुगतान हेतु नीचे दिया गया QR कोड स्कैन करें।',
    paidHeading: 'बधाई! आपकी सदस्यता सक्रिय हो गई है!',
    viewPassBtn: 'सदस्यता पास देखें और डाउनलोड करें',
    payUpiHeading: 'वार्षिक शुल्क ₹100 यूपीआई द्वारा भुगतान करें',
    scanQrPay: 'किसी भी UPI App से स्कैन करें',
    upiCopied: 'UPI ID कॉपी हो गई!',
    copyUpi: 'UPI ID कॉपी करें',
    upiNotice: 'भुगतान के बाद 2 घंटे में आपका डिजिटल पास सक्रिय हो जाएगा।',

    // Pass Page
    loadingPass: 'अधिकृत सदस्यता पास लोड हो रहा है...',
    passNotFound: 'सदस्य रिकॉर्ड नहीं मिला',
    invalidPassNotice: 'अमान्य सदस्य आईडी या शुल्क लंबित है।',
    backToTrack: '← आवेदन स्थिति पृष्ठ पर वापस जाएं',
    passNotice: 'यह प्रमाणित पास बृहन्मुंबई महानगरपालिका के सभी वार्डों में अधिकृत रूप से मान्य है।',
    shareText: 'मुंबई बीड़ी तंबाकू संघ – प्रमाणित सदस्यता पास',
    passLinkCopied: 'पास लिंक क्लिपबोर्ड पर कॉपी हो गया!',

    // Pass Card Details
    passTitle: 'मुंबई बीड़ी तंबाकू संघ',
    passSubtitle: 'अधिकृत सदस्यता पहचान पत्र',
    memberPassBadge: 'MEMBER PASS / सदस्य पास',
    validBadge: 'VALID / वैध',
    memberBadge: '✓ सदस्य / Member',
    designationLabel: 'Member / सदस्य',
    designationSub: '(सदस्य पद / Designation)',
    areaSub: '(क्षेत्र / Ward)',
    phoneSub: '(फ़ोन नंबर)',
    shopSub: 'दुकान / व्यापार',
    memberSinceLabel: 'Member Since:',
    joinDateSub: '(सदस्यता तारीख)',
    validityHeader: '🛡️ Validity / वैधता',
    fromLabel: 'From / से',
    toLabel: 'To / तक',
    activeBadge: '✓ Active / सक्रिय',
    scanToVerify: 'Scan to Verify',
    scanToVerifySub: 'स्कैन करें',
    joinedLabel: 'Joined / शामिल:',
    expiresLabel: 'Expires / समाप्त:',
    annualSubLabel: 'Annual Union Subscription / वार्षिक सदस्यता शुल्क',
    feePaidLabel: '₹100 / वर्ष Paid',
    issuedBy: 'Issued by MTVS 2026-2027',
    issuedBySub: 'स्कैन करके सत्यापन',
    receiptNoLabel: 'Receipt No. / रसीद क्र.',
    paidOnLabel: 'Paid On / तारीख',
    payModeLabel: 'Mode / माध्यम',
    upiRefLabel: 'UPI Reference / संदर्भ',
    subPaidLabel: 'Subscription Paid',
    adHeader: 'Advertisement / विज्ञापन (Click to Connect)',
    cardBottomNote: 'मुंबई बीड़ी तंबाकू संघ द्वारा जारी अधिकृत सदस्यता पहचान पत्र। कार्यस्थल पर साथ रखें।',
  },

  en: {
    // Brand & Header
    brandName: 'Mumbai Vidi Tambakhu Sangh',
    brandNameMr: 'Mumbai Vidi Tambakhu Sangh',
    brandSub: 'Govt. Registered Union',
    govtReg: 'Govt. Registered Union',
    govtRegNotice: 'Union of Members • Mumbai, Maharashtra (Govt. Reg. 2026)',
    tagline: 'Official Union for Bidi Workers & Tobacco Retailers of Greater Mumbai',

    // Nav
    joinUnion: 'Join Union',
    trackStatus: 'Track Status',
    home: 'Home',
    terms: 'Terms & Conditions',

    // Common
    back: 'Back',
    share: 'Share',
    downloadPdf: 'Download Pass PDF',
    preparing: 'Preparing...',
    close: 'Close',
    refresh: 'Refresh',
    search: 'Search',

    // Landing Page
    heroTitle: 'Welcome to Mumbai Vidi Tambakhu Sangh',
    heroSubtitle: 'The recognized welfare union dedicated to protecting the rights, livelihood, and legal interests of bidi rollers, pan shopkeepers, wholesale distributors, and tobacco vendors.',
    heroCta: 'Apply for Union Membership',
    trackCta: 'Track Application Status',

    // Landing Info Sections
    aboutTitle: 'About MTVS',
    aboutDesc: 'Mumbai Vidi Tambakhu Sangh is the foremost representative union for thousands of bidi manufacturers, workers, retail pan shops, and tobacco merchants across Greater Mumbai. MTVS ensures fair treatment, legal advocacy against administrative harassment, licensing assistance, and family welfare support.',

    benefit1Title: 'Legal Protection & Advocacy',
    benefit1Desc: 'Official union standing and immediate legal guidance against municipal harassment or arbitrary actions.',
    benefit2Title: 'Official Verified Digital Pass',
    benefit2Desc: 'QR-coded membership smart pass recognized across Mumbai jurisdiction for identity and trade legitimacy.',
    benefit3Title: 'Welfare Schemes & Network',
    benefit3Desc: 'Access to union welfare schemes, community support, and wholesale supply chain assistance.',

    // Registration Form
    regTitle: 'Union Membership Application',
    regSubtitle: 'Provide accurate details. Applications are reviewed by regional union representatives.',
    annualFeeNotice: 'Annual Membership Fee: ₹100 (Payable only after representative verification)',

    secPersonal: '1. Personal Details',
    fullName: 'Full Name',
    fullNamePh: 'e.g. Suresh Ramchandra Patil',
    age: 'Age (Years)',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    mobile: 'Mobile Number',
    email: 'Email (Optional)',

    secWork: '2. Shop & Workplace Details',
    shopName: 'Shop / Business Name',
    shopNamePh: 'e.g. Patil Pan & Bidi Center',
    workType: 'Nature of Work / Trade',
    workTypePh: 'Search or select work type...',
    idType: 'ID Document Type',
    idNumber: 'ID Number (Optional)',

    secAddress: '3. Workplace Address & Ward',
    address: 'Complete Workplace Address',
    addressPh: 'Shop No., Gala, Street, Landmark...',
    area: 'Area / Ward',
    areaPh: 'Search area (e.g. Dadar, Kurla, Malad)...',
    pincode: 'Pincode',

    secUploads: '4. Photos & Documents',
    photoLabel: 'Member Passport Photo (for ID Card)',
    shopPhotoLabel: 'Shop / Workplace Photo',
    docPhotoLabel: 'ID Document Proof (Aadhaar / Voter ID)',
    uploadClick: 'Click to select photo or take picture',
    maxSize: 'Max file size: 5 MB',

    certifyText: 'I hereby declare that all details provided are accurate and I agree to abide by the constitution and rules of Mumbai Vidi Tambakhu Sangh.',
    submitBtn: 'Submit Membership Application',
    submitting: 'Submitting Application...',

    // Status Tracker
    trackTitle: 'Track Membership Status',
    trackSubtitle: 'Enter your Application Reference (REQ-2026-XXXXX) or registered 10-digit mobile number.',
    searchBtn: 'Check Status',
    searching: 'Searching...',
    appRef: 'Application Reference',
    underVerification: 'Under Verification',
    approvedWaitingPay: 'Approved — Waiting for Payment',
    verifiedActiveMember: 'Verified Active Member',
    appRejected: 'Application Rejected',
    step1: '1. Submitted',
    step2: '2. Approval',
    step3: '3. Pass Issued',
    stepSubmitted: 'Submitted',
    stepApproved: 'Approved',
    stepPassed: 'Pass Issued',
    pendingHeading: 'Your Application is Under Verification',
    pendingDesc: 'The regional union representative is verifying your shop details and identity documents. Payment will be enabled once approved.',
    approvedHeading: 'Application Approved! 🎉',
    approvedDesc: 'Scan the QR code below using any UPI App to pay the annual ₹100 membership fee.',
    paidHeading: 'Congratulations! Membership is Active!',
    viewPassBtn: 'View & Download Member Pass',
    payUpiHeading: 'Pay Annual Fee ₹100 via UPI',
    scanQrPay: 'Scan with any UPI App',
    upiCopied: 'UPI ID Copied!',
    copyUpi: 'Copy UPI ID',
    upiNotice: 'Your digital pass will be activated within 2 hours of payment confirmation.',

    // Pass Page
    loadingPass: 'Loading Official Union Pass...',
    passNotFound: 'Member Record Not Found',
    invalidPassNotice: 'Invalid member ID or payment pending.',
    backToTrack: '← Back to Status Tracker',
    passNotice: 'This verified pass is valid across all municipal wards of Greater Mumbai.',
    shareText: 'Mumbai Vidi Tambakhu Sangh – Verified Member Pass',
    passLinkCopied: 'Pass link copied to clipboard!',

    // Pass Card Details
    passTitle: 'Mumbai Vidi Tambakhu Sangh',
    passSubtitle: 'Official Member Identity Card',
    memberPassBadge: 'MEMBER PASS',
    validBadge: 'VALID',
    memberBadge: '✓ Verified Member',
    designationLabel: 'Member',
    designationSub: '(Union Member)',
    areaSub: '(Area / Ward)',
    phoneSub: '(Mobile No.)',
    shopSub: 'Shop / Business',
    memberSinceLabel: 'Member Since:',
    joinDateSub: '(Joined Date)',
    validityHeader: '🛡️ Validity Period',
    fromLabel: 'From',
    toLabel: 'To',
    activeBadge: '✓ Active',
    scanToVerify: 'Scan to Verify',
    scanToVerifySub: 'Official QR Code',
    joinedLabel: 'Joined:',
    expiresLabel: 'Expires:',
    annualSubLabel: 'Annual Union Subscription',
    feePaidLabel: '₹100 / Year Paid',
    issuedBy: 'Issued by MTVS 2026-2027',
    issuedBySub: 'Official QR Verification',
    receiptNoLabel: 'Receipt No.',
    paidOnLabel: 'Paid On',
    payModeLabel: 'Mode',
    upiRefLabel: 'UPI Reference',
    subPaidLabel: 'Subscription Paid',
    adHeader: 'Official Union Advertisements',
    cardBottomNote: 'Official Member Pass issued by Mumbai Vidi Tambakhu Sangh. Keep this pass accessible at your workplace.',
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('mtvs_lang') || 'mr';
  });

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('mtvs_lang', newLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['mr']?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
