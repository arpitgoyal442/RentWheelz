import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/navbar.module.css';
import Image from 'next/image';


function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">
          {/* <h2> RentWheelz</h2> */}

          <img src="/images/logo2.png" alt="logo" />
         
        </Link>
      </div>
      <ul className={styles.navLinks}>
        <li>
          <Link href="/user/bookings">
            My Bookings
          </Link>
        </li>
        <li>
          <Link href="/bikes/listbike">
            List Your Bike
          </Link>
        </li>
        <li>
          <Link href="/user/mybikes">
            My Bikes
          </Link>
        </li>
        <li className={styles.userimg}>
          <div onClick={toggleDropdown}>
            <img src="/images/user-img.jpg" alt="User Image" />
          </div>
          {dropdownOpen && (
            <ul className={styles.dropdown}>
              <li>
                <Link href={"/user/"+localStorage.getItem("user_id")}> Profile</Link>
              </li>
              <li>
                <Link href="/user/bookings">My Bookings</Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
