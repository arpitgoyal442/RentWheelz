import React from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Link from "next/link"
import Image from 'next/image';
function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>RentWheelz - Bike/Scooty Rental App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
      
        <Image
        src="/images/logo.png"
        height={344}
        width={344}
        />
        
        <h1 className={styles.title}>Welcome to RentWheelz</h1>

        <p className={styles.description}>
          Rent a bike or scooty hassle-free for your daily commute or travel needs.
        </p>

        <div className={styles.actions}>
        <Link href="/bikes"><button className={styles.primaryButton}>Browse Bikes</button></Link>
          <Link href="/bikes/listbike"><button className={styles.secondaryButton}>List Your Bike</button></Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2023 RentWheelz. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;



