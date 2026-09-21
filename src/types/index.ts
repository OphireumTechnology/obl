export type SalesStage =
  | 'NEW_LEAD'
  | 'CONSENT'
  | 'NEEDS_DISCOVERY'
  | 'PROFILE_IN_PROGRESS'
  | 'NEEDS_ANALYSIS_COMPLETE'
  | 'FNA_COMPLETE'
  | 'PRODUCT_EDUCATION'
  | 'QUESTIONS_CONCERNS'
  | 'ADVISOR_READY'
  | 'APPOINTMENT_SCHEDULED'
  | 'CONSULTATION_COMPLETE'
  | 'ILLUSTRATION_REQUESTED'
  | 'ILLUSTRATION_REVIEW'
  | 'APPLICATION_STARTED'
  | 'APPLICATION_SUBMITTED'
  | 'UNDERWRITING_SIMULATION'
  | 'POLICY_ISSUED_SIMULATION'
  | 'CUSTOMER_SUCCESS'
  | 'ONGOING_REVIEW'
  | 'FOLLOW_UP_REQUIRED'
  | 'NOT_READY'
  | 'CLOSED'
  | 'OPTED_OUT';

export type UserRole =
  | 'CUSTOMER'
  | 'ADVISOR'
  | 'SALES_MANAGER'
  | 'PRODUCT_REVIEWER'
  | 'COMPLIANCE_REVIEWER'
  | 'AI_TRAINER'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type ProductVerificationStatus =
  | 'DRAFT'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'REVIEW_REQUIRED'
  | 'OUTDATED'
  | 'ARCHIVED';

export type FNAImportance = 'HIGH' | 'MEDIUM' | 'DEVELOPING' | 'NOT ASSESSED';

export type EvaluationRating = 'PASS' | 'WARNING' | 'FAIL';

export type AppointmentStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW';

export type ApplicationStatus =
  | 'NOT_STARTED'
  | 'STARTED'
  | 'INFORMATION_REQUIRED'
  | 'CUSTOMER_REVIEW'
  | 'ADVISOR_REVIEW'
  | 'SUBMITTED'
  | 'UNDERWRITING'
  | 'ADDITIONAL_REQUIREMENTS'
  | 'APPROVED'
  | 'POLICY_ISSUED'
  | 'DECLINED';

export type AgentType =
  | 'ReceptionistAgent'
  | 'NeedsAnalystAgent'
  | 'FNAAgent'
  | 'ProductSpecialistAgent'
  | 'ConcernAgent'
  | 'IllustrationAssistantAgent'
  | 'FollowUpAgent'
  | 'CustomerServiceAgent'
  | 'ComplianceAgent'
  | 'TrainingEvaluatorAgent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  department?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  preferredLanguage: string;
  communicationPreference: 'WhatsApp' | 'Email' | 'Phone' | 'Chat';
  createdAt: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'OPTED_OUT';
  assignedAdvisorId?: string;
  needsProfile?: NeedsProfile;
  fnaResult?: FinancialNeedsAnalysis;
}

export interface Advisor {
  id: string; // e.g. 'ADV-0001'
  advisorId: string; // e.g. 'ADV-0001'
  name: string; // 'Bishop Orly B. Languisan'
  fullName: string; // 'Bishop Orly B. Languisan'
  displayName: string; // 'Bishop Orly B. Languisan'
  role: string; // 'Licensed Insurance Advisor'
  title: string; // 'Licensed Insurance Advisor'
  mobilePhone: string; // '+63 968 647 1868'
  phone: string; // '+63 968 647 1868'
  email: string; // 'NOT PROVIDED'
  advisorCode: string; // 'NOT PROVIDED'
  licenseNumber: string; // 'NOT PROVIDED'
  credentialVerificationStatus: string; // 'PENDING VERIFICATION'
  profileImage: string; // 'NOT PROVIDED'
  avatar?: string;
  office: string; // 'NOT PROVIDED'
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  availabilityStatus: 'AVAILABLE' | 'IN_CONSULTATION' | 'BUSY' | 'OFFLINE';
  consultationMethods: ('Phone' | 'Video — Demo' | 'In Person — Demo')[];
  isPrimaryAdvisor: boolean;
  environment: 'DEMO' | 'PRODUCTION';
  specialties?: string[];
  activeLeadsCount: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export type AdvisorHandoffStatus =
  | 'REQUESTED'
  | 'ASSIGNED'
  | 'CONTACT_PENDING'
  | 'CONTACTED'
  | 'APPOINTMENT_SCHEDULED'
  | 'CONSULTATION_COMPLETED'
  | 'FOLLOW_UP_REQUIRED'
  | 'CLOSED';

export interface AdvisorHandoff {
  handoffId: string;
  leadId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  conversationId: string;
  advisorId: string; // 'ADV-0001'
  advisorName: string; // 'Bishop Orly B. Languisan'
  primaryNeed: string;
  secondaryNeeds: string[];
  needsProfile?: NeedsProfile;
  fnaSummary?: string;
  productsExplored: string[];
  customerQuestions: string[];
  customerConcerns: string[];
  unresolvedQuestions: string[];
  budgetRange: string;
  preferredContactMethod: 'Call' | 'Phone' | 'Consultation' | 'Schedule Appointment' | 'Callback';
  preferredContactTime?: string;
  preferredContactDate?: string;
  appointmentRequested: boolean;
  handoffReason: string;
  handoffTimestamp: string;
  handoffStatus: AdvisorHandoffStatus;
  consentToContact: boolean;
  notes?: string;
}

export interface CallbackRequest {
  id: string;
  customerName: string;
  preferredContactNumber: string;
  preferredDate: string;
  preferredTime: string;
  primaryReason: string;
  consentToContact: boolean;
  advisorId: string;
  advisorName: string;
  createdAt: string;
  status: 'PENDING' | 'CONTACTED' | 'CANCELLED';
  leadId?: string;
  notes?: string;
}

export interface NeedsProfile {
  id: string;
  customerId: string;
  ageRange: string;
  maritalStatus: string;
  dependentsCount: number;
  occupation: string;
  employmentStatus: string;
  incomeRange: string;
  existingLifeInsurance: string;
  existingHealthInsurance: string;
  existingHMO: string;
  emergencySavingsMonths: string;
  primaryNeed: string;
  secondaryNeeds: string[];
  monthlyBudget: string;
  financialObligations: string;
  educationGoals?: string;
  retirementAgeTarget?: string;
  savingsGoals?: string;
  investmentHorizon: string;
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  isComplete: boolean;
  updatedAt: string;
}

export interface FNACategoryScore {
  category: string;
  priority: FNAImportance;
  rationale: string;
  estimatedGap?: string;
  recommendedFocus: string;
}

export interface FinancialNeedsAnalysis {
  id: string;
  customerId: string;
  categories: FNACategoryScore[];
  summaryNarrative: string;
  keyRecommendations: string[];
  generatedAt: string;
  isSimulated: boolean;
}

export interface ProductBenefit {
  id: string;
  title: string;
  description: string;
  isGuaranteed: boolean;
  category: 'Life' | 'Critical Illness' | 'Hospitalization' | 'Investment' | 'Accident';
}

export interface ProductEligibility {
  minAge: number;
  maxAge: number;
  occupationsAllowed: string[];
  medicalReviewRequired: boolean;
  citizenshipRequirement: string;
}

export interface ProductFAQ {
  id: string;
  question: string;
  answer: string;
  sourceDocId?: string;
  verified: boolean;
}

export interface ProductDocument {
  id: string;
  title: string;
  docType: 'Brochure' | 'Policy Wording' | 'Product Summary' | 'Underwriting Guide';
  url: string;
  version: string;
  verifiedDate: string;
}

export interface ProductVersion {
  version: string;
  effectiveDate: string;
  changedBy: string;
  changeNotes: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  family: string;
  category: string;
  primaryNeed: string;
  secondaryNeeds: string[];
  targetUseCases: string[];
  shortDescription: string;
  fullDescription: string;
  eligibility: ProductEligibility;
  coveragePeriod: string;
  paymentPeriod: string;
  paymentFrequency: string[];
  minimumPremium: string;
  benefits: ProductBenefit[];
  criticalIllnessConditionsCount?: number;
  investmentComponent: boolean;
  investmentRisk?: 'Low' | 'Moderate' | 'High' | 'None';
  guaranteedElements: string[];
  nonGuaranteedElements: string[];
  ridersAvailable: string[];
  exclusions: string[];
  limitations: string[];
  feesAndCharges: string[];
  withdrawalRules?: string;
  surrenderRules?: string;
  claimsProcess: string;
  faqs: ProductFAQ[];
  documents: ProductDocument[];
  approvedStatements: string[];
  restrictedStatements: string[];
  advisorRequired: boolean;
  illustrationRequired: boolean;
  underwritingRequired: boolean;
  officialBrochureUrl?: string;
  verificationStatus: ProductVerificationStatus;
  lastVerified: string;
  verifiedBy: string;
  active: boolean;
}

export interface ProductMatch {
  product: Product;
  score: number;
  relevantNeed: string;
  whyItAppeared: string;
  importantConsiderations: string;
  informationStillNeeded: string;
  verificationStatus: ProductVerificationStatus;
}

export interface Concern {
  id: string;
  category: string;
  intent: string;
  clarificationQuestion: string;
  approvedFacts: string[];
  approvedExplanation: string;
  source: string;
  prohibitedStatements: string[];
  advisorEscalationRule: string;
}

export interface ApprovedResponse {
  id: string;
  topic: string;
  category: string;
  approvedText: string;
  sourceCitation: string;
  lastReviewed: string;
  reviewer: string;
}

export interface RestrictedStatement {
  id: string;
  prohibitedPhrase: string;
  reason: string;
  severity: 'BLOCK' | 'WARNING';
  suggestedAlternative: string;
}

export interface Lead {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  source: string;
  primaryNeed: string;
  secondaryNeeds?: string[];
  currentStage: SalesStage;
  assignedAdvisorId?: string;
  assignedAdvisorName?: string;
  lastInteraction: string;
  nextAction: string;
  followUpDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ACTIVE' | 'ARCHIVED' | 'CONVERTED' | 'OPTED_OUT';
  estimatedBudget?: string;
  stageHistory: { stage: SalesStage; timestamp: string; note?: string }[];
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'customer' | 'ai' | 'advisor' | 'system';
  agentType?: AgentType;
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string; payload?: unknown }[];
  complianceFlags?: string[];
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  leadId: string;
  customerId: string;
  customerName: string;
  startedAt: string;
  lastMessageAt: string;
  currentStage: SalesStage;
  currentAgent: AgentType;
  messages: Message[];
  unresolvedQuestions: string[];
  concernsRaised: string[];
  productsExplored: string[];
}

export interface AdvisorCaseSummary {
  leadId: string;
  customerAlias: string;
  conversationDurationMinutes: number;
  primaryNeed: string;
  secondaryNeeds: string[];
  needsProfileSummary: string;
  fnaPrioritySummary: string;
  budgetRange: string;
  existingCoverage: string;
  productsExplored: string[];
  questionsAsked: string[];
  unresolvedQuestions: string[];
  customerConcerns: string[];
  communicationPreference: string;
  currentStage: SalesStage;
  suggestedNextOperationalAction: string;
  advisorEditableNotes?: string;
  generatedAt: string;
}

export interface Appointment {
  id: string;
  leadId: string;
  customerId: string;
  customerName: string;
  advisorId: string;
  advisorName: string;
  date: string;
  time: string;
  consultationMode: 'Video' | 'Phone' | 'In Person — Demo';
  status: AppointmentStatus;
  notes: string;
  meetingLink?: string;
  createdAt: string;
}

export interface AdvisorNote {
  id: string;
  leadId: string;
  advisorId: string;
  advisorName: string;
  note: string;
  createdAt: string;
  category: 'General' | 'Needs' | 'FollowUp' | 'Underwriting' | 'Compliance';
}

export interface FollowUp {
  id: string;
  leadId: string;
  customerId: string;
  customerName: string;
  advisorId: string;
  dueDate: string;
  type:
    | 'Educational Recap'
    | 'Unanswered Question'
    | 'Advisor Invitation'
    | 'Appointment Reminder'
    | 'Application Reminder'
    | 'Document Reminder'
    | 'Annual Review'
    | 'Customer Service';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notes: string;
  createdAt: string;
}

export interface Application {
  id: string;
  leadId: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  coverageAmount: string;
  paymentMode: string;
  status: ApplicationStatus;
  underwritingNotes?: string;
  simulatedPolicyNumber?: string;
  submittedAt?: string;
  approvedAt?: string;
  issuedAt?: string;
  additionalRequirements?: string[];
  isSimulated: boolean;
}

export interface PolicySimulation {
  policyNumber: string;
  customerId: string;
  customerName: string;
  productName: string;
  coverageAmount: string;
  annualPremium: string;
  paymentFrequency: string;
  startDate: string;
  nextPaymentDate: string;
  beneficiaries: { name: string; relationship: string; percentage: number }[];
  status: 'ACTIVE_SIMULATED';
  servicingAdvisor: string;
}

export interface TrainingPersona {
  id: string;
  alias: string;
  ageRange: string;
  familySituation: string;
  occupation: string;
  incomeRange: string;
  dependents: number;
  existingCoverage: string;
  primaryNeed: string;
  secondaryNeeds: string[];
  budget: string;
  financialGoals: string[];
  riskPreference: 'Conservative' | 'Moderate' | 'Aggressive';
  personality: string;
  insuranceKnowledge: 'Beginner' | 'Intermediate' | 'Advanced';
  mainConcern: string;
  expectedQuestions: string[];
  expectedEscalation: boolean;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Extreme';
}

export interface TrainingScenario {
  id: string;
  title: string;
  description: string;
  personaId: string;
  primaryGoal: string;
  expectedAgentFlow: AgentType[];
  trapOrComplianceCheck?: string;
  benchmarkScore: number;
}

export interface SimulationTurn {
  role: 'customer' | 'ai';
  agent: AgentType;
  message: string;
  retrievedKnowledge?: string[];
  complianceCheck?: { passed: boolean; flag?: string };
  stage: SalesStage;
}

export interface Simulation {
  id: string;
  personaId: string;
  scenarioId: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  turns: SimulationTurn[];
  evaluation?: AIEvaluation;
}

export interface AIEvaluation {
  id: string;
  simulationId?: string;
  conversationId?: string;
  overallRating: EvaluationRating;
  intentIdentification: EvaluationRating;
  needsDiscovery: EvaluationRating;
  questionRelevance: EvaluationRating;
  productAccuracy: EvaluationRating;
  sourceGrounding: EvaluationRating;
  riskDisclosure: EvaluationRating;
  feesDisclosure: EvaluationRating;
  noFabricatedPremium: EvaluationRating;
  noFabricatedCoverage: EvaluationRating;
  noInvestmentGuarantee: EvaluationRating;
  privacyCompliance: EvaluationRating;
  appropriateAdvisorEscalation: EvaluationRating;
  concernHandling: EvaluationRating;
  complianceScorePercent: number;
  summaryFindings: string;
  failedRules: string[];
  evaluatedAt: string;
}

export interface KnowledgeImprovement {
  id: string;
  title: string;
  problem: string;
  evidence: string;
  affectedConversationsCount: number;
  affectedAgent: AgentType;
  currentResponse: string;
  proposedResponse: string;
  sourceSupport: string;
  complianceImpact: string;
  status: 'PROPOSED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'SUPERSEDED';
  proposedBy: string;
  reviewer?: string;
  decisionNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface PromptVersion {
  id: string;
  agentName: AgentType;
  version: string;
  status: 'DRAFT' | 'TESTING' | 'APPROVED' | 'ACTIVE' | 'RETIRED';
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  changeSummary: string;
  testScorePercent: number;
  systemPrompt: string;
}

export interface ComplianceRule {
  id: string;
  category: 'Pricing' | 'Coverage' | 'Investment' | 'Privacy' | 'Underwriting' | 'Marketing';
  description: string;
  severity: 'INFO' | 'WARNING' | 'BLOCK' | 'ESCALATE';
  triggerPattern: string;
  requiredAction: string;
  customerSafeMessage: string;
  active: boolean;
  version: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  resource: string;
  resourceId?: string;
  before?: string;
  after?: string;
  reason?: string;
  demoMode: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'LEAD' | 'APPOINTMENT' | 'FOLLOW_UP' | 'COMPLIANCE' | 'SYSTEM' | 'TRAINING';
  timestamp: string;
  read: boolean;
  linkRoute?: string;
}
