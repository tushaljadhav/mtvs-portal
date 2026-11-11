import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  fetchRegionsWithAreas, 
  submitRegistration,
  fetchActiveAds 
} from '../api';
import { useLanguage } from '../context/LanguageContext';
import SearchableSelect from '../components/SearchableSelect';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  Upload, 
  AlertCircle, 
  ShieldCheck,
  Send,
  CheckCircle2,
  Scale,
  IdCard,
  HeartHandshake,
  ArrowDown,
  Search,
  Camera,
  Image as ImageIcon,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const WORK_TYPES = {
  mr: [
    { value: 'Retail Pan Shop', label: 'किरकोळ पान दुकान' },
    { value: 'Wholesale Distributor', label: 'ठोक विक्रेता' },
    { value: 'Bidi Worker / Manufacturer', label: 'विडी कामगार किंवा उत्पादक' },
    { value: 'Tobacco Vendor', label: 'तंबाखू विक्रेता' },
    { value: 'General Retail Store', label: 'जनरल स्टोअर' },
    { value: 'Other Trade', label: 'इतर संबंधित व्यवसाय' },
  ],
  hi: [
    { value: 'Retail Pan Shop', label: 'खुदरा पान दुकान' },
    { value: 'Wholesale Distributor', label: 'थोक विक्रेता' },
    { value: 'Bidi Worker / Manufacturer', label: 'बीड़ी कामगार या निर्माता' },
    { value: 'Tobacco Vendor', label: 'तंबाकू विक्रेता' },
    { value: 'General Retail Store', label: 'जनरल स्टोर' },
    { value: 'Other Trade', label: 'अन्य संबंधित व्यवसाय' },
  ],
  en: [
    { value: 'Retail Pan Shop', label: 'Retail Pan Shop' },
    { value: 'Wholesale Distributor', label: 'Wholesale Distributor' },
    { value: 'Bidi Worker / Manufacturer', label: 'Bidi Worker / Manufacturer' },
    { value: 'Tobacco Vendor', label: 'Tobacco Vendor' },
    { value: 'General Retail Store', label: 'General Retail Store' },
    { value: 'Other Trade', label: 'Other Related Trade' },
  ]
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const formRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [ads, setAds] = useState([]);
  const [error, setError] = useState('');
  const [successRef, setSuccessRef] = useState('');

  // Form State
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    idType: 'Aadhaar',
    idNumber: '',
    shop: '',
    workType: 'Retail Pan Shop',
    address: '',
    area: '',
    pincode: '',
    photo: null,
    shop_photo: null,
    doc_photo: null,
  });

  const [previews, setPreviews] = useState({
    photo: null,
    shop_photo: null,
    doc_photo: null,
  });

  // Check URL params for prefilled mobile
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mobileParam = params.get('mobile') || params.get('phone');
    const nameParam = params.get('name');
    if (mobileParam) {
      setForm(prev => ({ 
        ...prev, 
        phone: mobileParam.replace(/\D/g, '').slice(-10),
        name: nameParam || prev.name
      }));
    }
  }, []);

  // Load regions & advertisements
  useEffect(() => {
    fetchRegionsWithAreas().then(setRegions).catch(() => {});
    fetchActiveAds().then(setAds).catch(() => {});
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format areas for SearchableSelect
  const areaOptions = regions.flatMap(r =>
    (r.areas || []).map(a => ({
      value: a.name,
      label: `${a.name} (${r.name})`,
      group: r.name,
    }))
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (field, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB');
      return;
    }
    setForm(prev => ({ ...prev, [field]: file }));
    setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError(lang === 'en' ? 'Please enter full name' : 'कृपया पूर्ण नाव प्रविष्ट करा');
      return;
    }
    if (!form.age || form.age < 18 || form.age > 100) {
      setError(lang === 'en' ? 'Age must be 18 or above' : 'वय १८ किंवा त्याहून अधिक असावे');
      return;
    }
    if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone)) {
      setError(lang === 'en' ? 'Enter valid 10-digit mobile number' : 'वैध १० अंकी मोबाईल नंबर टाका');
      return;
    }
    if (!form.shop.trim()) {
      setError(lang === 'en' ? 'Please enter workplace name' : 'दुकान किंवा कामाचे नाव प्रविष्ट करा');
      return;
    }
    if (!form.workType) {
      setError(lang === 'en' ? 'Please select nature of work' : 'कामाचे स्वरूप निवडा');
      return;
    }
    if (!form.address.trim()) {
      setError(lang === 'en' ? 'Please enter workplace address' : 'पूर्ण पत्ता प्रविष्ट करा');
      return;
    }
    if (!form.area) {
      setError(lang === 'en' ? 'Please select Area / Ward' : 'परिसर किंवा क्षेत्र निवडा');
      return;
    }
    if (!form.pincode || !/^\d{6}$/.test(form.pincode)) {
      setError(lang === 'en' ? 'Enter valid 6-digit Pincode' : 'वैध ६ अंकी पिनकोड टाका');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== null && val !== undefined) {
          data.append(key, val);
        }
      });

      const res = await submitRegistration(data);
      if (res.ref) {
        setSuccessRef(res.ref);
        setTimeout(() => {
          navigate(`/track?ref=${encodeURIComponent(res.ref)}`);
        }, 1800);
      }
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (successRef) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-xl border border-emerald-200 text-center animate-fadeIn">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-1">
          {lang === 'en' ? 'Application Submitted!' : 'अर्ज यशस्वीरीत्या सादर झाला!'}
        </h2>
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left my-4">
          <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Application Reference</div>
          <div className="text-xl font-mono font-black text-emerald-800">{successRef}</div>
        </div>
        <p className="text-xs text-slate-400">Redirecting to status tracker...</p>
      </div>
    );
  }

  const currentWorkTypes = WORK_TYPES[lang] || WORK_TYPES.mr;

  return (
    <div className="space-y-12 pb-16">
      
      {/* ── LANDING HERO SECTION (HALF HOME PAGE DETAILS) ───────────── */}
      <section className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-800/80 px-4 py-1.5 rounded-full text-xs font-bold text-amber-300 border border-emerald-700 shadow-2xs">
            <span>🌿</span> {t('govtReg')} • {t('tagline')}
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="text-sm sm:text-lg text-emerald-100/90 max-w-3xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Prominent CTA Buttons (Join Union here instead of header) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={scrollToForm}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{t('heroCta')}</span>
              <ArrowDown className="w-4 h-4 text-slate-950" />
            </button>

            <Link
              to="/track"
              className="w-full sm:w-auto px-7 py-3.5 bg-emerald-900/80 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base rounded-2xl border border-emerald-700/80 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-emerald-300" />
              <span>{t('trackCta')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── KEY BENEFITS & ABOUT UNION (3 CARDS) ────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 mb-2">
              {t('benefit1Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('benefit1Desc')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <IdCard className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 mb-2">
              {t('benefit2Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('benefit2Desc')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 mb-2">
              {t('benefit3Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('benefit3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* ── SINGLE REGISTRATION FORM (MOBILE-FIRST) ─────────────────── */}
      <section ref={formRef} className="max-w-3xl mx-auto px-4 pt-4">
        {/* Form Title & Fee Notice */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl sm:text-3xl">📝</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {t('regTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {t('regSubtitle')}
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs sm:text-sm text-emerald-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>{t('annualFeeNotice')}</span>
          </div>

          {error && (
            <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-2 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            
            {/* 1. Personal Details */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">{t('secPersonal')}</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('fullName')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t('fullNamePh')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('age')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="18"
                    max="100"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="35"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('gender')} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Male">{t('male')}</option>
                    <option value="Female">{t('female')}</option>
                    <option value="Other">{t('other')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('mobile')} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">+91</span>
                    <input
                      type="tel"
                      name="phone"
                      maxLength="10"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shop & Workplace Details */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">{t('secWork')}</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('shopName')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="shop"
                  value={form.shop}
                  onChange={handleChange}
                  placeholder={t('shopNamePh')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('workType')} <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  options={currentWorkTypes}
                  value={form.workType}
                  onChange={(val) => setForm(prev => ({ ...prev, workType: val }))}
                  placeholder={t('workTypePh')}
                  searchPlaceholder={t('workTypePh')}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('idType')} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="idType"
                    value={form.idType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Driving License">Driving License</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Gumasta / Shop Act">Gumasta / Shop Act License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('idNumber')}
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={form.idNumber}
                    onChange={handleChange}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* 3. Address & Area Selection */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">{t('secAddress')}</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('address')} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="address"
                  rows="2"
                  value={form.address}
                  onChange={handleChange}
                  placeholder={t('addressPh')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('area')} <span className="text-rose-500">*</span>
                  </label>
                  <SearchableSelect
                    options={areaOptions}
                    value={form.area}
                    onChange={(val) => setForm(prev => ({ ...prev, area: val }))}
                    placeholder={t('areaPh')}
                    searchPlaceholder={t('areaPh')}
                    groupBy={true}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('pincode')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    maxLength="6"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="400001"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 4. PHOTOS & DOCUMENT PROOFS (MEMBER PHOTO, SHOP PHOTO, DOC PHOTO) */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2 flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">{t('secUploads')}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Upload 1: Member Photo */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {t('photoLabel')}
                    </label>
                    <p className="text-[10px] text-slate-400 mb-3">{t('maxSize')}</p>
                  </div>
                  
                  {previews.photo ? (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-emerald-500 mb-2">
                      <img src={previews.photo} alt="Member" className="w-full h-full object-cover" />
                    </div>
                  ) : null}

                  <label className="cursor-pointer py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 text-center block shadow-2xs">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('photo', e.target.files[0])}
                      className="hidden"
                    />
                    <Upload className="w-3.5 h-3.5 inline mr-1" />
                    {form.photo ? 'Change Photo' : 'Upload Photo'}
                  </label>
                </div>

                {/* Upload 2: Business / Shop Photo (Requested) */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {t('shopPhotoLabel')}
                    </label>
                    <p className="text-[10px] text-slate-400 mb-3">{t('maxSize')}</p>
                  </div>

                  {previews.shop_photo ? (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-emerald-500 mb-2">
                      <img src={previews.shop_photo} alt="Shop" className="w-full h-full object-cover" />
                    </div>
                  ) : null}

                  <label className="cursor-pointer py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 text-center block shadow-2xs">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('shop_photo', e.target.files[0])}
                      className="hidden"
                    />
                    <Upload className="w-3.5 h-3.5 inline mr-1" />
                    {form.shop_photo ? 'Change Photo' : 'Upload Shop Photo'}
                  </label>
                </div>

                {/* Upload 3: ID Document Photo (Requested) */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {t('docPhotoLabel')}
                    </label>
                    <p className="text-[10px] text-slate-400 mb-3">{t('maxSize')}</p>
                  </div>

                  {previews.doc_photo ? (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-emerald-500 mb-2">
                      <img src={previews.doc_photo} alt="Document" className="w-full h-full object-cover" />
                    </div>
                  ) : null}

                  <label className="cursor-pointer py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 text-center block shadow-2xs">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('doc_photo', e.target.files[0])}
                      className="hidden"
                    />
                    <Upload className="w-3.5 h-3.5 inline mr-1" />
                    {form.doc_photo ? 'Change Photo' : 'Upload Document'}
                  </label>
                </div>

              </div>
            </div>

            {/* Certify Notice & Terms Agreement */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 leading-relaxed flex items-start gap-3">
              <input
                type="checkbox"
                id="agree_terms"
                required
                defaultChecked
                className="mt-0.5 w-4 h-4 text-emerald-700 rounded border-amber-300 focus:ring-emerald-500 flex-shrink-0 cursor-pointer"
              />
              <label htmlFor="agree_terms" className="cursor-pointer">
                <span>{t('certifyText')} </span>
                <Link
                  to="/terms"
                  target="_blank"
                  className="text-emerald-800 font-bold underline hover:text-emerald-950 ml-1 inline-flex items-center gap-0.5"
                >
                  <span>{lang === 'mr' ? 'नियम व अटी वाचा (Terms & Conditions)' : lang === 'hi' ? 'नियम व शर्तें पढ़ें (Terms & Conditions)' : 'View Terms & Conditions'}</span>
                  <ExternalLink className="w-3 h-3 inline" />
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-black text-sm sm:text-base shadow-lg transition-transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>{t('submitting')}</span>
              ) : (
                <>
                  <Send className="w-5 h-5 text-amber-300" />
                  <span>{t('submitBtn')}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* ── PARTNER ADVERTISEMENTS SECTION AT BOTTOM (REQUESTED) ───── */}
      {ads.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pt-6">
          <div className="text-center mb-6">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              <Sparkles className="w-3 h-3 inline mr-1 text-amber-600" /> {t('partnerAds')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ads.map(ad => (
              <div
                key={ad.id}
                onClick={() => {
                  if (ad.redirect_url) {
                    window.open(ad.redirect_url.startsWith('http') ? ad.redirect_url : `https://${ad.redirect_url}`, '_blank');
                  } else if (ad.phone) {
                    window.location.href = `tel:+91${ad.phone.replace(/\D/g, '')}`;
                  }
                }}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer group"
                title={ad.phone ? `Call +91 ${ad.phone}` : 'Visit Partner'}
              >
                <div>
                  {ad.image_url ? (
                    <div className="w-full h-32 rounded-2xl overflow-hidden mb-3 border border-slate-100 group-hover:opacity-95 transition-opacity">
                      <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                    </div>
                  ) : null}

                  <h4 className="font-extrabold text-sm text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">{ad.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {lang === 'en' ? (ad.description || ad.description_mr) : (ad.description_mr || ad.description)}
                  </p>
                </div>

                {ad.phone && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono font-bold text-emerald-800">
                    <span>Call:</span>
                    <span className="hover:underline">+91 {ad.phone}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
