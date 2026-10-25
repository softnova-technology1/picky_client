import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageCustomization } from '../../../store/customizationStore';
import styles from './CategoryMobileView.module.css';

export default function CategoryMobileView() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Live Customization settings for categories_hero
  const { getSetting } = usePageCustomization('categories');
  const headline = getSetting('categories_hero', 'headline', 'YOUR EVERYTHING STORE');
  const subheadline = getSetting('categories_hero', 'subheadline', 'Shop Your Daily Essentials & More');
  const startingPriceLabel = getSetting('categories_hero', 'startingPriceLabel', 'Starting From');
  const startingPrice = getSetting('categories_hero', 'startingPrice', '₹129');
  const buttonText = getSetting('categories_hero', 'buttonText', 'Shop Now');
  const buttonLink = getSetting('categories_hero', 'buttonLink', '/products');
  const heroImage = getSetting('categories_hero', 'heroImage', '');

  const filterTabs = ['All', 'Fashion', 'Jewellery', 'Wellness', 'Kids'];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      alert(`Thank you for subscribing! Your ₹100 discount coupon will be sent to ${newsletterEmail}`);
      setNewsletterEmail('');
    }
  };

  return (
    <div className={styles.mobileShellRoot}>
      <div className={styles.mobileShell}>
        {/* BEGIN: iOSStatusBar */}
        <header className={styles.iosStatusBar} data-purpose="ios-system-status-bar">
          <span className={styles.statusBarTime}>9:41</span>
          <div className={styles.dynamicIslandSpacer}></div>
          <div className={styles.statusBarIcons}>
            <i className={`fa-solid fa-signal ${styles.statusIconSignal}`}></i>
            <i className={`fa-solid fa-wifi ${styles.statusIconWifi}`}></i>
            <i className={`fa-solid fa-battery-full ${styles.statusIconBattery}`}></i>
          </div>
        </header>
        {/* END: iOSStatusBar */}

        {/* BEGIN: MicroAnnouncementTicker */}
        <section className={styles.tickerSection} data-purpose="top-discount-announcement-ticker">
          <div className={styles.tickerInner}>
            <span className={styles.tickerOfferBadge}>OFFER</span>
            <span>
              🎁 15% OFF above ₹1,499 with <strong className={styles.tickerHighlight}>PICKY15</strong>
            </span>
            <span className={styles.tickerDot}>•</span>
            <span>⚡ Free Express Delivery Tamil Nadu &gt; ₹999</span>
          </div>
        </section>
        {/* END: MicroAnnouncementTicker */}

        {/* BEGIN: MainHeader */}
        <header className={styles.mainHeader} data-purpose="sticky-brand-header">
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.menuButton}
              aria-label="Open Navigation Menu"
            >
              <i className="fa-solid fa-bars-staggered"></i>
            </button>
            <Link to="/" className={styles.brandGroup}>
              <div className={styles.brandIconBadge}>
                <i className="fa-solid fa-bag-shopping"></i>
              </div>
              <span className={styles.brandName}>PICKY</span>
              <span className={styles.brandPulsingDot}></span>
            </Link>
          </div>

          <div className={styles.headerRight}>
            <Link
              to="/wishlist"
              className={styles.iconButton}
              aria-label="Wishlist"
            >
              <i className="fa-regular fa-heart"></i>
              <span className={styles.wishlistDot}></span>
            </Link>

            <Link
              to="/cart"
              className={styles.iconButton}
              aria-label="Shopping Cart"
            >
              <i className="fa-solid fa-basket-shopping"></i>
              <span className={styles.cartBadge}>2</span>
            </Link>

            <Link to="/account" className={styles.avatarLink} aria-label="User Account">
              <img
                alt="User Avatar"
                className={styles.avatarImage}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwDUITPZm11X8VJZDBf_eswnHOZ312E6gCZVWGK7T9fdiJoH7IlNl0-hFMXFhjThvRjo_P8FeSjidDNSS68Es50g6AOTXBsObcJ0DNiXU3vi9J2YtJsrWXTwELvDTe9QYffnoAgg4c7DE-OHMQcI7ypyLTtwv__LBlocz7FtNwQR20lnafqfkUJofBHkn4IPDAt16IUzJKm5bEiEvkCOXgtUWchSna6wdCJHVfau5QngeJIiNZ03pA"
              />
            </Link>
          </div>
        </header>
        {/* END: MainHeader */}

        {/* BEGIN: SearchSection */}
        <div className={styles.searchSection} data-purpose="interactive-search-bar">
          <div className={styles.searchBar}>
            <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`}></i>
            <input
              className={styles.searchInput}
              placeholder="Search handloom, skincare, brass..."
              type="search"
            />
            <div className={styles.searchControls}>
              <button
                type="button"
                className={styles.searchActionButton}
                title="Voice Search"
                aria-label="Voice Search"
              >
                <i className="fa-solid fa-microphone"></i>
              </button>
              <button
                type="button"
                className={styles.searchActionButton}
                title="Visual Camera Search"
                aria-label="Visual Camera Search"
              >
                <i className="fa-solid fa-camera"></i>
              </button>
            </div>
          </div>
        </div>
        {/* END: SearchSection */}

        {/* BEGIN: LiveStoryDepartments */}
        <section className={styles.storySection} data-purpose="story-highlights-carousel">
          <div className={styles.storyHeader}>
            <span className={styles.storyHeading}>Top Departments</span>
            <Link to="/categories" className={styles.storyViewAll}>
              View All <i className={`fa-solid fa-chevron-right ${styles.storyViewAllIcon}`}></i>
            </Link>
          </div>

          <div className={styles.storyScrollRow}>
            {/* Story item 1 (All) */}
            <div className={styles.storyItem}>
              <div className={styles.storyRingGradientPurple}>
                <div className={styles.storyInnerAll}>
                  <i className="fa-solid fa-cubes-stacked"></i>
                </div>
              </div>
              <span className={styles.storyLabelAll}>All</span>
            </div>

            {/* Story item 2 (Jewellery) */}
            <div className={styles.storyItem}>
              <div className={styles.storyRingJewellery}>
                <div className={styles.storyInnerImg}>
                  <img
                    alt="Jewellery"
                    className={styles.storyImg}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAiYOQ1aO_lHMfQnVu0QDj-grLlDq1ITm3D06D76tDfid-IFZFRGnn_zBV23sqWou6HGN9-Dcx5VCj5Dh2Pne7o7cNxiOmm8MgsACFYc7SCcpWTZzJuM665U0sIdRtCS87JIUar8-r5pKLw2UYkhqogzbY1h-K5GSGIRpFA0L1Cv3yCLj9oTG01ZORD3VNdcO7Gmz1tvXTElNDU2FcOJltBN0If-jJROydqD7BROTkkalsul6_8W-8"
                  />
                </div>
              </div>
              <span className={styles.storyLabel}>Jewellery</span>
            </div>

            {/* Story item 3 (Heritage) */}
            <div className={styles.storyItem}>
              <div className={styles.storyRingHeritage}>
                <div className={styles.storyInnerImg}>
                  <img
                    alt="Tamil Heritage"
                    className={styles.storyImg}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuChqOiyozymWDnHA047LEGJRCFwebmEkyA6Yq21B68nwkmMSVV1KwVwD8U0MiAygwd0BRFkbrVIiBelrAzihID5VcmX74HZ6GZ2wx4Yrtu1YnZrsMaKE60rVu8UON1A40RCCGbOKqDb6Qiz0SkldwZASs4-_UXBwk7XLQNGLSKW4TGA_ueWM637Br5gunZLvucgiNhtT4Tn3N86NHzQEzZrZEatYrxs4_ez1wxAXEmAmMKQzoI7Ga-r"
                  />
                </div>
              </div>
              <span className={styles.storyLabel}>Heritage</span>
            </div>

            {/* Story item 4 (Beauty) */}
            <div className={styles.storyItem}>
              <div className={styles.storyRingBeauty}>
                <div className={styles.storyInnerImg}>
                  <img
                    alt="Beauty"
                    className={styles.storyImg}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7zKpdNWD5gayVJ6x2k0kcF2L-P-yZuHkG-X94hy2kBhAwAAgH3suROIU15789IU8_dbHBforHYfjEwFbmlDL7WRlmHkJLybN8PcpZaJGCcXv0NFAFwdCxk0qfvDI1Cfa6n_4ZAgjDaNo1oNi3VPIA3gabfVY4vlGYmzXaWmI1yEGad-2cwNUMxMUNQBEp44JxZMVJ0I9NeoA98zMrYCsRBInjIcLmxhffeF6as21J8wA2ZvdMKdwL"
                  />
                </div>
              </div>
              <span className={styles.storyLabel}>Skincare</span>
            </div>

            {/* Story item 5 (Tech) */}
            <div className={styles.storyItem}>
              <div className={styles.storyRingSolid}>
                <div className={styles.storyInnerImg}>
                  <img
                    alt="Tech"
                    className={styles.storyImg}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAruQh2tfTFekf-XytFB9Ig-OQ4TRxMBDiAMu1ErjPP32rugNEsQ4JVlAGowPZkeM8EfHYlbPEFmIRGLtVKO5yQfezVTr1zy8AyfHL2IGLl6tJvB0kfwXv69cHMG8gyoN7_j4Erw_D0ElVvJEhwjDQjrXR7SvJ1huzNjhGE4zkG5iv_aDN-Y0Isl_KejHw5XZJ4PcyNvOJDVHrIrIT4xP26wzjfmz7x6qtHYj3poI5aLkqHgsAPrY2L"
                  />
                </div>
              </div>
              <span className={styles.storyLabel}>Tech</span>
            </div>

            {/* Story item 6 (Snacks) */}
            <div className={styles.storyItem}>
              <div className={styles.storyRingSolid}>
                <div className={styles.storyInnerImg}>
                  <img
                    alt="Snacks"
                    className={styles.storyImg}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUFRxzhAKP6ELzvogOBJCJgBzKuuQR5QFS3s7KvZUuDPMqnIazhuVPahqgSsn9iCROaw6MI5Ueaj_SfI2imfbBTq2PRsvDwytjcdhBOPxDVs9z3TwOW3Ol4I1IQEcXBJgNr_B3XWpgnM2LK7WOMv9Sb_LKvgUS87DgkNXl86tI5qC02Dh7kV1tPFB8f9bg4c6DK3SvwskPBFL0Y2rV9uSS-fAGo2SRTL5qsi0sKeE-JILkGJZx2zSh"
                  />
                </div>
              </div>
              <span className={styles.storyLabel}>Snacks</span>
            </div>
          </div>
        </section>
        {/* END: LiveStoryDepartments */}

        {/* BEGIN: HeroSpotlightBento */}
        <section className={styles.heroSection} data-purpose="hero-carousel-bento">
          <div className={styles.heroCard}>
            <div className={styles.heroAmbientShape1}></div>
            <div className={styles.heroAmbientShape2}></div>

            <div className={styles.heroContent}>
              <div className={styles.heroTopRow}>
                <span className={styles.heroMegaBadge}>
                  TAMIL NADU MEGA STORE
                </span>
                <span className={styles.heroSpecialTag}>
                  <i className="fa-solid fa-sparkles"></i> Special
                </span>
              </div>

              <div className={styles.heroHeadlineWrap}>
                <h1 className={styles.heroHeadline}>
                  {headline}
                </h1>
                <p className={styles.heroDescription}>
                  {subheadline}
                </p>
              </div>

              <div className={styles.heroCtaRow}>
                <span className={styles.heroPriceBadge}>
                  {startingPriceLabel} <span className={styles.heroGoldPrice}>{startingPrice}</span>
                </span>
                <Link to={buttonLink || '/products'} className={styles.heroShopNowLink}>
                  <span>{buttonText}</span>
                  <i className={`fa-solid fa-arrow-trend-up ${styles.heroShopNowIcon}`}></i>
                </Link>
              </div>
            </div>

            <div className={styles.heroFloatingCollage}>
              <img
                alt={headline || 'Lifestyle Product'}
                className={styles.heroCollageImg}
                src={heroImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuBJ6m8kfMqvnRIQ7XCfUeF0AHf8C9zqh2Ro0siGh1-0BDcGaZYglYUtV-azNNdXuB0-GtpJEUUWZtztFzC5h6VuPFBgiLhg47NeZhcOuNAmPB_niMf4WrRU8AWIPMIxu2nPgtufh6G_bkEz2NJBXKiILf3q0ZBni805QHe0H9VOT1Z8xrOHj0o54PgwbLuzCpHcATBGjrAA6zOL1lj5qPuFEaV0rbeFi8oy55OhZ6co0GQaUr4umcdd"}
              />
            </div>
          </div>

          <div className={styles.paginationDots}>
            <span className={styles.dotActive}></span>
            <span className={styles.dotInactive}></span>
            <span className={styles.dotInactive}></span>
            <span className={styles.dotInactive}></span>
          </div>
        </section>
        {/* END: HeroSpotlightBento */}

        {/* BEGIN: ExploreCategoriesSection */}
        <section className={styles.categoriesSection} data-purpose="explore-more-categories" id="categories">
          <div className={styles.sectionHeaderRow}>
            <div>
              <h2 className={styles.sectionTitle}>
                Explore Categories
                <span className={styles.sectionTitleDot}></span>
              </h2>
              <p className={styles.sectionSubtitle}>Curated Tamil heritage, gourmet snacks &amp; living</p>
            </div>
            <Link to="/categories" className={styles.seeAllBadgeLink}>
              See All (10+) <i className={`fa-solid fa-arrow-right ${styles.seeAllArrow}`}></i>
            </Link>
          </div>

          <div className={styles.categoriesGrid}>
            {/* 1. Fashion */}
            <Link to="/categories/fashion" className={styles.categoryCard}>
              <div className={styles.categoryThumb}>
                <img
                  alt="Fashion"
                  className={styles.categoryThumbImg}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaBnaqfH-uaic5exzlFTGJVpOx-sVPMIGYqh6UHMM40XrAQM2hghm79sYk3u8XPUk3enFZIluk-oWthetZFaeHFGcsACRN9CpxuOwsxMk1l9oNz36E4wbzgy3gHpVlgySUeNYQQxRzI2oDEo11Sj0Iz5QtGuHWHg5ozIRtN96L9hkoxJww-7R9RGlOKX8P1v0eXLMtmTMC1sjyeQrElxmQ1SHBRUERxUKW9awAZO3fAh2eTtcbqJLU"
                />
              </div>
              <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>Fashion</h3>
                <span className={styles.categoryCount}>30+ Products</span>
              </div>
              <i className={`fa-solid fa-chevron-right ${styles.categoryArrow}`}></i>
            </Link>

            {/* 2. Home & Kitchen */}
            <Link to="/categories/home-kitchen" className={styles.categoryCard}>
              <div className={styles.categoryThumb}>
                <img
                  alt="Home Kitchen"
                  className={styles.categoryThumbImg}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyMe8Z2OWOuMb9k0fjGlXG97UdJXZgweELxIoMXYtlCK4AX2yTHH8cj5db_3BE18zqcmYrQZhDLUhifayVSWTsaEHQ-1N8SmC3HGv8SSAHUdaYO2LeiKYTWdjJlXYlQ47iMvZ7osuZSn6lqjC4vklm35oIG6dTzvL-Eze76mbiScTE-KFmFRpuv1ED0UleYG0Gy3sStvEV9XTZKSV_mR7Lw9s2xU97_Ql_Qn_aut0I2y7d6e-xtRTv"
                />
              </div>
              <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>Home &amp; Kitchen</h3>
                <span className={styles.categoryCount}>98+ Products</span>
              </div>
              <i className={`fa-solid fa-chevron-right ${styles.categoryArrow}`}></i>
            </Link>

            {/* 3. Artificial Jewellery */}
            <Link to="/categories/artificial-jewellery" className={styles.categoryCard}>
              <div className={styles.categoryThumb}>
                <img
                  alt="Artificial Jewellery"
                  className={styles.categoryThumbImg}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBe4PuWClPoInNc6okShi4WmDwqeRsHDYVoPd7hy5wEJv2_ohf_ajNYZ6tzT5dVXZDnusZgjd-aEv78ApSBq5wUvl-0mG1OHn84u3xLo1DtmxsE5h33eoRwBKdPGtNeV9io4UkfAtC5k4QqT_QUpsA0uuiytd2QWAOUgssog6eYhY1M64-a5gMdWRwYUPk40U3h6V8ZSzOh65_zu_L2Zm5iLueyofFAS9PsAfvDu7PGoReqNlc7IkPC"
                />
              </div>
              <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>Artificial Jewellery</h3>
                <span className={styles.categoryCount}>120+ Products</span>
              </div>
              <i className={`fa-solid fa-chevron-right ${styles.categoryArrow}`}></i>
            </Link>

            {/* 4. Beauty & Personal Care */}
            <Link to="/categories/beauty-care" className={styles.categoryCard}>
              <div className={styles.categoryThumb}>
                <img
                  alt="Beauty Care"
                  className={styles.categoryThumbImg}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbjMHXpydtJokAqhB0nZGjLcD9oQ7qP5UF8J2OVvowakOMrrB68H1WI2DdzTKm6u8bly_C4R8BVxDjrZjSVHrsYURO5NiTCvuaK8itdPBUCqG1g7p-z8hkgj9xqtKgtEHQ4cakQ1pbTegpMdwXvHZcu8fWIqmgHWMHzqIEEIg29hQ77bxrXCpUALg7AJ1tgYk6-cXx1XIfWQeYB74pM-9RtFUA_COZuZCvTnW06Vg_x_TxBaN7dQJZ"
                />
              </div>
              <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>Beauty &amp; Care</h3>
                <span className={styles.categoryCount}>86+ Products</span>
              </div>
              <i className={`fa-solid fa-chevron-right ${styles.categoryArrow}`}></i>
            </Link>

            {/* 5. Traditional Tamil Products (Special Feature Card) */}
            <Link to="/categories/traditional-tamil-products" className={styles.categoryFeaturedCard}>
              <div className={styles.featuredCardLeft}>
                <div className={styles.featuredThumb}>
                  <img
                    alt="Tamil Traditional"
                    className={styles.featuredThumbImg}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZlcpBu05Dikx9-hjrHVkpG3-UmviI2FF2Vl23YXfhlLVdvNc_LUJ2YZwRGih3l_ZHN9oTABXfgG_9Yly2v7IJbaXh2SITxgvy3gdHaHgOwX185MyhY-HBp1ht7GKrV7W0lWWWdc_YHzpW6629kFNL2aY7n7OJTElgrYRrUR-TYslGYZDa7POiKB3icHrDSdmMRyEpKJozhAaI98d0J_4MNUVsTmyVtO6wT2C_CXk4xVE_vE92agY3"
                  />
                </div>
                <div className={styles.featuredTextCol}>
                  <div className={styles.featuredHeaderRow}>
                    <h3 className={styles.featuredTitle}>Traditional Tamil Products</h3>
                    <span className={styles.authenticBadge}>Authentic</span>
                  </div>
                  <p className={styles.featuredSubtitle}>Swamimalai Brass, Madurai Crafts &amp; Weaves • 74+ Items</p>
                </div>
              </div>
              <div className={styles.featuredCircleArrow}>
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </Link>

            {/* 6. Mobile Accessories */}
            <Link to="/categories/mobile-accessories" className={styles.categoryCard}>
              <div className={styles.categoryThumb}>
                <img
                  alt="Mobile Accessories"
                  className={styles.categoryThumbImg}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIVr1hPNRDgZLcgiY22lKQJ1GT1Tc6n5U05Uq4G7Do97gLX2w2Id8KfCZjiBZSTQsE3FSCGzrV2xNFxYKvwkoDEAR8l9OyizWEsmGiPeVbK_Inf72zXjRR9rtDGY4v_M1yH9eem4qfYdX2o0v7qau6aYalKbPU32TE3nieAyuM12xOArPu0IjP7PJfKY38w7IdwgKk7SuGItvNtmQM1TC94ouUHjwwuKIF2PY-mOCZD8l5GX9OBTaN"
                />
              </div>
              <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>Mobile Accessories</h3>
                <span className={styles.categoryCount}>165+ Products</span>
              </div>
              <i className={`fa-solid fa-chevron-right ${styles.categoryArrow}`}></i>
            </Link>

            {/* 7. Snacks & Foods */}
            <Link to="/categories/snacks-foods" className={styles.categoryCard}>
              <div className={styles.categoryThumb}>
                <img
                  alt="Snacks Foods"
                  className={styles.categoryThumbImg}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVIWxmvQkDOQAYFsXfkMZoTXdHayOCuVyWogc4aW33mqkV1CKNyw4My_XPJaWXIxC3y3QK0qUVy0rlxST552eKG5IIMw7AXlrMlvO_t8epAePsf_2RfZCIHwi7yzT_1c8sC6JzdT0-uiOhTvj7x_knX1F5qDpbCbPDZ5U-IEPydRnJTL3N39ExyE8yUEhmnWjyY6ZHqhVXpHW-g4dIJDmzMB0LyBm8CZodlLr9EywloM9JlBOUvrvo"
                />
              </div>
              <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>Snacks &amp; Foods</h3>
                <span className={styles.categoryCount}>62+ Products</span>
              </div>
              <i className={`fa-solid fa-chevron-right ${styles.categoryArrow}`}></i>
            </Link>

            {/* 8. Home Decor */}
            <Link to="/categories/home-decor" className={styles.categoryCard}>
              <div className={styles.categoryThumb}>
                <img
                  alt="Home Decor"
                  className={styles.categoryThumbImg}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlx1cQAlqMGbiXPshKsjkWFtqyVabZTexzSyhWePpMM8N-38g30ulQYPFSt-VnoXt7m3YtWl2JRrChdazhLH2FP62LwNaNOQMLYW8MSPFU-MZ13LOOr_HeG5EkeTLyfo7R2Muus1TeopY273aJzB06i_s8VZ-Hz2gLLj7yk5hoh-NGMTM64XGKoqAvuZEv86CLSPIbjkxFxGdEdSCDGUTtJZlysttFFrX3WbA-QrhjkAiu5bk3z98d"
                />
              </div>
              <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>Home Décor</h3>
                <span className={styles.categoryCount}>91+ Products</span>
              </div>
              <i className={`fa-solid fa-chevron-right ${styles.categoryArrow}`}></i>
            </Link>

            {/* 9. Fitness Products */}
            <Link to="/categories/fitness" className={styles.categoryCard}>
              <div className={styles.categoryThumb}>
                <img
                  alt="Fitness"
                  className={styles.categoryThumbImg}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNOSi5m7y09Co4xIkSODLLFDHMqBrqXcz9kHgp0Rhct_s0ZGsfO3seZ6MFpt7DyBtFIeTYJUEjznYUP-1hX758nbhbj6Dom6wxdWUIPLsFtjnX12K0rMU2oJri0ipJba7sztlE0iNr1ntOkFWEHWldMkQeJHlNiDnQpQZ4ZuN4sTrCSmgvbxYW7Nel8a6eZaMRww4jCYBvX2uqgeiekbErklWix3rBvhkz2WcayNV9FnmsrGUlhT70"
                />
              </div>
              <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>Fitness</h3>
                <span className={styles.categoryCount}>55+ Products</span>
              </div>
              <i className={`fa-solid fa-chevron-right ${styles.categoryArrow}`}></i>
            </Link>
          </div>
        </section>
        {/* END: ExploreCategoriesSection */}

        {/* BEGIN: ShopByBudgetSection */}
        <section className={styles.budgetSection} data-purpose="shop-by-budget-carousel">
          <div className={styles.budgetHeader}>
            <h2 className={styles.budgetTitle}>
              Shop By Budget
              <span className={styles.budgetEmoji}>💸</span>
            </h2>
            <p className={styles.budgetSubtitle}>Discover handpicked collections curated for every wallet size</p>
          </div>

          <div className={styles.budgetGrid}>
            {/* Budget 1 */}
            <Link to="/limited-deals?budget=199" className={styles.budgetCardBlue}>
              <div>
                <span className={styles.budgetEyebrowBlue}>All Categories</span>
                <h4 className={styles.budgetAmountDark}>Under ₹199</h4>
              </div>
              <span className={styles.budgetActionBlue}>
                SHOP NOW <i className="fa-solid fa-arrow-trend-up"></i>
              </span>
            </Link>

            {/* Budget 2 (Highlighted) */}
            <Link to="/limited-deals?budget=499" className={styles.budgetCardGold}>
              <div className={styles.goldAmbientGlow}></div>
              <div>
                <span className={styles.budgetEyebrowGold}>Bestsellers Hub</span>
                <h4 className={styles.budgetAmountDark}>Under ₹499</h4>
              </div>
              <span className={styles.budgetActionGold}>
                SHOP NOW <i className="fa-solid fa-arrow-trend-up"></i>
              </span>
            </Link>

            {/* Budget 3 */}
            <Link to="/limited-deals?budget=799" className={styles.budgetCardPink}>
              <div>
                <span className={styles.budgetEyebrowPink}>Curated Picks</span>
                <h4 className={styles.budgetAmountDark}>Under ₹799</h4>
              </div>
              <span className={styles.budgetActionPink}>
                SHOP NOW <i className="fa-solid fa-arrow-trend-up"></i>
              </span>
            </Link>

            {/* Budget 4 (Luxe) */}
            <Link to="/limited-deals?budget=1099" className={styles.budgetCardPurple}>
              <div>
                <span className={styles.budgetEyebrowPurple}>Heritage &amp; Brass</span>
                <h4 className={styles.budgetAmountPurple}>₹1,099+ Luxe</h4>
              </div>
              <span className={styles.budgetActionPurple}>
                SHOP NOW <i className="fa-solid fa-arrow-trend-up"></i>
              </span>
            </Link>
          </div>
        </section>
        {/* END: ShopByBudgetSection */}

        {/* BEGIN: TopProductsSection */}
        <section className={styles.topProductsSection} data-purpose="top-curated-products-grid" id="top-products">
          <div className={styles.topProductsHeader}>
            <div>
              <h2 className={styles.topProductsTitle}>Top Products</h2>
              <p className={styles.topProductsSubtitle}>Showing top picks across all departments</p>
            </div>
            <span className={styles.itemCountBadge}>4 Items</span>
          </div>

          {/* Filter Pills */}
          <div className={styles.filterPillsRow}>
            {filterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeFilter === tab ? styles.filterPillActive : styles.filterPillInactive}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Product Grid (2 Columns) */}
          <div className={styles.productsGrid}>
            {/* Product Card 1 */}
            <article className={styles.productCard}>
              <div className={styles.productImageWrap}>
                <span className={styles.topProductBadge}>
                  <i className={`fa-solid fa-crown ${styles.topProductCrown}`}></i> TOP PRODUCT
                </span>
                <button
                  type="button"
                  className={styles.wishlistHeartBtn}
                  aria-label="Save to Wishlist"
                >
                  <i className="fa-regular fa-heart"></i>
                </button>
                <div className={styles.productImgBox}>
                  <img
                    alt="Motivational Time Marker Water Bottle"
                    className={styles.productContainImg}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYT-jw9dxTzSPoEpxs3q8igDkd1UXI59lFpZmY_75VIxxeJ6ROzHdNujqG9HeOCiqKVqKSAGVC8hF3MNg-ZK-IJxMtTaYEBk9tEo_SGqb9A0YJmeJGYplMMt8XWj6DU3NisgR3uJgkQizk9ELoms3z5tu4Cidjk8eHppZTyoY81ZBHTm75qRJE2qynmaq0WY4MhlFBu8ePMhZkpZ1Vw60_yhwDrXFsqOT3wN6_SKc0ix_wxU6BnlR9"
                  />
                </div>
              </div>
              <div className={styles.productBody}>
                <div>
                  <div className={styles.productRating}>
                    <i className="fa-solid fa-star"></i> 4.8{' '}
                    <span className={styles.ratingCount}>(128)</span>
                  </div>
                  <h3 className={styles.productTitle}>
                    Motivational Time Marker Gradient Bottle (1L)
                  </h3>
                  <p className={styles.productDesc}>BPA-free frosted gradient sports sipper</p>
                </div>
                <div className={styles.productFooter}>
                  <div>
                    <span className={styles.currentPrice}>₹699</span>
                    <span className={styles.originalPrice}>₹1,499</span>
                  </div>
                  <button
                    type="button"
                    className={styles.addToCartBtn}
                    title="Add to Cart"
                    aria-label="Add to Cart"
                  >
                    <i className="fa-solid fa-cart-plus"></i>
                  </button>
                </div>
              </div>
            </article>

            {/* Product Card 2 */}
            <article className={styles.productCard}>
              <div className={styles.productImageWrap}>
                <span className={styles.topProductBadge}>
                  <i className={`fa-solid fa-crown ${styles.topProductCrown}`}></i> TOP PRODUCT
                </span>
                <button
                  type="button"
                  className={styles.wishlistHeartBtn}
                  aria-label="Save to Wishlist"
                >
                  <i className="fa-regular fa-heart"></i>
                </button>
                <div className={styles.productImgBox}>
                  <img
                    alt="High-Density Beveled Yoga Block"
                    className={styles.productCoverImg}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDr4ZUlbI7XQHPQ9zGsBfJLl6E43ZDG0hWc1x13y783vmr0e2lPGDKCQMDxQATEJ7aYYFe8OMPdVaQ_-A58OQbW5mZO1iySrFvm-QvJmGFiV3Hx_3swIDNrZzvRSpGuoapCf-dK_DvRKAuuFbaSy1VJ6ScER9DfqjC_nxmNKopmmsJSN83y5OH3ra2d2OwE811yggc-ZJdEdd8ZOXLNuE38D0_E2uJg8jxnIrF5PIu3fQQ8avkjhUGA"
                  />
                </div>
              </div>
              <div className={styles.productBody}>
                <div>
                  <div className={styles.productRating}>
                    <i className="fa-solid fa-star"></i> 4.9{' '}
                    <span className={styles.ratingCount}>(94)</span>
                  </div>
                  <h3 className={styles.productTitle}>
                    High-Density Beveled EVA Yoga Support Block
                  </h3>
                  <p className={styles.productDesc}>Solid non-slip balance prop for stretches</p>
                </div>
                <div className={styles.productFooter}>
                  <div>
                    <span className={styles.currentPrice}>₹699</span>
                    <span className={styles.originalPrice}>₹899</span>
                  </div>
                  <button
                    type="button"
                    className={styles.addToCartBtn}
                    title="Add to Cart"
                    aria-label="Add to Cart"
                  >
                    <i className="fa-solid fa-cart-plus"></i>
                  </button>
                </div>
              </div>
            </article>

            {/* Product Card 3 */}
            <article className={styles.productCard}>
              <div className={styles.productImageWrap}>
                <span className={styles.topProductBadge}>
                  <i className={`fa-solid fa-crown ${styles.topProductCrown}`}></i> TOP PRODUCT
                </span>
                <button
                  type="button"
                  className={styles.wishlistHeartBtn}
                  aria-label="Save to Wishlist"
                >
                  <i className="fa-regular fa-heart"></i>
                </button>
                <div className={styles.productImgBox}>
                  <img
                    alt="Flat Yoga Physical Therapy Band"
                    className={styles.productCoverImg}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuASgIKZbdaCpvIIpViF21dVfPkO45z2EeToc-8np_VEePoztOw3Qsm5lu7TRlsGjSwAyNHHKTx55r71jfXz0TfB2__bmnZ7S4B3qqliDo0eVBKU__B0mFOYfGJDLTjlpHOC9dpJWGKc9yyeanABDu97RCkSIhO8_C5Z_KT4WPJrJlGNaH5no8chuHs9KGwbx43hkjkrEleGsNdbe_A_O9zc7KFzz9mg9kltEpcxiwhDg0BZ1TZpP3xx"
                  />
                </div>
              </div>
              <div className={styles.productBody}>
                <div>
                  <div className={styles.productRating}>
                    <i className="fa-solid fa-star"></i> 4.7{' '}
                    <span className={styles.ratingCount}>(210)</span>
                  </div>
                  <h3 className={styles.productTitle}>
                    Flat Yoga &amp; Physical Therapy Resistance Band
                  </h3>
                  <p className={styles.productDesc}>Wide elastic rehabilitation band for pilates</p>
                </div>
                <div className={styles.productFooter}>
                  <div>
                    <span className={styles.currentPrice}>₹449</span>
                    <span className={styles.originalPrice}>₹699</span>
                  </div>
                  <button
                    type="button"
                    className={styles.addToCartBtn}
                    title="Add to Cart"
                    aria-label="Add to Cart"
                  >
                    <i className="fa-solid fa-cart-plus"></i>
                  </button>
                </div>
              </div>
            </article>

            {/* Product Card 4 */}
            <article className={styles.productCard}>
              <div className={styles.productImageWrap}>
                <span className={styles.topProductBadge}>
                  <i className={`fa-solid fa-crown ${styles.topProductCrown}`}></i> TOP PRODUCT
                </span>
                <button
                  type="button"
                  className={styles.wishlistHeartBtn}
                  aria-label="Save to Wishlist"
                >
                  <i className="fa-regular fa-heart"></i>
                </button>
                <div className={styles.productImgBox}>
                  <img
                    alt="Kids Spill-Proof Silicone Straw Bottle"
                    className={styles.productContainImg}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtGXUzBQ-W26kfF3tibnemeNfZwcV3cwYYMysk5-UKF8NXy-1xqsmoN3jDcxEGCdxTlBohMTLHIUCb14OmCdqZB26Wpd3WXggto6E8Pg8pNDb1lnXyd8AbXouIT8aOGfm_djmAP5Ubbg7sZpxd84yasP21onP3ctSTcbt4VZrL3jUc8GJaqRDP56cwB-zUpNUcmFW3CCs6pvwkuoeQY3-Ntf_9OMjuZB0XwIS0ZbR9Z1wQhnQMCDD7"
                  />
                </div>
              </div>
              <div className={styles.productBody}>
                <div>
                  <div className={styles.productRating}>
                    <i className="fa-solid fa-star"></i> 4.9{' '}
                    <span className={styles.ratingCount}>(340)</span>
                  </div>
                  <h3 className={styles.productTitle}>
                    Kids Spill-Proof Silicone Straw Sipper (500ml)
                  </h3>
                  <p className={styles.productDesc}>One-click pop button Tritan BPA-free sipper</p>
                </div>
                <div className={styles.productFooter}>
                  <div>
                    <span className={styles.currentPrice}>₹599</span>
                    <span className={styles.originalPrice}>₹899</span>
                  </div>
                  <button
                    type="button"
                    className={styles.addToCartBtn}
                    title="Add to Cart"
                    aria-label="Add to Cart"
                  >
                    <i className="fa-solid fa-cart-plus"></i>
                  </button>
                </div>
              </div>
            </article>
          </div>

          {/* Center View All Button */}
          <div className={styles.viewAllCenterRow}>
            <Link to="/products" className={styles.viewAllPillBtn}>
              <span>View All in All (450+ Items)</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </section>
        {/* END: TopProductsSection */}

        {/* BEGIN: PickyAssuranceAndFooter */}
        <footer className={styles.assuranceFooter} data-purpose="picky-assurance-bento-footer">
          <div className={styles.footerAmbientLight}></div>

          <div className={styles.footerMissionHeader}>
            <div className={styles.footerAwardBadge}>
              <i className="fa-solid fa-award"></i>
            </div>
            <div>
              <h4 className={styles.footerMissionTitle}>The Picky Assurance</h4>
              <p className={styles.footerMissionSubtitle}>Crafted in Tamil Nadu for Modern Living</p>
            </div>
          </div>

          <p className={styles.footerMissionText}>
            PICKY is Tamil Nadu&apos;s dedicated lifestyle &amp; heritage marketplace, uniting artisanal weavers &amp; craftsmen with modern homes across India.
          </p>

          {/* 4 Core Trust Badges Grid */}
          <div className={styles.trustBadgesGrid}>
            <div className={styles.trustBadgeItem}>
              <i className={`fa-solid fa-bolt ${styles.trustIconGold}`}></i>
              <span className={styles.trustBadgeText}>24-48h Dispatch</span>
            </div>
            <div className={styles.trustBadgeItem}>
              <i className={`fa-solid fa-arrows-rotate ${styles.trustIconEmerald}`}></i>
              <span className={styles.trustBadgeText}>7-Day Easy Return</span>
            </div>
            <div className={styles.trustBadgeItem}>
              <i className={`fa-solid fa-shield-halved ${styles.trustIconBlue}`}></i>
              <span className={styles.trustBadgeText}>256-Bit SSL Secure</span>
            </div>
            <div className={styles.trustBadgeItem}>
              <i className={`fa-solid fa-certificate ${styles.trustIconPurple}`}></i>
              <span className={styles.trustBadgeText}>100% Genuine</span>
            </div>
          </div>

          {/* Picky VIP Newsletter Signup */}
          <div className={styles.newsletterCard}>
            <span className={styles.newsletterTitle}>🎁 Join The Picky Family</span>
            <p className={styles.newsletterDesc}>Subscribe &amp; get flat ₹100 off on your first order.</p>
            <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
              <input
                className={styles.newsletterInput}
                placeholder="Enter your email"
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button type="submit" className={styles.newsletterBtn}>
                Subscribe
              </button>
            </form>
          </div>

          {/* Contact & Headquarters Info */}
          <div className={styles.footerContactBlock}>
            <div className={styles.footerAddressRow}>
              <i className={`fa-solid fa-location-dot ${styles.footerPinIcon}`}></i>
              <span>Main Road, Peravurani, Thanjavur District, Tamil Nadu - 614804</span>
            </div>
            <div className={styles.footerContactRow}>
              <a href="tel:+918300295721" className={styles.contactPhone}>
                <i className={`fa-solid fa-phone ${styles.contactPhoneIcon}`}></i> +91 83002 95721
              </a>
              <a href="mailto:care@pickystore.in" className={styles.contactEmail}>
                <i className={`fa-solid fa-envelope ${styles.contactEmailIcon}`}></i> care@pickystore.in
              </a>
            </div>
            <div className={styles.footerCopyright}>
              © 2026 Picky Retail Tech. All rights reserved. Crafted in Tamil Nadu.
            </div>
          </div>
        </footer>
        {/* END: PickyAssuranceAndFooter */}

        {/* BEGIN: FloatingWhatsAppFAB */}
        <aside className={styles.floatingWhatsappAside} data-purpose="floating-whatsapp-concierge">
          <a
            className={styles.whatsappFab}
            href="https://wa.me/918300295721"
            rel="noopener noreferrer"
            target="_blank"
            title="Chat with Picky Concierge"
          >
            <i className={`fa-brands fa-whatsapp ${styles.whatsappIcon}`}></i>
            <span className={styles.whatsappPulseDot}></span>
          </a>
        </aside>
        {/* END: FloatingWhatsAppFAB */}

        {/* BEGIN: StickyBottomNavigation */}
        <nav className={styles.bottomNav} data-purpose="mobile-ios-bottom-nav">
          <div className={styles.bottomNavRow}>
            {/* Tab 1: Home */}
            <Link to="/" className={styles.navTabInactive}>
              <i className={`fa-solid fa-house ${styles.navTabIcon}`}></i>
              <span className={styles.navTabLabel}>Home</span>
            </Link>

            {/* Tab 2: Categories (Active) */}
            <Link to="/categories" className={styles.navTabActive}>
              <i className={`fa-solid fa-layer-group ${styles.navTabIcon}`}></i>
              <span className={styles.navTabLabelActive}>Categories</span>
              <span className={styles.activeIndicatorDot}></span>
            </Link>

            {/* Tab 3: Budget Hub */}
            <Link to="/limited-deals" className={styles.navTabInactive}>
              <i className={`fa-solid fa-tags ${styles.navTabIcon}`}></i>
              <span className={styles.navTabLabel}>Budget</span>
            </Link>

            {/* Tab 4: Bag with Count */}
            <Link to="/cart" className={styles.navTabInactive}>
              <div className={styles.bagWrap}>
                <i className={`fa-solid fa-bag-shopping ${styles.navTabIcon}`}></i>
                <span className={styles.bagCounterBadge}>2</span>
              </div>
              <span className={styles.navTabLabel}>Bag</span>
            </Link>

            {/* Tab 5: Account */}
            <Link to="/account" className={styles.navTabInactive}>
              <i className={`fa-regular fa-user ${styles.navTabIcon}`}></i>
              <span className={styles.navTabLabel}>Account</span>
            </Link>
          </div>
          {/* iOS Home Indicator bar */}
          <div className={styles.iosHomeBar}></div>
        </nav>
        {/* END: StickyBottomNavigation */}
      </div>
    </div>
  );
}
