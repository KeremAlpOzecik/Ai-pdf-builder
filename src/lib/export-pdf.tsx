import type { ReactNode } from "react";
import { Document, Page, Text, View, StyleSheet, Font, pdf } from "@react-pdf/renderer";
import { formatCvDate, formatCvDateRange, getCvDocumentLabels } from "@/lib/cv-format";
import type { CVData, ResumeTemplate } from "@/types/cv";

Font.register({ family: "NotoSans", src: "/fonts/NotoSans-Regular.ttf", fontWeight: 400 });
Font.register({ family: "NotoSans", src: "/fonts/NotoSans-Regular.ttf", fontWeight: 700 });

const styles = StyleSheet.create({
  page: { paddingTop: 38, paddingBottom: 38, paddingHorizontal: 42, fontFamily: "NotoSans", fontSize: 9.5, color: "#202624", lineHeight: 1.42 },
  pageModern: { paddingLeft: 58, paddingTop: 44 },
  pageCompact: { paddingTop: 30, paddingBottom: 30, fontSize: 8.7, lineHeight: 1.3 },
  accentRail: { position: "absolute", left: 0, top: 0, bottom: 0, width: 18, backgroundColor: "#173f3b" },
  header: { marginBottom: 22, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: "#d8d2ca" },
  headerClassic: { textAlign: "center" },
  headerModern: { borderBottomWidth: 0, paddingBottom: 4 },
  headerCompact: { marginBottom: 14, paddingBottom: 10, borderBottomWidth: 3, borderBottomColor: "#214b72" },
  name: { fontSize: 24, fontWeight: 700, color: "#25211f", marginBottom: 4 },
  nameModern: { fontSize: 26, color: "#173f3b" },
  nameCompact: { fontSize: 20, color: "#183b5b" },
  title: { fontSize: 10.5, color: "#315c4a", marginBottom: 7 },
  titleModern: { color: "#a96238", textTransform: "uppercase", letterSpacing: 1.2 },
  titleCompact: { color: "#356a94", marginBottom: 4 },
  contact: { fontSize: 8, color: "#625b56", lineHeight: 1.5 },
  section: { marginBottom: 13 },
  sectionCompact: { marginBottom: 9 },
  heading: { fontSize: 9, fontWeight: 700, color: "#625b56", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 },
  headingModern: { color: "#173f3b", borderLeftWidth: 3, borderLeftColor: "#b06f43", paddingLeft: 6 },
  headingCompact: { color: "#214b72", borderBottomWidth: 1.5, borderBottomColor: "#214b72", paddingBottom: 2, marginBottom: 5 },
  row: { marginBottom: 8 },
  rowCompact: { marginBottom: 5 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  jobTitle: { fontWeight: 700, fontSize: 10 },
  company: { fontSize: 9.2, color: "#315c4a", marginTop: 1 },
  dates: { fontSize: 8, color: "#6b6661", textAlign: "right" },
  meta: { fontSize: 8, color: "#6b6661", marginTop: 1 },
  bulletRow: { flexDirection: "row", marginTop: 2, paddingLeft: 5 },
  bulletMark: { width: 9, color: "#315c4a" },
  bulletText: { flex: 1 },
  summary: { color: "#353b39" },
  skillRow: { marginBottom: 3 },
  twoColumns: { flexDirection: "row", gap: 22 },
  column: { flex: 1 },
});

function Section({ title, template, children }: { title: string; template: ResumeTemplate; children: ReactNode }) {
  return <View style={[styles.section, template === "compact" ? styles.sectionCompact : {}]}>
    <Text style={[styles.heading, template === "modern" ? styles.headingModern : {}, template === "compact" ? styles.headingCompact : {}]}>{title}</Text>
    {children}
  </View>;
}

function Experience({ cv, template }: { cv: CVData; template: ResumeTemplate }) {
  return <>{cv.workExperience.map((job) => <View key={job.id} style={[styles.row, template === "compact" ? styles.rowCompact : {}]} wrap={false}>
    <View style={styles.rowTop}><Text style={styles.jobTitle}>{job.position}</Text><Text style={styles.dates}>{formatCvDateRange(job.startDate, job.endDate, job.current, cv.targetLanguage)}</Text></View>
    <Text style={styles.company}>{[job.company, job.location].filter(Boolean).join(" · ")}</Text>
    {job.highlights.filter(Boolean).map((highlight, index) => <View key={`${job.id}-${index}`} style={styles.bulletRow}><Text style={styles.bulletMark}>•</Text><Text style={styles.bulletText}>{highlight}</Text></View>)}
  </View>)}</>;
}

function Education({ cv, template }: { cv: CVData; template: ResumeTemplate }) {
  const labels = getCvDocumentLabels(cv.targetLanguage);
  return <>{cv.education.map((education) => <View key={education.id} style={[styles.row, template === "compact" ? styles.rowCompact : {}]} wrap={false}>
    <View style={styles.rowTop}><Text style={styles.jobTitle}>{[education.degree, education.fieldOfStudy].filter(Boolean).join(labels.in)}</Text><Text style={styles.dates}>{formatCvDateRange(education.startDate, education.endDate, false, cv.targetLanguage)}</Text></View>
    <Text style={styles.meta}>{education.institution}</Text>
  </View>)}</>;
}

function Skills({ cv }: { cv: CVData }) {
  return <>{cv.skills.filter((group) => group.items.length).map((group) => <Text key={group.category} style={styles.skillRow}><Text style={{ fontWeight: 700 }}>{group.category}: </Text>{group.items.join(", ")}</Text>)}</>;
}

function CvPdfDocument({ cv, template }: { cv: CVData; template: ResumeTemplate }) {
  const p = cv.personalInfo;
  const labels = getCvDocumentLabels(cv.targetLanguage);
  const contact = [p.email, p.phone, p.location, p.linkedinUrl, p.githubUrl, p.portfolioUrl].filter(Boolean).join("  ·  ");
  const compact = template === "compact";
  return <Document><Page size="A4" style={[styles.page, template === "modern" ? styles.pageModern : {}, compact ? styles.pageCompact : {}]}>
    {template === "modern" ? <View style={styles.accentRail} fixed /> : null}
    <View style={[styles.header, template === "classic" ? styles.headerClassic : {}, template === "modern" ? styles.headerModern : {}, compact ? styles.headerCompact : {}]}>
      <Text style={[styles.name, template === "modern" ? styles.nameModern : {}, compact ? styles.nameCompact : {}]}>{p.fullName || "Curriculum Vitae"}</Text>
      {p.title ? <Text style={[styles.title, template === "modern" ? styles.titleModern : {}, compact ? styles.titleCompact : {}]}>{p.title}</Text> : null}
      {contact ? <Text style={styles.contact}>{contact}</Text> : null}
    </View>
    {p.summary ? <Section title={labels.summary} template={template}><Text style={styles.summary}>{p.summary}</Text></Section> : null}
    {cv.workExperience.length ? <Section title={labels.experience} template={template}><Experience cv={cv} template={template} /></Section> : null}
    {compact ? <View style={styles.twoColumns}>
      <View style={styles.column}>{cv.education.length ? <Section title={labels.education} template={template}><Education cv={cv} template={template} /></Section> : null}</View>
      <View style={styles.column}>{cv.skills.some((group) => group.items.length) ? <Section title={labels.skills} template={template}><Skills cv={cv} /></Section> : null}</View>
    </View> : <>{cv.education.length ? <Section title={labels.education} template={template}><Education cv={cv} template={template} /></Section> : null}{cv.skills.some((group) => group.items.length) ? <Section title={labels.skills} template={template}><Skills cv={cv} /></Section> : null}</>}
    {cv.projects?.length ? <Section title={labels.projects} template={template}>{cv.projects.map((project) => <View key={project.id} style={[styles.row, compact ? styles.rowCompact : {}]} wrap={false}><Text style={styles.jobTitle}>{project.name}</Text><Text>{project.description}</Text>{project.technologies.length ? <Text style={styles.meta}>{project.technologies.join(" · ")}</Text> : null}</View>)}</Section> : null}
    {cv.certifications?.length || cv.languages?.length ? <View style={compact ? styles.twoColumns : {}}>
      {cv.certifications?.length ? <View style={compact ? styles.column : {}}><Section title={labels.certifications} template={template}>{cv.certifications.map((certification, index) => <Text key={`${certification.name}-${index}`} style={styles.skillRow}>{[certification.name, certification.issuer, formatCvDate(certification.date, cv.targetLanguage)].filter(Boolean).join(" · ")}</Text>)}</Section></View> : null}
      {cv.languages?.length ? <View style={compact ? styles.column : {}}><Section title={labels.languages} template={template}><Text>{cv.languages.map((language) => `${language.language} (${language.proficiency})`).join(" · ")}</Text></Section></View> : null}
    </View> : null}
  </Page></Document>;
}

export async function cvToPdfBlob(cv: CVData, template: ResumeTemplate = "modern"): Promise<Blob> {
  return pdf(<CvPdfDocument cv={cv} template={template} />).toBlob();
}
