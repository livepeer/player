import type { NextPage } from 'next'
import styles from '../styles/Player.module.css'

const Player: NextPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.player}></div>
    </div>
  )
}

export default Player
