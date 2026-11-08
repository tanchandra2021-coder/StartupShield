export const metadata = {
  title: "About | StartupShield",
  description:
    "A founder’s own investment committee. Evaluate risks, explore historical experiences, and test your next move.",
};

const risks = [
  ["Demand", "Are interested prospects becoming paying customers?"],
  ["Cash", "How long can your business cover its spending?"],
  ["Pricing", "Does each sale contribute enough to cover costs?"],
  ["Competition", "Do buyers have a reason to choose you?"],
  ["Retention & execution", "Do customers stay, and does your team deliver?"],
];

export default function AboutPage() {
  return (
    <main className="about">
      <nav>
        <a className="brand" href="/">StartupShield</a>
        <a href="/diagnostics">Try the checkup ↗</a>
      </nav>

      <header>
        <p className="eyebrow">A FOUNDER’S OWN INVESTMENT COMMITTEE</p>

        <h1>
          Investors evaluate your business.
          <br />
          <em>You deserve to, too.</em>
        </h1>

        <p className="lead">
          You are investing your savings, time, and future.
          StartupShield gives you a structured way to examine
          the business before your next big commitment.
        </p>

        <a className="button" href="/diagnostics">
          Evaluate my business ↗
        </a>
      </header>

      <section className="reality">
        <p className="eyebrow">WHY THIS MATTERS</p>

        <h2>
          Starting takes belief.
          <br />
          <em>Decisions need evidence.</em>
        </h2>

        <div className="stats">
          <article>
            <strong>49.4%</strong>
            <p>No longer operating after five years.</p>
          </article>

          <article>
            <strong>65.3%</strong>
            <p>No longer operating after ten years.</p>
          </article>
        </div>

        <p>
          Cash pressure, weak conversion, thin margins, customer
          loss, and delivery gaps deserve attention while there
          is still room to act.
        </p>

        <p className="small">
          Figures calculated from BLS survival rates for U.S.
          private-sector establishments opened in March 2013.
          Establishments are business locations, not exclusively
          startups. Closure does not always mean financial failure,
          and these figures do not establish its causes.{" "}
          <a
            href="https://www.bls.gov/opub/ted/2024/34-7-percent-of-business-establishments-born-in-2013-were-still-operating-in-2023.htm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source ↗
          </a>
        </p>
      </section>

      <section>
        <p className="eyebrow">FIVE QUESTIONS. ONE CHECKUP.</p>
        <h2>Understand where you stand.</h2>

        <div className="risks">
          {risks.map(([title, question], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{question}</p>
              </div>
            </article>
          ))}
        </div>

        <p>
          Enter your evidence. Receive calculated findings,
          see what remains unknown, and explore historical
          companies that faced related challenges.
          Then compare a financial scenario or choose your
          next investigation.
        </p>
      </section>

      <section className="dark">
        <p className="eyebrow">WHY NOT JUST ASK CHATGPT OR CLAUDE?</p>

        <h2>
          The framework is built.
          <br />
          <em>You bring the evidence.</em>
        </h2>

        <p>
          AI assistants can analyze numbers and explain business
          problems. StartupShield provides a specific evaluation
          workflow immediately, without asking you to design it.
        </p>

        <div className="features">
          <article>
            <h3>No prompt engineering.</h3>
            <p>
              Defined questions guide you through five areas.
              You do not have to know what to ask first.
            </p>
          </article>

          <article>
            <h3>Consistent calculations.</h3>
            <p>
              Programmed formulas calculate conversion, runway,
              margins, and churn. Change the inputs and see
              how the calculated results change.
            </p>
          </article>

          <article>
            <h3>Historical context, built in.</h3>
            <p>
              Eligible cases are selected from a curated library
              using shared risk tags, with source links,
              reported responses, and comparison limits.
            </p>
          </article>

          <article>
            <h3>Interactive financial scenarios.</h3>
            <p>
              Adjust pricing, sales loss, or fixed costs and
              compare the projected cash paths in the dashboard.
              No new conversation is required.
            </p>
          </article>
        </div>

        <p className="closing">
          A repeatable business checkup, ready whenever
          you need to make a decision.
        </p>

        <p className="small">
          These workflows can also be built with AI tools.
          Our advantage is providing them together in a focused
          product. The core checkup requires no paid AI API key.
        </p>
      </section>

      <section>
        <p className="eyebrow">WHERE WE FIT</p>
        <h2>Evaluate the business behind the money.</h2>

        <div className="comparison">
          <article>
            <h3>
              <a href="https://ramp.com/spend-management">
                Ramp ↗
              </a>
            </h3>
            <p>
              Emphasizes financial operations, spending,
              corporate cards, and expense workflows.
            </p>
          </article>

          <article>
            <h3>
              <a href="https://www.meow.com/">Meow ↗</a>
            </h3>
            <p>
              Emphasizes business banking services through
              partners, treasury offerings, and payments.
            </p>
          </article>

          <article className="highlight">
            <h3>StartupShield</h3>
            <p>
              Helps founders evaluate business assumptions
              through a five-risk checkup, historical context,
              and financial scenarios.
            </p>
          </article>
        </div>

        <p className="small">
          These are differences in product emphasis, not
          claims of exclusive capabilities. The tools can
          be complementary.
        </p>
      </section>

      <section className="mission">
        <p className="eyebrow">OUR MISSION</p>

        <h2>
          Give the person taking the risk
          <br />
          <em>a clearer view of it.</em>
        </h2>

        <p>
          Founders deserve an accessible way to challenge
          assumptions, understand the numbers, and decide
          what to investigate next.
        </p>

        <a className="button" href="/diagnostics">
          Run my business checkup ↗
        </a>

        <p className="small">
          StartupShield is an early prototype. Results depend
          on entered information and assumptions. Historical
          cases are context, not proof of causation.
          The product does not predict failure or guarantee survival.
        </p>
      </section>

      <footer>
        <a className="brand" href="/">StartupShield</a>
        <a href="/">Financial dashboard ↗</a>
      </footer>

      <style>{`
        .about {
          background: #f8f7f3;
          color: #34372f;
          font-family: Arial, sans-serif;
          line-height: 1.7;
        }

        .about * {
          box-sizing: border-box;
        }

        .about nav,
        .about header,
        .about section,
        .about footer {
          padding-left: max(22px, calc((100% - 1050px) / 2));
          padding-right: max(22px, calc((100% - 1050px) / 2));
        }

        .about nav,
        .about footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          padding-top: 23px;
          padding-bottom: 23px;
        }

        .about nav {
          border-bottom: 1px solid #deded5;
        }

        .about a {
          color: #193ec2;
        }

        .about .brand {
          font-family: Georgia, serif;
          font-style: italic;
          font-size: 27px;
          color: #34372f;
          text-decoration: none;
        }

        .about header {
          padding-top: 75px;
          padding-bottom: 75px;
          text-align: center;
        }

        .about .eyebrow {
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
          line-height: 1.15;
        }

        .about h1 {
          font-size: clamp(42px, 6vw, 72px);
          letter-spacing: -2px;
          margin: 20px 0 28px;
        }

        .about h2 {
          font-size: clamp(32px, 4vw, 47px);
          letter-spacing: -1px;
          margin: 12px 0 25px;
        }

        .about h3 {
          font-size: 25px;
          margin: 0 0 12px;
        }

        .about .lead {
          max-width: 700px;
          margin: 0 auto 30px;
          font-size: 20px;
          color: #6b7064;
        }

        .about .button {
          display: inline-block;
          background: #193ec2;
          color: white;
          border-radius: 35px;
          padding: 15px 25px;
          text-decoration: none;
        }

        .about section {
          padding-top: 60px;
          padding-bottom: 60px;
        }

        .about section > p {
          max-width: 850px;
        }

        .about .reality {
          background: #eae6dc;
        }

        .about .stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 25px;
          margin: 30px 0;
        }

        .about .stats article {
          border-top: 1px solid #bfc0b4;
          padding-top: 15px;
        }

        .about .stats strong {
          font-family: Georgia, serif;
          font-weight: 400;
          font-size: clamp(50px, 7vw, 80px);
          letter-spacing: -2px;
        }

        .about .stats p {
          margin-top: 0;
        }

        .about .small {
          font-size: 12px;
          color: #6b7064;
          margin-top: 24px;
        }

        .about .risks article {
          display: grid;
          grid-template-columns: 45px minmax(0, 1fr);
          gap: 18px;
          padding: 20px 0;
          border-top: 1px solid #deded5;
        }

        .about .risks article > span {
          color: #818777;
          font-family: Georgia, serif;
          font-size: 27px;
        }

        .about .risks h3 {
          margin-bottom: 5px;
        }

        .about .risks p {
          margin: 0;
          color: #6b7064;
        }

        .about .dark {
          background: #171a16;
          color: #f8f7f3;
        }

        .about .features {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 30px;
          margin-top: 35px;
        }

        .about .features article {
          border-top: 1px solid #51574a;
          padding-top: 22px;
        }

        .about .features p,
        .about .dark .small {
          color: #c0c5b9;
        }

        .about .closing {
          font-family: Georgia, serif;
          font-size: 28px;
          line-height: 1.35;
          margin-top: 35px;
        }

        .about .comparison {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-top: 30px;
        }

        .about .comparison article {
          border: 1px solid #deded5;
          border-radius: 14px;
          padding: 23px;
        }

        .about .comparison p {
          font-size: 14px;
        }

        .about .highlight {
          background: #edf0f9;
        }

        .about .mission {
          background: #eeeee7;
        }

        .about .mission .button {
          margin-top: 15px;
        }

        .about footer {
          border-top: 1px solid #deded5;
        }

        @media (max-width: 650px) {
          .about header {
            padding-top: 45px;
            padding-bottom: 45px;
          }

          .about section {
            padding-top: 42px;
            padding-bottom: 42px;
          }

          .about .stats,
          .about .features,
          .about .comparison {
            grid-template-columns: 1fr;
          }

          .about .lead {
            font-size: 18px;
          }
        }
      `}</style>
    </main>
  );
}
