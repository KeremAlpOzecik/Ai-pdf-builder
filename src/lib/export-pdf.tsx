import type { ReactNode } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import type { CVData } from "@/types/cv";

Font.register({
  family: "NotoSans",
  src: "/fonts/NotoSans-Regular.ttf",
  fontWeight: 400,
});

Font.register({
  family: "NotoSans",
  src: "/fonts/NotoSans-Regular.ttf",
  fontWeight: 700,
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontFamily: "NotoSans",
    fontSize: 10,
    color: "#111111",
    lineHeight: 1.35,
  },
  name: {
    fontSize: 18,
    fontFamily: "NotoSans",
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 11,
    textAlign: "center",
    marginBottom: 6,
  },
  contact: {
    fontSize: 9,
    textAlign: "center",
    marginBottom: 14,
    color: "#333333",
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 12,
    fontFamily: "NotoSans",
    fontWeight: 700,
    borderBottomWidth: 1,
    borderBottomColor: "#111111",
    paddingBottom: 3,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  row: {
    marginBottom: 6,
  },
  jobTitle: {
    fontFamily: "NotoSans",
    fontWeight: 700,
    fontSize: 10.5,
  },
  meta: {
    fontSize: 9,
    color: "#333333",
    marginBottom: 2,
  },
  bullet: {
    marginLeft: 10,
    marginBottom: 2,
  },
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      {children}
    </View>
  );
}

export function CvPdfDocument({ cv }: { cv: CVData }) {
  const p = cv.personalInfo;
  const contact = [
    p.email,
    p.phone,
    p.location,
    p.linkedinUrl,
    p.githubUrl,
    p.portfolioUrl,
  ]
    .filter(Boolean)
    .join("  |  ");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{p.fullName || "Curriculum Vitae"}</Text>
        {p.title ? <Text style={styles.title}>{p.title}</Text> : null}
        {contact ? <Text style={styles.contact}>{contact}</Text> : null}

        {p.summary ? (
          <Section title="Professional Summary">
            <Text>{p.summary}</Text>
          </Section>
        ) : null}

        {cv.workExperience.length ? (
          <Section title="Experience">
            {cv.workExperience.map((job) => (
              <View key={job.id} style={styles.row}>
                <Text style={styles.jobTitle}>
                  {job.position}
                  {job.company ? `  |  ${job.company}` : ""}
                </Text>
                <Text style={styles.meta}>
                  {[job.startDate, job.current ? "Present" : job.endDate]
                    .filter(Boolean)
                    .join(" – ")}
                  {job.location ? `  |  ${job.location}` : ""}
                </Text>
                {job.highlights.filter(Boolean).map((h, i) => (
                  <Text key={`${job.id}-${i}`} style={styles.bullet}>
                    • {h}
                  </Text>
                ))}
              </View>
            ))}
          </Section>
        ) : null}

        {cv.education.length ? (
          <Section title="Education">
            {cv.education.map((edu) => (
              <View key={edu.id} style={styles.row}>
                <Text style={styles.jobTitle}>
                  {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ")}
                </Text>
                <Text style={styles.meta}>
                  {[edu.institution, `${edu.startDate} – ${edu.endDate}`]
                    .filter(Boolean)
                    .join("  |  ")}
                </Text>
              </View>
            ))}
          </Section>
        ) : null}

        {cv.skills.some((g) => g.items.length) ? (
          <Section title="Skills">
            {cv.skills
              .filter((g) => g.items.length)
              .map((g) => (
                <Text key={g.category} style={styles.row}>
                  {g.category}: {g.items.join(", ")}
                </Text>
              ))}
          </Section>
        ) : null}

        {cv.projects?.length ? (
          <Section title="Projects">
            {cv.projects.map((project) => (
              <View key={project.id} style={styles.row}>
                <Text style={styles.jobTitle}>{project.name}</Text>
                <Text>{project.description}</Text>
                {project.technologies.length ? (
                  <Text style={styles.meta}>{project.technologies.join(", ")}</Text>
                ) : null}
              </View>
            ))}
          </Section>
        ) : null}

        {cv.certifications?.length ? (
          <Section title="Certifications">
            {cv.certifications.map((cert, i) => (
              <Text key={`${cert.name}-${i}`} style={styles.row}>
                {[cert.name, cert.issuer, cert.date].filter(Boolean).join("  |  ")}
              </Text>
            ))}
          </Section>
        ) : null}

        {cv.languages?.length ? (
          <Section title="Languages">
            <Text>
              {cv.languages
                .map((l) => `${l.language} (${l.proficiency})`)
                .join("  |  ")}
            </Text>
          </Section>
        ) : null}
      </Page>
    </Document>
  );
}

export async function cvToPdfBlob(cv: CVData): Promise<Blob> {
  return pdf(<CvPdfDocument cv={cv} />).toBlob();
}
