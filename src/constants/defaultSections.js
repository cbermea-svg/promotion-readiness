import { BRAND } from './theme';

export const DEFAULT_SECTIONS = [
    {
        id: 1,
        title: "Enterprise Data Strategy & Architecture",
        items: [
            "Demonstrates understanding of enterprise data strategy and alignment with organizational goals",
            "Designs and maintains logical and semantic data models for consistent enterprise reporting",
            "Establishes standard definitions for KPIs, metrics and dimensions across business units",
            "Defines and maintains a roadmap for analytics capabilities, data sources and integrations",
            "Identifies, evaluates and integrates new internal and external data sources to enhance insights",
        ],
    },
    {
        id: 2,
        title: "Data Platform Integration & Management",
        items: [
            "Implements, configures and manages enterprise BI and data platforms (e.g., Power BI, data warehouses)",
            "Ensures seamless integration with core, digital and ancillary systems",
            "Builds interactive dashboards, reports and visualizations that are actionable and accessible",
            "Works effectively with relational databases, data warehouses or cloud-based data platforms",
            "Maintains high proficiency in Excel and Word for large datasets and executive-ready documentation",
        ],
    },
    {
        id: 3,
        title: "Advanced Analytics & Insights Generation",
        items: [
            "Conducts in-depth quantitative and qualitative analysis to uncover trends, risks and opportunities",
            "Applies advanced techniques such as segmentation, forecasting and propensity analysis",
            "Generates actionable recommendations that support strategic initiatives",
            "Partners with Marketing to measure campaign performance and optimize digital member journeys",
            "Uses data to inform personalization, cross-sell and member engagement strategies",
        ],
    },
    {
        id: 4,
        title: "Data Governance & Quality",
        items: [
            "Supports and helps lead data governance practices including standards, lineage and quality checks",
            "Partners with Technology and business owners to ensure data accuracy, timeliness and security",
            "Identifies and resolves data quality issues proactively",
            "Maintains documentation standards for data definitions, processes and analytical frameworks",
            "Demonstrates ethical use of data in all analytical activities",
        ],
    },
    {
        id: 5,
        title: "Stakeholder Communication & Consulting",
        items: [
            "Presents findings, trends and recommendations clearly to senior leadership and cross-functional teams",
            "Tailors communication effectively to both technical and non-technical audiences",
            "Serves as an internal consultant and subject-matter expert for data and analytics",
            "Translates business questions into clear analytical approaches",
            "Uses storytelling and data visualization to drive understanding and action",
        ],
    },
    {
        id: 6,
        title: "Performance Measurement & Continuous Improvement",
        items: [
            "Leads the design and maintenance of enterprise scorecards and dashboards for leadership",
            "Ensures KPIs accurately reflect performance across member growth, digital adoption and portfolio health",
            "Provides analytical support to operational and frontline teams with timely problem-solving",
            "Stays current with trends in data analytics, BI, AI and machine learning",
            "Continuously evaluates and recommends tools and methodologies to elevate data capabilities",
        ],
    },
];

export const LEVELS = {
    B: { label: "Beginner", score: 1, color: BRAND.muted, bg: "#f3f4f6", accent: "#4b5563" },
    I: { label: "Intermediate", score: 2, color: BRAND.coral, bg: BRAND.lightCoral, accent: "#c94530" },
    M: { label: "Master", score: 3, color: BRAND.red, bg: BRAND.lightRed, accent: BRAND.red },
};
