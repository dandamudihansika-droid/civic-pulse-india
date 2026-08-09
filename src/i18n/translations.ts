export type Language = "en" | "hi";

type TranslationKeys = {
  liveBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  reportIssue: string;
  exploreMap: string;
  issuesReported: string;
  syncedRealtime: string;
  mapTitle: string;
  mapSubtitle: string;
  category: string;
  status: string;
  showing: string;
  of: string;
  loadingMap: string;
  noIssuesFiltered: string;
  noIssuesYet: string;
  beFirst: string;
  impactTitle: string;
  impactSubtitle: string;
  totalReports: string;
  resolved: string;
  upvotes: string;
  byCategory: string;
  mostCities: string;
  noCityData: string;
  last14Days: string;
  percentResolved: string;
  myReports: string;
  yourReportsDevice: string;
  locationCaptured: string;
  reportModalTitle: string;
  reportModalSubtitle: string;
  title: string;
  titlePlaceholder: string;
  description: string;
  descriptionPlaceholder: string;
  severity: string;
  photoRequired: string;
  photoHint: string;
  capturingGps: string;
  locationNotCaptured: string;
  retry: string;
  submitReport: string;
  submitting: string;
  aiAnalyze: string;
  aiAnalyzing: string;
  aiSuggested: string;
  aiApplied: string;
  howItWorks: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  footerTagline: string;
  footerBuilt: string;
  map: string;
  impact: string;
  admin: string;
  shareCopied: string;
  reportSubmitted: string;
  photoRequiredError: string;
  gpsRequiredError: string;
  geolocationUnavailable: string;
  locationDenied: string;
  loadIssuesError: string;
  exportCsv: string;
  exporting: string;
  searchPlaceholder: string;
  logout: string;
  statusLifecycle: string;
  viewEvidence: string;
  close: string;
};

export const translations: Record<Language, TranslationKeys> = {
  en: {
    liveBadge: "Live civic intelligence · India",
    heroTitle1: "Every Pothole Has a Story.",
    heroTitle2: "Every Report Creates Change.",
    heroSubtitle:
      "CivicPulse turns everyday frustrations into verifiable public record — geotagged, photographed and tracked from report to resolution, so accountability stops being optional.",
    reportIssue: "Report an Issue",
    exploreMap: "Explore the Map",
    issuesReported: "Issues reported",
    syncedRealtime: "Synced in real time across every connected citizen.",
    mapTitle: "The live map",
    mapSubtitle:
      "Every pin is a citizen report. Zoom in to see clusters break apart into individual streets.",
    category: "Category",
    status: "Status",
    showing: "Showing",
    of: "of",
    loadingMap: "Loading map…",
    noIssuesFiltered: "No issues match your filters.",
    noIssuesYet: "No reports on the map yet.",
    beFirst: "Be the first to report an issue in your area.",
    impactTitle: "Impact, in the open",
    impactSubtitle: "No dashboards behind logins. What citizens report, everyone can measure.",
    totalReports: "Total reports",
    resolved: "Resolved",
    upvotes: "Upvotes",
    byCategory: "By category",
    mostCities: "Most reported cities",
    noCityData: "No city data yet.",
    last14Days: "Reports over the last 14 days",
    percentResolved: "resolved",
    myReports: "Your reports",
    yourReportsDevice: "Your reports on this device",
    locationCaptured: "Location captured",
    reportModalTitle: "Report an issue",
    reportModalSubtitle: "Takes 30 seconds. Goes on the public record.",
    title: "Title",
    titlePlaceholder: "Deep pothole near the bus stop",
    description: "Description",
    descriptionPlaceholder:
      "What's wrong, how long has it been there, who does it affect?",
    severity: "Severity",
    photoRequired: "Photo · required",
    photoHint: "Drag a photo here, or tap to choose",
    capturingGps: "Capturing GPS…",
    locationNotCaptured: "Location not captured",
    retry: "Retry",
    submitReport: "Submit report",
    submitting: "Submitting…",
    aiAnalyze: "AI analyze photo",
    aiAnalyzing: "Analyzing photo…",
    aiSuggested: "AI suggested",
    aiApplied: "AI filled title, category & description from your photo.",
    howItWorks: "How it works",
    step1Title: "Snap & report",
    step1Desc: "Upload a photo, GPS auto-captures, AI helps describe the issue.",
    step2Title: "Go live instantly",
    step2Desc: "Your report appears on the public map in real time for everyone to see.",
    step3Title: "Track to resolution",
    step3Desc: "Municipal admins verify, fix, and mark issues resolved — transparently.",
    footerTagline: "A public record of the streets we share. Report it, track it, fix it.",
    footerBuilt: "Built with care for India",
    map: "Map",
    impact: "Impact",
    admin: "Admin",
    shareCopied: "Link copied to clipboard",
    reportSubmitted: "Report submitted — it's live on the map.",
    photoRequiredError: "A photo is required — evidence makes reports actionable.",
    gpsRequiredError: "We still need your GPS location.",
    geolocationUnavailable: "Geolocation is not available on this device.",
    locationDenied: "Location permission denied — we need it to place your pin.",
    loadIssuesError: "Couldn't load issues",
    exportCsv: "Export CSV",
    exporting: "Exporting...",
    searchPlaceholder: "Search city, title or category...",
    logout: "Logout",
    statusLifecycle: "Status Progress",
    viewEvidence: "View Evidence",
    close: "Close",
  },
  hi: {
    liveBadge: "लाइव नागरिक खुफिया · भारत",
    heroTitle1: "हर गड्ढे की एक कहानी है।",
    heroTitle2: "हर रिपोर्ट बदलाव लाती है।",
    heroSubtitle:
      "CivicPulse रोज़मर्रा की परेशानियों को सत्यापित सार्वजनिक रिकॉर्ड में बदलता है — जियो-टैग, फोटो और रिपोर्ट से समाधान तक ट्रैकिंग।",
    reportIssue: "समस्या रिपोर्ट करें",
    exploreMap: "मानचित्र देखें",
    issuesReported: "रिपोर्ट की गई समस्याएँ",
    syncedRealtime: "हर जुड़े नागरिक के साथ रियल-टाइम सिंक।",
    mapTitle: "लाइव मानचित्र",
    mapSubtitle:
      "हर पिन एक नागरिक की रिपोर्ट है। ज़ूम करें और व्यक्तिगत स्थान देखें।",
    category: "श्रेणी",
    status: "स्थिति",
    showing: "दिखा रहे हैं",
    of: "में से",
    loadingMap: "मानचित्र लोड हो रहा है…",
    noIssuesFiltered: "आपके फ़िल्टर से कोई समस्या मेल नहीं खाती।",
    noIssuesYet: "अभी मानचित्र पर कोई रिपोर्ट नहीं।",
    beFirst: "अपने क्षेत्र में पहली रिपोर्ट करने वाले बनें।",
    impactTitle: "प्रभाव, खुले में",
    impactSubtitle: "लॉगिन के पीछे कोई डैशबोर्ड नहीं। जो नागरिक रिपोर्ट करते हैं, सब माप सकते हैं।",
    totalReports: "कुल रिपोर्ट",
    resolved: "हल हुई",
    upvotes: "समर्थन",
    byCategory: "श्रेणी के अनुसार",
    mostCities: "सबसे अधिक रिपोर्ट वाले शहर",
    noCityData: "अभी शहर का डेटा नहीं।",
    last14Days: "पिछले 14 दिन की रिपोर्ट",
    percentResolved: "हल",
    myReports: "आपकी रिपोर्ट",
    yourReportsDevice: "इस डिवाइस पर आपकी रिपोर्ट",
    locationCaptured: "स्थान कैप्चर हुआ",
    reportModalTitle: "समस्या रिपोर्ट करें",
    reportModalSubtitle: "30 सेकंड। सार्वजनिक रिकॉर्ड पर जाता है।",
    title: "शीर्षक",
    titlePlaceholder: "बस स्टॉप के पास गहरा गड्ढा",
    description: "विवरण",
    descriptionPlaceholder: "क्या गलत है, कब से है, किसे प्रभावित करता है?",
    severity: "गंभीरता",
    photoRequired: "फोटो · अनिवार्य",
    photoHint: "फोटो यहाँ खींचें, या चुनने के लिए टैप करें",
    capturingGps: "GPS कैप्चर हो रहा है…",
    locationNotCaptured: "स्थान कैप्चर नहीं हुआ",
    retry: "पुनः प्रयास",
    submitReport: "रिपोर्ट जमा करें",
    submitting: "जमा हो रहा है…",
    aiAnalyze: "AI से फोटो विश्लेषण",
    aiAnalyzing: "फोटो विश्लेषण हो रहा है…",
    aiSuggested: "AI सुझाव",
    aiApplied: "AI ने आपकी फोटो से शीर्षक, श्रेणी और विवरण भर दिया।",
    howItWorks: "यह कैसे काम करता है",
    step1Title: "फोटो लें और रिपोर्ट करें",
    step1Desc: "फोटो अपलोड करें, GPS स्वचालित, AI समस्या का वर्णन करने में मदद करता है।",
    step2Title: "तुरंत लाइव",
    step2Desc: "आपकी रिपोर्ट सभी के लिए सार्वजनिक मानचित्र पर रियल-टाइम दिखती है।",
    step3Title: "समाधान तक ट्रैक",
    step3Desc: "नगरपालिका प्रशासक सत्यापित करते, ठीक करते और समस्याएँ हल करते हैं — पारदर्शी रूप से।",
    footerTagline: "हमारी सड़कों का सार्वजनिक रिकॉर्ड। रिपोर्ट करें, ट्रैक करें, ठीक करें।",
    footerBuilt: "भारत के लिए प्रेम से बनाया गया",
    map: "मानचित्र",
    impact: "प्रभाव",
    admin: "प्रशासन",
    shareCopied: "लिंक क्लिपबोर्ड पर कॉपी हुआ",
    reportSubmitted: "रिपोर्ट जमा — मानचित्र पर लाइव है।",
    photoRequiredError: "फोटो अनिवार्य है — सबूत रिपोर्ट को कारगर बनाता है।",
    gpsRequiredError: "हमें अभी भी आपका GPS स्थान चाहिए।",
    geolocationUnavailable: "इस डिवाइस पर जियोलोकेशन उपलब्ध नहीं।",
    locationDenied: "स्थान अनुमति अस्वीकृत — पिन लगाने के लिए ज़रूरी है।",
    loadIssuesError: "समस्याएँ लोड नहीं हो सकीं",
    exportCsv: "CSV निर्यात करें",
    exporting: "निर्यात हो रहा है...",
    searchPlaceholder: "शहर, शीर्षक या श्रेणी खोजें...",
    logout: "लॉगआउट",
    statusLifecycle: "स्थिति प्रगति",
    viewEvidence: "साक्ष्य देखें",
    close: "बंद करें",
  },
};

export function statusLabel(status: string, lang: Language): string {
  const en: Record<string, string> = {
    unverified: "Unverified",
    verified: "Verified",
    in_progress: "In Progress",
    resolved: "Resolved",
  };
  const hi: Record<string, string> = {
    unverified: "असत्यापित",
    verified: "सत्यापित",
    in_progress: "प्रगति में",
    resolved: "हल",
  };
  return (lang === "hi" ? hi : en)[status] ?? status;
}

export function categoryLabelI18n(key: string, lang: Language): string {
  const en: Record<string, string> = {
    road: "Road / Pothole",
    streetlight: "Streetlight",
    garbage: "Garbage",
    water: "Water / Drainage",
  };
  const hi: Record<string, string> = {
    road: "सड़क / गड्ढा",
    streetlight: "स्ट्रीटलाइट",
    garbage: "कचरा",
    water: "पानी / नाली",
  };
  return (lang === "hi" ? hi : en)[key] ?? key;
}
