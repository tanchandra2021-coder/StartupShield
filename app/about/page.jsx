export const metadata = {
  title: "About | StartupShield",
  description:
    "A founder’s own investment committee. Understand business risks, explore historical context, and test your next move.",
};

const risks = [
  {
    number: "01",
    title: "Interest that never becomes revenue.",
    problem:
      "People can like an idea without being willing to pay for it. Building more features does not resolve that uncertainty.",
    help:
      "Compare paid conversion with your own target and identify when more customer evidence is needed.",
  },
  {
    number: "02",
    title: "Cash that runs out before the plan works.",
    problem:
      "A promising business can still face a cash shortfall. Hiring, bills, and customer payment timing create pressure before growth arrives.",
    help:
      "Calculate net burn and projected runway, then compare hypothetical changes to spending, pricing, and sales.",
  },
  {
    number: "03",
    title: "Growth that does not pay for itself.",
    problem:
      "More sales can create more work without enough money left to cover fixed costs. Revenue alone does not reveal the economics.",
    help:
      "Calculate contribution margin and break-even sales using the costs and prices you enter.",
  },
  {
    number: "04",
    title: "A difference buyers do not value.",
    problem:
      "A product can be different without giving customers a compelling reason to switch from what they already use.",
    help:
      "Structure your comparison with existing alternatives and distinguish a proposed advantage from reported buyer support.",
  },
  {
    number: "05",
    title: "Customers leaving. Commitments slipping.",
    problem:
      "Customer acquisition can hide customer loss. An ambitious plan can also outpace the team’s ability to deliver it.",
    help:
      "Review customer churn and missed milestones so you can choose a specific problem to investigate.",
  },
];

const workflow = [
  {
    title: "Bring the evidence.",
    text:
      "Enter the numbers you have. Leave unknowns blank. No bank connection or paid AI key is required for the core checkup.",
  },
  {
    title: "See the pressure points.",
    text:
      "Receive calculated findings across five areas, with clear targets, assumptions, and gaps in the evidence.",
  },
  {
    title: "Learn from another chapter.",
    text:
      "Explore eligible historical cases with shared risk tags, reported responses, outcomes, and source links.",
  },
  {
    title: "Choose a better next test.",
    text:
      "Compare a financial scenario or investigate a specific customer question before making the next commitment.",
  },
];

const differences = [
  {
    title: "A defined process from the first click.",
    text:
      "The questions, calculations, and result structure are already built. Founders do not need to design a financial model or write a sophisticated prompt to get started.",
  },
  {
    title: "Numbers calculated by explicit rules.",
    text:
      "Runway, conversion, contribution margin, and churn come from the entered values and programmed formulas. The same inputs and assumptions produce the same calculated results.",
  },
  {
    title: "Missing evidence stays visible.",
    text:
      "An unanswered question produces an evidence gap. An untested advantage stays a hypothesis. The app does not turn missing information into a confident business verdict.",
  },
  {
    title: "History with the comparison limits attached.",
    text:
      "Related cases show what another company reportedly faced and did. Sources and limitations help founders judge whether that experience is useful in their own situation.",
  },
];

const sources = [
  {
    title: "U.S. Bureau of Labor Statistics",
    detail:
      "Survival of private-sector establishments opened in March 2013, measured through March 2023.",
    url:
      "https://www.bls.gov/opub/ted/2024/34-7-percent-of-business-establishments-born-in-2013-were-still-operating-in-2023.htm",
  },
  {
    title: "U.S. Small Business Administration",
    detail:
      "Market research and competitive analysis: demand, pricing, alternatives, and direct customer research.",
    url:
      "https://www.sba.gov/business-guide/plan-your-business/market-research-competitive-analysis",
  },
  {
    title: "Ramp",
    detail: "Official overview of spend management capabilities.",
    url: "https://ramp.com/spend-management",
  },
  {
    title: "Meow",
    detail: "Official overview of business banking and financial services.",
    url: "https://www.meow.com/",
  },
  {
    title: "ChatGPT",
    detail: "Official documentation describing data analysis capabilities.",
    url:
      "https://help.openai.com/en/articles/9213685-extracting-insights-with-chatgpt-data-analysis",
  },
  {
    title: "Claude",
    detail: "Official explanation of code-based analysis capabilities.",
    url: "https://claude.com/blog/analysis-tool",
  },
];

export default function AboutPage() {
  return (
    <main className="about">
      <nav aria-label="Main navigation" className="nav">
        <a className="brand" href="/">
          StartupShield
        </a>

        <div className="navLinks">
          <a href="/">Financial dashboard</a>
          <a href="/diagnostics">Research my market ↗</a>
        </div>
      </nav>

      <header className="hero">
        <p className="eyebrow">WHY WE BUILT STARTUPSHIELD</p>

        <h1>
          Your ambition deserves
          <br />
          <em>a second set of eyes.</em>
        </h1>

        <p className="heroText">
          Investors evaluate a business before they commit their money.
          Founders deserve a structured way to evaluate the business
          they commit their time, savings, and future to.
        </p>

        <div className="pitch">
          <span className="eyebrow">THE IDEA IN ONE SENTENCE</span>
          <p>
            StartupShield is a founder’s own investment committee:
            a guided checkup that turns business evidence into
            clear risks, historical context, and a next move to test.
          </p>
        </div>

        <a className="primary" href="/diagnostics">
          Run your business checkup ↗
        </a>
      </header>

      <section className="reality" aria-labelledby="reality-title">
        <p className="eyebrow">THE STAKES ARE REAL</p>

        <h2 id="reality-title">
          Behind every closed business,
          <br />
          <em>someone had a plan.</em>
        </h2>

        <div className="stats">
          <article>
            <strong>20.4%</strong>
            <p>No longer operating after one year.</p>
          </article>

          <article>
            <strong>49.4%</strong>
            <p>No longer operating after five years.</p>
          </article>

          <article>
            <strong>65.3%</strong>
            <p>No longer operating after ten years.</p>
          </article>
        </div>

        <p className="sourceNote">
          Calculated from BLS survival rates for U.S. private-sector
          business establishments opened in March 2013. These figures
          describe one historical cohort of business locations, not
          exclusively small businesses or venture-backed startups.
          Closure is not always financial failure, and these data do
          not identify why an establishment closed.{" "}
          <a href={sources[0].url} target="_blank" rel="noopener noreferrer">
            View the underlying data ↗
          </a>
        </p>

        <p className="realityText">
          A closure can affect an owner’s savings, a team’s jobs,
          and the customers who depended on them. Our mission is to
          help founders examine the evidence while they still have
          decisions to make.
        </p>
      </section>

      <section className="section">
        <p className="eyebrow">THE FOUNDER’S EVALUATION GAP</p>

        <h2>
          You should not need an investor
          <br />
          <em>to ask investor-level questions.</em>
        </h2>

        <div className="twoColumns">
          <p>
            Are customers paying? Does each sale make economic sense?
            How long can the cash last? Why would someone switch?
            Can the team keep its promises?
          </p>

          <p>
            Those questions matter before a pitch meeting, a new hire,
            or another month of spending. StartupShield gives founders
            a place to work through them themselves, using a structured
            process they can understand and repeat.
          </p>
        </div>

        <div className="statement">
          <p>
            Before you ask someone else to believe in your business,
            understand what the evidence says about it.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="risks-title">
        <p className="eyebrow">FIVE QUESTIONS WORTH ASKING EARLY</p>

        <h2 id="risks-title">
          Find the pressure.
          <br />
          <em>Then choose the next move.</em>
        </h2>

        <p className="sectionIntro">
          Businesses close for many interconnected reasons. We focus
          on five practical areas founders can investigate—not a
          universal ranking of failure causes.
        </p>

        <div className="riskList">
          {risks.map(risk => (
            <article className="risk" key={risk.number}>
              <span className="riskNumber">{risk.number}</span>

              <div>
                <h3>{risk.title}</h3>
                <p>{risk.problem}</p>

                <p className="help">
                  <strong>How StartupShield helps</strong>
                  {risk.help}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="darkSection">
        <p className="eyebrow">FROM UNCERTAINTY TO AN INVESTIGATION</p>

        <h2>
          A process you can use.
          <br />
          <em>A result you can explain.</em>
        </h2>

        <div className="workflow">
          {workflow.map((step, index) => (
            <article key={step.title}>
              <span className="stepNumber">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className="example">
          <p className="eyebrow">ONE SIMPLE EXAMPLE</p>

          <p>
            You have $24,000 in cash. Monthly revenue is $12,000,
            and entered monthly costs total $21,000.
          </p>

          <p className="exampleResult">
            That is a $9,000 monthly shortfall:
            approximately 2.7 months of cash at unchanged levels.
          </p>

          <p>
            The dashboard lets you compare a possible change.
            The checkup helps you investigate the underlying business
            questions, including conversion, pricing, and customer loss.
          </p>

          <small>
            Fictional illustration. Payment timing, taxes, financing,
            and implementation costs may change a real company’s outlook.
          </small>
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">WHERE WE FIT</p>

        <h2>
          A place to evaluate
          <br />
          <em>the business behind the numbers.</em>
        </h2>

        <p className="sectionIntro">
          Ramp and Meow address important financial workflows.
          StartupShield focuses on a founder’s structured assessment
          of the business and its assumptions. These tools can be
          complementary.
        </p>

        <div className="tableWrap">
          <table>
            <caption>
              Product positioning, not an exhaustive feature comparison
            </caption>

            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">What it emphasizes</th>
                <th scope="col">The founder’s question</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <th scope="row">
                  <a href="https://ramp.com/spend-management">
                    Ramp ↗
                  </a>
                </th>
                <td>
                  Financial operations, including corporate cards,
                  expense management, bill payments, and spend controls.
                </td>
                <td>How do we manage company spending?</td>
              </tr>

              <tr>
                <th scope="row">
                  <a href="https://www.meow.com/">Meow ↗</a>
                </th>
                <td>
                  Business banking services through partners,
                  treasury offerings, cards, and payments.
                </td>
                <td>How do we hold, move, and manage our money?</td>
              </tr>

              <tr className="highlight">
                <th scope="row">StartupShield</th>
                <td>
                  A guided five-risk checkup, financial scenarios,
                  and curated historical comparisons.
                </td>
                <td>
                  What does our evidence reveal about the business,
                  and what should we investigate next?
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="sourceNote">
          Summaries describe product emphasis rather than exclusive
          capabilities. Financial platforms have overlapping features
          and evolve over time. See the official product sources below.
        </p>
      </section>

      <section className="section">
        <p className="eyebrow">WHY USE THIS INSTEAD OF STARTING A CHAT?</p>

        <h2>
          The evaluation framework
          <br />
          <em>is already built.</em>
        </h2>

        <p className="sectionIntro">
          ChatGPT and Claude can analyze data, perform calculations,
          and help build financial models. StartupShield packages a
          specific founder workflow into a ready-to-use interface:
          defined inputs, programmed calculations, historical matches,
          and consistent explanations.
        </p>

        <div className="differenceGrid">
          {differences.map(item => (
            <article className="difference" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="statement">
          <p>
            You bring the evidence.
            <br />
            StartupShield gives you a process for examining it.
          </p>
        </div>
      </section>

      <section className="section mission">
        <p className="eyebrow">OUR MISSION</p>

        <h2>
          Give the person taking the risk
          <br />
          <em>a clearer view of it.</em>
        </h2>

        <p>
          We built StartupShield for founders who are making consequential
          decisions without a dedicated finance team or a formal
          evaluation process. The goal is practical: make the numbers
          understandable, make assumptions visible, and make the next
          question easier to identify.
        </p>

        <p>
          StartupShield is an early prototype. Its checkup is based on
          entered information and explicit rules. Historical cases
          provide context, not proof that a response will work.
          It does not predict failure, guarantee survival, or replace
          professional judgment.
        </p>

        <div className="ctaRow">
          <a className="primary" href="/diagnostics">
            Research my market ↗
          </a>

          <a className="secondary" href="/">
            Explore my financial outlook ↗
          </a>
        </div>
      </section>

      <section className="sources" aria-labelledby="sources-title">
        <h2 id="sources-title">Sources & context</h2>

        <ol>
          {sources.map(source => (
            <li key={source.title}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {source.title} ↗
              </a>
              <p>{source.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer>
        <a className="brand" href="/">StartupShield</a>
        <p>A founder’s own investment committee.</p>
      </footer>

      <style>{`
        .about {
          --paper: #f8f7f3;
          --ink: #34372f;
          --muted: #6b7064;
          --line: #deded5;
          --blue: #193ec2;
          background: var(--paper);
          color: var(--ink);
          font-family: Arial, sans-serif;
          line-height: 1.7;
          overflow-wrap: break-word;
        }

        .about * {
          box-sizing: border-box;
        }

        .about .nav,
        .about .hero,
        .about .section,
        .about .reality,
        .about .darkSection,
        .about .sources,
        .about footer {
          padding-left: max(22px, calc((100% - 1120px) / 2));
          padding-right: max(22px, calc((100% - 1120px) / 2));
        }

        .about .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 22px;
          padding-top: 22px;
          padding-bottom: 22px;
          border-bottom: 1px solid var(--line);
        }

        .about a {
          color: var(--blue);
        }

        .about .brand {
          color: var(--ink);
          font-family: Georgia, serif;
          font-size: 27px;
          font-style: italic;
          text-decoration: none;
        }

        .about .navLinks {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          font-size: 14px;
        }

        .about .navLinks a {
          color: var(--ink);
          text-decoration: none;
        }

        .about .hero {
          padding-top: 85px;
          padding-bottom: 85px;
          text-align: center;
        }

        .about .eyebrow {
          display: block;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .about h1,
        .about h2,
        .about h3 {
          font-family: Georgia, serif;
          font-weight: 400;
          line-height: 1.13;
        }

        .about h1 {
          font-size: clamp(43px, 6.8vw, 84px);
          letter-spacing: -2.5px;
          margin: 20px 0 28px;
        }

        .about h2 {
          font-size: clamp(33px, 4.4vw, 54px);
          letter-spacing: -1px;
          margin: 12px 0 28px;
        }

        .about h3 {
          font-size: 27px;
          margin: 0 0 14px;
        }

        .about .heroText {
          font-size: 20px;
          max-width: 740px;
          color: var(--muted);
          margin: 0 auto 30px;
        }

        .about .pitch {
          max-width: 760px;
          margin: 35px auto;
          padding: 26px;
          background: #eeeee7;
          border-radius: 16px;
        }

        .about .pitch p {
          margin: 0;
          font-size: 20px;
        }

        .about .primary,
        .about .secondary {
          display: inline-block;
          text-decoration: none;
          padding: 15px 25px;
          border-radius: 35px;
          text-align: center;
        }

        .about .primary {
          color: white;
          background: var(--blue);
          border: 1px solid var(--blue);
        }

        .about .secondary {
          color: var(--ink);
          border: 1px solid #c8ccbd;
        }

        .about .section,
        .about .reality,
        .about .darkSection {
          padding-top: 75px;
          padding-bottom: 75px;
        }

        .about .reality {
          background: #eae6dc;
        }

        .about .stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          margin: 40px 0 25px;
        }

        .about .stats article {
          border-top: 1px solid #bfc0b4;
          padding-top: 20px;
        }

        .about .stats strong {
          font-family: Georgia, serif;
          font-weight: 400;
          font-size: clamp(48px, 7vw, 82px);
          letter-spacing: -2px;
        }

        .about .stats p {
          margin-top: 4px;
        }

        .about .sourceNote {
          font-size: 12px;
          color: var(--muted);
        }

        .about .realityText {
          max-width: 780px;
          font-size: 20px;
          margin-top: 30px;
        }

        .about .twoColumns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 45px;
          color: var(--muted);
          font-size: 18px;
        }

        .about .statement {
          border-left: 3px solid var(--blue);
          padding: 7px 0 7px 25px;
          margin-top: 38px;
        }

        .about .statement p {
          font-family: Georgia, serif;
          font-size: clamp(25px, 3vw, 35px);
          line-height: 1.35;
          max-width: 850px;
          margin: 0;
        }

        .about .sectionIntro {
          color: var(--muted);
          max-width: 790px;
          font-size: 18px;
          margin-bottom: 35px;
        }

        .about .risk {
          display: grid;
          grid-template-columns: 65px minmax(0, 1fr);
          gap: 20px;
          border-top: 1px solid var(--line);
          padding: 30px 0;
        }

        .about .riskNumber {
          font-family: Georgia, serif;
          font-size: 32px;
          color: #858b7a;
        }

        .about .risk p {
          max-width: 820px;
          color: var(--muted);
        }

        .about .help {
          padding: 18px;
          border-radius: 12px;
          background: #edf0f9;
        }

        .about .help strong {
          display: block;
          color: var(--ink);
          margin-bottom: 5px;
        }

        .about .darkSection {
          background: #171a16;
          color: #f8f7f3;
        }

        .about .workflow {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 35px;
          margin-top: 40px;
        }

        .about .workflow article {
          border-top: 1px solid #51574a;
          padding-top: 22px;
        }

        .about .stepNumber {
          display: block;
          color: #bdc8ac;
          font-size: 13px;
          margin-bottom: 14px;
        }

        .about .workflow p,
        .about .example small {
          color: #c0c5b9;
        }

        .about .example {
          border: 1px solid #51574a;
          border-radius: 17px;
          padding: 28px;
          margin-top: 45px;
        }

        .about .exampleResult {
          font-family: Georgia, serif;
          font-size: 29px;
          line-height: 1.35;
        }

        .about .tableWrap {
          overflow-x: auto;
          border: 1px solid var(--line);
          border-radius: 14px;
        }

        .about table {
          border-collapse: collapse;
          width: 100%;
          min-width: 640px;
          text-align: left;
          font-size: 14px;
        }

        .about caption {
          text-align: left;
          padding: 16px 20px;
          font-size: 12px;
          color: var(--muted);
        }

        .about th,
        .about td {
          padding: 20px;
          vertical-align: top;
          border-top: 1px solid var(--line);
        }

        .about thead {
          background: #eeeee7;
        }

        .about tbody th {
          width: 155px;
        }

        .about .highlight {
          background: #edf0f9;
        }

        .about .differenceGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .about .difference {
          border: 1px solid var(--line);
          border-radius: 15px;
          padding: 25px;
        }

        .about .difference p {
          color: var(--muted);
        }

        .about .mission {
          background: #eeeee7;
        }

        .about .mission > p:not(.eyebrow) {
          max-width: 820px;
        }

        .about .ctaRow {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 30px;
        }

        .about .sources {
          padding-top: 50px;
          padding-bottom: 45px;
        }

        .about .sources h2 {
          font-size: 29px;
        }

        .about .sources ol {
          padding-left: 22px;
        }

        .about .sources li {
          margin-bottom: 17px;
          font-size: 14px;
        }

        .about .sources p {
          margin: 3px 0;
          font-size: 12px;
          color: var(--muted);
        }

        .about footer {
          border-top: 1px solid var(--line);
          padding-top: 25px;
          padding-bottom: 30px;
        }

        .about footer p {
          font-size: 13px;
          color: var(--muted);
        }

        @media (max-width: 650px) {
          .about .nav {
            align-items: flex-start;
            flex-direction: column;
          }

          .about .hero {
            padding-top: 45px;
            padding-bottom: 50px;
          }

          .about .heroText {
            font-size: 18px;
          }

          .about .stats,
          .about .twoColumns,
          .about .workflow,
          .about .differenceGrid {
            grid-template-columns: 1fr;
            gap: 22px;
          }

          .about .risk {
            grid-template-columns: 38px minmax(0, 1fr);
            gap: 12px;
          }

          .about .section,
          .about .reality,
          .about .darkSection {
            padding-top: 48px;
            padding-bottom: 48px;
          }
        }
      `}</style>
    </main>
  );
}
