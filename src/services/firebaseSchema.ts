/**
 * Firebase Firestore Schema Specification & Data Access Helpers
 * Request #85: Prepare Firebase structure (/advisors/ADV-0001)
 *
 * Firestore Collections:
 * 1. /advisors/{advisorId}
 *    - Document ID: ADV-0001
 *    - Stores primary designated advisor profile.
 *
 * 2. /handoffs/{handoffId}
 *    - Stores 19-field structured customer-to-advisor escalation packages.
 *
 * 3. /callbacks/{callbackId}
 *    - Stores customer callback requests with preferred time windows.
 */

import { Advisor, AdvisorHandoff, CallbackRequest } from '../types';

export interface FirestoreAdvisorDoc {
  advisorId: string;
  fullName: string;
  displayName: string;
  role: string;
  mobilePhone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  availabilityStatus: 'AVAILABLE' | 'BUSY' | 'IN_CONSULTATION' | 'OFFLINE';
  isPrimaryAdvisor: boolean;
  environment: 'DEMO' | 'PRODUCTION';
  email: 'NOT PROVIDED';
  licenseNumber: 'PENDING VERIFICATION';
  axaAdvisorCode: 'PENDING VERIFICATION';
  officeAddress: 'NOT PROVIDED';
  accreditationNumber: 'PENDING VERIFICATION';
  updatedAt: string;
}

export const INITIAL_FIREBASE_ADVISOR_DOC: FirestoreAdvisorDoc = {
  advisorId: 'ADV-0001',
  fullName: 'Bishop Orly B. Languisan',
  displayName: 'Bishop Orly B. Languisan',
  role: 'Licensed Insurance Advisor',
  mobilePhone: '+63 968 647 1868',
  status: 'ACTIVE',
  availabilityStatus: 'AVAILABLE',
  isPrimaryAdvisor: true,
  environment: 'DEMO',
  email: 'NOT PROVIDED',
  licenseNumber: 'PENDING VERIFICATION',
  axaAdvisorCode: 'PENDING VERIFICATION',
  officeAddress: 'NOT PROVIDED',
  accreditationNumber: 'PENDING VERIFICATION',
  updatedAt: new Date().toISOString(),
};

/**
 * Serializes an Advisor domain model to Firestore Document Format
 */
export function serializeAdvisorToFirestore(advisor: Advisor): FirestoreAdvisorDoc {
  return {
    advisorId: advisor.advisorId || 'ADV-0001',
    fullName: advisor.fullName || 'Bishop Orly B. Languisan',
    displayName: advisor.displayName || 'Bishop Orly B. Languisan',
    role: advisor.role || 'Licensed Insurance Advisor',
    mobilePhone: advisor.mobilePhone || '+63 968 647 1868',
    status: advisor.status || 'ACTIVE',
    availabilityStatus: advisor.availabilityStatus || 'AVAILABLE',
    isPrimaryAdvisor: advisor.isPrimaryAdvisor ?? true,
    environment: advisor.environment || 'DEMO',
    email: 'NOT PROVIDED',
    licenseNumber: 'PENDING VERIFICATION',
    axaAdvisorCode: 'PENDING VERIFICATION',
    officeAddress: 'NOT PROVIDED',
    accreditationNumber: 'PENDING VERIFICATION',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Sample Firestore Security Rules Representation for /advisors/ADV-0001
 */
export const FIRESTORE_ADVISOR_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Advisor Profile: Public read for designated advisor in demo, write restricted to admin
    match /advisors/{advisorId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }

    // Handoffs: Created by customers/orchestrator, updated by assigned advisor
    match /handoffs/{handoffId} {
      allow create: if true;
      allow read, update: if true;
    }

    // Callback Requests: Created by customer, managed by advisor
    match /callbacks/{callbackId} {
      allow create: if true;
      allow read, update: if true;
    }
  }
}
`;
