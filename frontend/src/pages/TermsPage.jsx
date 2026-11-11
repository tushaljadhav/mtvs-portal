import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  Lock, 
  Phone, 
  Printer, 
  ArrowLeft, 
  Building2,
  Calendar,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function TermsPage() {
  const { lang, t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-fadeIn font-sans">
      
      {/* ── TOP ACTION BAR (Screen Only) ───────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-700" />
          <span>{lang === 'mr' ? 'मुख्यपृष्ठावर परत जा' : lang === 'hi' ? 'मुख्य पृष्ठ पर वापस जाएं' : 'Back to Home'}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>{lang === 'mr' ? 'नियम मुद्रित करा (Print)' : lang === 'hi' ? 'प्रिंट करें (Print)' : 'Print Terms'}</span>
          </button>

          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-4 py-2 rounded-xl shadow-xs transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{lang === 'mr' ? 'सभासद अर्ज करा' : lang === 'hi' ? 'सदस्यता आवेदन करें' : 'Join Union Now'}</span>
          </Link>
        </div>
      </div>

      {/* ── DOCUMENT CONTAINER ───────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
        
        {/* Document Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-10 text-white relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>अधिकृत नियमावली व अटी • Official Constitution & Terms</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
            {lang === 'mr' && 'मुंबई विडी तंबाखू संघ — नियम आणि अटी'}
            {lang === 'hi' && 'मुंबई बीड़ी तंबाकू संघ — नियम एवं शर्तें'}
            {lang === 'en' && 'Mumbai Vidi Tambakhu Sangh — Terms & Conditions'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {lang === 'mr' && 'मुंबई महानगर परिसरातील सर्व विडी कामगार, पान दुकानदार, घाऊक व किरकोळ तंबाखू विक्रेते यांच्या सदस्यत्वासाठी अधिकृत मार्गदर्शक तत्त्वे व कायदेशीर नियमावली.'}
            {lang === 'hi' && 'मुंबई महानगर क्षेत्र के समस्त बीड़ी कामगारों, पान दुकानदारों, थोक व खुदरा तंबाकू विक्रेताओं की सदस्यता हेतु आधिकारिक दिशानिर्देश व कानूनी नियमावली।'}
            {lang === 'en' && 'Official regulatory terms, rights, responsibilities, and membership rules for all affiliated tobacco vendors and bidi workers across Greater Mumbai.'}
          </p>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span>Govt. Reg. Act 2026</span>
            <span>•</span>
            <span>Effective: November 2026</span>
            <span>•</span>
            <span>Jurisdiction: Greater Mumbai</span>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-6 sm:p-10 space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          
          {/* SECTION 1: उद्देश व व्याप्ती (Purpose & Scope) */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                १
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {lang === 'mr' && '१. उद्देश, कार्यक्षेत्र व व्याप्ती (Purpose & Scope)'}
                {lang === 'hi' && '१. उद्देश्य एवं कार्यक्षेत्र (Purpose & Scope)'}
                {lang === 'en' && '1. Purpose & Scope of the Union'}
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 space-y-2 pl-11">
              <p>
                {lang === 'mr' && 'मुंबई विडी तंबाखू संघ (MTVS) ही बृहन्मुंबई महानगरपालिका कार्यक्षेत्रातील विडी कारागीर, कामगार, पान टपरी चालक, घाऊक व किरकोळ तंबाखू विक्रेते यांच्या हक्क संरक्षणासाठी कार्यरत अधिकृत कामगार संघटना आहे.'}
                {lang === 'hi' && 'मुंबई बीड़ी तंबाकू संघ (MTVS) बृहन्मुंबई क्षेत्र के बीड़ी कारीगरों, श्रमिकों, पान दुकानदारों, थोक एवं खुदरा तंबाकू विक्रेताओं के अधिकार संरक्षण हेतु समर्पित अधिकृत संगठन है।'}
                {lang === 'en' && 'Mumbai Vidi Tambakhu Sangh (MTVS) is an officially recognized welfare and labor association operating across Greater Mumbai to uphold the legal rights, welfare, and trade legitimacy of bidi rollers, pan shopkeepers, and tobacco retailers.'}
              </p>
              <p>
                {lang === 'mr' && 'संघाचे मुख्य उद्दिष्ट सदस्यांना स्थानिक प्रशासन, पोलीस विभाग व महापालिकेकडून होणाऱ्या अवाजवी त्रासापासून कायदेशीर संरक्षण पुरवणे, शासकीय योजनांचा लाभ मिळवून देणे आणि व्यावसायिक सहकार्य वाढवणे हे आहे.'}
                {lang === 'hi' && 'संघ का मुख्य उद्देश्य सदस्यों को स्थानीय प्रशासन, पुलिस व नगर निगम से होने वाले अनुचित उत्पीड़न के विरुद्ध कानूनी संरक्षण प्रदान करना तथा सरकारी कल्याणकारी योजनाओं का लाभ पहुंचाना है।'}
                {lang === 'en' && 'The core mission is providing unified collective representation against arbitrary administrative actions, ensuring legitimate business conduct under municipal law, and providing welfare support to members and their families.'}
              </p>
            </div>
          </section>

          {/* SECTION 2: सभासदत्व पात्रता व अटी (Eligibility) */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                २
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {lang === 'mr' && '२. सभासदत्व पात्रता व आवश्यक कागदपत्रे (Eligibility)'}
                {lang === 'hi' && '२. सदस्यता पात्रता एवं आवश्यक दस्तावेज (Eligibility)'}
                {lang === 'en' && '2. Membership Eligibility & Required Proofs'}
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 space-y-2.5 pl-11">
              <p className="font-semibold text-slate-800">
                {lang === 'mr' && 'संघाचे अधिकृत सभासद होण्यासाठी खालील अटी पूर्ण करणे अनिवार्य आहे:'}
                {lang === 'hi' && 'संघ की सदस्यता प्राप्त करने हेतु निम्नलिखित शर्तें पूर्ण करना अनिवार्य है:'}
                {lang === 'en' && 'Applicants must meet the following eligibility conditions:'}
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  {lang === 'mr' && 'अर्जदाराचे वय १८ वर्षे पूर्ण असणे आवश्यक आहे.'}
                  {lang === 'hi' && 'आवेदक की आयु न्यूनतम १८ वर्ष पूर्ण होनी चाहिए।'}
                  {lang === 'en' && 'Applicant must be at least 18 years of age.'}
                </li>
                <li>
                  {lang === 'mr' && 'अर्जदार प्रत्यक्षपणे विडी उत्पादन, पानपट्टी, तंबाखू किरकोळ/घाऊक विक्री व्यवसायात मुंबई कार्यक्षेत्रात कार्यरत असावा.'}
                  {lang === 'hi' && 'आवेदक मुंबई महानगर क्षेत्र में बीड़ी निर्माण, पान की दुकान, थोक अथवा खुदरा तंबाकू व्यवसाय से प्रत्यक्ष जुड़ा होना चाहिए।'}
                  {lang === 'en' && 'The applicant must be actively engaged in bidi rolling, pan kiosk operation, or wholesale/retail tobacco trade within Greater Mumbai.'}
                </li>
                <li>
                  {lang === 'mr' && 'अर्जदाराने आपला पासपोर्ट फोटो, दुकानाचा/कामाच्या जागेचा फोटो, आणि आधार कार्ड अथवा वैध शासकीय ओळखपत्र अपलोड करणे अनिवार्य आहे.'}
                  {lang === 'hi' && 'आवेदक को अपना पासपोर्ट फोटो, दुकान/कार्यस्थल का फोटो, तथा आधार कार्ड या वैध सरकारी पहचान पत्र अपलोड करना अनिवार्य है।'}
                  {lang === 'en' && 'Applicants must provide their clear portrait photo, workplace/shop photograph, and government-issued ID proof (Aadhaar Card, Voter ID, etc.).'}
                </li>
              </ul>
            </div>
          </section>

          {/* SECTION 3: पडताळणी प्रक्रिया व क्षेत्रीय प्रतिनिधी (Verification) */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                ३
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {lang === 'mr' && '३. क्षेत्रीय पडताळणी व मंजुरी प्रक्रिया (Verification Flow)'}
                {lang === 'hi' && '३. क्षेत्रीय सत्यापन एवं अनुमोदन प्रक्रिया (Verification Flow)'}
                {lang === 'en' && '3. Regional Verification & Approval Process'}
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 space-y-2.5 pl-11">
              <p>
                {lang === 'mr' && 'अर्जदाराने पोर्टलवर अर्ज सादर केल्यानंतर, त्याच्या परिसरातील संबंधित क्षेत्रीय प्रतिनिधीद्वारे अर्जाची व कागदपत्रांची पडताळणी केली जाते.'}
                {lang === 'hi' && 'पोर्टल पर आवेदन जमा होने के उपरांत, संबंधित क्षेत्रीय प्रतिनिधि द्वारा दस्तावेजों एवं दुकान के पते का सत्यापन किया जाता है।'}
                {lang === 'en' && 'Upon online submission, each application is reviewed and verified by the designated regional union representative of the respective ward.'}
              </p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 font-medium">
                {lang === 'mr' && 'महत्त्वाची सूचना: अर्जाची पडताळणी पूर्ण होऊन तो मंजूर (Approved) झाल्यानंतरच सभासदाला वार्षिक शुल्क भरण्याचा पर्याय दिला जातो. पडताळणीपूर्वी कोणतेही शुल्क आकारले जात नाही.'}
                {lang === 'hi' && 'महत्वपूर्ण सूचना: आवेदन का क्षेत्रीय सत्यापन पूर्ण होकर स्वीकृत होने के बाद ही सदस्यता शुल्क का भुगतान लिया जाता है। सत्यापन से पूर्व कोई शुल्क नहीं लिया जाता।'}
                {lang === 'en' && 'Important: The annual subscription fee is payable ONLY AFTER official representative verification and approval. No fee is collected prior to approval.'}
              </div>
            </div>
          </section>

          {/* SECTION 4: वार्षिक शुल्क व देयक धोरण (Fee Policy) */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                ४
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {lang === 'mr' && '४. वार्षिक सभासद वर्गणी व देयक धोरण (Subscription & Fee)'}
                {lang === 'hi' && '४. वार्षिक सदस्यता शुल्क एवं भुगतान नीति (Subscription & Fee)'}
                {lang === 'en' && '4. Annual Subscription Fee (₹100) & Payment Terms'}
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 space-y-2.5 pl-11">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  {lang === 'mr' && 'वार्षिक सभासद शुल्क ₹१०० (एकशे रुपये फक्त) प्रति वर्ष निश्चित करण्यात आले आहे.'}
                  {lang === 'hi' && 'वार्षिक सदस्यता शुल्क ₹१०० (एक सौ रुपये मात्र) प्रति वर्ष निर्धारित है।'}
                  {lang === 'en' && 'The annual union membership fee is fixed at ₹100 (Rupees One Hundred Only) per fiscal year.'}
                </li>
                <li>
                  {lang === 'mr' && 'सदर शुल्क अधिकृत UPI क्युआर कोडद्वारे थेट संघाच्या अधिकृत खात्यात जमा केले जाते. भरणा पूर्ण झाल्यावर तात्काळ पावती क्रमांक व डिजिटल पास उपलब्ध होतो.'}
                  {lang === 'hi' && 'यह शुल्क अधिकृत UPI क्यूआर कोड के माध्यम से सीधे संघ के बैंक खाते में जमा होता है। भुगतान पूर्ण होने पर रसीद संख्या तुरंत जारी होती है।'}
                  {lang === 'en' && 'Payment is made through official union UPI QR. An automated receipt reference and transaction acknowledgment is generated instantaneously.'}
                </li>
                <li>
                  {lang === 'mr' && 'सभासद शुल्क एकदा भरल्यानंतर ते कोणत्याही कारणास्तव परत (Non-refundable) केले जाणार नाही.'}
                  {lang === 'hi' && 'एक बार भुगतान किया गया सदस्यता शुल्क किसी भी स्थिति में वापस (Non-refundable) नहीं होगा।'}
                  {lang === 'en' && 'The membership subscription fee is non-refundable once the official pass has been generated.'}
                </li>
              </ul>
            </div>
          </section>

          {/* SECTION 5: डिजिटल पास व क्युआर कोडचे नियम (Digital Pass Usage) */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                ५
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {lang === 'mr' && '५. डिजिटल सदस्य पास व क्युआर कोडचे नियम (Pass Usage)'}
                {lang === 'hi' && '५. डिजिटल सदस्य पास व क्यूआर कोड नियम (Pass Usage)'}
                {lang === 'en' && '5. Digital Member Pass Rules & QR Verification'}
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 space-y-2 pl-11">
              <p>
                {lang === 'mr' && 'सभासद पास हा वैयक्तिक व अहस्तांतरणीय (Non-transferable) आहे. तो केवळ ज्या सभासदाच्या नावावर जारी झाला आहे त्याच्याच दुकानासाठी व व्यवसायासाठी वैध राहील.'}
                {lang === 'hi' && 'जारी किया गया डिजिटल सदस्य पास अहस्तांतरणीय (Non-transferable) है। यह केवल उसी सदस्य व दुकान हेतु मान्य होगा जिसके नाम पर जारी हुआ है।'}
                {lang === 'en' && 'The official MTVS Member Pass is non-transferable and strictly valid only for the certified individual and registered shop address.'}
              </p>
              <p>
                {lang === 'mr' && 'पासवर मुद्रित क्युआर कोड स्कॅन करून पोलीस अथवा पालिका अधिकाऱ्यांना ऑनलाइन पडताळणी करण्याची सुविधा उपलब्ध आहे. सभासदाने हा पास आपल्या दुकानात सहज दिसेल अशा ठिकाणी लावणे अथवा मोबाईलमध्ये जतन करणे बंधनकारक आहे.'}
                {lang === 'hi' && 'पास पर अंकित क्यूआर कोड को स्कैन कर पुलिस अथवा प्रशासन ऑनलाइन वैधता सत्यापित कर सकते हैं। सदस्यों को यह पास अपनी दुकान में प्रदर्शित करना चाहिए।'}
                {lang === 'en' && 'The encrypted QR code allows real-time verification of validity by municipal or police authorities. Members must keep this pass accessible at their trade counter.'}
              </p>
            </div>
          </section>

          {/* SECTION 6: कायदेशीर अनुपालन (Legal Compliance) */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                ६
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {lang === 'mr' && '६. कायदेशीर अनुपालन व शासकीय नियम (Legal Compliance)'}
                {lang === 'hi' && '६. कानूनी अनुपालन एवं शासकीय नियम (Legal Compliance)'}
                {lang === 'en' && '6. Statutory Compliance & Legal Obligations'}
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 space-y-2.5 pl-11">
              <p>
                {lang === 'mr' && 'सर्व सभासदांनी COTPA कायदा (सिगारेट व इतर तंबाखू उत्पादने कायदा २००३) व स्थानिक महानगरपालिकेच्या नियमांचे काटेकोर पालन करणे आवश्यक आहे:'}
                {lang === 'hi' && 'सभी सदस्यों को COTPA कानून (सिगरेट एवं अन्य तंबाकू उत्पाद अधिनियम 2003) तथा नगर निगम नियमों का सख्ती से पालन करना अनिवार्य है:'}
                {lang === 'en' && 'All union members must strictly comply with national and state laws, including the Cigarettes and Other Tobacco Products Act (COTPA 2003):'}
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  {lang === 'mr' && '१८ वर्षांखालील अल्पवयीन मुलांना कोणत्याही प्रकारची तंबाखू अथवा विडी उत्पादने विकण्यास सक्त मनाई आहे.'}
                  {lang === 'hi' && '१८ वर्ष से कम आयु के नाबालिगों को तंबाकू अथवा बीड़ी उत्पाद बेचना सख्त मना है।'}
                  {lang === 'en' && 'Sale of tobacco or bidi products to minors under 18 years of age is strictly prohibited by law.'}
                </li>
                <li>
                  {lang === 'mr' && 'शाळा, महाविद्यालये व शैक्षणिक संस्थांच्या १०० मीटर परिसरात तंबाखू उत्पादनांची विक्री करण्यास मनाई आहे.'}
                  {lang === 'hi' && 'स्कूल, कॉलेज व शिक्षण संस्थानों के १०० मीटर के दायरे में तंबाकू उत्पादों की बिक्री प्रतिबंधित है।'}
                  {lang === 'en' && 'Sale within 100 meters of educational institutions and schools is strictly prohibited.'}
                </li>
                <li>
                  {lang === 'mr' && 'कोणत्याही बेकायदेशीर अथवा प्रतिबंधित अंमली पदार्थांची विक्री केल्यास सभासदत्व तात्काळ रद्द करण्यात येईल व संघ कोणतीही कायदेशीर मदत करणार नाही.'}
                  {lang === 'hi' && 'किसी भी प्रकार के अवैध अथवा प्रतिबंधित नशीले पदार्थों की बिक्री पाए जाने पर सदस्यता तत्काल रद्द होगी तथा संघ कोई संरक्षण नहीं देगा।'}
                  {lang === 'en' && 'Trafficking of contraband or illicit banned narcotics will result in immediate termination of membership, with zero union legal backing.'}
                </li>
              </ul>
            </div>
          </section>

          {/* SECTION 7: सभासदत्व निलंबन व रद्द करणे (Suspension & Termination) */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                ७
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {lang === 'mr' && '७. सभासदत्व निलंबन व रद्द करणे (Termination)'}
                {lang === 'hi' && '७. सदस्यता निलंबन एवं समाप्ति (Termination)'}
                {lang === 'en' && '7. Membership Suspension & Termination'}
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 space-y-2 pl-11">
              <p>
                {lang === 'mr' && 'संघाच्या कार्यकारी मंडळास खालील कारणांवरून कोणत्याही सभासदाचे सदस्यत्व निलंबित अथवा रद्द करण्याचा पूर्ण अधिकार राहील:'}
                {lang === 'hi' && 'संघ की कार्यकारिणी को निम्नलिखित परिस्थितियों में सदस्यता निलंबित अथवा समाप्त करने का पूर्ण अधिकार है:'}
                {lang === 'en' && 'The Union Executive Committee reserves the sole right to revoke or suspend membership if:'}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  {lang === 'mr' && 'अर्जात खोटी माहिती, बोगस कागदपत्रे अथवा दिशाभूल करणारी माहिती दिल्याचे आढळल्यास.'}
                  {lang === 'hi' && 'आवेदन में असत्य जानकारी, फर्जी दस्तावेज अथवा गुमराह करने वाले विवरण पाए जाने पर।'}
                  {lang === 'en' && 'Fraudulent documentation, fabricated photos, or false identity details were provided.'}
                </li>
                <li>
                  {lang === 'mr' && 'वार्षिक सदस्यत्व मुदत संपल्यानंतर विहित मुदतीत नूतनीकरण न केल्यास.'}
                  {lang === 'hi' && 'वार्षिक वैधता समाप्त होने के पश्चात निर्धारित समय में नवीनीकरण न कराने पर।'}
                  {lang === 'en' && 'Failure to renew annual subscription after the 365-day validity period.'}
                </li>
                <li>
                  {lang === 'mr' && 'संघाची अथवा सहकाऱ्यांची बदनामी होईल असे गैरवर्तन केल्यास.'}
                  {lang === 'hi' && 'संघ की प्रतिष्ठा को ठेस पहुंचाने वाले अथवा गैरकानूनी कृत्यों में लिप्त पाए जाने पर।'}
                  {lang === 'en' && 'Actions deliberately detrimental to union unity or public order.'}
                </li>
              </ul>
            </div>
          </section>

          {/* SECTION 8: गोपनीयता व डेटा सुरक्षा (Privacy Policy) */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                ८
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {lang === 'mr' && '८. गोपनीयता, कागदपत्रे व डेटा सुरक्षा (Privacy & Data Security)'}
                {lang === 'hi' && '८. गोपनीयता एवं डेटा सुरक्षा नीति (Privacy & Data Security)'}
                {lang === 'en' && '8. Data Privacy & Document Security'}
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 space-y-2 pl-11">
              <p>
                {lang === 'mr' && 'सभासदांचे अपलोड केलेले फोटो, ओळखपत्रे आणि संपर्क क्रमांक पूर्णपणे सुरक्षित ठेवले जातात. सदर माहितीचा वापर केवळ संघ नोंदणी, सदस्य ओळखपत्र निर्मिती आणि शासकीय संवादासाठीच केला जातो. कोणतीही वैयक्तिक माहिती त्रयस्थ व्यक्तीस विकली जात नाही.'}
                {lang === 'hi' && 'सदस्यों द्वारा अपलोड किए गए दस्तावेज व फोटो सुरक्षित सर्वर पर संग्रहित रहते हैं। इसका उपयोग केवल सदस्यता सत्यापन एवं संघ के आधिकारिक कार्यों हेतु किया जाता है।'}
                {lang === 'en' && 'All uploaded member photographs, business images, and identity documents are stored in secure cloud systems. Member data is strictly utilized for union registers, verification, and legal representation, and is never monetized.'}
              </p>
            </div>
          </section>

          {/* SECTION 9: संपर्क व निवारण कक्ष (Contact) */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                ९
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {lang === 'mr' && '९. तक्रार निवारण व केंद्रीय कार्यालय (Contact & Helpdesk)'}
                {lang === 'hi' && '९. सहायता कक्ष एवं संपर्क (Contact & Helpdesk)'}
                {lang === 'en' && '9. Grievance Redressal & Union Headquarters'}
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 space-y-2 pl-11">
              <p>
                {lang === 'mr' && 'नियम व अटी किंवा सदस्यत्व प्रक्रियेबाबत कोणत्याही शंका अथवा मार्गदर्शनासाठी संघाच्या मध्यवर्ती कार्यालयाशी किंवा आपल्या क्षेत्रीय प्रतिनिधींशी संपर्क साधावा:'}
                {lang === 'hi' && 'नियम एवं शर्तों अथवा सदस्यता प्रक्रिया संबंधी किसी भी पूछताछ हेतु संघ के केंद्रीय कार्यालय से संपर्क करें:'}
                {lang === 'en' && 'For clarifications regarding these terms, pass renewals, or representative visits, contact the MTVS Central Office:'}
              </p>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1.5 text-xs text-slate-700">
                <div className="font-bold text-slate-900">🏛️ मुंबई विडी तंबाखू संघ (केंद्रीय कार्यालय)</div>
                <div>📍 दादर / धारावी मुख्य प्रशासकीय संकुल, मुंबई - ४०० ०१४</div>
                <div>📞 हेल्पलाईन / WhatsApp: +91 99999 99999 / +91 98200 11223</div>
                <div>✉️ ईमेल: contact@mtvs.in • union@mtvs.in</div>
              </div>
            </div>
          </section>

        </div>

        {/* Document Footer Call-To-Action */}
        <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <div className="font-bold text-slate-800">
              {lang === 'mr' && 'नोंदणी अर्ज सादर करून आपण वरील सर्व अटी मान्य करत आहात.'}
              {lang === 'hi' && 'आवेदन जमा करके आप उपरोक्त सभी शर्तों को स्वीकार करते हैं।'}
              {lang === 'en' && 'By submitting an online application, you certify full acceptance of these terms.'}
            </div>
            <div>Mumbai Vidi Tambakhu Sangh • Approved by the Executive Governing Body</div>
          </div>

          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-extrabold text-sm shadow-md transition-transform active:scale-95 text-center flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{lang === 'mr' ? 'अधिकृत सभासद नोंदणी करा' : lang === 'hi' ? 'सदस्यता हेतु आवेदन करें' : 'Proceed to Registration'}</span>
          </Link>
        </div>

      </div>

    </div>
  );
}