import {
  AdvisorCaseSummary,
  AgentType,
  FinancialNeedsAnalysis,
  FNACategoryScore,
  Message,
  NeedsProfile,
  Product,
  ProductMatch,
  SalesStage,
} from '../types';
import { appStore } from '../services/store';

export interface OrchestratorContext {
  leadId: string;
  customerId: string;
  customerName: string;
  stage: SalesStage;
  needsProfile?: NeedsProfile;
  lastUserMessage: string;
  conversationHistory: Message[];
}

export interface OrchestratorOutput {
  agent: AgentType;
  response: string;
  suggestedActions?: { label: string; action: string; payload?: unknown }[];
  complianceFlags?: string[];
  newStage?: SalesStage;
  fnaResult?: FinancialNeedsAnalysis;
  matchedProducts?: ProductMatch[];
  advisorSummary?: AdvisorCaseSummary;
}

export class AIOrchestrator {
  // Compliance Sentinel: check text for safety guardrails
  public static runComplianceCheck(text: string): { flags: string[]; cleanedText: string } {
    const flags: string[] = [];
    let cleanedText = text;

    // 1. Fabricated premium check
    if (/(?:guaranteed (?:premium|rate) is|the exact premium is \u20b1|only costs \u20b1[0-9,]+ per month guaranteed)/i.test(text)) {
      flags.push('FABRICATED_PREMIUM_DETECTED');
      cleanedText += '\n\n*(Official Notice: Premiums are determined by authorized underwriting and age/gender criteria. An official illustration is required.)*';
    }

    // 2. Investment guarantee check
    if (/(?:guaranteed return of [0-9]+%|risk-free (?:market )?growth|you will definitely double your money)/i.test(text)) {
      flags.push('INVESTMENT_GUARANTEE_DETECTED');
      cleanedText = cleanedText.replace(/(?:guaranteed return of [0-9]+%|risk-free (?:market )?growth)/gi, 'potential market growth (non-guaranteed)');
      cleanedText += '\n\n*(Risk Disclosure: Unit-linked investments are subject to market volatility. Fund returns are not guaranteed.)*';
    }

    // 3. Underwriting approval promise
    if (/(?:you will definitely be approved|guaranteed approval without health check)/i.test(text)) {
      flags.push('UNDERWRITING_PROMISE_DETECTED');
      cleanedText += '\n\n*(Underwriting Notice: All coverage is subject to standard AXA medical and financial underwriting review.)*';
    }

    // 4. Artificial scarcity
    if (/(?:offer expires today|only [0-9]+ slots left|buy now before it runs out)/i.test(text)) {
      flags.push('ARTIFICIAL_SCARCITY_DETECTED');
      cleanedText = cleanedText.replace(/(?:offer expires today|only [0-9]+ slots left|buy now before it runs out)/gi, '');
    }

    return { flags, cleanedText };
  }

  // Rules-based Product Matcher
  public static matchProducts(primaryNeed: string, secondaryNeeds: string[] = []): ProductMatch[] {
    const products = appStore.getState().products.filter((p) => p.active && p.verificationStatus === 'VERIFIED');
    const matches: ProductMatch[] = [];

    products.forEach((product) => {
      let score = 0;
      let why = '';

      if (product.primaryNeed.toLowerCase() === primaryNeed.toLowerCase()) {
        score += 50;
        why = `Directly matches your primary goal for ${primaryNeed}.`;
      } else if (product.secondaryNeeds.some((sn) => sn.toLowerCase() === primaryNeed.toLowerCase())) {
        score += 30;
        why = `Offers complementary coverage addressing ${primaryNeed}.`;
      }

      if (secondaryNeeds.some((sn) => product.secondaryNeeds.some((psn) => psn.toLowerCase() === sn.toLowerCase()))) {
        score += 20;
        why += ' Also aligns with your secondary family goals.';
      }

      if (score > 0) {
        matches.push({
          product,
          score,
          relevantNeed: product.primaryNeed,
          whyItAppeared: why || `Designed for ${product.category} protection.`,
          importantConsiderations: product.investmentComponent
            ? 'Account value fluctuates with market funds. Premiums include cost of insurance.'
            : 'Traditional plan with guaranteed benefits; subject to 90-day waiting period for critical illnesses.',
          informationStillNeeded: 'Exact birthdate, smoking status, and chosen sum insured for official illustration.',
          verificationStatus: product.verificationStatus,
        });
      }
    });

    return matches.sort((a, b) => b.score - a.score).slice(0, 3);
  }

  // Generate Demo Financial Needs Analysis
  public static generateDemoFNA(customerId: string, profile: NeedsProfile): FinancialNeedsAnalysis {
    const categories: FNACategoryScore[] = [
      {
        category: 'Critical Illness Protection',
        priority: profile.primaryNeed === 'Critical Illness' ? 'HIGH' : 'MEDIUM',
        rationale: 'Major illness treatments (cancer, stroke, cardiac surgery) typically exceed ₱1.5M–₱3.0M, rapidly exhausting standard employer HMO cards.',
        estimatedGap: profile.existingHealthInsurance.includes('Employer') ? '₱1,500,000–₱2,500,000' : '₱2,500,000+',
        recommendedFocus: 'AXA Health Max or Health Start lump-sum recovery fund',
      },
      {
        category: 'Family Income Protection',
        priority: profile.dependentsCount >= 2 ? 'HIGH' : 'MEDIUM',
        rationale: `With ${profile.dependentsCount} dependent(s) and existing mortgage/living commitments, breadwinner loss would cause immediate family income shortfall.`,
        estimatedGap: '5 to 10 years of household annual living expenses',
        recommendedFocus: 'AXA FlexiProtect (Pure Term) or MyLifeChoice',
      },
      {
        category: 'Children\'s Education',
        priority: profile.secondaryNeeds.includes('Children\'s Education') ? 'HIGH' : 'MEDIUM',
        rationale: 'College tuition in private universities escalates at 6–9% annually. A guaranteed education endowment ringfences college funds.',
        estimatedGap: '₱1,200,000 per child for 4-year degree',
        recommendedFocus: 'AXA Academic Builder or MyLifeChoice targeted fund',
      },
      {
        category: 'Emergency Reserve',
        priority: profile.emergencySavingsMonths.includes('3 months') ? 'MEDIUM' : 'DEVELOPING',
        rationale: 'Maintaining 3 to 6 months of liquid living expenses is the foundation before committing to long-term investment plans.',
        estimatedGap: '3 additional months of liquid buffer',
        recommendedFocus: 'High-yield bank savings before long-term commitments',
      },
      {
        category: 'Retirement Wealth Stream',
        priority: profile.primaryNeed === 'Retirement' ? 'HIGH' : 'DEVELOPING',
        rationale: 'Longevity protection to sustain monthly lifestyle without relying on children or depleting principal.',
        estimatedGap: 'Guaranteed pension stream of ₱50k–₱100k/month',
        recommendedFocus: 'AXA RetireSmart Annuity or MyAmbition',
      },
    ];

    const fna: FinancialNeedsAnalysis = {
      id: `fna-${Date.now()}`,
      customerId,
      categories,
      summaryNarrative: `Based on your profile as a ${profile.occupation} supporting ${profile.dependentsCount} dependent(s) with an existing ${profile.existingHMO}, your highest strategic priority is closing the critical illness gap while securing family income continuity.`,
      keyRecommendations: [
        'Secure standalone critical illness cash coverage to supplement employer HMO.',
        'Protect household income stream during high mortgage amortization years.',
        'Review comfortable monthly allocation within your ₱5,000–₱10,000 target band.',
      ],
      generatedAt: new Date().toISOString(),
      isSimulated: true,
    };

    return fna;
  }

  // Generate structured Advisor Case Summary
  public static generateAdvisorSummary(context: OrchestratorContext): AdvisorCaseSummary {
    const profile = context.needsProfile;
    return {
      leadId: context.leadId,
      customerAlias: context.customerName,
      conversationDurationMinutes: 8,
      primaryNeed: profile?.primaryNeed || 'Critical Illness',
      secondaryNeeds: profile?.secondaryNeeds || ['Protect My Family'],
      needsProfileSummary: profile
        ? `Age ${profile.ageRange}, ${profile.occupation}, ${profile.dependentsCount} dependent(s). Income: ${profile.incomeRange}. Current HMO: ${profile.existingHMO}.`
        : 'Needs discovery partially complete.',
      fnaPrioritySummary: 'High Critical Illness gap identified; secondary focus on Family Income Protection.',
      budgetRange: profile?.monthlyBudget || '₱6,000–₱10,000 / month',
      existingCoverage: profile?.existingLifeInsurance || 'Employer group term only',
      productsExplored: ['AXA Health Max', 'AXA Health Start', 'AXA FlexiProtect'],
      questionsAsked: [
        'How does Health Max work with my company HMO?',
        'What is the waiting period for critical illnesses?',
        'Can I adjust the monthly budget if needed?',
      ],
      unresolvedQuestions: ['Exact premium quotation based on exact birthdate and underwriting classification.'],
      customerConcerns: ['Affordability / Monthly budget sustainability', 'HMO duplication inquiry'],
      communicationPreference: 'Video Consultation',
      currentStage: 'ADVISOR_READY',
      suggestedNextOperationalAction:
        'Schedule 20-minute video consultation to review customized Health Max illustration and discuss family living allowance.',
      advisorEditableNotes: 'Prospect is highly responsive and prioritizing children\'s security. Recommended to prepare comparison with Health Start.',
      generatedAt: new Date().toISOString(),
    };
  }

  // Main Orchestration Turn
  public static async processTurn(context: OrchestratorContext): Promise<OrchestratorOutput> {
    const lower = context.lastUserMessage.toLowerCase();

    // 1. Check for Objection / Concern triggers
    if (
      lower.includes('expensive') ||
      lower.includes('afford') ||
      lower.includes('budget') ||
      lower.includes('hmo') ||
      lower.includes('company covers') ||
      lower.includes('scam') ||
      lower.includes('trust') ||
      lower.includes('think about') ||
      lower.includes('spouse') ||
      lower.includes('husband') ||
      lower.includes('wife') ||
      lower.includes('deny') ||
      lower.includes('exclusion')
    ) {
      const concern = appStore.getState().concerns.find((c) => {
        if (lower.includes('hmo') && c.category === 'EXISTING_HMO') return true;
        if ((lower.includes('afford') || lower.includes('expensive') || lower.includes('budget')) && c.category === 'AFFORDABILITY') return true;
        if ((lower.includes('spouse') || lower.includes('husband') || lower.includes('wife')) && c.category === 'SPOUSE_DECISION') return true;
        if (lower.includes('think') && c.category === 'NEED_TO_THINK') return true;
        return false;
      });

      if (concern) {
        const text = `${concern.approvedExplanation}\n\n*${concern.clarificationQuestion}*`;
        const { flags, cleanedText } = this.runComplianceCheck(text);
        return {
          agent: 'ConcernAgent',
          response: cleanedText,
          complianceFlags: flags,
          newStage: 'QUESTIONS_CONCERNS',
          suggestedActions: [
            { label: 'Explore Affordable Options', action: 'EXPLORE_BUDGET' },
            { label: 'Compare with HMO', action: 'COMPARE_HMO' },
            { label: 'Talk to an Advisor', action: 'TALK_TO_ADVISOR' },
          ],
        };
      }
    }

    // 2. Needs Discovery Progression
    if (context.stage === 'CONSENT' || context.stage === 'NEEDS_DISCOVERY' || context.stage === 'NEW_LEAD') {
      let primaryNeed = 'Critical Illness';
      if (lower.includes('health') || lower.includes('medical')) primaryNeed = 'Health & Medical';
      else if (lower.includes('family') || lower.includes('income')) primaryNeed = 'Protect My Family';
      else if (lower.includes('education') || lower.includes('college')) primaryNeed = 'Children\'s Education';
      else if (lower.includes('retire')) primaryNeed = 'Retirement';
      else if (lower.includes('invest') || lower.includes('saving')) primaryNeed = 'Savings & Investment';
      else if (lower.includes('car') || lower.includes('auto')) primaryNeed = 'Car';
      else if (lower.includes('home') || lower.includes('house')) primaryNeed = 'Home';
      else if (lower.includes('business') || lower.includes('sme')) primaryNeed = 'Business';
      else if (lower.includes('travel')) primaryNeed = 'Travel';

      // Update store needs profile
      appStore.updateNeedsProfile(context.customerId, { primaryNeed });
      appStore.updateLeadStage(context.leadId, 'PROFILE_IN_PROGRESS', `Customer selected ${primaryNeed}`);

      const response =
        `Understood. Focusing on **${primaryNeed}** is a vital priority. ` +
        `To help evaluate the appropriate protection level without overwhelming you, may I ask a few quick questions?\n\n` +
        `1. What is your approximate age bracket?\n` +
        `2. Do you have dependents (children or elderly parents) relying on your income?\n` +
        `3. Do you currently have an employer HMO or existing personal life insurance?`;

      return {
        agent: 'NeedsAnalystAgent',
        response,
        newStage: 'PROFILE_IN_PROGRESS',
        suggestedActions: [
          { label: 'Age 25–35, 1 Dependent, Employer HMO', action: 'QUICK_PROFILE_1' },
          { label: 'Age 35–45, 2 Dependents, Employer HMO', action: 'QUICK_PROFILE_2' },
          { label: 'Age 45+, Self-Employed, No HMO', action: 'QUICK_PROFILE_3' },
          { label: 'Talk to an Advisor', action: 'TALK_TO_ADVISOR' },
        ],
      };
    }

    // 3. Completing Needs Profile and Generating FNA
    if (
      context.stage === 'PROFILE_IN_PROGRESS' ||
      lower.includes('age') ||
      lower.includes('dependent') ||
      lower.includes('married') ||
      lower.includes('profile')
    ) {
      const profile = appStore.getState().customers.find((c) => c.id === context.customerId)?.needsProfile || {
        id: 'np-demo',
        customerId: context.customerId,
        ageRange: '35–40',
        maritalStatus: 'Married',
        dependentsCount: 2,
        occupation: 'Marketing Director',
        employmentStatus: 'Employed',
        incomeRange: '₱120,000–₱180,000 / month',
        existingLifeInsurance: '₱1M company group life',
        existingHealthInsurance: 'Employer HMO (₱150k limit)',
        existingHMO: '₱150,000 limit',
        emergencySavingsMonths: '3 months',
        primaryNeed: 'Critical Illness',
        secondaryNeeds: ['Children\'s Education', 'Protect My Family'],
        monthlyBudget: '₱6,000–₱10,000 / month',
        financialObligations: 'Mortgage amortization',
        investmentHorizon: '10–15 years',
        riskTolerance: 'Moderate',
        isComplete: true,
        updatedAt: new Date().toISOString(),
      };

      const fna = this.generateDemoFNA(context.customerId, profile);
      appStore.setCustomerFNA(context.customerId, fna);
      appStore.updateLeadStage(context.leadId, 'FNA_COMPLETE', 'Demo FNA completed');

      const matches = this.matchProducts(profile.primaryNeed, profile.secondaryNeeds);

      const response =
        `Thank you for sharing those details. I've compiled your **Customer Need Profile** and generated a transparent **Demo Financial Needs Analysis (FNA)**.\n\n` +
        `**Key Observation**: While your employer HMO handles minor hospital bills, a major health crisis creates a living-expense gap that your HMO does not cover.\n\n` +
        `Based on verified AXA product specifications, here are candidate solutions designed to explore for your situation:`;

      return {
        agent: 'FNAAgent',
        response,
        newStage: 'PRODUCT_EDUCATION',
        fnaResult: fna,
        matchedProducts: matches,
        suggestedActions: [
          { label: 'Explore AXA Health Max', action: 'VIEW_PRODUCT', payload: 'prod-health-max' },
          { label: 'Compare Candidate Products', action: 'COMPARE_PRODUCTS' },
          { label: 'I have budget concerns', action: 'CONCERN_AFFORDABILITY' },
          { label: 'Talk to an Advisor', action: 'TALK_TO_ADVISOR' },
        ],
      };
    }

    // 4. Advisor Escalation & Handoff Trigger (Requests #76, #77, #83)
    const isExplicitAdvisorRequest =
      lower.includes('advisor') ||
      lower.includes('human') ||
      lower.includes('agent') ||
      lower.includes('consult') ||
      lower.includes('talk to someone') ||
      lower.includes('speak to someone') ||
      lower.includes('call me');

    const isMedicalUnderwritingCondition =
      lower.includes('cancer') ||
      lower.includes('tumor') ||
      lower.includes('heart attack') ||
      lower.includes('stroke') ||
      lower.includes('hypertension') ||
      lower.includes('diabetes') ||
      lower.includes('cardiac') ||
      lower.includes('surgery') ||
      lower.includes('hospitalized') ||
      lower.includes('pre-existing') ||
      lower.includes('medical record');

    const isComplexEstateOrHighNetWorth =
      lower.includes('estate tax') ||
      lower.includes('estate planning') ||
      lower.includes('succession') ||
      lower.includes('trust fund') ||
      lower.includes('holding company') ||
      lower.includes('inheritance');

    const isQuotationIllustrationRequest =
      lower.includes('official illustration') ||
      lower.includes('formal quote') ||
      lower.includes('bind policy') ||
      lower.includes('exact quotation') ||
      lower.includes('official quote');

    if (
      isExplicitAdvisorRequest ||
      isMedicalUnderwritingCondition ||
      isComplexEstateOrHighNetWorth ||
      isQuotationIllustrationRequest
    ) {
      const primaryAdvisor = appStore.getPrimaryAdvisor();
      const summary = this.generateAdvisorSummary(context);
      appStore.setAdvisorSummary(summary);
      appStore.updateLeadStage(context.leadId, 'ADVISOR_READY', 'Prospect escalated to designated advisor');

      let escalationReason = 'Customer requested advisor consultation';
      let escalationContextNotice = 'I have prepared a confidential Advisor Case Summary with your discussed needs, existing HMO coverage, and explored plans so your advisor can assist you efficiently.';

      if (isMedicalUnderwritingCondition) {
        escalationReason = 'Medical underwriting condition identified (medical review required)';
        escalationContextNotice = 'Because inquiries involving medical histories, pre-existing conditions, or health evaluations require authorized underwriting evaluation, I have logged this inquiry for your designated licensed advisor to review with professional diligence.';
      } else if (isComplexEstateOrHighNetWorth) {
        escalationReason = 'Complex estate planning & wealth succession consultation';
        escalationContextNotice = 'Estate planning and wealth preservation involve customized tax and legal structuring that requires personal guidance from an authorized insurance advisor.';
      } else if (isQuotationIllustrationRequest) {
        escalationReason = 'Official policy illustration & quotation requested';
        escalationContextNotice = 'Generating an official, binding AXA policy illustration requires authorized sales advisor credential verification and tailored actuarial parameters.';
      }

      // Record 19-field Advisor Handoff record (#77)
      appStore.createAdvisorHandoff({
        leadId: context.leadId,
        customerId: context.customerId,
        customerName: context.customerName,
        customerPhone: '+63 918 123 4567',
        conversationId: 'conv-101',
        advisorId: primaryAdvisor.advisorId || 'ADV-0001',
        advisorName: primaryAdvisor.fullName || 'Bishop Orly B. Languisan',
        primaryNeed: summary.primaryNeed,
        secondaryNeeds: summary.secondaryNeeds,
        productsExplored: summary.productsExplored,
        customerQuestions: [context.lastUserMessage, ...summary.questionsAsked],
        customerConcerns: summary.customerConcerns,
        unresolvedQuestions: summary.unresolvedQuestions,
        budgetRange: summary.budgetRange,
        preferredContactMethod: 'Consultation',
        appointmentRequested: false,
        handoffReason: escalationReason,
        handoffStatus: 'REQUESTED',
        consentToContact: true,
        notes: `${escalationReason}. Case summary attached.`,
      });

      const response =
        `Your designated Licensed Insurance Advisor is **${primaryAdvisor.fullName}**.\n\n` +
        `• **Role**: ${primaryAdvisor.role}\n` +
        `• **Direct Mobile**: ${primaryAdvisor.mobilePhone}\n` +
        `• **Status**: ${primaryAdvisor.availabilityStatus || 'AVAILABLE'}\n\n` +
        `${escalationContextNotice}\n\n` +
        `You are welcome to choose any of the options below. You also remain completely free to continue exploring plans with AI at your own pace without pressure.`;

      return {
        agent: 'IllustrationAssistantAgent',
        response,
        newStage: 'ADVISOR_READY',
        advisorSummary: summary,
        suggestedActions: [
          { label: `Call Advisor (${primaryAdvisor.mobilePhone})`, action: 'CALL_ADVISOR' },
          { label: 'Schedule Consultation', action: 'BOOK_APPOINTMENT' },
          { label: 'Request a Callback', action: 'REQUEST_CALLBACK' },
          { label: 'View Case Summary', action: 'VIEW_SUMMARY' },
          { label: 'Continue Exploring with AI', action: 'CONTINUE_EXPLORING' },
        ],
      };
    }

    // 5. Default Product / General Question Specialist
    const matched = this.matchProducts('Critical Illness');
    const defaultResponse =
      `AXA provides comprehensive protection tailored to your goals. Our verified plans include **AXA Health Max** (lifetime coverage for 56 critical illnesses up to age 100), **AXA Health Start** (affordable starter cover with return of premium), and **AXA FlexiProtect** (pure income protection).\n\n` +
      `Would you like to examine specific product benefits, compare coverage details, or speak directly with an advisor?`;

    const { flags, cleanedText } = this.runComplianceCheck(defaultResponse);

    return {
      agent: 'ProductSpecialistAgent',
      response: cleanedText,
      complianceFlags: flags,
      matchedProducts: matched,
      suggestedActions: [
        { label: 'View Health Max Details', action: 'VIEW_PRODUCT', payload: 'prod-health-max' },
        { label: 'View Health Start Details', action: 'VIEW_PRODUCT', payload: 'prod-health-start' },
        { label: 'Book an Advisor Consultation', action: 'TALK_TO_ADVISOR' },
      ],
    };
  }
}
