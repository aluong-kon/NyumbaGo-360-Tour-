/**
 * Phase 3: Viewora API Integration Module
 *
 * SPECIFICATION:
 * "Put anything that needs an API behind a feature flag called viewora_api_enabled, default off.
 * Auto import of tour thumbnails and room names through the Viewora API, behind viewora_api_enabled.
 * Write the interface and mock it. Do not call any real endpoint.
 * Single sign on and lead sharing from Viewora lead capture forms into NyumbaGO requests, behind the same flag.
 * Write the interface only."
 */

import { VieworaTourMetadata, VieworaLeadPayload } from '../types';
import { NyumbaGoService } from './supabase';

export interface VieworaApiClientOptions {
  apiKey?: string;
  baseUrl?: string;
}

export class VieworaApiMockService {
  /**
   * Checks if Viewora API feature flag is enabled
   */
  public static isApiEnabled(): boolean {
    const settings = NyumbaGoService.getPartnerSettings();
    return Boolean(settings.viewora_api_enabled);
  }

  /**
   * Fetches tour metadata (room breakdown and thumbnails) from Viewora API
   * Behind viewora_api_enabled flag.
   */
  public static async fetchTourMetadata(tourUrl: string): Promise<{
    success: boolean;
    data?: VieworaTourMetadata;
    error?: string;
  }> {
    if (!this.isApiEnabled()) {
      return {
        success: false,
        error: 'Viewora API integration is currently disabled (viewora_api_enabled = false).',
      };
    }

    // Simulated mock response with realistic 360 Kenyan rooms
    await new Promise((resolve) => setTimeout(resolve, 600));

    const tourId = tourUrl.split('/').pop() || 'demo-tour';

    return {
      success: true,
      data: {
        tour_id: tourId,
        title: '360° Panorama Showcase',
        cover_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        captured_at: new Date().toISOString(),
        rooms: [
          {
            id: 'room-01',
            name: 'Living & Dining Lounge',
            thumbnail_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
            hotspots_count: 4,
          },
          {
            id: 'room-02',
            name: 'Master Bedroom (Ensuite)',
            thumbnail_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
            hotspots_count: 3,
          },
          {
            id: 'room-03',
            name: 'Balcony with Panoramic View',
            thumbnail_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
            hotspots_count: 2,
          },
          {
            id: 'room-04',
            name: 'Modern Fitted Kitchen',
            thumbnail_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
            hotspots_count: 3,
          },
        ],
      },
    };
  }

  /**
   * Ingests a lead captured on Viewora embed into NyumbaGO viewing requests.
   * Behind viewora_api_enabled flag.
   */
  public static async ingestExternalLead(lead: VieworaLeadPayload): Promise<{
    success: boolean;
    viewingRequestId?: string;
    error?: string;
  }> {
    if (!this.isApiEnabled()) {
      return {
        success: false,
        error: 'Viewora lead ingestion API is inactive. Enable viewora_api_enabled in admin settings.',
      };
    }

    const listing = NyumbaGoService.getListingById(lead.listing_id);
    const title = listing ? listing.title : 'NyumbaGO Property';

    const res = NyumbaGoService.createViewingRequest({
      listing_id: lead.listing_id,
      listing_title: title,
      hunter_name: lead.name,
      hunter_phone: lead.phone,
      preferred_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      preferred_time: '10:00 AM',
      toured_online: true,
      notes: `Lead shared automatically from Viewora 360° Virtual Tour embed (Lead ID: ${lead.lead_id}).`,
    });

    return {
      success: res.success,
      viewingRequestId: res.request?.id || '',
    };
  }
}
