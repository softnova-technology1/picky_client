// Flash Sales & Festival Campaigns Zustand Store with LocalStorage Persistence
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_FLASH_CAMPAIGNS } from '../data/flashSaleMockData';

export const useFlashSaleStore = create(
  persist(
    (set, get) => ({
      campaigns: INITIAL_FLASH_CAMPAIGNS,

      // Create new flash sale campaign
      createCampaign: (data) => {
        const id = `FS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const newCampaign = {
          id,
          name: data.name || 'Special Handloom Flash Drop',
          type: data.type || 'flash_hourly',
          status: data.status || 'live',
          tagline: data.tagline || 'Limited Time Handloom Saree Offers',
          discountType: data.discountType || 'percentage',
          discountValue: Number(data.discountValue) || 30,
          couponCode: (data.couponCode || 'FLASH30').toUpperCase(),
          bannerImage: data.bannerImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700',
          startDate: data.startDate || new Date().toISOString(),
          endDate: data.endDate || new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
          isStorefrontSynced: !!data.isStorefrontSynced,
          targetCategories: data.targetCategories || ['Kanchipuram Silk', 'Madurai Sungudi'],
          stats: {
            totalStockAllocated: Number(data.totalStockAllocated) || 100,
            stockClaimed: 0,
            claimRate: 0,
            revenueGenerated: 0,
            ordersCount: 0,
            viewCount: 1,
            conversionRate: 0,
          },
          products: data.products || [],
        };

        set((state) => ({
          campaigns: [newCampaign, ...state.campaigns],
        }));

        return newCampaign;
      },

      // Update existing campaign
      updateCampaign: (id, updates) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      // Toggle Campaign Status (Live / Scheduled / Draft / Ended)
      toggleCampaignStatus: (id, newStatus) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => {
            if (c.id === id) {
              return {
                ...c,
                status: newStatus,
                isStorefrontSynced: newStatus === 'live' ? c.isStorefrontSynced : false,
              };
            }
            return c;
          }),
        }));
      },

      // Toggle Storefront Homepage Sync
      toggleStorefrontSync: (id) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => {
            if (c.id === id) {
              const nextSync = !c.isStorefrontSynced;
              return { ...c, isStorefrontSynced: nextSync };
            }
            return c;
          }),
        }));
      },

      // Delete campaign
      deleteCampaign: (id) => {
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
        }));
      },

      // Add product to an existing campaign
      addProductToCampaign: (campaignId, product) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => {
            if (c.id === campaignId) {
              const updatedProducts = [
                ...c.products,
                {
                  id: `p_${Date.now()}`,
                  title: product.title || 'New Handloom Saree Deal',
                  sku: product.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`,
                  image: product.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
                  originalPrice: Number(product.originalPrice) || 5000,
                  flashPrice: Number(product.flashPrice) || 2999,
                  stockTotal: Number(product.stockTotal) || 30,
                  stockSold: 0,
                  badge: product.badge || 'HOT DEAL',
                },
              ];
              const totalAllocated = updatedProducts.reduce((acc, p) => acc + p.stockTotal, 0);
              const totalSold = updatedProducts.reduce((acc, p) => acc + p.stockSold, 0);
              return {
                ...c,
                products: updatedProducts,
                stats: {
                  ...c.stats,
                  totalStockAllocated: totalAllocated,
                  stockClaimed: totalSold,
                  claimRate: totalAllocated > 0 ? Number(((totalSold / totalAllocated) * 100).toFixed(1)) : 0,
                },
              };
            }
            return c;
          }),
        }));
      },

      // Reset to initial mock campaigns
      resetToDefault: () => {
        set({ campaigns: INITIAL_FLASH_CAMPAIGNS });
      },
    }),
    {
      name: 'picky_admin_flash_sales',
    }
  )
);
