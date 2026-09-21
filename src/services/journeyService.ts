import { appStore } from './store';
import { Customer, FinancialNeedsAnalysis, Lead, NeedsProfile } from '../types';

export type JourneyStageStatus =
  | 'LOCKED'
  | 'AVAILABLE'
  | 'IN_PROGRESS'
  | 'ACTION_REQUIRED'
  | 'WAITING_FOR_CUSTOMER'
  | 'WAITING_FOR_ADVISOR'
  | 'WAITING_FOR_REVIEW'
  | 'COMPLETED'
  | 'NOT_APPLICABLE';

export interface StageRequirement {
  id: string;
  label: string;
  completed: boolean;
}

export interface JourneyStage {
  step: number;
  id: string;
  name: string;
  description: string;
  status: JourneyStageStatus;
  requirements: StageRequirement[];
  nextAction: string;
  completedAt?: string;
  responsibleParty: 'Customer' | 'AI Assistant' | 'Licensed Advisor' | 'Underwriting';
  reviewableDataKey?: string;
  lockReason?: string;
}

export class JourneyService {
  /**
   * Computes the real-time status of all 12 stages based on current customer and lead data
   */
  public static getJourney(customerId = 'cust-1'): JourneyStage[] {
    const state = appStore.getState();
    const customer = state.customers.find((c) => c.id === customerId);
    const lead = state.leads.find((l) => l.customerId === customerId) || state.leads[0];
    const profile = customer?.needsProfile;
    const fna = customer?.fnaResult;
    const appointments = state.appointments.filter((a) => a.customerId === customerId);
    const handoffs = state.handoffs.filter((h) => h.customerId === customerId);
    const applications = state.applications.filter((a) => a.customerId === customerId);

    // Step 1: Getting Started
    const s1Reqs: StageRequirement[] = [
      { id: 'ai_disclosure', label: 'AI disclosure viewed', completed: true },
      { id: 'demo_ack', label: 'Demo environment acknowledged', completed: true },
      { id: 'consent_captured', label: 'Consent captured', completed: lead?.consentToContact ?? true },
      { id: 'intent_identified', label: 'Primary intent identified', completed: Boolean(lead?.primaryNeed && lead.primaryNeed !== 'None') },
    ];
    const s1Complete = s1Reqs.every((r) => r.completed);

    // Step 2: Understand Your Needs
    const s2Reqs: StageRequirement[] = [
      { id: 'primary_concern', label: 'Primary financial concern identified', completed: Boolean(profile?.primaryNeed) },
      { id: 'household_context', label: 'Relevant household context & dependents', completed: (profile?.dependentsCount ?? 0) >= 0 && Boolean(profile?.ageRange) },
      { id: 'existing_protection', label: 'Existing protection & HMO recorded', completed: Boolean(profile?.existingHMO && profile.existingHMO !== 'Pending') },
      { id: 'financial_goal', label: 'Financial goal stated', completed: Boolean(profile?.primaryNeed) },
      { id: 'budget_range', label: 'Approximate budget range established', completed: Boolean(profile?.monthlyBudget && profile.monthlyBudget !== 'Pending') },
    ];
    const s2Complete = s2Reqs.every((r) => r.completed);

    // Step 3: Financial Needs Analysis
    const s3Reqs: StageRequirement[] = [
      { id: 'profile_complete', label: 'Needs profile sufficiently complete', completed: s2Complete },
      { id: 'inputs_validated', label: 'Required inputs validated', completed: Boolean(profile?.monthlyBudget && profile?.existingHMO) },
      { id: 'fna_generated', label: 'Analysis & coverage target generated', completed: Boolean(fna && fna.recommendedCoverageAmount > 0) },
      { id: 'review_allowed', label: 'Customer allowed to review/correct inputs', completed: true },
    ];
    const s3Complete = s3Reqs.every((r) => r.completed);

    // Step 4: Explore Solutions
    const exploredProducts = lead?.productsExplored || [];
    const s4Reqs: StageRequirement[] = [
      { id: 'verified_products', label: 'Relevant verified products retrieved', completed: exploredProducts.length > 0 },
      { id: 'product_explanation', label: 'Customer received product explanation', completed: exploredProducts.length > 0 },
      { id: 'limitations_disclosed', label: 'Important limitations disclosed', completed: exploredProducts.length > 0 },
    ];
    const s4Complete = s4Reqs.every((r) => r.completed);

    // Step 5: Understand Your Options
    const s5Reqs: StageRequirement[] = [
      { id: 'options_reviewed', label: 'Product options compared', completed: exploredProducts.length >= 1 },
      { id: 'material_differences', label: 'Material differences explained', completed: exploredProducts.length >= 1 },
      { id: 'outstanding_questions', label: 'Outstanding product questions noted', completed: true },
    ];
    const s5Complete = s5Reqs.every((r) => r.completed);

    // Step 6: Questions & Concerns
    const customerConcerns = lead?.customerConcerns || [];
    const customerQuestions = lead?.customerQuestions || [];
    const s6Reqs: StageRequirement[] = [
      { id: 'questions_captured', label: 'Customer questions captured', completed: customerQuestions.length > 0 || exploredProducts.length > 0 },
      { id: 'concerns_addressed', label: 'Material concerns addressed or escalated', completed: customerConcerns.length > 0 || true },
      { id: 'unresolved_identified', label: 'Unresolved items identified for advisor', completed: true },
    ];
    const s6Complete = s6Reqs.every((r) => r.completed);

    // Step 7: Advisor Consultation
    const hasScheduledAppointment = appointments.some((a) => a.status === 'CONFIRMED' || a.status === 'COMPLETED');
    const hasHandoff = handoffs.length > 0;
    const consultationDone = appointments.some((a) => a.status === 'COMPLETED') || (lead?.salesReadinessScore ?? 0) >= 80;
    const s7Reqs: StageRequirement[] = [
      { id: 'case_summary_ready', label: 'Advisor case summary prepared', completed: hasHandoff || Boolean(lead?.notes) },
      { id: 'advisor_assigned', label: 'Licensed advisor assigned (Bishop Orly B. Languisan)', completed: true },
      { id: 'consultation_requested', label: 'Customer requests/accepts consultation', completed: hasScheduledAppointment || hasHandoff },
      { id: 'consultation_completed', label: 'Advisor consultation conducted', completed: consultationDone },
    ];
    const s7Complete = s7Reqs.every((r) => r.completed);

    // Step 8: Official Illustration
    const hasApplication = applications.length > 0;
    const illustrationPrepared = hasApplication || consultationDone;
    const s8Reqs: StageRequirement[] = [
      { id: 'consultation_prereq', label: 'Advisor consultation completed', completed: consultationDone },
      { id: 'official_illustration', label: 'Official illustration requested via authorized advisor system', completed: illustrationPrepared },
      { id: 'customer_review', label: 'Customer reviewed official illustration terms', completed: illustrationPrepared },
    ];
    const s8Complete = s8Reqs.every((r) => r.completed);

    // Step 9: Application
    const appRecord = applications[0];
    const s9Reqs: StageRequirement[] = [
      { id: 'illustration_reviewed', label: 'Official illustration acknowledged', completed: s8Complete },
      { id: 'proceed_choice', label: 'Customer chosen to proceed with application', completed: Boolean(appRecord) },
      { id: 'beneficiary_recorded', label: 'Beneficiary & declarations completed (Demo)', completed: Boolean(appRecord) },
    ];
    const s9Complete = Boolean(appRecord && (appRecord.status === 'SUBMITTED' || appRecord.status === 'APPROVED' || appRecord.status === 'POLICY_ISSUED'));

    // Step 10: Underwriting
    const s10Reqs: StageRequirement[] = [
      { id: 'app_submitted', label: 'Application submitted for review', completed: s9Complete },
      { id: 'uw_requirements', label: 'Underwriting disclosures logged (Demo simulation)', completed: s9Complete },
    ];
    const s10Complete = s9Complete && (appRecord?.status === 'APPROVED' || appRecord?.status === 'POLICY_ISSUED');

    // Step 11: Policy Decision
    const s11Reqs: StageRequirement[] = [
      { id: 'uw_decision', label: 'Policy decision received (Demo simulation)', completed: s10Complete },
      { id: 'policy_issuance', label: 'Policy document generated in customer portal', completed: s10Complete },
    ];
    const s11Complete = s10Complete;

    // Step 12: Customer Care
    const s12Reqs: StageRequirement[] = [
      { id: 'policy_education', label: 'Policy terms and servicing education', completed: s11Complete },
      { id: 'claims_guidance', label: 'Claims process & beneficiary guidance', completed: s11Complete },
      { id: 'advisor_contact', label: 'Dedicated advisor ongoing contact available', completed: true },
    ];
    const s12Complete = s11Complete;

    // Upstream change detection
    const isUpstreamChanged = (profile?.monthlyBudget === 'Pending' || !profile?.primaryNeed) && s3Complete;

    const stages: JourneyStage[] = [
      {
        step: 1,
        id: 'getting_started',
        name: 'Getting Started',
        description: 'AI disclosure, interactive demo acknowledgement, and initial intent',
        status: s1Complete ? 'COMPLETED' : 'IN_PROGRESS',
        requirements: s1Reqs,
        nextAction: s1Complete ? 'Proceed to Needs Discovery' : 'Confirm consent and primary need',
        completedAt: '2026-03-21T08:00:00Z',
        responsibleParty: 'Customer',
      },
      {
        step: 2,
        id: 'needs_discovery',
        name: 'Understand Your Needs',
        description: 'Explore household context, existing HMO coverage, and financial goals',
        status: !s1Complete ? 'LOCKED' : s2Complete ? 'COMPLETED' : 'IN_PROGRESS',
        requirements: s2Reqs,
        nextAction: s2Complete ? 'Generate Financial Needs Analysis' : 'Provide household and budget context',
        completedAt: s2Complete ? '2026-03-21T08:15:00Z' : undefined,
        responsibleParty: 'Customer',
        lockReason: !s1Complete ? 'Complete Step 1 (Getting Started) first' : undefined,
        reviewableDataKey: 'needsProfile',
      },
      {
        step: 3,
        id: 'fna',
        name: 'Financial Needs Analysis',
        description: 'Calculates protection gap and calibrated coverage recommendation',
        status: !s2Complete
          ? 'LOCKED'
          : isUpstreamChanged
          ? 'WAITING_FOR_REVIEW'
          : s3Complete
          ? 'COMPLETED'
          : 'AVAILABLE',
        requirements: s3Reqs,
        nextAction: s3Complete ? 'Explore verified AXA protection plans' : 'Complete remaining needs inputs',
        completedAt: s3Complete ? '2026-03-21T08:20:00Z' : undefined,
        responsibleParty: 'AI Assistant',
        lockReason: !s2Complete ? 'Complete Step 2 (Needs Discovery) with budget and existing HMO' : undefined,
        reviewableDataKey: 'fnaResult',
      },
      {
        step: 4,
        id: 'explore_solutions',
        name: 'Explore Solutions',
        description: 'Review verified AXA product options matched to your financial goals',
        status: !s3Complete ? 'LOCKED' : s4Complete ? 'COMPLETED' : 'IN_PROGRESS',
        requirements: s4Reqs,
        nextAction: s4Complete ? 'Compare options and material differences' : 'Discuss candidate protection plans',
        completedAt: s4Complete ? '2026-03-21T08:25:00Z' : undefined,
        responsibleParty: 'AI Assistant',
        lockReason: !s3Complete ? 'Complete Step 3 (Financial Needs Analysis) first' : undefined,
        reviewableDataKey: 'productsExplored',
      },
      {
        step: 5,
        id: 'understand_options',
        name: 'Understand Your Options',
        description: 'Side-by-side comparison of benefits, waiting periods, and charges',
        status: !s4Complete ? 'LOCKED' : s5Complete ? 'COMPLETED' : 'AVAILABLE',
        requirements: s5Reqs,
        nextAction: s5Complete ? 'Address specific questions and concerns' : 'Review plan differences with AI',
        completedAt: s5Complete ? '2026-03-21T08:30:00Z' : undefined,
        responsibleParty: 'Customer',
        lockReason: !s4Complete ? 'Complete Step 4 (Explore Solutions) first' : undefined,
      },
      {
        step: 6,
        id: 'questions_concerns',
        name: 'Questions & Concerns',
        description: 'Resolve questions on HMO overlap, affordability, and exclusions',
        status: !s5Complete ? 'LOCKED' : s6Complete ? 'COMPLETED' : 'IN_PROGRESS',
        requirements: s6Reqs,
        nextAction: s6Complete ? 'Connect with designated advisor' : 'Ask questions or state concerns',
        completedAt: s6Complete ? '2026-03-21T08:35:00Z' : undefined,
        responsibleParty: 'Customer',
        lockReason: !s5Complete ? 'Complete Step 5 (Understand Your Options) first' : undefined,
      },
      {
        step: 7,
        id: 'advisor_consultation',
        name: 'Advisor Consultation',
        description: 'One-on-one consultation with licensed advisor Bishop Orly B. Languisan',
        status: !s6Complete
          ? 'LOCKED'
          : consultationDone
          ? 'COMPLETED'
          : hasScheduledAppointment
          ? 'WAITING_FOR_ADVISOR'
          : 'ACTION_REQUIRED',
        requirements: s7Reqs,
        nextAction: consultationDone
          ? 'Request official illustration'
          : hasScheduledAppointment
          ? 'Attend scheduled consultation'
          : 'Schedule consultation or request callback',
        completedAt: consultationDone ? '2026-03-21T09:00:00Z' : undefined,
        responsibleParty: 'Licensed Advisor',
        lockReason: !s6Complete ? 'Complete Step 6 (Questions & Concerns) first' : undefined,
      },
      {
        step: 8,
        id: 'official_illustration',
        name: 'Official Illustration',
        description: 'Authorized premium quote and guaranteed benefit schedule',
        status: !consultationDone ? 'LOCKED' : s8Complete ? 'COMPLETED' : 'AVAILABLE',
        requirements: s8Reqs,
        nextAction: s8Complete ? 'Begin application review' : 'Advisor prepares official illustration',
        completedAt: s8Complete ? '2026-03-21T09:30:00Z' : undefined,
        responsibleParty: 'Licensed Advisor',
        lockReason: !consultationDone ? 'Requires completed Advisor Consultation (Bishop Orly B. Languisan)' : undefined,
      },
      {
        step: 9,
        id: 'application',
        name: 'Application',
        description: 'Formal policy application, declarations, and beneficiary details (Demo)',
        status: !s8Complete ? 'LOCKED' : s9Complete ? 'COMPLETED' : 'AVAILABLE',
        requirements: s9Reqs,
        nextAction: s9Complete ? 'Track underwriting review' : 'Complete demo application fields',
        completedAt: s9Complete ? '2026-03-21T10:00:00Z' : undefined,
        responsibleParty: 'Customer',
        lockReason: !s8Complete ? 'Official Illustration must be reviewed with advisor before application' : undefined,
      },
      {
        step: 10,
        id: 'underwriting',
        name: 'Underwriting',
        description: 'Medical & financial underwriting status (Demo simulation only)',
        status: !s9Complete ? 'LOCKED' : s10Complete ? 'COMPLETED' : 'IN_PROGRESS',
        requirements: s10Reqs,
        nextAction: s10Complete ? 'Review policy decision' : 'Underwriting review in progress (Demo)',
        completedAt: s10Complete ? '2026-03-21T10:30:00Z' : undefined,
        responsibleParty: 'Underwriting',
        lockReason: !s9Complete ? 'Submit application first' : undefined,
      },
      {
        step: 11,
        id: 'policy_decision',
        name: 'Policy Decision',
        description: 'Policy approved and simulated contract issuance',
        status: !s10Complete ? 'LOCKED' : s11Complete ? 'COMPLETED' : 'IN_PROGRESS',
        requirements: s11Reqs,
        nextAction: s11Complete ? 'Access customer care and policy documents' : 'Awaiting decision',
        completedAt: s11Complete ? '2026-03-21T11:00:00Z' : undefined,
        responsibleParty: 'Underwriting',
        lockReason: !s10Complete ? 'Awaiting underwriting review' : undefined,
      },
      {
        step: 12,
        id: 'customer_care',
        name: 'Customer Care',
        description: 'Servicing, beneficiary updates, annual reviews, and direct advisor access',
        status: !s11Complete ? 'LOCKED' : 'AVAILABLE',
        requirements: s12Reqs,
        nextAction: 'Ongoing customer care and annual policy reviews',
        responsibleParty: 'Licensed Advisor',
        lockReason: !s11Complete ? 'Policy must be issued to access policy servicing' : undefined,
      },
    ];

    return stages;
  }

  /**
   * Helper to determine remaining items for a locked stage
   */
  public static getMissingRequirementsSummary(stage: JourneyStage): string[] {
    return stage.requirements.filter((r) => !r.completed).map((r) => r.label);
  }
}
