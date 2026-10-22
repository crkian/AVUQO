import styles from "./PromotionScore.module.css";
type Props={score:number;tier?:string};
export default function PromotionScore({score,tier}:Props){return <div className={styles.score} aria-label={`Promotion Score ${score}`}><div className={styles.inner}><strong className={styles.value}>{score}</strong><span className={styles.tier}>{tier??"PROMO"}</span></div></div>}
