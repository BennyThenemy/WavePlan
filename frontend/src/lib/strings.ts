const STRINGS: Record<string, Record<string, string>> = {
  en: {
    tagline: "read the sea before you go",
    langBtn: "עברית",
    chooseBeach: "Choose a beach",
    searchBeach: "Search or select a beach",
    menuTitle: "Menu",
    profileName: "Guest surfer",
    profileSub: "View profile",
    menuLanguage: "Language",
    menuDarkMode: "Dark mode",

    today: "Today", tomorrow: "Tomorrow", yesterday: "Yesterday",
    wd_0: "Sunday", wd_1: "Monday", wd_2: "Tuesday", wd_3: "Wednesday",
    wd_4: "Thursday", wd_5: "Friday", wd_6: "Saturday",
    wds_0: "Sun", wds_1: "Mon", wds_2: "Tue", wds_3: "Wed", wds_4: "Thu", wds_5: "Fri", wds_6: "Sat",

    welcome: "Welcome!",
    welcomeSub: "Pick a beach to read the sea — surf, SUP or a casual day by the water.",
    weekTitle: "Waves & wind · next 7 days",
    cmUnit: "cm",
    ctaHint: "Need more details and an easy AI summary? Tap 'View more details'.",
    viewForecast: "View more details",

    tab_surfing: "Surfing", tab_sup: "SUP", tab_casual: "Casual", tab_more: "More",

    summaryHead: "AI Wave Plan reader",
    bestFor: "Best for", board: "Board", bestWindow: "Best window", warning: "Warning",

    lvl_beginners: "Beginners", lvl_intermediate: "Intermediate", lvl_advanced: "Advanced",
    lvl_everyone: "Everyone", lvl_families: "Families", lvl_swimmers: "Swimmers", lvl_hardy: "Hardy beachgoers",

    brd_softtop: "Soft top", brd_longboard: "Longboard", brd_funboard: "Funboard",
    brd_shortboard: "Shortboard", brd_fish: "Fish",

    warn_wind: "Wind picking up after {t} — sheltered spots hold better.",

    txt_surf_small: "Small and forgiving — a clean longboard morning for catching your feet, nothing punishing.",
    txt_surf_work: "Workable, playful waves with enough push to link a few turns. Best before the sea breeze fills in.",
    txt_surf_solid: "Solid energy on offer — steeper faces and the odd set worth waiting for. Stay off the sand at low tide.",
    txt_period: " Long-period groundswell means cleaner, more organised lines.",
    txt_sup_calm: "Glassy and stable — ideal for a relaxed downwind cruise or a flatwater workout close to shore.",
    txt_sup_bump: "A little bump and texture; manageable for confident paddlers but tippy near the break.",
    txt_sup_chop: "Choppy and energetic — only for strong paddlers comfortable in moving water. Most should sit it out.",
    txt_casual_warm: "Warm, calm and inviting — a proper beach day. Easy water entry and gentle shorebreak for the kids.",
    txt_casual_light: "Pleasant on the sand with a light breeze. Keep an eye on the flags as the afternoon wind builds.",
    txt_casual_breezy: "Breezy and bracing — fine for a walk, but expect blown sand and choppier swimming later on.",

    m_swellPeriod: "Swell period", m_swellHeight: "Swell height", m_wind: "Wind",
    m_airWater: "Air · Water", m_uv: "UV index", m_swellDir: "Swell direction", m_tide: "Tide",
    sub_seconds: "seconds between sets", sub_daytime: "daytime average",
    sub_fromThe: "from the {d}", sub_water: "{v}° in the water", sub_primaryDir: "primary direction",
    comingSoon: "Coming soon",

    uv_low: "Low", uv_moderate: "Moderate", uv_high: "High", uv_veryhigh: "Very high", uv_extreme: "Extreme",

    hourlyTitle: "waves by hour",
    th_time: "Time", th_wave: "Wave", th_period: "Period", th_swell: "Swell", th_wind: "Wind", th_dir: "Dir",

    footer: "Forecast model · updated 06:00 · {wd} {date}",
  },

  he: {
    tagline: "קראו את הים לפני שיוצאים",
    langBtn: "EN",
    chooseBeach: "בחרו חוף",
    searchBeach: "חפשו או בחרו חוף",
    menuTitle: "תפריט",
    profileName: "גולש אורח",
    profileSub: "הצגת פרופיל",
    menuLanguage: "שפה",
    menuDarkMode: "מצב כהה",

    today: "היום", tomorrow: "מחר", yesterday: "אתמול",
    wd_0: "ראשון", wd_1: "שני", wd_2: "שלישי", wd_3: "רביעי",
    wd_4: "חמישי", wd_5: "שישי", wd_6: "שבת",
    wds_0: "ראשון", wds_1: "שני", wds_2: "שלישי", wds_3: "רביעי", wds_4: "חמישי", wds_5: "שישי", wds_6: "שבת",

    welcome: "!ברוכים הבאים",
    welcomeSub: "בחרו חוף וקראו את הים — גלישה, סאפ או יום נינוח על החוף.",
    weekTitle: "גלים ורוח · 7 הימים הבאים",
    cmUnit: "סמ״ק",
    ctaHint: "צריכים פרטים נוספים וסיכום קל של בינה מלאכותית? לחצו על 'צפו בפרטים נוספים'.",
    viewForecast: "צפו בפרטים נוספים",

    tab_surfing: "גלישה", tab_sup: "סאפ", tab_casual: "חוף", tab_more: "עוד",

    summaryHead: "קריאת הים",
    bestFor: "מתאים ל־", board: "גלשן", bestWindow: "חלון מומלץ", warning: "אזהרה",

    lvl_beginners: "מתחילים", lvl_intermediate: "בינוניים", lvl_advanced: "מתקדמים",
    lvl_everyone: "כולם", lvl_families: "משפחות", lvl_swimmers: "שוחים", lvl_hardy: "חובבי חוף קשוחים",

    brd_softtop: "גלשן רך", brd_longboard: "לונגבורד", brd_funboard: "פאנבורד",
    brd_shortboard: "שורטבורד", brd_fish: "פיש",

    warn_wind: "הרוח מתחזקת אחרי {t} — חופים מוגנים יחזיקו טוב יותר.",

    txt_surf_small: "קטן וסלחני — בוקר נקי ללונגבורד ולתפיסת ביטחון, בלי שום דבר מאתגר.",
    txt_surf_work: "גלים נוחים ומשחקיים עם מספיק דחיפה לכמה פניות. הכי טוב לפני שרוח הים מתחזקת.",
    txt_surf_solid: "אנרגיה רצינית בים — פנים תלולות וסטים ששווה לחכות להם. היזהרו מהחול בשפל.",
    txt_period: " מחזור גלים ארוך מבטיח קווים נקיים ומסודרים יותר.",
    txt_sup_calm: "חלק ויציב — מושלם לשייט נינוח עם הרוח או לאימון על מים שטוחים קרוב לחוף.",
    txt_sup_bump: "מעט תנועה ומרקם במים; ניתן לשליטה לחותרים בטוחים אך לא יציב ליד שבירת הגלים.",
    txt_sup_chop: "סוער ואנרגטי — רק לחותרים חזקים שנוח להם במים נעים. לרובכם עדיף לוותר.",
    txt_casual_warm: "חמים, רגוע ומזמין — יום חוף אמיתי. כניסה נוחה למים ושבירה עדינה לילדים.",
    txt_casual_light: "נעים על החול עם רוח קלה. עקבו אחר הדגלים כשרוח אחר הצהריים מתחזקת.",
    txt_casual_breezy: "רוחני ומרענן — מצוין להליכה, אך צפו לחול נישא ולים סוער יותר בהמשך.",

    m_swellPeriod: "מחזור גלים", m_swellHeight: "גובה גלים", m_wind: "רוח",
    m_airWater: "אוויר · מים", m_uv: "מדד UV", m_swellDir: "כיוון הגלים", m_tide: "גאות ושפל",
    sub_seconds: "שניות בין סטים", sub_daytime: "ממוצע יומי",
    sub_fromThe: "מכיוון {d}", sub_water: "{v}° במים", sub_primaryDir: "כיוון ראשי",
    comingSoon: "בקרוב",

    uv_low: "נמוך", uv_moderate: "בינוני", uv_high: "גבוה", uv_veryhigh: "גבוה מאוד", uv_extreme: "קיצוני",

    hourlyTitle: "גלים לפי שעה",
    th_time: "שעה", th_wave: "גובה", th_period: "מחזור", th_swell: "כיוון גל", th_wind: "רוח", th_dir: "כיוון רוח",

    footer: "מודל תחזית · עודכן 06:00 · {wd} {date}",
  },
};

export function makeT(lang: string) {
  const dict = STRINGS[lang] || STRINGS.en;
  return function t(key: string, vars?: Record<string, string>): string {
    let s = dict[key] != null ? dict[key] : (STRINGS.en[key] != null ? STRINGS.en[key] : key);
    if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
    return s;
  };
}
