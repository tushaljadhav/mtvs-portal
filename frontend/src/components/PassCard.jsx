import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Building, 
  Calendar, 
  UserCheck, 
  ArrowRight,
  QrCode,
  CheckCircle2
} from 'lucide-react';

export default function PassCard({ member, ads = [] }) {
  const { lang, t } = useLanguage();

  if (!member) return null;

  const joinedDate = new Date(member.paid_at || member.submitted_at || Date.now());
  const expiryDate = new Date(joinedDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const formatDate = (d) =>
    d.toLocaleDateString(lang === 'en' ? 'en-IN' : lang === 'hi' ? 'hi-IN' : 'mr-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  // Exactly 2 featured ads for the pass card
  const passAds = ads.slice(0, 2);

  const handleAdClick = (ad) => {
    if (ad.redirect_url) {
      const target = ad.redirect_url.startsWith('http://') || ad.redirect_url.startsWith('https://')
        ? ad.redirect_url
        : `https://${ad.redirect_url}`;
      window.open(target, '_blank');
    } else if (ad.phone) {
      window.location.href = `tel:+91${ad.phone.replace(/\D/g, '')}`;
    }
  };

  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/pass/${encodeURIComponent(member.member_id || member.ref)}`;

  return (
    <div
      style={{
        width: '700px',
        maxWidth: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        border: '1.5px solid #e2e8f0',
        fontFamily: 'Inter, system-ui, sans-serif',
        position: 'relative',
        color: '#1e293b'
      }}
      className="pass-card-root"
    >
      {/* ── 1. HEADER (Orange/Amber Gradient from pass.html) ────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #e55a26 60%, #c44c1c 100%)',
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#ffffff',
          position: 'relative'
        }}
      >
        <div style={{ fontSize: '36px', lineHeight: 1 }}>🏛️</div>

        <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
          <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.4px', textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
            {lang === 'en' ? 'Mumbai Vidi Tambakhu Sangh' : lang === 'hi' ? 'मुंबई बीड़ी तंबाकू संघ' : 'मुंबई विडी तंबाखू संघ'}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.92)', marginTop: '2px' }}>
            {lang === 'en' ? 'Union of Bidi Workers & Tobacco Merchants' : 'Mumbai Vidi Tambakhu Sangh'}
          </div>
          <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.75)', marginTop: '3px' }}>
            {t('govtRegNotice')}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '0.5px', color: '#ffffff' }}>
            {t('memberPassBadge')}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
            {lang === 'en' ? 'Official Member Pass' : 'अधिकृत सदस्य पास'}
          </div>
          <div style={{ marginTop: '6px' }}>
            <span
              style={{
                fontSize: '10.5px',
                background: 'rgba(255,255,255,0.25)',
                color: '#ffffff',
                padding: '3px 9px',
                borderRadius: '12px',
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block' }}></span>
              {t('validBadge')}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. GOLD ACCENT BAR ─────────────────────────────────────── */}
      <div style={{ height: '4px', background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)' }}></div>

      {/* ── 3. BODY ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', padding: '26px 28px', gap: '26px', alignItems: 'flex-start' }}>
        
        {/* Photo Side */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flexShrink: 0, width: '110px' }}>
          <div
            style={{
              padding: '3px',
              background: 'linear-gradient(135deg, #FF6B35, #FFD700, #1B4332)',
              borderRadius: '18px'
            }}
          >
            {member.photo_url ? (
              <img
                src={member.photo_url}
                alt={member.name}
                crossOrigin="anonymous"
                style={{ width: '96px', height: '96px', borderRadius: '14px', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #e55a26 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 900,
                  color: '#ffffff'
                }}
              >
                {member.name ? member.name.slice(0, 2).toUpperCase() : 'MB'}
              </div>
            )}
          </div>

          <div
            style={{
              fontSize: '11px',
              color: '#475569',
              fontWeight: 700,
              fontFamily: 'monospace',
              background: '#f8fafc',
              padding: '3px 7px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              width: '100%',
              wordBreak: 'break-all'
            }}
          >
            {member.member_id || member.ref}
          </div>

          <span
            style={{
              background: '#e6f4ea',
              color: '#1B4332',
              border: '1px solid #86efac',
              fontSize: '11.5px',
              padding: '3px 10px',
              borderRadius: '12px',
              fontWeight: 700
            }}
          >
            {t('memberBadge')}
          </span>
        </div>

        {/* Info Side */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, marginBottom: '12px' }}>
            {member.name}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px', fontSize: '13.5px', color: '#334155' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#e6f4ea', color: '#1B4332', display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0, fontSize: '12px' }}>
              <UserCheck style={{ width: '14px', height: '14px', margin: 'auto' }} />
            </div>
            <div>
              <span style={{ fontWeight: 700 }}>{t('designationLabel')}</span>
              <span style={{ fontSize: '11.5px', color: '#64748b', marginLeft: '6px' }}>{t('designationSub')}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px', fontSize: '13.5px', color: '#334155' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#fff0e6', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0, fontSize: '12px' }}>
              <MapPin style={{ width: '14px', height: '14px', margin: 'auto' }} />
            </div>
            <div>
              <span style={{ fontWeight: 700 }}>{member.area}, Mumbai</span>
              <span style={{ fontSize: '11.5px', color: '#64748b', marginLeft: '6px' }}>{t('areaSub')}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px', fontSize: '13.5px', color: '#334155' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#fff0e6', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0, fontSize: '12px' }}>
              <Phone style={{ width: '14px', height: '14px', margin: 'auto' }} />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>+91 {member.phone}</span>
              <span style={{ fontSize: '11.5px', color: '#64748b', marginLeft: '6px' }}>{t('phoneSub')}</span>
            </div>
          </div>

          {member.shop && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px', fontSize: '13.5px', color: '#334155' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#fff0e6', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0, fontSize: '12px' }}>
                <Building style={{ width: '14px', height: '14px', margin: 'auto' }} />
              </div>
              <div>
                <span style={{ fontWeight: 700 }}>{member.shop}</span>
                <span style={{ fontSize: '11.5px', color: '#64748b', marginLeft: '6px' }}>({member.work_type || t('shopSub')})</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', fontSize: '13.5px', color: '#334155' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#e6f4ea', color: '#1B4332', display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0, fontSize: '12px' }}>
              <Calendar style={{ width: '14px', height: '14px', margin: 'auto' }} />
            </div>
            <div>
              <span>{t('memberSinceLabel')} <strong style={{ color: '#0f172a' }}>{formatDate(joinedDate)}</strong></span>
              <span style={{ fontSize: '11.5px', color: '#64748b', marginLeft: '6px' }}>{t('joinDateSub')}</span>
            </div>
          </div>

          {/* Validity Box */}
          <div
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              borderRadius: '12px',
              border: '1.5px solid #86efac'
            }}
          >
            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>
              {t('validityHeader')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#166534', fontWeight: 500 }}>{t('fromLabel')}</div>
                <div>{formatDate(joinedDate)}</div>
              </div>
              <div style={{ color: '#16a34a', margin: '0 4px' }}>→</div>
              <div>
                <div style={{ fontSize: '10px', color: '#166534', fontWeight: 500 }}>{t('toLabel')}</div>
                <div>{formatDate(expiryDate)}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span style={{ background: '#166534', color: '#ffffff', padding: '3px 9px', borderRadius: '8px', fontSize: '11px', fontWeight: 800 }}>
                  {t('activeBadge')}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 4. FOOTER WITH QR (Dark Green Gradient) ─────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1B4332 0%, #163d2a 100%)',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#ffffff',
          gap: '20px'
        }}
      >
        <div style={{ background: '#ffffff', padding: '8px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
          <QRCodeCanvas value={verifyUrl} size={74} level="M" />
          <div style={{ fontSize: '8.5px', color: '#64748b', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>
            {t('scanToVerify')}<br />{t('scanToVerifySub')}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.85)', marginBottom: '5px', fontWeight: 600 }}>
            <span>{t('joinedLabel')} {formatDate(joinedDate)}</span>
            <span>{t('expiresLabel')} {formatDate(expiryDate)}</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', height: '8px', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)', height: '100%', width: '100%', borderRadius: '20px' }}></div>
          </div>

          <div style={{ marginTop: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.7)' }}>{t('annualSubLabel')}</div>
            <div style={{ fontSize: '14px', color: '#FFD700', fontWeight: 900, marginTop: '1px' }}>
              {t('feePaidLabel')}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.9)', flexShrink: 0 }}>
          <div style={{ fontSize: '20px', color: '#FFD700', marginBottom: '2px' }}>📱</div>
          <div style={{ fontSize: '12px', fontWeight: 800 }}>{t('scanToVerify')}</div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>{t('issuedBySub')}</div>
          <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.6)', marginTop: '3px' }}>{t('issuedBy')}</div>
        </div>
      </div>

      {/* ── 5. PAYMENT RECEIPT SECTION ──────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 0.8fr 1.2fr 1fr',
          gap: '10px 14px',
          alignItems: 'end',
          padding: '14px 28px',
          background: '#f9f5f0',
          borderTop: '1px solid #e2e8f0',
          fontSize: '12px'
        }}
      >
        <div>
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>{t('receiptNoLabel')}</span>
          <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
            {member.receipt_no || 'RCT-2026-001'}
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>{t('paidOnLabel')}</span>
          <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
            {formatDate(joinedDate)}
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>{t('payModeLabel')}</span>
          <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>UPI</span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>{t('upiRefLabel')}</span>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
            {member.txn_ref || '440291144468'}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>{t('subPaidLabel')}</span>
          <span style={{ display: 'block', fontSize: '20px', fontWeight: 900, color: '#1B4332', lineHeight: 1 }}>
            ₹100
          </span>
        </div>
      </div>

      {/* ── 6. ADVERTISING (IMAGES ONLY, NO DETAILS - REQUESTED) ───── */}
      {passAds.length > 0 && (
        <div style={{ padding: '12px 28px 16px', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            {t('adHeader')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: passAds.length > 1 ? '1fr 1fr' : '1fr', gap: '12px' }}>
            {passAds.map(ad => (
              <div
                key={ad.id}
                onClick={() => handleAdClick(ad)}
                style={{
                  height: '74px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  position: 'relative',
                  backgroundColor: '#f8fafc'
                }}
                title={ad.phone ? `Click to call: +91 ${ad.phone}` : 'Click to visit'}
              >
                {ad.image_url ? (
                  <img
                    src={ad.image_url}
                    alt={ad.title || 'Advertisement'}
                    crossOrigin="anonymous"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fff0e6, #ffd0b0)', color: '#FF6B35', fontWeight: 800, fontSize: '13px' }}>
                    📢 {lang === 'mr' && ad.description_mr ? ad.description_mr : ad.title} (Call: {ad.phone})
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card Bottom Note */}
      <div style={{ padding: '8px 28px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', fontSize: '9.5px', color: '#94a3b8', textAlign: 'center' }}>
        {t('cardBottomNote')}
      </div>

    </div>
  );
}
