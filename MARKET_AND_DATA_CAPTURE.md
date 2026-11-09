# Market & Data Capture Research

*Research current to November 2026. Time-sensitive facts carry dates. Items marked **(unverified)** could not be confirmed from an official source.*

## Summary

- **No automatic bank or wallet feed is possible today.** The State Bank of Pakistan (SBP) released *draft* Open Banking Regulations on 30 October 2026, with comments due 30 November 2026 [1][2][3]. Until those rules are final and licensed providers exist, a third-party app cannot pull transactions legally. Plan on 12–24 months of manual entry plus imports the user starts themselves.
- **The no-SMS decision is sound.** Google Play allows SMS reading for budgeting apps only as a *temporary* exception, and only when it is core functionality with no alternative [8]. iOS doesn't allow it at all. Skipping it avoids review and removal risk and gives the same experience on both platforms.
- **Android is about 93% of the market** (iOS about 7%, StatCounter, May 2026) [9]. Android-first testing is correct.
- **Cash still matters a lot.** Digital channels handled 92% of formal retail payments by count in FY26 [11][12]. By value, digital was only about 40% (PKR 68 trillion of 168.8 trillion in Q3 FY26), and informal cash isn't counted at all [5]. Fast manual entry stays the core feature.
- **The family layer is the clearest gap.** That means parent-held child balances, Eidi by occasion, shared goals and teen logins. No competitor found offers all of these together.
- **Pakistan has no data-protection law in force yet.** The Personal Data Protection Bill is still a draft as of October 2026 [13][14][15]. Design to its likely requirements anyway.

---

## 1. Getting transactions in without reading SMS

### 1.1 Open banking and aggregators

| Item | Status (November 2026) | What it means for us |
| --- | --- | --- |
| SBP Regulatory Sandbox | Guidelines May 2025. Three open-banking firms shortlisted on 6 January 2026: Neem, Digi Khata, Swich Retail [2] | Possible future partners. None offers a public data API today |
| Draft Open Banking Regulations 2026 | Released 30 October 2026, comments until 30 November 2026 [1][3][5] | Banks, microfinance banks *and* e-money institutions (wallets) would expose balances and history to authorised third parties through APIs, with Raast as the hub. Consent sets purpose, duration and limits. Third parties may not store passwords or PINs. Data would stay in Pakistan [3] |
| Licensing | The draft refers to "authorised" third-party providers [3] | Partner with a licensed provider rather than becoming one (our inference) |
| Plaid, Salt Edge, Tink, Finverse | No evidence they cover Pakistani banks **(unverified)** | Not an option today |
| India's Account Aggregator (comparison) | Over 500 million consents and 310 million linked accounts by September 2026 [16][17][18] | Shows where Pakistan may go. Even in India, budgeting apps reach this data through regulated partners |

One site says the Pakistani framework was "officially rolled out" [4]. That conflicts with SBP's live consultation, so treat it as unreliable.

### 1.2 Statement import (PDF/CSV)

| Provider | Download | Format | History | Source |
| --- | --- | --- | --- | --- |
| NayaPay | In app | PDF or CSV | **Unverified** | [20] |
| UBL | App and Netbanking (can email) | App: PDF. Older portal: CSV | User-chosen range | [21][22][23] |
| Allied Bank (myABL) | App and web | PDF and CSV (2020 guide) | Up to about 1 year | [24][25][26] |
| MCB Live | App and web | Not stated for account statements | Up to 3 years | [27][28] |
| Bank Alfalah (Alfa) | App and web | Probably PDF **(unverified)** | App: download up to 3 years | [29][30] |
| Meezan | Internet banking, app | "Different formats" | **Unverified** | [31][32] |
| HBL Pakistan | App guide mentions "up to last 2-years of Account Statement" | **Unverified** | 2 years | [33][34][35] |
| SadaPay | In app (More → Documents) | Format not stated | From 1 July 2023 | [6] |
| Easypaisa | E-statement emailed to the user | PDF (from user uploads) | App shows 30 days | [7][36] |
| JazzCash | Not confirmed officially | PDF (from user uploads) **(unverified)** | **Unverified** | [37][38] |

How we'd handle these files:
- **CSV files:** one parser per bank's column layout.
- **Text-based PDFs:** a template per bank, checked against the running balance so no row is missed.
- **Password-protected PDFs:** ask for the password at import, decrypt in memory, and never store it. Don't assume a password convention, because none was confirmed. MCB card statements use the birth year [28], but that may not apply elsewhere.
- **Where parsing happens:** on the phone. Only normalised rows are sent to the server.
- **Where statements fit:** they arrive weekly or monthly, so they are a *reconciliation* tool, not a daily habit.
- **Effort:** about 1–2 developer-weeks per bank template, plus fixes when a layout changes (our estimate).

### 1.3 Email

| Approach | Effort | Privacy | Verdict |
| --- | --- | --- | --- |
| User shares a statement attachment from their mail app to ours | Low | Best | MVP, part of statement import |
| A personal forwarding address (e.g. `u123@in.app`) that parses forwarded statements and alerts | Low–medium, no Google review | We receive whole emails, so delete them after parsing | Phase 2 option |
| Gmail API reading | Google's restricted-scope verification (about 6 weeks) and a yearly paid security assessment (CASA), quoted at about $540–1,800 a year [40][41][42] | Highly sensitive | Avoid unless there is clear demand |

### 1.4 Capture started by the user

| Method | Android | iOS | Effort | Notes |
| --- | --- | --- | --- | --- |
| Paste and parse a confirmation or SMS the user copied | Yes | Yes | Low | No permission needed. Templates per provider |
| Share sheet (text, screenshot, PDF) | Share intent | Share extension (needs a native iOS target) | Medium | Main route for statements and screenshots |
| Home-screen widget | Yes | WidgetKit | Medium | Puts entry two taps away |
| App shortcuts (long-press the icon) | Yes | Quick Actions | Low | "Add cash expense", "Add Eidi" |
| Quick Settings tile | Yes | — | Low | Android only, worth it given about 93% share |
| iOS Shortcuts / Siri | — | App Intents | Medium | Later, since iOS is about 7% of users |
| One-line text entry ("chai 150 cash", "eidi Ali 1000") | Yes | Yes | Low–medium | English and Roman Urdu. Hysab Kytab already has a chatbot for adding entries [43], so this is expected |
| Voice entry | Speech to text | Apple Speech | Medium | On-device Urdu recognition **unverified**. Test before promising it |

### 1.5 Screenshot and receipt scanning (OCR)

- Google's on-device text recognition (ML Kit v2) supports Latin, Chinese, Devanagari, Japanese and Korean scripts. **It does not support Arabic script, so it can't read Urdu** [44][45][46].
- Apple Vision reportedly added Arabic in iOS 18 [49], but Urdu Nastaliq accuracy is **unverified**.
- Wallet and bank confirmation screenshots mostly use English labels and Latin digits, so Latin text recognition should extract the amount, transaction ID and date. Local paper receipts are unreliable.
- **Plan:** scanning payment-confirmation screenshots in Phase 2. Don't advertise Urdu receipt scanning.

### 1.6 Raast QR

Raast QR follows the EMVCo merchant-presented standard [50][52]. Static codes have no amount, while dynamic codes do. Merchant payments launched in December 2023 [53].

Scanning a merchant QR in our app could prefill the merchant name and category, and the amount for dynamic codes. But the user still pays in their bank app, so they would scan twice. **Phase 3, low priority.**

### 1.7 Keeping people logging

No published research was found on this, so these are product bets to measure:
- **Recurring entries and templates** for rent, fees, utilities, committee instalments and pocket money.
- **Favourites and "same as yesterday".**
- **An evening nudge** with a one-tap "Nothing today".
- **Family accountability**, such as a shared household wallet and parents seeing a child's logging.
- **Streaks and badges for children and teens.** Avoid shaming adults.
- **Reconciliation prompts:** "Your cash in the app is Rs 12,400. Still right?"

### 1.8 Partnerships

Pakistani banks already license budgeting tools. Hysab Kytab is embedded in HBL Mobile (since April 2021) [57][58] and in Bank of Punjab's app through Systems Limited [54]. A family and teen module is a credible offer to banks and wallets launching teen products (Phase 3+).

---

## 2. How SMS reading is done elsewhere (context only)

| Topic | Finding |
| --- | --- |
| Google Play policy | SMS permissions are limited to default SMS and phone apps, plus listed exceptions. "SMS-based money management" is a **temporary** exception, granted only if it is core functionality with no alternative. It needs a declaration form and review [8] |
| Spyware rule | Budgeting apps may not exfiltrate non-financial or personal SMS [8] |
| SMS Retriever / User Consent APIs | Built for one-time verification codes, not for reading transaction history [8][55] |
| Policy changes | Google keeps tightening these rules. For example, using the call log for phone-call verification stops being allowed from 27 January 2027 [8] |
| iOS | Third-party apps can't read SMS (general platform knowledge, not re-verified) |
| Pakistani example | **Hisab Kitab** (Android) offers optional SMS-based expense detection, processed on the phone [56] |
| Indian examples | Walnut/axio, CRED, Jupiter and similar apps are widely reported to parse SMS **(unverified)**. India is shifting to Account Aggregator [16] |
| Notification listener / accessibility | Not verified in this research. Check before relying on it |

**Why no-SMS is right for us:** no Play review risk, the same behaviour on iOS, no holding of highly sensitive messages (OTPs share the inbox), and "we never read your messages" builds trust when parents add children's data.

---

## 3. Competitors

| App | Platforms | Data entry | Family / kids | Urdu | Price | Gap vs our plan |
| --- | --- | --- | --- | --- | --- | --- |
| **Hysab Kytab** (Pakistan) | Android, iOS, in HBL and BOP apps | Manual, chatbot | "Events", lending; no child profiles found | English, Roman Urdu, Urdu | Free, deal-funded | No managed child profiles, Eidi or shared family goals [43][54][57] |
| **Hisab Kitab** (Pakistan) | Android | Manual plus optional SMS | Group/family finances | Not stated | Free plus Premium | Relies on SMS; no iOS listing found; no child wallets [56][59] |
| Bank and wallet built-in insights | Android, iOS | Automatic for one institution | None | Varies | Free | Single institution only; no cash; no combined view |
| **Splitwise** | Android, iOS, web | Manual | Groups for splitting | None found | Free with a daily cap (4 a day per its help centre, 3 in some reviews); Pro about $4.99 a month | Built for splitting, not budgeting [60][61][62][63] |
| Global budgeting apps (YNAB, Monarch, Wallet…) | Various | Manual, or bank sync without Pakistani banks | Limited | None found | Subscriptions in USD | No PKR workflows, Eidi, committees or Urdu |
| Kids' money apps (Greenlight, GoHenry, BusyKid) | Various | Their own debit cards | Strong | No | Subscription | Not available in Pakistan **(unverified)** |

**Our combination:** a cash-first family ledger, parent-held child balances, Eidi by occasion, shared goals with contributions, udhaar and committees, full Urdu right-to-left, and no SMS reading. No app found offers all of these together.

**The teen angle:** since April 2026, SBP lets 13–18-year-olds own and operate accounts and wallets independently, covering about 26 million teens [64][66]. Under the older 2023 rules, a minor's wallet was linked to a parent's wallet with a Rs 50,000 monthly limit. A newspaper column argues the new regime should be "supervised independence, not adult banking in a school uniform" [65], which matches our design. A child starts as a parent-held profile, moves to a teen login with parental visibility, and later links to the teen's own wallet once open banking exists.

---

## 4. Market context

| Indicator | Value | Date / source |
| --- | --- | --- |
| Broadband subscribers | 166.12 million, of which 161.71 million mobile | July 2026 [10] |
| Mobile subscriptions | 210.46 million | July 2026 [10] |
| Mobile OS share | Android 92.83%, iOS 7.03% | May 2026 [9] |
| Formal retail payments | 14.3 billion in FY26, 92% digital by count | SBP, October 2026 [11][12] |
| Branchless banking app users | 79.2 million → 99.1 million | FY26 [12] |
| Raast | 2,755 million payments in FY26 | SBP, as reported by Pakera [11] |
| Digital share by value | About 40% (Q3 FY26) | SBP, June 2026 [5] |
| Teens aged 13–18 | About 26 million | SBP, April 2026 [66] |
| Data protection | Bill not enacted; PECA 2016 (amended 2025) applies | October 2026 [13][14][15][67][68] |

**Willingness to pay** wasn't researched in depth. The Pakistani budgeting apps found are free or freemium, so assume low willingness to pay. Consider a low-priced family plan plus licensing to banks (our inference).

**Children's data:** no Pakistani law covers it specifically yet. Follow the Google Play Families and Apple Kids rules if we target children. Parents create child profiles without a child's email, and child views have no ads and no third-party tracking.

---

## 5. Recommendations

### Ranked data-capture plan (no SMS)

| Rank | Method | Phase |
| --- | --- | --- |
| 1 | Fast manual entry: amount keypad first, last-used defaults, templates, recurring entries, "same as yesterday", one-line parser in English and Roman Urdu | MVP |
| 2 | Home-screen widget, app shortcuts, Android Quick Settings tile | MVP |
| 3 | Paste and share parsing of JazzCash, Easypaisa, SadaPay, NayaPay and bank confirmations, on the phone | MVP |
| 4 | Statement import: CSV first (NayaPay, ABL, UBL), then PDF templates, with duplicate detection and reconciliation | CSV in MVP, PDF in Phase 2 |
| 5 | Evening nudge, family accountability, children's streaks | MVP |
| 6 | Scanning payment-confirmation screenshots (Latin text only) | Phase 2 |
| 7 | Personal forwarding email address | Phase 2 |
| 8 | Voice entry, after testing Urdu recognition | Phase 2–3 |
| 9 | Raast QR scan to log | Phase 3 |
| 10 | Open-banking feed through a licensed partner | 2027 or later |
| — | Gmail API | Avoid unless demand is proven |

### Lead with
1. "We never read your SMS or notifications."
2. The family ledger: parent-held child balances, Eidi by occasion, shared goals.
3. A teen mode aligned with SBP's April 2026 teen accounts.
4. Urdu (right-to-left) and Roman Urdu input from day one, with PKR-native categories (school fees, bills, committees, Zakat).
5. Offline-first with safe sync.

### Key risks
- **Logging fatigue (highest).** Measure 7-day and 30-day logging retention from the first beta.
- **Statement layouts change.** Make templates updatable and add a "report a bad import" option.
- **Regulation.** Final open-banking rules and the data-protection bill may require licensing or keeping data in Pakistan. Prefer hosting in Pakistan or with an SBP-compliant cloud provider.
- **Incumbents.** Banks with embedded budgeting tools could add family features.
- **Children's data.** Collect as little as possible.

---

## Caveats
- The open-banking regulations are a draft. Licensing, fees and timelines may change.
- JazzCash statements, HBL Pakistan's statement format and bank statement password rules were not confirmed from official sources.
- These were not verified: notification-listener policy, iOS message filters, the named Indian SMS apps, global kids' apps, Urdu speech recognition and Urdu OCR quality.
- Some SBP figures come from news outlets reporting on SBP documents.
- Effort estimates and retention tactics are judgement, not sourced findings.

---

## Sources

1. [SBP opens public consultation on draft open banking regulations (APP)](https://www.app.com.pk/business/sbp-opens-up-public-consultation-on-draft-open-banking-regulations-2/)
2. [SBP press release, 6 January 2026](https://www.sbp.org.pk/press/2026/Pr-06-Jan-2026.pdf)
3. [SBP proposes open banking rules (Investify)](https://www.investify.pk/news/100000159811/sbp-proposes-open-banking-rules-requiring-customer-authorised-data-sharing)
4. [SBP open banking framework (NextGen, claim treated as unreliable)](https://nextgen.pk/news/sbp-open-banking-framework-pakistan)
5. [State Bank eyes open banking ecosystem (Dawn)](https://www.dawn.com/news/2041333/state-bank-eyes-open-banking-ecosystem)
6. [SadaPay account statement help](https://help.sadapay.pk/en/articles/7907996-account-statement)
7. [Easypaisa FAQs](https://easypaisa.com.pk/faqs/)
8. [Google Play: SMS and Call Log permissions policy](https://support.google.com/googleplay/android-developer/answer/10208820?hl=en)
9. [StatCounter: mobile OS share in Pakistan](https://gs.statcounter.com/os-market-share/mobile/pakistan)
10. [Pakistan has over 16 crore broadband users (ProPakistani)](https://propakistani.pk/2026/11/02/pakistan-has-over-16-crore-broadband-internet-users/)
11. [Raast 2.76 billion payments in FY26 (Pakera)](https://pakera.pk/raast-2-76-billion-payments-fy26-sbp-payment-systems-review/)
12. [SBP retail digital payments FY26 (TechX)](https://techx.pk/sbp-retail-digital-payments-fy26-58-percent-growth/)
13. [Data protection law in Pakistan (PakCEC)](https://pakcec.com/data-protection-law-pakistan/)
14. [Data protection and PECA for businesses (Irfan Law)](https://irfanlaw.com/blog/data-protection-peca-businesses-pakistan.html)
15. [Data protection rules in Pakistan (Trubyte)](https://trubyte.io/data-protection-rules-in-pakistan/)
16. [Account Aggregator crosses 500 million consents (Sahamati)](https://sahamati.org.in/media-article/account-aggregator-crosses-500-million-consents-as-india-marks-5th-aa-foundation-day/)
17. [RBI SRO recognition for Account Aggregator (Sahamati)](https://sahamati.org.in/media-article/rbi-sro-recognition-account-aggregator-ecosystem/)
18. [Account Aggregator interoperability (MediaNama)](https://www.medianama.com/2026/10/223-sahamati-bg-mahesh-rbi-account-aggregator-interoperability/)
19. [State of Account Aggregator 2026 (CASParser)](https://casparser.in/blog/state-of-account-aggregator-2026/)
20. [NayaPay documents help](https://help.nayapay.com/article/251-how-can-i-view-my-documents-on-nayapay)
21. [UBL Digital App FAQs](https://www.ubldigital.com/UBL-Digital/UBL-Netbanking/FAQs/Digital-App-FAQs)
22. [UBL Netbanking: My Accounts](https://www.ubldigital.com/UBL-Digital/UBL-Netbanking/My-Accounts)
23. [UBL Online: download account statement](https://www.ublonline.com/faq_down_acount_state.aspx)
24. [myABL Wallet user manual](https://www.abl.com/wp-content/uploads/2023/01/myABL-Wallet-User-Manual-2021-1.pdf)
25. [ABL: how to read a bank statement](https://www.abl.com/how-to-read-bank-statement-pakistan/)
26. [myABL user guide, 2020](https://www.abl.com/wp-content/uploads/2023/04/myABL-User-Guide-3rd-June-2020.pdf)
27. [MCB Live FAQs](https://www.mcb.com.pk/faqs/mcb-live-faqs)
28. [MCB Live user guide](https://mcblive.com/public/user_guide.pdf)
29. [Bank Alfalah service request TATs 2025](https://bafblob.blob.core.windows.net/data/Bank-Alfalah-Service-Request-TATs-2025.pdf)
30. [Alfa app FAQs](https://bafblob.blob.core.windows.net/data/Alfa_FAQs.pdf)
31. [Meezan Bank: ways to bank](https://www.meezanbank.com/ways-to-bank/)
32. [Meezan app and digital (PakFinHub)](https://pakfinhub.com/banks/meezan-bank/app-digital.html)
33. [HBL UAE e-statement](https://www.hbl.com/personal-uae/e-services-uae/hbl-e-statement)
34. [HBL Premium ARF](https://www.hbl.com/assets/downloads/ARF_%E2%80%93_HBL_Premium.pdf)
35. [HBL Mobile](https://www.hbl.com/hblmobile)
36. [Easypaisa statement download (Pakera)](https://pakera.pk/easypaisa-statement-transaction-history-download/)
37. [Account e-statement sample (Scribd)](https://www.scribd.com/document/548495032/Account-E-Statement)
38. [JazzCash statement how-to (YouTube)](https://www.youtube.com/watch?v=8g0lDAS1fco)
39. [UBL statement converter (third party)](https://pdfbankstatementsconverter.com/pakistani-banks/ubl-bank-statement-converter/)
40. [Passing Google CASA Tier 2 (Orbis)](https://meetorbis.com/blog/how-we-passed-google-casa-tier-2-with-claude)
41. [Google CASA verification explained (AIEmaily)](https://aiemaily.com/blog/google-casa-verification-explained-for-buyers)
42. [Google OAuth verification and CASA (Agentic Fabriq)](https://www.agenticfabriq.com/blog/google-oauth-verification-casa)
43. [Hysab Kytab case study (MMAAVIA)](https://mmaavia.com/case-hysab-kytab.html)
44. [Google ML Kit Text Recognition v2](https://developers.google.com/ml-kit/vision/text-recognition/v2)
45. [ML Kit OCR on Android (DEV)](https://dev.to/prem_singh_1997/from-pixels-to-text-google-ml-kit-ocr-on-android-with-a-kmp-core-25kh)
46. [ML Kit Arabic support question (B4X forum)](https://www.b4x.com/android/forum/threads/textrecognition-based-on-mlkit-will-it-support-arabic.161926/)
47. [ML Kit language identification: supported languages](https://developers.google.com/ml-kit/language/identification/langid-support)
48. [ML Kit language identification on Android](https://developers.google.com/ml-kit/language/identification/android)
49. [Apple Vision Arabic OCR pull request (GitHub)](https://github.com/ahmedma2moun/Home-Expenses/pull/4)
50. [Raast QR implementation (GitHub)](https://github.com/Faizan-Shurjeel/raast-qr)
51. [SBP unified Raast QR standard (NextGen)](https://nextgen.pk/news/sbp-unified-raast-qr-standard-gcc-buna-cross-border-bridge-2026)
52. [EMVCo merchant-presented QR specification v1.1](https://mvallim.github.io/emv-qrcode/docs/EMVCo-Merchant-Presented-QR-Specification-v1.1.pdf)
53. [Raast merchant payments launch (Dawn)](https://www.dawn.com/news/1795450)
54. [Systems Limited integrates Hysab Kytab PFM into Bank of Punjab app](https://www.systemsltd.com/newsroom/systems-limited-integrates-hysab-kytabs-pfm-bank-punjabs-digital-app)
55. [No more SMS and call log permissions, now what? (ProAndroidDev)](https://proandroiddev.com/no-more-sms-call-log-permissions-now-what-9b8226de7827?gi=5dffb8edc195)
56. [Hisab Kitab on Google Play](https://play.google.com/store/apps/details?id=com.nk.extracker&hl=en)
57. [HBL launches PFM tool (The News)](https://www.thenews.com.pk/print/814321-hbl-launches-pfm-tool)
58. [HBL and Hysab Kytab launch finance management tool (Profit)](https://profit.pakistantoday.com.pk/2021/04/05/hbl-hysab-kytab-launch-finance-management-tool-for-app-users)
59. [Hisab Kitab website](https://hisabkitab-app.com/)
60. [Splitwise free limits (Splitty)](https://splittyapp.com/learn/splitwise-free-limits/)
61. [Splitwise free vs Pro 2026 (Are We Even)](https://www.areweeven.com/blog/splitwise-free-vs-pro-2026)
62. [Splitwise pricing (FairSplit)](https://usefairsplit.com/blog/splitwise-pricing/)
63. [Splitwise free limits (Spliteo)](https://www.spliteo.app/blog/splitwise-free-limits/)
64. [SBP says teenagers can independently own and operate bank accounts (Dawn)](https://www.dawn.com/news/1987540)
65. [Savings revolution (The News on Sunday)](https://www.thenews.pk/tns/detail/1412066-savings-revolution)
66. [Teenagers allowed to independently own and operate bank accounts (The News)](https://www.thenews.pk/story/1407583-teenagers-allowed-to-independently-own-operate-bank-accounts-sbp)
67. [DLA Piper data protection: Pakistan](https://www.dlapiperdataprotection.com/index.html?t=law&c=PK)
68. [Data privacy peril: Pakistan's legal vacuum (The Friday Times)](https://www.thefridaytimes.com/11-Dec-2025/data-privacy-peril-pakistan-s-legal-vacuum-consequences)
69. [SBP seeks public feedback on proposed open banking rules (Pakistan Observer)](https://pakobserver.net/sbp-seeks-public-feedback-on-proposed-open-banking-rules/)
