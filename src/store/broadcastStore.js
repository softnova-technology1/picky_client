import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_BROADCAST_CAMPAIGNS, AUDIENCE_SEGMENTS, BROADCAST_TEMPLATES } from '../data/broadcastMockData';

export const useBroadcastStore = create(
  persist(
    (set, get) => ({
      campaigns: INITIAL_BROADCAST_CAMPAIGNS,
      segments: AUDIENCE_SEGMENTS,
      templates: BROADCAST_TEMPLATES,

      // 1. Create & Launch / Schedule Campaign
      createCampaign: (campaignData) => {
        const id = `BC-2026-${String(Math.floor(100 + Math.random() * 900))}`;
        const now = new Date().toISOString();
        const segment = get().segments.find((s) => s.id === campaignData.targetSegmentId) || get().segments[0];
        const recipientsCount = segment.count || 500;

        const isScheduled = campaignData.status === 'scheduled';
        const newCampaign = {
          id,
          name: campaignData.name,
          status: isScheduled ? 'scheduled' : 'sent',
          sentAt: isScheduled ? null : now,
          scheduledFor: isScheduled ? campaignData.scheduledFor || now : null,
          targetSegment: segment.name,
          targetSegmentId: segment.id,
          templateId: campaignData.templateId || 'tpl_festive_sale',
          templateTitle: campaignData.templateTitle || 'Festive Handloom Flash Sale',
          couponCode: campaignData.couponCode || 'FESTIVE20',
          bannerImage: campaignData.bannerImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
          customMessage: campaignData.customMessage || null,
          recipientsCount,
          stats: isScheduled
            ? {
                sent: 0,
                delivered: 0,
                deliveryRate: 0,
                read: 0,
                readRate: 0,
                clicked: 0,
                clickRate: 0,
                conversions: 0,
                revenueGenerated: 0,
              }
            : {
                sent: recipientsCount,
                delivered: Math.round(recipientsCount * 0.985),
                deliveryRate: 98.5,
                read: Math.round(recipientsCount * 0.82),
                readRate: 82.0,
                clicked: Math.round(recipientsCount * 0.24),
                clickRate: 24.0,
                conversions: Math.round(recipientsCount * 0.05),
                revenueGenerated: Math.round(recipientsCount * 0.05 * 1850),
              },
          sampleRecipients: [
            { name: 'Kavitha Ramasamy', phone: '+919840123456', city: 'Chennai', status: 'Delivered', deliveredAt: 'Just now' },
            { name: 'Suresh Kumar', phone: '+919345047432', city: 'Salem', status: 'Delivered', deliveredAt: 'Just now' },
            { name: 'Deepa Rajagopalan', phone: '+919876543219', city: 'Tiruchirappalli', status: 'Delivered', deliveredAt: 'Just now' },
          ],
        };

        set((state) => ({
          campaigns: [newCampaign, ...state.campaigns],
        }));

        return newCampaign;
      },

      // 2. Delete Campaign
      deleteCampaign: (campaignId) => {
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== campaignId),
        }));
      },

      // 3. Resend to Unopened Contacts
      resendCampaign: (campaignId) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => {
            if (c.id === campaignId) {
              const currentUnopened = Math.max(0, c.stats.delivered - c.stats.read);
              const extraReads = Math.round(currentUnopened * 0.45);
              const extraConversions = Math.round(extraReads * 0.06);
              const extraRevenue = extraConversions * 1750;

              return {
                ...c,
                resendCount: (c.resendCount || 0) + 1,
                lastResentAt: new Date().toISOString(),
                stats: {
                  ...c.stats,
                  read: c.stats.read + extraReads,
                  readRate: Number((((c.stats.read + extraReads) / (c.stats.delivered || 1)) * 100).toFixed(1)),
                  clicked: c.stats.clicked + Math.round(extraReads * 0.28),
                  conversions: c.stats.conversions + extraConversions,
                  revenueGenerated: c.stats.revenueGenerated + extraRevenue,
                },
              };
            }
            return c;
          }),
        }));
      },

      // 4. Reset to Default
      resetToDefault: () => {
        set({
          campaigns: INITIAL_BROADCAST_CAMPAIGNS,
        });
      },
    }),
    {
      name: 'picky_broadcast_campaigns_store',
    }
  )
);
