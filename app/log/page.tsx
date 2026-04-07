import ContributionGraph from "../components/ContributionGraph";
import Divider from "../components/Divider";
import PageFrame from "../components/PageFrame";
import { logs } from "../lib/logs";
import editorial from "../styles/editorial.module.css";

export default function BuildLog() {
  const entries = [...logs].reverse();

  return (
    <PageFrame>
      <section className={editorial.intro} data-ruler-track>
        <div className={editorial.introBlock}>
          <span className={editorial.eyebrow}>/log</span>
          <div className={editorial.introCopy}>
            <h1 className={editorial.pageTitle}>Build Log</h1>
            <p className={editorial.pageTagline}>
              A public record of building this site from scratch and learning design engineering along the way.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      <section className={editorial.graphSection} data-ruler-track>
        <div className={editorial.graphBlock}>
          <ContributionGraph logs={logs} startDate="March 8, 2026" />
        </div>
      </section>

      <Divider />

      <section className={editorial.section} data-ruler-track>
        <div className={editorial.sectionBlock}>
          <div className={editorial.list}>
            {entries.map((log, index) => (
              <article key={`${log.date}-${index}`} className={editorial.listItem}>
                <span className={editorial.date}>{log.date}</span>
                <p className={editorial.logEntry}>{log.entry}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
