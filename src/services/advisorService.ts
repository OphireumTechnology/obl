import { Advisor, AdvisorHandoff, AdvisorHandoffStatus, CallbackRequest } from '../types';
import { appStore } from './store';

/**
 * AdvisorService — Centralized service for accessing and managing the designated advisor profile,
 * multi-advisor catalog, advisor handoffs, callbacks, and future Firebase synchronization.
 *
 * Requirements:
 * - Consistency Rule (#89): All screens retrieve advisor details from AdvisorService.
 * - Central Advisor Profile (#74, #85): /advisors/ADV-0001
 * - Advisor Assignment Architecture (#86): Phase 1 defaults to Bishop Orly B. Languisan (ADV-0001),
 *   while supporting future multi-advisor reassignment.
 */
class CentralAdvisorService {
  /**
   * Returns the primary designated advisor (Bishop Orly B. Languisan / ADV-0001).
   */
  public getPrimaryAdvisor(): Advisor {
    return appStore.getPrimaryAdvisor();
  }

  /**
   * Retrieves an advisor by ID or advisorId.
   */
  public getAdvisor(advisorId: string): Advisor | undefined {
    return appStore.getAdvisor(advisorId);
  }

  /**
   * Returns all advisors in the system (supporting future multi-advisor scenarios).
   */
  public getAllAdvisors(): Advisor[] {
    return appStore.getState().advisors;
  }

  /**
   * Updates an advisor profile centrally.
   * Modifying fields here propagates across Customer Chat, Customer Dashboard, Product Pages,
   * Advisor Handoff, Appointment Booking, and Admin (#89).
   */
  public updateAdvisor(advisorId: string, updates: Partial<Advisor>): void {
    appStore.updateAdvisorProfile(advisorId, updates);
  }

  /**
   * Creates an Advisor Handoff record with full 19-field compliance (#77).
   */
  public createHandoff(handoffData: Omit<AdvisorHandoff, 'handoffId' | 'handoffTimestamp'>): AdvisorHandoff {
    return appStore.createAdvisorHandoff(handoffData);
  }

  public createAdvisorHandoff(handoffData: Omit<AdvisorHandoff, 'handoffId' | 'handoffTimestamp'>): AdvisorHandoff {
    return this.createHandoff(handoffData);
  }

  /**
   * Retrieves all advisor handoffs.
   */
  public getHandoffs(): AdvisorHandoff[] {
    return appStore.getState().handoffs || [];
  }

  /**
   * Updates the status of an advisor handoff.
   */
  public updateHandoffStatus(handoffId: string, status: AdvisorHandoffStatus, notes?: string): void {
    appStore.updateHandoffStatus(handoffId, status, notes);
  }

  /**
   * Submits a customer callback request (#81).
   */
  public requestCallback(callbackData: Omit<CallbackRequest, 'id' | 'createdAt' | 'status'>): CallbackRequest {
    return appStore.createCallbackRequest(callbackData);
  }

  /**
   * Retrieves all callback requests.
   */
  public getCallbacks(): CallbackRequest[] {
    return appStore.getState().callbacks || [];
  }

  /**
   * Updates callback status.
   */
  public updateCallbackStatus(id: string, status: 'PENDING' | 'CONTACTED' | 'CANCELLED'): void {
    appStore.updateCallbackStatus(id, status);
  }

  /**
   * Helper to format phone for device-supported `tel:` links (#75).
   */
  public formatTelUri(phone: string): string {
    const sanitized = phone.replace(/[^+\d]/g, '');
    return `tel:${sanitized}`;
  }

  /**
   * Helper to format display text for unprovided / pending verification credentials (#74).
   */
  public formatCredential(val: string | undefined, fallback = 'NOT PROVIDED'): string {
    if (!val || val.trim() === '' || val === 'NOT PROVIDED') {
      return fallback;
    }
    return val;
  }

  /**
   * Returns conceptual Firebase document path (#85).
   */
  public getFirebaseDocPath(advisorId: string): string {
    return `/advisors/${advisorId}`;
  }

  /**
   * Subscribes to store changes for reactive updates across components.
   */
  public subscribe(listener: () => void): () => void {
    return appStore.subscribe(listener);
  }
}

export const advisorService = new CentralAdvisorService();
