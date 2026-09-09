"use client";

import { MarketingRevealItem } from "@/app/(marketing)/components/marketing-reveal";
import { delayedRevealItemVariants } from "@/lib/marketing/reveal-variants";

import styles from "../marketing.module.css";

export function MarketingProductAssembly() {
  return (
    <div
      className={styles.productCanvas}
      data-mk-product-canvas=""
      aria-hidden="true"
    >
      <div className={styles.productInputs}>
        <MarketingRevealItem
          delay={0.22}
          variants={delayedRevealItemVariants}
          className={styles.productRevealSlot}
        >
          <div className={styles.productFragment}>
            <p className={styles.productFragmentLabel}>Approved guide</p>
            <span className={styles.guideBar} />
            <span className={`${styles.guideBar} ${styles.guideBarMid}`} />
            <span className={`${styles.guideBar} ${styles.guideBarShort}`} />
          </div>
        </MarketingRevealItem>
        <MarketingRevealItem
          delay={0.28}
          variants={delayedRevealItemVariants}
          className={styles.productPlusSlot}
        >
          <span className={styles.productPlus}>+</span>
        </MarketingRevealItem>
        <MarketingRevealItem
          delay={0.29}
          variants={delayedRevealItemVariants}
          className={styles.productRevealSlot}
        >
          <div className={styles.productFragment}>
            <p className={styles.productFragmentLabel}>Clinic brand</p>
            <p className={styles.productClinicName} translate="no">
              Riverside Dental
            </p>
            <div className={styles.productSwatchRow}>
              <span className={styles.productSwatchItem}>
                <span className={`${styles.swatch} ${styles.swatchTeal}`} />
                Primary
              </span>
              <span className={styles.productSwatchItem}>
                <span
                  className={`${styles.swatch} ${styles.swatchClinicAccent}`}
                />
                Accent
              </span>
            </div>
          </div>
        </MarketingRevealItem>
      </div>
      <MarketingRevealItem delay={0.36} variants={delayedRevealItemVariants}>
        <div className={styles.productMerge}>
          <span className={styles.productMergeLine} />
          <span className={styles.productMergeArrow} />
        </div>
      </MarketingRevealItem>
      <MarketingRevealItem
        delay={0.43}
        variants={delayedRevealItemVariants}
        className={styles.productResultSlot}
      >
        <div className={styles.productResult}>
          <p className={styles.productResultClinic} translate="no">
            Riverside Dental
          </p>
          <p className={styles.productResultTerm}>
            Post-treatment instructions
          </p>
          <p className={styles.productResultGuide}>
            Tooth Extraction
            <span className={styles.productResultArrow}>→</span>
          </p>
        </div>
      </MarketingRevealItem>
    </div>
  );
}
