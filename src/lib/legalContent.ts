/**
 * Complete Drafts of all 14 Legal, Safety and Compliance Documents for NyumbaGO
 * Governing Law: Laws of the Republic of Kenya (Kenya Data Protection Act, 2019)
 * Format: Plain language, top summary card, last updated, version number, Swahili summary.
 * Placeholders: [LEGAL ENTITY NAME], [REGISTERED ADDRESS], [SUPPORT EMAIL], [PHONE], [ODPC REGISTRATION NUMBER]
 */

import { LegalDocument } from '../types';

export const INITIAL_LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'terms-of-service',
    type: 'terms_of_service',
    version: '1.0.0',
    title: 'Terms of Service',
    title_sw: 'Masharti ya Huduma',
    effective_date: '2026-10-27',
    is_current: true,
    requires_reconsent: false,
    updated_at: '2026-10-27T00:00:00Z',
    summary_en:
      'NyumbaGO is an online search and discovery marketplace connecting house hunters with landlords and property agents. NyumbaGO is NOT a party to any tenancy agreement, is not a landlord, and does not guarantee listing availability or lease terms. You must be at least 18 years old to create an account. All disputes are resolved under Kenyan law (negotiation first, then mediation in Nairobi, then Kenyan courts).',
    summary_sw:
      'NyumbaGO ni jukwaa la mtandaoni linalowaunganisha wanaotafuta nyumba na wamiliki wa nyumba au mawakala. NyumbaGO SI sehemu ya mkataba wowote wa upangaji, si mwenye nyumba, na haihakikishii upatikanaji wa nyumba. Ni lazima uwe na miaka 18 au zaidi kufungua akaunti. Migogoro yote hutatuliwa chini ya sheria za Kenya.',
    content: `## 1. What NyumbaGO Is and Is Not
NyumbaGO is an online property search and rental discovery platform operated by [LEGAL ENTITY NAME] ("we", "us", or "our"), incorporated under the laws of Kenya, with registered offices at [REGISTERED ADDRESS]. 

NyumbaGO connects prospective tenants ("Hunters"), property owners ("Landlords"), and certified real estate agents ("Agents"). 

**IMPORTANT CLARIFICATIONS:**
* NyumbaGO is **not a party** to any rental contract, tenancy agreement, lease, or sublease. Any rental transaction is solely between the Hunter and the Landlord or their authorized Agent.
* NyumbaGO is **not an estate agent, property manager, broker, or landlord**, unless explicitly licensed as such.
* NyumbaGO does not inspect, guarantee, warrant, or verify the continuous physical condition, habitable status, safety, or legal ownership of properties listed on the platform, except through documented "Verified Nyumba" checks.
* NyumbaGO provides an interactive embed viewer for 360° virtual tours hosted on Viewora (viewora.software). NyumbaGO does not host or own Viewora media files.

## 2. Eligibility & 18+ Age Restriction
You must be at least **18 years of age** and possess the full legal capacity to enter into binding contracts under the Laws of Kenya to register an account on NyumbaGO. Any account discovered to belong to an individual under 18 will be terminated immediately and associated personal data erased in compliance with the Kenya Data Protection Act, 2019.

## 3. Account Creation & Security
* You agree to provide accurate, current, and verifiable contact details during registration.
* You are solely responsible for maintaining the confidentiality of your login credentials and two-factor authentication tokens.
* You must notify us immediately at [SUPPORT EMAIL] if you suspect any unauthorized access to your account.

## 4. User Roles and Duties
* **Hunters:** Must provide genuine contact details, engage respectfully with Landlords/Agents, attend scheduled viewings promptly or cancel in advance, and report suspicious or fraudulent listings.
* **Landlords:** Must confirm legal ownership or lawful authority to lease the property, disclose full KSh pricing and mandatory deposits, maintain active listings, and refrain from charging prospective tenants viewing fees through NyumbaGO.
* **Property Agents:** Must hold written authority from the registered property owner and possess relevant professional accreditation under Kenyan law.

## 5. Prohibited Conduct
Users must not:
* Post fraudulent, misleading, duplicate, or phantom listings.
* Solicit advance deposits or viewing fees before an in-person walkthrough and identity verification.
* Discriminate against prospective tenants based on race, tribe, ethnic origin, gender, marital status, religion, nationality, refugee status, or disability.
* Scrape, reverse engineer, or harvest user data from NyumbaGO without written consent.

## 6. 360° Tours and Content Rights
* When Landlords or Agents add Viewora 360° virtual tour URLs, they represent and warrant that they possess all lawful rights, permissions, and licenses to display the interior and exterior of the premises.
* You grant NyumbaGO a non-exclusive, royalty-free, worldwide license to display and distribute your listing photos, text descriptions, and embedded Viewora tour links to prospective tenants.

## 7. Fees and Payments
Searching, bookmarking, and requesting viewings on NyumbaGO is currently free for Hunters. Any optional paid premium services for Landlords/Agents are governed by our Payments and Refund Policy.

## 8. Limitation of Liability & Disclaimers
To the maximum extent permitted by the Laws of Kenya, NyumbaGO is provided on an "as is" and "as available" basis. We disclaim all implied warranties of merchantability, fitness for purpose, and title. We are not liable for direct, indirect, or consequential damages arising from tenancy disputes, rent defaults, property damage, or misrepresentations by third parties.

## 9. Dispute Resolution
In the event of any controversy arising out of these Terms:
1. **Direct Negotiation:** The parties shall first attempt to resolve the issue informally within fourteen (14) days.
2. **Mediation:** If unresolved, the dispute shall be referred to mediation in Nairobi under the Nairobi Centre for International Arbitration (NCIA) mediation rules.
3. **Kenyan Courts:** Failing mediation, the dispute shall be subject to the exclusive jurisdiction of the Courts of Kenya.

## 10. Amendments & Contact
We may update these Terms from time to time. When material changes occur, you will be notified upon your next login and required to re-accept before continuing.
* **Legal Entity:** [LEGAL ENTITY NAME]
* **Registered Address:** [REGISTERED ADDRESS]
* **Support Email:** [SUPPORT EMAIL]
* **Phone:** [PHONE]
* **ODPC Registration Number:** [ODPC REGISTRATION NUMBER]`,
  },
  {
    id: 'privacy-policy',
    type: 'privacy_policy',
    version: '1.0.0',
    title: 'Privacy Policy',
    title_sw: 'Sera ya Faragha',
    effective_date: '2026-10-27',
    is_current: true,
    requires_reconsent: false,
    updated_at: '2026-10-27T00:00:00Z',
    summary_en:
      'NyumbaGO is registered with the Office of the Data Protection Commissioner (ODPC) under the Kenya Data Protection Act, 2019. We collect minimal personal data (name, verified adult age status, phone, email, saved homes, and tour viewing telemetry). We never store your full date of birth after age verification, and we never store raw IP addresses in plain text. You have the right to access, download, correct, or delete your data at any time.',
    summary_sw:
      'NyumbaGO imesajiliwa na Ofisi ya Kamishna wa Kulinda Data (ODPC) chini ya Sheria ya Kulinda Data ya Kenya, 2019. Tunakusanya data ya chini kabisa (jina, uthibitisho wa umri wa miaka 18+, nambari ya simu, barua pepe, na nyumba zilizohifadhiwa). Hatuhifadhi tarehe kamili ya kuzaliwa baada ya uthibitisho, na hatuhifadhi anwani ghafi za IP. Una haki ya kupakua, kurekebisha, au kufuta data yako wakati wowote.',
    content: `## 1. Who We Are
[LEGAL ENTITY NAME] ("we", "us") operates NyumbaGO. We act as the Data Controller in respect of user accounts, consents, and listings, and as a Data Processor when facilitating viewing inquiries to Landlords.
* **Registered Office:** [REGISTERED ADDRESS]
* **Data Protection Officer / Support Email:** [SUPPORT EMAIL]
* **Telephone:** [PHONE]
* **ODPC Registration Number:** [ODPC REGISTRATION NUMBER]

## 2. Principles of Data Protection
In compliance with Section 3 of the Kenya Data Protection Act, 2019 (KDPA), we process personal data lawfully, fairly, and transparently; collect it only for explicit and legitimate purposes; minimize data collection; maintain accuracy; limit storage periods; and enforce technical security safeguards.

## 3. What Data We Collect and Lawful Basis
* **Account Registration:** Full name, email address, phone number (for OTP verification), user role. *Lawful Basis: Performance of contract (KDPA Sec. 30(1)(b)).*
* **Age Verification:** During signup, you enter your date of birth to prove you are 18 or older. **We do NOT store your date of birth.** We store only a boolean flag (\`age_verified = true\`) and verification timestamp (\`age_verified_at\`). Minors under 18 are rejected immediately without data retention. *Lawful Basis: Legal obligation and contractual capacity.*
* **Viewing Requests:** Name, phone number, preferred visit date/time, and whether you toured online. This data is transferred to the listing Landlord/Agent to fulfill your viewing request. *Lawful Basis: User consent & performance of contract.*
* **Consents & Security:** Salted SHA-256 IP hash (never plain-text IP), consent history, and session timestamps. *Lawful Basis: Legal compliance & security auditing.*
* **360° Tour Telemetry:** Aggregated counts of tour starts and fallback occurrences tied to random session IDs. No biometric, audio, or facial recognition data is captured. *Lawful Basis: Legitimate interest in platform reliability.*

## 4. Cross-Border Data Transfers & Server Locations
NyumbaGO utilizes cloud hosting infrastructure provided by Supabase and European cloud zones adhering to KDPA Section 48 & 49 transfer adequacy requirements. All transfers utilize TLS 1.3 encryption in transit and AES-256 encryption at rest.

## 5. Data Retention Schedule
* **Active User Accounts:** Kept until deletion is requested.
* **Viewing Requests:** Retained for 90 days after request fulfillment, then anonymized.
* **Tour Telemetry Logs:** Retained for 60 days in rotating partitions.
* **Account Deletion:** Processed within 30 days of confirmation; audit-required financial or dispute logs kept up to statutory limitation periods.

## 6. Your Data Subject Rights under KDPA 2019
Under Section 26 of the KDPA, you have the right to:
1. **Be Informed:** Know how your data is collected and used.
2. **Access & Download:** Request a copy of your personal data in machine-readable JSON format via our "Download My Data" feature.
3. **Rectification:** Correct inaccurate or outdated details in your profile settings.
4. **Erasure ("Right to be Forgotten"):** Request complete deletion of your account and personal data.
5. **Withdraw Consent:** Revoke marketing or location permissions at any time via Settings.

## 7. Complaints and the ODPC
If you have concerns about how we handle your personal data, please contact our Data Protection Officer at [SUPPORT EMAIL]. If your grievance is not resolved satisfactorily, you have the statutory right to lodge a complaint with the Office of the Data Protection Commissioner of Kenya (ODPC):
* **Website:** www.odpc.go.ke
* **Email:** complaints@odpc.go.ke
* **Address:** 12th Floor, Britam Tower, Hospital Road, Upper Hill, Nairobi.`,
  },
  {
    id: 'cookie-policy',
    type: 'cookie_policy',
    version: '1.0.0',
    title: 'Cookie and Tracking Policy',
    title_sw: 'Sera ya Vidakuzi (Cookies) na Ufuatiliaji',
    effective_date: '2026-10-27',
    is_current: true,
    requires_reconsent: false,
    updated_at: '2026-10-27T00:00:00Z',
    summary_en:
      'We use strictly essential cookies to keep you logged in and remember your language preference. Non-essential analytics cookies and 360° tour telemetry require your prior opt-in consent. You can reject non-essential cookies at any time.',
    summary_sw:
      'Tunatumia vidakuzi muhimu pekee ili kukuweka umeingia kwenye akaunti na kukumbuka lugha unayopendelea. Vidakuzi visivyo vya lazima vya takwimu na ziara za 360° vinahitaji idhini yako ya awali.',
    content: `## 1. What Are Cookies?
Cookies are small text files placed on your device to enable website functionality and analyze usage patterns.

## 2. Categories of Cookies We Use
* **Strictly Necessary Cookies:** Essential for core security, session authentication, and language preference (EN/SW). These cannot be turned off.
* **Functional & Preference Cookies:** Save your filter presets and shortlisted comparison homes.
* **Analytics & Performance Cookies:** Measure load speed and 360° tour embed responsiveness. Loaded **only after you grant explicit consent**.

## 3. How to Manage Your Choices
Our Cookie Consent Banner gives you equal buttons to "Accept All", "Reject Non-Essential", or "Manage Choices". You can adjust these settings at any time in your Privacy & Consent settings.`,
  },
  {
    id: 'acceptable-use',
    type: 'acceptable_use',
    version: '1.0.0',
    title: 'Acceptable Use and Community Guidelines',
    title_sw: 'Mwongozo wa Matumizi Yanayokubalika na Jumuiya',
    effective_date: '2026-10-27',
    is_current: true,
    requires_reconsent: false,
    updated_at: '2026-10-27T00:00:00Z',
    summary_en:
      'All users must interact with honesty and respect. No harassment, extortion, discriminatory requirements, or fake listings. Violators will be banned and reported to relevant authorities.',
    summary_sw:
      'Watumiaji wote lazima watende kwa uaminifu na heshima. Hakuna unyanyasaji, utapeli, ubaguzi, au matangazo ya uwongo. Wanaokiuka watafungiwa akaunti.',
    content: `## 1. Core Community Standards
NyumbaGO strives to make rental house hunting in Kenya transparent, dignifying, and safe. All communications between Hunters, Landlords, and Agents must remain professional and free of harassment.

## 2. Unacceptable Activities
* **Fraud & Financial Extortion:** Requesting non-refundable "booking fees" or deposits without letting the tenant inspect the property in person.
* **Impersonation:** Pretending to be a property owner, caretaker, or registered agent without valid mandate.
* **Discriminatory Postings:** Refusing to rent based on ethnicity, religion, nationality, or family composition.
* **Spam & Flooding:** Posting identical units across multiple neighborhoods or sending mass automated inquiries.`,
  },
  {
    id: 'listing-policy',
    type: 'listing_policy',
    version: '1.0.0',
    title: 'Listing and Content Policy',
    title_sw: 'Sera ya Matangazo na Maudhui',
    effective_date: '2026-10-27',
    is_current: true,
    requires_reconsent: false,
    updated_at: '2026-10-27T00:00:00Z',
    summary_en:
      'Listings must reflect genuine, currently available rental units in Kenya. Prices must be accurately stated in Kenyan Shillings (KSh) with all service charges disclosed. Photos and 360° tours must represent the actual premises.',
    summary_sw:
      'Matangazo lazima yawe ya nyumba halisi zinazopatikana Kenya. Bei lazima iwe kwa Shilingi ya Kenya (KSh) ikijumuisha gharama zote. Picha na ziara za 360° lazima zionyeshe nyumba halisi.',
    content: `## 1. Accuracy of Listings
Every listing published on NyumbaGO must represent a real, habitable, and currently vacant or soon-to-be-vacant property located within Kenya.

## 2. Transparent Pricing in KSh
* Rent must be displayed in **Kenyan Shillings (KSh)** per month.
* Mandatory charges (such as security deposit, water, garbage collection, and service charge) must be disclosed transparently in the description.
* Artificial "bait-and-switch" pricing is strictly prohibited.

## 3. Freshness Reconfirmation (14-Day Cycle)
Landlords must reconfirm listing availability every **14 days**. Listings that are not reconfirmed will be automatically marked as stale and hidden from public search until re-verified.

## 4. 360° Virtual Tour Rules
* Uploaded Viewora tour links must showcase the exact unit being advertised.
* Uploaders must hold all rights and permissions to film and showcase the property interior.`,
  },
  {
    id: 'landlord-agent-terms',
    type: 'landlord_agent_terms',
    version: '1.0.0',
    title: 'Landlord and Agent Terms',
    title_sw: 'Masharti ya Wamiliki wa Nyumba na Mawakala',
    effective_date: '2026-10-27',
    is_current: true,
    requires_reconsent: false,
    updated_at: '2026-10-27T00:00:00Z',
    summary_en:
      'Landlords and agents confirm legal authority to rent out the property. Agents confirm written mandates from owners. Landlords are strictly prohibited from demanding viewing fees through NyumbaGO requests.',
    summary_sw:
      'Wamiliki na mawakala wanathibitisha kuwa na mamlaka ya kisheria ya kupangisha nyumba. Mawakala wanathibitisha kuwa na mkataba wa maandishi. Ni marufuku kutoza ada ya kutazama nyumba.',
    content: `## 1. Authority to Rent
By listing a property on NyumbaGO, you represent and warrant that:
* You are the registered legal owner of the property, OR
* You are an authorized Agent holding an explicit, written agency mandate from the registered owner.

## 2. Prohibition on Viewing Fees
**Under no circumstances may a Landlord or Agent charge a prospective tenant a "viewing fee", "facilitation fee", or "gate pass" to view a property scheduled through NyumbaGO.** Any Landlord or Agent found violating this rule will face permanent suspension and forfeiture of verified status.

## 3. Response Duties
Landlords must respond to viewing inquiries within forty-eight (48) hours. Failure to respond will negatively impact your listing ranking.`,
  },
  {
    id: 'hunter-terms',
    type: 'hunter_terms',
    version: '1.0.0',
    title: 'Hunter Terms (Tenants)',
    title_sw: 'Masharti ya Wapangaji (Hunters)',
    effective_date: '2026-10-27',
    is_current: true,
    requires_reconsent: false,
    updated_at: '2026-10-27T00:00:00Z',
    summary_en:
      'Hunters must provide accurate contact details, respect viewing appointment times, and conduct their own due diligence before entering into any tenancy agreement or making payments.',
    summary_sw:
      'Wapangaji lazima watoe taarifa sahihi za mawasiliano, wazingatie muda wa miadi ya kutembelea nyumba, na wafanye uchunguzi wao kabla ya kulipa.',
    content: `## 1. Accurate Details & Serious Inquiries
When booking a viewing, you agree to provide an active Kenyan telephone number and genuine name. If you select "I toured online, I am ready to view in person", you confirm that you have explored the 360° virtual tour and are in a position to proceed with tenancy if the premises match your expectations.

## 2. Safety & Diligence
Never pay money (rent or deposit) via M-Pesa or bank transfer to any individual until you have:
1. Conducted an in-person walkthrough of the property.
2. Verified the identity of the Landlord or their authorized Agent.
3. Received and reviewed a written tenancy agreement.`,
  },
  {
    id: 'safety-anti-fraud',
    type: 'safety_anti_fraud',
    version: '1.0.0',
    title: 'Safety and Anti-Fraud Guide',
    title_sw: 'Mwongozo wa Usalama na Kuzuia Utapeli',
    effective_date: '2026-10-27',
    is_current: true,
    requires_reconsent: false,
    updated_at: '2026-10-27T00:00:00Z',
    summary_en:
      'NEVER pay a deposit or rent before viewing the home in person and confirming the rightful owner. Learn how to spot fake rental listings and report suspicious landlords immediately.',
    summary_sw:
      'USILIPIE amana au kodi kabla ya kuona nyumba ana kwa ana na kumthibitisha mmiliki halali. Jifunze jinsi ya kutambua matangazo ya utapeli na kutoa ripoti mara moja.',
    content: `## Golden Rule of House Hunting in Kenya
**NEVER SEND MONEY (DEPOSIT, RENT, OR VIEWING FEE) TO ANYONE BEFORE YOU MEET THEM AT THE HOUSE, WALK INSIDE, AND CONFIRM THEIR RIGHTFUL OWNERSHIP.**

## Common Rental Scams to Watch Out For:
1. **The "Too Good to be True" Bargain:** A 2-bedroom apartment in Kilimani listed for KSh 15,000 when the market rate is KSh 50,000.
2. **The "Absent Landlord / Urgent Deposit" Scam:** The person claiming to be the owner says they are out of the country (e.g. Mombasa, London) and asks you to send a commitment deposit via M-Pesa to "hold the keys".
3. **The Fake Caretaker Viewing Fee:** A stranger demands KSh 1,000 over M-Pesa to show you the house.
4. **Watermarked Stolen Photos:** Images copied from hotel websites or luxury blogs.

## How to Report
Click the "Report this Listing" button on any listing or contact our Trust & Safety desk at [SUPPORT EMAIL].`,
  },
  {
    id: 'payments-refunds',
    type: 'payments_refunds',
    version: '1.0.0',
    title: 'Payments and Refund Policy',
    title_sw: 'Sera ya Malipo na Marejesho',
    effective_date: '2026-10-27',
    is_current: true,
    requires_reconsent: false,
    updated_at: '2026-10-27T00:00:00Z',
    summary_en:
      'Paid features (such as featured listings or capture referrals) are processed exclusively through licensed providers (e.g. Safaricom M-Pesa, card acquirers). NyumbaGO NEVER stores credit card numbers or M-Pesa PINs.',
    summary_sw:
      'Huduma za kulipia huchakatwa kupitia watoa huduma walioidhinishwa (kama vile Safaricom M-Pesa). NyumbaGO HAINA na HAITAHIFADHI kamwe nambari za kadi au PIN za M-Pesa.',
    content: `## 1. Scope & Status
*(This policy is shown only when paid features or premium listings are enabled via the payments_enabled configuration flag).*

## 2. Licensed Kenyan Payment Gateways
All payments for premium landlord services or Viewora photography bookings are processed through Central Bank of Kenya (CBK) licensed payment service providers, including Safaricom M-Pesa and PCI-DSS compliant payment gateways.

## 3. Zero PIN / Card Storage
**NyumbaGO does not collect, receive, or store your M-Pesa PIN, card CVV/CVC, or bank account credentials.** All payment sessions are conducted inside secure provider iframes or via USSD push prompts to your handset.

## 4. Refund Policy
* **Listing Promotions:** Non-refundable once the promotion period begins.
* **Photography Shoot Bookings:** Full refund if cancelled at least 24 hours prior to the scheduled shoot date.`,
  },
  {
    id: 'copyright-takedown',
    type: 'copyright_takedown',
    version: '1.0.0',
    title: 'Copyright and Takedown Policy',
    title_sw: 'Sera ya Hakimiliki na Uondoaji wa Maudhui',
    effective_date: '2026-10-27',
    is_current: true,
    requires_reconsent: false,
    updated_at: '2026-10-27T00:00:00Z',
    summary_en:
      'We respect intellectual property rights under the Kenya Copyright Act. Property owners and photographers can report unauthorized use of photos or tours for rapid takedown.',
    summary_sw:
      'Tunaheshimu haki miliki chini ya Sheria ya Hakimiliki ya Kenya. Wamiliki wa nyumba na wapiga picha wanaweza kuripoti picha au ziara zilizotumiwa bila idhini kwa uondoaji wa haraka.',
    content: `## 1. Notice and Takedown Procedure
If you believe that your copyrighted photographs, architectural renderings, or 360° virtual tours have been uploaded to NyumbaGO without your consent, you may submit a Notice of Copyright Infringement to our designated agent at [SUPPORT EMAIL].

## 2. Required Information in Notice:
1. Identification of the copyrighted work claimed to have been infringed.
2. The URL or Listing ID of the infringing material on NyumbaGO.
3. Your full legal name, physical address, phone number, and email.
4. A statement affirming your good-faith belief that use of the material is unauthorized.

## 3. Counter-Notice:
The uploader may submit a counter-notice within seven (7) business days providing evidence of lawful ownership or license.`,
  },
  {
    id: 'complaints-disputes',
    type: 'complaints_disputes',
    version: '1.0.0',
    title: 'Complaints and Disputes Policy',
    title_sw: 'Sera ya Malalamishi na Migogoro',
    effective_date: '2026-10-27',
    is_current: true,
    requires_reconsent: false,
    updated_at: '2026-10-27T00:00:00Z',
    summary_en:
      'We take user grievances seriously. Formal complaints are acknowledged within 24 hours and investigated within 5 business days with defined resolution targets.',
    summary_sw:
      'Tunachukulia malalamiko ya watumiaji kwa uzito mkubwa. Malalamishi hutambuliwa ndani ya saa 24 na kuchunguzwa ndani ya siku 5 za kazi.',
    content: `## 1. How to File a Complaint
Send an email to [SUPPORT EMAIL] or use the in-app "Report an Issue" form describing the incident, listing ID, and parties involved.

## 2. Response Timelines:
* **Acknowledgment:** Within 24 hours.
* **Initial Assessment & Safety Actions (e.g. hiding flagged listing):** Within 4 hours for suspected fraud.
* **Formal Written Resolution:** Within 5 business days.`,
  },
  {
    id: 'accessibility-statement',
    type: 'accessibility_statement',
    version: '1.0.0',
    title: 'Accessibility Statement',
    title_sw: 'Taarifa ya Ufikiaji (Accessibility)',
    effective_date: '2026-10-27',
    is_current: true,
    requires_reconsent: false,
    updated_at: '2026-10-27T00:00:00Z',
    summary_en:
      'NyumbaGO is committed to ensuring digital accessibility for persons with disabilities, aligning with WCAG 2.1 Level AA and Kenyan Persons with Disabilities Act standards.',
    summary_sw:
      'NyumbaGO imejitolea kuhakikisha ufikiaji wa kidijitali kwa watu wenye ulemavu kulingana na viwango vya WCAG 2.1 Level AA na sheria za Kenya.',
    content: `## 1. Our Commitment
NyumbaGO strives to ensure our website and rental discovery services are accessible to all Kenyans, including individuals using screen readers, keyboard-only navigation, and high-contrast viewports.

## 2. Accessible Features:
* ARIA accessibility labels on all interactive controls and 360° tour buttons.
* Alt text descriptions on listing posters and property imagery.
* Text-based fallback links for browsers or assistive devices unable to run WebGL 360° panoramas.`,
  },
  {
    id: 'open-source-notices',
    type: 'open_source_notices',
    version: '1.0.0',
    title: 'Open Source Notices',
    title_sw: 'Taarifa za Programu Huria (Open Source)',
    effective_date: '2026-10-27',
    is_current: true,
    requires_reconsent: false,
    updated_at: '2026-10-27T00:00:00Z',
    summary_en:
      'NyumbaGO is built using open-source libraries including React, Tailwind CSS, Lucide icons, and Supabase client libraries under MIT and Apache-2.0 licenses.',
    summary_sw:
      'NyumbaGO imejengwa kwa kutumia programu huria ikiwemo React, Tailwind CSS, na maktaba za Supabase chini ya leseni za MIT na Apache-2.0.',
    content: `## Open Source Software Acknowledgements
NyumbaGO incorporates open-source components under respective permissive licenses:
* **React & React DOM:** MIT License, Copyright (c) Meta Platforms, Inc.
* **Lucide Icons:** ISC License, Copyright (c) Lucide Contributors.
* **Tailwind CSS:** MIT License, Copyright (c) Tailwind Labs, Inc.
* **Supabase JS Client:** MIT License, Copyright (c) Supabase, Inc.`,
  },
  {
    id: 'about-contact',
    type: 'about_contact',
    version: '1.0.0',
    title: 'About NyumbaGO & Contact Details',
    title_sw: 'Kuhusu NyumbaGO & Mawasiliano',
    effective_date: '2026-10-27',
    is_current: true,
    requires_reconsent: false,
    updated_at: '2026-10-27T00:00:00Z',
    summary_en:
      'NyumbaGO is Kenya’s premier budget-first rental platform, bringing transparency to house hunting through interactive Viewora 360° virtual tours.',
    summary_sw:
      'NyumbaGO ni jukwaa la kwanza nchini Kenya la kutafuta nyumba kwa bajeti na kuona ziara za 360° Viewora.',
    content: `## About NyumbaGO
NyumbaGO was founded in Kenya to solve the friction, hidden fees, and exhaustion associated with traditional rental house hunting. By combining KSh budget-first search with immersive 360° virtual tours powered by Viewora, we allow tenants to inspect properties online before traveling.

## Company Details:
* **Legal Entity Name:** [LEGAL ENTITY NAME]
* **Registered Address:** [REGISTERED ADDRESS]
* **Customer Support & Data Inquiries:** [SUPPORT EMAIL]
* **Telephone / WhatsApp:** [PHONE]
* **ODPC Data Controller Reg No:** [ODPC REGISTRATION NUMBER]
* **Operating Hours:** Monday – Friday, 8:00 AM – 5:00 PM EAT.`,
  },
];
