export const INITIAL_USERS = [
  { id: "U-01", name: "Raj Mehta", email: "legal@nyayavault.gov.in", role: "Legal Officer", department: "Criminal Investigation", status: "Active", lastActive: "Just now" },
  { id: "U-02", name: "Dr. Ananya Patel", email: "forensic@nyayavault.gov.in", role: "Forensic Officer", department: "Digital Forensics", status: "Active", lastActive: "10 mins ago" },
  { id: "U-03", name: "Justice Vikram Malhotra", email: "court@nyayavault.gov.in", role: "Court Authority", department: "High Court Registry", status: "Active", lastActive: "1 hour ago" },
  { id: "U-04", name: "System Admin", email: "admin@nyayavault.gov.in", role: "Administrator", department: "IT Security & Compliance", status: "Active", lastActive: "Now" },
  { id: "U-05", name: "Rahul Sharma", email: "rahul.s@police.gov.in", role: "Legal Officer", department: "Cyber Cell", status: "Pending", lastActive: "Never" },
];

export const INITIAL_CASES = [
  {
    id: "CASE-2026-001",
    name: "State vs. Sharma",
    category: "Criminal Investigation",
    priority: "High",
    assignedOfficer: "Raj Mehta",
    status: "Active",
    updated: "2 hours ago",
    description: "Financial embezzlement and corporate fraud involving offshore accounts.",
    timeline: [
      { event: "Case Registered", date: "01 Sep 2026", time: "09:00 AM" },
      { event: "FIR Uploaded", date: "01 Sep 2026", time: "10:30 AM" },
      { event: "Evidence Added (E-0042)", date: "02 Sep 2026", time: "02:15 PM" },
      { event: "Witness Statement Added", date: "02 Sep 2026", time: "04:40 PM" },
    ],
    documents: [
      { name: "First Information Report", file: "FIR.pdf", type: "FIR", access: "Available", hash: "SHA256:e3b0c44298fc1c149afbf4c8996fb924", status: "Verified" },
      { name: "Witness Statement", file: "Witness_Statement.pdf", type: "Witness Statement", access: "Available", hash: "SHA256:a1b2c3d4e5f67890123456789abcdef0", status: "Verified" },
      { name: "Evidence Report", file: "Evidence_0042.pdf", type: "Evidence", access: "Restricted", hash: "SHA256:9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c", status: "Encrypted" },
      { name: "Investigation Report", file: "Investigation_Report.pdf", type: "Investigation", access: "Available", hash: "SHA256:11223344556677889900aabbccddeeff", status: "Pending Review" },
    ],
  },
  {
    id: "CASE-2026-004",
    name: "Cyber Fraud Investigation",
    category: "Cyber Crime",
    priority: "Medium",
    assignedOfficer: "Ananya Patel",
    status: "Under Review",
    updated: "31 Aug 2026",
    description: "Unauthorized data exfiltration and server breach at fintech gateway.",
    timeline: [
      { event: "Case Registered", date: "30 Aug 2026", time: "11:00 AM" },
      { event: "Digital Evidence Secured", date: "31 Aug 2026", time: "01:20 PM" },
    ],
    documents: [
      { name: "Cyber Incident FIR", file: "FIR_Cyber.pdf", type: "FIR", access: "Available", hash: "SHA256:778899aabbccddeeff11223344556677", status: "Verified" },
    ],
  },
  {
    id: "CASE-2026-008",
    name: "State vs. Verma Syndicate",
    category: "Financial Crime",
    priority: "Critical",
    assignedOfficer: "Raj Mehta",
    status: "Active",
    updated: "28 Aug 2026",
    description: "Money laundering network operating across state borders.",
    timeline: [
      { event: "Case Registered", date: "25 Aug 2026", time: "08:30 AM" },
    ],
    documents: [
      { name: "Financial Audit Trail", file: "Audit_Trail.pdf", type: "Evidence", access: "Restricted", hash: "SHA256:deadbeef00112233445566778899aabb", status: "Verified" },
    ],
  },
];

export const INITIAL_EVIDENCE = [
  { id: "EVIDENCE-0042", caseId: "CASE-2026-001", type: "Digital Image / Phone Backup", uploadedBy: "Dr. Ananya Patel", date: "02 Sep 2026", status: "Verified", hash: "SHA256:9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c", size: "1.4 GB", chainOfCustody: ["Collected by Officer Sharma (02 Sep 2026)", "Transferred to Forensic Vault (02 Sep 2026)", "Analyzed by Dr. Ananya Patel (03 Sep 2026)"] },
  { id: "EVIDENCE-0043", caseId: "CASE-2026-004", type: "Server Dump Log", uploadedBy: "Dr. Ananya Patel", date: "31 Aug 2026", status: "Pending Analysis", hash: "SHA256:1234567890abcdef1234567890abcdef", size: "850 MB", chainOfCustody: ["Captured from AWS Gateway S3 (31 Aug 2026)"] },
  { id: "EVIDENCE-0044", caseId: "CASE-2026-008", type: "Hard Drive Snapshot", uploadedBy: "Raj Mehta", date: "26 Aug 2026", status: "Verified", hash: "SHA256:abcdef1234567890abcdef1234567890", size: "500 GB", chainOfCustody: ["Seized during raid (26 Aug 2026)", "Hashed & Locked (26 Aug 2026)"] },
];

export const INITIAL_AUDIT_LOGS = [
  { id: "LOG-101", timestamp: "01 Sep 2026 • 04:32 PM", user: "Raj Mehta (Legal Officer)", action: "Viewed Case Records", caseId: "CASE-2026-001", ip: "192.168.1.45", status: "Success" },
  { id: "LOG-102", timestamp: "01 Sep 2026 • 04:18 PM", user: "Dr. Ananya Patel (Forensic)", action: "Uploaded Evidence (EVIDENCE-0042)", caseId: "CASE-2026-001", ip: "192.168.1.88", status: "Success" },
  { id: "LOG-103", timestamp: "01 Sep 2026 • 03:51 PM", user: "Unknown entity", action: "Unauthorized access attempt blocked", caseId: "CASE-2026-004", ip: "45.33.22.11", status: "Blocked" },
  { id: "LOG-104", timestamp: "01 Sep 2026 • 03:40 PM", user: "Raj Mehta (Legal Officer)", action: "Created New Case", caseId: "CASE-2026-001", ip: "192.168.1.45", status: "Success" },
];

export const PERMISSION_MATRIX = [
  { role: "Legal Officer", view: true, edit: true, upload: true, share: true },
  { role: "Forensic Officer", view: true, edit: false, upload: true, share: false },
  { role: "Court Authority", view: true, edit: false, upload: false, share: false },
  { role: "Administrator", view: true, edit: true, upload: true, share: true },
];
