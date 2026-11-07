// public/cases.mjs
//
// StartupShield historical case library.
// 100 public-source case summaries.
//
// These stories provide historical context.
// They are not a statistically representative dataset,
// audited financial histories, or proof that an intervention works.

const F = (slug) =>
  `https://www.failory.com/interview/${slug}`;

const S = (slug) =>
  `https://legacy.sba.gov/success-story/${slug}`;

const DEFAULT_LIMITATION =
  "A public historical account, not an audited financial history. " +
  "Reported outcomes do not establish causation. " +
  "Check whether the company's size, customers, costs, location, " +
  "and historical circumstances match your business.";

function makeCase(
  company,
  industry,
  tags,
  problem,
  response,
  outcome,
  url,
  options = {}
) {
  return {
    id: company
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),

    company,
    industry,
    category: industry.replace(/_/g, " "),
    year: options.year || "Historical account",
    tags: tags.split(",").map((tag) => tag.trim()),

    title: options.title || problem,
    problem,
    response,
    outcome,

    limitation:
      (options.limitation
        ? `${options.limitation} `
        : "") + DEFAULT_LIMITATION,

    source: url.includes("failory.com")
      ? "Founder interview · Failory"
      : url.includes("sba.gov")
        ? "Historical business profile · SBA"
        : "Historical source account",

    url,
    followup: options.followup || null,

    color: options.color || "sand",
    caseKind: options.kind || "historical_context",

    analogOnly: Boolean(options.analogOnly),
    identityNeedsReview: Boolean(options.identityNeedsReview),

    sourceLinks: [
      { title: "Original source", url },
      ...(options.followup
        ? [{ title: "Additional source", url: options.followup }]
        : []),
    ],
  };
}

export const cases = [
  // 1
  makeCase(
    "Buffer",
    "software",
    "cash,burn,capacity",
    "Rapid hiring and financial-planning errors created a cash squeeze.",
    "Management reduced staffing and revisited cash planning.",
    "A subsequent report showed lower expenses, while severance delayed some payroll savings.",
    "https://buffer.com/resources/layoffs-and-moving-forward/",
    {
      year: "2016",
      followup: "https://buffer.com/resources/june-financial-report/",
      limitation:
        "Staff reductions have transition costs and service consequences; this is not a layoff prescription.",
      kind: "cost_management",
    }
  ),

  // 2
  makeCase(
    "Baremetrics",
    "software",
    "cash,burn",
    "The founder discovered that approximately eight weeks of cash remained.",
    "The company sought financial-forecasting help and changed spending, compensation, and growth efforts.",
    "The founder reported reaching profitability eight months later and subsequently restoring salaries.",
    "https://baremetrics.com/blog/how-we-went-from-weeks-of-cash-left-in-the-bank-to-profitable-in-8-months",
    {
      year: "2017",
      limitation:
        "Several changes occurred together. The recovery period is not a benchmark for other businesses.",
      kind: "turnaround",
      color: "blue",
    }
  ),

  // 3
  makeCase(
    "Gumroad",
    "retail",
    "cash,burn,capital,governance",
    "Growth fell short of venture-scale expectations while spending needed to fall.",
    "The business reduced its team and shifted toward a smaller, sustainable operation.",
    "The founder's retrospective reports continued operation and profitability after the reset.",
    "https://sahillavingia.com/reflecting",
    {
      limitation:
        "A transaction platform differs from a merchant holding inventory. Transaction volume is not company revenue.",
      kind: "business_model_reset",
    }
  ),

  // 4
  makeCase(
    "Vivalatina",
    "retail",
    "acquisition,inventory,validation,channel",
    "Weak sales and ineffective search marketing left existing jewelry stock difficult to sell.",
    "The founder moved from reselling silver jewelry to higher-priced custom designs and developed marketing skills.",
    "The interview describes a rebuilt jewelry business with an operating workshop and employees.",
    F("vivalatina"),
    {
      limitation:
        "Custom production requires different skills, fulfillment processes, and margins from resale.",
      kind: "pivot",
    }
  ),

  // 5
  makeCase(
    "NE Lounge",
    "retail",
    "inventory,margin,validation,channel",
    "The founder entered an unfamiliar product niche and incurred substantial discount and giveaway costs.",
    "He lowered prices and used promotions to seek sales and reviews.",
    "He reported closing the venture after approximately a year and losing roughly $16,000.",
    F("ne-lounge"),
    {
      limitation:
        "Historical marketplace tactics may not comply with current platform rules.",
      kind: "shutdown",
    }
  ),

  // 6
  makeCase(
    "Chowdy",
    "food",
    "margin,regulatory,capacity",
    "The meal business faced operational weaknesses and regulatory problems involving pickup hubs.",
    "It used partner-cafe pickup hubs instead of home delivery to reduce distribution costs.",
    "The service grew but ultimately closed; the arrangement did not remove its operating constraints.",
    F("chowdy"),
    {
      limitation:
        "Food-handling requirements depend on jurisdiction. The hub arrangement is not regulatory guidance.",
      kind: "shutdown",
    }
  ),

  // 7
  makeCase(
    "MealSurfers",
    "food",
    "margin,validation,governance,cash",
    "Cash losses and an unsettled revenue model made the business difficult to sustain.",
    "The team experimented with catering, delivery, merchant support, and events before selling assets.",
    "The founder reported a sale with a positive return, while acknowledging unrealized potential.",
    F("mealsurfers"),
    {
      limitation:
        "Full sale terms and a complete financial history are unavailable.",
      kind: "asset_sale",
    }
  ),

  // 8
  makeCase(
    "Melon",
    "food",
    "margin,capacity,validation",
    "Actual routing work and driver compensation made delivery economics less attractive than projected.",
    "The team pooled orders, narrowed delivery windows, and revised assumptions using operating data.",
    "It discontinued the service after concluding that expansion did not offer the intended path to profitability.",
    F("melon"),
    {
      limitation:
        "Founder-performed work can conceal labor costs. Pandemic-era demand was a distinct context.",
      kind: "shutdown",
    }
  ),

  // 9
  makeCase(
    "Refolo",
    "health",
    "validation,acquisition,retention",
    "Events and collaborations generated interest but insufficient repeatable paid demand.",
    "The founder tried low-code versions, local meetups, and influencer collaborations.",
    "She stopped the product after roughly two years without sufficient paying traction.",
    F("refolo"),
    {
      limitation:
        "The account does not provide a complete conversion funnel.",
      kind: "shutdown",
    }
  ),

  // 10
  makeCase(
    "Tandem",
    "health",
    "retention,acquisition,validation",
    "Adoption and retention disappointed after an encouraging pilot, while paid acquisition was costly.",
    "The team tested an SMS pilot, built an app, and explored consumer acquisition and clinician referrals.",
    "The founders decided not to continue with the original product.",
    F("tandem-app"),
    {
      limitation:
        "This is a product-market account, not evidence of clinical efficacy.",
      kind: "shutdown",
    }
  ),

  // 11
  makeCase(
    "Young Entrepreneurs Program",
    "education",
    "validation,retention,shock,burn",
    "A broad target audience and the loss of in-person meetings weakened the offering.",
    "The team shifted toward a paid online community.",
    "Members still wanted the original format; the project closed and refunded much of its committed revenue.",
    F("young-entrepreneurs-program"),
    {
      limitation:
        "Committed annual recurring revenue is not necessarily collected revenue.",
      kind: "shutdown",
    }
  ),

  // 12
  makeCase(
    "Community Coders",
    "education",
    "validation,acquisition,governance",
    "A pivot based largely on qualitative impressions was followed by difficulty closing deals.",
    "A low-cost training pilot evolved toward a learn-and-work freelancing platform.",
    "The business eventually closed after losing focus and momentum.",
    F("community-coders"),
    {
      limitation:
        "Training and agency services have different buyers and quality-control requirements.",
      kind: "shutdown",
    }
  ),

  // 13
  makeCase(
    "Hello Tyro",
    "human_resources",
    "validation,cash,shock,retention",
    "Selling was already difficult before pandemic recruitment pauses intensified revenue pressure.",
    "The founders reduced the team, continued sales efforts, and temporarily offered near-free access.",
    "They reported exhausting cash and filing for bankruptcy.",
    F("hello-tyro"),
    {
      limitation:
        "Internship recruitment spending is seasonal and discretionary.",
      kind: "shutdown",
    }
  ),

  // 14
  makeCase(
    "Ansaro",
    "human_resources",
    "validation,acquisition,capital,burn",
    "Custom hiring pilots did not become repeatable software usage, and customer-data access was difficult.",
    "The team moved from predictive hiring models toward structured interviews and an AI notetaker.",
    "The venture closed without establishing a sufficiently compelling, scalable product.",
    F("ansaro"),
    {
      limitation:
        "This does not establish a benchmark for current AI model costs.",
      kind: "shutdown",
    }
  ),

  // 15
  makeCase(
    "Adproval",
    "advertising",
    "validation,margin,acquisition,founder_dependency",
    "Small transactions and weak advertiser acquisition did not support the intended self-service platform.",
    "The founder later tested brand-side software and managed campaign services.",
    "He closed the business; the late change was not established as a durable recovery.",
    F("adproval"),
    {
      limitation:
        "Multiple business and personal pressures featured in the account.",
      kind: "shutdown",
    }
  ),

  // 16
  makeCase(
    "DotaHaven",
    "media",
    "validation,channel,concentration,burn",
    "The founder described investing before validation and depending on a gaming trend that weakened.",
    "The team pivoted, built organic traffic, and obtained an advertising partnership.",
    "Active development stopped while the site remained online.",
    F("dotahaven"),
    {
      limitation:
        "Stopping development is not the same as a completed legal shutdown.",
      kind: "development_stopped",
    }
  ),

  // 17
  makeCase(
    "Thyme Matters",
    "food",
    "cash,shock,capacity",
    "The restaurant faced cash-flow, staffing, and customer-loyalty challenges followed by pandemic disruption.",
    "The owner used startup financing and later pandemic support for equipment and inventory needs.",
    "The profile reports continued operation and a larger workforce than at opening.",
    S("sba-recipe-success"),
    {
      limitation:
        "Historical emergency assistance is not assumed to remain available.",
      kind: "continuation",
    }
  ),

  // 18
  makeCase(
    "Laurel's Design Salon",
    "beauty",
    "cash,capital,capacity",
    "The owner wanted greater location stability after years of renting.",
    "She purchased the salon building using SBA-backed financing.",
    "The lender account reports a lower monthly payment and planned improvements.",
    "https://pursuitlending.com/resources/laurel-design-salon-rochester-ny/",
    {
      limitation:
        "The lender profile does not fully quantify maintenance, taxes, or equity tied up in the property.",
      kind: "property_purchase",
    }
  ),

  // 19
  makeCase(
    "Define Hair & Skin",
    "beauty",
    "cash,capital,shock",
    "Seasonality, equipment purchases, and multiple financing payments pressured monthly cash.",
    "The owner modeled financing scenarios and consolidated obligations.",
    "The lender reported improved cash flow without publishing a complete cost comparison.",
    "https://www.credibly.com/incredibly/case-studies/how-define-hair-skin-simplified-its-financing-to-improve-cash-flow/",
    {
      limitation:
        "A lower monthly payment can still increase total borrowing costs.",
      kind: "refinancing",
    }
  ),

  // 20
  makeCase(
    "American Manufacturing",
    "manufacturing",
    "shock,cash,capacity,concentration",
    "An automotive downturn sharply reduced orders and employment.",
    "The company refinanced debt, obtained working capital, and added automation as demand recovered.",
    "The account reports workforce recovery and later pandemic payroll support.",
    S("ohio-manufacturer-turns-sba-assistance-during-challenging-economies"),
    {
      limitation:
        "An industry rebound occurred alongside company changes.",
      kind: "continuation",
    }
  ),

  // 21
  makeCase(
    "G Hyatt Construction",
    "construction",
    "capital,capacity,cash",
    "Working capital and bonding capacity constrained access to larger contracts.",
    "The owner used business-planning support and increased available bonding capacity.",
    "The profile reports progression to larger municipal and state projects.",
    S("my-fathers-legacy"),
    {
      limitation:
        "A bond limit is not revenue, cash, or profit.",
      kind: "capacity_expansion",
    }
  ),

  // 22
  makeCase(
    "Farm310",
    "agriculture",
    "acquisition,capacity",
    "The farm needed stronger planning, production efficiency, and online-sales capabilities.",
    "The owner used business training and counseling to improve production and online presence.",
    "The profile describes expansion and regional business recognition.",
    S("service-soil"),
    {
      limitation:
        "Awards and qualitative growth descriptions do not establish profitability.",
      kind: "growth_strategy",
    }
  ),

  // 23
  makeCase(
    "Bouchard Farms",
    "agriculture",
    "capacity,capital,inventory",
    "The farming operation needed storage and equipment upgrades.",
    "The family used the Farm Storage Facility Loan program to finance improvements.",
    "The USDA account reports improvements in production, quality, and profitability without a comparable monthly series.",
    "https://www.fsa.usda.gov/news-events/news/12-11-2025/farm-storage-facility-loan-program-helping-four-generations-farmers",
    {
      limitation:
        "A multigenerational operation differs from a newly established farm.",
      kind: "capacity_expansion",
    }
  ),

  // 24
  makeCase(
    "Prep and Tech Childcare",
    "childcare",
    "capital,validation,capacity",
    "The founders needed planning support and additional financing to open.",
    "They worked with the Pitt SBDC to complete their plan and secure financing.",
    "The university profile documents planning and financing progress, not long-term profitability.",
    "https://www.entrepreneur.pitt.edu/sbdc-success-story-prep-and-tech-childcare/",
    {
      limitation:
        "Licensing, staffing ratios, and reimbursement rules vary by location.",
      kind: "launch",
    }
  ),

  // 25
  makeCase(
    "Pebble",
    "hardware",
    "capital,capacity",
    "A historical support notice announced the end of regular independent operations.",
    "Fitbit acquired specified software-related assets and personnel, excluding hardware products.",
    "The historical notice said new-device manufacturing and sales stopped.",
    "https://blog.google/products-and-platforms/devices/fitbit/fitbit-acquires-assets-pebble/",
    {
      limitation:
        "Larger-scale analogy. The reviewed notices do not establish the financial cause.",
      analogOnly: true,
      kind: "asset_sale",
    }
  ),

  // 26
  makeCase(
    "Shyp",
    "logistics",
    "margin,cash,capacity,validation",
    "Consumer-focused expansion did not support a durable business.",
    "The company withdrew to San Francisco and focused on business customers.",
    "The founder reported improved local economics but insufficient remaining resources; Shyp closed in 2018.",
    "https://www.linkedin.com/pulse/i-cant-wait-you-see-what-we-do-next-kevin-gibbon/",
    {
      year: "2018",
      limitation:
        "Scale-up analogy. Local break-even does not establish consolidated profitability.",
      analogOnly: true,
      kind: "shutdown",
    }
  ),

  // 27
  makeCase(
    "VacationBird",
    "travel",
    "validation,channel,acquisition,governance",
    "Custom development and slow search-driven acquisition depleted savings without revenue.",
    "The founders recruited listings manually and built a platform before establishing monetization.",
    "The founder reported closing the venture in 2012.",
    F("vacation-bird"),
    {
      limitation:
        "Retrospective suggestions are not executed interventions.",
      kind: "shutdown",
    }
  ),

  // 28
  makeCase(
    "Onepagetrip",
    "travel",
    "validation,cash,founder_dependency",
    "The venture lacked a clear revenue model while founders had limited time alongside their jobs.",
    "The team built an itinerary-sharing community but did not establish sustainable monetization.",
    "The original venture closed; a founder later pursued a different travel business.",
    F("onepagetrip"),
    {
      limitation:
        "The later venture is not evidence of a recovery by this company.",
      kind: "shutdown",
    }
  ),

  // 29
  makeCase(
    "PubLoft",
    "professional_services",
    "concentration,burn,governance,acquisition",
    "The agency lost its largest client while spending and fundraising distracted from delivery and sales.",
    "It hired sales support, then attempted expense reductions and staff cuts.",
    "The founder described the business declining to zero after earlier recurring-revenue growth.",
    F("publoft"),
    {
      kind: "shutdown",
    }
  ),

  // 30
  makeCase(
    "Leaf & Twig / North Ave. Candles partnership",
    "retail",
    "shock,channel,acquisition",
    "Pandemic disruption interrupted normal sales channels.",
    "The businesses collaborated with a bookstore on themed gift boxes and complementary products.",
    "The account reports new customers and planned bundles, without a quantified profit improvement.",
    S("sba-celebrates-womens-small-business-pandemic-partnership-success"),
    {
      limitation:
        "This is a partnership account involving multiple businesses.",
      kind: "channel_pivot",
    }
  ),

  // 31
  makeCase(
    "Erie Cleaning Services / Dust Buster name discrepancy",
    "home_services",
    "validation,acquisition,capacity",
    "The owner needed a break-even client target and new leads.",
    "A SCORE mentor helped with break-even planning and the website.",
    "The profile reports website leads and early operations, not demonstrated profitability.",
    "https://www.score.org/pa/pittsburgh/success-stories/erie-cleaning-services/",
    {
      limitation:
        "The source uses conflicting business names. Verify identity before relying on this case.",
      identityNeedsReview: true,
      kind: "early_operation",
    }
  ),

  // 32
  makeCase(
    "Gibbons Family Fitness",
    "fitness",
    "acquisition,channel,founder_dependency",
    "The owner sought more structured business development and a stronger digital presence.",
    "SCORE mentoring supported priorities, website updates, and search visibility.",
    "The account describes continued operation through the pandemic without a causal revenue comparison.",
    "https://www.score.org/ny/westchester/success-stories/how-maintain-a-healthy-business-how-one-score-client-started-her-fitness/",
    {
      kind: "continuation",
    }
  ),

  // 33
  makeCase(
    "Monite",
    "fintech",
    "validation,acquisition,margin",
    "The original small-business finance product faced low annual revenue per customer and lengthy sales cycles.",
    "The team examined early product evidence and pivoted toward embedded-finance APIs for business platforms.",
    "The interview describes continued development of the revised offering, not established profitability.",
    F("monite"),
    {
      kind: "pivot",
    }
  ),

  // 34
  makeCase(
    "Voyagu",
    "travel",
    "channel,capacity,shock",
    "The founder saw travel agents losing customers while using fragmented operating tools.",
    "The business built tools to automate repeated tasks and connect advisors with travelers.",
    "The interview describes a growing venture without a complete financial performance history.",
    F("voyagu"),
    {
      kind: "growth_strategy",
    }
  ),

  // 35
  makeCase(
    "DenberTech",
    "fintech",
    "validation,channel",
    "The founder pursued cryptocurrency payment acceptance after attention from a viral campaign.",
    "The team built an initial product and sought merchant adoption.",
    "The retrospective describes failure and emphasizes hype-driven assumptions about demand.",
    F("denbertech"),
    {
      kind: "setback",
    }
  ),

  // 36
  makeCase(
    "StarSync",
    "media",
    "validation,burn,capacity",
    "A solo nontechnical founder committed substantial development spending before validating a marketplace.",
    "An agency built a creator-experience marketplace funded through transaction commissions.",
    "The founder described a delayed, unreliable launch and weak demand.",
    F("starsync"),
    {
      kind: "setback",
    }
  ),

  // 37
  makeCase(
    "Benja",
    "advertising",
    "governance,capital",
    "The founder retrospectively described misleading financial representations and neglected commercial relationships.",
    "The account acknowledges those decisions rather than documenting a successful corrective intervention.",
    "The interview presents a failed venture without an established recovery.",
    F("benja"),
    {
      limitation:
        "This is a single founder account. Do not infer misconduct by another business from financial resemblance.",
      kind: "setback",
    }
  ),

  // 38
  makeCase(
    "Observa",
    "software",
    "validation,acquisition,channel",
    "Security ideas required customer-data access, while intended small-business buyers did not prioritize paying.",
    "The team explored several security products and potential pilots.",
    "The founder reported closing approximately a year after founding the venture in 2020.",
    F("observa"),
    {
      kind: "shutdown",
    }
  ),

  // 39
  makeCase(
    "WePlate",
    "software",
    "validation,acquisition",
    "An initial nutrition application did not establish a clear fit with intended users or buyers.",
    "The team shifted toward university dining analytics and contacted universities.",
    "The founder reported stopping after roughly eight months.",
    F("weplate"),
    {
      kind: "shutdown",
    }
  ),

  // 40
  makeCase(
    "Design in DC",
    "professional_services",
    "acquisition,validation",
    "The founder wanted differentiation in a crowded digital-design agency market.",
    "He combined his film and academic background with digital design services.",
    "The profile describes an operating agency without an audited intervention comparison.",
    F("design-in-dc"),
    {
      kind: "growth_strategy",
    }
  ),

  // 41
  makeCase(
    "FinMasters",
    "media",
    "acquisition,burn,channel",
    "The founder was building a finance publishing business after experience with other niche websites.",
    "The project invested in content and search-led audience development.",
    "The interview reports substantial spending and continued growth efforts; spending is not evidence of profit.",
    F("finmasters"),
    {
      kind: "growth_strategy",
    }
  ),

  // 42
  makeCase(
    "Tweet Hunter",
    "software",
    "validation,acquisition,channel",
    "The founders wanted to help makers attract users but had no settled product idea.",
    "They launched small experiments, then used free tools, social distribution, and partnerships to market an audience tool.",
    "The founder reported monthly revenue without an audited profit comparison.",
    F("tweet-hunter"),
    {
      kind: "growth_strategy",
    }
  ),

  // 43
  makeCase(
    "Woovly",
    "retail",
    "shock,channel,validation",
    "The original adventure-experience concept faced a changed pandemic market.",
    "The business pivoted to social commerce using user-created content and discovery.",
    "The founder describes growth of the revised platform without a measured intervention effect.",
    F("woovly"),
    {
      kind: "pivot",
    }
  ),

  // 44
  makeCase(
    "BaseTemplates",
    "retail",
    "acquisition,channel",
    "The owner wanted to expand an acquired pitch-deck template business.",
    "The business broadened products and combined content, free tools, and custom design.",
    "The founder reported a growing digital-product business, not a verified long-term profit history.",
    F("basetemplates"),
    {
      kind: "growth_strategy",
    }
  ),

  // 45
  makeCase(
    "Sisu Academy",
    "education",
    "capital,shock,validation",
    "A tuition-free nonprofit school depended on donations and faced pandemic disruption.",
    "The founders raised donations and explored a revenue-generating campus incubator.",
    "The school closed after approximately two and a half years; the incubator was a plan, not a tested remedy.",
    F("sisu-academy"),
    {
      limitation:
        "Donation-funded education has different economics from a commercial startup.",
      kind: "shutdown",
    }
  ),

  // 46
  makeCase(
    "Corebook",
    "software",
    "validation,acquisition",
    "The team saw limitations in distributing brand guidelines through static documents.",
    "It built an online collaborative branding platform for agencies and brand teams.",
    "The interview describes organizational customers and continued operation, not a financial rescue.",
    F("corebook"),
    {
      kind: "growth_strategy",
    }
  ),

  // 47
  makeCase(
    "Headlime",
    "software",
    "validation,acquisition",
    "The founder was commercializing an AI-assisted copywriting product.",
    "He built a paid product and later pursued a sale of the business.",
    "The founder reported recurring revenue and an acquisition by Jarvis in March 2021.",
    F("headlime"),
    {
      limitation:
        "An AI product acquisition does not establish an inference-cost intervention or margin benchmark.",
      kind: "acquisition",
    }
  ),

  // 48
  makeCase(
    "Fibery",
    "software",
    "validation,capacity",
    "The team was turning research about work-management problems into a commercial product.",
    "It researched workflows, developed a platform, and expanded a distributed team.",
    "The founder reported recurring revenue without demonstrating profitability.",
    F("fibery"),
    {
      kind: "growth_strategy",
    }
  ),

  // 49
  makeCase(
    "Plutoview",
    "software",
    "validation,channel,capital",
    "The team was seeking a viable position in remote collaboration.",
    "It pivoted toward a co-browsing API and raised external capital.",
    "The founder reported substantial collaborative usage and continued development, not audited margins.",
    F("plutoview"),
    {
      kind: "pivot",
    }
  ),

  // 50
  makeCase(
    "WotNot",
    "software",
    "capacity,acquisition",
    "The founders were developing tools for business leads and customer conversations.",
    "They built a no-code chat product alongside a software-services background.",
    "The profile reports business adoption without a complete product-level financial history.",
    F("wotnot"),
    {
      limitation:
        "Staff numbers in the account may refer to a broader founder organization.",
      kind: "growth_strategy",
    }
  ),

  // 51
  makeCase(
    "Bildr",
    "software",
    "validation,capital",
    "The company was taking a visual application-development platform toward commercial launch.",
    "It offered a free tier, paid tiers, and an open beta while working with customers.",
    "The interview describes a beta-stage product and fundraising, not sustained profitability.",
    F("bildr"),
    {
      kind: "growth_strategy",
    }
  ),

  // 52
  makeCase(
    "Vimcal",
    "software",
    "validation,acquisition",
    "The founders needed to understand remote workers' calendar workflows.",
    "The team developed calendar tools and made personal user onboarding part of employees' work.",
    "The interview reports thousands of onboarded users without an audited revenue or retention series.",
    F("vimcal"),
    {
      kind: "growth_strategy",
    }
  ),

  // 53
  makeCase(
    "Photobooth Supply Co.",
    "hardware",
    "acquisition,capacity",
    "The founders were building an equipment and support business for photo-booth operators.",
    "They bootstrapped a product and service offering for those operators.",
    "The founder reported substantial monthly revenue; customer profitability was not independently demonstrated.",
    F("photobooth-supply"),
    {
      kind: "growth_strategy",
    }
  ),

  // 54
  makeCase(
    "Reform",
    "software",
    "validation,acquisition",
    "The founders believed form-building tools left room for a simpler, design-focused product.",
    "A two-person team built and marketed a subscription form builder.",
    "The interview reports approximately one hundred customers within eight months without a complete profit history.",
    F("reform"),
    {
      kind: "growth_strategy",
    }
  ),

  // 55
  makeCase(
    "ZenMaid",
    "software",
    "validation,acquisition,capacity",
    "The founders targeted the scheduling and communication needs of cleaning businesses.",
    "They developed niche software for schedules and operational communications.",
    "The founder reported recurring-revenue growth; future growth targets were not realized outcomes.",
    F("zenmaid"),
    {
      kind: "growth_strategy",
    }
  ),

  // 56
  makeCase(
    "GoRails",
    "education",
    "capacity,founder_dependency",
    "Marketing, support, sales, and development grew beyond one founder's capacity.",
    "He expanded related developer products and began building a team.",
    "The founder reported recurring revenue but described hiring as ongoing, without a measured post-hiring result.",
    F("gorails"),
    {
      kind: "capacity_expansion",
    }
  ),

  // 57
  makeCase(
    "Upvoty",
    "software",
    "validation,acquisition",
    "The founder needed to validate paid demand for a customer-feedback tool.",
    "A small team developed a beta, launched, and pursued organic growth.",
    "The founder reported increasing recurring revenue without a complete profit or retention history.",
    F("upvoty"),
    {
      kind: "growth_strategy",
    }
  ),

  // 58
  makeCase(
    "Tactiq",
    "software",
    "acquisition,channel,capacity",
    "The company was expanding a meeting-notes product distributed as a browser extension.",
    "It used a free tier with paid individual and team accounts.",
    "The founder reported strong growth; a fundraising revenue target remained a target.",
    F("tactiq"),
    {
      kind: "growth_strategy",
    }
  ),

  // 59
  makeCase(
    "Rize",
    "software",
    "validation,burn",
    "The founders were starting a productivity product after a different venture failed to find product-market fit.",
    "They built a two-person bootstrapped subscription business.",
    "The founder reported sales six months after launch.",
    F("rize"),
    {
      limitation:
        "The prior venture's funding and failure are not Rize's financial history.",
      kind: "growth_strategy",
    }
  ),

  // 60
  makeCase(
    "Tally",
    "software",
    "validation,acquisition",
    "The founders were entering a crowded form-building market with a self-funded product.",
    "They offered a generous free tool and a paid tier.",
    "The founder reported adoption and recurring revenue without a causal pricing experiment.",
    F("tally"),
    {
      kind: "growth_strategy",
    }
  ),

  // 61
  makeCase(
    "MicroConf",
    "education",
    "acquisition,channel",
    "The founders saw a need for a peer community serving bootstrapped software founders.",
    "They organized in-person events and an online community.",
    "The interview reports events and participation, not an audited business profit series.",
    F("microconf"),
    {
      limitation:
        "TinySeed is an adjacent initiative; its capital is not MicroConf operating revenue.",
      kind: "growth_strategy",
    }
  ),

  // 62
  makeCase(
    "Syria Airlift Project",
    "nonprofit",
    "capital,validation,capacity",
    "The humanitarian project depended on donors and volunteers without a sustainable operating model.",
    "The founder organized a volunteer-supported drone delivery effort.",
    "The founder reported that the effort failed; no successful financial rescue was documented.",
    F("syria-airlift-project"),
    {
      limitation:
        "A humanitarian moonshot is a specialized analogy rather than a typical small-business comparison.",
      analogOnly: true,
      kind: "shutdown",
    }
  ),

  // 63
  makeCase(
    "Woody's Trucking",
    "logistics",
    "capital,capacity",
    "Growing operations needed fleet and facility investment.",
    "The company used business counseling and SBA-backed fixed-asset financing.",
    "The profile reports expanded fleet and facilities without audited investment returns.",
    S("how-sba-fueled-woodys-truckings-growth-expansion"),
    {
      kind: "capacity_expansion",
    }
  ),

  // 64
  makeCase(
    "NPO Transportation",
    "logistics",
    "capacity,governance",
    "The company needed to manage growth from a small transport operation.",
    "Leadership used business education and a women's business support network.",
    "The profile describes a larger driver organization without a comparable profit series.",
    S("npo-transportation-powers-large-american-enterprises"),
    {
      kind: "growth_strategy",
    }
  ),

  // 65
  makeCase(
    "Executive Transportation",
    "logistics",
    "shock,cash,capacity",
    "Pandemic disruption sharply reduced reservations and forced layoffs.",
    "The business used payroll support, rehired staff, and explored alternative revenue opportunities.",
    "The account describes staff returning and continued operations without isolating each change's effect.",
    S("executive-transportation-drives-through-crisis-sba-backed-programs"),
    {
      kind: "continuation",
    }
  ),

  // 66
  makeCase(
    "Honey and Rye",
    "food",
    "capacity,capital,shock",
    "Growth created space limitations alongside pandemic operating challenges.",
    "The owner used mentoring and financing to purchase a larger bakehouse.",
    "The profile reports the facility; proposed classes were not a proven revenue stream.",
    S("sugar-spice-everything-nice-how-sba-helped-local-minnesota-bakery-thrive"),
    {
      kind: "capacity_expansion",
    }
  ),

  // 67
  makeCase(
    "Cakeshop by Tati",
    "food",
    "capital,burn,validation",
    "The founders needed financing and a workable storefront launch budget.",
    "They developed plans with SCORE and sourced used equipment to control setup spending.",
    "The account reports financing and launch without establishing complete owner-compensated profitability.",
    S("sba-score-create-recipe-sweet-success"),
    {
      kind: "launch",
    }
  ),

  // 68
  makeCase(
    "CT Polymers",
    "manufacturing",
    "capacity,capital",
    "The recycling manufacturer needed more production capacity.",
    "The company used SBA-backed financing to expand manufacturing.",
    "The profile reports growth; further planned building and job expansion was not recorded as completed.",
    S("recycling-waste-sustainable-manufacturing-solutions"),
    {
      kind: "capacity_expansion",
    }
  ),

  // 69
  makeCase(
    "Garbage to Garden",
    "environmental_services",
    "capacity,capital",
    "A backyard compost-collection business outgrew its initial space.",
    "The owner worked with SCORE and growth-support programs while moving to larger facilities.",
    "The profile describes residential and institutional customers in Maine and the Boston area.",
    S("garbage-garden-maines-small-business-person-year-2022"),
    {
      kind: "capacity_expansion",
    }
  ),

  // 70
  makeCase(
    "Apparel Impact",
    "environmental_services",
    "capacity,channel",
    "The founders were expanding a small textile-recovery operation.",
    "They developed collection sites and partnerships across multiple states.",
    "The profile reports a larger network and recovered materials without an audited margin history.",
    S("superheroes-recycled-clothing"),
    {
      kind: "growth_strategy",
    }
  ),

  // 71
  makeCase(
    "Wilkins Lumber",
    "manufacturing",
    "governance,capacity",
    "A multigenerational lumber business had to adapt across ownership transitions.",
    "The family continued operating and modernizing the sawmill.",
    "The profile reports continued family operation without estimating modernization's financial effect.",
    S("wilkins-lumber-milford-sbas-2024-new-hampshire-jeffrey-butland-family-owned-business-year"),
    {
      kind: "continuation",
    }
  ),

  // 72
  makeCase(
    "Noisy Water Winery",
    "food",
    "capacity,channel,capital",
    "The owner took control of a struggling family winery.",
    "The business expanded production and tasting locations, sought counseling, and pursued energy improvements.",
    "The profile reports more locations and staff and rising sales and profit, without a controlled comparison.",
    S("ruidosos-noisy-water-winery-sound-success"),
    {
      kind: "turnaround",
    }
  ),

  // 73
  makeCase(
    "DocTerra Mobile Veterinary Services",
    "health",
    "capital,capacity",
    "The veterinarian needed business planning and launch financing.",
    "She worked with a Veterans Business Outreach Center and obtained startup financing.",
    "The profile describes three mobile units and a rural service area without evaluating practice profitability.",
    S("2026-sba-north-carolina-rural-small-business-year-doc-terra-mobile-veterinary-services"),
    {
      kind: "launch",
    }
  ),

  // 74
  makeCase(
    "Boston Valley Animal Hospital",
    "health",
    "capital,shock,cash",
    "The founder needed launch financing and later faced pandemic disruption.",
    "She used business counseling, startup financing, and pandemic payroll assistance.",
    "The account describes continued hospital operations and staff continuity without a full financial comparison.",
    "https://legacy.sba.gov/success-stories/united-states-army-first-lieutenant-veterinarian-small-business-owner",
    {
      kind: "continuation",
    }
  ),

  // 75
  makeCase(
    "Holiday Inn Express & Suites — Gonzales, Guerra family",
    "hospitality",
    "capital,capacity,concentration",
    "A family operator wanted a second hotel during a local energy-driven demand boom but faced financing difficulties.",
    "The owners used SBA 504 financing through a community lender.",
    "The lender profile reports opening in August 2012 without long-term occupancy or post-boom results.",
    "https://bcloftexas.org/get-to-know-us/meet-our-clients/holiday-inn-express-suites",
    {
      limitation:
        "This concerns one family-owned franchise property, not the global hotel brand.",
      kind: "capacity_expansion",
    }
  ),

  // 76
  makeCase(
    "Sharrock's Bakery",
    "food",
    "capacity,capital,governance",
    "The family bakery needed machinery and capacity while maintaining its traditional product.",
    "The owners financed production equipment and developed national distribution.",
    "The profile reports weekly production above forty thousand packages and continued family operation.",
    S("sharrocks-bakery-produces-40k-packages-crumpets-weekly"),
    {
      kind: "capacity_expansion",
    }
  ),

  // 77
  makeCase(
    "American Insulated Panel",
    "manufacturing",
    "capital,capacity,governance",
    "An established manufacturer needed an ownership successor and production investment.",
    "New owners acquired it in 2023 using SBA-backed financing and added manufacturing equipment.",
    "The profile reports more employees and a wider service area without isolating investment returns.",
    S("taunton-based-american-insulated-panel-manufactures-installs-custom-cold-storage-solutions"),
    {
      kind: "ownership_transition",
    }
  ),

  // 78
  makeCase(
    "AccuRounds",
    "manufacturing",
    "shock,capacity,channel",
    "Pandemic disruption threatened workforce continuity while production needed to continue.",
    "The manufacturer used payroll support and continued investing in production technology.",
    "The profile reports subsequent growth and reshored work; the owner acknowledged uncertainty about tariffs' role.",
    S("accurounds-precision-manufacturing-ramping-home"),
    {
      kind: "continuation",
    }
  ),

  // 79
  makeCase(
    "LaCreek Development Corporation",
    "construction",
    "channel,capacity",
    "The founders identified demand for local construction expertise serving regulated institutional projects.",
    "They developed a contracting business and used relevant government-contracting certification.",
    "The profile reports an operating contractor but provides no distress or recovery history.",
    S("2025-chris-obrien-president-lacreek-development-corporation"),
    {
      kind: "growth_strategy",
    }
  ),

  // 80
  makeCase(
    "Preform Solutions",
    "manufacturing",
    "validation,capacity,capital",
    "Customers requested customized plastic preforms that the founder could not source.",
    "He started a manufacturing business with flexible mold-based production.",
    "The profile describes multiple production lines and SBA-backed borrowing without loan-level returns.",
    S("2025-south-dakota-small-business-manufacturer-year-preform-solutions-inc"),
    {
      kind: "growth_strategy",
    }
  ),

  // 81
  makeCase(
    "Tropical Smoothie Cafe — Kelli Ewert, Spearfish",
    "food",
    "shock,capital,channel",
    "The local franchise opened shortly before the pandemic.",
    "The owner used financing, business support, several ordering channels, and later refinancing.",
    "The account reports continued operation without a complete refinancing-savings calculation.",
    S("2025-south-dakota-small-business-administration-veteran-owned-small-business-year-award-kelli-ewert"),
    {
      limitation:
        "This is a local franchise owner's account, not the national system's financial history.",
      kind: "continuation",
    }
  ),

  // 82
  makeCase(
    "Caleb's Aquatics and Heads to Tails",
    "retail",
    "capacity,cash,validation",
    "The owner needed to understand the sales and costs of moving from home to commercial premises.",
    "He worked with SBDC on projections for successive moves and funded much of the growth internally.",
    "The profile reports larger premises and a second related store.",
    S("2025-caleb-hubert-calebs-aquatics-heads-tails-aberdeen-south-dakota-young-entrepreneur-year"),
    {
      limitation:
        "The owner's cautious approach to debt is not a universal financing rule.",
      kind: "capacity_expansion",
    }
  ),

  // 83
  makeCase(
    "Icarus Medical",
    "manufacturing",
    "capital,capacity",
    "The device manufacturer needed capital and internal production to meet demand.",
    "It obtained financing and added in-house 3D-printing capability.",
    "The profile reports a larger workforce and expanded products without measuring financing's causal return.",
    S("icarus-medical-uses-sba-financing-expand-made-america-mobility-technology"),
    {
      limitation:
        "This account does not independently evaluate medical efficacy.",
      kind: "capacity_expansion",
    }
  ),

  // 84
  makeCase(
    "Pieces: Board Game Bar and Restaurant",
    "food",
    "shock,cash,channel",
    "Pandemic restrictions closed the restaurant and threatened staff continuity.",
    "The owner used payroll support and proceeds from a related carryout cafe to keep staff paid.",
    "The profile reports reopening and staff returning.",
    S("filling-niche-unique-business-concept-pieces-board-game-bar-restaurant"),
    {
      limitation:
        "The related cafe's revenue is not Pieces standalone revenue.",
      kind: "continuation",
    }
  ),

  // 85
  makeCase(
    "Sugarfire Smokehouse — Charlie Downs restaurant operations",
    "food",
    "margin,cash,capacity",
    "The operator described compressed margins and rising labor and other expenses.",
    "He automated expense review, updated plans, investigated cost deviations, and worked on retention.",
    "The account describes ongoing management practices without a measured margin recovery.",
    S("careful-planning-plus-quality-ingredients-equal-success"),
    {
      limitation:
        "Several restaurants feature in the account. Margin commentary is not a verified Sugarfire-only series or industry benchmark.",
      analogOnly: true,
      kind: "cost_management",
    }
  ),

  // 86
  makeCase(
    "Willow Tree Tutoring",
    "education",
    "capacity,governance",
    "An unsuitable leased property created operating difficulties.",
    "The owner worked with SCORE while developing the business and moving premises.",
    "The profile reports a new location and continued tutoring without independently tested financial outcomes.",
    S("willow-tree-tutoring-how-personal-catastrophe-turned-great-opportunity"),
    {
      kind: "continuation",
    }
  ),

  // 87
  makeCase(
    "MDS Manufacturing",
    "manufacturing",
    "capacity,capital,shock",
    "The manufacturer faced capacity limits and pandemic payroll disruption.",
    "It combined equipment financing, planning support, growth training, and payroll assistance.",
    "The profile reports workforce growth and a pending facility purchase.",
    S("sba-was-there-every-step-way-mds-manufacturing-llc"),
    {
      limitation:
        "A pending property purchase is not recorded as completed.",
      kind: "capacity_expansion",
    }
  ),

  // 88
  makeCase(
    "Nine2Five",
    "human_resources",
    "cash,shock",
    "Pandemic disruption left the staffing business with very little cash.",
    "The owner obtained payroll support and a targeted disaster advance.",
    "The profile reports staff retention and subsequent growth.",
    S("nine2five-overcomes-economic-obstacles-sba-assistance-win-franchisee-year-2022"),
    {
      limitation:
        "The availability of emergency support was specific to that period.",
      kind: "continuation",
    }
  ),

  // 89
  makeCase(
    "Locs of Glory",
    "beauty",
    "capacity,capital",
    "The salon outgrew its home premises and needed staff and commercial space.",
    "The owner developed a plan with a business counselor and financed a larger salon.",
    "The profile reports a larger team and sales growth without an audited intervention effect.",
    S("sba-7a-loan-helps-salon-owner-share-glory-sisterlocks"),
    {
      kind: "capacity_expansion",
    }
  ),

  // 90
  makeCase(
    "Synergy Medical",
    "manufacturing",
    "capacity,governance,acquisition",
    "The established business wanted a more deliberate growth strategy.",
    "The founder completed executive training, implemented a plan, and reconsidered priorities and delegation.",
    "He reported sales increases without isolating training from other drivers.",
    S("sba-emerging-leaders-helps-veteran-soar-new-heights"),
    {
      kind: "growth_strategy",
    }
  ),

  // 91
  makeCase(
    "Ortmann Concrete",
    "construction",
    "capacity,capital,founder_dependency",
    "The contractor outgrew its home yard and informal operating setup.",
    "The owners purchased commercial premises and adopted planning practices from executive training.",
    "The account reports a centralized operation and larger team without quantified productivity returns.",
    S("sba-loan-emerging-leaders-program-make-concrete-companys-goals-attainable"),
    {
      kind: "capacity_expansion",
    }
  ),

  // 92
  makeCase(
    "Lickee's & Chewy's Candies & Creamery",
    "retail",
    "validation,capacity,capital",
    "The founder wanted to develop a distinctive confectionery destination.",
    "He used business training, counseling, and bank support to plan and open a themed store.",
    "The profile reports an operating store and additional space under development.",
    S("celebrating-10th-annual-national-veterans-small-business-week-nvsbw23-highlighting-local-veteran"),
    {
      limitation:
        "The planned production expansion is not a completed profit improvement.",
      kind: "growth_strategy",
    }
  ),

  // 93
  makeCase(
    "First Sip Studios",
    "professional_services",
    "validation,channel,acquisition",
    "The founders saw unmet demand for affordable communications services.",
    "They pivoted from merchandise subscriptions to multimedia services, training, and public-contract opportunities.",
    "The profile reports contracts and a growing client base without a comparable margin series.",
    S("sba-helps-veteran-business-owner-pivot-suds-social-media"),
    {
      kind: "pivot",
    }
  ),

  // 94
  makeCase(
    "Delta Solutions & Strategies",
    "professional_services",
    "channel,capacity",
    "The founder was developing specialized defense and space services.",
    "The company used business counseling and relevant veteran-business certification to pursue contracts.",
    "The profile reports a large workforce and contract portfolio.",
    S("veteran-certification-enables-lightyears-growth-space-tech-business"),
    {
      limitation:
        "This is a larger, specialized procurement analogy. Contract value is not recognized revenue or profit.",
      analogOnly: true,
      kind: "growth_strategy",
    }
  ),

  // 95
  makeCase(
    "Lovely Lash Company",
    "beauty",
    "validation,acquisition,cash",
    "The founder needed planning and cash-flow support when launching during the pandemic.",
    "She used veteran-business counseling, marketing support, and ongoing advice.",
    "The profile reports opening and continued operation without a measured financial effect from mentoring.",
    S("lovely-lash-company"),
    {
      kind: "launch",
    }
  ),

  // 96
  makeCase(
    "Bavarian Bakery and Deli",
    "food",
    "shock,channel,cash",
    "A bakery dependent on walk-in customers temporarily closed during restrictions.",
    "The owners added online ordering, curbside pickup, and delivery, alongside payroll and disaster support.",
    "The profile describes continued operation without isolating each change's effect.",
    S("fresh-baked-success-german-inspired-bakery-becomes-delaware-staple"),
    {
      kind: "channel_pivot",
    }
  ),

  // 97
  makeCase(
    "Hair Journeys Salon and Beauty Bar",
    "beauty",
    "acquisition,validation,governance",
    "The founder needed business-management skills alongside her styling experience.",
    "She used veteran-business training and ongoing mentoring.",
    "The account describes ten years of operation without a financial time series or tested retention intervention.",
    S("army-air-force-new-yorks-go-hair-source"),
    {
      kind: "continuation",
    }
  ),

  // 98
  makeCase(
    "West Oakland Auto Repair",
    "automotive",
    "capacity,capital",
    "The shop outgrew hand tools and a small facility as demand increased.",
    "The owners used microloans and partner financing for equipment and a larger property.",
    "The profile reports faster work after buying a lift and greater vehicle capacity.",
    S("growing-together-how-sba-helped-west-oakland-auto-repair-start-scale"),
    {
      limitation:
        "The source does not supply an audited return-on-investment calculation.",
      kind: "capacity_expansion",
    }
  ),

  // 99
  makeCase(
    "The Studio — Lisa Cochran",
    "beauty",
    "capital,shock,cash",
    "The salon needed expansion financing and later faced pandemic revenue losses.",
    "The owner used business planning, financing, and emergency payroll and disaster support.",
    "The profile describes a second salon and continued operations without isolating any program's effect.",
    S("studio-looking-good-doing-good"),
    {
      kind: "continuation",
    }
  ),

  // 100
  makeCase(
    "Bellden Cafe",
    "food",
    "capital,cash,shock,channel",
    "Unexpected construction expenses, a bank rejection, and later pandemic sales losses created cash pressure.",
    "The owner obtained a microloan and later emergency support while adding takeout, delivery, and curbside service.",
    "The profile reports earlier staff expansion and keeping staff paid during disruption.",
    S("mission-driven-cafe-gets-support-sba-continue-serving"),
    {
      limitation:
        "Financing and operating changes happened together; their separate effects are unknown.",
      kind: "continuation",
    }
  ),
];

// Catch an incomplete paste or accidental deletion.
if (cases.length !== 100) {
  throw new Error(
    `Expected 100 historical cases, but found ${cases.length}.`
  );
}

const uniqueIds = new Set(cases.map((item) => item.id));

if (uniqueIds.size !== cases.length) {
  throw new Error("Historical case IDs must be unique.");
}

// Compatible with the website's existing call:
//
// matchCases(forecast(profile).warnings)
//
// You can also pass the business profile:
//
// matchCases(forecast(profile).warnings, profile)
//
// All cases remain searchable. Risk-tag matches are ranked first.
// The ranking is not a similarity percentage or a health score.

export function matchCases(warnings = [], context = {}) {
  const riskIds = new Set(
    warnings
      .map((warning) => warning?.id)
      .filter((id) => typeof id === "string")
  );

  const industryAliases = {
    "Software / AI": "software",
    Services: "professional_services",
  };

  const industry =
    industryAliases[context.industry] ||
    context.industry ||
    null;

  return cases
    .map((item) => {
      const matched = item.tags.filter((tag) =>
        riskIds.has(tag)
      );

      const sameIndustry = Boolean(
        industry && item.industry === industry
      );

      return {
        ...item,
        matched,
        sameIndustry,
        matchLabel:
          matched.length === 0
            ? "General historical context"
            : sameIndustry
              ? "Sector and risk context"
              : "Risk context; sector may differ",
      };
    })
    .sort(
      (a, b) =>
        Number(b.matched.length > 0) -
          Number(a.matched.length > 0) ||
        Number(b.sameIndustry) -
          Number(a.sameIndustry) ||
        b.matched.length - a.matched.length ||
        a.company.localeCompare(b.company)
    );
}
