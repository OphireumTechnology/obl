import {
  Advisor,
  AdvisorCaseSummary,
  AdvisorHandoff,
  AdvisorHandoffStatus,
  AdvisorNote,
  Application,
  Appointment,
  ApprovedResponse,
  AuditEvent,
  CallbackRequest,
  ComplianceRule,
  Concern,
  Customer,
  FinancialNeedsAnalysis,
  FollowUp,
  KnowledgeImprovement,
  Lead,
  Message,
  NeedsProfile,
  Notification,
  PolicySimulation,
  Product,
  PromptVersion,
  RestrictedStatement,
  SalesStage,
  TrainingPersona,
  TrainingScenario,
  User,
  UserRole,
} from '../types';
import {
  INITIAL_ADVISORS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CALLBACKS,
  INITIAL_COMPLIANCE_RULES,
  INITIAL_CONCERNS,
  INITIAL_CUSTOMERS,
  INITIAL_FAQS,
  INITIAL_FOLLOW_UPS,
  INITIAL_HANDOFFS,
  INITIAL_KNOWLEDGE_IMPROVEMENTS,
  INITIAL_LEADS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PERSONAS,
  INITIAL_PRODUCTS,
  INITIAL_PROMPT_VERSIONS,
  INITIAL_SCENARIOS,
  INITIAL_APPOINTMENTS,
} from '../mock/initialData';

const STORAGE_KEY = 'axa_ai_sales_agent_v1_store';

export interface AppState {
  currentUser: User;
  activeRole: UserRole;
  leads: Lead[];
  customers: Customer[];
  advisors: Advisor[];
  products: Product[];
  concerns: Concern[];
  faqs: { id: string; category: string; question: string; answer: string; verified: boolean }[];
  approvedResponses: ApprovedResponse[];
  restrictedStatements: RestrictedStatement[];
  appointments: Appointment[];
  advisorNotes: AdvisorNote[];
  followUps: FollowUp[];
  handoffs: AdvisorHandoff[];
  callbacks: CallbackRequest[];
  applications: Application[];
  simulatedPolicies: PolicySimulation[];
  personas: TrainingPersona[];
  scenarios: TrainingScenario[];
  knowledgeImprovements: KnowledgeImprovement[];
  promptVersions: PromptVersion[];
  complianceRules: ComplianceRule[];
  auditLogs: AuditEvent[];
  notifications: Notification[];
  activeLeadId: string;
  chatMessages: Message[];
  activeAdvisorSummary?: AdvisorCaseSummary;
}

const DEFAULT_USER: User = {
  id: 'user-customer-1',
  name: 'Maria Santos',
  email: 'maria.santos@demo-email.com',
  role: 'CUSTOMER',
  title: 'Marketing Director & Parent',
};

const INITIAL_STATE: AppState = {
  currentUser: DEFAULT_USER,
  activeRole: 'CUSTOMER',
  leads: INITIAL_LEADS,
  customers: INITIAL_CUSTOMERS,
  advisors: INITIAL_ADVISORS,
  products: INITIAL_PRODUCTS,
  concerns: INITIAL_CONCERNS,
  faqs: INITIAL_FAQS,
  approvedResponses: [],
  restrictedStatements: [
    {
      id: 'rs-1',
      prohibitedPhrase: 'Guaranteed 10% return',
      reason: 'Strictly prohibited by Insurance Commission regulations on variable investments.',
      severity: 'BLOCK',
      suggestedAlternative: 'Potential growth based on market performance (not guaranteed).',
    },
    {
      id: 'rs-2',
      prohibitedPhrase: 'Cheapest plan on the market',
      reason: 'Misleading and unsubstantiated comparative claim.',
      severity: 'BLOCK',
      suggestedAlternative: 'Affordable starter protection calibrated to your budget.',
    },
  ],
  appointments: INITIAL_APPOINTMENTS,
  handoffs: INITIAL_HANDOFFS,
  callbacks: INITIAL_CALLBACKS,
  advisorNotes: [
    {
      id: 'note-1',
      leadId: 'lead-101',
      advisorId: 'ADV-0001',
      advisorName: 'Bishop Orly B. Languisan',
      note: 'Customer has 2 young daughters (ages 7 and 10) and is concerned about family living costs if diagnosed with cancer. HMO covers ₱150k only.',
      createdAt: '2026-03-21T02:18:00Z',
      category: 'Needs',
    },
  ],
  followUps: INITIAL_FOLLOW_UPS,
  applications: [
    {
      id: 'app-sim-1',
      leadId: 'lead-108',
      customerId: 'cust-8',
      customerName: 'Grace De Leon',
      productId: 'prod-retire-smart',
      productName: 'AXA RetireSmart Annuity',
      coverageAmount: '₱2,500,000 Payout Guarantee',
      paymentMode: 'Annual',
      status: 'UNDERWRITING',
      underwritingNotes: 'Attending physician statement requested for routine lipid check.',
      isSimulated: true,
      submittedAt: '2026-03-19T13:00:00Z',
    },
    {
      id: 'app-sim-2',
      leadId: 'lead-109',
      customerId: 'cust-9',
      customerName: 'Gerardo Laurel',
      productId: 'prod-asset-master',
      productName: 'AXA AssetMaster',
      coverageAmount: '₱10,000,000 Estate Liquidity',
      paymentMode: 'Single Pay',
      status: 'POLICY_ISSUED',
      simulatedPolicyNumber: 'DEMO-POL-882910',
      isSimulated: true,
      submittedAt: '2026-03-16T10:00:00Z',
      approvedAt: '2026-03-17T09:00:00Z',
      issuedAt: '2026-03-17T11:00:00Z',
    },
  ],
  simulatedPolicies: [
    {
      policyNumber: 'DEMO-POL-882910',
      customerId: 'cust-9',
      customerName: 'Gerardo Laurel',
      productName: 'AXA AssetMaster',
      coverageAmount: '₱10,000,000',
      annualPremium: '₱500,000 (Single Placement)',
      paymentFrequency: 'Single Pay',
      startDate: '2026-03-17',
      nextPaymentDate: 'N/A (Fully Paid)',
      beneficiaries: [
        { name: 'Maria Teresa Laurel', relationship: 'Spouse', percentage: 50 },
        { name: 'Gerardo Laurel Jr.', relationship: 'Son', percentage: 50 },
      ],
      status: 'ACTIVE_SIMULATED',
      servicingAdvisor: 'Beatrice Lim',
    },
  ],
  personas: INITIAL_PERSONAS,
  scenarios: INITIAL_SCENARIOS,
  knowledgeImprovements: INITIAL_KNOWLEDGE_IMPROVEMENTS,
  promptVersions: INITIAL_PROMPT_VERSIONS,
  complianceRules: INITIAL_COMPLIANCE_RULES,
  auditLogs: INITIAL_AUDIT_LOGS,
  notifications: INITIAL_NOTIFICATIONS,
  activeLeadId: 'lead-101',
  chatMessages: [
    {
      id: 'msg-1',
      conversationId: 'conv-101',
      sender: 'ai',
      agentType: 'ReceptionistAgent',
      text: 'Hello. I\'m an AI insurance assistant designed to help you understand your protection and financial-planning needs and explore relevant insurance options. I\'ll start by understanding what matters most to you.',
      timestamp: '2026-03-21T01:50:00Z',
    },
    {
      id: 'msg-2',
      conversationId: 'conv-101',
      sender: 'ai',
      agentType: 'ReceptionistAgent',
      text: 'What would you most like to financially protect or prepare for?',
      timestamp: '2026-03-21T01:50:05Z',
      suggestedActions: [
        { label: 'Critical Illness', action: 'SELECT_NEED', payload: 'Critical Illness' },
        { label: 'Health & Medical', action: 'SELECT_NEED', payload: 'Health & Medical' },
        { label: 'Protect My Family', action: 'SELECT_NEED', payload: 'Protect My Family' },
        { label: 'Children\'s Education', action: 'SELECT_NEED', payload: 'Children\'s Education' },
        { label: 'Retirement', action: 'SELECT_NEED', payload: 'Retirement' },
        { label: 'Savings & Investment', action: 'SELECT_NEED', payload: 'Savings & Investment' },
        { label: 'Estate Planning', action: 'SELECT_NEED', payload: 'Estate Planning' },
        { label: 'Car', action: 'SELECT_NEED', payload: 'Car' },
        { label: 'Home', action: 'SELECT_NEED', payload: 'Home' },
        { label: 'Business', action: 'SELECT_NEED', payload: 'Business' },
        { label: 'Travel', action: 'SELECT_NEED', payload: 'Travel' },
        { label: 'I\'m Not Sure', action: 'SELECT_NEED', payload: 'I\'m Not Sure' },
      ],
    },
  ],
};

type Listener = () => void;

class Store {
  private state: AppState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AppState {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        // Ensure primary advisor ADV-0001 Bishop Orly B. Languisan is always present
        const hasPrimaryAdvisor = parsed.advisors?.some((a: Advisor) => a.id === 'ADV-0001' || a.advisorId === 'ADV-0001');
        const advisors = hasPrimaryAdvisor ? parsed.advisors : INITIAL_ADVISORS;

        return {
          ...INITIAL_STATE,
          ...parsed,
          products: parsed.products?.length ? parsed.products : INITIAL_PRODUCTS,
          advisors,
          handoffs: parsed.handoffs?.length ? parsed.handoffs : INITIAL_HANDOFFS,
          callbacks: parsed.callbacks?.length ? parsed.callbacks : INITIAL_CALLBACKS,
        };
      }
    } catch {
      // Fallback
    }
    return INITIAL_STATE;
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore
    }
  }

  public getState(): AppState {
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveState();
    this.listeners.forEach((l) => l());
  }

  public resetToDefaults() {
    this.state = { ...INITIAL_STATE };
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  }

  // --- Role & User Management ---
  public setRole(role: UserRole) {
    this.state.activeRole = role;
    if (role === 'CUSTOMER') {
      this.state.currentUser = {
        id: 'cust-1',
        name: 'Maria Santos',
        email: 'maria.santos@demo-email.com',
        role: 'CUSTOMER',
        title: 'Customer (Marketing Director)',
      };
    } else if (role === 'ADVISOR') {
      this.state.currentUser = {
        id: 'adv-1',
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@axa-demo.com',
        role: 'ADVISOR',
        title: 'Senior Wealth & Protection Advisor',
        department: 'AXA Premier Advisory',
      };
    } else if (role === 'ADMIN') {
      this.state.currentUser = {
        id: 'admin-1',
        name: 'Elena Ramos',
        email: 'elena.ramos@axa-demo.com',
        role: 'ADMIN',
        title: 'Head of Digital Distribution & Compliance',
        department: 'Product Governance & Compliance',
      };
    } else if (role === 'AI_TRAINER') {
      this.state.currentUser = {
        id: 'trainer-1',
        name: 'Dr. Arthur Chen',
        email: 'arthur.chen@axa-demo.com',
        role: 'AI_TRAINER',
        title: 'Lead AI Knowledge & Quality Engineer',
        department: 'AI Systems Laboratory',
      };
    }
    this.recordAudit('ROLE_SWITCH', 'UserRole', role, `Switched view to ${role}`);
    this.notify();
  }

  // --- Audit Logging ---
  public recordAudit(action: string, resource: string, resourceId?: string, reason?: string, before?: string, after?: string) {
    const event: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      actor: this.state.currentUser.name,
      role: this.state.activeRole,
      action,
      resource,
      resourceId,
      reason,
      before,
      after,
      demoMode: true,
    };
    this.state.auditLogs = [event, ...this.state.auditLogs];
  }

  // --- Notifications ---
  public addNotification(title: string, message: string, type: Notification['type'], linkRoute?: string) {
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
      linkRoute,
    };
    this.state.notifications = [notif, ...this.state.notifications];
    this.notify();
  }

  public markNotificationRead(id: string) {
    this.state.notifications = this.state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.notify();
  }

  public markAllNotificationsRead() {
    this.state.notifications = this.state.notifications.map((n) => ({ ...n, read: true }));
    this.notify();
  }

  // --- Chat & Conversation ---
  public addChatMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
    const newMsg: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    this.state.chatMessages = [...this.state.chatMessages, newMsg];
    this.notify();
    return newMsg;
  }

  public clearChat() {
    this.state.chatMessages = [
      {
        id: `msg-${Date.now()}`,
        conversationId: 'conv-101',
        sender: 'ai',
        agentType: 'ReceptionistAgent',
        text: 'Hello. I\'m an AI insurance assistant designed to help you understand your protection and financial-planning needs and explore relevant insurance options. What would you most like to financially protect or prepare for?',
        timestamp: new Date().toISOString(),
      },
    ];
    this.notify();
  }

  // --- Leads & Pipeline ---
  public getActiveLead(): Lead | undefined {
    return this.state.leads.find((l) => l.id === this.state.activeLeadId) || this.state.leads[0];
  }

  public setActiveLead(leadId: string) {
    this.state.activeLeadId = leadId;
    this.notify();
  }

  public updateLeadStage(leadId: string, newStage: SalesStage, note?: string) {
    this.state.leads = this.state.leads.map((l) => {
      if (l.id === leadId) {
        const oldStage = l.currentStage;
        this.recordAudit('LEAD_STAGE_UPDATED', 'Lead', leadId, note || `Stage updated to ${newStage}`, oldStage, newStage);
        return {
          ...l,
          currentStage: newStage,
          lastInteraction: new Date().toISOString(),
          stageHistory: [...l.stageHistory, { stage: newStage, timestamp: new Date().toISOString(), note }],
        };
      }
      return l;
    });
    this.notify();
  }

  public updateLead(lead: Lead) {
    this.state.leads = this.state.leads.map((l) => (l.id === lead.id ? lead : l));
    this.recordAudit('LEAD_UPDATED', 'Lead', lead.id, 'Lead details modified');
    this.notify();
  }

  // --- Needs Profile & FNA ---
  public updateNeedsProfile(customerId: string, profile: Partial<NeedsProfile>) {
    this.state.customers = this.state.customers.map((c) => {
      if (c.id === customerId) {
        const currentProfile = c.needsProfile || {
          id: `np-${Date.now()}`,
          customerId,
          ageRange: '30–35',
          maritalStatus: 'Married',
          dependentsCount: 1,
          occupation: 'Professional',
          employmentStatus: 'Employed',
          incomeRange: '₱80,000–₱120,000 / month',
          existingLifeInsurance: 'None',
          existingHealthInsurance: 'Employer HMO',
          existingHMO: '₱100,000 limit',
          emergencySavingsMonths: '3 months',
          primaryNeed: 'Critical Illness',
          secondaryNeeds: ['Protect My Family'],
          monthlyBudget: '₱5,000–₱8,000 / month',
          financialObligations: 'Mortgage / Rent',
          investmentHorizon: '10+ years',
          riskTolerance: 'Moderate',
          isComplete: true,
          updatedAt: new Date().toISOString(),
        };
        const updatedProfile = { ...currentProfile, ...profile, updatedAt: new Date().toISOString() };
        return { ...c, needsProfile: updatedProfile };
      }
      return c;
    });
    this.recordAudit('NEEDS_PROFILE_UPDATED', 'NeedsProfile', customerId, 'Profile criteria updated');
    this.notify();
  }

  public setCustomerFNA(customerId: string, fna: FinancialNeedsAnalysis) {
    this.state.customers = this.state.customers.map((c) => (c.id === customerId ? { ...c, fnaResult: fna } : c));
    this.recordAudit('FNA_GENERATED', 'FinancialNeedsAnalysis', customerId, 'Demo FNA generated');
    this.notify();
  }

  // --- Advisor Summary ---
  public setAdvisorSummary(summary: AdvisorCaseSummary) {
    this.state.activeAdvisorSummary = summary;
    this.recordAudit('ADVISOR_SUMMARY_CREATED', 'AdvisorCaseSummary', summary.leadId, 'AI generated handoff brief');
    this.addNotification(
      'Advisor Consultation Hand-off',
      `Summary generated for ${summary.customerAlias}. Stage: ${summary.currentStage}.`,
      'LEAD',
      '/advisor'
    );
    this.notify();
  }

  // --- Appointments ---
  public bookAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>) {
    const newApp: Appointment = {
      ...appointment,
      id: `app-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.appointments = [newApp, ...this.state.appointments];
    this.updateLeadStage(appointment.leadId, 'APPOINTMENT_SCHEDULED', `Appointment scheduled for ${appointment.date} ${appointment.time}`);
    this.recordAudit('APPOINTMENT_BOOKED', 'Appointment', newApp.id, `${newApp.consultationMode} meeting with ${newApp.advisorName}`);
    this.addNotification(
      'New Appointment Scheduled',
      `${newApp.customerName} booked a ${newApp.consultationMode} consultation on ${newApp.date} at ${newApp.time}.`,
      'APPOINTMENT',
      '/advisor'
    );
    this.notify();
    return newApp;
  }

  public updateAppointmentStatus(id: string, status: Appointment['status']) {
    this.state.appointments = this.state.appointments.map((a) => (a.id === id ? { ...a, status } : a));
    this.recordAudit('APPOINTMENT_STATUS_CHANGED', 'Appointment', id, `Status updated to ${status}`);
    this.notify();
  }

  // --- Advisor Notes ---
  public addAdvisorNote(note: Omit<AdvisorNote, 'id' | 'createdAt'>) {
    const newNote: AdvisorNote = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.advisorNotes = [newNote, ...this.state.advisorNotes];
    this.recordAudit('ADVISOR_NOTE_ADDED', 'AdvisorNote', note.leadId, `Note added by ${note.advisorName}`);
    this.notify();
    return newNote;
  }

  // --- Follow Ups ---
  public addFollowUp(followUp: Omit<FollowUp, 'id' | 'createdAt'>) {
    const newFu: FollowUp = {
      ...followUp,
      id: `fu-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.followUps = [newFu, ...this.state.followUps];
    this.recordAudit('FOLLOW_UP_SCHEDULED', 'FollowUp', newFu.id, `${newFu.type} for ${newFu.customerName}`);
    this.notify();
    return newFu;
  }

  public toggleFollowUpStatus(id: string) {
    this.state.followUps = this.state.followUps.map((f) =>
      f.id === id ? { ...f, status: f.status === 'PENDING' ? 'COMPLETED' : 'PENDING' } : f
    );
    this.notify();
  }

  // --- Demo Applications & Simulated Policies ---
  public startDemoApplication(app: Omit<Application, 'id' | 'isSimulated'>) {
    const newApp: Application = {
      ...app,
      id: `app-sim-${Date.now()}`,
      isSimulated: true,
      submittedAt: new Date().toISOString(),
    };
    this.state.applications = [newApp, ...this.state.applications];
    this.updateLeadStage(app.leadId, 'APPLICATION_STARTED', 'Demo application initiated');
    this.recordAudit('DEMO_APPLICATION_STARTED', 'Application', newApp.id, `Product: ${app.productName}`);
    this.notify();
    return newApp;
  }

  public updateApplicationStatus(appId: string, status: Application['status']) {
    this.state.applications = this.state.applications.map((a) => {
      if (a.id === appId) {
        let simulatedPolicyNumber = a.simulatedPolicyNumber;
        if (status === 'POLICY_ISSUED' && !simulatedPolicyNumber) {
          simulatedPolicyNumber = `DEMO-POL-${Math.floor(100000 + Math.random() * 900000)}`;
          // Create simulated policy
          const newPolicy: PolicySimulation = {
            policyNumber: simulatedPolicyNumber,
            customerId: a.customerId,
            customerName: a.customerName,
            productName: a.productName,
            coverageAmount: a.coverageAmount,
            annualPremium: '₱36,000 (Simulated)',
            paymentFrequency: 'Annual',
            startDate: new Date().toISOString().split('T')[0],
            nextPaymentDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            beneficiaries: [{ name: 'Family Estate', relationship: 'Beneficiary', percentage: 100 }],
            status: 'ACTIVE_SIMULATED',
            servicingAdvisor: this.getPrimaryAdvisor().displayName || 'Bishop Orly B. Languisan',
          };
          this.state.simulatedPolicies = [newPolicy, ...this.state.simulatedPolicies];
          this.updateLeadStage(a.leadId, 'POLICY_ISSUED_SIMULATION', `Policy simulated: ${simulatedPolicyNumber}`);
        } else if (status === 'UNDERWRITING') {
          this.updateLeadStage(a.leadId, 'UNDERWRITING_SIMULATION', 'Application under simulated underwriting');
        }
        this.recordAudit('APPLICATION_STATUS_CHANGED', 'Application', appId, `Status changed to ${status}`);
        return {
          ...a,
          status,
          simulatedPolicyNumber,
          approvedAt: status === 'APPROVED' ? new Date().toISOString() : a.approvedAt,
          issuedAt: status === 'POLICY_ISSUED' ? new Date().toISOString() : a.issuedAt,
        };
      }
      return a;
    });
    this.notify();
  }

  // --- Product Brain (Admin) ---
  public addProduct(product: Product) {
    this.state.products = [product, ...this.state.products];
    this.recordAudit('PRODUCT_CREATED', 'Product', product.id, `Created product ${product.name}`);
    this.notify();
  }

  public updateProduct(product: Product) {
    this.state.products = this.state.products.map((p) => (p.id === product.id ? product : p));
    this.recordAudit('PRODUCT_UPDATED', 'Product', product.id, `Updated product ${product.name}`);
    this.notify();
  }

  public setProductVerification(productId: string, status: Product['verificationStatus']) {
    this.state.products = this.state.products.map((p) =>
      p.id === productId
        ? {
            ...p,
            verificationStatus: status,
            lastVerified: new Date().toISOString().split('T')[0],
            verifiedBy: this.state.currentUser.name,
          }
        : p
    );
    this.recordAudit('PRODUCT_VERIFICATION_CHANGED', 'Product', productId, `Status changed to ${status}`);
    this.notify();
  }

  public addFAQ(faq: { category: string; question: string; answer: string; verified: boolean }) {
    const newFaq = { ...faq, id: `faq-${Date.now()}` };
    this.state.faqs = [newFaq, ...this.state.faqs];
    this.recordAudit('FAQ_ADDED', 'ProductFAQ', newFaq.id, `Added FAQ: ${faq.question}`);
    this.notify();
  }

  // --- Compliance Rules & Training ---
  public toggleComplianceRule(ruleId: string) {
    this.state.complianceRules = this.state.complianceRules.map((r) =>
      r.id === ruleId ? { ...r, active: !r.active } : r
    );
    this.notify();
  }

  public updateKnowledgeImprovement(id: string, status: KnowledgeImprovement['status'], decisionNotes?: string) {
    this.state.knowledgeImprovements = this.state.knowledgeImprovements.map((ki) =>
      ki.id === id
        ? {
            ...ki,
            status,
            reviewer: this.state.currentUser.name,
            decisionNotes: decisionNotes || ki.decisionNotes,
            reviewedAt: new Date().toISOString().split('T')[0],
          }
        : ki
    );
    this.recordAudit('KNOWLEDGE_IMPROVEMENT_STATUS', 'KnowledgeImprovement', id, `Status updated to ${status}`);
    this.notify();
  }

  public addKnowledgeImprovement(ki: Omit<KnowledgeImprovement, 'id' | 'createdAt' | 'status'>) {
    const newKi: KnowledgeImprovement = {
      ...ki,
      id: `ki-${Date.now()}`,
      status: 'PROPOSED',
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.state.knowledgeImprovements = [newKi, ...this.state.knowledgeImprovements];
    this.recordAudit('KNOWLEDGE_IMPROVEMENT_PROPOSED', 'KnowledgeImprovement', newKi.id, ki.title);
    this.notify();
    return newKi;
  }

  // --- Central Advisor Profile & Handoffs ---
  public getPrimaryAdvisor(): Advisor {
    return this.state.advisors.find((a) => a.isPrimaryAdvisor) || this.state.advisors[0];
  }

  public getAdvisor(advisorId: string): Advisor | undefined {
    return this.state.advisors.find((a) => a.id === advisorId || a.advisorId === advisorId);
  }

  public updateAdvisorProfile(advisorId: string, updates: Partial<Advisor>) {
    this.state.advisors = this.state.advisors.map((a) => {
      if (a.id === advisorId || a.advisorId === advisorId) {
        return {
          ...a,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return a;
    });
    this.recordAudit('ADVISOR_PROFILE_UPDATED', 'Advisor', advisorId, `Advisor profile updated for ${advisorId}`);
    this.notify();
  }

  public createAdvisorHandoff(handoff: Omit<AdvisorHandoff, 'handoffId' | 'handoffTimestamp'>): AdvisorHandoff {
    const newHandoff: AdvisorHandoff = {
      ...handoff,
      handoffId: `HND-${Math.floor(1000 + Math.random() * 9000)}`,
      handoffTimestamp: new Date().toISOString(),
    };
    this.state.handoffs = [newHandoff, ...(this.state.handoffs || [])];
    this.updateLeadStage(newHandoff.leadId, 'ADVISOR_READY', `Handoff requested for advisor ${newHandoff.advisorName}`);
    this.recordAudit('ADVISOR_HANDOFF_REQUESTED', 'AdvisorHandoff', newHandoff.handoffId, `Handoff to ${newHandoff.advisorName}: ${newHandoff.handoffReason}`);
    this.addNotification(
      'New Advisor Handoff Requested',
      `Customer ${newHandoff.customerName} requested advisor contact with ${newHandoff.advisorName}.`,
      'LEAD',
      '/advisor'
    );
    this.notify();
    return newHandoff;
  }

  public updateHandoffStatus(handoffId: string, status: AdvisorHandoffStatus, notes?: string) {
    this.state.handoffs = (this.state.handoffs || []).map((h) => {
      if (h.handoffId === handoffId) {
        return {
          ...h,
          handoffStatus: status,
          notes: notes !== undefined ? notes : h.notes,
        };
      }
      return h;
    });
    this.recordAudit('ADVISOR_HANDOFF_STATUS_UPDATED', 'AdvisorHandoff', handoffId, `Handoff status changed to ${status}`);
    this.notify();
  }

  public createCallbackRequest(callback: Omit<CallbackRequest, 'id' | 'createdAt' | 'status'>): CallbackRequest {
    const newCb: CallbackRequest = {
      ...callback,
      id: `CB-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
    };
    this.state.callbacks = [newCb, ...(this.state.callbacks || [])];
    
    // Also create a corresponding handoff record
    const activeLead = this.getActiveLead();
    this.createAdvisorHandoff({
      leadId: callback.leadId || activeLead?.id || 'lead-101',
      customerId: activeLead?.customerId || 'cust-1',
      customerName: callback.customerName,
      customerPhone: callback.preferredContactNumber,
      conversationId: 'conv-cb',
      advisorId: callback.advisorId,
      advisorName: callback.advisorName,
      primaryNeed: activeLead?.primaryNeed || 'Insurance Consultation',
      secondaryNeeds: activeLead?.secondaryNeeds || [],
      productsExplored: ['AXA Consultation'],
      customerQuestions: [callback.primaryReason],
      customerConcerns: [],
      unresolvedQuestions: [`Callback scheduled for: ${callback.preferredDate} ${callback.preferredTime}`],
      budgetRange: activeLead?.estimatedBudget || 'Under Discussion',
      preferredContactMethod: 'Callback',
      preferredContactDate: callback.preferredDate,
      preferredContactTime: callback.preferredTime,
      appointmentRequested: false,
      handoffReason: `Customer requested callback: ${callback.primaryReason}`,
      handoffStatus: 'REQUESTED',
      consentToContact: callback.consentToContact,
      notes: `Preferred phone: ${callback.preferredContactNumber}. Time: ${callback.preferredDate} at ${callback.preferredTime}.`,
    });

    this.recordAudit('CALLBACK_REQUESTED', 'CallbackRequest', newCb.id, `Callback for ${newCb.customerName} on ${newCb.preferredDate} ${newCb.preferredTime}`);
    this.addNotification(
      'Advisor Callback Requested',
      `${newCb.customerName} requested a callback on ${newCb.preferredDate} at ${newCb.preferredTime}. Phone: ${newCb.preferredContactNumber}.`,
      'LEAD',
      '/advisor'
    );
    this.notify();
    return newCb;
  }

  public updateCallbackStatus(id: string, status: 'PENDING' | 'CONTACTED' | 'CANCELLED') {
    this.state.callbacks = (this.state.callbacks || []).map((cb) => (cb.id === id ? { ...cb, status } : cb));
    this.recordAudit('CALLBACK_STATUS_UPDATED', 'CallbackRequest', id, `Status updated to ${status}`);
    this.notify();
  }
}

export const appStore = new Store();
